const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('kcors')
const Router = require('koa-router')
const router = new Router()
const clientDirectUploadController = require('./controllers/client-direct-upload')

const app = new Koa()
const port = 3000

app.use(async (ctx, next) => {
	try{
		await next()
	}
	catch(e){
		console.error(e)
	}
})

app.use(cors({ credentials: true }))
app.use(bodyParser())

router.get('/signature', clientDirectUploadController.getSignature)

app.use(router.routes())

app.listen(port);
console.log(`Listening on port ${port}`)
