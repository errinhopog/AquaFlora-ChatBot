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
// Puxa a chave de API do arquivo .env
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
});

// =================================================================
// 4. VARIÁVEIS E DADOS DO BOT
// =================================================================

const delay = ms => new Promise(res => setTimeout(res, ms));
let userConversations = {}; // Armazena o estado da conversa (se já recebeu saudação)

const menuOptions = {
    '1': 'Certo! Vamos encaminhar sua solicitação para nosso setor de pedidos. 📝',
    '2': 'Ok! Vamos passar seu contato para o setor de farmácia. 💊',
    '3': 'Beleza! Vamos encaminhar você para o setor de pesca. 🎣',
    '4': 'Entendido! Vamos passar para o setor de rações. 🐾',
    '5': 'Certo! Vamos encaminhar você para o setor de produtos pet. 🐶🐱',
    '6': 'Certo! Vamos encaminhar você para o setor de ferramentas. 🧰',
};

const menuText = "👋 Olá! Seja bem-vindo(a) à Aquaflora! \nEu sou o assistente virtual. Você pode me fazer uma pergunta sobre nossos produtos ou, se preferir, digite o número do setor com o qual deseja falar: \n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas \n \nDigite *Menu* para ver as opções novamente.";
const menuReplyText = "📋 Aqui estão os setores:\n\n1️⃣- Pedidos\n2️⃣- Farmácia\n3️⃣- Pesca\n4️⃣- Ração\n5️⃣- Pet\n6️⃣- Ferramentas";


// =================================================================
// 5. FUNÇÃO PRINCIPAL DA IA
// =================================================================

async function askAI(question) {
    // ESTA É A PARTE MAIS IMPORTANTE: as instruções para a IA.
    const prompt = `
        Você é um assistente virtual da loja Aquaflora. Sua única função é responder perguntas sobre os produtos e serviços da loja.
        A Aquaflora vende produtos para: animais (ração, farmácia, acessórios pet), artigos de pesca e ferramentas em geral.
        
        REGRAS E DIRETRIZES Específicas:
        1.  **MANTENHA-SE NO TÓPICO**: Responda APENAS sobre produtos ou serviços que a Aquaflora poderia vender.
        2.  **RECUSE PERGUNTAS FORA DO ESCOPO**: Se o usuário perguntar sobre qualquer outra coisa (futebol, política, filmes, como fazer um bolo, etc.), recuse educadamente. Diga algo como: "Desculpe, só consigo responder perguntas sobre os produtos da Aquaflora."
        3.  **SEJA CONCISO**: Dê respostas curtas, diretas e úteis, formatadas para WhatsApp.
        4.  **NÃO INVENTE INFORMAÇÕES**: Se não souber o preço ou a disponibilidade de um item específico, diga que a informação precisa ser confirmada com um vendedor. Ex: "Temos ração da marca X, mas para confirmar o preço e o estoque, um de nossos vendedores irá te ajudar."
        5.  **SEJA AMIGÁVEL**: Use uma linguagem casual e amigável.

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
    if (!msg.from.endsWith('@c.us')) return; // Ignora grupos

    const chat = await msg.getChat();
    const messageBody = msg.body ? msg.body.trim() : '';
    const messageBodyLower = messageBody.toLowerCase();

    // Envia a saudação inicial se for o primeiro contato
    if (!userConversations[msg.from]) {
        userConversations[msg.from] = { greeted: true };
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, menuText);
        return;
    }

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

    // SE NÃO FOR NENHUM COMANDO DE MENU, ENVIA PARA A IA
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