import { Request, Response, RequestHandler } from "express";
import Task from "../../../models/task.model";
import isValidStatus from "../../../helpers/isValidStatus.helper";
import paginationHelper from "../../../helpers/pagination.helper";
import searchHelper from "../../../helpers/search.helper";

//NOTE: [GET] /api/v1/tasks
export const index = async (req: Request, res: Response) => {
  interface Find {
    deleted: boolean;
    status?: string;
    title?: RegExp;
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

  // search
  let objectSearch = searchHelper(req.query);

  if (req.query.keyword) {
    find.title = objectSearch.regex;
  }
  // -search

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

//NOTE: [PATCH] /api/v1/tasks/change-status/:id
export const changeStatus = async (req: Request, res: Response) => {
  try {
    if (req.body.status && !isValidStatus(req.body.status as string)) {
      res.status(400).json({
        code: 400,
        message: `${req.body.status} không hợp lệ!`,
      });
      return;
    }

    const taks = await Task.findOne({
      _id: req.params.id,
      deleted: false,
    });

    const update = await Task.updateOne(
      {
        _id: req.params.id,
        deleted: false,
      },
      {
        status: req.body.status,
      }
    );

    res.json({
      code: 200,
      message: `Đã cập nhật trạng thái '${taks.status}' thành '${req.body.status}'`,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi!" });
  }
};

//NOTE: [PATCH] /api/v1/tasks/change-multi
export const changemulti = async (req: Request, res: Response) => {
  try {
    enum KEY {
      STATUS = "status",
      DELETE = "delete",
    }

    const ids: string[] = req.body.ids;
    const key: string = req.body.key;
    const value: string = req.body.value;

    if (value && !isValidStatus(value as string)) {
      res.status(400).json({
        code: 400,
        message: `${value} không hợp lệ!`,
      });
      return;
    }

    const tasks = await Task.find({ _id: { $in: ids } });

    if (tasks.length > 0 && tasks[0].deleted === true) {
      res.status(400).json({
        code: 400,
        message: `Trạng thái deletedAt đang là 'true' rồi!`,
      });
      return;
    }

    const tasksToUpdate = tasks.filter((task) => task.status !== value);

    if (value && tasksToUpdate.length === 0) {
      res.status(400).json({
        code: 400,
        message: `Trạng thái '${value}' đã tồn tại rồi!`,
      });
      return;
    }

    if (tasks.length === 0) {
      res.status(404).json({
        code: 404,
        message: "Không tìm thế task nào tồn tại!",
      });
      return;
    }

    switch (key) {
      case KEY.STATUS:
        await Task.updateMany(
          {
            _id: { $in: ids },
          },
          {
            status: value,
          }
        );
        res.json({
          code: 200,
          message: "Đã cập nhật trạng thái",
        });
        break;

      case KEY.DELETE:
        await Task.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedAt: new Date(),
          }
        );
        res.json({
          code: 200,
          message: "Đã cập nhật trạng thái",
        });
        break;

      default:
        res.json({
          code: 500,
          message: "Thay đổi trạng thái không thành công",
        });
        break;
    }
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Lỗi!" });
  }
};

//NOTE: [POST] /api/v1/tasks/create
export const create: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  let tasks: any = req.body;
  try {
    if (Array.isArray(tasks)) {
      tasks = tasks.map((task) => ({
        ...task,
      }));
      for (const task of tasks) {
        if (!isValidStatus(task.status)) {
          res.status(400).json({
            code: 400,
            message: `Trạng thái '${task.status}' không hợp lệ!`,
          });
          return;
        }
      }
    } else {
      if (!isValidStatus(tasks.status)) {
        res.status(400).json({
          code: 400,
          message: `Trạng thái '${tasks.status}' không hợp lệ!`,
        });
        return;
      }
    }

    const data = Array.isArray(tasks)
      ? await Task.insertMany(tasks)
      : await new Task(tasks).save();

    res.json({
      code: 200,
      message: "Đã tạo task",
      data: data,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Lỗi!" });
  }
};

//NOTE: [PATCH] /api/v1/tasks/edit/:id
export const edit = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id;

    if (req.body.status && !isValidStatus(req.body.status)) {
      res.status(400).json({
        code: 400,
        message: `Trạng thái '${req.body.status}' không hợp lệ!`,
      });
      return;
    }

    await Task.updateOne({ _id: id }, req.body);

    res.json({
      code: 200,
      message: "Đã cập nhật task",
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Lỗi!" });
  }
};

//NOTE: [DELETE] /api/v1/tasks/delete/:id
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    await Task.deleteOne({ _id: id });

    res.json({ code: 200, message: "Đã xóa task" });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Lỗi xoá task!" });
  }
};
