const express = require('express')
const router = express.Router()
const { create, getAll, getById, populateDatabase, update, deleteArticle, checkForNewArticles } = require('../controller/article')
const axios = require('axios')


router.get('/articles', getAll)
router.get('/articles/:id', getById)
router.post('/articles', create)
router.put('/articles/:id', update)
router.delete('/articles/:id', deleteArticle)
router.post('/populateDatabase', populateDatabase)
router.post('/checkForNewArticles', checkForNewArticles)

module.exports = router