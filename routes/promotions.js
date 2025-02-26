const express = require("express");
const upload = require("../middleware/multer.js");
const {
	getLastPromotions,
	sendPromotion,
} = require("../controllers/promotionController.js");

const router = express.Router();

router.get("/last", getLastPromotions);
router.post("/send-promotion", upload.single("image"), sendPromotion);
// router.get("/messages", getAllMessages);
// router.get("/messages/:id", getMessageById);
// router.put("/messages/:id", updateMessageStatus);

module.exports = router;
