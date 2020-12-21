<template>
  <v-flex>
    <v-app-bar color="grey darken-3" class="text-center title font-weight-light" dark>
      <!-- 팀원 아바타 버튼 -->
      <v-tooltip bottom transition="fade-transition">
        <template v-slot:activator="{ on }">
          <v-avatar color="white" size="40" class="mr-4" v-on="on" style="cursor: pointer;" v-ripple @click="getMemberCrawledData('', '', '')">
            <span class="black--text subtitle-2">ALL</span>
          </v-avatar>
        </template>
        <span>모든 데이터 보기</span>
      </v-tooltip>
      <v-tooltip v-for="member in project.members" :key="member.email" bottom transition="fade-transition">
        <template v-if="member.verified" v-slot:activator="{ on }">
          <span class="font-weight-medium" v-on="on">
            <v-avatar :color="member.color" size="40" class="mr-4" style="cursor: pointer;" v-ripple @click="getMemberCrawledData(member.email, member.first_name, member.last_name)">
              <span class="white--text subtitle-2">{{ member.last_name.charAt(0) }}</span>
            </v-avatar>
          </span>
        </template>
        <span v-if="member.verified">{{ member.first_name + ' ' + member.last_name }}</span>
        <br>
        <span>{{ member.email }}</span>
      </v-tooltip>

      <v-spacer></v-spacer>

      <!-- 기능 버튼 -->
      <v-tooltip v-for="nodeFunction in nodeFunctions" :key="nodeFunction.name" bottom transition="fade-transition">
        <template v-slot:activator="{ on }">
          <v-avatar :disabled="isCrawlingStarted" :color="isCrawlingStarted || currMember !== '' === '' ? 'grey darken-1' : 'blue darken-3'" v-on="on" size="40" class="mr-4" style="cursor: pointer;" v-ripple @click="nodeFunction.func">
            <v-icon>{{ nodeFunction.icon }}</v-icon>
          </v-avatar>
        </template>
        <span>{{ nodeFunction.name }}</span>
      </v-tooltip>

      <!-- 데이터 초기화 버튼 -->
      <v-tooltip v-if="currMember === ''" bottom transition="fade-transition">
        <template v-slot:activator="{ on }">
          <v-avatar :disabled="isCrawlingStarted" color="error" class="mr-4" v-on="on" size="40" style="cursor: pointer;" v-ripple @click="truncate">
            <v-icon>mdi-delete-forever</v-icon>
          </v-avatar>
        </template>
        <span>전체 데이터 초기화</span>
      </v-tooltip>
      <v-tooltip v-else bottom transition="fade-transition">
        <template v-slot:activator="{ on }">
          <v-avatar :disabled="isCrawlingStarted" color="error" class="mr-4" v-on="on" size="40" style="cursor: pointer;" v-ripple @click="truncate">
            <v-icon>mdi-account-remove</v-icon>
          </v-avatar>
        </template>
        <span>사용자 데이터 초기화</span>
      </v-tooltip>

      <!-- 크롤링 시작 버튼 -->
      <v-tooltip v-if="!isCrawlingStarted" bottom transition="fade-transition">
        <template v-slot:activator="{ on }">
          <v-avatar :disabled="currMember !== ''" :color="currMember !== '' ? 'grey darken-1' : 'success'" v-on="on" size="40" style="cursor: pointer;" v-ripple @click="startCrawling">
            <v-icon>mdi-play</v-icon>
          </v-avatar>
        </template>
        <span>크롤링 시작</span>
      </v-tooltip>
      <v-tooltip v-else bottom transition="fade-transition">
        <template v-slot:activator="{ on }">
          <v-avatar color="warning" v-on="on" size="40" style="cursor: pointer;" v-ripple @click="stopCrawling">
            <v-icon>mdi-pause</v-icon>
          </v-avatar>
        </template>
        <span>크롤링 중지</span>
      </v-tooltip>

      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        bottom
        color="blue darken-3"
      ></v-progress-linear>
    </v-app-bar>

    <v-layout justify-center class="d3-canvas">
      <d3-network
        :net-nodes="nodes"
        :net-links="links"
        :options="options"
        @node-click="nodeClick"
        @link-click="linkClick"
      />
    </v-layout>

    <div class="popup">
      <v-bottom-sheet v-model="sheet" inset>
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
              <v-sheet v-if="pinnedNode.tagged" tile color="blue lighten-2" class="headline">
                <span class="font-weight-light">태그 표시 여부:</span>
                <span v-if="pinnedNode.tagged[0] === 'True'" class="font-weight-bold ml-2 green--text text--darken-2">TRUE</span>
                <span v-else class="font-weight-bold ml-2 red--text text--darken-3">FALSE</span>
              </v-sheet>
              <!-- <v-sheet v-if="pinnedNode.tagged.length > 0" tile color="blue lighten-2" class="headline">
                <span class="font-weight-light">태그 표시한 팀원:</span>
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
              </v-sheet> -->
            </v-col>
          </v-row>
        </v-sheet>
        <v-sheet v-if="pinnedNode.id !== 1" class="pa-6" tile>
          <div class="headline font-weight-medium">
            <span v-if="pinnedNode.level > 1">{{ pinnedNode.keyword.main }}</span>
            <span v-else>연관 검색어</span>
          </div>
          <div class="title font-weight-light">
            <div v-if="pinnedNode.level > 1" class="ma-0">
              <span
                v-for="(subKeyword, index) in pinnedNode.keyword.sub"
                :key="index"
              >{{ subKeyword }}<span v-if="index !== pinnedNode.keyword.sub.length - 1">, </span></span>
            </div>
            <div v-else class="ma-0">
              <span
                v-for="(keyword, index) in pinnedNode.relativeKeywordList"
                :key="index"
              >{{ keyword }}<span v-if="index !== pinnedNode.relativeKeywordList.length - 1">, </span></span>
            </div>
          </div>
        </v-sheet>
        <v-sheet v-if="pinnedNode.level > 1" class="pa-6" tile dark color="grey darken-2">
          <div
            v-for="(content, index) in pinnedNode.pageContents"
            :key="index"
            class="subtitle-2 font-weight-light"
          >{{ content.length > 50 ? content.substr(0, 49).concat('...') : content }}<br/></div>
        </v-sheet>
        <v-sheet v-if="pinnedNode.memo !== ''" class="pa-6" tile dark color="grey darken-3">
          <span class="headline font-weight-medium">MEMO</span>
          <br>
          <span class="title font-weight-light">{{ pinnedNode.memo }}</span>
        </v-sheet>
      </v-bottom-sheet>
      <!-- <node-detail-sheet :pinnedNode="pinnedNode" :project="project" :sheet="sheet" @update="updateSheet"></node-detail-sheet> -->
    </div>
  </v-flex>
</template>

<script>
import D3Network from 'vue-d3-network';
import jwtDecode from 'jwt-decode';
import queryParser from 'query-string'
// import NodeDetailSheet from './NodeDetailSheet';

import { nodeMixin } from './mixins/nodeMixin.js'
import { d3Mixin } from './mixins/d3Mixin.js'
import { functionMixin } from './mixins/functionMixin.js'

// 사용할 검색 엔진
const SEARCH_ENG = 'google';

export default {
  mixins: [ nodeMixin, d3Mixin, functionMixin ],
  components: {
    D3Network
    // NodeDetailSheet
  },
  props: {
    project: {
      type: Object
    }
  },
  data () {
    return {
      decoded: '',
      prevURL: '',
      currURL: '',
      prevQuery: '',
      sheet: false,
      loading: false,
      totalData: [],
      crawledData: {},
      // intervalFunc: 0,
      isCrawlingStarted: false,
      currMember: '',
      visitRateThreshold: 0.5,
      optimizedNodes: [],
      pinnedNode: {
        id: 0,
        name: {
          host: '',
          rest: []
        },
        level: 0,
        paths: [],
        url: '',
        keyword: {
          main: '',
          sub: []
        },
        tagged: '',
        memo: ''
      }
    }
  },
  computed: {
    options () {
      return {
        force: 4000,
        size: { w: 800, h: 800 },
        nodeSize: this.nodeSize,
        fontSize: this.fontSize,
        linkWidth: this.linkWidth,
        nodeLabels: true,
        linkLabels: true,
        canvas: false
      }
    }
  },
  watch: {
    // 노드 클릭 시 나타나는 하단 정보 시트를 종료했을 경우 고정된 노드를 해제
    sheet (val) {
      if (!val) {
        var node = this.nodes.find(x => {
          return x.id === this.pinnedNode.id
        })
        this.nodes[node.id].fx = null
        this.nodes[node.id].fy = null
      }
    }
  },
  created () {
    this.decoded = jwtDecode(localStorage.getItem('userToken'))

    this.loading = true

    // 루트 노드, etc. 노드 초기화
    this.addZeroNode()
    this.addInitialNodesAndLinks('', 'etc.')

    this.$http
      .get('/data', { params: { name: this.project.project_name } })
      .then(result => {
        this.totalData = result.data
        if (this.totalData.length > 0) {
          // 이후의 노드 초기화
          this.initializeNodes()

          this.loading = false
        }
      })
      .catch(err => {
        console.log(err)
      })
  },
  mounted () {
    this.options.size.w = this.canvasWidth
    this.options.size.h = this.canvasHeight

    window.addEventListener('message', e => {
      if (e.source != window) return
      
      if (e.data.type && (e.data.type == "getCrawledData")) {
        if (this.isCrawlingStarted) {
          console.log("Received prevURL: " + e.data.prevURL)
          console.log("Received currURL: " + e.data.currURL)

          this.getCrawledData(e.data.prevURL, e.data.currURL)
        }
      }
    }, false)
  },
  methods: {
    // 크롤링 시작 함수 (5초마다 크롤링 수행)
    startCrawling () {
      this.isCrawlingStarted = true

      this.resetNodes()

      // 현재 팀원의 노드 정보를 서버에 요청
      this.$http
        .get('/data', {
          params: {
            name: this.project.project_name,
            memberEmail: this.decoded.email
          }
        })
        .then(result => {
          this.totalData = result.data
          if (this.totalData.length > 0) {
            // 이후의 노드 초기화
            this.initializeNodes()
          }

          // this.intervalFunc = setInterval(() => {
          //   this.getCrawledData()
          // }, 5000)

          window.open('https://www.google.com')
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 크롤링 중지 함수
    stopCrawling () {
      this.isCrawlingStarted = false
      this.loading = true

      // clearInterval(this.intervalFunc)

      this.$http
        .get('/data/stop', { params: { name: this.project.project_name } })
        .then(result => {
          this.totalData = result.data
          if (this.totalData.length > 0) {
            this.resetNodes()

            // 이후의 노드 초기화
            this.initializeNodes()

            this.loading = false
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 자동 크롤링 수행 함수
    getCrawledData (prev, curr) {
      this.prevURL = prev
      this.currURL = curr

      // 부모 노드 검색 결과가 여러 개일 경우, 본인이 찾은 노드를 부모 노드로 선정
      var parentNodes = this.nodes.filter(node => {
        if (this.prevURL === '') {
          return node.name.split(' ')[1] === 'etc.';
        } else {
          return node.currURL === this.prevURL
        }
      })
      console.log(parentNodes)

      var parentNode
      if (parentNodes.length > 1) {
        parentNode = parentNodes.find(node => node.founder === this.decoded.email)
      } else if (parentNodes.length === 1) {
        parentNode = parentNodes[0]
      }

      var parentLevel = parentNode ? parentNode.level : 1

      // axios를 이용, 서버에 값 요청
      this.$http
        .post('/data/node', {
          projectName: this.project.project_name,
          userEmail: this.decoded.email,
          userName: this.decoded.first_name + ' ' + this.decoded.last_name,
          prevURL: this.prevURL,
          currURL: this.currURL,
          parentLevel
        })
        .then(response => {
          console.log(response)
          if (response.data.notUrl) {
            if (response.data.isMainPage) {
              // Google 메인 페이지인 경우 (DB에 저장되지 않음)
              this.crawledData.level = response.data.level
              this.crawledData.paths = response.data.paths
            } else {
              // 올바른 URL이 아닌 경우
              console.log('올바른 URL이 아닙니다.')
            }
          } else {
            this.crawledData = response.data

            if (this.crawledData.paths) {
              // 불러온 데이터로부터 노드 생성 및 추가
              this.addNodesfromCrawledData(this.crawledData)
            }
          }
        })
        .catch(err => {
          throw err
        })
    },
    // 모든 노드 삭제
    truncate () {
      if (confirm('모든 노드를 삭제하시겠습니까?')) {
        // memberEmail = []
        // for (member in project.members) {
        //   memberEmail.push(member.email)
        // }

        this.$http
          .delete('/data')
          // .delete('/data', {
          //   name: project.project_name,
          //   email: memberEmail
          // })
          .then(result => {
            this.resetNodes()

            alert('모든 노드를 삭제했습니다.')
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    // 노드, 간선 삭제 및 초기화 함수
    resetNodes () {
      // 노드 초기화
      this.nodes = []
      this.links = []
      this.nodeIndex = 0
      this.prevURL = '';
      this.prevQuery = '';

      // 루트 노드, etc. 노드 초기화
      this.addZeroNode()
      this.addInitialNodesAndLinks('', 'etc.')
    },
    // 노드 초기화
    initializeNodes () {
      // 각 URL에 대해 진행
      this.totalData.forEach((item, index) => {
        this.addNodesfromCrawledData(item)
      })
    },
    // 크롤링한 데이터를 노드로 추가
    addNodesfromCrawledData (data) {
      var nodeLevel1 = '';

      // URL이 레벨 1인지 검사
      if (data.paths[0].indexOf('www.' + SEARCH_ENG) !== -1) {
        if (data.paths.length > 1) {
          nodeLevel1 = data.paths[1]
          this.prevQuery = nodeLevel1
          this.addInitialNodesAndLinks(data, nodeLevel1)
        } else {
          this.prevQuery = '';
        }
      } else {
        if (this.prevURL.indexOf('www.' + SEARCH_ENG) !== -1) {
          // 이전 URL이 검색 결과 페이지일 경우
          nodeLevel1 = this.prevQuery
        } else {
          // 이전 URL이 없거나 일반 홈페이지일 경우
          // etc. 처리
          this.prevQuery = '';
          nodeLevel1 = 'etc.';
        }

        // 레벨 1 노드 및 간선 추가
        this.addInitialNodesAndLinks(data, nodeLevel1)

        // 레벨 2 이상일 경우 노드 및 간선 추가
        this.addNodesAndLinks(data)
      }
    },
    // 레벨 0 노드 추가
    addZeroNode () {
      this.nodes.push({
        id: this.nodeIndex++,
        name: this.project.topic,
        _color: '#0D47A1',
        level: 0,
        fx: this.canvasWidth / 2,
        fy: this.canvasHeight / 2
      })
      this.nodes[0].pinned = true
    },
    // 레벨 1 노드 및 간선 추가
    addInitialNodesAndLinks (data, label) {
      var isPushed = false // 노드 중복 여부

      // 레벨 1 노드의 이름이 존재할 경우에만 노드 생성
      if (label === '') {
        isPushed = true
      } else {
        // 이미 존재하는 노드인지 검사
        this.nodes.forEach((item, index) => {
          if (item.level === 1) {
            if (item.name === `[1] ${label}`) {
              isPushed = true
            }
          }
        })
      }

      // 중복되는 노드가 없다면 새 노드 생성 및 간선 연결
      if (!isPushed) {
        this.nodes.push({
          id: this.nodeIndex++,
          name: `[1] ${label}`,
          _color: '#64B5F6',
          level: 1,
          founder: data.user_email,
          currURL: label !== 'etc.' ? data.curr_url : label,
          paths: label !== 'etc.' ? data.paths : null,
          keyword: label !== 'etc.' ? data.keyword : '',
          subKeyword: label !== 'etc.' ? data.sub_keyword : '',
          tagged: label !== 'etc.' ? data.tagged : '',
          memo: label !== 'etc.' ? data.memo : '',
          visitRate: data.visit_rate ? data.visit_rate : 0,
          relativeKeywordList: data.relativeKeywordList ? data.relativeKeywordList : [],
          pageContents: []
        })
        console.log(
          'Node created (idx, lv, name): ' +
            (this.nodeIndex - 1) +
            ', 1, ' +
            decodeURI(label)
        )

        this.links.push({
          sid: 0,
          tid: this.nodeIndex - 1,
          _svgAttrs: { 'stroke-width': 10, opacity: 1 }
        })
        console.log('Link created : 0 -> ' + (this.nodeIndex - 1))
      }
    },
    // 레벨 2 이후의 노드 및 간선 추가
    addNodesAndLinks (data) {
      var joinedURL = data.paths.join('')
      var duplicatedLinkTid = -1
      var prevNode
      var prevNodeURL = data.prev_url

      // 각 노드들과 비교하여 현재 URL이 중복되는 노드가 존재하는지 검사
      var duplicatedNode = this.nodes.find(node => {
        return node.currURL === data.curr_url
        // if (node.founder) {
        //   return node.currURL === data.curr_url && node.founder === this.decoded.email
        // } else {
        //   return node.currURL === data.curr_url
        // }
      })
      // var duplicatedNodes = this.nodes.filter(node => {
      //   return node.currURL === data.curr_url
      // })
      // if (duplicatedNodes) {
      //   duplicatedNodes.forEach(node => {
      //     console.log(node.name + ', ' + node.id)
      //   })
      // }

      // 부모 노드 검색
      // 구글 검색 결과의 URL이 .com으로 끝나거나 .co.kr로 끝나는 경우가 있으므로
      // 해당 URL에서 검색어만 추출하여 일치하는지 검사
      if (prevNodeURL.indexOf('www.' + SEARCH_ENG) !== -1 && prevNodeURL.indexOf('/search?') !== -1) {
        var parsedQuery = new URL(prevNodeURL).searchParams.get('q')

        // 부모 노드의 검색어와 현재 노드의 URL 내 검색 쿼리가 일치하는 노드 찾기
        prevNode = this.nodes.find(node => {
          if (node.paths) {
            return node.paths[1] === parsedQuery
          } else {
            // 레벨 0인 노드는 paths 속성이 존재하지 않으므로 검사에서 패스
            return
          }
        })
      } else {
        // prevNode = this.nodes.find(node => node.currURL === prevNodeURL)
        // 부모 노드 검색 결과가 여러 개일 경우, 본인이 찾은 노드를 부모 노드로 선정
        // var prevNodes = this.nodes.filter(node => node.currURL === prevNodeURL)
        var prevNodes = this.nodes.filter(node => {
          return node.currURL === prevNodeURL
        })

        if (prevNodes.length > 1) {
          prevNode = prevNodes.find(node => node.founder === data.user_email)
        } else if (prevNodes.length === 1) {
          prevNode = prevNodes[0]
        }
      }

      // 중복된 노드가 있는 경우 간선까지 중복되는지 검사
      if (duplicatedNode) {
        var link = this.links.find(x => {
          return x.tid === duplicatedNode.id
        })
        if (link.sid === prevNode.id) {
          duplicatedLinkTid = link.tid
        }
      }

      if (duplicatedLinkTid === -1) {
        // 간선은 중복되지 않은 경우
        
        // 노드 생성
        this.nodes.push({
          id: this.nodeIndex++,
          name: `[${data.level}] ${this.getNodeName(data.paths, joinedURL)}`,
          level: data.level,
          founder: data.user_email,
          prevURL: data.prev_url,
          currURL: data.curr_url,
          paths: data.paths,
          keyword: data.keyword,
          subKeyword: data.sub_keyword,
          tagged: data.tagged,
          memo: data.memo,
          visitRate: data.visit_rate ? data.visit_rate : 0,
          relativeKeywordList: {},
          pageContents: data.pageContents ? data.pageContents : []
        })
        console.log(
          'Node created (idx, lv, name): ' +
            (this.nodeIndex - 1) +
            ', ' +
            data.level +
            ', ' +
            decodeURI(joinedURL)
        )

        // 간선 연결
        var sid = prevNode.id
        var tid = this.nodeIndex - 1
        this.links.push({ sid, tid })
        console.log('Link created : ' + sid + ' -> ' + tid)
      }
    },
    // 선택된 노드에 대한 정보를 객체에 저장
    savePinnedNode (node) {
      this.pinnedNode.id = node.id
      this.pinnedNode.level = node.level
      this.pinnedNode.paths = node.paths
      this.pinnedNode.url =
        node.currURL !== 'etc.'
          ? decodeURI(node.currURL)
          : 'Google 검색 결과 페이지를 거치지 않고 접속한 페이지들이 하위 노드로 생성됩니다.';
      this.pinnedNode.name = {
        host:
          node.level > 1
            ? decodeURI(node.paths[0])
            : node.name.slice(node.name.indexOf(' ') + 1),
        rest: node.level > 1 ? decodeURI(node.paths.slice(1).join('')) : ''
      }
      this.pinnedNode.keyword.main = node.keyword
      this.pinnedNode.keyword.sub = node.subKeyword
      this.pinnedNode.tagged = node.tagged
      this.pinnedNode.memo = node.memo
      this.pinnedNode.visitRate = node.visitRate
      this.pinnedNode.relativeKeywordList = Object.keys(node.relativeKeywordList)
      this.pinnedNode.pageContents = node.level > 1 ? node.pageContents : []
    },
    // updateSheet () {
    //   this.sheet = !this.sheet
    // }
  }
}
</script>

<style>
@import '../assets/css/vue-d3-network-dots.css';
</style>
