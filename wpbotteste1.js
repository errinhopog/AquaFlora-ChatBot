const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const client = new Client();

const setores = {
  1: 'Pedidos',
  2: 'Farmácia',
  3: 'Pesca',
  4: 'Ração',
  5: 'Pet',
  6: 'Ferramentas'
};

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp conectado!');
});

client.on('message', msg => {
  const chatId = msg.from;
  const texto = msg.body.trim();

  // Se a mensagem for um número que corresponde a algum setor
  if (setores[texto]) {
    msg.reply(`Ok, vou encaminhar você para o setor de *${setores[texto]}*. Aguarde um momento.`);
    // Aqui você pode integrar o encaminhamento real, se quiser
  } else {
    // Mensagem inicial ou inválida: enviar o menu
    msg.reply(
      `Bom dia! Como posso ajudar? \n Escolha o setor desejado:\n\n` +
      `1️⃣ Fazer Pedido\n` +
      `2️⃣ Farmácia\n` +
      `3️⃣ Pesca\n` +
      `4️⃣ Ração\n` +
      `5️⃣ Pet\n` +
      `6️⃣ Ferramentas`
    );
  }
});

client.initialize();
