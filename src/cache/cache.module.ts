import { Module } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';

@Module({
  imports: [],
  providers: [CacheService],
  exports: [CacheService],
})
export class CategoryModule {}
