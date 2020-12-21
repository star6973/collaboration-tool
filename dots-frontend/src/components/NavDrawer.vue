<template>
  <v-navigation-drawer v-model="navDrawer" @transitionend="afterTransition" temporary app>
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="headline">{{ project.team_name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <template v-for="member in project.members">
        <v-list-item v-if="member.verified" :key="member.email" two-line>
          <v-list-item-avatar>
            <v-avatar :color="member.color">
              <span class="white--text">{{ member.last_name.charAt(0) }}</span>
            </v-avatar>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ member.first_name }} {{ member.last_name }}</v-list-item-title>
            <v-list-item-subtitle>{{ member.position }}</v-list-item-subtitle>
          </v-list-item-content>

          <!-- <v-icon v-if="member.isUser" color="blue darken-4">mdi-star</v-icon> -->
        </v-list-item>
      </template>

      <v-list-item @click="inviteDialog = true">
        <v-list-item-icon>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>팀원 초대</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list>
      <v-list-item @click="$router.push({ name: 'user' })">
        <v-list-item-icon>
          <v-icon>mdi-home</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>홈으로</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-icon>
          <v-icon>mdi-settings</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>설정</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-icon>
          <v-icon>mdi-help-circle</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>도움말</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-icon>
          <v-icon>mdi-information</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>정보</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-footer
      class="mb-2 transparent body-2"
      fixed
    >&copy; {{ new Date().getFullYear() }} DoTS. All rights reserved.</v-footer>

    <v-dialog v-model="inviteDialog" persistent max-width="600">
      <v-card tile>
        <v-card-title class="headline">팀원 추가</v-card-title>
        <v-card-text>
          새로운 팀원을 추가합니다. 추가하고자 하는 팀원의 이메일을 입력해주세요.
          <br />해당 회원의 이메일로 초대 메일을 발송합니다.
          <br />단, DoTS에 가입된 회원만 초대할 수 있습니다.
        </v-card-text>

        <v-text-field v-model="memberEmail" single-line solo-inverted class="mx-4" @keypress.enter="findUser"></v-text-field>

        <v-card-actions>
          <div class="flex-grow-1"></div>

          <v-btn color="green darken-1" text tile @click.stop="cancel">취소</v-btn>
          <v-btn color="blue darken-4" text tile @click.stop="findUser">이메일 전송</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isUserNotValid" persistent max-width="600">
      <v-card tile>
        <v-card-title class="headline">오류</v-card-title>
        <v-card-text>
          가입된 회원이 아닙니다. 팀원 초대는 오직 가입된 회원에게만 할 수 있습니다.
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>

          <v-btn color="blue darken-4" text tile @click.stop="isUserNotValid = !isUserNotValid">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isEmailEmpty" persistent max-width="600">
      <v-card tile>
        <v-card-title class="headline">오류</v-card-title>
        <v-card-text>
          이메일을 입력해주세요.
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>

          <v-btn color="blue darken-4" text tile @click.stop="isEmailEmpty = !isEmailEmpty">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isSucceeded" persistent max-width="600">
      <v-card tile>
        <v-card-title class="headline">전송 완료</v-card-title>
        <v-card-text>
          해당 회원의 이메일로 초대 메일이 발송되었습니다.
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>

          <v-btn color="blue darken-4" text tile @click.stop="cancel">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script>
import jwtDecode from 'jwt-decode';

export default {
  name: 'nav-drawer',
  props: {
    project: {
      type: Object
    },
    drawer: {
      type: Boolean
    }
  },
  data () {
    return {
      inviteDialog: false,
      memberEmail: '',
      isUserNotValid: false,
      isEmailEmpty: false,
      isSucceeded: false,
      navDrawer: this.drawer,
      isDrawerOpened: false
    }
  },
  watch: {
    drawer (val) {
      this.navDrawer = val
    }
  },
  methods: {
    cancel () {
      this.inviteDialog = false
      this.isSucceeded = false
      this.memberEmail = ''
    },
    findUser () {
      if (this.memberEmail === '') {
        this.isEmailEmpty = true
      } else {
        this.$http
          .get('/users', { params: { email: this.memberEmail } })
          .then(result => {
            if (!result.data) {
              this.isUserNotValid = true
              throw new Error('Invalid user email')
            } else {
              const decoded = jwtDecode(localStorage.getItem('userToken'))

              this.$http.post('/mail/invite', {
                email: this.memberEmail,
                sender: decoded,
                newMember: result.data,
                project: this.project
              })
            }
          })
          .then(result => {
            this.isSucceeded = true
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    afterTransition() {
      // 내비게이션 드로어가 열린 상태에서 닫을 경우 버튼 오류를 방지하기 위해
      // 이벤트 버스를 이용하여 부모 컴포넌트와 데이터 공유
      if (!this.isDrawerOpened) {
        this.isDrawerOpened = true
      } else {
        this.$emit('update')
        this.isDrawerOpened = false
      }
    }
  }
}
</script>
