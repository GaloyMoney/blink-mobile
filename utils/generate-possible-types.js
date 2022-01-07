// eslint-disable @typescript-eslint/no-var-requires
const fetch = require("cross-fetch")
const fs = require("fs")

fetch(`http://localhost:4002/graphql`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    variables: {},
    query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
  }),
})
  .then((result) => result.json())
  .then((result) => {
    const possibleTypes = {}
    console.log(result)

    result.data.__schema.types.forEach((supertype) => {
      if (supertype.possibleTypes) {
        possibleTypes[supertype.name] = supertype.possibleTypes.map(
          (subtype) => subtype.name,
        )
      }
    })

    fs.writeFile(
      __dirname + "/../__generated__/possibleTypes.json",
      JSON.stringify(possibleTypes),
      (err) => {
        if (err) {
          console.error("Error writing possibleTypes.json", err)
        } else {
          console.log("Fragment types successfully extracted!")
        }
      },
    )
  })
