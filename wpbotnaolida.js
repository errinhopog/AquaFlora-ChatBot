const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js'); // Removido o que não está em uso
const client = new Client({
    puppeteer: {
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    }
});

// ADICIONE AQUI O NÚMERO DO SEGUNDO WHATSAPP (O DO ATENDENTE)
// Formato: 55 + DDD + NÚMERO + @c.us
const NUMERO_ATENDENTE = '5516996234322@c.us'; // !!! SUBSTITUA PELO NÚMERO CORRETO !!!

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

let saudacaoEnviada = {};

client.on('message', async (msg) => {
    // Ignorar mensagens de grupos
    if (!msg.from.endsWith('@c.us')) {
        return;
    }
    
    // Não processar as próprias mensagens que o bot envia
    if (msg.fromMe) {
        return;
    }

    const chat = await msg.getChat();

    // Lógica da Saudação Inicial
    if (!saudacaoEnviada[msg.from]) {
        saudacaoEnviada[msg.from] = true;
        
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, '👋 Olá! Seja bem-vindo(a) à nossa loja! \n Digite o número do setor que deseja ajuda:  \n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas \n \n Digite Menu para ver o menu novamente.');
        // Não encaminhamos a primeira mensagem, apenas o menu de opções
        return;
    }

    const mensagemCliente = msg.body;

    if (mensagemCliente === '1') {
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Certo! Sua mensagem foi encaminhada para o setor de pedidos. Por favor, aguarde que um atendente irá responder. 📝');
        
        // ADICIONADO: Encaminha a mensagem do cliente para o atendente
        await msg.forward(NUMERO_ATENDENTE);
        console.log(`Mensagem de ${msg.from} encaminhada para o atendente.`);
    }

    if (mensagemCliente === '2') {
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Ok! Sua mensagem foi encaminhada para o setor de farmácia. Por favor, aguarde. 💊');

        // ADICIONADO: Encaminha a mensagem do cliente para o atendente
        await msg.forward(NUMERO_ATENDENTE);
        console.log(`Mensagem de ${msg.from} encaminhada para o atendente.`);
    }
    
    if (mensagemCliente === '3') {
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Beleza! Sua mensagem foi encaminhada para o setor de pesca. Por favor, aguarde. 🎣');
        
        // ADICIONADO: Encaminha a mensagem do cliente para o atendente
        await msg.forward(NUMERO_ATENDENTE);
        console.log(`Mensagem de ${msg.from} encaminhada para o atendente.`);
    }

    if (mensagemCliente === '4') {
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Entendido! Sua mensagem foi encaminhada para o setor de rações. Por favor, aguarde. 🐾');

        // ADICIONADO: Encaminha a mensagem do cliente para o atendente
        await msg.forward(NUMERO_ATENDENTE);
        console.log(`Mensagem de ${msg.from} encaminhada para o atendente.`);
    }

    if (mensagemCliente === '5') {
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Certo! Sua mensagem foi encaminhada para o setor de produtos pet. Por favor, aguarde. 🐶🐱');

        // ADICIONADO: Encaminha a mensagem do cliente para o atendente
        await msg.forward(NUMERO_ATENDENTE);
        console.log(`Mensagem de ${msg.from} encaminhada para o atendente.`);
    }

    if (mensagemCliente === '6') {
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, 'Certo! Sua mensagem foi encaminhada para o setor de ferramentas. Por favor, aguarde. 🧰');

        // ADICIONADO: Encaminha a mensagem do cliente para o atendente
        await msg.forward(NUMERO_ATENDENTE);
        console.log(`Mensagem de ${msg.from} encaminhada para o atendente.`);
    }

    if (mensagemCliente.toLowerCase() === "menu") {
        await msg.reply("📋 Aqui está o menu novamente:\n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas");
    }
});