const config = require('../../myConfig')
const crypto = require('crypto')
const axios = require('axios')

let ossPublicKeyDict = {}

exports.getSignature = async (ctx, next) => {
	const {accessKeyId, accessKeySecret} = config
	let key = `album/${ctx.query.fileName}`
	let expire = new Date(Date.now() + 60 * 1000) // 默认上传时间 1 分钟过期
	let callbackObj = {
		callbackUrl: 'http://voidis.com/upload-callback',
		callbackBody: 'bucket=${bucket}&object=${object}&etag=${etag}&size=${size}&mimeType=${mimeType}&imageInfo.height=${imageInfo.height}&imageInfo.width=${imageInfo.width}&imageInfo.format=${imageInfo.format}&sign=${x:signature}',
		callbackBodyType: 'application/x-www-form-urlencoded'
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
	let publicKeyUrl = (new Buffer(ctx.headers['x-oss-pub-key-url'], 'base64')).toString()
	if(!publicKeyUrl.match(/^https?:\/\/gosspublic.alicdn.com\//)){
		throw new Error('Invalid publicKeyUrl:' + publicKeyUrl)
	}

	let publicKey = ossPublicKeyDict[publicKeyUrl]
	if(!publicKey){
		let res = await axios({url: publicKeyUrl})
		if (res.status >= 400) {
			throw new Error('Fail to get public key from url: ' + publicKeyUrl)
		}
		publicKey = res.data
		ossPublicKeyDict[publicKeyUrl] = publicKey
	}

	let signature = ctx.headers.authorization
	let stringToSign = ctx.path + ctx.request.search + '\n' + ctx.request.rawBody

	let isValid = crypto.createVerify('RSA-MD5').update(stringToSign).verify(publicKey, signature, 'base64')
	if(isValid){
		ctx.body = 'valid'
	}
	else{
		ctx.status = 400
		ctx.body = 'invalid'
	}
}
