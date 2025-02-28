require("dotenv").config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const fs = require("fs");
const api = require("./lib/api.js");

const API_ID = process.env.API_ID;
const API_HASH = process.env.API_HASH;

const sessionFile = "./session.txt";

const groupWhitelist = [
	"promos4m",
	"xetdaspromocoes",
	"pilha_de_ofertas",
	"-1002355442864",
	"teste",
	"2355442864",
];

const sessionString = fs.existsSync(sessionFile)
	? fs.readFileSync(sessionFile, "utf8")
	: "";
const client = new TelegramClient(
	new StringSession(sessionString),
	Number(API_ID),
	API_HASH,
	{
		connectionRetries: 5,
	}
);

const telegramMonitor = async () => {
	console.log("Iniciando o cliente Telegram...");

	await client.start();

	console.log("✅ Conectado ao Telegram!");

	// await client.start({
	//     phoneNumber: "+5548984454934",
	//     password: async () => await input.text("Digite sua senha (se necessário): "),
	//     phoneCode: async () => await input.text("Digite o código enviado pelo Telegram: "),
	//     onError: (err) => console.log(err),
	// });

	fs.writeFileSync(sessionFile, client.session.save());

	client.addEventHandler(async (event) => {
		const message = event.message;
		if (!message) return;

		const chat = await message.getChat();

		if (
			!groupWhitelist.includes(chat?.username?.toString() ?? "") &&
			!groupWhitelist.includes(chat?.id?.toString() ?? "")
		) {
			return;
		}

		console.log(`📩 Nova mensagem em ${chat.title}: ${message.message}`);

		try {
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

module.exports = { telegramMonitor };
