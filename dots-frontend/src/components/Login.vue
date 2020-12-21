<template>
  <v-container fill-height fluid class="pa-0">
    <v-layout justify-center align-center>
      <v-flex xl3 lg3 sm5>
        <v-form>
          <v-text-field v-model="email" label="이메일" required single-line solo></v-text-field>
          <v-text-field
            v-model="password"
            label="비밀번호"
            required
            single-line
            solo
            :append-icon="visibility ? 'mdi-eye' : 'mdi-eye-off'"
            :type="visibility ? 'text' : 'password'"
            @click:append="visibility = !visibility"
          ></v-text-field>
          <div class="text-center">
            <v-btn color="success" tile text @click="onSubmit" @keypress.enter="onSubmit" :disabled="!email || !password">로그인</v-btn>
          </div>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      email: '',
      password: '',
      visibility: false
    }
  },
  methods: {
    onSubmit () {
      if (!localStorage.getItem('extensionId')) {
        alert('크롬 확장프로그램이 설치되어 있지 않습니다. 설치 후 다시 로그인해주세요.')
        return
      }

      this.$http
        .post('/users/login', {
          email: this.email,
          password: this.password
        })
        .then(res => {
          this.email = '';
          this.password = '';

          if (!res.data.error) {
            localStorage.setItem('userToken', res.data)
            this.$router.push({ name: 'user' })
          } else {
            alert(res.data.error)
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
</script>
