var cron = require('node-cron');
const axios = require('axios')
const spaceflightnewsUrl = 'https://api.spaceflightnewsapi.net/v3'
const Article = require('../models/article')

let task = cron.schedule('0 9 * * *', async () => {

    const articles = await Article.find({ createdInternally: false })
    let articlesInDatabaseCount = articles.length
    let response = await axios.get(spaceflightnewsUrl + `/articles/count`)
    let articlesInApiCount = response.data
    let missingArticleCount = articlesInApiCount - articlesInDatabaseCount
    if (missingArticleCount == 0) return
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
    }

}, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
});

module.exports = task