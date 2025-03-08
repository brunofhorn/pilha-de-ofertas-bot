require("dotenv").config();

const generateAmazonAffiliateLink = async (expandedUrl) => {
	if (!expandedUrl) {
		return null;
	}

	try {
		const asinRegex = /\/dp\/([A-Z0-9]{10})/i;
		const match = expandedUrl.match(asinRegex);

		if (match && match[1]) {
			const asin = match[1];
			return `https://www.amazon.com.br/dp/${asin}/?tag=${process.env.AMAZON_PARTNER_TAG}`;
		}

		return null;
	} catch (error) {
		console.error("Erro ao gerar link de afiliado:", error);
		return null;
	}
};

module.exports = { generateAmazonAffiliateLink };
