require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const routes = require('./routes/index')
app.use(routes)

require('./config/db_connect.js')

app.listen(port, () => {
    console.log('app listening on port: ' + port)
})