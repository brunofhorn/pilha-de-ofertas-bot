require("dotenv").config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const fs = require("fs");
const api = require("./lib/api.js");
const { isWhitelisted } = require("./functions/isWhiteListed.js");

const API_ID = process.env.API_ID;
const API_HASH = process.env.API_HASH;
const sessionFile = "./session.txt";

const sessionString = fs.existsSync(sessionFile)
	? fs.readFileSync(sessionFile, "utf8")
	: "";

let client = null;
let isRunning = false;

const startTelegramMonitor = async () => {
	if (isRunning) {
		console.log("⚠️ Telegram Monitor já está rodando.");
		return;
	}

	console.log("Iniciando o cliente Telegram...");

	const sessionString = fs.existsSync(sessionFile)
		? fs.readFileSync(sessionFile, "utf8")
		: "";

	client = new TelegramClient(
		new StringSession(sessionString),
		Number(API_ID),
		API_HASH,
		{
			connectionRetries: 5,
		}
	);

	await client.start();

	console.log("✅ Conectado ao Telegram!");

	// await client.start({
	//     phoneNumber: "+5548984454934",
	//     password: async () => await input.text("Digite sua senha (se necessário): "),
	//     phoneCode: async () => await input.text("Digite o código enviado pelo Telegram: "),
	//     onError: (err) => console.log(err),
	// });

	fs.writeFileSync(sessionFile, client.session.save());

	isRunning = true;

	client.addEventHandler(async (event) => {
		const message = event.message;
		if (!message) return;

		try {
			const chat = await message.getChat();

			const { data } = await api.get("/groups");

			if (!isWhitelisted(chat, data)) {
				return;
			}

			console.log(`📩 Nova mensagem em ${chat.title}: ${message.message}`);

			let imagePath = null;
			const imageName = `photo_${
				message?.id?.toString() ?? crypto.randomUUID()
			}_${chat?.id?.toString() ?? crypto.randomUUID()}`;

			if (message.media && message.media.photo) {
				console.log("📸 Foto detectada! Baixando...");
				imagePath = `./uploads/${imageName}.jpg`;
				await client.downloadMedia(message.media, { outputFile: imagePath });
			}

			const response = await api.post("/promotions/", {
				originalMessage: message.message,
				image: imageName,
				channel: chat.title,
			});

			if (response.status === 201) {
				console.log("✅ Mensagem salva no banco!");
			} else {
				console.log("❌ Ocorreu um erro ao tentar salvar a mensagem no banco.");
			}
		} catch (error) {
			console.log("❌ Ocorreu um erro ao tentar salvar a mensagem.");
		}
	}, new TelegramClient.events.NewMessage());

	console.log("📡 Monitorando mensagens...");
};

async function stopTelegramMonitor() {
    if (!isRunning) {
        console.log("⚠️ Telegram Monitor já está parado.");
        return;
    }

    console.log("⛔ Parando o Telegram Monitor...");
    isRunning = false;

    if (client) {
        await client.disconnect(); // Desconecta do Telegram
        client = null;
    }

    console.log("✅ Telegram Monitor parado.");
}

module.exports = { startTelegramMonitor, stopTelegramMonitor };
