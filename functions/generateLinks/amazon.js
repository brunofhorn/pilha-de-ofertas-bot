require("dotenv").config();
const ProductAdvertisingAPIv1 = require("paapi5-nodejs-sdk");
const { extractAsinFromUrl } = require("../extractAsinFromUrl");

let defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY;
defaultClient.secretKey = process.env.AMAZON_SECRET_KEY;
defaultClient.host = "webservices.amazon.com.br";
defaultClient.region = "us-east-1";

let api = new ProductAdvertisingAPIv1.DefaultApi();

let searchItemsRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
searchItemsRequest["PartnerTag"] = process.env.AMAZON_PARTNER_TAG;
searchItemsRequest["PartnerType"] = "Associates";
searchItemsRequest["Resources"] = [
	"Images.Primary.Medium",
	"ItemInfo.Title",
	"Offers.Listings.Price",
];

const generateAmazonAffiliateLink = async (expandedUrl) => {
	try {
		const asin = extractAsinFromUrl(expandedUrl);

		if (!asin) {
			return console.log("ASIN não encontrado na URL.");
		}

		try {
			api.searchItems(searchItemsRequest, callback);
		} catch (error) {}

		// const request = new PAAPI.GetItemsRequest();
		// console.log("REQUEST: ", request)
		// request.PartnerTag = partnerTag;
		// request.PartnerType = "Associates";
		// request.Marketplace = marketplace;
		// request.ItemIds = [asin];
		// request.Resources = [
		// 	"Images.Primary.Medium",
		// 	"ItemInfo.Title",
		// 	"Offers.Listings.Price",
		// ];

		// const response = await new Promise((resolve, reject) => {
		// 	amazonClient.getItems(request, (error, data) => {
		// 		if (error) reject(error);
		//         else resolve(data);
		//     });
		// });

		// console.log("RESPONSE: ", response)

		// if (response.ItemsResult && response.ItemsResult.Items.length > 0) {
		//     return response.ItemsResult.Items[0].DetailPageURL;
		// } else {
		//     throw new Error('Nenhum item encontrado na resposta da API.');
		// }
	} catch (error) {
		console.error("Erro ao gerar link de afiliado:", error);
		return null;
	}
};

const callback = (error, data, response) => {
	if (error) {
		console.log("Error calling PA-API 5.0!");
		console.log(
			"Printing Full Error Object:\n" + JSON.stringify(error, null, 1)
		);
		console.log("Status Code: " + error["status"]);
		if (
			error["response"] !== undefined &&
			error["response"]["text"] !== undefined
		) {
			console.log(
				"Error Object: " + JSON.stringify(error["response"]["text"], null, 1)
			);
		}
	} else {
		console.log("API called successfully.");
		var searchItemsResponse =
			ProductAdvertisingAPIv1.SearchItemsResponse.constructFromObject(data);
		console.log(
			"Complete Response: \n" + JSON.stringify(searchItemsResponse, null, 1)
		);
		if (searchItemsResponse["SearchResult"] !== undefined) {
			console.log("Printing First Item Information in SearchResult:");
			var item_0 = searchItemsResponse["SearchResult"]["Items"][0];
			if (item_0 !== undefined) {
				if (item_0["ASIN"] !== undefined) {
					console.log("ASIN: " + item_0["ASIN"]);
				}
				if (item_0["DetailPageURL"] !== undefined) {
					console.log("DetailPageURL: " + item_0["DetailPageURL"]);
				}
				if (
					item_0["ItemInfo"] !== undefined &&
					item_0["ItemInfo"]["Title"] !== undefined &&
					item_0["ItemInfo"]["Title"]["DisplayValue"] !== undefined
				) {
					console.log("Title: " + item_0["ItemInfo"]["Title"]["DisplayValue"]);
				}
				if (
					item_0["Offers"] !== undefined &&
					item_0["Offers"]["Listings"] !== undefined &&
					item_0["Offers"]["Listings"][0]["Price"] !== undefined &&
					item_0["Offers"]["Listings"][0]["Price"]["DisplayAmount"] !==
						undefined
				) {
					console.log(
						"Buying Price: " +
							item_0["Offers"]["Listings"][0]["Price"]["DisplayAmount"]
					);
				}
			}
		}
		if (searchItemsResponse["Errors"] !== undefined) {
			console.log("Errors:");
			console.log(
				"Complete Error Response: " +
					JSON.stringify(searchItemsResponse["Errors"], null, 1)
			);
			console.log("Printing 1st Error:");
			var error_0 = searchItemsResponse["Errors"][0];
			console.log("Error Code: " + error_0["Code"]);
			console.log("Error Message: " + error_0["Message"]);
		}
	}
};

module.exports = { generateAmazonAffiliateLink };
