const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

const delay = ms => new Promise(res => setTimeout(res, ms));

// Guarda o estado de cada cliente
let estadoClientes = {}; // numero: "inicio" | "aguardandoSetor" | "emAtendimento"

// Função de cumprimento dinâmico
function cumprimento() {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    return "Boa noite";
}

// Menu de setores
const menuSetores = `
No que posso ajudar?  
Digite o número do setor desejado:
1️⃣ Fazer Pedido  
2️⃣ Farmácia  
3️⃣ Pesca  
4️⃣ Ração  
5️⃣ Pet  
6️⃣ Ferramentas

Todas as opções serão encaminhadas para o setor responsável.
`;

// Respostas simples para cada setor
const respostasSetor = {
    "1": "Encaminhando para o setor *Fazer Pedido*...",
    "2": "Encaminhando para o setor *Farmácia*...",
    "3": "Encaminhando para o setor *Pesca*...",
    "4": "Encaminhando para o setor *Ração*...",
    "5": "Encaminhando para o setor *Pet*...",
    "6": "Encaminhando para o setor *Ferramentas*..."
};

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('Tudo certo! WhatsApp conectado.'));
client.initialize();

client.on('message', async msg => {
    if (!msg.from.endsWith('@c.us')) return; // Ignora grupos
    const chat = await msg.getChat();
    const numero = msg.from;

    // Se atendente humano assumir
    if (chat.isReadOnly) {
        estadoClientes[numero] = "emAtendimento";
        return;
    }

    // Se atendente humano saiu
    if (estadoClientes[numero] === "emAtendimento" && !chat.isReadOnly) {
        estadoClientes[numero] = "inicio";
    }

    // Pega nome do cliente
    const contato = await msg.getContact();
    const primeiroNome = contato.pushname ? contato.pushname.split(" ")[0] : "";

    // Estado inicial
    if (!estadoClientes[numero] || estadoClientes[numero] === "inicio") {
        if (/[a-zA-ZÀ-ÿ]/.test(msg.body)) { // Primeira mensagem com letras
            estadoClientes[numero] = "aguardandoSetor";
            await delay(500);
            await client.sendMessage(numero, `${cumprimento()}, ${primeiroNome}!\n${menuSetores}`);
            return;
        }
    }

    // Aguardando escolha de setor
    if (estadoClientes[numero] === "aguardandoSetor") {
        if (respostasSetor[msg.body]) {
            estadoClientes[numero] = "inicio"; // volta pro início depois de encaminhar
            await delay(500);
            await client.sendMessage(numero, respostasSetor[msg.body]);
        } else {
            await client.sendMessage(numero, `Por favor, selecione um dos setores digitando o número correspondente:\n${menuSetores}`);
        }
    }
});
