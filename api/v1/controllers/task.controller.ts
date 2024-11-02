import { Request, Response } from "express";
import Task from "../../../models/task.model";

//NOTE: [GET] /api/v1/tasks
export const index = async (req: Request, res: Response) => {
  const task = await Task.find({ deleted: false });
  res.json(task);
};

//NOTE: [GET] /api/v1/tasks/detail/:id
export const detail = async (req: Request, res: Response) => {
  const id = req.params.id;
  const task = await Task.findById({
    _id: id,
    deleted: false,
  });

  res.json(task);
};

export default { index, detail };
