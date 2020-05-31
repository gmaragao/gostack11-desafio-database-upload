import { Router } from 'express';
import { getRepository } from 'typeorm';

// import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

import CreateCategoryService from '../services/CreateCategoryService';

import Category from '../models/Category';
import AppError from '../errors/AppError';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  // TODO
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const categoryRepository = getRepository(Category);

  const categoryExists = await categoryRepository.findOne({
    where: { title: category },
  });

  try {
    const createTransactionService = new CreateTransactionService();

    if (!categoryExists) {
      const createCategoryService = new CreateCategoryService();

      const newCategory = await createCategoryService.execute(category);
      console.log('new category', newCategory);

      const newTransaction = await createTransactionService.execute({
        title,
        value,
        type,
        category_id: newCategory.id,
      });

      console.log('NOVA TRANSACTION', newTransaction);

      return response.status(201).json(newTransaction);
    }

    const newTransaction = await createTransactionService.execute({
      title,
      value,
      type,
      category_id: categoryExists.id,
    });

    return response.status(201).json(newTransaction);
  } catch (err) {
    throw new AppError('Error creating a new transaction');
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
