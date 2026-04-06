import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";
import { Seed } from "./seed.interface";

export default class UsersSeed implements Seed {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository("users");

    const existing = await repo.findOneBy({ email: "dev@idemos.local" });
    if (existing) {
      console.log("  [users] dev@idemos.local already exists, skipping.");
      return;
    }

    const passwordHash = await bcrypt.hash("devpassword", 10);
    await repo.insert({
      name: "Dev User",
      email: "dev@idemos.local",
      passwordHash: passwordHash,
    });

    console.log("  [users] created dev@idemos.local (password: devpassword)");
  }
}
