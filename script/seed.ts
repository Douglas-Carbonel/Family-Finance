import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool, { schema });

const DEFAULT_CATEGORIES = [
  // Despesas
  { name: "Alimentação", type: "expense", color: "#ef4444" },
  { name: "Moradia", type: "expense", color: "#f97316" },
  { name: "Transporte", type: "expense", color: "#eab308" },
  { name: "Saúde", type: "expense", color: "#10b981" },
  { name: "Lazer", type: "expense", color: "#06b6d4" },
  { name: "Educação", type: "expense", color: "#6366f1" },
  { name: "Vestuário", type: "expense", color: "#ec4899" },
  { name: "Mercado", type: "expense", color: "#84cc16" },
  { name: "Contas", type: "expense", color: "#f59e0b" },
  { name: "Parcelas", type: "expense", color: "#8b5cf6" },
  { name: "Outros Gastos", type: "expense", color: "#64748b" },
  // Rendas
  { name: "Salário", type: "income", color: "#22c55e" },
  { name: "Vale Alimentação", type: "income", color: "#14b8a6" },
  { name: "Vale Refeição", type: "income", color: "#0ea5e9" },
  { name: "Freelance", type: "income", color: "#a855f7" },
  { name: "Investimentos", type: "income", color: "#f97316" },
  { name: "Outras Rendas", type: "income", color: "#64748b" },
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
