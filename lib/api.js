const axios = require("axios");
require("dotenv").config();

const baseURL = process.env.BASE_URL

const api = axios.create({
	baseURL,
	timeout: 5000,
	headers: {
		"Content-Type": "application/json",
	},
});

module.exports = api; 
