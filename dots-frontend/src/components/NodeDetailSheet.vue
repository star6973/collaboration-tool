<template>
  <v-bottom-sheet v-model="detailSheet" inset @loadeddata="afterTransition">
    <v-sheet class="pa-6" tile color="blue darken-4">
      <div class="display-1 white--text">{{ pinnedNode.name.host }}</div>
      <div class="headline grey--text text--lighten-1">{{ pinnedNode.name.rest }}</div>
    </v-sheet>
    <v-sheet class="pa-6" tile color="blue darken-3">
      <div class="title-1 font-weight-light grey--text text--lighten-2">{{ pinnedNode.url }}</div>
    </v-sheet>
    <v-sheet class="pa-6" tile color="blue lighten-2">
      <v-row no-gutters>
        <v-col cols="3">
          <v-sheet tile color="blue lighten-2" class="headline">
            <span class="font-weight-light">노드 ID:</span>
            <span class="font-weight-medium ml-2">{{ pinnedNode.id }}</span>
          </v-sheet>
        </v-col>
        <v-col cols="3">
          <v-sheet tile color="blue lighten-2" class="headline">
            <span class="font-weight-light">노드 레벨:</span>
            <span class="font-weight-medium ml-2">{{ pinnedNode.level }}</span>
          </v-sheet>
        </v-col>
        <v-col cols="6">
          <v-sheet v-if="pinnedNode.tagged.length > 0" tile color="blue lighten-2" class="headline">
            <span class="font-weight-light">이 URL에 태그 표시한 팀원:</span>
            <span
              v-for="member in project.members"
              :key="member.email"
              class="font-weight-medium ml-2"
            >
              <span v-for="(user, index) in pinnedNode.tagged" :key="index" class="mx-2">
                <v-avatar v-if="member.email === user" :color="member.color" size="32">
                  <span class="white--text subtitle-2">{{ member.last_name.charAt(0) }}</span>
                </v-avatar>
              </span>
            </span>
          </v-sheet>
          <v-sheet v-else tile color="blue lighten-2" class="headline">
            <span class="font-weight-light">태그 표시한 팀원:</span>
            <span class="font-weight-medium ml-2">없음</span>
          </v-sheet>
        </v-col>
      </v-row>
    </v-sheet>
    <v-sheet v-if="pinnedNode.id !== 1" class="pa-6" tile>
      <div class="headline">
        <span class="font-weight-medium">{{ pinnedNode.keyword.main }}</span>
        <span
          v-for="(subKeyword, index) in pinnedNode.keyword.sub"
          :key="index"
          class="font-weight-light"
        >, {{ subKeyword }}</span>
      </div>
    </v-sheet>
    <v-sheet v-if="pinnedNode.id !== 1" class="pa-6" tile dark color="grey darken-3">
      <div class="headline">
        <span class="font-weight-light">{{ pinnedNode.memo }}</span>
      </div>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script>
export default {
  name: 'node-detail-sheet',
  props: {
    pinnedNode: {
      type: Object
    },
    project: {
      type: Object
    },
    sheet: {
      type: Boolean
    }
  },
  data () {
    return {
      detailSheet: this.sheet,
      isSheetOpened: false
    }
  },
  watch: {
    sheet (val) {
      this.detailSheet = val
    }
  },
  methods: {
    afterTransition() {
      // 시트가 열린 상태에서 닫을 경우 버튼 오류를 방지하기 위해
      // 이벤트 버스를 이용하여 부모 컴포넌트와 데이터 공유
      if (!this.isSheetOpened) {
        this.isSheetOpened = true
      } else {
        this.$emit('update')
        this.isSheetOpened = false
      }
      console.log(this.isSheetOpened)
    }
  }
}
</script>
