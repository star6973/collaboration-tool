export const functionMixin = {
  data () {
    return {
      nodeFunctions: [
        {
          name: '파생 키워드 및 노드를 표시하려면 Shift 키를 누른 상태에서 노드를 클릭해주세요.',
          icon: 'mdi-link-variant',
          func: function() { }
        },
        {
          name: '태그 표시된 노드 표시',
          icon: 'mdi-tag-multiple',
          func: this.getTaggedNodes
        },
        {
          name: '다수 / 소수 구별',
          icon: 'mdi-account-multiple-outline',
          func: this.distinguishNodes
        },
        {
          name: '최적 경로 표시',
          icon: 'mdi-map-marker-path',
          func: this.getOptimizedNodes
        }
      ]
    }
  },
  methods: {
    // 기능 1: 사용자 별로 조사한 URL로 노드 생성
    getMemberCrawledData (memberEmail, memberFirstName, memberLastName) {
      if (this.isCrawlingStarted) return

      // 부모 컴포넌트에 현재 사용자의 이름 전달
      this.EventBus.$emit('sendMemberName', { memberFirstName, memberLastName })

      // 사용자 컬렉션의 데이터를 얻어 올 경우 기능 및 크롤링 버튼을 비활성화
      this.currMember = memberEmail

      this.resetNodes()

      // 노드 정보를 서버에 요청 (팀원 이메일이 빈 문자열이면 통합 컬렉션의 데이터를 불러옴)
      this.$http
        .get('/data', {
          params: {
            name: this.project.project_name,
            memberEmail
          }
        })
        .then(result => {
          this.totalData = result.data
          if (this.totalData.length > 0) {
            // 이후의 노드 초기화
            this.initializeNodes()
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 기능 2: 사용자들이 태그 표시한 URL로만 노드 생성
    getTaggedNodes () {
      if (this.currMember !== '') {
        alert('사용자 데이터에서는 확인할 수 없습니다.')
        return
      }

      this.resetNodes()

      // 노드 정보를 서버에 요청 (팀원 이메일이 빈 문자열이면 통합 컬렉션의 데이터를 불러옴)
      this.$http
        .get('/data', {
          params: {
            name: this.project.project_name
          }
        })
        .then(result => {
          this.totalData = result.data
          if (this.totalData.length > 0) {
            // 이후의 노드 초기화
            this.initializeNodes()
          }
        }).then(result => {
          var isTaggedNode = false
          var deleteNodes = []

          this.nodes.forEach(node => {
            if (node.tagged) {
              // 태그 표시가 안 된 노드 발견 시 간선을 새로 연결하고 연결이 안된 모든 노드 삭제
              if (node.tagged[0] !== "True") {
                var targetLinks = this.links.filter(link => link.sid === node.id)
                var sourceLink = this.links.find(link => link.tid === node.id)
                var currLinkIndex

                console.log(targetLinks)
                console.log(sourceLink)

                // 기존 간선을 삭제하고 삭제 노드의 부모 노드와 다시 연결
                targetLinks.forEach(currLink => {
                  console.log(currLink.source.name + ' -X- ' + currLink.target.name)
                  var newTid = currLink.tid
                  currLinkIndex = this.links.findIndex(link => link.sid === currLink.sid && link.tid === currLink.tid)
                  this.links.splice(currLinkIndex, 1)
                  this.links.push({ sid: sourceLink.sid, tid: newTid })
                })
                currLinkIndex = this.links.findIndex(link => link.sid === sourceLink.sid && link.tid === sourceLink.tid)
                this.links.splice(currLinkIndex, 1)

                // 삭제할 노드 배열에 저장
                deleteNodes.push(node.name)
              } else {
                isTaggedNode = true
              }
            }
          })

          // 간선 연결이 안된 노드 삭제
          deleteNodes.forEach(nodeName => {
            var idx = this.nodes.findIndex(node => node.name === nodeName)
            this.nodes.splice(idx, 1)
          })

          if (!isTaggedNode) {
            alert('태그 표시된 웹 페이지가 없습니다.')
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 기능 3: 파생 키워드 및 노드 표현
    getRelevantNodes (node) {
      // 노드 정보를 서버에 요청 (팀원 이메일이 빈 문자열이면 통합 컬렉션의 데이터를 불러옴)
      this.$http
        .get('/data/origin', {
          params: {
            name: this.project.project_name,
            founder: node.founder,
            currURL: node.currURL
          }
        })
        .then(result => {
          result.data.forEach(relevantNode => {
            var nodeIndex = this.nodes.findIndex(currNode => {
              return currNode.currURL === relevantNode.curr_url && currNode.founder === relevantNode.founder
            })
            this.nodes[nodeIndex]._color = 'yellow'
            if (this.nodes[nodeIndex].level === 1) {
              this.nodes[nodeIndex]._labelClass = 'derived'
            }
          })
          this.nodes[0]._color = 'yellow'
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 기능 4: 방문 횟수를 기반으로 다수/소수가 조사한 자료 구별
    // 통합 컬렉션 내의 방문 비율()을 사용하여 일정 비율 이상이면 간선을 파란색으로,
    // 그 외일 경우 간선을 빨간색으로 표현할 것
    distinguishNodes () {
      if (this.currMember !== '') {
        alert('사용자 데이터에서는 확인할 수 없습니다.')
        return
      }

      this.resetNodes()

      // 노드 정보를 서버에 요청 (팀원 이메일이 빈 문자열이면 통합 컬렉션의 데이터를 불러옴)
      this.$http
        .get('/data', {
          params: {
            name: this.project.project_name
          }
        })
        .then(result => {
          this.totalData = result.data
          if (this.totalData.length > 0) {
            // 이후의 노드 초기화
            this.initializeNodes()
          }
        }).then(result => {
          this.nodes.forEach(node => {
            var linkIndex = this.links.findIndex(link => link.tid === node.id)
            if (linkIndex !== -1) {
              if (node.visitRate >= this.visitRateThreshold) {
                this.links[linkIndex]._color = '#0e01c466'
              } else {
                this.links[linkIndex]._color = '#c4010133'
              }
            }
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 기능 5: 최적 경로 계산 (웹 페이지 방문 비율, 태그 유무만 사용)
    getOptimizedNodes () {
      if (this.currMember !== '') {
        alert('사용자 데이터에서는 확인할 수 없습니다.')
        return
      }

      // 노드 정보를 서버에 요청 (팀원 이메일이 빈 문자열이면 통합 컬렉션의 데이터를 불러옴)
      this.$http
        .get('/data/recommendation', {
          params: {
            name: this.project.project_name
          }
        })
        .then(result => {
          this.nodes.forEach(currNode => {
            currNode._color = 'WhiteSmoke'
          })

          result.data.forEach(node => {
            this.optimizedNodes.push(node)
          })

          var deleteNodes = []

          for (var i = 1; i < this.nodes.length; i++) {
            var currNode = this.nodes[i]
            var optimizedNode = this.optimizedNodes.find(x => x.curr_url === currNode.currURL && x.founder === currNode.founder)
            if (optimizedNode) {
              this.nodes[i]._color = 'yellow'
              continue
            } else {
              var targetLinks = this.links.filter(link => link.sid === currNode.id)
              var sourceLink = this.links.find(link => link.tid === currNode.id)
              var currLinkIndex

              if (targetLinks) {
                targetLinks.forEach(currLink => {
                  console.log(currLink.source.name + ' -X- ' + currLink.target.name)
                  var newTid = currLink.tid
                  currLinkIndex = this.links.findIndex(link => link.sid === currLink.sid && link.tid === currLink.tid)
                  this.links.splice(currLinkIndex, 1)
                  if (sourceLink) {
                    this.links.push({ sid: sourceLink.sid, tid: newTid })
                  }
                })
              }

              currLinkIndex = this.links.findIndex(link => link.sid === sourceLink.sid && link.tid === sourceLink.tid)
              this.links.splice(currLinkIndex, 1)

              deleteNodes.push(this.nodes[i].id)
            }
          }
          
          // 간선 연결이 안된 노드 삭제
          deleteNodes.forEach(id => {
            var deleteNodeIndex = this.nodes.findIndex(x => {
              return x.id === id
            })
            this.nodes.splice(deleteNodeIndex, 1)
          })

          this.nodes[0]._color = 'yellow'
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
