import Canvas from "./canvas.js"

class GameControllerView extends Canvas {
  constructor(_config) {
    super(_config)
    this.type = _config.type
    this.filename = _config.filename
    this.scale = _config.scale
    this.initVis()
  }

  initVis() {
    let vis = this

    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)

    vis.chart = vis.svg
      .append("g")
      .attr("class", "main-group")
      .attr("transform", `scale(${vis.scale})`)

    d3.csv(`data/${vis.filename}`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x
        point.y = +point.y
      })
      vis.rectPoints = data
    })
  }

  getMin(data, attr) {
    return data.reduce((min, b) => Math.min(min, b[attr]), data[0][attr])
  }
  getMax(data, attr) {
    return data.reduce((max, b) => Math.max(max, b[attr]), data[0][attr])
  }

  init() {
    let vis = this

    vis.numberOfGames = vis.salesData.length

    vis.globalSales = vis.getSalesData("global_sales")
    vis.naSales = vis.getSalesData("na_sales")
    vis.euSales = vis.getSalesData("eu_sales")
    vis.jpSales = vis.getSalesData("jp_sales")
    vis.otherSales = vis.getSalesData("other_sales")

    vis.years = R.pipe(R.map(R.prop("year")), R.filter(Boolean))(vis.salesData)
    vis.minYear = Math.min(...vis.years)
    vis.maxYear = Math.max(...vis.years)

    vis.rects = vis.chart
      .selectAll("rect")
      .data(vis.rectPoints)
      .enter()
      .append("rect")
      .attr("id", (d) => vis.type + d.id)
      .classed(vis.type, true)
      .attr("width", (d) => d.size)
      .attr("height", (d) => d.size)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0)

    d3.select(`div#${vis.type}_eu_sales`)
      .data([vis.euSales])
      .append("span")
      .text((d) => Math.round(d) + "M")

    d3.select(`div#${vis.type}_jp_sales`)
      .data([vis.jpSales])
      .append("span")
      .text((d) => Math.round(d) + "M")

    d3.select(`div#${vis.type}_na_sales`)
      .data([vis.naSales])
      .append("span")
      .text((d) => Math.round(d) + "M")

    d3.select(`div#${vis.type}_global_sales`)
      .data([vis.globalSales])
      .append("span")
      .text((d) => Math.round(d) + "M")

    d3.select(`div#${vis.type}_year_range`)
      .data([vis.minYear])
      .append("span")
      .text(`${vis.minYear} - ${vis.maxYear}`)
  }

  update() {
    let vis = this
    vis.render()
  }

  render() {
    let vis = this
  }

  hide() {
    let vis = this
    vis.chart.selectAll(`rect`).transition().duration(0).attr("opacity", 0)
  }

  getSalesData(propName) {
    let vis = this
    return R.pipe(R.map(R.prop(propName)), R.sum)(vis.salesData)
  }

  highlight() {
    let vis = this

    vis.chart.selectAll(`rect`).transition().duration(0).attr("opacity", 1.0)
  }
}

export default GameControllerView
