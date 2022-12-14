const Article = require('../models/article')
const url = require('url');
const axios = require('axios');
const spaceflightnewsUrl = 'https://api.spaceflightnewsapi.net/v3'
const moment = require('moment')

module.exports = {

    create: async (req, res) => {
        const { externalId, title, url, imageUrl, newsSite, summary } = req.body
        let currDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ")
        let currTimestamp = moment().unix()
        const articleAlreadyExists = await Article.findOne({ externalId })
        if (articleAlreadyExists) return res.send({ message: "Já existe um artigo com esse id no banco de dados", statusCode: 500 })
        const article = await Article.create({
            externalId,
            title,
            url,
            imageUrl,
            newsSite,
            summary,
            publishedAt: currDate,
            updatedAt: currDate,
            featured: false,
            launches: [],
            events: [],
            deleted: false,
            createdInternally: true,
            timestampUpdatedAt: currTimestamp
        })
        res.send({ article, statusCode: 201 })
    },

    getAll: async (req, res) => {

        try {

            const queryObject = url.parse(req.url, true).query;

            let sortIdx = 0
            if (queryObject.sortBy && queryObject.sortBy == 'oldest') sortIdx = 1
            else if (queryObject.sortBy && queryObject.sortBy == 'newest') sortIdx = -1

            let skip = queryObject.skip ? queryObject.skip : 0
            let limit = queryObject.limit ? queryObject.limit : 0

            const articles = await Article.find({ deleted: false }).limit(limit).skip(skip).sort({ timestampUpdatedAt: sortIdx })
            res.send({ articles, statusCode: 200 })

        } catch (error) {

            console.log(error)
            res.send({ statusCode: 500, message: "Erro ao processar requisição" })

        }

    },

    getById: async (req, res) => {

        try {

            const article = await Article.findOne({ externalId: req.params.id })
            if (!article) return res.send({ message: "Artigo com o id fornecido não existe no banco de dados", statusCode: 500 })
            if (article.deleted) return res.send({ message: "Artigo foi excluido do banco de dados", statusCode: 500 })
            res.send({ article, statusCode: 200 })

        } catch (error) {

            console.log(error)
            res.send({ statusCode: 500, message: "Erro ao processar requisição" })

        }

    },

    searchByTitle: async (req, res) => {


        try {

            const queryObject = url.parse(req.url, true).query;

            let sortIdx = 0
            if (queryObject.sortBy && queryObject.sortBy == 'oldest') sortIdx = 1
            else if (queryObject.sortBy && queryObject.sortBy == 'newest') sortIdx = -1

            let skip = queryObject.skip ? queryObject.skip : 0
            let limit = queryObject.limit ? queryObject.limit : 0
            let search = queryObject.search ? queryObject.search : ''

            const articles = await Article.find({ deleted: false, title: { $regex: search } }).limit(limit).skip(skip).sort({ timestampUpdatedAt: sortIdx })
            res.send({ articles, statusCode: 200 })

        } catch (error) {

            console.log(error)
            res.send({ statusCode: 500, message: "Erro ao processar requisição" })

        }

    },

    update: async (req, res) => {

        try {

            const article = await Article.findOne({ externalId: req.params.id })
            let currDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ")
            let currTimestamp = moment().unix()
            if (!article) return res.send({ message: "Artigo com o id fornecido não existe no banco de dados", statusCode: 500 })
            const { title, url, imageUrl, newsSite, summary } = req.body
            article.title = title
            article.url = url
            article.imageUrl = imageUrl
            article.newsSite = newsSite
            article.summary = summary
            article.updatedAt = currDate
            article.timestampUpdatedAt = currTimestamp
            await article.save()
            res.send({ article, statusCode: 200 })

        } catch (error) {

            console.log(error)
            res.send({ statusCode: 500, message: "Erro ao processar requisição" })

        }
    },

    deleteArticle: async (req, res) => {

        try {

            const article = await Article.findOne({ externalId: req.params.id })
            if (!article) return res.send({ message: "Artigo com o id fornecido não existe no banco de dados", statusCode: 500 })
            if (article.deleted) return res.send({ message: "Artigo já foi excluido do banco de dados", statusCode: 500 })
            article.deleted = true
            await article.save()
            res.send({ article, statusCode: 200 })

        } catch (error) {

            console.log(error)
            res.send({ statusCode: 500, message: "Erro ao processar requisição" })

        }

    },

    populateDatabase: async (req, res) => {

        let failedArticles = []
        let response = await axios.get(spaceflightnewsUrl + '/articles/count')
        const limit = 1000
        const articleCount = response.data

        for (let i = 0; i < articleCount; i = i + limit) {

            response = await axios.get(spaceflightnewsUrl + `/articles?_limit=${limit}&_sort=id&_start=${i}`)

            await response.data.forEach(async o => {
                try {

                    const { id, title, url, imageUrl, newsSite, summary, publishedAt, updatedAt, featured, launches, events } = o
                    let timestamp = moment(updatedAt, "YYYY-MM-DDTHH:mm:ss.SSSZ").unix()
                    Article.create({
                        externalId: id,
                        title,
                        url,
                        imageUrl,
                        newsSite,
                        summary,
                        publishedAt,
                        updatedAt,
                        featured,
                        launches,
                        events,
                        deleted: false,
                        createdInternally: false,
                        timestampUpdatedAt: timestamp
                    })

                } catch (error) {
                    failedArticles.push(o.id)
                }

            })
        }
        return res.send({ message: "Banco de dados populado com sucesso", statusCode: 200 })
    },

    checkForNewArticles: async (req, res) => {
        const articles = await Article.find({ createdInternally: false })
        let articlesInDatabaseCount = articles.length
        let response = await axios.get(spaceflightnewsUrl + `/articles/count`)
        let articlesInApiCount = response.data
        let missingArticleCount = articlesInApiCount - articlesInDatabaseCount
        if (missingArticleCount == 0) return res.send({ statusCode: 200, message: "Todos os artigos já estão no banco de dados" })
        else {
            response = await axios.get(spaceflightnewsUrl + `/articles?_sort=id&_limit=${missingArticleCount}&_start=${articlesInDatabaseCount}`)
            await response.data.forEach(o => {
                const { id, title, url, imageUrl, newsSite, summary, publishedAt, updatedAt, featured, launches, events } = o
                Article.create({
                    externalId: id,
                    title,
                    url,
                    imageUrl,
                    newsSite,
                    summary,
                    publishedAt,
                    updatedAt,
                    featured,
                    launches,
                    events,
                    deleted: false,
                    createdInternally: false
                })
            })
            return res.send({ message: `${missingArticleCount} artigos foram baixados para o banco de dados`, statusCode: 200 })
        }
    }






}