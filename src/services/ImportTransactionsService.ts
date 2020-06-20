import Transaction from '../models/Transaction';
import Category from '../models/Category';

import CreateCategoryService from '../services/CreateCategoryService';
import CreateTransactionService from '../services/CreateTransactionService';

import fs from 'fs';
import csv from 'csv-parser';
import { getRepository } from 'typeorm';

// interface DataFromFile {
//   title: string;
//   type: 'income' | 'outcome';
//   value: string | number;
//   category: string;
// }

class ImportTransactionsService {
  async execute(file: any): Promise<Transaction[]> {
    const results: any[] = [];
    const transactions: Transaction[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(file.path)

        .pipe(
          csv({
            mapHeaders: ({ header, index }) => header.replace(/\s/g, ''),
          }),
        )
        .on('data', data => results.push(data))
        .on('end', async () => {
          const createTransactionService = new CreateTransactionService();
          const createCategoryService = new CreateCategoryService();

          for (let index = 0; index < results.length; index++) {
            let transaction = results[index];

            for (const key in transaction) {
              if (
                transaction.hasOwnProperty(key) &&
                transaction[key].includes('') &&
                key !== 'title'
              ) {
                transaction[key] = transaction[key].replace(/\s/g, '');
              }
            }

            transaction.value = Number(transaction.value);
            const { type, value, category, title } = transaction;

            const categoryRepository = getRepository(Category);

            const categoryExists = await categoryRepository.findOne({
              where: { title: category },
            });

            if (!categoryExists) {
              const newCategory = await createCategoryService.execute(category);

              const newTransaction = await createTransactionService.execute({
                title,
                value,
                type,
                category_id: newCategory.id,
              });

              transactions.push(newTransaction);
            } else {
              const newTransaction = await createTransactionService.execute({
                title,
                value,
                type,
                category_id: categoryExists.id,
              });

              transactions.push(newTransaction);
            }
          }

          resolve(transactions);
        });
    });
  }
}

export default ImportTransactionsService;
