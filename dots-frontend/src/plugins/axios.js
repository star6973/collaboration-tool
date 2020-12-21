'use strict'

import Vue from 'vue'
import axios from 'axios'

// const BASE_URL = 'http://localhost:3000/';
// const BASE_URL = '' // 실제 서비스 사용 시
const BASE_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : ''

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
axios.defaults.headers.common['Authorization'] = localStorage.getItem(
  'userToken'
)
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
  baseURL: BASE_URL
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
}

const _axios = axios.create(config)

Vue.prototype.$http = _axios

_axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    config.headers.Authorization = localStorage.getItem('userToken')
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    const refreshToken = response.data
    const originalToken = localStorage.getItem('userToken')

    if (!originalToken) {
      axios.defaults.headers.common['Authorization'] = refreshToken
    }
    if (refreshToken) {
      if (typeof refreshToken === 'string') {
        localStorage.setItem('userToken', refreshToken)
      }
    }

    return response
  },
  function (error) {
    // Do something with response error
    return Promise.reject(error)
  }
)

Plugin.install = function (Vue, options) {
  Vue.axios = _axios
  window.axios = _axios
  Object.defineProperties(Vue.prototype, {
    axios: {
      get () {
        return _axios
      }
    },
    $axios: {
      get () {
        return _axios
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin
