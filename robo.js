const qrcode = require('qrcode-terminal'); 
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js'); // Mudança Buttons
const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função delay

// Objeto para controlar o estado da conversa por usuário
const estados = {};

client.on('message', async msg => {
    const userId = msg.from;

    // Inicializa estado se não existir
    if (!estados[userId]) {
        estados[userId] = 'inicio';
    }

    const chat = await msg.getChat();

    // Comando inicial que abre o menu
    if (msg.body.match(/(!menubot)/i) && msg.from.endsWith('@c.us')) {
        const contact = await msg.getContact();
        const name = contact.pushname || 'Cliente';

        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);

        await client.sendMessage(userId, 'Olá! ' + name.split(" ")[0] + "🐾 Seja bem-vindo(a) à AquaFlora AgroShop! Temos tudo para seu pet, pesca, aquarismo e muito mais.");

        await delay(1500);
        await chat.sendStateTyping();
        await delay(1500);

        await client.sendMessage(userId, 'Como posso ajudar você hoje? \n \n 1 - Ver produtos \n 2 - Suporte / Dúvidas \n 3 - Horários e Localização \n 4 - Falar com um atendente');

        estados[userId] = 'aguardando_menu';
        return; // evita continuar o processamento nesta mensagem
    }

    // Fluxo de acordo com o estado atual
    switch (estados[userId]) {

        case 'inicio':
            // Caso queira que o usuário só comece com o comando !menubot, pode mandar uma mensagem aqui
            await client.sendMessage(userId, 'Por favor, digite !menubot para abrir o menu principal.');
            break;

        case 'aguardando_menu':
            if (msg.body === '1') {
                await delay(1500);
                await chat.sendStateTyping();
                await delay(1500);

                await client.sendMessage(userId, 'Aqui estão algumas categorias de produtos que temos disponíveis: \n \n 1 - Pets \n 2 - Aquarismo \n 3 - Pesca');

                estados[userId] = 'aguardando_categoria';
            } else if (msg.body === '2') {
                // Exemplo para suporte
                await client.sendMessage(userId, 'Para suporte, envie um e-mail para suporte@aquaflora.com ou aguarde um atendente.');
                estados[userId] = 'inicio'; // volta para o início ou outro estado
            } else if (msg.body === '3') {
                await client.sendMessage(userId, 'Estamos localizados na Rua Tenente Penha, 1076, Boa Esperança do Sul.');
                estados[userId] = 'inicio';
            } else if (msg.body === '4') {
                await client.sendMessage(userId, 'Um atendente entrará em contato com você em breve.');
                estados[userId] = 'inicio';
            } else {
                await client.sendMessage(userId, 'Opção inválida. Por favor, digite 1, 2, 3 ou 4.');
            }
            break;

        case 'aguardando_categoria':
            if (msg.body === '1') {
                await delay(1500);
                await chat.sendStateTyping();
                await delay(1500);

                await client.sendMessage(userId, 'Aqui estão alguns produtos para pets: \n \n 1 - Rações \n 2 - Brinquedos \n 3 - Acessórios \n 4 - Medicamentos \n 5 - Outros Produtos');

                await delay(1500);
                await chat.sendStateTyping();
                await delay(1500);
                await client.sendMessage(userId, '');

                await delay(1500);
                await chat.sendStateTyping();
                await delay(1500);
                await client.sendMessage(userId, 'Link para cadastro: https://site.com');

                estados[userId] = 'inicio'; // ou próximo estado, se quiser continuar o fluxo
            } else if (msg.body === '2') {
                await client.sendMessage(userId, 'Aqui estão alguns produtos para aquarismo...');
                estados[userId] = 'inicio';
            } else if (msg.body === '3') {
                await client.sendMessage(userId, 'Aqui estão alguns produtos para pesca...');
                estados[userId] = 'inicio';
            } else {
                await client.sendMessage(userId, 'Opção inválida. Por favor, digite 1, 2 ou 3 para escolher a categoria.');
            }
            break;

        default:
            // Se estiver em estado desconhecido, reseta
            estados[userId] = 'inicio';
            await client.sendMessage(userId, 'Algo deu errado. Por favor, digite !menubot para iniciar novamente.');
            break;
    }
});