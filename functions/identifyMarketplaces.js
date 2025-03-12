const identifyMarketplaces = (url) => {
	const marketplaces = {
		amazon: /amazon\.(com|com\.br|co\.uk|de|fr|it|es|ca|jp|in|mx)/,
		shopee: /shopee\.(com|br|ph|sg|id|my|th|vn)/,
		aliexpress: /aliexpress\.(com|ru|es|fr|de|it|nl)/,
		mercadolivre:
			/mercadolivre\.com\.br|mercadolibre\.(com|com\.ar|cl|co|mx|uy|pe|ec|do)/,
		magazineluiza: /magazineluiza\.com\.br|magalu\.com|magazinevoce\.com\.br/,
	};

	for (const [marketplace, regex] of Object.entries(marketplaces)) {
		if (regex.test(url)) {
			console.log(url, marketplace)
			return marketplace;
		}
	}

	return null;
};

module.exports = { identifyMarketplaces };
