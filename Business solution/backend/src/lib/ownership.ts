import { pool } from '../db/pool';

export async function assertOwnsBusiness(businessId: string, userId: string): Promise<boolean> {
  const { rows } = await pool.query('SELECT 1 FROM businesses WHERE id = $1 AND owner_user_id = $2', [businessId, userId]);
  return rows.length > 0;
}
