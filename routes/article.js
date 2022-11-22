const express = require('express')
const router = express.Router()
const { create, getAll, getById, populateDatabase, update, deleteArticle, checkForNewArticles, searchByTitle } = require('../controller/article')
const axios = require('axios')


router.get('/articles', getAll)
router.get('/articles/:id', getById)
router.get('/searchArticles', searchByTitle)
router.post('/articles', create)
router.put('/articles/:id', update)
router.delete('/articles/:id', deleteArticle)
router.post('/populateDatabase', populateDatabase)
router.post('/checkForNewArticles', checkForNewArticles)

module.exports = router