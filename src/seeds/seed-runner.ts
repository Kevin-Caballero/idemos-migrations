import "reflect-metadata";
import { DataSource } from "typeorm";
import { join } from "node:path";
import UsersSeed from "./01-users.seed";
import type { Seed } from "./seed.interface";

const dbConfig = {
  type: "postgres" as const,
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? "5432"),
  database: process.env.DB_NAME ?? "idemos",
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
};

const DevDataSource = new DataSource({
  ...dbConfig,
  synchronize: true,
  logging: false,
  entities: [join(__dirname, "../../../common/src/entities/**/*.ts")],
});

const seeds: Seed[] = [new UsersSeed()];

async function runSeeds(): Promise<void> {
  console.log("\n  IDemos — Seed Runner\n");

  await DevDataSource.initialize();
  console.log("  Connected to database.\n");

  for (const seed of seeds) {
    await seed.run(DevDataSource);
  }

  await DevDataSource.destroy();
  console.log("\n  Seeds complete.\n");
}

runSeeds().catch((err: unknown) => {
  console.error("  Fatal:", err);
  process.exit(1);
});
