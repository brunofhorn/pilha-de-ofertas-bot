require("dotenv").config();

const generateMagazineLuizaAffiliateLink = (url) => {
	try {
		const regex = /\/magazine[^\/]*\//g;
		return url.replace(regex, `/${process.env.MAGAZINE_LUIZA_PARTNER_TAG}/`);
	} catch (error) {
		console.log("Erro ao gerar o link da Magazine Luiza. Erro: ", error);
		return null;
	}
};

module.exports = { generateMagazineLuizaAffiliateLink };
