const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('kcors')
const Router = require('koa-router')
const router = new Router()
const clientDirectUploadController = require('./controllers/client-direct-upload')

const app = new Koa()
const port = 2018

app.use(cors({ credentials: true }))
app.use(bodyParser())
let counter = 0
app.use(async (ctx, next) => {
	counter++
	try{
		let requestId = counter
		console.log(requestId, ctx.method, ctx.url, ctx.headers, ctx.rawBody)
		await next()
		console.log(requestId, ctx.body)
	}
	catch(e){
		console.error(e)
		ctx.body = e.message
	}
})

router.get('/signature', clientDirectUploadController.getSignature)
router.post('/upload-callback', clientDirectUploadController.uploadCallback)

app.use(router.routes())

app.listen(port);
console.log(`Listening on port ${port}`)
