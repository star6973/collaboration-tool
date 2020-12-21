<template>
  <v-app>
    <v-app-bar app color="blue darken-4" dark>
      <v-toolbar-title class="headline">
        <span class="font-weight-medium">DoTS</span>
        <!-- <span class="font-weight-light ml-4">Main menu</span> -->
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-avatar :color="user.color" v-on="on" style="cursor: pointer;" v-ripple>
            <span>{{ user.lastName.charAt(0) }}</span>
          </v-avatar>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            :disabled="item.disabled"
            @click="item.action"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content>
      <br />
      <v-layout justify-center>
        <v-flex xl10 lg10 sm10>
          <router-view :user="user"></router-view>
        </v-flex>
      </v-layout>
    </v-content>
  </v-app>
</template>

<script>
import jwtDecode from 'jwt-decode';

export default {
  data () {
    return {
      user: {
        firstName: '',
        lastName: '',
        email: '',
        color: ''
      },
      items: [
        {
          title: '계정 관리',
          action: '',
          disabled: true
        },
        {
          title: '로그아웃',
          action: this.signout,
          disabled: false
        }
      ]
    }
  },
  created () {
    const token = localStorage.getItem('userToken')
    if (!token) this.signout()

    const decoded = jwtDecode(token)

    this.user.firstName = decoded.first_name
    this.user.lastName = decoded.last_name
    this.user.email = decoded.email
    this.user.color = decoded.color
  },
  methods: {
    signout () {
      this.$store.commit('deleteToken')
      this.$router.push({ name: 'index' })
    }
  }
}
</script>
