const { calculateDiscount } = require("../calculateDiscount");
const { formatPrice } = require("../formatPrice");

const formatMessageToWhatsapp = async (parsedJson, affiliateLink) => {
	try {
		const { title, productName, oldPrice, newPrice, cupom } = parsedJson;

		let message = ``;

		if (title) {
			message += `${title?.toUpperCase()}\n\n`;
		}

		message += `*${productName}*\n\n`;

		if (oldPrice) {
			message += `De: ~${formatPrice(oldPrice)}~\n`;
		}

		message += `Por:\n`;
		message += `🔥 *${formatPrice(newPrice)}* 🔥 `;

		if (oldPrice) {
			const discount = calculateDiscount(oldPrice, newPrice);
			message += `(${discount}% OFF)`;
		}

        if(cupom){
			message += `\nUse o cupom: *${cupom?.toUpperCase()}* 🎟️`
		}

		message += `\n\n🛍️ Compre aqui: ${affiliateLink}`;
		message += `\n\n⚠️ Aproveite que a oferta é por tempo limitado!`;

        return message;
	} catch (error) {
		console.error("Erro ao expandir URL:", error);
		return "";
	}
};

module.exports = { formatMessageToWhatsapp };
