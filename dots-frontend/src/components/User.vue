<template>
  <v-app>
    <v-container grid-list-xl grid-list-lg class="content-index">
      <div>
        <span class="display-1 font-weight-bold">{{user.firstName}}</span>
        <span class="display-1 font-weight-light">님의 프로젝트</span>
      </div>
      <br />
      <div>
        <v-layout wrap>
          <div v-for="project in projects" :key="project.project_id" class="ma-0">
            <template v-for="member in project.members">
              <v-hover v-if="member.verified && member.email === user.email" v-slot:default="{ hover }" :key="member.email">
                <v-card width="350" min-height="300" class="ma-2" tile :elevation="hover ? 12 : 2">
                  <v-img
                    class="white--text"
                    height="200px"
                    src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
                  >
                    <v-card-title class="align-end fill-height">{{ project.project_name }}</v-card-title>
                  </v-img>

                  <v-card-text>
                    <span class="subtitle-1">{{ project.team_name }}</span>
                    <br />
                    <span class="text--primary">
                      <span>{{ project.description }}</span>
                    </span>
                  </v-card-text>

                  <v-card-actions>
                    <v-btn
                      text
                      tile
                      color="blue darken-4"
                      @click="$router.push({ path: `/project/${project.project_id}` })"
                    >프로젝트 시작</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                      v-if="user.email === project.founder_email"
                      text
                      tile
                      color="red"
                      @click.stop="clickedProject(project.project_name)"
                    >삭제</v-btn>
                  </v-card-actions>
                </v-card>
              </v-hover>
            </template>
          </div>

          <v-hover v-slot:default="{ hover }">
            <v-card
              width="350"
              min-height="300"
              class="ma-2 d-flex text-center align-center"
              tile
              :elevation="hover ? 12 : 2"
              style="cursor: pointer;"
              v-ripple="{ center: true }"
              @click="createProject"
            >
              <v-card-text>
                <v-icon color="blue darken-4" x-large>mdi-plus</v-icon>
                <br />
                <br />
                <span class="headline">새 프로젝트 생성</span>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-layout>
      </div>

      <v-dialog v-model="removeDialog" persistent max-width="600">
        <v-card tile>
          <v-card-title class="headline">해당 프로젝트를 삭제하시겠습니까?</v-card-title>
          <v-card-text
            class="headline font-weight-bold blue--text text--darken-4"
            color="blue darken-4"
          >{{currentProject}}</v-card-text>
          <v-card-text>
            한 번 삭제한 프로젝트는 영원히 복구할 수 없습니다.
            <br />그래도 삭제를 원하신다면, 아래 입력란에 프로젝트의 이름을 입력해주세요.
          </v-card-text>

          <v-text-field v-model="confirmStr" single-line solo-inverted class="mx-4"></v-text-field>

          <v-card-actions>
            <div class="flex-grow-1"></div>

            <v-btn color="green darken-1" text tile @click="cancelRemove">취소</v-btn>
            <v-btn color="red darken-1" text tile @click="confirmRemove">확인</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script>
export default {
  props: {
    user: {
      type: Object
    }
  },
  data () {
    return {
      removeDialog: false,
      currentProject: '',
      confirmStr: '',
      projects: []
    }
  },
  created () {
    this.$http
      .get('/projects', {
        params: {
          email: this.user.email
        }
      })
      .then(result => {
        this.projects = result.data
      })
      .catch(err => {
        console.log(err)
      })
  },
  methods: {
    createProject () {
      setTimeout(() => {
        this.$router.push({ name: 'create-project' })
      }, 100)
    },
    clickedProject (name) {
      this.removeDialog = true
      this.currentProject = name
    },
    confirmRemove () {
      if (this.currentProject === this.confirmStr) {
        // 프로젝트 통합 컬렉션 삭제
        this.$http
          .delete(`/data/${this.currentProject}_after_data`)
          .then(result => {})
          .catch(err => {
            console.log(err)
          })

        // 모든 프로젝트 사용자 컬렉션 삭제
        var projectObj = this.projects.find(val => val.project_name === this.currentProject)
        projectObj.members.forEach(val => {
          this.$http
            .delete(`/data/${this.currentProject}_${val.email}`)
            .then(result => {})
            .catch(err => {
              console.log(err)
            })
        })

        // 프로젝트 도큐먼트 삭제
        this.$http
          .delete(`/projects/${this.currentProject}`)
          .then(result => {})
          .catch(err => {
            console.log(err)
          })

        this.cancelRemove()
        history.go(0)
      }
    },
    cancelRemove () {
      this.removeDialog = false
      this.confirmStr = '';
      this.currentProject = '';
    }
  }
}
</script>
