const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const client = new Client({ puppeteer: { executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' } });

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

let aguardandoNome = {};
let aguardandoPerguntas = {};

client.on('message', async (msg) => {
    const chat = await msg.getChat();

    // Verificar se a mensagem não é de um grupo e se o remetente é um usuário individual
    if (!msg.from.endsWith('@c.us')) {
        return; // Ignorar mensagens de grupos
    }

    if (!aguardandoNome[msg.from] && !aguardandoPerguntas[msg.from]) {
        aguardandoNome[msg.from] = true;
        await chat.sendStateTyping();
        await delay(5000);
        await client.sendMessage(msg.from, 'Olá, como é o seu nome?');
    } else if (aguardandoNome[msg.from]) {
        delete aguardandoNome[msg.from];
        aguardandoPerguntas[msg.from] = 1;
        await delay(5000);
        const nome = msg.body;
        await client.sendMessage(msg.from, `Parece interessante, ${nome}! Vamos continuar?`);
        await delay(3000);
        await client.sendMessage(msg.from, 'Pergunta 1: Qual é a sua idade?');
    } else if (aguardandoPerguntas[msg.from] === 1) {
        aguardandoPerguntas[msg.from] = 2;
        const idade = msg.body;
        await client.sendMessage(msg.from, `Legal! Você tem ${idade} anos. Agora, a pergunta 2: O que você gosta de fazer nas horas livres?`);
    } else if (aguardandoPerguntas[msg.from] === 2) {
        aguardandoPerguntas[msg.from] = 3;
        const hobby = msg.body;
        await client.sendMessage(msg.from, `Interessante! Você gosta de ${hobby}. Última pergunta: Qual é o seu prato de comida favorito?`);
    } else if (aguardandoPerguntas[msg.from] === 3) {
        delete aguardandoPerguntas[msg.from];
        const comidaFavorita = msg.body;
        await client.sendMessage(msg.from, `Muito obrigado pelas respostas, ${comidaFavorita} deve ser delicioso! Agora, vou enviar algumas imagens para você.`);
        
        const img1 = MessageMedia.fromFilePath('./fluxo.png');
        const img2 = MessageMedia.fromFilePath('./fluxo1.png');
        
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, img1);
        await delay(3000);
        await client.sendMessage(msg.from, img2);

        await client.sendMessage(msg.from, 'Espero que tenha gostado das imagens! A nossa conversa terminou por aqui. Se precisar de algo mais, é só me falar. Tenha um ótimo dia!');
    } else {

    return;
    
    }
});
