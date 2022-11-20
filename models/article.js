const mongoose = require('mongoose')
const Schema = mongoose.Schema

let ArticleSchema = new Schema({
    externalId: Number,
    title: String,
    url: String,
    imageUrl: String,
    newsSite: String,
    summary: String,
    publishedAt: String,
    updatedAt: String,
    featured: Boolean,
    launches: [{id: String, provider: String}],
    events: [{id: Number, provider: String}],
	deleted: Boolean,
    createdInternally: Boolean
})

module.exports = mongoose.model('Article', ArticleSchema)