import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { taskController } from "../controllers/taskController.js";

const router = Router();

router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/activate/:link", userController.activate);
router.get("/refresh", userController.refresh);
router.get("/users", userController.getUsers);
router.post("/tasks", taskController.addTask);
router.get("/tasks", taskController.getTasks);
router.delete("/tasks/:id", taskController.deleteTask);

export default router;
