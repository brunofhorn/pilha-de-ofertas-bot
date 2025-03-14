const express = require("express");
const qrCodeStore = require("../services/qrCodeStore");

const router = express.Router();

router.get("/qrcode", (req, res) => {
    const qr = qrCodeStore.getQr();

    if (qr) {
        res.json({ qr });
    } else {
        res.status(404).json({ error: "QR Code não gerado ainda." });
    }
});

module.exports = router;