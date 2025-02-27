require("dotenv").config();
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const mime = require("mime-types");
const fs = require("fs");
const api = require("./lib/api.js");
const prisma = require("./lib/prisma.js");
const { calculateDiscount } = require("./functions/calculateDiscount.js");
const { formatPrice } = require("./functions/formatPrice.js");

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

						if (promo.image && fs.existsSync(`./uploads/${promo.image}`)) {
							const imagePath = `./uploads/${promo.image}`;
							const imageBuffer = fs.readFileSync(imagePath);

							const mimeType = mime.lookup(imagePath) || "image/jpeg";

							const media = new MessageMedia(
								mimeType,
								imageBuffer.toString("base64")
							);
							options = { media };
						}

						let messageText = ``;

						if (promo.title) {
							messageText += `${promo.title}\n\n`;
						}

						messageText += `${promo.description}\n\n`;

						if (promo.oldPrice) {
							messageText += `De: ~${formatPrice(promo.oldPrice)}~\n`;
						}

						messageText += `Por:\n`;
						messageText += `🔥 *${formatPrice(promo.newPrice)}* 🔥 `;

						if (promo.oldPrice) {
							const discount = calculateDiscount(
								promo.oldPrice,
								promo.newPrice
							);
							messageText += `(${discount}% OFF)`;
						}

						messageText += `\n\nCompre aqui: ${promo.link}`;

						const message = await client.sendMessage(
							GROUP_ID,
							messageText,
							options
						);

						if (message.id) {
							console.log("✅ Mensagem enviada com sucesso!", message.id);

							await prisma.promotion.update({
								data: {
									sendDate: new Date(),
								},
								where: {
									id: promo.id,
								},
							});
						}

						console.log(`✅ Mensagem enviada: ${promo.description}`);
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

		// Rechama a função após 5 segundos
		setTimeout(checkPromotions, 5000);
	}

	checkPromotions();

	// setInterval(async () => {
	// 	console.log("🔄 Verificando promoções não enviadas...");
	// 	const response = await api.get("/promotions/last");

	// 	console.log("RESPONSE: ", response)

	// }, 15000);
});

function startWhatsappSender() {
	client.initialize();
}

// Exporta a função e o client
module.exports = { startWhatsappSender, client };
