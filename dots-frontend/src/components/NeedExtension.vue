<template>
  <v-container class="content-index text-center mt-12">
    <div class="display-1">
      <span class="font-weight-light">원활한 프로젝트 진행을 위해서는 </span>
      <span class="font-weight-bold">확장 프로그램</span>
      <span class="font-weight-light">의 설치가 필요합니다.</span>
      <br><br>
      <span class="font-weight-light">확장 프로그램을 설치하시고 다시 로그인해주세요.</span>
      <br><br>
      <v-btn color="blue darken-4" class="headline" tile large dark @click="download">다운로드</v-btn>
    </div>
  </v-container>
</template>

<script>
export default {
  props: {
    user: {
      type: Object
    }
  },
  methods: {
    download () {
      window.open('https://github.com/sckroll/DoTS-Chrome');
    }
  }
}
</script>
