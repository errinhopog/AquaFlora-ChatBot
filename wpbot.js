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
        await delay(2500);
        await client.sendMessage(msg.from, '👋 Olá! Seja bem-vindo(a) à nossa loja! \n Digite o número do setor que deseja ajuda:  \n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas \n \n Digite Menu para ver o menu novamente.');

    }


    if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Certo! Vamos encaminhar sua solicitação para nosso setor de pedidos. 📝');

    }

    if (msg.body !== null && msg.body === '2' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Ok! Vamos passar seu contato para o setor de farmácia. 💊');

    }

    if (msg.body !== null && msg.body === '3' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Beleza! Vamos encaminhar você para o setor de pesca. 🎣');

    }


    if (msg.body !== null && msg.body === '4' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Entendido! Vamos passar para o setor de rações. 🐾');

    }

    if (msg.body !== null && msg.body === '5' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Certo! Vamos encaminhar você para o setor de produtos pet. 🐶🐱');

    }

    if (msg.body !== null && msg.body === '6' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Certo! Vamos encaminhar você para o setor de ferramentas. 🧰');

    }


    if (msg.body !== null && (msg.body === "menu" || msg.body === "Menu") && msg.from.endsWith('@c.us')) {
        await msg.reply("📋 Aqui está o menu novamente:\n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas");
        return;
    }










});