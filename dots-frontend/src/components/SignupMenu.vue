<template>
  <v-app>
    <v-app-bar app color="transparent" flat height="130">
      <v-toolbar-title class="display-2 ml-12 pt-12 pb-8">
        <span
          class="font-weight-medium"
          @click="$router.push({ name: 'index' })"
          style="cursor: pointer;"
        >DoTS</span>
        <span class="font-weight-light mx-6">|</span>
        <span class="font-weight-light" style="font-size:2.5rem;">회원가입</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="mr-12 pt-12 pb-8">
        <v-btn
          class="headline font-weight-bold blue darken-4"
          dark
          @click="$router.push({ name: 'login' })"
        >로그인</v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>
