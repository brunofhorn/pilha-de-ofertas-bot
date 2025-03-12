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
	
	// const expandedLink = await expandUrl(link);
	const expandedLink = "https://www.mercadolivre.com.br/social/promos4m?matt_tool=36000880&forceInApp=true&ref=BOf%2FgUBLQzCaX1%2BCQHerU9F3%2FVTgflwiXQsaUngIKUR707AdliLmtBYKAAi608RkcT4SUxag2%2FkGpuD8AWbFdJ1Hf7949kDcORAdG0D643pIgN0DY7hEW19SXG0FCp6KV8Y%2FIGkzG9eUcer32Fhp%2FHqBubQ5TbynVszCr19ZH676zx%2BjBsKZxOobtpCFlojCgSnbEQ%3D%3D"

	if (!expandedLink) {
		console.log("Erro ao expandir o link.");
		return false;
	}

	// const marketplace = identifyMarketplaces(expandedLink);
	const marketplace = "mercadolivre"
	
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
