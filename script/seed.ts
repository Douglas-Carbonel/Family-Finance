import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool, { schema });

const DEFAULT_CATEGORIES = [
  { name: "Alimentação", type: "expense", color: "#ef4444" },
  { name: "Moradia", type: "expense", color: "#f97316" },
  { name: "Transporte", type: "expense", color: "#eab308" },
  { name: "Saúde", type: "expense", color: "#10b981" },
  { name: "Lazer", type: "expense", color: "#06b6d4" },
  { name: "Educação", type: "expense", color: "#6366f1" },
  { name: "Salário", type: "income", color: "#22c55e" },
  { name: "Investimentos", type: "income", color: "#8b5cf6" },
  { name: "Outros", type: "expense", color: "#64748b" },
];

async function seed() {
  console.log("🌱 Seeding database...");
  
  // Check if categories already exist
  const existingCategories = await db.select().from(schema.categories);
  
  if (existingCategories.length === 0) {
    console.log("Adding default categories...");
    await db.insert(schema.categories).values(DEFAULT_CATEGORIES);
    console.log(`✅ Added ${DEFAULT_CATEGORIES.length} default categories`);
  } else {
    console.log("⏭️  Categories already exist, skipping...");
  }

  console.log("✨ Seeding complete!");
  await pool.end();
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
