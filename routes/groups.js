const express = require("express");
const {
	getAllGroups,
	createGroup,
	updateGroup,
	deleteGroup,
} = require("../controllers/group.js");

const router = express.Router();

router.get("/", getAllGroups);
router.post("/", createGroup);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

module.exports = router;
