const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('kcors')
const Router = require('koa-router')
const router = new Router()
const clientDirectUploadController = require('./controllers/client-direct-upload')

const app = new Koa()
const port = 2018

app.use(async (ctx, next) => {
	try{
		await next()
	}
	catch(e){
		console.error(e)
		ctx.body = e.message
	}
})

app.use(cors({ credentials: true }))
app.use(bodyParser())

router.get('/signature', clientDirectUploadController.getSignature)
router.post('/upload-callback', clientDirectUploadController.uploadCallback)

app.use(router.routes())

app.listen(port);
console.log(`Listening on port ${port}`)
