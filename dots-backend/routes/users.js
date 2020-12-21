const express = require('express')
const router = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const moment = require('moment')

const User = require('../models/users')
const jwtObj = require('../config/jwt')
router.use(cors())

// 토큰 생성 함수
const signToken = pl => {
	return new Promise((resolve, reject) => {
		const payload = {
			//_id: pl._id,
			first_name: pl.first_name,
			last_name: pl.last_name,
			email: pl.email,
			color: pl.color
		}

		const option = {
			expiresIn: jwtObj.expireTime
		}

		jwt.sign(payload, jwtObj.secret, option, (err, token) => {
			if (err) reject(err)
			resolve(token)
		})
	})
}

// 토큰 검사 함수
const verifyToken = t => {
	return new Promise((resolve, reject) => {
		jwt.verify(t, jwtObj.secret, (err, v) => {
			if (err) reject(err)
			resolve(v)
		})
	})
}

// 토큰 재발급 함수
const getToken = async t => {
	let vt = await verifyToken(t)
	const diff = moment(vt.exp * 1000).diff(moment(), 'seconds')

	console.log(`토큰 만료까지 남은 시간 : ${diff}초 ( ${vt.exp - vt.iat} )`)
	if (diff > (vt.exp - vt.iat) / 3) {
		return { user: vt, refreshToken: null }
	}

	const nt = await signToken(vt)
	vt = await verifyToken(nt)
	return { user: vt, refreshToken: nt }
}

// // DB에 등록된 사용자 목록을 조회
// router.get('/', function(req, res, next) {
// 	User.findAll()
// 		.then(result => {
// 			res.send(result)
// 		})
// 		.catch(err => {
// 			throw err
// 		})
// 	res.send(req.query)
// })

// DB에 등록된 사용자 목록을 조회
router.get('/', function(req, res, next) {
	if (req.query.email) {
		User.findOneByEmail(req.query.email)
		.then(result => {
			res.send(result)
		})
		.catch(err => {
			res.send(err)
		})
	} else {
		User.findAll()
		.then(result => {
			res.send(result)
		})
		.catch(err => {
			throw err
		})
	}
})

// // 특정 사용자의 정보를 조회
// router.get('/:email', function(req, res, next) {
// 	User.findOneByEmail(req.params.email)
// 		.then(result => {
// 			res.send(result)
// 		})
// 		.catch(err => {
// 			res.send(err)
// 		})
// })

// 회원가입한 사용자 정보를 DB에 저장
router.post('/signup', function(req, res, next) {
	User.findOneByEmail(req.body.email)
		.then(result => {
			if (!result) {
				bcrypt.hash(req.body.password, jwtObj.saltFactor, (err, hash) => {
					const newUser = {
						email: req.body.email,
						first_name: req.body.firstName,
						last_name: req.body.lastName,
						password: hash,
						color: req.body.color
					}

					User.create(newUser)
						.then(result => {
							res.send({ status: result.email + ' registered' })
						})
						.catch(err => {
							res.send(err)
						})
				})
			} else {
				throw new Error('이미 가입한 계정입니다.')
			}
		})
		.catch(err => {
			res.send(err)
		})
})

router.post('/login', function(req, res, next) {
	console.dir(req.body.email)
	User.findOneByEmail(req.body.email)
		.then(result => {
			if (result) {
				if (bcrypt.compareSync(req.body.password, result.password)) {
					signToken(result)
						.then(v => {
							console.log('/login signToken result: ' + v)
							res.send(v)
						})
						.catch(err => {
							console.log('/login signToken error: ' + err)
							res.send(err)
						})
				} else {
					res.json({ error: '가입된 이메일이 존재하지 않거나 올바른 비밀번호가 아닙니다.' })
				}
			} else {
				res.json({ error: '가입된 이메일이 존재하지 않거나 올바른 비밀번호가 아닙니다.' })
			}
		})
		.catch(err => {
			res.send(err)
		})
})

// 토큰 유효성 검사
router.post('/verify', function(req, res, next) {
	const token = req.headers.authorization

	getToken(token)
		.then(result => {
			console.log(result)
			res.send(result)
		})
		.catch(err => {
			console.log(err)
			res.send(err)
		})
})

module.exports = router
