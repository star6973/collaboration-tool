export const d3Mixin = {
  data () {
    return {
      nodes: [],
      links: [],
      nodeSize: 30,
      fontSize: 20,
      linkWidth: 5,
      canvasWidth: window.innerWidth,
      canvasHeight: window.innerHeight - 130,
      nodeIndex: 0
    }
  },
  methods: {
    // 노드 클릭 시 이벤트
    nodeClick (event, node) {
      if (node.id !== 0) {
        var isShift

        // 시프트 키가 눌렸는지 판단
        if (window.event) {
          // typecast to boolean
          isShift = !!window.event.shiftKey
        } else {
          isShift = !!event.shiftKey
        }

        if (isShift) {
          // 시프트 키를 누르면서 노드를 클릭할 경우
          // 해당 노드의 파생 키워드 및 경로 표시
          if (node.id !== 1) {
            this.getRelevantNodes(node);
          }
        } else {
          // 그냥 노드만 클릭할 경우
          // 해당 노드의 정보 시트 표시
          node.fx = node.x
          node.fy = node.y
          this.savePinnedNode(node)
          // this.pinnedNode = node
          this.sheet = !this.sheet
        }
      }
    },
    // 간선 클릭 시 이벤트
    linkClick (event, link) {
      console.log('selected: ' + link.sid + ' -> ' + link.tid)
    }
  }
}
