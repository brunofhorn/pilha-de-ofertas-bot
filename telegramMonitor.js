require("dotenv").config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const fs = require("fs");
const prisma = require("./lib/prisma.js");
const { formatMessage } = require("./functions/formatMessage.js");

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

(async () => {
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

	console.log("✅ Conectado ao Telegram!");

	client.addEventHandler(async (event) => {
		const message = event.message;
		if (!message) return;

		const chat = await message.getChat();

		console.log("MESSAGE: ", JSON.stringify(message ?? "{}"));
		// console.log("CHAT:" , chat.id.toString(), chat.username, groupWhitelist.includes(chat.id), JSON.stringify(chat ?? "{}"))
		if (
			!groupWhitelist.includes(chat?.username?.toString() ?? "") &&
			!groupWhitelist.includes(chat?.id?.toString() ?? "")
		) {
			return;
		}

		formatMessage(message.message).then((data) =>
			console.log("MENSAGEM FORMATADA: ", JSON.stringify(data, null, 2), data)
		);

		console.log(`📩 Nova mensagem em ${chat.title}: ${message.message}`);

		let imagePath = null;

		if (message.media && message.media.photo) {
			console.log("📸 Foto detectada! Baixando...");
			imagePath = `./uploads/photo_${message.id}.jpg`;
			await client.downloadMedia(message.media, { outputFile: imagePath });
		}

		// Salva no banco
		// await prisma.promotion.create({
		//     data:{
		//         title: '',
		//         description: '',
		//         oldPrice: '',
		//         newPrice: '',
		//         link: '',
		//         sourceChannel: 'Telegram',
		//         image: ''
		//     }
		// })

		console.log("✅ Mensagem salva no banco!");
	}, new TelegramClient.events.NewMessage());

	console.log("📡 Monitorando mensagens...");
})();
