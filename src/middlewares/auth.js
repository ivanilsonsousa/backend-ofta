const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.json')

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log(authHeader)

  if (!authHeader)
    return res.status(401).send({ error: 'Token de autenticação não informado' })

  const parts = authHeader.split(' ')

  if (!parts.length === 2)
    return res.status(401).send({ error: 'Token de autenticação com erro' })

  const [schema, token] = parts

  if (!/^Bearer$/i.test(schema))
    return res.status(401).send({ error: 'Token de autenticação mal formatado' })

  jwt.verify(token, authConfig.secret, (err, decode) => {
    if (err) return res.status(401).send({ error: 'Token inválido' })

    req.userId = decode.id

    return next()
  })
}