import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as database from "./config/database";
import mainV1Routes from "./api/v1/routes";

dotenv.config();
database.connectDB();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

mainV1Routes(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
