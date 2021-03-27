import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'users/entities/user.entity';
import { AllCategoriesOutput } from './dtos/all-category.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurants.entity';
import { CustomCategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  /**
   * @description - https://typeorm.io/#active-record-data-mapper/what-is-the-data-mapper-pattern
   * @param restaurants
   */
  constructor(
    @InjectRepository(Restaurant) // == const restaurantsRepository = connection.getRepository(Restaurant);
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CustomCategoryRepository,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;

      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;

      await this.restaurants.save(newRestaurant);

      return {
        ok: true,
      };
    } catch {
      return { ok: false, error: '음식점을 생성 할 수 없습니다.' };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
        {
          loadRelationIds: true, // 관계형 컬럼들의 ID 컬럼만 가져오게 하는 방법
        },
      );

      console.log('editRestaurant', restaurant);

      if (!restaurant) {
        return {
          ok: false,
          error: '음식점이 존재하지 않습니다',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: '해당 음식점은 수정이 불가능 합니다',
        };
      }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }

      await this.restaurants.save(
        this.restaurants.create([
          {
            id: editRestaurantInput.restaurantId,
            ...editRestaurantInput,
            ...(category && { category }),
          },
        ]),
      );
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: '음식점 변경이 불가능 합니다',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);

      if (!restaurant) {
        return {
          ok: false,
          error: '음식점이 존재하지 않습니다',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: '해당 음식점은 삭제가 불가능 합니다',
        };
      }

      await this.restaurants.delete(restaurantId);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '음식점 삭제가 불가능 합니다',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch {
      return {
        ok: false,
        error: '카테고리를 불러오지 못했습니다',
      };
    }
  }

  countRestaurants(category: Category): Promise<number> {
    return this.restaurants.count({ category: { id: category.id } });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });

      // pagination
      const pageView = 5;
      const restaurants = await this.restaurants.find({
        where: { category },
        take: pageView,
        skip: (page - 1) * pageView,
      });

      category.restaurants = restaurants;
      const totalPages = Math.ceil(
        (await this.countRestaurants(category)) / pageView,
      );

      if (!category) {
        return {
          ok: false,
          error: '카테고리를 찾을 수 없습니다',
        };
      }

      return {
        ok: true,
        category,
        totalPages,
      };
    } catch {
      return {
        ok: false,
        error: '카테고리를 불러오는데 실패 하였습니다',
      };
    }
  }
}
