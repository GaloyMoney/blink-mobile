// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path")
const files = fs.readdirSync(path.resolve(__dirname, ".."))

const tests = ["01-welcome-screen-flow", "02-login-flow", process.env.TEST]
tests.forEach((test) => {
  const testFile = files.find((file) => file.includes(test))
  if (testFile) {
    require(path.resolve(__dirname, "..", testFile))
  }
})
