const config = require('../../myConfig')
const crypto = require('crypto')

exports.getSignature = async (ctx, next) => {
  const {accessKeyId, accessKeySecret} = config

	let key = `album/${ctx.query.fileName}`
	let expire = new Date(Date.now() + 60 * 1000) // 默认上传时间 1 分钟过期
	let callbackObj = {
		// callbackUrl: 'http://voidis.com/upload-callback',
		// callbackHost: 'voidis.com',
		// callbackBody: 'bucket=${bucket}&object=${object}&etag=${etag}&size=${size}&mimeType=${mimeType}&imageInfo.height=${imageInfo.height}&imageInfo.width=${imageInfo.width}&imageInfo.format=${imageInfo.format}',
		callbackUrl: '10.162.216.168:2017/upload-callback',
		callbackHost: '10.162.216.168',
		callbackBody: 'a=b',
		callbackBodyType:"application/x-www-form-urlencoded"
	}
	let callbackBase64 = new Buffer(JSON.stringify(callbackObj)).toString('base64')

	let policy = {
		expiration: expire.toISOString(),
		conditions: [
			["content-length-range", 0, 1024 * 1024 * 5], // 默认 5M
			{bucket: config.bucket.name},
			['eq', '$key', key],
			// {callback: callbackBase64}
		]
	}

  const policyBase64 = new Buffer(JSON.stringify(policy)).toString('base64')
  const hmac = crypto.createHmac('sha1', accessKeySecret)
  hmac.update(policyBase64)
  const signature = hmac.digest('base64')


  ctx.body = {
		accessKeyId,
		key,
		policy: policyBase64,
		signature,
		uploadAddress: config.bucket.externalUrl,
		callback: callbackBase64
  }

}

exports.uploadCallback = async ctx => {
	console.log(ctx.request.body)
	ctx.body = ''
}