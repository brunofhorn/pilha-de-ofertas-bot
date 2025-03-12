const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const generateShopeeAffiliateLink = async (url) => {
	const appId = process.env.SHOPEE_APP_ID;
	const secret = process.env.SHOPEE_SECRET;
	const timestamp = Math.floor(Date.now() / 1000);

	const payload = JSON.stringify({
		query: `mutation{
			generateShortLink(input:{originUrl:"${url}"}){
				shortLink
			}
		}`,
	});

	const assinaturaBase = `${appId}${timestamp}${payload}${secret}`;
	const signature = crypto
		.createHash("sha256")
		.update(assinaturaBase)
		.digest("hex");

	const headers = {
		"Content-Type": "application/json",
		Authorization: `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
	};

	try {
		const { data } = await axios.post(
			"https://open-api.affiliate.shopee.com.br/graphql",
			payload,
			{ headers }
		);

		if (data) {
			return data?.data?.generateShortLink?.shortLink ?? null;
		} else {
			return null;
		}
	} catch (error) {
		console.error("Erro na requisição:", error);
		return null;
	}
};

module.exports = { generateShopeeAffiliateLink };
