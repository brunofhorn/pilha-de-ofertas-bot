const chatName = "Pilha de Ofertas";

const chats = await client.getChats();
const groupChat = chats.find((chat) => chat.isGroup && chat.name === chatName);

if (groupChat) {
    console.log(`📌 ID do grupo: ${groupChat.id._serialized}`);
} else {
    console.log("❌ Grupo não encontrado.");
}