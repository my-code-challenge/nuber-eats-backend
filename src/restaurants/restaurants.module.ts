import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { Restaurant } from './entities/restaurants.entity';
import { CustomCategoryRepository } from './repositories/category.repository';
import {
  CategoryResolver,
  MenuResolver,
  RestaurantResolver,
} from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, Menu, CustomCategoryRepository]),
  ],
  providers: [
    RestaurantResolver,
    CategoryResolver,
    MenuResolver,
    RestaurantService,
  ],
})
export class RestaurantsModule {}
