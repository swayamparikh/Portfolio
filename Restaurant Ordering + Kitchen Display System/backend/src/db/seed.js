import { pool } from "./pool.js";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";

const CATEGORIES = [
  { name: "Tiffins", sort_order: 1 },
  { name: "Meals & Thali", sort_order: 2 },
  { name: "Curries & Sides", sort_order: 3 },
  { name: "Rice & Biryani", sort_order: 4 },
  { name: "Beverages", sort_order: 5 },
  { name: "Desserts", sort_order: 6 },
];

const ITEMS_BY_CATEGORY = {
  "Tiffins": [
    { name: "Masala Dosa", description: "Crisp rice-and-lentil crepe filled with spiced potato masala, served with sambar and coconut chutney.", price: 120, is_veg: true, spice_level: 2, avg_prep_time_minutes: 12 },
    { name: "Plain Dosa", description: "Classic thin and crispy fermented rice crepe, served with sambar and chutney.", price: 90, is_veg: true, spice_level: 1, avg_prep_time_minutes: 10 },
    { name: "Idli (2 pcs)", description: "Steamed rice-lentil cakes, soft and fluffy, served with sambar and chutney.", price: 70, is_veg: true, spice_level: 1, avg_prep_time_minutes: 8 },
    { name: "Mysore Bonda", description: "Deep-fried fluffy lentil fritters, a Mysore specialty, served with coconut chutney.", price: 80, is_veg: true, spice_level: 1, avg_prep_time_minutes: 10 },
    { name: "Medu Vada (2 pcs)", description: "Crispy-on-the-outside, soft-inside urad dal doughnuts, served with sambar.", price: 75, is_veg: true, spice_level: 1, avg_prep_time_minutes: 10 },
    { name: "Rava Upma", description: "Savory semolina porridge tempered with mustard seeds, curry leaves, and vegetables.", price: 85, is_veg: true, spice_level: 1, avg_prep_time_minutes: 10 },
    { name: "Onion Rava Dosa", description: "Crisp semolina crepe topped with onions and green chillies.", price: 110, is_veg: true, spice_level: 2, avg_prep_time_minutes: 14 },
  ],
  "Meals & Thali": [
    { name: "Kaveri Special Thali", description: "Full South Indian meal: rice, sambar, rasam, 2 curries, curd, papad, pickle, and dessert.", price: 260, is_veg: true, spice_level: 2, avg_prep_time_minutes: 15 },
    { name: "Mini Meals", description: "Compact thali with rice, sambar, one curry, curd, and pickle.", price: 180, is_veg: true, spice_level: 1, avg_prep_time_minutes: 12 },
    { name: "Curd Rice Bowl", description: "Cooling curd rice tempered with mustard seeds and curry leaves.", price: 100, is_veg: true, spice_level: 1, avg_prep_time_minutes: 8 },
  ],
  "Curries & Sides": [
    { name: "Ghee Roast Chicken", description: "Mangalorean-style chicken roasted in ghee with byadgi chillies — rich, tangy, and spicy.", price: 260, is_veg: false, spice_level: 3, avg_prep_time_minutes: 20 },
    { name: "Sambar (Bowl)", description: "Classic lentil and vegetable stew with tamarind and South Indian spices.", price: 60, is_veg: true, spice_level: 2, avg_prep_time_minutes: 6 },
    { name: "Rasam (Bowl)", description: "Tangy tamarind and pepper soup, a South Indian comfort classic.", price: 55, is_veg: true, spice_level: 2, avg_prep_time_minutes: 6 },
    { name: "Chettinad Pepper Chicken", description: "Fiery Chettinad-style chicken tossed in freshly ground pepper masala.", price: 240, is_veg: false, spice_level: 3, avg_prep_time_minutes: 18 },
    { name: "Avial", description: "Mixed vegetables in a coconut-yogurt gravy, finished with coconut oil and curry leaves.", price: 130, is_veg: true, spice_level: 1, avg_prep_time_minutes: 12 },
  ],
  "Rice & Biryani": [
    { name: "Chettinad Chicken Biryani", description: "Fragrant seeraga samba rice layered with spiced Chettinad chicken.", price: 240, is_veg: false, spice_level: 2, avg_prep_time_minutes: 20 },
    { name: "Vegetable Biryani", description: "Aromatic basmati biryani with garden vegetables and whole spices.", price: 180, is_veg: true, spice_level: 2, avg_prep_time_minutes: 18 },
    { name: "Lemon Rice", description: "Tangy rice tempered with mustard seeds, peanuts, and turmeric.", price: 110, is_veg: true, spice_level: 1, avg_prep_time_minutes: 8 },
    { name: "Bisi Bele Bath", description: "Karnataka-style spiced rice and lentil one-pot dish with vegetables.", price: 150, is_veg: true, spice_level: 2, avg_prep_time_minutes: 15 },
  ],
  "Beverages": [
    { name: "Filter Coffee", description: "Strong South Indian filter coffee with milk froth, served in the traditional davara-tumbler.", price: 50, is_veg: true, spice_level: 0, avg_prep_time_minutes: 5 },
    { name: "Buttermilk (Majjige)", description: "Spiced, chilled yogurt drink with curry leaves and ginger.", price: 40, is_veg: true, spice_level: 1, avg_prep_time_minutes: 3 },
    { name: "Fresh Sweet Lime Juice", description: "Freshly squeezed mosambi juice, lightly sweetened.", price: 60, is_veg: true, spice_level: 0, avg_prep_time_minutes: 4 },
    { name: "Tender Coconut Water", description: "Chilled fresh tender coconut, served whole with a straw.", price: 70, is_veg: true, spice_level: 0, avg_prep_time_minutes: 2 },
  ],
  "Desserts": [
    { name: "Mysore Pak", description: "Rich, ghee-laden gram flour sweet, melt-in-the-mouth texture.", price: 90, is_veg: true, spice_level: 0, avg_prep_time_minutes: 3 },
    { name: "Payasam", description: "Traditional South Indian sweet rice/vermicelli pudding with cardamom and cashews.", price: 80, is_veg: true, spice_level: 0, avg_prep_time_minutes: 5 },
    { name: "Rava Kesari", description: "Warm semolina halwa flavored with saffron and ghee-roasted cashews.", price: 75, is_veg: true, spice_level: 0, avg_prep_time_minutes: 5 },
  ],
};

const STAFF = [
  { name: "Ravi Kumar", role: "waiter", pin: "1111" },
  { name: "Lakshmi Iyer", role: "waiter", pin: "1112" },
  { name: "Suresh Rao", role: "kitchen", pin: "2222" },
  { name: "Anitha Menon", role: "kitchen", pin: "2223" },
  { name: "Priya Nair", role: "cashier", pin: "3333" },
  { name: "Admin User", role: "admin", pin: "9999" },
];

const TABLE_COUNT = 10;

async function main() {
  const conn = await pool.connect();
  try {
    await conn.query("BEGIN");

    const existing = await conn.query("SELECT id FROM restaurants LIMIT 1");
    let restaurantId;
    if (existing.rows.length > 0) {
      restaurantId = existing.rows[0].id;
      console.log("Restaurant already exists, reusing:", restaurantId);
    } else {
      restaurantId = uuid();
      await conn.query(
        "INSERT INTO restaurants (id, name, address, currency, tax_rate) VALUES ($1, $2, $3, $4, $5)",
        [restaurantId, "Kaveri Kitchen", "12 MG Road, Bengaluru, Karnataka", "INR", 5.0]
      );
      console.log("Created restaurant:", restaurantId);
    }

    // Tables
    for (let i = 1; i <= TABLE_COUNT; i++) {
      const rows = await conn.query(
        "SELECT id FROM tables WHERE restaurant_id = $1 AND table_number = $2",
        [restaurantId, i]
      );
      if (rows.rows.length > 0) continue;
      const tableId = uuid();
      const qrToken = uuid().replace(/-/g, "").slice(0, 12);
      await conn.query(
        "INSERT INTO tables (id, restaurant_id, table_number, qr_code_token, status) VALUES ($1, $2, $3, $4, 'empty')",
        [tableId, restaurantId, i, qrToken]
      );
    }
    console.log(`Ensured ${TABLE_COUNT} tables exist.`);

    // Categories + items
    for (const cat of CATEGORIES) {
      const catRows = await conn.query(
        "SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2",
        [restaurantId, cat.name]
      );
      let categoryId;
      if (catRows.rows.length > 0) {
        categoryId = catRows.rows[0].id;
      } else {
        categoryId = uuid();
        await conn.query(
          "INSERT INTO menu_categories (id, restaurant_id, name, sort_order) VALUES ($1, $2, $3, $4)",
          [categoryId, restaurantId, cat.name, cat.sort_order]
        );
      }

      const items = ITEMS_BY_CATEGORY[cat.name] || [];
      for (const item of items) {
        const itemRows = await conn.query(
          "SELECT id FROM menu_items WHERE category_id = $1 AND name = $2",
          [categoryId, item.name]
        );
        if (itemRows.rows.length > 0) continue;
        await conn.query(
          `INSERT INTO menu_items
            (id, category_id, name, description, price, is_veg, spice_level, avg_prep_time_minutes, is_available)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
          [
            uuid(),
            categoryId,
            item.name,
            item.description,
            item.price,
            item.is_veg,
            item.spice_level,
            item.avg_prep_time_minutes,
          ]
        );
      }
    }
    console.log("Seeded menu categories and items.");

    // Staff
    for (const s of STAFF) {
      const rows = await conn.query(
        "SELECT id FROM staff WHERE restaurant_id = $1 AND name = $2",
        [restaurantId, s.name]
      );
      if (rows.rows.length > 0) continue;
      const hashedPin = await bcrypt.hash(s.pin, 10);
      await conn.query(
        "INSERT INTO staff (id, restaurant_id, name, role, pin) VALUES ($1, $2, $3, $4, $5)",
        [uuid(), restaurantId, s.name, s.role, hashedPin]
      );
    }
    console.log("Seeded staff. Demo PINs — Waiter: 1111/1112, Kitchen: 2222/2223, Cashier: 3333, Admin: 9999");

    await conn.query("COMMIT");
    console.log("Seed complete.");
  } catch (err) {
    await conn.query("ROLLBACK");
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
