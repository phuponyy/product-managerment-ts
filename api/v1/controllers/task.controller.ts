import { Request, Response } from "express";
import Task from "../../../models/task.model";
import isValidStatus from "../../../helpers/isValidStatus.helper";
import paginationHelper from "../../../helpers/pagination.helper";
import { count } from "console";

//NOTE: [GET] /api/v1/tasks
export const index = async (req: Request, res: Response) => {
  interface Find {
    deleted: boolean;
    status?: string;
  }
  const find: Find = {
    deleted: false,
  };

  if (req.query.status && !isValidStatus(req.query.status as string)) {
    res.status(400).json({
      code: 400,
      message: `${req.query.status} không hợp lệ!`,
    });
    return;
  }

  if (req.query.status) {
    find.status = req.query.status.toString();
  }

  // pagination
  const countRecords = await Task.countDocuments(find);

  let initPagination = {
    currentPage: 1,
    limitItems: countRecords,
  };

  const objectPagination = paginationHelper(
    initPagination,
    req.query,
    countRecords
  );

  // -pagination

  // sort
  const sort = {};

  if (req.query.sortKey && req.query.sortValue) {
    const sortKey = req.query.sortKey.toString();
    sort[sortKey] = req.query.sortValue;
  }
  // -sort

  const task = await Task.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
  res.json(task);
};

//NOTE: [GET] /api/v1/tasks/detail/:id
export const detail = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const task = await Task.findById({
    _id: id,
    deleted: false,
  });

  res.json(task);
};

export default { index, detail };
