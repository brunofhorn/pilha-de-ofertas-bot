const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
require("dotenv").config();
const fs = require("fs");

const API_ID = process.env.API_ID;
const API_HASH = process.env.API_HASH;
const sessionFile = "./session.txt";

const sessionString = fs.existsSync(sessionFile)
	? fs.readFileSync(sessionFile, "utf8")
	: "";

const client = new TelegramClient(
	new StringSession(sessionString),
	Number(API_ID),
	API_HASH,
	{ connectionRetries: 5 }
);

async function sendMessageToTelegram(caption, file) {
	try {
		await client.start();
		console.log("✅ Conectado ao Telegram!");

        await client.sendFile("@pilha_de_ofertas", {
            file,
            caption,
        });

		console.log(`📩 Mensagem enviada para pilha de ofertas`);
		await client.disconnect();

        return true
	} catch (error) {
		console.error("❌ Erro ao enviar mensagem:", error);
        return false
	}
}

module.exports = { sendMessageToTelegram };
