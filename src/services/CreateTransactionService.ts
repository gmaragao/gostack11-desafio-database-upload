import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_id: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_id,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getRepository(Transaction);

    console.log('category id', category_id);

    try {
      const newTransaction = await transactionsRepository.create({
        title,
        value,
        type,
        category_id,
      });

      console.log('criando transaction', newTransaction);

      const response = await transactionsRepository.save(newTransaction);
      console.log('resposta', response);
      return newTransaction;
    } catch (err) {
      console.log(err);
      throw new AppError('Error trying to create new transaction');
    }
  }
}

export default CreateTransactionService;
