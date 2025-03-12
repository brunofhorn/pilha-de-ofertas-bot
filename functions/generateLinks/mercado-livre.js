const { default: axios } = require("axios");

require("dotenv").config();

const MERCADO_LIVRE_PARTNER_TAG = process.env.MERCADO_LIVRE_PARTNER_TAG;

const generateMercadoLivreAffiliateLink = async (url) => {
	try {
		const urlApi =
			"https://www.mercadolivre.com.br/affiliate-program/api/affiliates/v1/createUrls";

		const headers = {
			Accept: "application/json, text/plain, */*",
			"Accept-Encoding": "gzip, deflate, br, zstd",
			"Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
			"Cache-Control": "no-cache",
			"Content-Type": "application/json",
			Origin: "https://www.mercadolivre.com.br",
			Referer: "https://www.mercadolivre.com.br/afiliados/linkbuilder",
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
		};

		const body = JSON.stringify({
			urls: [url],
		});

		try {
			const response = await axios.post(urlApi, body, { headers });

			console.log("RESPONSE: ", response);

			if (!response.ok) {
				console.error("Erro na requisição:", response.statusText);
				return null;
			}

			const data = await response.json();
			return data.generatedUrls?.[0] ?? null;
		} catch (error) {
			console.error("Erro ao gerar link afiliado:", error);
			return null;
		}
	} catch (error) {
		console.error("Erro ao gerar link de afiliado:", error.message);
		return null;
	}
};

module.exports = { generateMercadoLivreAffiliateLink };
