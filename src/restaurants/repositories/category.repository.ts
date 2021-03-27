import { Category } from 'restaurants/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Category)
export class CustomCategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    // const categoryName = name.trim().toLowerCase().replace(/ +/g, '');
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({ slug: categorySlug });

    // console.log({ categoryName, categorySlug, category });
    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }

    return category;
  }
}
