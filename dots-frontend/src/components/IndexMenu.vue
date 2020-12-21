<template>
  <v-app>
    <v-app-bar app color="blue darken-4" dark height="130">
      <v-toolbar-title class="display-2 ml-12 pt-12 pb-8">
        <span
          class="font-weight-medium"
          @click="$router.push({ name: 'index' })"
          style="cursor: pointer;"
        >DoTS</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="mr-12 pt-12 pb-8">
        <v-btn text class="headline" @click="$router.push({ name: 'about' })">About</v-btn>
        <v-btn text class="headline" @click="$router.push({ name: 'features' })">Features</v-btn>
        <v-btn text class="headline" @click="$router.push({ name: 'pricing' })">Pricing</v-btn>
        <v-btn text class="headline" @click="$router.push({ name: 'help' })">Help</v-btn>
        <v-btn
          class="headline font-weight-bold blue--text text--darken-4 ml-4"
          color="white"
          dark
          @click="$router.push({ name: 'login' })"
        >로그인</v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <v-content>
      <div>
        <router-view></router-view>
      </div>
    </v-content>
  </v-app>
</template>
