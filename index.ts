import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as database from "./config/database";
import mainV1Routes from "./api/v1/routes";
import cors from "cors";

dotenv.config();
database.connectDB();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

// const corsOptions = {
//     origin: "URL",
//     optionSuccessStatus: 200,
// }
// app.use(cors(corsOptions));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mainV1Routes(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
