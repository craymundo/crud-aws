import { DataSource } from "typeorm";
import { Item } from "../models/item.entity";

import dotenv from "dotenv";
dotenv.config();

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DATABASE_HOST,
  port:  parseInt(process.env.DATABASE_PORT || "3306", 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Item],
  synchronize: true,
  logging: false,
});

export const connectDB = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};
