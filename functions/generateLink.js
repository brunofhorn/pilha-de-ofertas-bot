const { expandUrl } = require("./expandUrl");
const { identifyMarketplaces } = require("./identifyMarketplaces");
const { generateAmazonAffiliateLink } = require("./generateLinks/amazon");
const { generateMercadoLivreAffiliateLink } = require("./generateLinks/mercado-livre");
const { generateMagazineLuizaAffiliateLink } = require("./generateLinks/magazine-luiza");
const { generateShopeeAffiliateLink } = require("./generateLinks/shopee");

const generateLink = async (link) => {
	if (!link) {
		console.log("O link não existe.");
		return false;
	}
	
	const expandedLink = await expandUrl(link);

	if (!expandedLink) {
		console.log("Erro ao expandir o link.");
		return false;
	}

	const marketplace = identifyMarketplaces(expandedLink);
	
	if (!marketplace) {
		console.log("Marketplace não reconhecido.");
		return false;
	}

	switch (marketplace) {
		case "amazon":
			return await generateAmazonAffiliateLink(expandedLink);
		case "shopee":
			return await generateShopeeAffiliateLink(expandedLink);
		// case "aliexpress":
		// 	return await generateAliExpressAffiliateLink(expandedLink);
		case "mercadolivre":
			return await generateMercadoLivreAffiliateLink(expandedLink);
		case "magazineluiza":
			return await generateMagazineLuizaAffiliateLink(expandedLink);
		default:
			console.log(
				"Nenhuma função de afiliado implementada para este marketplace."
			);
			return false;
	}
};

module.exports = { generateLink };
