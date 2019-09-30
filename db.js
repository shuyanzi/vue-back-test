let mongoose = require('mongoose')
let conn = mongoose.createConnection('mongodb://127.0.0.1:27017/chat', {useNewUrlParser: true })
let MessageSchema = new mongoose.Schema({
  name:String,
  to:String,
  msg:String,
  createAt:{type:Date,default:Date.now}
});
let MsgCountSchema = new mongoose.Schema({
  name:String,
  msgNum:Number,
});
let MsgCount = conn.model('MsgCount',MsgCountSchema);
let Message = conn.model('Message',MessageSchema);
module.exports = { Message, MsgCount }