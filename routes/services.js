const express = require("express");
const { startTelegramMonitor, stopTelegramMonitor } = require("../telegramMonitor");
const { startWhatsappSender, stopWhatsappSender } = require("../whatsappSender");

const router = express.Router();

router.post("/start/monitor/telegram", async (req, res) => {
    await startTelegramMonitor();
    res.json({ message: "Telegram Monitor iniciado!" });
});

router.post("/stop/monitor/telegram", async (req, res) => {
    await stopTelegramMonitor();
    res.json({ message: "Telegram Monitor parado!" });
});

router.post("/start/sender/whatsapp", async (req, res) => {
    await startWhatsappSender();
    res.json({ message: "✅ WhatsAppSender iniciado!" });
});

router.post("/stop/sender/whatsapp", async (req, res) => {
    await stopWhatsappSender();
    res.json({ message: "🛑 WhatsAppSender parado!"});
});

module.exports = router;
