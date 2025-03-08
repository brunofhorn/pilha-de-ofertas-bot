const axios = require("axios");

const expandUrl = async (shortUrl) => {
	try {
		const response = await axios.get(shortUrl, { maxRedirects: 5 });
		return response.request.res.responseUrl;
	} catch (error) {
		console.error("Erro ao expandir URL:", error);
		return null;
	}
};

module.exports = { expandUrl };
