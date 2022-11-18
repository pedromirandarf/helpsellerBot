const { Client, LocalAuth, MessageMedia, List, Location } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
extended: true
}));
app.use(fileUpload({
debug: true
}));
app.use("/", express.static(__dirname + "/"))

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-zdg' }),
  puppeteer: { headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ] }
});

client.initialize();

io.on('connection', function(socket) {
  socket.emit('message', '© BOT-ZDG - Iniciado');
  socket.emit('qr', './icon.svg');

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', '© BOT-ZDG QRCode recebido, aponte a câmera  seu celular!');
    });
});

client.on('ready', () => {
    socket.emit('ready', '© BOT-ZDG Dispositivo pronto!');
    socket.emit('message', '© BOT-ZDG Dispositivo pronto!');
    socket.emit('qr', './check.svg')	
    console.log('© BOT-ZDG Dispositivo pronto');
});

client.on('authenticated', () => {
    socket.emit('authenticated', '© BOT-ZDG Autenticado!');
    socket.emit('message', '© BOT-ZDG Autenticado!');
    console.log('© BOT-ZDG Autenticado');
});

client.on('auth_failure', function() {
    socket.emit('message', '© BOT-ZDG Falha na autenticação, reiniciando...');
    console.error('© BOT-ZDG Falha na autenticação');
});

client.on('change_state', state => {
  console.log('© BOT-ZDG Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
  socket.emit('message', '© BOT-ZDG Cliente desconectado!');
  console.log('© BOT-ZDG Cliente desconectado', reason);
  client.initialize();
});
});

// Send message
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = req.body.number;
  const numberDDD = number.substr(0, 2);
  const numberUser = number.substr(-8, 8);
  const message = req.body.message;

  if (numberDDD <= 30) {
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Mensagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Mensagem não enviada',
      response: err.text
    });
    });
  }
  else if (numberDDD > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Mensagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Mensagem não enviada',
      response: err.text
    });
    });
  }
});


// Send media
// app.post('/send-media', async (req, res) => {
//   const number = req.body.number;
//   const numberDDD = number.substr(0, 2);
//   const numberUser = number.substr(-8, 8);
//   const caption = req.body.caption;
//   const fileUrl = req.body.file;

//   let mimetype;
//   const attachment = await axios.get(fileUrl, {
//     responseType: 'arraybuffer'
//   }).then(response => {
//     mimetype = response.headers['content-type'];
//     return response.data.toString('base64');
//   });

//   const media = new MessageMedia(mimetype, attachment, 'Media');

//   if (numberDDD <= 30) {
//     const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
//     client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
//     res.status(200).json({
//       status: true,
//       message: 'BOT-ZDG Imagem enviada',
//       response: response
//     });
//     }).catch(err => {
//     res.status(500).json({
//       status: false,
//       message: 'BOT-ZDG Imagem não enviada',
//       response: err.text
//     });
//     });
//   }

//   else if (numberDDD > 30) {
//     const numberZDG = "55" + numberDDD + numberUser + "@c.us";
//     client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
//     res.status(200).json({
//       status: true,
//       message: 'BOT-ZDG Imagem enviada',
//       response: response
//     });
//     }).catch(err => {
//     res.status(500).json({
//       status: false,
//       message: 'BOT-ZDG Imagem não enviada',
//       response: err.text
//     });
//     });
//   }
// });


client.on('message', async msg => {

  if(msg.body == null){
    console.log("Erro: Mensagem Vazia");
  }

  msgReceived = msg.body;
  msgReceived = msgReceived.toLowerCase();
  if(msgReceived === "1"){
    let feedback = "🥹 Ficamos muito felizes com a sua mensagem! \r\n Segue abaixo um pouco sobre nós: \r\n 📈 Somos uma empresa de implatação e aceleração da seu marketplace ou ecommerce! Temos a expertise de trabalhar com mais de 15 clientes simultaneamente, impulsionando resultados, vendas e muito mais!"
    client.sendMessage(msg.from, feedback);
  }else if(msgReceived ==="2"){
    let feedback = "Segue abaixo alguns de nossos melhores casos: \r\n \r\n *LilaVivaz*: Uma loja de roupas e acessórios femininos \r\n https://lilavivaz.com.br/  \r\n \r\n *Diogo de Souza Advocacia*: Advocacia para Servidores Públicos \r\n https://diogodesouzaadvocacia.com.br/  \r\n \r\n *Instituto Jeane Andrade*: Aprenda na prática as melhores técnicas de HOF \r\n https://institutojeaneandrade.com.br/  \r\n \r\n *Dframess*: Personalize seus melhores momentos \r\n https://dframes.com.br/  \r\n \r\n" 
    client.sendMessage(msg.from, feedback);
  }else if(msgReceived === "3"){
    let feedback = "O processo de implantação do seu ecommerce começa com uma apresentação da sua empresa, quais produtos gostaria de começar a vender.. \r\n Em seguida analizamos os requisitos e montamos uma carta proposta para você, caso seja aprovada, ja damos início na construção do seu website. Quaisquer outras dúvidas entre em contato: "
    client.sendMessage(msg.from, feedback);
  }else if(msgReceived === "4"){
    const contact = await msg.getContact();
    msg.reply(`@${contact.number}` + ' seu contato já foi encaminhado para o Pedro!');
    client.sendMessage('553190697390@c.us', 'Contato WhatsApp Bot. https://wa.me/' + `${contact.number}`);
    //let feedback = "O processo de implantação do seu ecommerce começa com uma apresentação da sua empresa, quais produtos gostaria de começar a vender.. \r\n Em seguida analizamos os requisitos e montamos uma carta proposta para você, caso seja aprovada, ja damos início na construção do seu website. Quaisquer outras dúvidas entre em contato: "
    //client.sendMessage(msg.from, feedback);
  } else if(msgReceived === '5'){
    let feedback = "Para começar o seu bot, basta marcar uma conversa com o nosso consultor Pedro Miranda \r\n \r\n https://bit.ly/3fSfoiN"
    client.sendMessage(msg.from, feedback);
  }else if(msgReceived ==='6'){
    let feedback = "Para conhecer a HelpSeller visite nosso site: \r\n \r\n https://helpseller.app.br"
    client.sendMessage(msg.from, feedback);
  }else if(msgReceived === '7'){
    let feedback = "🥲🥲🥲 Unfortunatelly this option isen't working right now, please try again later."
    client.sendMessage(msg.from, feedback);
  }else if(msgReceived === '8'){
    let feedback = "🥲🥲🥲 Desafortunadamente esta opción no funciona en este momento, inténtalo de nuevo más tarde"
    client.sendMessage(msg.from, feedback);
  }
  
  
  else if (msgReceived === 'list') {
    let sections = [{title:'Title seção',rows:[{title:'Item 1 da Lista', description: 'Descrição'},{title:'Item 2 da Lista', description: 'Descrição'},{title:'Item 3 da Lista', description: 'Descrição 3'}]}];
    let list = new List('Corpo da Lista','botão da lista',sections,'Título da Lista','Roda-pé da Lista');
    client.sendMessage(msg.from, list);
    let mensagemErro = "Infelizmente a lista não funciona em aplicativos mobile."
    client.sendMessage(msg.from, mensagemErro);
  }
  else if (msgReceived === 'location') {
    msg.reply(new Location(37.422, -122.084, 'ZAP das Galáxias\nZDG'));
  }
  // else if (msgReceived === 'media') {
  //   const media = MessageMedia.fromFilePath('./images/1.jpeg');
  //   client.sendMessage(msg.from, media, {caption: 'oi'});
  // }   
  // else if (msgReceived === 'media2') {
  //   const media = MessageMedia.fromFilePath('./5511968013807@c.us.ogg');
  //   client.sendMessage(msg.from, media);
  // } else if (msgReceived === 'media2') {
  //   const media = MessageMedia.fromFilePath('./5511968013807@c.us.ogg');
  //   client.sendMessage(msg.from, media);
  // } 
  
  
  
  else{
    msg.reply("😁 Olá, tudo bem? Como vai você? Escolha uma das opções abaixo para iniciarmos a nossa conversa: \r\n\r\n*1*- Quero saber mais sobre a *HelpSeller!* \r\n*2*- Gostaria de conhecer alguns estudos de caso. \r\n*3*- Como funciona o processo de implantação do meu ecommerce? \r\n*4*- Gostaria de falar com o Pedro, mas obrigado por tentar me ajudar. \r\n*5*- Quero o meu BOT de WhatsApp!.\r\n*6*- Quero conhecer todo o conteúdo da HelpSeller. \r\n*7*- In *ENGLISH* please! \r\n*8*- En *ESPAÑOL* por favor.");
  }

});

    
server.listen(port, function() {
        console.log('App running on *: ' + port);
});
