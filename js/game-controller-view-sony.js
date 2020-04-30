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

    d3.csv(`data/${vis.filename}`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 15
        point.y = +point.y * 15
      })
      vis.controllerPathPoints = data

      vis.minX = this.getMin(data, "x")
      vis.maxX = this.getMax(data, "x")
      vis.minY = this.getMin(data, "y")
      vis.maxY = this.getMax(data, "y")
    })

    d3.csv(`data/sony-bottom.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 16 + 600
        point.y = +point.y * 16 + 300
      })
      vis.bottomPoints = data
    })

    d3.csv(`data/sony-bottom-left.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 16 + 8
        point.y = +point.y * 16 + 340
      })
      vis.bottomLeftPoints = data
    })

    d3.csv(`data/sony-circle-right.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 15.2 + 510
        point.y = +point.y * 15.2
      })
      vis.circleRightPoints = data
    })

    d3.csv(`data/sony-circle-right.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 15.2 + 5
        point.y = +point.y * 15.2
      })
      vis.circleLeftPoints = data
    })

    d3.csv(`data/sony-circle-bottom.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 15.3 + 295
        point.y = +point.y * 15.3 + 310
      })
      vis.circleBottomLeft = data
    })

    d3.csv(`data/sony-circle-bottom.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 15.3 + 450
        point.y = +point.y * 15.3 + 310
      })
      vis.circleBottomRight = data
    })

    d3.csv(`data/sony-circle.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 16 + 650
        point.y = +point.y * 16 + 50
      })
      vis.circleBlue = data
    })

    d3.csv(`data/sony-circle.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 16 + 750
        point.y = +point.y * 16 + 130
      })
      vis.circleRed = data
    })

    d3.csv(`data/sony-circle.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 16 + 550
        point.y = +point.y * 16 + 130
      })
      vis.circlePink = data
    })

    d3.csv(`data/sony-circle.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 16 + 650
        point.y = +point.y * 16 + 210
      })
      vis.circlePurple = data
    })

    d3.csv(`data/sony-cross.csv`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x * 16 + 95
        point.y = +point.y * 16 + 85
      })
      vis.crossPoints = data
    })

    // d3.csv(`data/microsoft-cross.csv`).then((data) => {
    //   data.forEach((point) => {
    //     point.x = +point.x * 12
    //     point.y = +point.y * 12
    //   })
    //   vis.crossPoints = data
    //   console.log("cross points", data)
    // })

    // d3.csv(`data/microsoft-circle1.csv`).then((data) => {
    //   data.forEach((point) => {
    //     point.x = +point.x * 12
    //     point.y = +point.y * 12
    //   })
    //   vis.circle1Points = data
    //   console.log("circle 1 points", data)
    // })

    // d3.csv(`data/microsoft-circle2.csv`).then((data) => {
    //   data.forEach((point) => {
    //     point.x = +point.x * 12
    //     point.y = +point.y * 12
    //   })
    //   vis.circle2Points = data
    //   console.log("circle 2 points", data)
    // })

    // d3.csv(`data/microsoft-circle3.csv`).then((data) => {
    //   data.forEach((point) => {
    //     point.x = +point.x * 12
    //     point.y = +point.y * 12
    //   })
    //   vis.circle3Points = data
    //   console.log("circle 2 points", data)
    // })

    // d3.csv(`data/microsoft-circle4.csv`).then((data) => {
    //   data.forEach((point) => {
    //     point.x = +point.x * 12
    //     point.y = +point.y * 12
    //   })
    //   vis.circle4Points = data
    //   console.log("circle 2 points", data)
    // })

    // d3.csv(`data/microsoft-circle5.csv`).then((data) => {
    //   data.forEach((point) => {
    //     point.x = +point.x * 12
    //     point.y = +point.y * 12
    //   })
    //   vis.circle5Points = data
    //   console.log("circle 2 points", data)
    // })

    // d3.csv(`data/microsoft-circle6.csv`).then((data) => {
    //   data.forEach((point) => {
    //     point.x = +point.x * 12
    //     point.y = +point.y * 12
    //   })
    //   vis.circle6Points = data
    //   console.log("circle 2 points", data)
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
      .attr("d", lineFunction(vis.circleRightPoints))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "circle-right-path")

    vis.chart
      .append("path")
      .attr("d", lineFunction(vis.circleLeftPoints))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "circle-left-path")

    vis.chart
      .append("path")
      .attr("d", lineFunction(vis.circleBottomLeft))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "circle-bottom-left-path")

    vis.chart
      .append("path")
      .attr("d", lineFunction(vis.circleBottomRight))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "circle-bottom-right-path")

    vis.chart
      .append("path")
      .attr("d", lineFunction(vis.circleBlue))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "circle-blue")

    vis.chart
      .append("path")
      .attr("d", lineFunction(vis.circleRed))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "circle-red")

    vis.chart
      .append("path")
      .attr("d", lineFunction(vis.circlePink))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "circle-pink")

    let pathElement = document.getElementById("controller-path")
    let poly = pathToPolygonViaSubdivision(pathElement, null, 20)
    let area = polyArea(poly)

    console.log("diff of polygon: ", Math.sqrt(area / vis.data.length))
    vis.diff = Math.sqrt(area / vis.data.length)
    vis.side = vis.diff

    let rects = vis.chart
      .selectAll("rect")
      .data(vis.data)
      .enter()
      .append("rect")
      .attr("id", (d, i) => "game" + cleanId(d.name))
      .attr("width", vis.side)
      .attr("height", vis.side)
      .attr("x", (d) => 0)
      .attr("y", (d) => 0)
      .attr("fill", "#38454F")

    // let rects = vis.chart
    //   .selectAll("rect")
    //   .data(vis.rectPoints)
    //   .enter()
    //   .append("rect")
    //   .attr("id", (d) => "game" + d.id)
    //   .attr("width", (d) => d.size)
    //   .attr("height", (d) => d.size)
    //   .attr("x", (d) => d.x)
    //   .attr("y", (d) => d.y)
    //   .attr("fill", (d) => d.color)

    let nextX = vis.minX
    let nextY = vis.minY
    rects.each((d, i) => {
      console.log("Calculating ", i)
      let rect = d3.select(`#game${cleanId(d.name)}`)
      console.log(rect)
      let point = [+rect.attr("x"), +rect.attr("y")]
      let inside = pointInsidePath(point, vis.controllerPathPoints)
      while (!inside) {
        point = [nextX, nextY]

        if (nextX >= vis.maxX) {
          nextX = vis.minX
          nextY = nextY + vis.diff
        } else {
          nextX = nextX + vis.diff
        }
        inside = pointInsidePath(point, vis.controllerPathPoints)
      }

      rect.attr("x", nextX)
      rect.attr("y", nextY)
      locationData[i].id = cleanId(d.name)
      locationData[i].x = nextX
      locationData[i].y = nextY
      locationData[i].size = vis.side
      locationData[i].color = "#38454f"

      point = [+nextX, +nextY]

      inside = pointInsidePath(point, vis.circleRightPoints)
      if (inside) {
        rect.classed("circle-right", true)
        locationData[i].color = "#546A79"
      }

      inside = pointInsidePath(point, vis.circleLeftPoints)
      if (inside) {
        rect.classed("circle-right", true)
        locationData[i].color = "#546A79"
      }

      inside = pointInsidePath(point, vis.circleBottomLeft)
      if (inside) {
        rect.classed("circle-bottom", true)
        locationData[i].color = "#283238"
      }

      inside = pointInsidePath(point, vis.circleBottomRight)
      if (inside) {
        rect.classed("circle-bottom", true)
        locationData[i].color = "#20bee2"
      }

      inside = pointInsidePath(point, vis.circleBlue)
      if (inside) {
        rect.classed("sony-circle-blue", true)
        locationData[i].color = "#20bee2"
      }

      inside = pointInsidePath(point, vis.circleRed)
      if (inside) {
        rect.classed("sony-circle-red", true)
        locationData[i].color = "#DD352E"
      }

      inside = pointInsidePath(point, vis.circlePink)
      if (inside) {
        rect.classed("sony-circle-pink", true)
        locationData[i].color = "#bf4d90"
      }

      inside = pointInsidePath(point, vis.circlePurple)
      if (inside) {
        rect.classed("sony-circle-purple", true)
        locationData[i].color = "#5d7bdb"
      }

      inside = pointInsidePath(point, vis.crossPoints)
      if (inside) {
        rect.classed("sony-cross", true)
        locationData[i].color = "#283238"
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

    let res = convertArrayOfObjectsToCSV({ data: locationData })
    var encodedUri = typedArrayToURL(res, "text/plain")
    var link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "sony.csv")
    document.body.appendChild(link) // Required for FF

    // link.click() // This will download the data file named "my_data.csv".
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
