// let http = require('http')
let users = [
  {id: 11,name: 'da'},
  {id: 22,name: '2da'},
  {id: 33,name: '23da'},
]
// let server = http.createServer((req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   if (req.url === '/api/users') {
//     res.end(JSON.stringify(users))
//   } else {
//     res.end('not found')
//   }
// })
// server.listen(3000, () => {
//   console.log('listen 3000')
// })
var express = require('express')
var app = express();
var path = require('path')
let { Message, MsgCount } = require('./db')
var http = require('http').createServer(app);
var io = require('socket.io')(http);
console.log(__dirname)
// app.use('/images', express.static('/Web/images'))
var dir = path.join(__dirname, 'Web/images');
app.use(express.static(dir));
app.get('/api/users', function (req, res) {
  res.end(JSON.stringify(users));
});
app.get('/customer-list', function (req, res) {
  res.sendFile(__dirname + '/Web/customers.html');
});
app.get('/chat', function (req, res) {
  res.sendFile(__dirname + '/Web/index.html');
});

// io.on('connection', function(socket){
//   console.log('a user connected');
// });
// io.on('connection', function(socket){
//   console.log('a user connected');
//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });
// });
// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     console.log('message: ' + msg);
//   });
// });
let sockets = {
  // service1: []
};
io.on('connection', function (socket) {
  io.emit('hasconnect');
  console.log('connection')
  socket.on('getAllMessages', async function () {
    let messages = await Message.find({}).sort({ createAt: -1 }).limit(10);
    messages.reverse();
    socket.emit('allMessages', messages);
  });
  socket.on('getMessages', async function (name) {
    console.log('name', name)
    let messages = await Message.find({ $or: [{ name, to: 'service' }, { to: name, name: 'service' }] }).sort({ createAt: -1 });
    messages.reverse();
    socket.emit('myMessages', messages);
  });
  socket.on('getAllMsgCount', async function () {
    let msgCount = await MsgCount.find();
    socket.emit('allMsgCount', msgCount);
  });
  socket.on('chatmessage', async function (content) {
    console.log('=>', content)
    if (content.to === 'service') {
      let msgNumList = await MsgCount.find({ name: content.name })
      let msgNum = 1
      if (msgNumList.length) {
        await MsgCount.deleteOne({ name: content.name })
        msgNum += msgNumList[0].msgNum
        console.log('msgNumList----------------------------------', msgNumList[0].name)
        console.log('msgNumList----------------------------------', msgNumList[0].msgNum)
      }
      let saveMsgCount = await MsgCount.create({
        name: content.name,
        msgNum,
      })
      io.emit('msgcount', saveMsgCount);
    }
    let savedMsg = await Message.create(content)
    console.log('savedMsg', savedMsg)
    io.emit('chatmessage', savedMsg);
    // if (content.name === 'service' && content.to && content.to === 'all') {
    //   console.log('to all')
    //   io.emit('chatmessage', content);
    //   if (!sockets[content.name]) {
    //     sockets[content.name] = socket;
    //   }
    //   return
    // }
    // if (sockets[content.name]) {
    //   console.log('second')
    //   if (content.name === 'service') {
    //     sockets[content.to].emit('chatmessage', content);
    //   }
    //   sockets[content.name].emit('chatmessage', content);
    // } else {
    //   console.log('first')
    //   sockets[content.name] = socket;
    //   io.emit('chatmessage', content);
    // }
    // socket.emit('chatmessage', content);
    // if (['service1'].includes(content.name)) {

    // } else {
    //   sockets['service1'].push({
    //     name: content.name,
    //     socket: socket
    //   })
    // }
    // if (content.name === 'service1') {
    //   sockets[content.name].emit('chatmessage', content);
    // } else {
    //   if (sockets[content.name]) {
    //     console.log('second', content.name)
    //     sockets[content.name].emit('chatmessage', content);
    //     socket.emit('chatmessage', content);
    //   } else {
    //     console.log('first', content.name)
    //     sockets[content.name] = socket;
    //     sockets[content.name].emit('chatmessage', content);
    //     socket.emit('chatmessage', content);
    //   }
    // }
  });
  socket.on('read', async function (name) {
    let msgNumList = await MsgCount.find({ name })
    if (msgNumList.length) {
      await MsgCount.deleteOne({ name })
    }
    await MsgCount.create({
      name: name,
      msgNum: 0,
    })
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});