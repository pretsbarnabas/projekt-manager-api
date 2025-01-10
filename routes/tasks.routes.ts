const express = require("express");
const TaskController = require("../controllers/task.controller")

const router = express.Router();

router.get("/",TaskController.getAllTasks)

router.get("/:id",TaskController.getTaskById)

router.post("/",TaskController.createTask)

router.patch("/:id",TaskController.patchTaskById)

router.delete("/:id",TaskController.deleteTaskById)

module.exports = router