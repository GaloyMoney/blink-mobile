/* eslint-disable */

const fs = require("fs")
const sharp = require("sharp")

const svgFilenames = [
  "./app/assets/icons-redesign/lightning.svg",
  "./app/assets/icons-redesign/bitcoin.svg",
  "./app/assets/logo/blink-logo-icon.svg",
]

const scale = 5 // scale factor for the output image

Promise.all(
  svgFilenames.map(
    (filename) =>
      new Promise((resolve, reject) =>
        fs.readFile(filename, "utf8", function (err, data) {
          if (err) {
            reject(err)
          } else {
            const svgBuffer = Buffer.from(data)

            const outputFilename = filename.replace(".svg", ".png")

            sharp(svgBuffer)
              .resize({ width: 24 * scale, height: 24 * scale, fit: "contain" })
              .png()
              .toFile(outputFilename)
              .then(resolve)
              .catch(reject)
          }
        }),
      ),
  ),
)
  .then(() => console.log("All SVGs converted to PNG"))
  .catch((err) => console.error(err))
