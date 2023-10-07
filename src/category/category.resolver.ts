import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Category } from 'src/schemas/category.schema';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Mutation(() => Category, {
    name: 'createCategory',
  })
  create(@Args('createCategoryDto') createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Query(() => [Category], { name: 'categories' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Query(() => Category, { name: 'category' })
  findOne(@Args('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Mutation(() => Category, {
    name: 'reactivateCategory',
  })
  reactivate(@Args('id', { type: () => String }) id: string) {
    return this.categoryService.reactivate(id);
  }

  @Mutation(() => Category, {
    name: 'deactivateCategory',
  })
  deactivate(@Args('id', { type: () => String }) id: string) {
    return this.categoryService.deactivate(id);
  }
}
