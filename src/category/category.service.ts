import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from 'src/schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categorySchema: mongoose.Model<Category>,
    private redisCacheService: CacheService,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const { name, parent } = createCategoryDto;

      const category = await this.categorySchema.create({
        name: name,
        parent: parent ? new Types.ObjectId(parent) : null,
      });

      if (parent) await category.populate('parent');

      // 'All Categories' Cache gets deleted as new category got added
      const cacheKey = 'allCategories';
      await this.redisCacheService.del(cacheKey);

      return category;
    } catch (error) {
      if (error.code === 11000) {
        throw new GraphQLError('Category already exists!');
      }
      throw error;
    }
  }

  async findAll() {
    try {
      // 'All Categories' Cache gets fetched and returned if there is any data available
      const cacheKey = 'allCategories';
      const cachedCategories = await this.redisCacheService.get(cacheKey);

      if (cachedCategories) {
        return cachedCategories;
      }

      const categories = await this.categorySchema.find().populate('parent');

      // 'All Categories' Cache gets set and Time-To-LIve is set to 1 Hour
      await this.redisCacheService.set(cacheKey, categories, 3600); // 1 Hour = 60 * 60 = 3600 MS

      if (categories.length == 0) {
        throw new GraphQLError('Category not found!');
      }
      return categories;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      // Specific 'Category' Cache gets fetched and returned if there is any data available
      const cacheKey = `Category-${id}`;
      const cachedCategory = await this.redisCacheService.get(cacheKey);

      if (cachedCategory) {
        return cachedCategory;
      }
      const category = await this.categorySchema
        .findById(id)
        .populate('parent');

      // Specific 'Category' Cache gets set and Time-To-LIve is set to 1 Hour
      await this.redisCacheService.set(cacheKey, category, 3600); // 1 Hour = 60 * 60 = 3600 MS

      if (category === null) {
        throw new GraphQLError('Category not found!');
      }
      return category;
    } catch (error) {
      throw error;
    }
  }

  async reactivate(id: string) {
    try {
      let category = null;

      const reactivateChild = async (parentCategoryId: string) => {
        category = await this.categorySchema.updateOne(
          { _id: parentCategoryId },
          {
            active: true,
          },
        );

        const childCategories = await this.categorySchema.find({
          parent: new Types.ObjectId(parentCategoryId),
        });

        for (const childCategory of childCategories) {
          await reactivateChild(childCategory._id);

          // Specific 'Category' Cache gets deleted as actual data got modified
          const cacheKey = `Category-${childCategory._id}`;
          await this.redisCacheService.del(cacheKey);
        }
      };

      await reactivateChild(id);

      // Specific Initial Parent 'Category' Cache gets deleted as actual data got modified
      const updatedCategoryCacheKey = `Category-${id}`;
      await this.redisCacheService.del(updatedCategoryCacheKey);

      // 'All Categories' Cache gets deleted as actual data got modified
      await this.redisCacheService.del('allCategories');

      if (category.modifiedCount === 1) {
        return await this.categorySchema.findById(id).populate('parent');
      } else {
        throw new GraphQLError('Category not found!');
      }
    } catch (error) {
      throw error;
    }
  }

  async deactivate(id: string) {
    try {
      let category = null;

      const deactivateChild = async (parentCategoryId: string) => {
        category = await this.categorySchema.updateOne(
          { _id: parentCategoryId },
          {
            active: false,
          },
        );

        const childCategories = await this.categorySchema.find({
          parent: new Types.ObjectId(parentCategoryId),
        });

        for (const childCategory of childCategories) {
          await deactivateChild(childCategory._id);

          // Specific 'Category' Cache gets deleted as actual data got modified
          const cacheKey = `Category-${childCategory._id}`;
          await this.redisCacheService.del(cacheKey);
        }
      };

      await deactivateChild(id);

      // Specific Initial Parent 'Category' Cache gets deleted as actual data got modified
      const updatedCategoryCacheKey = `Category-${id}`;
      await this.redisCacheService.del(updatedCategoryCacheKey);

      // 'All Categories' Cache gets deleted as actual data got modified
      await this.redisCacheService.del('allCategories');

      if (category.modifiedCount === 1) {
        return await this.categorySchema.findById(id).populate('parent');
      } else {
        throw new GraphQLError('Category not found!');
      }
    } catch (error) {
      throw error;
    }
  }
}
