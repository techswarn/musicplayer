require('dotenv').config()

const {join} = require('path')
const {readdir} = require('fs/promises')
const fastifyStatic = require('@fastify/static')

const app = require('fastify')()

if(process.env?.KEY){
    app.register(require('@fastify/bearer-auth'), {keys: [process.env.KEY]})
}

app.register(require('@fastify/cors'), { "origin": "*" })

app.register(fastifyStatic, {
    root: process.env.MUSICFOLDER,
    prefix: '/song'
})

app.get('/music', async (req, rep) => {
	rep.header("Access-Control-Allow-Origin", "*")
    const albums = await readdir(process.env.MUSICFOLDER)
    return albums
})

app.get('/album/:album', async (req, rep) => {
    const {album} = req.params
    const songs = await readdir(join(process.env.MUSICFOLDER, album))
    return songs
})

app.get('/song/:name', async (req,rep) => {
	const songName = req.params.name
	return rep.sendFile(songName)
})

app.listen({
    port: 8080,
    host: process.env.HOST || '127.0.0.1'
})
