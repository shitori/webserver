'use strict'
const request = require('supertest')
const app = require('./../app')

let server
let id
let idqst

describe('Etats des routes', () => {

    beforeAll((done) => {
        server = app.listen(done)
    })

    afterAll((done) => {
        server.close(done)
    })

    test('FILE logo.png', async() => {
        const res = await request(server).get('/images/logo.png')
        expect(res.statusCode).toBe(200)
        expect(res.header['content-type']).toMatch(/image\/png/)
    })

    test('FILE bundle.css', async() => {
        const res = await request(server).get('/stylesheets/bundle.css')
        expect(res.statusCode).toBe(200)
        expect(res.header['content-type']).toMatch(/text\/css/)
    })

    test('FILE bundle.js', async() => {
        const res = await request(server).get('/javascripts/bundle.js')
        expect(res.statusCode).toBe(200)
        expect(res.header['content-type']).toMatch(/application\/javascript/)
    })

    test('GET /', async() => {
        const res = await request(server).get('/')
        expect(res.statusCode).toBe(302)
    })

    test('GET /dfjkshfdhksj', async() => {
        const res = await request(server).get('/dfjkshfdhksj')
        expect(res.statusCode).toBe(404)
    })

    /**
     * GET /enquetes
     */

    test('GET /enquetes', async() => {
        const res = await request(server).get('/enquetes')
        expect(res.statusCode).toBe(200)
        expect(res.header['content-type']).toMatch(/text\/html/)
    })

    /**
     * POST /enquetes
     */

    test('POST /enquetes OK', async() => {
        const res = await request(server).post('/enquetes').set('Accept', 'application/x-www-form-urlencoded').send({
            titre: 'test',
            secret: 'test',
            confirmSecret: 'test',
            description: 'test'
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).toContain('message')
        expect(res.header.location).not.toContain('error')
        const str = res.header.location
        const str2 = str.split('/')
        const str3 = str2[2].split('?')
        id = str3[0]

    })

    test('POST /enquetes Bad secret', async() => {
        const res = await request(server).post('/enquetes').set('Accept', 'application/x-www-form-urlencoded').send({
            titre: 'test',
            secret: 'test',
            confirmSecret: 'testt', //error
            description: 'test'
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).toContain('error')
        expect(res.header.location).not.toContain('message')

    })

    test('POST /enquetes Bad value', async() => {
        const res = await request(server).post('/enquetes').set('Accept', 'application/x-www-form-urlencoded').send({
            titre: '', //error no titre
            secret: 'test',
            confirmSecret: 'test',
            description: 'test'
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).toContain('error')
        expect(res.header.location).not.toContain('message')
    })

    /**
     * GET /enqutes/:id
     */

    test('GET /enquetes OK', async() => {
        const res = await request(server).get('/enquetes/' + id)
        expect(res.statusCode).toBe(200)
        expect(res.header['content-type']).toMatch(/text\/html/)
    })

    test('GET /enquetes BAD ID', async() => {
        const res = await request(server).get('/enquetes/hfdshfikdhsf')
        expect(res.statusCode).toBe(302)
        expect(res.header.location).toContain('error')
    })

    /**
     * POST /enquetes/:id/question
     */

    test('POST /enquetes/:id/question OK', async() => {
        const res = await request(server).post('/enquetes/' + id + '/question').set('Accept', 'application/x-www-form-urlencoded').send({
            titre: 'test',
            secret: 'test',
            reponse: 'libre',
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).toContain('message')
        expect(res.header.location).not.toContain('error')
        const str = res.header.location
        const str2 = str.split('/')
        const str3 = str2[2].split('?')
        const str4 = str3[1].split(':')
        idqst = str4[1].substring(3)
    })

    test('POST /enquetes/:id/question Bad value', async() => {
        const res = await request(server).post('/enquetes/' + id + '/question').set('Accept', 'application/x-www-form-urlencoded').send({
            titre: 'test',
            secret: 'testt', //bad secret
            reponse: 'libre',
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).not.toContain('message')
        expect(res.header.location).toContain('error')
    })

    /**
     * POST /enquetes/:id/resultats
     */

    test('POST /enquetes/:id/resultats OK', async() => {
        const obj = {}
        obj[idqst] = 'test'
        const res = await request(server).post('/enquetes/' + id + '/resultats').set('Accept', 'application/x-www-form-urlencoded').send(obj)
        expect(res.statusCode).toBe(302)
        expect(res.header.location).toContain('message')
        expect(res.header.location).not.toContain('error')

    })

    test('POST /enquetes/:id/resultats Bad value', async() => {
        const obj = {}
        obj['fsdihf'] = 'test'
        const res = await request(server).post('/enquetes/' + id + '/resultats').set('Accept', 'application/x-www-form-urlencoded').send(obj)
        expect(res.statusCode).toBe(302)
        expect(res.header.location).not.toContain('message')
        expect(res.header.location).toContain('error')
    })

    /**
     * PUT /enquetes/:id
     */

    test('PUT /enquetes/:id OK', async() => {
        const res = await request(server).put('/enquetes/' + id).set('Accept', 'application/x-www-form-urlencoded').send({
            titre: 'test2',
            secret: 'test',
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).toContain('message')
        expect(res.header.location).not.toContain('error')
    })

    test('PUT /enquetes/:id Bad value', async() => {
        const res = await request(server).put('/enquetes/' + id).set('Accept', 'application/x-www-form-urlencoded').send({
            titre: 'test2',
            secret: 'testt', // bad secret
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).not.toContain('message')
        expect(res.header.location).toContain('error')
    })

    /**
     * PUT /enquetes/:id/question/:id
     */

    test('PUT /question/:id OK', async() => {
        const res = await request(server).put('/enquetes/' + id + '/question/' + idqst).set('Accept', 'application/x-www-form-urlencoded').send({
            titre: 'test2',
            secret: 'test',
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).toContain('message')
        expect(res.header.location).not.toContain('error')
    })

    test('PUT /question/:id Bad value', async() => {
        const res = await request(server).put('/enquetes/' + id + '/question/fdshkjf').set('Accept', 'application/x-www-form-urlencoded').send({
            titre: 'test2',
            secret: 'test',
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).not.toContain('message')
        expect(res.header.location).toContain('error')
    })

    /**
     * GET /enquetes/:id/resultats
     */

    test('GET /enquetes/:id/resultats OK', async() => {
        const res = await request(server).get('/enquetes/' + id + '/resultats')
        expect(res.statusCode).toBe(200)
    })

    test('GET /enquetes/:id/resultats Bad value', async() => {
        const res = await request(server).get('/enquetes/fdhshf/resultats')
        expect(res.statusCode).toBe(200)
    })

    /**
     * DELETE /enquetes/:id/question/:id
     */

    test('DELETE /enquetes/:id/question/:id OK', async() => {
        const res = await request(server).delete('/enquetes/' + id + '/question/' + idqst).set('Accept', 'application/x-www-form-urlencoded').send({
            secret: 'test',
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).toContain('message')
        expect(res.header.location).not.toContain('error')
    })

    test('DELETE /enquetes/:id/question/:id OK', async() => {
        const res = await request(server).delete('/enquetes/' + id + '/question/' + idqst).set('Accept', 'application/x-www-form-urlencoded').send({
            secret: 'test',
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).not.toContain('message')
        expect(res.header.location).toContain('error')
    })

    /**
     * DELETE /enquetes/:id
     */

    test('DELETE /enquetes/:id OK', async() => {
        const res = await request(server).delete('/enquetes/' + id).set('Accept', 'application/x-www-form-urlencoded').send({
            secret: 'test',
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).toContain('message')
        expect(res.header.location).not.toContain('error')
    })

    test('DELETE /enquetes/:id OK', async() => {
        const res = await request(server).delete('/enquetes/' + id).set('Accept', 'application/x-www-form-urlencoded').send({
            secret: 'test',
        })
        expect(res.statusCode).toBe(302)
        expect(res.header.location).not.toContain('message')
        expect(res.header.location).toContain('error')
    })

})

