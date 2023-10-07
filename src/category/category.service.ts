import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from 'src/schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { GraphQLError } from 'graphql';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categorySchema: mongoose.Model<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const { name, parent } = createCategoryDto;

      const category = await this.categorySchema.create({
        name: name,
        parent: parent ? new Types.ObjectId(parent) : null,
      });

      if (parent) await category.populate('parent');

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
      const categories = await this.categorySchema.find().populate('parent');

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
      const category = await this.categorySchema
        .findById(id)
        .populate('parent');

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
        }
      };

      await reactivateChild(id);

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
        }
      };

      await deactivateChild(id);

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
