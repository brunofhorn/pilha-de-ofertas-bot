require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const promotionRoutes = require("./routes/promotions.js");
const groupsRoutes = require("./routes/groups.js");
const servicesRoutes = require("./routes/services.js")
const qrCodeRoutes = require("./routes/qrcode.js");
const { generateAliExpressAffiliateLink } = require("./functions/generateLinks/aliexpress.js");

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

app.use("/services", servicesRoutes);
app.use("/", qrCodeRoutes)

app.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
