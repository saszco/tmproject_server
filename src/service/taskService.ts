import { Task } from "../models/taskModel.js";

interface TaskInput {
  userId: string;
  title: string;
  description?: string;
  dateTime?: Date;
  priority?: string;
}

class TaskService {
  async addTask({ userId, title, description, dateTime, priority }: TaskInput) {
    const task = await Task.create({
      user: userId,
      title,
      description,
      dateTime: dateTime ? new Date(dateTime) : undefined,
      priority: priority || "low",
    });

    return task;
  }

  async deleteTask(taskId: string) {
    await Task.findByIdAndDelete(taskId);
  }

  async getTasks(userId: string) {
    const tasks = await Task.find({ user: userId });

    const tasksWithDate = tasks.filter(
      (task) => task.dateTime !== null && task.dateTime !== undefined
    );
    const tasksWithoutDate = tasks.filter(
      (task) => task.dateTime === null || task.dateTime === undefined
    );

    const groupedByDate: { [key: string]: typeof tasksWithDate } = {};

    tasksWithDate.forEach((task) => {
      if (!task.dateTime) {
        return;
      }
      const dateObj =
        task.dateTime instanceof Date ? task.dateTime : new Date(task.dateTime);
      if (isNaN(dateObj.getTime())) {
        return;
      }
      const dateKey = dateObj.toISOString().split("T")[0] as string;

      if (typeof groupedByDate[dateKey] === "undefined") {
        groupedByDate[dateKey] = [];
      }
      (groupedByDate[dateKey] as typeof tasksWithDate).push(task);
    });

    Object.keys(groupedByDate).forEach((dateKey) => {
      const tasksGroup = groupedByDate[dateKey];
      if (!tasksGroup) return; // Додаємо перевірку

      tasksGroup.sort((a, b) => {
        const dateA =
          a.dateTime instanceof Date
            ? a.dateTime
            : a.dateTime
            ? new Date(a.dateTime)
            : null;
        const dateB =
          b.dateTime instanceof Date
            ? b.dateTime
            : b.dateTime
            ? new Date(b.dateTime)
            : null;

        const timeA = dateA?.getTime() ?? 0;
        const timeB = dateB?.getTime() ?? 0;

        return timeA - timeB;
      });
    });

    const groupedArray = Object.keys(groupedByDate)
      .sort((a, b) => a.localeCompare(b))
      .map((dateKey) => ({
        date: dateKey,
        tasks: groupedByDate[dateKey]!,
      }));

    return {
      withDate: groupedArray,
      withoutDate: tasksWithoutDate,
    };
  }
}

export const taskService = new TaskService();
