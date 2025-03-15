const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // Para capturar dados do usuário no terminal

const apiId = 29130706; // Substitua pelo seu api_id
const apiHash = "32dc2bd1fc6ceb509509549e2b2a8028"; // Substitua pelo seu api_hash
const stringSession = new StringSession(""); // Sessão vazia (será preenchida após login)

(async () => {
    console.log("Iniciando o cliente...");
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("Digite seu número de telefone: "),
        password: async () => await input.text("Digite sua senha (se necessário): "),
        phoneCode: async () => await input.text("Digite o código enviado pelo Telegram: "),
        onError: (err) => console.log(err),
    });

    console.log("Você está conectado!");
    console.log("Sessão salva:", client.session.save()); // Salve esta string para reutilizar a sessão no futuro

    // LISTAR GRUPOS DISPONÍVEIS
    console.log("Listando todos os grupos aos quais você pertence...");
    const dialogs = await client.getDialogs(); // Obtém os chats disponíveis
    dialogs.forEach((dialog) => {
        if (dialog.isGroup) {
            console.log(`Grupo: ${dialog.name} | ID: ${dialog.id}`);
        }
    });

    // Monitorar mensagens após listar os grupos
    client.addEventHandler(async (event) => {
        const message = event.message;
        if (!message) return;

        const chat = await message.getChat();
        const sender = await message.getSender();

        // Adicione seu código de filtro aqui (se necessário)
        console.log(`[${chat.title}] ${sender.username || sender.firstName}: ${message.message}`);
    }, new TelegramClient.events.NewMessage({ chats: [] }));

    console.log("Aguardando mensagens...");
})();
