// =================================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÕES INICIAIS
// =================================================================
require('dotenv').config(); // Carrega as variáveis do arquivo .env
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// =================================================================
// 2. INICIALIZAÇÃO DOS CLIENTES (WHATSAPP E IA)
// =================================================================

// Cliente do WhatsApp
const client = new Client({
    puppeteer: { 
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' 
    }
});

// Cliente da IA (Gemini)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// =================================================================
// 3. EVENTOS DE CONEXÃO DO WHATSAPP
// =================================================================

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado e IA pronta.');
    // <<< NOVO: Informa o número do admin para facilitar >>>
    console.log(`O número do admin/bot é: ${client.info.wid._serialized}`);
});

// =================================================================
// 4. VARIÁVEIS E DADOS DO BOT
// =================================================================
const delay = ms => new Promise(res => setTimeout(res, ms));
// <<< MUDANÇA: O objeto agora armazena o status da conversa >>>
let userConversations = {}; 

const menuOptions = {
    '1': 'Certo! Vamos encaminhar sua solicitação para nosso setor de pedidos. 📝',
    '2': 'Ok! Vamos passar seu contato para o setor de farmácia. 💊',
    '3': 'Beleza! Vamos encaminhar você para o setor de pesca. 🎣',
    '4': 'Entendido! Vamos passar para o setor de rações. 🐾',
    '5': 'Certo! Vamos encaminhar você para o setor de produtos pet. 🐶🐱',
    '6': 'Certo! Vamos encaminhar você para o setor de ferramentas. 🧰',
};

// <<< MUDANÇA: Adicionada a opção de chamar um atendente >>>
const menuText = "👋 Olá! Seja bem-vindo(a) à Aquaflora! \nEu sou o assistente virtual. Você pode me fazer uma pergunta sobre nossos produtos ou, se preferir, digite o número do setor com o qual deseja falar: \n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas \n\nDigite *Menu* para ver as opções novamente ou *ajuda* para falar com um atendente.";
const menuReplyText = "📋 Aqui estão os setores:\n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas";


// =================================================================
// 5. FUNÇÃO PRINCIPAL DA IA (Não mudou)
// =================================================================
async function askAI(question) {
    const prompt = `
        Você é um assistente virtual da loja Aquaflora. Sua única função é responder perguntas sobre os produtos e serviços da loja.
        A Aquaflora vende produtos para: animais (ração, farmácia, acessórios pet), artigos de pesca e ferramentas em geral.
        
        REGRAS E DIRETRIZES Específicas:
        1.  **MANTENHA-SE NO TÓPICO**: Responda APENAS sobre produtos ou serviços que a Aquaflora poderia vender.
        2.  **RECUSE PERGUNTAS FORA DO ESCOPO**: Se o usuário perguntar sobre qualquer outra coisa (futebol, política, filmes, como fazer um bolo, etc.), recuse educadamente. Diga algo como: "Desculpe, só consigo responder perguntas sobre os produtos da Aquaflora."
        3.  **SEJA CONCISO**: Dê respostas curtas, diretas e úteis, formatadas para WhatsApp.
        4.  **NÃO INVENTE INFORMAÇÕES**: Se não souber o preço ou a disponibilidade de um item específico, diga que a informação precisa ser confirmada com um vendedor. Ex: "Temos ração da marca X, mas para confirmar o preço e o estoque, um de nossos vendedores irá te ajudar."
        5.  **SEJA AMIGÁVEL**: Use uma linguagem casual e amigável.
        6.  **CHAMAR ATENDENTE**: Se o usuário pedir para falar com um humano, diga: "Entendido. Um de nossos atendentes irá te ajudar em breve." e não responda mais nada.

        Pergunta do cliente: "${question}"
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Erro na API do Gemini:", error);
        return "Ops! Tive um probleminha para processar sua pergunta. Tente novamente em alguns instantes.";
    }
}

// =================================================================
// 6. LÓGICA PRINCIPAL DE MENSAGENS DO WHATSAPP
// =================================================================

client.on('message', async (msg) => {
    // Ignora mensagens de grupo e status
    if (!msg.from.endsWith('@c.us') || msg.isStatus) return;

    const chat = await msg.getChat();
    const user = msg.from;
    const messageBody = msg.body ? msg.body.trim() : '';
    const messageBodyLower = messageBody.toLowerCase();

    // <<< NOVO: Bloco de controle do atendente humano >>>
    if (msg.fromMe) {
        if (messageBodyLower === '!voltarbot') {
            const chatName = chat.name || user;
            // Reativa o bot para o cliente
            userConversations[user] = { status: 'ACTIVE' };
            console.log(`[BOT] Bot reativado para o cliente ${chatName} pelo atendente.`);
            
            // Envia a confirmação para o próprio número do bot
            const adminNumber = client.info.wid._serialized;
            await client.sendMessage(adminNumber, `✅ Bot reativado com sucesso para o cliente: *${chatName}*`);
            
            await msg.delete(true); // Apaga o comando
        }
        return; // Ignora outras mensagens do atendente
    }

    // <<< NOVO: Verifica se o bot deve ficar em silêncio para este cliente >>>
    if (userConversations[user] && userConversations[user].status === 'HUMAN_SUPPORT') {
        return; // Bot em modo de hibernação, não faz nada.
    }
    // <<< FIM DOS NOVOS BLOCOS >>>

    // Envia a saudação inicial e define o estado como ATIVO
    if (!userConversations[user]) {
        userConversations[user] = { status: 'ACTIVE' };
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, menuText);
        return;
    }

    // <<< NOVO: Palavras-chave para chamar um atendente >>>
    const humanKeywords = ['atendente', 'humano', 'falar com humano', 'suporte', 'ajuda'];
    if (humanKeywords.some(keyword => messageBodyLower.includes(keyword))) {
        userConversations[user].status = 'HUMAN_SUPPORT'; // Pausa o bot
        console.log(`[BOT] Cliente ${user} encaminhado para atendimento humano. Bot hibernando.`);
        await chat.sendMessage("Entendido. Um de nossos atendentes irá te ajudar em breve. 📲");
        return;
    }
    // <<< FIM DO NOVO BLOCO >>>

    // Procura por uma opção de menu (ex: '1', '2', etc.)
    const menuResponse = menuOptions[messageBody];

    if (menuResponse) {
        await chat.sendStateTyping();
        await delay(1500);
        await client.sendMessage(msg.from, menuResponse);
        return;
    }
    
    // Responde ao comando 'menu'
    if (messageBodyLower === 'menu') {
        await msg.reply(menuReplyText);
        return;
    }

    // SE NÃO FOR NENHUM COMANDO, ENVIA PARA A IA
    console.log(`[IA] Recebendo pergunta de ${msg.from}: "${messageBody}"`);
    await chat.sendStateTyping();
    
    const aiResponse = await askAI(messageBody);
    
    console.log(`[IA] Enviando resposta: "${aiResponse}"`);
    await client.sendMessage(msg.from, aiResponse);
});

// =================================================================
// 7. INICIALIZAÇÃO FINAL
// =================================================================

client.initialize();