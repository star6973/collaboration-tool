export const nodeMixin = {
  methods: {
    // 노드 이름 작명 함수
    getNodeName (paths, url) {
      var decodedURL = decodeURI(url)
      var decodedPaths = []
      var nodeName = []

      // paths 배열 URL 요소 디코딩
      for (var path of paths) {
        decodedPaths.push(decodeURI(path))
      }

      // URL 길이가 50자가 넘는지 검사
      if (decodedURL.length > 50) {
        nodeName.push(decodedPaths[0])

        // paths 배열 요소가 1개를 넘으면 '/...' 문자열 추가
        if (decodedPaths.length > 1) {
          nodeName.push('/...')

          // '/...' 문자열을 포함한 URL 전체가 50자를 넘지 않으면 가장 마지막 path 문자열 추가
          if (nodeName.join('').length <= 50) {
            nodeName.push(decodedPaths[decodedPaths.length - 1])
          }
        }
      } else {
        // URL 길이가 50자를 넘지 않는다면 있는 그대로 표시
        nodeName.push(decodedURL)
      }

      return nodeName.join('')
    }
  }
}
