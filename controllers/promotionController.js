require("dotenv").config();
const prisma = require("../lib/prisma.js");
const { client } = require("../whatsappSender.js");
const fs = require("fs");
const mime = require("mime-types");
const { MessageMedia } = require("whatsapp-web.js");

const GROUP_ID = process.env.GROUP_ID;

const getLastPromotions = async (req, res) => {
	try {
		const promotions = await prisma.promotion.findMany({
			where: { sendDate: null },
			take: 5,
			orderBy: { createdAt: "desc" },
		});
		res.json(promotions);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const sendPromotion = async (req, res) => {
	if (!client) return res.status(500).json({ error: "Bot não iniciado" });

	try {
		const { message } = req.body;
		const imagePath = req.file.path;

		const imageBuffer = fs.readFileSync(imagePath);
		const mimeType = mime.lookup(imagePath) || "image/jpeg";
		const base64Image = imageBuffer.toString("base64");

		const media = new MessageMedia(mimeType, base64Image);

		await client.sendMessage(GROUP_ID, media, { caption: message });

		fs.unlinkSync(imagePath);

		res.status(200).json({ success: true, message: "📸 Imagem enviada!" });
	} catch (error) {
		console.error("Erro ao enviar imagem:", error);
		res
			.status(500)
			.json({ success: false, message: "❌ Erro ao enviar imagem" });
	}
};

// export const getAllMessages = async (req, res) => {
// 	try {
// 		const messages = await prisma.message.findMany();
// 		res.json(messages);
// 	} catch (error) {
// 		res.status(500).json({ error: error.message });
// 	}
// };

// // Função para pesquisar uma mensagem por ID
// export const getMessageById = async (req, res) => {
// 	const { id } = req.params;
// 	try {
// 		const message = await prisma.message.findUnique({
// 			where: { id: parseInt(id) },
// 		});
// 		if (message) {
// 			res.json(message);
// 		} else {
// 			res.status(404).json({ message: "Mensagem não encontrada" });
// 		}
// 	} catch (error) {
// 		res.status(500).json({ error: error.message });
// 	}
// };

// // Função para atualizar o status de envio
// export const updateMessageStatus = async (req, res) => {
// 	const { id } = req.params;
// 	const { sent } = req.body; // o status de envio que você quer atualizar
// 	try {
// 		const updatedMessage = await prisma.message.update({
// 			where: { id: parseInt(id) },
// 			data: { sent },
// 		});
// 		res.json(updatedMessage);
// 	} catch (error) {
// 		res.status(500).json({ error: error.message });
// 	}
// };

module.exports = { getLastPromotions, sendPromotion };
