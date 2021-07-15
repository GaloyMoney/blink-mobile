const parse = require("csv-parse/lib/sync")
var fs = require("fs")
const { title } = require("process")
const util = require("util")

const input = fs.readFileSync(__dirname + "/Galoy Illustrations Progress - Sheet1.csv", {
  encoding: "utf8",
})

const records = parse(input, {
  columns: true,
  skip_empty_lines: true,
})

// console.log(records2[0])

const formatArray = (input) =>
  input.map((index) => {
    return {
      id: index.ID_Screen,
      type: "Text",
      title: index["Screen Name"].trim(),
      text: index.Content.trim(),
      question: index.Question.trim(),
      answers: [
        index["Answer A"].trim(),
        index["Answer B"].trim(),
        index["Answer C"].trim(),
      ],
      feedback: [
        index["Answer A Feedback"].trim(),
        index["Answer B Feedback"].trim(),
        index["Answer C Feedback"].trim(),
      ],
    }
  })

const section = (input) => ({
  meta: {
    id: input[0].ID_Section,
    title: input[0].Section,
  },
  content: formatArray(input),
})

collections = new Set()
records.forEach((index) => collections.add(index.ID_Section))
collections.delete("")

const outputEarn = []

collections.forEach((collection) => {
  const sectionArray = records.filter((index) => index.ID_Section.includes(collection))

  outputEarn.push(section(sectionArray))
})

const outputFilePath = __dirname + "/../app/i18n/en.json"
const outputFile = fs.readFileSync(outputFilePath, { encoding: "utf8" })

let finalJSON = JSON.parse(outputFile)
finalJSON.EarnScreen.earns = outputEarn

fs.writeFileSync(outputFilePath, JSON.stringify(finalJSON, null, 2))
