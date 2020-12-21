const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const crypto = require('crypto')
const Project = require('../models/projects')
const transportConfig = require('../config/mailConfig')

router.post("/invite", function(req, res, next) {
  const transporter = nodemailer.createTransport(smtpTransport(transportConfig))
  const memberEmail = req.body.email
  const sender = req.body.sender
  const newMember = req.body.newMember
  const project = req.body.project
  console.log(sender)
  console.log(newMember)
  console.log(project)

  const firstKey = crypto.randomBytes(256).toString('base64').substr(100, 16)
  const secondKey = crypto.randomBytes(256).toString('hex').substr(200, 16)
  const verifyKey = firstKey + secondKey

  const url = process.env.NODE_ENV === 'production' ? 'https://dots-00.appspot.com' : 'http://localhost:8080'
  // const url = 'https://dots-00.appspot.com'

  const newMemberProfile = {
    email: newMember.email,
    first_name: newMember.first_name,
    last_name: newMember.last_name,
    position: '팀원',
    color: newMember.color,
    verified: false,
    verify_key: verifyKey
  }

  var updatedProject = project
  updatedProject.members.push(newMemberProfile)

  // 현재 프로젝트 컬렉션에 팀원 추가 (미인증 상태)
  Project.findOneAndUpdate({ project_id: project.project_id }, updatedProject, { new: true }, (err, doc) => {
    if (err) res.send(err)

    const mailOptions = {
      from: 'kimsc0714@gmail.com',
      to: memberEmail,
      subject: `[DoTS 프로젝트 초대] "${project.project_name}" 프로젝트 팀원 초대 메일입니다.`,
      html: `<h2>${project.project_name} by ${project.team_name}</h2>` +
            `<p>${project.description}</p>` +
            `<br/><p><strong>${sender.first_name}</strong>(${sender.email})님께서 당신을 ` +
            `<strong>${project.project_name}</strong> 프로젝트에 초대하셨습니다.</p>` +
            `<p><strong>${project.team_name}</strong> 팀의 일원으로서 프로젝트의 목표 달성을 위해 힘써주세요!</p>` +
            '<p>프로젝트의 팀원이 되기를 원하신다면 아래의 링크를 클릭해주세요.</p>' +
            `<br/><a href="${url}/auth?project=${project.project_id}` +
            `&member=${newMember.email}&token=${verifyKey}">인증하기</a>`
    }
  
    // 초대 메일 전송
    transporter.sendMail(mailOptions, (error, response) => {
      if (error) {
        console.log(error)
        res.send(error)
      } else {
        console.log(response)
        res.send(response)
      }
  
      transporter.close()
    })
  })  
});

module.exports = router;
