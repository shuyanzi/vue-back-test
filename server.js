let http = require('http')
let users = [
  {id: 1,name: 'da'},
  {id: 2,name: '2da'},
]
let server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.url === '/api/users') {
    res.end(JSON.stringify(users))
  } else {
    res.end('not found')
  }
})
server.listen(3000, () => {
  console.log('listen 3000')
})