function scroller() {
  let container = d3.select("body")

  let dispatch = d3.dispatch("active", "progress")

  let sections = null
  let sectionPositions = []
  let currentIndex = -1

  // y coordinate of
  let containerStart = 0

  let scroll = (els) => {
    sections = els

    d3.select(window)
      .on("scroll.scroller", position)
      .on("resize.scroller", resize)

    resize()

    let timer = d3.timer(() => {
      position()
      timer.stop()
    })
  }

  // Called when the position is resized
  function resize() {
    sectionPositions = []
    let startPos

    sections.each((d, i) => {
      let top = sections._groups[0][i].getBoundingClientRect().top

      if (i === 0) startPos = top
      sectionPositions.push(top - startPos)
    })
    containerStart =
      container.node().getBoundingClientRect().top + window.pageYOffset
  }

  // Called when position is changed
  function position() {
    let pos = window.pageYOffset - 10 - containerStart
    let sectionIndex = d3.bisect(sectionPositions, pos)
    sectionIndex = Math.min(sections.size() - 1, sectionIndex)

    if (currentIndex !== sectionIndex) {
      dispatch.call("active", this, sectionIndex)
      currentIndex = sectionIndex
    }

    let prevIndex = Math.max(sectionIndex - 1, 0)
    let prevTop = sectionPositions[prevIndex]
    let progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop)
    // @v4 you now `.call` the dispatch callback
    dispatch.call("progress", this, currentIndex, progress)
  }

  // set parent element of the sections
  scroll.container = function (value) {
    if (arguments.length === 0) {
      return container
    }
    container = value
    return scroll
  }

  scroll.on = function (action, callback) {
    dispatch.on(action, callback)
  }

  return scroll
}
