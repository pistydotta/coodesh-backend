const express = require('express')
const router = express.Router()
const article = require('./article')

router.get('/', (req, res) => {
    res.send({message: "Fullstack Challenge 2021 🏅 - Space Flight News", statusCode: 200})
})

router.use([
    article
])

module.exports = router