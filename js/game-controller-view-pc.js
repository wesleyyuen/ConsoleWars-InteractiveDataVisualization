import Canvas from "./canvas.js"
import { pathToPolygonViaSubdivision, polyArea } from "./path-to-polygon.js"
class GameControllerView extends Canvas {
  constructor(_config) {
    super(_config)
    this.filename = _config.filename
    this.initVis()
  }

  initVis() {
    let vis = this

    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)

    vis.chart = vis.svg.append("g").attr("class", "main-group")

    d3.csv(`data/pc-outline.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 0.7
        point.y = +point.y * 0.7
      })
      vis.controllerPathPoints = data

      vis.minX = this.getMin(data, "x")
      vis.maxX = this.getMax(data, "x")
      vis.minY = this.getMin(data, "y")
      vis.maxY = this.getMax(data, "y")
    })

    d3.csv(`data/pc-exclude.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 0.7
        point.y = +point.y * 0.7
      })
      vis.excludedPathPoints = data
    })

    d3.csv(`data/pc-exclude2.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 0.7
        point.y = +point.y * 0.7
      })
      vis.excludedPathPoints2 = data
    })
    d3.csv(`data/pc-frame.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 0.7 + 10
        point.y = +point.y * 0.7
      })
      vis.framePoints = data
    })

    d3.csv(`data/pc-mouse.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 0.7 + 10
        point.y = +point.y * 0.7
      })
      vis.mousePoints = data
    })

    // d3.csv(`data/others-circle3.csv`).then((data) => {
    //   data.forEach((point) => {
    //     point.x = +point.x * 0.5
    //     point.y = +point.y * 0.5
    //   })
    //   vis.circle3Points = data
    // })

    // d3.csv(`data/others-circle4.csv`).then((data) => {
    //   data.forEach((point) => {
    //     point.x = +point.x * 0.5
    //     point.y = +point.y * 0.5
    //   })
    //   vis.circle4Points = data
    // })

    // d3.csv(`data/${vis.filename}`).then((data) => {
    //   data.forEach((point) => {
    //     point.x = +point.x
    //     point.y = +point.y
    //   })
    //   vis.rectPoints = data
    //   console.log("Rect Points", vis.rectPoints)
    // })
  }

  getMin(data, attr) {
    return data.reduce((min, b) => Math.min(min, b[attr]), data[0][attr])
  }
  getMax(data, attr) {
    return data.reduce((max, b) => Math.max(max, b[attr]), data[0][attr])
  }

  update() {
    let vis = this

    vis.render()
  }

  render() {
    let vis = this
    let locationData = vis.data
    let lineFunction = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y)

    vis.chart
      .append("path")
      .attr("d", lineFunction(vis.controllerPathPoints))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "controller-path")

    vis.chart
      .append("path")
      .attr("d", lineFunction(vis.excludedPathPoints))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "excluded-path")

    vis.chart
      .append("path")
      .attr("d", lineFunction(vis.excludedPathPoints2))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "excluded-path-2")

    vis.chart
      .append("path")
      .attr("d", lineFunction(vis.framePoints))
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "frame-path")

    // vis.chart
    //   .append("path")
    //   .attr("d", lineFunction(vis.crossPoints))
    //   .attr("stroke", "black")
    //   .attr("stroke-width", 1)
    //   .attr("fill", "none")
    //   .attr("id", "cross-path")

    let pathElement = document.getElementById("controller-path")
    let pathElement2 = document.getElementById("excluded-path")
    let pathElement3 = document.getElementById("excluded-path-2")
    let poly = pathToPolygonViaSubdivision(pathElement, null, 20)
    let poly2 = pathToPolygonViaSubdivision(pathElement2, null, 20)
    let poly3 = pathToPolygonViaSubdivision(pathElement3, null, 20)
    let area = polyArea(poly) - polyArea(poly2) - polyArea(poly3)

    console.log("diff of polygon: ", Math.sqrt(area / vis.data.length))
    vis.diff = Math.sqrt(area / vis.data.length) - 0.05
    vis.side = vis.diff - 0.5

    let rects = vis.chart
      .selectAll("rect")
      .data(vis.data)
      .enter()
      .append("rect")
      .attr("id", (d) => "game" + cleanId(d.name))
      .attr("width", vis.side)
      .attr("height", vis.side)
      .attr("x", (d) => 0)
      .attr("y", (d) => 0)
      .attr("fill", "#d6d4ce")

    let nextX = vis.minX
    let nextY = vis.minY
    rects.each((d, i) => {
      let rect = d3.select(`#game${cleanId(d.name)}`)
      let point = [
        +rect.attr("x") + vis.side / 2,
        +rect.attr("y") + vis.side / 2,
      ]
      let inside = pointInsidePath(point, vis.controllerPathPoints)
      while (!inside) {
        point = [nextX + vis.side / 2, nextY + vis.side / 2]
        if (nextX >= vis.maxX) {
          nextX = vis.minX
          nextY = nextY + vis.diff
        } else {
          nextX = nextX + vis.diff
        }
        inside =
          pointInsidePath(point, vis.controllerPathPoints) &&
          !pointInsidePath(point, vis.excludedPathPoints) &&
          !pointInsidePath(point, vis.excludedPathPoints2)
      }
      rect.attr("x", nextX + vis.side / 2)
      rect.attr("y", nextY + vis.side / 2)
      locationData[i].id = cleanId(d.name)
      locationData[i].x = nextX + vis.side / 2
      locationData[i].y = nextY + vis.side / 2
      locationData[i].size = vis.side
      locationData[i].color = "#d6d4ces"

      point = [+nextX + vis.side / 2, +nextY + vis.side / 2]
      inside = pointInsidePath(point, vis.framePoints)
      if (inside) {
        rect.classed("pc-frame", true)
        locationData[i].color = "#38454f"
      }

      inside = pointInsidePath(point, vis.mousePoints)
      if (inside) {
        rect.classed("pc-frame", true)
        locationData[i].color = "#38454f"
      }
    })
    locationData.map((point) => {
      delete point.sales
      delete point.platform
      delete point.platform_company
      delete point.genre
      delete point.publisher
      delete point.name
    })
    console.log(locationData)
    let res = convertArrayOfObjectsToCSV({ data: locationData })
    var encodedUri = typedArrayToURL(res, "text/plain")
    var link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "pc.csv")
    document.body.appendChild(link) // Required for FF

    link.click() // This will download the data file named "my_data.csv".
  }
}

const typedArrayToURL = (typedArray, mimeType) => {
  return URL.createObjectURL(new Blob([typedArray], { type: mimeType }))
}

const cleanId = (str) => {
  return str.replace(/[\s\.\-\/\!\:\&\(\)\'\,\$\*\+\?\#\~\@\;\%\[\]]/gi, "")
}
const convertArrayOfObjectsToCSV = (args) => {
  var result, ctr, keys, columnDelimiter, lineDelimiter, data

  data = args.data || null
  if (data == null || !data.length) {
    return null
  }

  columnDelimiter = args.columnDelimiter || ","
  lineDelimiter = args.lineDelimiter || "\n"

  keys = Object.keys(data[0])

  result = ""
  result += keys.join(columnDelimiter)
  result += lineDelimiter

  data.forEach(function (item) {
    ctr = 0
    keys.forEach(function (key) {
      if (ctr > 0) result += columnDelimiter

      result += item[key]
      ctr++
    })
    result += lineDelimiter
  })

  return result
}
// from https://github.com/substack/point-in-polygon
const pointInsidePath = function (point, vs) {
  let i, j, intersect
  let x = point[0]
  let y = point[1]
  let inside = false

  for (i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].x
    let yi = vs[i].y
    let xj = vs[j].x
    let yj = vs[j].y
    intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}
export default GameControllerView
