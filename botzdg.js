const { Client, LocalAuth, MessageMedia,Buttons, List, Location } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');
const { title } = require('process');
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
app.post('/send-media', async (req, res) => {
  const number = req.body.number;
  const numberDDD = number.substr(0, 2);
  const numberUser = number.substr(-8, 8);
  const caption = req.body.caption;
  const fileUrl = req.body.file;

  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  if (numberDDD <= 30) {
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Imagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Imagem não enviada',
      response: err.text
    });
    });
  }

  else if (numberDDD > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Imagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Imagem não enviada',
      response: err.text
    });
    });
  }
});

var previousMessage;
client.on('message', async msg => {

  if(msg.body == null){
    console.log("Erro: Mensagem Vazia");
  }
  console.log(msg.notifyName);
  const msgSender = await  msg.getContact();

  msgReceived = msg.body;
  console.log(msg.body);
  //console.log(msgSender.pushname);
  //console.log(previousMessage);
  //msgReceived = msgReceived.toLowerCase();
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
  } else if (msgReceived === 'list') {
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
  
  else if(msgReceived === 'Sim, eu sou'){
    let sections = [{title:'Ótimo! Vamos prosseguir!',rows:[{title:'1 - Gerente de Conta'},{title:'2 - Criativo'},{title:'3 - Desenvolvimento'},{title:'4 - Financeiro'},{title:'5 - Ouvidoria'}]}];
    let list = new List('Selecione a opção desejada:','Opções',sections,'Ótimo! Vamos prosseguir!','Roda-pé da Lista');
    //let button2 = new Buttons('*Selecione a opção desejada:*  \r\n ',[{body:'1 - Gerente de Conta'},{body:'2 - Criativo'},{body:'3 - Desenvolvimento'},{body:'4 - Financeiro'},{body:'5 - Ouvidoria'}],'Ótimo! Vamos prosseguir!', 'Por favor use os botões para nevegar conosco!');
    client.sendMessage(msg.from, list);
    previousMessage = "start-sim";
  }else if(msgReceived === "1 - Gerente de Conta"){
    let feedback = "Perfeito "+ msgSender.pushname +", acesse o link www.helpseller.com.br/customersuccess  e agende um horário com o seu Gerente de Conta ou envie a sua solicitação através do email cs@helpseller.com.br";
    previousMessage = "start-sim-1";
    client.sendMessage(msg.from, feedback);
    
  }else if(msgReceived === "2 - Criativo"){
    //msgSender.pushname
    let feedback = msgSender.pushname +", acesse o link www.helpseller.com.br/criativo e agende um horário com um de nossos especialistas ou envie a sua solicitação através do email criativo@helpseller.app.br";
    previousMessage = "start-sim-2";
    client.sendMessage(msg.from, feedback);
    
  }else if(msgReceived === "3 - Desenvolvimento"){
    //msgSender.pushname
    let feedback = msgSender.pushname +", nossos chamados referentes a desenvolvimentos de API’s, Plataformas Web, Lojas Virtuais e Landing Pages são tratados apenas através do email desenvolvimento@helpseller.app.br";
    previousMessage = "start-sim-3";
    client.sendMessage(msg.from, feedback);
    
  }else if(msgReceived === "4 - Financeiro"){
    //msgSender.pushname
    let feedback = "Ótimo " +msgSender.pushname +",realize a abertura do seu chamado enviando um email para financeiro@helpseller.com.br";
    previousMessage = "start-sim-4";
    client.sendMessage(msg.from, feedback);
    
  }else if(msgReceived === "5 - Ouvidoria"){
    //msgSender.pushname
    let feedback = "Ótimo " +msgSender.pushname +", gostaríamos de entender melhor o que houver, deixe sua mensagem e entraremos em contato em até 24hrs.";
    previousMessage = "start-sim-5";
    client.sendMessage(msg.from, feedback);
    
  }else if(msgReceived === "Site" || msgReceived === "site" || msgReceived === "SITE"){
    //msgSender.pushname
    let feedback = "Acesse www.helpseller.com.br e saiba como podemos contribuir com o crescimento da sua empresa.";
    previousMessage = "site";
    client.sendMessage(msg.from, feedback);
    
  }else if(msgReceived === "Não, ainda não"){
    let feedback = "Agende um horário com um de nossos consultores ou digite *SITE* para acessar ao site.";
    previousMessage = "start-nao";
    client.sendMessage(msg.from, feedback);
    
  }else{
    msg.reply("Olá "+ msgSender.pushname +"! Tudo bem? Meu nome é HelpABit e irei te atender! 🤖" );
    let button = new Buttons('*Já é nosso cliente?*',[{body:'Sim, eu sou'},{body:'Não, ainda não'}],'Iniciando seu atendimento!', 'Por favor use os botões para nevegar conosco!');
      previousMessage = "start";
      client.sendMessage(msg.from, button);
      
  }

});

    
server.listen(port, function() {
        console.log('App running on *: ' + port);
        
});
