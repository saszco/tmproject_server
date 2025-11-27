import { Schema, model } from "mongoose";

const taskSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  description: { type: String, required: false },
  dateTime: { type: Date, required: false },
  priority: { type: String },
});

export const Task = model("Task", taskSchema);
