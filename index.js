require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const promotionRoutes = require("./routes/promotions.js");
const groupsRoutes = require("./routes/groups.js");
const { startWhatsappSender, client } = require("./whatsappSender.js");
const { telegramMonitor } = require("./telegramMonitor.js");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/promotions", promotionRoutes);
app.use("/groups", groupsRoutes);

app.get("/whatsapp-status", (req, res) => {
	if (client) {
		res.json({ status: "WhatsApp está pronto!" });
	} else {
		res.status(500).json({ error: "Client não iniciado." });
	}
});

app.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
	startWhatsappSender();
	// telegramMonitor();
});
