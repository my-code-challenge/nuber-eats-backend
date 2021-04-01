import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { User } from 'users/entities/user.entity';
import { AllCategoriesOutput } from './dtos/all-category.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateMenuInput, CreateMenuOutput } from './dtos/create-menu.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteMenuInput, DeleteMenuOutput } from './dtos/delete-menu.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditMenuInput, EditMenuOutput } from './dtos/edit-menu.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Menu } from './entities/menu.entity';
import { Restaurant } from './entities/restaurants.entity';
import { CustomCategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  private readonly pageView = 5;
  /**
   * @description - https://typeorm.io/#active-record-data-mapper/what-is-the-data-mapper-pattern
   * @param restaurants
   */
  constructor(
    @InjectRepository(Restaurant) // == const restaurantsRepository = connection.getRepository(Restaurant);
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Menu) // == const MenusRepository = connection.getRepository(Menu);
    private readonly menus: Repository<Menu>,
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

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        take: this.pageView,
        skip: (page - 1) * this.pageView,
      });

      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(totalResults / this.pageView),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: '카테고리를 불러오는데 실패 하였습니다',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
      });

      if (!restaurant) {
        return {
          ok: false,
          error: '존재하지 않는 음식점 입니다',
        };
      }

      return {
        ok: true,
        restaurant,
      };
    } catch {
      return {
        ok: false,
        error: '음식점을 찾을 수 없습니다',
      };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: Raw(name => `${name} ILIKE '%${query}%'`), // 대소문자 구분을 위해 postgreSQL은 ILIKE를 사용
        },
        take: this.pageView,
        skip: (page - 1) * this.pageView,
      });

      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / this.pageView),
      };
    } catch {
      return {
        ok: false,
        error: '잘못된 음식점을 검색 하였습니다',
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
      const restaurants = await this.restaurants.find({
        where: { category },
        take: this.pageView,
        skip: (page - 1) * this.pageView,
      });

      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);
      const totalPages = Math.ceil(totalResults / this.pageView);

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
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: '카테고리를 불러오는데 실패 하였습니다',
      };
    }
  }

  async createMenu(
    owner: User,
    createMenuInput: CreateMenuInput,
  ): Promise<CreateMenuOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        id: createMenuInput.restaurantId,
      });

      if (!restaurant) {
        return {
          ok: false,
          error: '음식점을 찾지 못했습니다',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: '수정이 불가능한 음식점 입니다',
        };
      }

      await this.menus.save(
        this.menus.create({ ...createMenuInput, restaurant }),
      );

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: '메뉴 생성중 오류가 발생했습니다',
      };
    }
  }

  async editMenu(
    owner: User,
    editMenuInput: EditMenuInput,
  ): Promise<EditMenuOutput> {
    try {
      const menu: Menu = await this.menus.findOne(editMenuInput.menuId, {
        relations: ['restaurant'],
      });

      if (!menu) {
        return {
          ok: false,
          error: '메뉴를 찾을 수 없습니다',
        };
      }

      if (menu.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '수정이 불가능한 음식점 입니다',
        };
      }

      await this.menus.save([{ id: editMenuInput.menuId, ...editMenuInput }]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '메뉴 수정에 오류가 발생했습니다',
      };
    }
  }

  async deleteMenu(
    owner: User,
    { menuId }: DeleteMenuInput,
  ): Promise<DeleteMenuOutput> {
    try {
      const menu = await this.menus.findOne(menuId, {
        relations: ['restaurant'],
      });

      if (!menu) {
        return {
          ok: false,
          error: '메뉴를 찾을 수 없습니다',
        };
      }

      if (menu.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '삭제가 불가능한 음식점 입니다',
        };
      }

      await this.menus.delete(menuId);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '메뉴 삭제에 오류가 발생했습니다',
      };
    }
  }
}
