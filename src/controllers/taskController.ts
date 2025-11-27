import { taskService } from "../service/taskService.js";
import ApiError from "../exceptions/apiError.js";

class TaskController {
  async addTask(req: any, res: any, next: any) {
    try {
      const userId = req.body.userId;
      if (!userId) {
        return next(ApiError.UnauthorizedError());
      }

      const { title, description, dateTime, priority } = req.body;

      if (!title) {
        return next(ApiError.BadRequest("Title is required"));
      }

      const task = await taskService.addTask({
        userId,
        title,
        description,
        dateTime,
        priority,
      });

      return res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: any, res: any, next: any) {
    try {
      const { id } = req.params;

      if (!id) {
        return next(ApiError.BadRequest("Task id is required"));
      }

      await taskService.deleteTask(id);
      return res.json({ message: "Task deleted" });
    } catch (error) {
      next(error);
    }
  }

  async getTasks(req: any, res: any, next: any) {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return next(ApiError.UnauthorizedError());
      }

      const tasks = await taskService.getTasks(userId);
      return res.json(tasks);
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
