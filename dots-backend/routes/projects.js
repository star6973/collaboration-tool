const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const Project = require('../models/projects')
// const User = require('../models/users')

router.get('/', function(req, res, next) {
	// Project.findAll()
	// 	.then(result => {
	// 		res.send(result)
	// 	})
	// 	.catch(err => {
	// 		throw err
	// 	})
	Project.findByMember(req.query.email)
		.then(result => {
			res.send(result)
		})
		.catch(err => {
			throw err
		})
})

router.get('/current', function(req, res, next) {
	var project_id = req.query.id

	Project.findOneById(project_id)
		.then(result => {
			res.send(result)
		})
		.catch(err => {
			throw err
		})
})

router.get('/auth', function(req, res, next) {
	var project_id = req.query.project
	var member_email = req.query.member
	var token = req.query.token
	var userEmail = req.query.userEmail

	// 로그인 토큰 검사
	if (userEmail) {
		// 프로젝트 팀원과 사용자 일치 여부 검사
		if (member_email === userEmail) {
			// 프로젝트 ID 검사
			Project.findOneById(project_id)
				.then(project => {
					// 프로젝트 팀원 검사
					var member_index = project.members.findIndex(member => {
						return member.email === member_email
					})
					console.log(member_index)
					if (member_index !== -1) {
						// 인증 토큰 검사
						if (project.members[member_index].verify_key === token) {
							var updated_project = project
							var verified_member = project.members[member_index]
							verified_member.verified = true

							// 기존 프로젝트 멤버 삭제 후 새 멤버 추가
							updated_project.members.splice(member_index, 1)
							updated_project.members.push(verified_member)

							Project.findOneAndUpdate({ project_id }, updated_project, { new: true }, (err, doc) => {
								if (err) {
									res.json({errorMessage: '프로젝트 팀원 추가에 오류가 발생했습니다.'})
								} else {
									res.send(doc)
								}
							})
						} else {
							res.json({errorMessage: '인증 토큰이 일치하지 않습니다.'})
						}
					} else {
						res.json({errorMessage: '프로젝트에 초대받지 않은 회원입니다.'})
					}
				})
				.catch(err => {
					res.json({errorMessage: '존재하지 않는 프로젝트입니다.'})
				})
		} else {
			res.json({errorMessage: '올바른 초대 주소가 아닙니다.'})
		}
	} else {
		res.json({errorMessage: '로그인이 필요합니다. 로그인 후에 다시 링크를 클릭해주세요.'})
	}
})

// 특정 프로젝트의 정보를 조회 (존재한다면 프로젝트 ID를 반환)
// 우선은 프로젝트 ID를 랜덤 문자열로 하지만, 이미 존재하는 ID와 충돌할 경우 어떻게 할 것인가?
router.get('/find', function(req, res, next) {
	Project.findOneById(req.query.id)
		.then(result => {
			if (result) {
				// 중복되는 ID가 있는 경우
				res.send(result)
			} else {
				// 중복되는 ID가 없는 경우
				res.send({ id: req.query.id })
			}
		})
		.catch(err => {
			res.send(err)
		})
})

// 새로 생성한 프로젝트의 정보를 DB에 저장
router.post('/create', function(req, res, next) {
	// 중복되는 프로젝트 이름이 존재하는지 검사
	Project.findOneByName(req.body.projectName)
		.then(result => {
			if (!result) {
				// 중복되는 이름이 없다면

				const firstKey = crypto.randomBytes(256).toString('base64').substr(100, 16)
				const secondKey = crypto.randomBytes(256).toString('hex').substr(200, 16)
				const verifyKey = firstKey + secondKey

				const newProject = new Project({
					project_id: req.body.projectId,
					project_name: req.body.projectName,
					description: req.body.description,
					topic: req.body.topic,
					team_name: req.body.teamName,
					founder_email: req.body.user.email,
					members: []
				})

				const newMember = {
					email: req.body.user.email,
					first_name: req.body.user.firstName,
					last_name: req.body.user.lastName,
					position: '팀장',
					color: req.body.user.color,
					verified: true,
					verify_key: verifyKey
				}

				newProject.members.push(newMember)

				Project.create(newProject)
					.then(r => {
						console.log('Successed: ' + req.body.projectName)
						res.send(r)
					})
					.catch(e => {
						console.log('Failed: ' + req.body.projectName)
						res.send(e)
					})

				// User.findOneByEmail(req.body.founderEmail)
				// 	.then(value => {
				// 		const newMember = {
				// 			user: value._id,
				// 			position: '팀장'
				// 		}

				// 		newProject.members.push(newMember)

				// 		Project.create(newProject)
				// 			.then(r => {
				// 				console.log('Successed: ' + req.body.projectName)
				// 				res.send(r)
				// 			})
				// 			.catch(e => {
				// 				console.log('Failed: ' + req.body.projectName)
				// 				res.send(e)
				// 			})
				// 	})
				// 	.catch(error => {
				// 		res.send(error)
				// 	})
			} else {
				// 이미 존재하는 프로젝트가 있다면
				throw new Error('이미 해당 프로젝트의 이름이 존재합니다.')
			}
		})
		.catch(err => {
			res.send(err)
		})
})

router.delete('/:name', function(req, res, next) {
	Project.deleteOne({ project_name: req.params.name })
		.then(result => {
			res.send(result)
		})
		.catch(err => {
			throw err
		})
})

module.exports = router
