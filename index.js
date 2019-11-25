const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const fs = require('fs')

app.get('/', (req, res) => {
  fs.readFile('index.html', 'utf8', (err, html) => {
    if (err) res.send(err)
    else {
      fs.readFile('content.txt', 'utf8', (err, content) => {
        if (err) res.send(err)
        else {
          data = content
          // la respuesta no incluye un retorno para evitar que la comunicación sea cerrada (?)
          res.send(html)
        }
      })
    }
  })

  // se ejecuta cuando un usuario se conecta
  io.on('connection', (socket) => {
    // enviar contenido inicial al momento que se ha conectado al servidor
    io.emit('edit', {token: 'serverToken', text: data})

    // al momento que usuario se desconecta se almacena el contenido que ha estado guardado en memoria
    socket.on('disconnect', () => {
      if (data) {
        fs.writeFile('content.txt', data, (err) => {
          if (err) console.log(err)
        })
      }
    })

    // al recibir cambios emitirlos a todas las conexiones existentes (excepto la original que será filtrada por el lado del cliente)
    socket.on('edit', (msg) => {
      data = msg.text
      io.emit('edit', msg)
    })
  })
})

const PORT = 3000

http.listen(PORT, () => {
  console.log(`Live editor listening on: http://127.0.0.1:${PORT}`)
})