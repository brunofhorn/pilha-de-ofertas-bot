require("dotenv").config();
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const qrCodeStore = require("./services/qrCodeStore.js");
const mime = require("mime-types");
const fs = require("fs");
const api = require("./lib/api.js");
const prisma = require("./lib/prisma.js");
const { calculateDiscount } = require("./functions/calculateDiscount.js");
const { formatPrice } = require("./functions/formatPrice.js");
const { formatMessage } = require("./functions/formatMessage.js");
const { generateLink } = require("./functions/generateLink.js");
const { sendMessageToTelegram } = require("./telegramSender.js");

const GROUP_ID = process.env.GROUP_ID;
let client;
let promotionCheckInterval = null;

function startWhatsappSender() {
	if (client) {
		console.log("⚠ O WhatsApp já está rodando!");
		return;
	}

	client = new Client({
		authStrategy: new LocalAuth(),
		puppeteer: {
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
		},
	});

	client.on("qr", (qr) => {
		console.log("Escaneie este QR Code para conectar:");
		qrCodeStore.setQr(qr);
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
		checkPromotions();
	});

	async function checkPromotions() {
		if (!client) return;

		try {
			console.log("🔄 Verificando promoções não enviadas...");
			const response = await api.get("/promotions/last");

			if (response.status === 200) {
				const promotions = response.data;

				for (const promo of promotions) {
					try {
						let options = {};
						let imagePath = null;

						if (promo.image && fs.existsSync(`./uploads/${promo.image}.jpg`)) {
							imagePath = `./uploads/${promo.image}.jpg`;
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

							const affiliateLink = await generateLink(
								Array.isArray(link) ? link[0] : link
							);

							if (affiliateLink) {
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

								messageText += `\n\nCompre aqui: ${affiliateLink}`;

								const message = await client.sendMessage(
									GROUP_ID,
									messageText,
									options
								);

								if (message.id) {
									const sendMessageTelegram = await sendMessageToTelegram(
										messageText,
										imagePath
									);

									if (sendMessageTelegram) {
										console.log(
											"✅ Mensagem enviada com sucesso para o telegram!"
										);
									}

									console.log(
										"✅ Mensagem enviada com sucesso para o whatsapp!"
									);

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

									// if (
									// 	promo.image &&
									// 	fs.existsSync(`./uploads/${promo.image}.jpg`)
									// ) {
									// 	fs.unlinkSync(`./uploads/${promo.image}.jpg`);
									// }
								}
							} else {
								console.error(
									`❌ O link da promoção ${promo.id} está quebrado.`
								);
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

		promotionCheckInterval = setTimeout(checkPromotions, 1000 * 60 * 5);
	}

	client.initialize();
}

function stopWhatsappSender() {
	if (!client) {
		console.log("⚠ O WhatsApp já está parado!");
		return;
	}
	console.log("🛑 Parando WhatsApp...");
	client.destroy();
	client = null;

	if (promotionCheckInterval) {
		clearTimeout(promotionCheckInterval);
		promotionCheckInterval = null;
	}

	console.log("✅ WhatsAppSender foi completamente parado!");
}

module.exports = { startWhatsappSender, stopWhatsappSender };
