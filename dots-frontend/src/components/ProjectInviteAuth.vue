<template></template>

<script>
import jwtDecode from 'jwt-decode'

export default {
  mounted() {
    var userToken = localStorage.getItem('userToken')

    if (userToken) {
      this.$http.get('/projects/auth', {
        params: {
          project: this.$route.query.project,
          member: this.$route.query.member,
          token: this.$route.query.token,
          userEmail: jwtDecode(userToken).email
        }
      })
        .then((result) => {
          if (result.data.errorMessage) throw new Error(result.data.errorMessage)

          alert('프로젝트 팀원 등록이 완료되었습니다.')
        }).catch((err) => {
          alert(err)
        })
        .then(() => {
          this.$router.push({ name: 'user' })
        })
    } else {
      alert('로그인이 필요합니다. 로그인 후에 다시 링크를 클릭해주세요.')
      this.$router.push({ name: 'login' })
    }
  }
}
</script>
