<template>
  <v-container fill-height fluid class="pa-0">
    <v-layout justify-center align-center>
      <v-flex xl3 lg3 sm5>
        <v-form>
          <v-text-field
            v-validate="'required|email'"
            :error-messages="errors.collect('email')"
            data-vv-name="email"
            v-model="form.email"
            label="이메일"
            required
            single-line
            solo
          ></v-text-field>
          <v-text-field
            v-validate="'required|min:6'"
            :error-messages="errors.collect('password')"
            data-vv-name="password"
            v-model="form.password"
            ref="password"
            label="비밀번호"
            required
            single-line
            solo
            :append-icon="visibility1 ? 'mdi-eye' : 'mdi-eye-off'"
            :type="visibility1 ? 'text' : 'password'"
            @click:append="visibility1 = !visibility1"
          ></v-text-field>
          <v-text-field
            v-validate="'required|confirmed:password'"
            :error-messages="errors.collect('passwordConfirm')"
            data-vv-name="passwordConfirm"
            v-model="form.passwordConfirm"
            label="비밀번호 확인"
            required
            single-line
            solo
            :append-icon="visibility2 ? 'mdi-eye' : 'mdi-eye-off'"
            :type="visibility2 ? 'text' : 'password'"
            @click:append="visibility2 = !visibility2"
          ></v-text-field>
          <v-text-field
            v-validate="'required'"
            :error-messages="errors.collect('lastName')"
            data-vv-name="lastName"
            v-model="form.lastName"
            label="성"
            required
            single-line
            solo
          ></v-text-field>
          <v-text-field
            v-validate="'required'"
            :error-messages="errors.collect('firstName')"
            data-vv-name="firstName"
            v-model="form.firstName"
            label="이름"
            required
            single-line
            solo
          ></v-text-field>
          <v-layout class="text-center">
            <v-btn color="info" tile @click="onClear">초기화</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="success" tile @click="onSubmit">회원가입</v-btn>
          </v-layout>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ko from 'vee-validate/dist/locale/ko.js';

export default {
  $_veeValidate: {
    validator: 'new'
  },
  data () {
    return {
      form: {
        email: '',
        password: '',
        passwordConfirm: '',
        firstName: '',
        lastName: '',
        color: ''
      },
      dictionary: {
        messages: ko.messages,
        attributes: {
          email: '이메일 ',
          password: '비밀번호 ',
          passwordConfirm: '비밀번호 확인 ',
          firstName: '이름 ',
          lastName: '성 '
        }
      },
      custom: {
        /*
        name: {
          required: () => "Name can not be empty",
          max: "The name field may not be greater than 10 characters"
        }
        */
      },
      visibility1: false,
      visibility2: false
    }
  },
  mounted () {
    this.$validator.localize('ko', this.dictionary)
  },
  methods: {
    onSubmit () {
      this.$validator
        .validateAll()
        .then(result => {
          if (!result) throw new Error('모든 항목을 양식에 맞게 기입해주세요.')

          this.getPersonalColor()
          return this.$http.post('/users/signup', this.form)
        })
        .then(result => {
          if (!result) throw new Error('서버에서 요청을 거부했습니다.')
          alert('회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.')
          this.$router.push({ name: 'login' })
        })
        .catch(err => {
          alert(err.message)
        })
    },
    onClear () {
      this.form.email = '';
      this.form.password = '';
      this.form.passwordConfirm = '';
      this.form.firstName = '';
      this.form.lastName = '';
      this.$validator.reset()
    },
    getPersonalColor () {
      var randomColor = require('randomcolor')
      this.form.color = randomColor({
        luminosity: 'bright'
      })
    }
  }
}
</script>
