import { parse } from "csv-parse/lib/sync"
import fs from "fs"

const input = fs.readFileSync(__dirname + "/Galoy Illustrations Progress - Sheet1.csv", {
  encoding: "utf8",
})

const records = parse(input, {
  columns: true,
  /* eslint-disable camelcase */
  skip_empty_lines: true,
})

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
  section: {
    id: input[0].ID_Section,
    title: input[0].Section,
  },
  content: formatArray(input),
})

const collections = new Set()
records.forEach((index) => collections.add(index.ID_Section))
collections.delete("")

const outputEarn = []

collections.forEach((collection) => {
  const sectionArray = records.filter((index) => index.ID_Section.includes(collection))

  outputEarn.push(section(sectionArray))
})

const outputFilePath = __dirname + "/../app/i18n/en.json"
const outputFile = fs.readFileSync(outputFilePath, { encoding: "utf8" })

const finalJSON = JSON.parse(outputFile)
finalJSON.EarnScreen.earns = outputEarn

fs.writeFileSync(outputFilePath, JSON.stringify(finalJSON, null, 2))
