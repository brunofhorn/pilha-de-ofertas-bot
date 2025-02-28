const express = require("express");
const upload = require("../middleware/multer.js");
const {
	getLastPromotions,
	sendPromotion,
	createPromotion
} = require("../controllers/promotionController.js");

const router = express.Router();

router.get("/last", getLastPromotions);
router.post("/send", upload.single("image"), sendPromotion);
router.post("/", createPromotion)
// router.get("/messages", getAllMessages);
// router.get("/messages/:id", getMessageById);
// router.put("/messages/:id", updateMessageStatus);

module.exports = router;
