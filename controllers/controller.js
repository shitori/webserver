'use strict'
const model = require('../models/model')

module.exports = {
    test(req, res) {
        res.redirect('/enquetes')
    },
    getEnqs(req, res) {
        model.getAllEnq((err, enqs) => {
            const data = {
                layout: 'layout.njk',
                title: 'Accueil',
                enqs
            }
            /* istanbul ignore next */
            if (err) {
                data['err'] = err
            }
            /* istanbul ignore next */
            if (req.query.message) {
                data['message'] = req.query.message
            }
            /* istanbul ignore next */
            if (req.query.error) {
                data['error'] = req.query.error
            }
            /* istanbul ignore next */
            if (req.query.show) {
                data['show'] = req.query.show
            }
            res.render('index.njk', data)
        })
    },
    getEnq(req, res) {
        model.getEnq(req.params.id, (err, enq) => {
            if (err) {
                res.redirect('/enquetes?error=' + err)
            } else {
                const data = {
                    layout: 'layout.njk',
                }
                /* istanbul ignore next */
                if (req.query.message) {
                    data['message'] = req.query.message
                }
                /* istanbul ignore next */
                if (req.query.error) {
                    data['error'] = req.query.error
                }
                data['title'] = 'Enquête : ' + enq.enq.titre
                data['enq'] = enq.enq
                data['qsts'] = enq.quest
                res.render('enquete.njk', data)
            }
        })
    },
    createEnq(req, res) {
        if (req.body.titre !== '' && req.body.secret !== '' && req.body.secret === req.body.confirmSecret) {
            const enqf = {titre: req.body.titre, secret: req.body.secret, description: req.body.description}
            model.addEnq(enqf, [], (err, enq) => {
                /* istanbul ignore next */
                if (err) {
                    res.redirect('/enquetes?error=' + err)
                } else {
                    res.redirect('/enquetes/' + enq.idEnq + '?message=Enquête créer avec l\'id : ' + enq.idEnq)
                }
            })
        } else {
            res.redirect('/enquetes?error=Veuillez remplir tous les champs du formulaire&show=c')
        }
    },
    addRes(req, res) {
        const keys = Object.keys(req.body)
        const data = {res: []}
        keys.forEach(key => data.res.push({id_questions: key, resultat: req.body[key]}))
        model.addRes(req.params.id, data.res, (err, message) => {
            if (err) {
                res.redirect('/enquetes/' + req.params.id + '?error=' + err)
            } else {
                res.redirect('/enquetes/' + req.params.id + '?message=' + message)
            }
        })
    },
    addQst(req, res) {
        const data = {}
        data['secret'] = req.body.secret
        data['qst'] = {
            titre: req.body.titre,
            reponse: {
                type: req.body.reponse
            }
        }
        model.addQst(req.params.id, data.secret, data.qst, (err, message) => {
            if (err) {
                res.redirect('/enquetes/' + req.params.id + '?error=' + err)
            } else {
                res.redirect('/enquetes/' + req.params.id + '?message=' + message.message)
            }
        })
    },
    removeEnq(req, res) {
        model.removeEnq(req.params.id, req.body.secret, (err, message) => {
            if (err) {
                res.redirect('/enquetes/?error=' + err)
            } else {
                res.redirect('/enquetes/?message=' + message)
            }
        })
    },
    putEnq(req, res) {
        model.modifEnq(req.params.id, req.body.secret, req.body.titre, req.body.description, (err, message) => {
            if (err) {
                res.redirect('/enquetes/' + req.params.id + '?error=' + err)
            } else {
                res.redirect('/enquetes/' + req.params.id + '?message=' + message)
            }
        })
    },
    putQst(req, res) {
        model.modifQst(req.params.id, req.body.secret, req.params.idqst, req.body.titre, req.body.reponse, (err, message) => {
            if (err) {
                res.redirect('/enquetes/' + req.params.id + '?error=' + err)
            } else {
                res.redirect('/enquetes/' + req.params.id + '?message=' + message)
            }
        })
    },
    removeQst(req, res) {
        model.removeQst(req.params.id, req.body.secret, req.params.idqst, (err, message) => {
            if (err) {
                res.redirect('/enquetes/' + req.params.id + '?error=' + err)
            } else {
                res.redirect('/enquetes/' + req.params.id + '?message=' + message)
            }
        })
    },
    getRes(req, res) {
        model.getRes(req.params.id, (err, result) => {
            let data
            if (err) {
                data = {
                    layout: 'layout.njk',
                    title: 'Enquete introuvable',
                    error: err
                }
            } else {
                data = {
                    layout: 'layout.njk',
                    title: 'Résultats',
                    resultats: result.res,
                    questions: result.qsts,
                    enquete: result.enquete,
                    occurence: result.resnmb,
                }
            }
            res.render('resultat.njk', data)
        })
    }
}
