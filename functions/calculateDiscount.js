const calculateDiscount = (oldPrice, actualPrice) => {
	return Math.round(((oldPrice - actualPrice) / oldPrice) * 100);
};

module.exports = { calculateDiscount };
