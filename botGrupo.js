const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const client = new Client({
    puppeteer: {
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    }
});

// --- CONFIGURAÇÕES ---
// COLE AQUI O ID DO SEU GRUPO DE ATENDIMENTO QUE VOCÊ PEGOU NO PASSO 1
const ID_GRUPO_ATENDENTES = '120363419252872295@g.us'; // !!! SUBSTITUA PELO ID CORRETO !!!

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
    // --- FILTRO DE SEGURANÇA ---
    // A condição principal: O bot SÓ reage a mensagens de conversas privadas (@c.us)
    // Se a mensagem vier de um grupo (@g.us), ele ignora e a função termina aqui.
    if (!msg.from.endsWith('@c.us')) {
        return;
    }
    
    // Ignora as próprias mensagens do bot
    if (msg.fromMe) {
        return;
    }

    const chat = await msg.getChat();
    const mensagemCliente = msg.body.trim().toLowerCase();

    // Lógica da Saudação Inicial (só em conversa privada)
    if (!saudacaoEnviada[msg.from]) {
        saudacaoEnviada[msg.from] = true;
        await chat.sendStateTyping();
        await delay(2500);
        await client.sendMessage(msg.from, '👋 Olá! Seja bem-vindo(a) à nossa loja! \n Digite o número do setor que deseja ajuda:  \n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas \n \n Digite Menu para ver o menu novamente.');
        return;
    }

    if (MAPA_SETORES[mensagemCliente]) {
        const nomeSetor = MAPA_SETORES[mensagemCliente];
        
        // 1. Responde ao cliente na conversa privada
        await chat.sendStateTyping();
        await delay(1500);
        await client.sendMessage(msg.from, `Certo! Sua solicitação para o setor de *${nomeSetor}* foi recebida. Um de nossos atendentes irá te responder aqui mesmo nesta conversa em breve. 📝`);

        // 2. Prepara e envia a notificação para o GRUPO DE ATENDIMENTO ESPECÍFICO
        const clienteInfo = await msg.getContact();
        const nomeCliente = clienteInfo.pushname || "Nome não salvo";
        const numeroCliente = msg.from.replace('@c.us', '');

        const textoNotificacao = `*🔔 Novo Atendimento na Fila 🔔*

*Cliente:* ${nomeCliente}
*Contato:* wa.me/${numeroCliente}
*Setor:* ${nomeSetor}

Um atendente do setor de *${nomeSetor}* por favor, assuma a conversa com o cliente.`;

        // O bot envia a mensagem para o ID do grupo que você configurou
        await client.sendMessage(ID_GRUPO_ATENDENTES, textoNotificacao);
        
        console.log(`Notificação para o grupo sobre o cliente ${nomeCliente} (Setor: ${nomeSetor}).`);
    
    } else if (mensagemCliente === "menu") {
        await msg.reply("📋 Aqui está o menu novamente:\n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas");
    }
});