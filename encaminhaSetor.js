const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const client = new Client({
    puppeteer: {
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    }
});

// --- CONFIGURAÇÕES ---
// ADICIONE AQUI O NÚMERO DO SEGUNDO WHATSAPP (O DO ATENDENTE)
// Formato: 55 + DDD + NÚMERO + @c.us
const NUMERO_ATENDENTE = '5516996234322@c.us'; // !!! SUBSTITUA PELO NÚMERO CORRETO !!!

// Mapa que traduz a opção do cliente para o nome do setor
const MAPA_SETORES = {
    '1': 'Pedidos',
    '2': 'Farmácia',
    '3': 'Pesca',
    '4': 'Ração',
    '5': 'Pet',
    '6': 'Ferramentas'
};
// --------------------

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
    // Ignorar mensagens de grupos e as próprias mensagens do bot
    if (!msg.from.endsWith('@c.us') || msg.fromMe) {
        return;
    }

    const chat = await msg.getChat();
    const mensagemCliente = msg.body.trim().toLowerCase();

    // Lógica da Saudação Inicial (apenas para a primeira mensagem)
    if (!saudacaoEnviada[msg.from]) {
        saudacaoEnviada[msg.from] = true;
        
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, '👋 Olá! Seja bem-vindo(a) à nossa loja! \n Digite o número do setor que deseja ajuda:  \n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas \n \n Digite Menu para ver o menu novamente.');
        return;
    }

    // --- LÓGICA DE ENCAMINHAMENTO E NOTIFICAÇÃO ---
    // Verifica se a mensagem do cliente é uma das opções do mapa (1 a 6)
    if (MAPA_SETORES[mensagemCliente]) {
        
        const nomeSetor = MAPA_SETORES[mensagemCliente];

        // 1. Responde ao cliente
        await chat.sendStateTyping();
        await delay(1500);
        await client.sendMessage(msg.from, `Certo! Sua solicitação para o setor de *${nomeSetor}* foi encaminhada. Por favor, aguarde que um atendente irá responder. 📝`);

        // 2. Encaminha a mensagem original do cliente para o atendente
        await msg.forward(NUMERO_ATENDENTE);

        // 3. Envia uma mensagem de resumo para o atendente
        const clienteInfo = await msg.getContact();
        const nomeCliente = clienteInfo.pushname || "Nome não salvo";
        const numeroCliente = msg.from.replace('@c.us', '');

        const textoNotificacao = `*🔔 Nova Solicitação de Atendimento 🔔*

*Cliente:* ${nomeCliente}
*Contato:* ${numeroCliente}
*Setor Solicitado:* ${nomeSetor}`;

        await client.sendMessage(NUMERO_ATENDENTE, textoNotificacao);

        console.log(`Solicitação de ${nomeCliente} para o setor ${nomeSetor} encaminhada ao atendente.`);
    
    } else if (mensagemCliente === "menu") {
        await msg.reply("📋 Aqui está o menu novamente:\n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas");
    }
});