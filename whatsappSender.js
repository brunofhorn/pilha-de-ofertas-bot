require("dotenv").config();
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const mime = require("mime-types");
const fs = require("fs");
const api = require("./lib/api.js");
const prisma = require("./lib/prisma.js");
const { calculateDiscount } = require("./functions/calculateDiscount.js");
const { formatPrice } = require("./functions/formatPrice.js");
const { formatMessage } = require("./functions/formatMessage.js");

const GROUP_ID = process.env.GROUP_ID;

const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: {
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
	},
});

client.on("qr", (qr) => {
	console.log("Escaneie este QR Code para conectar:");
	qrcode.generate(qr, { small: true });
});

client.on("auth_failure", (message) => {
	console.log("❌ Falha na autenticação. Tentando novamente...");
	client.destroy(); // Destrói a instância atual
	client.initialize(); // Reinicia o cliente
});

client.on("disconnected", (reason) => {
	console.warn("⚠ Cliente desconectado:", reason);
});

client.on("ready", async () => {
	console.log("✅ WhatsApp conectado!");

	async function checkPromotions() {
		try {
			console.log("🔄 Verificando promoções não enviadas...");
			const response = await api.get("/promotions/last");

			if (response.status === 200) {
				const promotions = response.data;

				for (const promo of promotions) {
					try {
						let options = {};

						if (promo.image && fs.existsSync(`./uploads/${promo.image}.jpg`)) {
							const imagePath = `./uploads/${promo.image}.jpg`;
							const imageBuffer = fs.readFileSync(imagePath);

							const mimeType = mime.lookup(imagePath) || "image/jpeg";

							const media = new MessageMedia(
								mimeType,
								imageBuffer.toString("base64")
							);
							options = { media };
						}

						const promoJson = await formatMessage(promo.originalMessage);
						const parsedJson = JSON.parse(promoJson);

						if (
							!parsedJson ||
							typeof parsedJson !== "object" ||
							Object.keys(parsedJson).length === 0
						) {
							console.log(
								`❌ A promo ${promo.id} retornou o JSON como objeto vazio.`
							);
						} else {
							const { title, productName, oldPrice, newPrice, link } =
								parsedJson;

							let messageText = ``;

							if (title) {
								messageText += `${title}\n\n`;
							}

							messageText += `${productName}\n\n`;

							if (oldPrice) {
								messageText += `De: ~${formatPrice(oldPrice)}~\n`;
							}

							messageText += `Por:\n`;
							messageText += `🔥 *${formatPrice(newPrice)}* 🔥 `;

							if (oldPrice) {
								const discount = calculateDiscount(oldPrice, newPrice);
								messageText += `(${discount}% OFF)`;
							}

							messageText += `\n\nCompre aqui: ${link}`;

							const message = await client.sendMessage(
								GROUP_ID,
								messageText,
								options
							);

							if (message.id) {
								console.log("✅ Mensagem enviada com sucesso!", message.id);

								await prisma.promotion.update({
									data: {
										title: title,
										description: productName,
										formatted: true,
										link: link,
										oldPrice: oldPrice,
										newPrice: newPrice,
										sendDate: new Date(),
									},
									where: {
										id: promo.id,
									},
								});

								if (
									promo.image &&
									fs.existsSync(`./uploads/${promo.image}.jpg`)
								) {
									fs.unlinkSync(`./uploads/${promo.image}.jpg`);
								}
							}
						}
					} catch (error) {
						console.error("❌ Erro ao enviar mensagem:", error);
					}
				}
			} else {
				console.log(
					"❌ Erro ao tentar listar as últimas promoções. ",
					response.status,
					response.statusText
				);
			}
		} catch (error) {
			console.error("Erro ao verificar promoções:", error);
		}

		setTimeout(checkPromotions, 5000);
	}

	checkPromotions();
});

function startWhatsappSender() {
	client.initialize();
}

module.exports = { startWhatsappSender, client };
