const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js'); // Mudança Buttons
const client = new Client({puppeteer: {executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',}});

// QR code
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
// Conexão
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});
// Inicialização
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função que usamos para criar o delay entre uma ação e outra

// Base Projeto

let saudacaoEnviada = {};

client.on('message', async (msg) => {
    const chat = await msg.getChat();

    // Verificar se a mensagem não é de um grupo e se o remetente é um usuário individual
    if (!msg.from.endsWith('@c.us')) {
        return; // Ignorar mensagens de grupos
    }

    if (!saudacaoEnviada[msg.from]) {
        saudacaoEnviada[msg.from] = true;
        
        await chat.sendStateTyping();
        await delay(5000);
        await client.sendMessage(msg.from, '👋 Olá! Seja bem-vindo(a) à nossa loja! \n Como podemos te ajudar hoje?  \n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas');

    }


    if (msg.body !== null && msg.body === '1'|| msg.body === 'pedido'|| msg.body === 'comprar'|| msg.body === 'fazer pedido'|| msg.body === 'encomendar'|| msg.body === 'quero comprar'|| msg.body === 'compra'|| msg.body === 'quero pedir'|| msg.body === 'novo pedido' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(5000);
        await client.sendMessage(msg.from, 'Certo! Vamos encaminhar sua solicitação para nosso setor de pedidos. 📝');

    }

    if (msg.body !== null && msg.body === '2'|| msg.body === 'Farmácia'|| msg.body === 'remédio'|| msg.body === 'medicamento'|| msg.body === 'medicamentos' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(5000);
        await client.sendMessage(msg.from, 'Ok! Vamos passar seu contato para o setor de farmácia. 💊');

    }

    if (msg.body !== null && msg.body === '3'|| msg.body === 'pesca'|| msg.body === 'anzol'|| msg.body === 'vara de pesca'|| msg.body === 'isca' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(5000);
        await client.sendMessage(msg.from, 'Beleza! Vamos encaminhar você para o setor de pesca. 🎣');

    }


    if (msg.body !== null && msg.body === '4'|| msg.body === 'ração'|| msg.body === 'ração gato'|| msg.body === 'comida para cachorro'|| msg.body === 'ração' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(5000);
        await client.sendMessage(msg.from, 'Entendido! Vamos passar para o setor de rações. 🐾');

    }

    if (msg.body !== null && msg.body === '5'|| msg.body === 'pet'|| msg.body === 'acessórios'|| msg.body === 'coleira'|| msg.body === 'caminha pet' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(5000);
        await client.sendMessage(msg.from, 'Certo! Vamos encaminhar você para o setor de produtos pet. 🐶🐱');

    }


    if (msg.body !== null && msg.body === 'AJUDA'|| msg.body === 'Ajuda' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(5000);
        await client.sendMessage(msg.from, 'Aguarde que vamos te transferir para um de nossos atendentes.');

    }









});