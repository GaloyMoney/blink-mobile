const parse = require('csv-parse/lib/sync')
var fs = require('fs');
const { title } = require('process');

const input = fs.readFileSync(__dirname + "/Galoy Illustrations Progress - Sheet1.csv", 
  { encoding: 'utf8' }
);

const records = parse(input, {
  columns: true,
  skip_empty_lines: true
})

// records


//TODO: get list of Sets and loop over it.

const records2 = records.filter(index => index.ID_Section.includes("bitcoinWhatIsIt"))

console.log(records2[0])

const formatArray = input => input.map(index => {
  return {
    id: index.ID_Screen,
    type: "Text",
    title: index["Screen Name"],
    text: index.Content,
    answers: [
      index["Answer A"],
      index["Answer B"],
      index["Answer C"],
    ],
    feedback: [
      index["Answer A Feedback"],
      index["Answer B Feedback"],
      index["Answer C Feedback"],
    ]
  }
})

const section = (input) => ({
  "meta": {
    id: input[0].ID_Section,
    title: input[0].Section,
  },
  "content": formatArray(input)
})

console.log(section(records2))