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

// Armazenar estado do cliente: chatId -> setor escolhido
const clientesSetor = {};

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp conectado!');
});

client.on('message', msg => {
  const chatId = msg.from;
  const texto = msg.body.trim();

  if (setores[texto]) {
    // Salvar setor escolhido
    clientesSetor[chatId] = setores[texto];
    msg.reply(`Ok, vou encaminhar você para o setor de *${setores[texto]}*. Aguarde um momento.`);
    // Aqui você poderia notificar o atendente do setor, ex:
    console.log(`Cliente ${chatId} direcionado para o setor: ${setores[texto]}`);
  } else if (texto === '0') {
    // Voltar ao menu inicial
    delete clientesSetor[chatId];
    msg.reply(
      `Menu principal:\n` +
      `1️⃣ Fazer Pedido\n` +
      `2️⃣ Farmácia\n` +
      `3️⃣ Pesca\n` +
      `4️⃣ Ração\n` +
      `5️⃣ Pet\n` +
      `6️⃣ Ferramentas`
    );
  } else {
    if (clientesSetor[chatId]) {
      // Cliente já escolheu setor - encaminhar mensagem para atendente
      const setor = clientesSetor[chatId];
      msg.reply(`Sua mensagem foi enviada ao setor de *${setor}*. Um atendente responderá em breve.`);
      // Aqui: código para enviar a mensagem para o atendente do setor (ex: via webhook, API, banco)
      console.log(`Mensagem do cliente ${chatId} para setor ${setor}: ${texto}`);
    } else {
      // Mensagem inicial ou inválida
      msg.reply(
        `Bom dia! Como posso ajudar? \n Escolha o setor desejado:\n\n` +
        `1️⃣ Fazer Pedido\n` +
        `2️⃣ Farmácia\n` +
        `3️⃣ Pesca\n` +
        `4️⃣ Ração\n` +
        `5️⃣ Pet\n` +
        `6️⃣ Ferramentas\n\n` +
        `Digite 0 para voltar ao menu a qualquer momento.`
      );
    }
  }
});

client.initialize();
