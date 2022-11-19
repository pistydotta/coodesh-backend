const express = require('express')
const router = express.Router()
const { create } = require('../controller/article')
const axios = require('axios')

router.get('/article', create)



module.exports = router