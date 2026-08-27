import crypto from 'crypto';
import { pool } from './pool';

const DEFAULT_CATEGORIES: Array<{ name: string; type: 'expense' | 'income' }> = [
  { name: 'Rent', type: 'expense' },
  { name: 'Utilities', type: 'expense' },
  { name: 'Supplies', type: 'expense' },
  { name: 'Payroll', type: 'expense' },
  { name: 'Marketing', type: 'expense' },
  { name: 'Travel', type: 'expense' },
  { name: 'Equipment', type: 'expense' },
  { name: 'Food/Meals', type: 'expense' },
  { name: 'Services', type: 'expense' },
  { name: 'Other', type: 'expense' },
  { name: 'Sales', type: 'income' }
];

export async function ensureDefaultCategories(businessId: string) {
  const { rows } = await pool.query('SELECT 1 FROM categories WHERE business_id = $1 LIMIT 1', [businessId]);
  if (rows.length) return;
  for (const c of DEFAULT_CATEGORIES) {
    await pool.query(
      'INSERT INTO categories (id, business_id, name, type, is_default) VALUES ($1, $2, $3, $4, 1)',
      [crypto.randomUUID(), businessId, c.name, c.type]
    );
  }
}

if (require.main === module) {
  console.log('✔ Schema is applied automatically on import — nothing else to do. Just run `npm run dev`.');
}
