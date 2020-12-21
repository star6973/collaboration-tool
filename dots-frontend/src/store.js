import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('userToken')
  },
  getters: {},
  mutations: {
    getToken (state) {
      state.token = localStorage.getItem('userToken')
    },
    deleteToken (state) {
      localStorage.removeItem('userToken')
      state.token = null

      // const extensionId =
      //   process.env.NODE_ENV !== 'production' ? 'jpiagnpijljkijffgaidojpebhmijljc' : 'kbbjkdflgdjckldapfdldgeedcmhmglk'
      const extensionId = localStorage.getItem('extensionId')

      chrome.runtime.sendMessage(extensionId, { userToken: 'logout' }, response => {
        console.log(response.result)
      })
    }
  },
  actions: {}
})
