require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");

const MERCADO_LIVRE_PARTNER_TAG = process.env.MERCADO_LIVRE_PARTNER_TAG;

const generateMercadoLivreAffiliateLink = async (url) => {
	try {
		const cookies = JSON.parse(fs.readFileSync("ml-cookies.json", "utf8"));

		// Inicia o navegador
		const browser = await puppeteer.launch({ headless: false });
		const page = await browser.newPage();

		// Carrega os cookies no navegador
		await page.setCookie(...cookies);

		// Acessa a página do Mercado Livre (já deve estar logado)
		await page.goto("https://www.mercadolivre.com.br/afiliados/linkbuilder");

		// Verificar se está logado, ou se deve redirecionar para o login
		const isLoggedIn = await page.evaluate(() => {
			return !!document.querySelector('button[data-testid="user-id"]');
		});

		if (isLoggedIn) {
			console.log("Usuário logado, indo para o link builder...");

			// Acessar o link builder de afiliados
			await page.goto("https://www.mercadolivre.com.br/afiliados/linkbuilder");

			// Aguardar a página carregar
			await page.waitForSelector('input[name="productUrl"]'); // Espera o input do URL do produto carregar

			// Digitar o URL do produto no campo de URL
			await page.type('input[name="productUrl"]', url);

			// Aguardar e clicar no botão para gerar o link
			await page.waitForSelector('button[type="submit"]');
			await page.click('button[type="submit"]');

			// Aguardar a resposta do link gerado
			await page.waitForSelector(".generated-link"); // Espera o link gerado

			// Extrair o link de afiliado
			const affiliateLink = await page.evaluate(() => {
				const linkElement = document.querySelector(".generated-link input");
				return linkElement ? linkElement.value : null;
			});

			if (affiliateLink) {
				console.log("Link de afiliado gerado: ", affiliateLink);
				return affiliateLink;
			} else {
				console.log("Não foi possível gerar o link de afiliado.");
				return null;
			}
		} else {
			console.log("Usuário não logado, indo para o login...");

			// Se não estiver logado, redireciona para o login
			await page.goto("https://www.mercadolivre.com/jms/mlb/lgz/login");

			// Aguardar o carregamento da página de login
			await page.waitForSelector('input[name="user_id"]'); // Espera o campo de usuário carregar

			// Aqui você pode automatizar o login, mas isso vai depender dos dados de login que você tem
			// Preencher os campos de login manualmente ou usar a funcionalidade de cookies localStorage já carregados
			console.log("Você precisa logar manualmente para continuar...");

			// Não prosseguir com mais ações até que o login seja feito manualmente
			const cookies = await page.cookies();

			// Salva os cookies em um arquivo JSON
			fs.writeFileSync("ml-cookies.json", JSON.stringify(cookies, null, 2));

			console.log("Cookies salvos com sucesso!");
		}

		// Fechar o navegador após a execução
		await browser.close();
	} catch (error) {
		console.error("Erro ao gerar link de afiliado:", error.message);
		return null;
	}
};

module.exports = { generateMercadoLivreAffiliateLink };
