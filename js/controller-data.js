export const formatData = (data = []) => {
  const games = []

  data.forEach((d) => {
    // Just add Sales data if game already exists on other platforms
    const i = games.find((e) => e.name == d.Name)
    const game = {}
    // Add platform_company column
    if (d.Platform.match(/^(PS|PS2|PS3|PS4|PSP|PSV)$/))
      game.platform_company = "Sony"
    else if (d.Platform.match(/^(XB|X360|XOne)$/))
      game.platform_company = "Microsoft"
    else if (d.Platform == "PC") game.platform_company = "PC"
    else if (d.Platform.match(/^(3DS|DS|GB|GBA|GC|N64|NES|SNES|Wii|WiiU)$/))
      game.platform_company = "Nintendo"
    else game.platform_company = "Others"

    if (i) {
      i.sales.push({
        sales_platform: d.Platform,
        sales_platform_company: game.platform_company,
        year: +d.Year_of_Release,
        na_sales: +d.NA_Sales,
        eu_sales: +d.EU_Sales,
        jp_sales: +d.JP_Sales,
        other_sales: +d.Other_Sales,
        global_sales: +d.Global_Sales,
      })
      return
    }
    game.name = d.Name
    game.platform = d.Platform

    game.genre = d.Genre
    game.publisher = d.Publisher
    game.sales = [
      {
        sales_platform: game.platform,
        sales_platform_company: game.platform_company,
        year: +d.Year_of_Release,
        name: d.Name,
        na_sales: +d.NA_Sales,
        eu_sales: +d.EU_Sales,
        jp_sales: +d.JP_Sales,
        other_sales: +d.Other_Sales,
        global_sales: +d.Global_Sales,
      },
    ]
    games.push(game)
  })
  return games
}
