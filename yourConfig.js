module.exports = {
  accessKeyId: '',

  accessKeySecret: '', // 阿里云不会留存，自己妥善保管，若丢失只能重新生成一对新的 key 和 secret

  bucket: {
    name: '{your-bucket-name}',
    externalUrl: 'https://{your-bucket-name}.{endpoint-external}', // 外网地址
    internalUrl: 'https://{your-bucket-name}.{endpoint-internal}' // 内网地址
  }
}