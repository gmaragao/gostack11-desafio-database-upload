import { getRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';

class CreateCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoryRepository = getRepository(Category);

    try {
      const category = await categoryRepository.create({
        title,
      });

      await categoryRepository.save(category);

      return category;
    } catch (err) {
      throw new AppError('Error trying to create category');
    }
  }
}

export default CreateCategoryService;
