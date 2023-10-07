import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from 'src/schemas/category.schema';
import { CacheService } from 'src/cache/cache.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Category',
        schema: CategorySchema,
      },
    ]),
  ],
  providers: [CategoryResolver, CategoryService, CacheService],
})
export class CategoryModule {}
