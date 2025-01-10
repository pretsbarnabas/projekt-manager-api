const express = require("express");
const TeamController = require("../controllers/team.controller")

const router = express.Router();

router.get("/",TeamController.getAllTeams)

router.get("/:id",TeamController.getTeamById)

router.post("/",TeamController.createTeam)

router.delete("/:id",TeamController.deleteTeamById)

router.patch("/:id",TeamController.patchTeamById)

module.exports = router