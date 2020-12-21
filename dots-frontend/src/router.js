import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'

import IndexMenu from './components/IndexMenu.vue'
import Index from './components/Index.vue'
import About from './components/About.vue'
import Features from './components/Features.vue'
import Pricing from './components/Pricing.vue'
import Help from './components/Help.vue'
import LoginMenu from './components/LoginMenu.vue'
import Login from './components/Login.vue'
import SignupMenu from './components/SignupMenu.vue'
import Signup from './components/Signup.vue'
import UserMenu from './components/UserMenu.vue'
import User from './components/User.vue'
import CreateProject from './components/CreateProject.vue'
import ProjectNav from './components/ProjectNav.vue'
import NeedExtension from './components/NeedExtension.vue'
import ProjectInviteAuth from './components/ProjectInviteAuth.vue'

Vue.use(Router)

// 임시
// const apiRootPath =
//   process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : '/api'
const apiRootPath =
  process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : ''

// 크롬 확장프로그램 ID
// const extensionId =
//   process.env.NODE_ENV !== 'production' ? 'jpiagnpijljkijffgaidojpebhmijljc' : 'kbbjkdflgdjckldapfdldgeedcmhmglk'
const extensionId = localStorage.getItem('extensionId')

// 토큰의 유효성을 검사하기 위해 토큰을 헤더에 담아 서버로 전달
const pageCheck = (to, from, next) => {
  axios
    .post(`${apiRootPath}/users/verify`, {
      headers: {
        Authorization: localStorage.getItem('userToken')
      }
    })
    .then(result => {
      // // 모든 인터벌 중지 (임시)
      // for (var i = 0; i < 10; i++) {
      //   clearInterval(i)
      // }

      // JWT 에러 처리
      if (result.data.message) {
        if (result.data.message === 'jwt expired') {
          alert('로그인 시간이 만료되었습니다. 다시 로그인해주세요.')
        }
        if (result.data.message === 'jwt malformed') {
          alert('오류가 발생하였습니다. 다시 로그인해주세요.')
        }
        localStorage.removeItem('userToken')
        chrome.runtime.sendMessage(extensionId, { userToken: 'logout' }, response => {
          console.log(response.result)
        })
        next('/')
      }

      // 크롬 확장 프로그램에 토큰 전달
      const token = localStorage.getItem('userToken')
      chrome.runtime.sendMessage(extensionId, { userToken: token }, response => {
        if (chrome.runtime.lastError) {
          next('/need-extension')
        } else {
          console.log(response.result)

          // 확장 프로그램 설치 페이지에서 사용자 메인 메뉴로 이동
          if (location.href.indexOf('/need-extension') !== -1) {
            next('/p')
          }
        }
      })

      next()
    })
    .catch(err => {
      throw err
    })
}

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      // 랜딩 페이지 및 메뉴
      path: '/',
      component: IndexMenu,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) return next('/p')
        next()
      },
      children: [
        {
          path: '',
          name: 'index',
          component: Index
        },
        {
          path: '/about',
          name: 'about',
          component: About
        },
        {
          path: '/features',
          name: 'features',
          component: Features
        },
        {
          path: '/pricing',
          name: 'pricing',
          component: Pricing
        },
        {
          path: '/help',
          name: 'help',
          component: Help
        }
      ]
    },
    {
      // 로그인 페이지
      path: '/login',
      component: LoginMenu,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) return next('/p')
        next()
      },
      children: [
        {
          path: '',
          name: 'login',
          component: Login
        }
      ]
    },
    {
      // 회원가입 페이지
      path: '/signup',
      component: SignupMenu,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('userToken')) return next('/p')
        next()
      },
      children: [
        {
          path: '',
          name: 'signup',
          component: Signup
        }
      ]
    },
    {
      // 프로젝트
      // '/:id': 해당 id를 가진 프로젝트
      path: '/project/:id',
      name: 'project',
      component: ProjectNav,
      beforeEnter: pageCheck
    },
    {
      // 사용자 메인 메뉴
      path: '/p',
      component: UserMenu,
      beforeEnter: pageCheck,
      children: [
        {
          path: '',
          name: 'user',
          component: User
        },
        {
          path: '/p/create-project',
          name: 'create-project',
          component: CreateProject
        },
        {
          path: '/need-extension',
          name: 'need-extension',
          component: NeedExtension
        }
      ]
    },
    {
      path: '/auth',
      component: ProjectInviteAuth
    },
    {
      // 그 외의 경로로 접근할 경우 루트로 리다이렉트
      path: '/*',
      redirect: '/'
    }
  ]
})
