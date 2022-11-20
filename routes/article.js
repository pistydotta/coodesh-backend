const express = require('express')
const router = express.Router()
const { create, getAll, getById, populateDatabase } = require('../controller/article')
const axios = require('axios')


router.get('/articles', getAll)
router.get('/articles/:id', getById)
router.post('/articles', create)
router.post('/populateDatabase', populateDatabase)


module.exports = router