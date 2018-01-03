const config = require('../../myConfig')
const crypto = require('crypto')
const querystring = require('querystring')

let ossPublicKey = null

exports.getSignature = async (ctx, next) => {
  const {accessKeyId, accessKeySecret} = config

	let key = `album/${ctx.query.fileName}`
	let expire = new Date(Date.now() + 60 * 1000) // 默认上传时间 1 分钟过期
	let callbackObj = {
		// callbackUrl: 'https://voidis.com/upload-callback',
		callbackUrl: 'http://api.voidis.com',
		// callbackHost: 'api.voidis.com',
		// callbackBody: 'bucket=${bucket}&object=${object}&etag=${etag}&size=${size}&mimeType=${mimeType}&imageInfo.height=${imageInfo.height}&imageInfo.width=${imageInfo.width}&imageInfo.format=${imageInfo.format}&sign=${x:signature}',
		callbackBody: 'bucket=${bucket}&object=${object}&etag=${etag}&size=${size}&mimeType=${mimeType}&acl=${x:acl}',
		callbackBodyType:'application/x-www-form-urlencoded'
	}
	let callbackBase64 = new Buffer(JSON.stringify(callbackObj)).toString('base64')

	let policy = {
		expiration: expire.toISOString(),
		conditions: [
			["content-length-range", 0, 1024 * 1024 * 5], // 默认 5M
			{bucket: config.bucket.name},
			['eq', '$key', key],
		]
	}

  const policyBase64 = new Buffer(JSON.stringify(policy)).toString('base64')
  const signature = crypto.createHmac('sha1', accessKeySecret).update(policyBase64).digest('base64')

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
	console.log(ctx.headers)
	console.log(JSON.stringify(ctx.request.body))

	let stringToSign = ctx.path + ctx.request.search + '\n' + querystring.stringify(ctx.request.body)
	let publicKey = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKs/JBGzwUB2aVht4crBx3oIPBLNsjGs
C0fTXv+nvlmklvkcolvpvXLTjaxUHR3W9LXxQ2EHXAJfCB+6H2YF1k8CAwEAAQ==
-----END PUBLIC KEY-----`
	let isValid = crypto.createVerify('RSA-MD5').update(stringToSign).verify(publicKey, ctx.headers.authorization, 'base64')
	console.log(isValid)
	ctx.body = {isValid: isValid}
}

