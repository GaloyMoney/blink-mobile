const  { gqlPluckFromCodeStringSync } = require("@graphql-tools/graphql-tag-pluck")
const fs = require ("fs")

const filepath = "app/graphql/generated.ts"

const result = gqlPluckFromCodeStringSync(filepath, fs.readFileSync(filepath, 'utf8'))
const as_str = result.map(item => item.body + "\n\n").sort().join("")

fs.writeFileSync('app/graphql/generated.gql', as_str)
