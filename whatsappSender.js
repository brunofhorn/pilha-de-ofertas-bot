require("dotenv").config();
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const qrCodeStore = require("./services/qrCodeStore.js");
const fs = require("fs");
const api = require("./lib/api.js");
const prisma = require("./lib/prisma.js");
const { formatMessage } = require("./functions/formatMessage.js");
const { generateLink } = require("./functions/generateLink.js");
const { sendMessageToTelegram } = require("./telegramSender.js");
const {
	formatMessageToWhatsapp,
} = require("./functions/messages/formatMessageToWhatsapp.js");
const { formatMessageToTelegram } = require("./functions/messages/formatMessageToTelegram.js");

const GROUP_ID = process.env.WHATSAPP_GROUP_ID;
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

						if (promo.image) {
							const base64Data = promo.image.startsWith("data:")
								? promo.image.split(",")[1]
								: promo.image;

							let mimeType = "image/jpeg";
							const match = promo.image.match(/^data:(image\/[a-z]+);base64,/);
							if (match) {
								mimeType = match[1];
							}

							const media = new MessageMedia(mimeType, base64Data);
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
							const { title, productName, oldPrice, newPrice, link } = parsedJson;

							const affiliateLink = await generateLink(
								Array.isArray(link) ? link[0] : link
							);

							if (affiliateLink) {
								const whatsappMessage = await formatMessageToWhatsapp(parsedJson, affiliateLink);
								const telegramMessage = await formatMessageToTelegram(parsedJson, affiliateLink)

								const message = await client.sendMessage(
									GROUP_ID,
									whatsappMessage,
									options
								);

								if (message.id) {
									console.log(
										"✅ Mensagem enviada com sucesso para o whatsapp!"
									);

									const sendMessageTelegram = await sendMessageToTelegram(
										telegramMessage,
										promo.image
									);
									
									if (sendMessageTelegram) {
										console.log(
											"✅ Mensagem enviada com sucesso para o telegram!"
										);
									}

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
				console.error(
					"❌ Erro ao tentar listar as últimas promoções. ",
					response.status,
					response.statusText
				);
			}
		} catch (error) {
			console.error("❌ Erro ao verificar promoções:", error);
		}

		const now = new Date();
		const currentHour = now.getHours();

		if (currentHour >= 8 && currentHour < 22) {
			promotionCheckInterval = setTimeout(checkPromotions, 1000 * 60 * 5);
		} else {
			const nextRun = new Date();
			nextRun.setHours(8, 0, 0, 0);
			if (currentHour >= 22) {
				nextRun.setDate(nextRun.getDate() + 1);
			}
			const delay = nextRun.getTime() - now.getTime();
			console.log(`⏳ Fora do horário. Próxima verificação agendada para ${nextRun}`);

			promotionCheckInterval = setTimeout(checkPromotions, delay);
		}
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
