'use strict'
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const nunjucks = require('nunjucks')

const app = express()

const indexRouter = require('./routes/index')

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

app.use((req, res, next) => {
    next(createError(404))
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    res.locals.message = err.message
    res.status(err.status)
    res.render('error.njk', {
        layout: 'layout.njk',
        title: 'Erreur',
    })
})

module.exports = app
