const path = require("path");
const puppeteer = require("puppeteer");
require("dotenv").config();

const generateMercadoLivreAffiliateLink = async (url) => {
	try {
		const userDataDir = path.join(__dirname, "chromium");
		const browser = await puppeteer.launch({
			headless: false,
			userDataDir: userDataDir,
		});

		const page = await browser.newPage();

		await page.goto("https://mercadolivre.com.br");
		const loginButton = await page.$('a[data-link-id="login"]');

		if (loginButton) {
			console.log(
				"Usuário NÃO está logado. Redirecionando para a página de login..."
			);
			await page.click('a[data-link-id="login"]'); // Simula o clique no botão de login
			await page.waitForTimeout(5000);
			await browser.close();
		} else {
			await page.goto(url);
			await page.waitForSelector(".poly-action-links__action--button a");

			const productUrl = await page.$eval(
				".poly-action-links__action--button a",
				(element) => element.href
			);

			await page.goto(productUrl);
			await page.click(".generate_link_button");

			await page.waitForSelector(
				'textarea[data-testid="text-field__label_link"]'
			);

			const textareaValue = await page.$eval(
				'textarea[data-testid="text-field__label_link"]',
				(textarea) => textarea.value
			);

			await page.waitForTimeout(5000);
			await browser.close();

			return textareaValue ?? null;
		}
	} catch (error) {
		console.error("Erro ao gerar link de afiliado:", error.message);
		return null;
	}
};

module.exports = { generateMercadoLivreAffiliateLink };
