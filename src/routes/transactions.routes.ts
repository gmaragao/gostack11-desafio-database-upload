import { Router } from 'express';
import { getRepository, getCustomRepository } from 'typeorm';

import multer from 'multer';
const upload = multer({ dest: 'tmp/csv/' });

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import CreateCategoryService from '../services/CreateCategoryService';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import AppError from '../errors/AppError';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();

  const balance = await transactionsRepository.getBalance();

  try {
    const userAccountInfo = {
      transactions,
      balance,
    };

    return response.status(200).json(userAccountInfo);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const categoryRepository = getRepository(Category);

  const categoryExists = await categoryRepository.findOne({
    where: { title: category },
  });

  try {
    const createTransactionService = new CreateTransactionService();

    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Insufficient funds');
    }

    if (!categoryExists) {
      const createCategoryService = new CreateCategoryService();

      const newCategory = await createCategoryService.execute(category);

      const newTransaction = await createTransactionService.execute({
        title,
        value,
        type,
        category_id: newCategory.id,
      });

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
  const { id } = request.params;

  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transaction = await transactionsRepository.findOne({ id });

  if (!transaction) {
    return response.status(400).json({
      message: `The transaction with id: ${id} could not be found.`,
      status: 'error',
    });
  }

  try {
    await transactionsRepository.delete({ id });
    return response.status(200).json({
      message: `The transaction with id: ${id} was sucessfully deleted`,
    });
  } catch (err) {
    return response.status(400).json({
      message: `The transaction with id: ${id} could not be deleted.`,
      status: 'error',
    });
  }
});

transactionsRouter.post(
  '/import',
  upload.single('template'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();

    try {
      const transactions = await importTransactionsService.execute(
        request.file,
      );

      return response.status(200).json(transactions);
    } catch (err) {
      return response.status(400).json({ message: 'Error', err });
    }
  },
);

export default transactionsRouter;
