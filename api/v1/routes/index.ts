import { Express } from "express";
import { taskRoute } from "./task.route";

const mainV1Routes = (app: Express): void => {
  const version: string = "/api/v1";

  app.use(version + "/tasks", taskRoute);
};

export default mainV1Routes;
