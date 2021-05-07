'use strict'
/* istanbul ignore file */
const fsPromises = require('fs').promises
const {v4: uuidv4} = require('uuid')
const {pathEnq, pathQst, pathRes} = require('../bin/pathJson')

let enquetes, questions, resultats

//tp-async-promise-then
fsPromises.readFile(pathEnq)
    .then((result) => {
        enquetes = JSON.parse(result)
    })
    .catch((error) => {
        /* istanbul ignore next */
        throw error
    })

fsPromises.readFile(pathQst)
    .then((result) => {
        questions = JSON.parse(result)
    })
    .catch((error) => {
        /* istanbul ignore next */
        throw error
    })

fsPromises.readFile(pathRes)
    .then((result) => {
        resultats = JSON.parse(result)
    })
    .catch((error) => {
        /* istanbul ignore next */
        throw error
    })

class Model {
    //tp-async-callback
    static test(cb) {
        cb(null, {e: enquetes, q: questions, r: resultats})
    }

    static getAllEnq(cb) {
        cb(null, enquetes)
    }

    static getEnq(idEnq, cb) {
        const findEnq = enquetes.find((enq) => enq.id === idEnq)
        if (findEnq === undefined || findEnq === null) {
            cb('ID de l\'enquête ' + idEnq + ' introuvable.', null)
        } else {
            const findQsts = questions.filter((qst) => qst.id_enquetes === idEnq)
            cb(null, {enq: findEnq, quest: findQsts})
        }
    }

    //tp-async-promise-async-await
    static async addEnq(enquete, Equestions, cb) {
        // eslint-disable-next-line no-prototype-builtins
        if (enquete === undefined || enquete === null || Equestions === undefined || Equestions === null || !(enquete.hasOwnProperty('secret') && enquete.hasOwnProperty('titre') && enquete.hasOwnProperty('description'))) {
            cb('Erreur dans la transmission des données de l\'enquête.', null)
        } else {
            const idenq = uuidv4()
            const listIdQst = []
            enquete = Object.assign({id: idenq}, enquete)
            enquetes.push(enquete)
            let checkQst = true
            Equestions.forEach((question) => {
                // eslint-disable-next-line no-prototype-builtins
                if (question === undefined || question === null || !(question.hasOwnProperty('titre') && question.hasOwnProperty('reponse'))) {
                    checkQst = false
                }
                const idquest = uuidv4()
                listIdQst.push(idquest)
                question = Object.assign({id: idquest, id_enquetes: idenq}, question)
                questions.push(question)
            })
            if (!checkQst) {
                enquetes = enquetes.filter(enq => enq.id !== idenq)
                questions = questions.filter(qst => qst.id_enquetes !== idenq)
                cb('Erreur dans la transmission des données des questions.', null)
            } else {
                try {
                    await fsPromises.writeFile(pathEnq, JSON.stringify(enquetes, null, 2))
                    await fsPromises.writeFile(pathQst, JSON.stringify(questions, null, 2))
                    cb(null, {idEnq: idenq, idQsts: listIdQst})
                } catch (error) {
                    /* istanbul ignore next */
                    cb(error, null)
                }
            }
        }
    }

    static async addRes(idEnq, currentRes, cb) {
        let check = true
        const majRes = []
        if (currentRes === undefined || currentRes === null) {
            cb('Erreur dans la transmission des données des résultats.', null)
        } else {
            currentRes.forEach(res => {
                // eslint-disable-next-line no-prototype-builtins
                if (res === undefined || res === null || !(res.hasOwnProperty('id_questions') && res.hasOwnProperty('resultat'))) {
                    check = false
                }
                const dataq = questions.find(question => question.id === res.id_questions)
                if (dataq === undefined || !check) {
                    check = false
                } else {
                    const enquete = enquetes.find(enq => enq.id === dataq.id_enquetes)
                    /* istanbul ignore next */
                    if (idEnq === enquete.id) {
                        const idres = uuidv4()
                        res = Object.assign({id: idres}, res)
                        majRes.push(res)
                    } else {
                        /* istanbul ignore next */
                        check = false //cas rare si injection d'une question qui existe mais qui n'est pas dans cette enquete
                    }
                }
            })
            if (check) {
                resultats = resultats.concat(majRes)
                try {
                    await fsPromises.writeFile(pathRes, JSON.stringify(resultats, null, 2))
                    cb(null, 'Vos réponses ont bien été enregistrées.')
                } catch (error) {
                    /* istanbul ignore next */
                    cb(error, null)
                }
            } else {
                cb('Erreur dans la transmission des données d\'une à plusieurs résultats.', null)
            }
        }
    }

    static async removeEnq(idEnq, secretEnq, cb) {
        const denq = enquetes.find(enq => enq.id === idEnq)
        if (denq === undefined || denq.secret !== secretEnq) {
            cb('Erreur dans la transmission des données de l\'enquête.', null)
        } else {
            let qstLink = questions.filter(qst => qst.id_enquetes === idEnq)
            qstLink = qstLink.map(qst => qst.id)
            resultats = resultats.filter(res => !qstLink.includes(res.id_questions))
            questions = questions.filter(qst => qst.id_enquetes !== idEnq)
            enquetes = enquetes.filter(enq => enq.id !== idEnq)
            try {
                await fsPromises.writeFile(pathRes, JSON.stringify(resultats, null, 2))
                await fsPromises.writeFile(pathEnq, JSON.stringify(enquetes, null, 2))
                await fsPromises.writeFile(pathQst, JSON.stringify(questions, null, 2))
                cb(null, 'L\'enquête a bien été supprimée')
            } catch (error) {
                /* istanbul ignore next */
                cb(error, null)
            }
        }
    }

    static async modifEnq(idEnq, secretEnq, ntitre, ndesc, cb) {
        const enquete = enquetes.find(enq => enq.id === idEnq)
        if (enquete === undefined || enquete.secret !== secretEnq) {
            cb('Enquête introuvable / mot de passe incorrect', null)
        } else {
            /* istanbul ignore next */
            if (ntitre !== undefined) {
                enquete.titre = ntitre
            }
            /* istanbul ignore next */
            if (ndesc !== undefined) {
                enquete.description = ndesc
            }
            try {
                await fsPromises.writeFile(pathEnq, JSON.stringify(enquetes, null, 2))
                cb(null, 'L\'enquête a bien été modifiée.')
            } catch (error) {
                /* istanbul ignore next */
                cb(error, null)
            }
        }
    }

    static async addQst(idEnq, secretEnq, qst, cb) {
        const enquete = enquetes.find(enq => enq.id === idEnq)
        // eslint-disable-next-line no-prototype-builtins
        if (enquete === undefined || enquete.secret !== secretEnq || !(qst.hasOwnProperty('titre') && qst.hasOwnProperty('reponse'))) {
            cb('Enquête introuvable ou mot de passe incorrect.', null)
        } else {
            const idqst = uuidv4()
            qst = Object.assign({id: idqst, id_enquetes: idEnq}, qst)
            questions.push(qst)
            try {
                await fsPromises.writeFile(pathQst, JSON.stringify(questions, null, 2))
                cb(null, {message: 'La question a bien été ajoutée avec l\'id : ' + idqst, idQst: idqst})
            } catch (error) {
                /* istanbul ignore next */
                cb(error, null)
            }
        }
    }

    static async removeQst(idEnq, secretEnq, idQust, cb) {
        const enquete = enquetes.find(enq => enq.id === idEnq)
        const question = questions.find(qst => qst.id === idQust)
        if (enquete === undefined || question === undefined || enquete.secret !== secretEnq) {
            cb('Enquête introuvable ou question introuvable ou mot de passe incorrect.', null)
        } else {
            resultats = resultats.filter(res => res.id_questions !== idQust)
            questions = questions.filter(qst => qst.id !== idQust)
            try {
                await fsPromises.writeFile(pathRes, JSON.stringify(resultats, null, 2))
                await fsPromises.writeFile(pathQst, JSON.stringify(questions, null, 2))
                cb(null, 'La question a bien été supprimée.')
            } catch (error) {
                /* istanbul ignore next */
                cb(error, null)
            }
        }
    }

    static async modifQst(idEnq, secretEnq, idQust, ntitre, nreponse, cb) {
        const enquete = enquetes.find(enq => enq.id === idEnq)
        const question = questions.find(qst => qst.id === idQust)
        if (enquete === undefined || question === undefined || enquete.secret !== secretEnq) {
            cb('Enquête introuvable ou question introuvable ou mot de passe incorrect.', null)
        } else {
            /* istanbul ignore next */
            if (ntitre !== undefined) {
                question.titre = ntitre
            }
            /* istanbul ignore next */
            if (nreponse !== undefined) {
                question.reponse = {
                    type: nreponse,
                }
            }
            try {
                await fsPromises.writeFile(pathQst, JSON.stringify(questions, null, 2))
                cb(null, 'La question a bien été modifiée.')
            } catch (error) {
                /* istanbul ignore next */
                cb(error, null)
            }
        }
    }

    static getRes(idEnq, cb) {
        const enquete = enquetes.find(enq => enq.id === idEnq)
        if (enquete === undefined) {
            cb('ID de l\'enquête ' + idEnq + ' introuvable.', null)
        } else {
            const qsts = questions.filter(qst => qst.id_enquetes === idEnq)
            const qstLink = qsts.map(qst => qst.id)
            const res = resultats.filter(r => qstLink.includes(r.id_questions))
            const qstsbis = questions.filter(qst => qst.id_enquetes === idEnq && qst.reponse.type !== 'libre')
            const qstLinkbis = qstsbis.map(qst => qst.id)
            const resbis = resultats.filter(r => qstLinkbis.includes(r.id_questions))
            const resnmb = {}
            /* istanbul ignore next */
            resbis.forEach(r => {
                // eslint-disable-next-line no-prototype-builtins
                if (resnmb.hasOwnProperty(r.id_questions)) {
                    const x = resnmb[r.id_questions].find(y => y.resultat === r.resultat)
                    if (x === undefined) {
                        resnmb[r.id_questions].push({resultat: r.resultat, nb: 1})
                    } else {
                        x.nb++
                    }
                } else {
                    resnmb[r.id_questions] = [{resultat: r.resultat, nb: 1}]
                }
            })
            cb(null, {res, enquete, qsts, resnmb})
        }
    }
}

module.exports = Model
