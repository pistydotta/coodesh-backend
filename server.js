require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')


app.use(bodyParser.json());

const routes = require('./routes/index')
app.use(routes)

require('./config/db_connect.js')
const task = require('./config/cron_task')
task.start()

app.listen(port, () => {
    console.log('app listening on port: ' + port)
})