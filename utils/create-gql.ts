// eslint-disable-next-line @typescript-eslint/no-var-requires
const { gqlPluckFromCodeStringSync } = require("@graphql-tools/graphql-tag-pluck")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs")

const filepath = "app/graphql/generated.ts"

const result = gqlPluckFromCodeStringSync(filepath, fs.readFileSync(filepath, "utf8"))
const asStr = result
  .map((item) => item.body + "\n\n")
  .sort()
  .join("")

fs.writeFileSync("app/graphql/generated.gql", asStr)
