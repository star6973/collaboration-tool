<template>
  <v-app>
    <v-container grid-list-xl grid-list-lg class="content-index">
      <div>
        <span class="display-1 font-weight-bold">새 프로젝트 생성</span>
        <br />
        <span class="display-1 font-weight-light">새 프로젝트의 정보를 입력하세요.</span>
      </div>
      <br />
      <v-layout>
        <v-flex xl6 lg9 sm12>
          <v-form>
            <div class="headline">프로젝트 이름</div>
            <div class="title-1 mb-2">새 프로젝트를 대표하는 이름입니다.</div>
            <v-text-field
              v-validate="'required|min:4'"
              :error-messages="errors.collect('projectName')"
              data-vv-name="projectName"
              v-model="form.projectName"
              required
              single-line
              solo
              class="mb-2"
            ></v-text-field>
            <div class="headline">프로젝트 설명</div>
            <div class="title-1 mb-2">프로젝트에 대한 설명을 한 문장으로 요약해주세요.</div>
            <v-text-field
              v-validate="'max:30'"
              :error-messages="errors.collect('description')"
              data-vv-name="description"
              v-model="form.description"
              counter="30"
              maxlength="30"
              solo
              class="mb-2"
            ></v-text-field>
            <div class="headline">프로젝트 주제</div>
            <div class="title-1 mb-2">프로젝트의 핵심 주제로, 루트 노드(레벨 0)의 이름이기도 합니다.</div>
            <v-text-field
              v-validate="'required'"
              :error-messages="errors.collect('topic')"
              data-vv-name="topic"
              v-model="form.topic"
              required
              single-line
              solo
              class="mb-2"
            ></v-text-field>
            <div class="headline">팀 이름</div>
            <div class="title-1 mb-2">프로젝트를 수행하는 팀의 이름입니다. 팀원은 나중에 추가할 수 있습니다.</div>
            <v-text-field
              v-validate="'required'"
              :error-messages="errors.collect('teamName')"
              data-vv-name="teamName"
              v-model="form.teamName"
              required
              single-line
              solo
              class="mb-2"
            ></v-text-field>
            <v-layout class="text-center">
              <v-btn color="info" tile text @click="onClear">초기화</v-btn>
              <v-spacer></v-spacer>
              <v-btn color="success" tile text @click="onSubmit">프로젝트 생성</v-btn>
            </v-layout>
          </v-form>
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
import ko from 'vee-validate/dist/locale/ko.js';

export default {
  $_veeValidate: {
    validator: 'new'
  },
  props: {
    user: {
      type: Object
    }
  },
  data () {
    return {
      form: {
        projectId: '',
        projectName: '',
        description: '',
        topic: '',
        teamName: '',
        user: this.user
      },
      dictionary: {
        messages: ko.messages,
        attributes: {
          projectName: '프로젝트 이름 ',
          description: '프로젝트 설명 ',
          topic: '프로젝트 주제 ',
          teamName: '팀 이름 '
        }
      },
      custom: {
        /*
        name: {
          required: () => "Name can not be empty",
          max: "The name field may not be greater than 10 characters"
        }
        */
      }
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

          // 프로젝트 ID 생성
          this.form.projectId = Math.random()
            .toString(36)
            .substring(2, 12)

          // 중복되는 프로젝트 ID가 존재하는지 검사
          return this.$http.get('/projects/find', {
            params: {
              id: this.form.projectId
            }
          })
        })
        .then(result => {
          if (!result.data.id) throw new Error('서버에서 요청을 거부했습니다.')

          this.form.projectId = result.data.id
          return this.$http.post('/projects/create', this.form)
        })
        .then(result => {
          if (!result) throw new Error('서버에서 요청을 거부했습니다.')

          alert('프로젝트 생성이 완료되었습니다.')
          this.$router.push({ name: 'user' })
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
    }
  }
}
</script>
