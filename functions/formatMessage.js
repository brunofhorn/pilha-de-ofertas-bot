const axios = require("axios");
require("dotenv").config();

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

const formatMessage = async (message) => {
	try {
		const response = await axios.post(
			"https://api.mistral.ai/v1/chat/completions",
			{
				model: "mistral-medium", 
				messages: [
					{
						role: "system",
						content: "Vou te passar uma mensagem, cujo contexto é uma promoção enviada em um canal no telegram. Extraia informações estruturadas da mensagem em JSON. Devolva apenas o JSON na resposta com os campos citados abaixo. Não coloque nenhum campo adicional ou explicação, somente o JSON com os campos informados. Caso você encontre mais de um link, considere apenas o primeiro. Ignore demais promoções abaixo do primeiro link dentro da mesma mensagem. Se o título ficar igual ao nome do produto, mantenha apenas o nome do produto.",
					},
					{
						role: "user",
						content: `Extraia título, nome do produto, preço antigo, preço novo, cupom (caso houver), link e nome da loja (de acordo com o domínio do link) com os respectivos nomes: title, productName, oldPrice, newPrice, voucher, link, storeName. Normalmente a mensagem da promoção possui descrição (nome do produto), preço antigo, novo preço (preço em promoção), link da loja virtual, pode possuir também um título (chamada ou manchete da promoção). Caso o título fique exatamente igual ao nome do produto, não preencha o título, somente o nome do produto. Os preços eu quero que seja apenas número inteiro, ou seja, se o valor for 39,90, retorne 3990, se o valor for sem casas decimais, coloque duas casas decimais e deixe inteiro, como R$ 369 vira 36900. A mensagem da promoção é:\n\n${message}`,
					},
				],
				max_tokens: 300,
			},
			{
				headers: {
					Authorization: `Bearer ${MISTRAL_API_KEY}`,
					"Content-Type": "application/json",
				},
			}
		);

        if(response.data.choices[0].message.content){
            return response.data.choices[0].message.content
        }else{
            return JSON.stringify("{}")
        }
	} catch (error) {
		console.error("Erro:", error.response?.data || error.message);
        return JSON.stringify("{}")
	}
};

module.exports = { formatMessage };
