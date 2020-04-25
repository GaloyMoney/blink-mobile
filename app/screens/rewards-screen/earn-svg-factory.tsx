import * as React from "react"
import { Text } from "react-native"
import WhatIsBitcoinSVG from "./01-so-what-exactly-is-bitcoin-01.svg"
import SatSVG from "./02-i-just-earned-a-sat-01.svg"
import WhereBitcoinExistSVG from "./03-where-do-the-bitcoins-exist-01.svg"
import WhoControlsBitcoinSVG from "./04-who-controls-Bitcoin-01.svg"
import CopyBitcoinSVG from "./05-cant-copy-bitcoin-01.svg"

export const SVGs = (name: string) => {
  console.tron.log({name})

  switch (name) {
    case "whatIsBitcoin": return <WhatIsBitcoinSVG /> 
    case "sat": return <SatSVG />
    case "whereBitcoinExist": return <WhereBitcoinExistSVG />
    case "whoControlsBitcoin": return <WhoControlsBitcoinSVG />
    case "copyBitcoin": return <CopyBitcoinSVG />
    default: return <Text>{name} does not exist</Text>
  }
}