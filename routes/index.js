'use strict'
const express = require('express')
const methodOverride = require('method-override')
const router = new express.Router()
const controller = require('../controllers/controller')

router.use(methodOverride('_method'))

router.get('/', controller.test)

router.get('/enquetes', controller.getEnqs)

router.post('/enquetes', controller.createEnq)

router.get('/enquetes/:id', controller.getEnq)

router.delete('/enquetes/:id', controller.removeEnq)

router.put('/enquetes/:id', controller.putEnq)

router.post('/enquetes/:id/question', controller.addQst)

router.put('/enquetes/:id/question/:idqst', controller.putQst)

router.delete('/enquetes/:id/question/:idqst', controller.removeQst)

router.post('/enquetes/:id/resultats', controller.addRes)

router.get('/enquetes/:id/resultats', controller.getRes)

module.exports = router
