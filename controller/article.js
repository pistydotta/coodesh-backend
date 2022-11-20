const Article = require('../models/article')
const url = require('url');
const axios = require('axios')
const spaceflightnewsUrl = 'https://api.spaceflightnewsapi.net/v3'

module.exports = {

    create: async (req, res) => {
        const { id, title, url, imageUrl, newsSite, summary, publishedAt, updatedAt, featured, launches, events } = req.body
        const articleAlreadyExists = await Article.findOne({externalId: id})
        if (articleAlreadyExists) return res.send({message: "Já existe um artigo com esse id no banco de dados", statusCode: 500})
        const article = await Article.create({
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
            createdInternally: true
        })
        res.send({article, statusCode: 201})
    },

    getAll: async (req, res) => {

        try {

            const queryObject = url.parse(req.url, true).query;
            const articles = await Article.find({ deleted: false }).limit(queryObject.limit).skip(queryObject.skip)
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
            res.send({ article, statusCode: 200 })

        } catch (error) {

            console.log(error)
            res.send({ statusCode: 500, message: "Erro ao processar requisição" })

        }

    },

    update: async (req, res) => {

        try {

            const article = await Article.findOne({ externalId: req.params.id })
            if (!article) return res.send({ message: "Artigo com o id fornecido não existe no banco de dados", statusCode: 500 })
            const { title, url, imageUrl, newsSite, summary, publishedAt, updatedAt, featured, launches, events } = req.body
            article.title = title
            article.url = url
            article.imageUrl = imageUrl
            article.newsSite = newsSite
            article.summary = summary
            article.publishedAt = publishedAt
            article.updatedAt = updatedAt
            article.featured = featured
            article.launches = launches
            article.events = events
            await article.save()
            res.send({article, statusCode: 200})
            
        } catch (error) {
            
            console.log(error)
            res.send({ statusCode: 500, message: "Erro ao processar requisição" })

        }
    },

    deleteArticle: async (req,res) => {

        try {

            const article = await Article.findOne({ externalId: req.params.id })
            if (!article) return res.send({ message: "Artigo com o id fornecido não existe no banco de dados", statusCode: 500 })
            if (article.deleted) return res.send({ message: "Artigo já foi excluido do banco de dados", statusCode: 500})
            article.deleted = true
            await article.save()
            res.send({article, statusCode: 200})
            
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

                } catch (error) {
                    failedArticles.push(o.id)
                }

            })
        }
        return res.send({ message: "Banco de dados populado com sucesso", statusCode: 200 })
    }


    



}