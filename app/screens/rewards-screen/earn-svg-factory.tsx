import * as React from "react"
import { Text } from "react-native"
import WhatIsBitcoinSVG from "./01-so-what-exactly-is-bitcoin-01.svg"
import SatSVG from "./02-i-just-earned-a-sat-01.svg"
import WhereBitcoinExistSVG from "./03-where-do-the-bitcoins-exist-01.svg"
import WhoControlsBitcoinSVG from "./04-who-controls-Bitcoin-01.svg"
import CopyBitcoinSVG from "./05-cant-copy-bitcoin-01.svg"

import MoneySocialAggrement from "./01-money-is-a-social-agreement-01.svg"
import CoincidenceOfWants from "./02-coincidence-of-wants-01.svg"
import MoneyEvolution from "./03-money-has-evolved-01.svg"
import WhyStonesShellGold from "./04-why-used-as-money-01.svg"
import MoneyIsImportant from "./05-money-is-important-01.svg"
import MoneyImportantGovernement from "./06-important-to-governments-01.svg"

export const SVGs = ({name}: {name: string}) => {
  console.tron.log({name})

  switch (name) {
    case "whatIsBitcoin": return <WhatIsBitcoinSVG width="100%" /> 
    case "sat": return <SatSVG width="100%" />
    case "whereBitcoinExist": return <WhereBitcoinExistSVG width="100%" />
    case "whoControlsBitcoin": return <WhoControlsBitcoinSVG width="100%" />
    case "copyBitcoin": return <CopyBitcoinSVG width="100%" />

    case "moneySocialAggrement": return <MoneySocialAggrement width="100%" /> 
    case "coincidenceOfWants": return <CoincidenceOfWants width="100%" /> 
    case "moneyEvolution": return <MoneyEvolution width="100%" />
    case "whyStonesShellGold": return <WhyStonesShellGold width="100%" />
    case "moneyIsImportant": return <MoneyIsImportant width="100%" />
    case "moneyImportantGovernement": return <MoneyImportantGovernement width="100%" />

    default: return <Text>{name} does not exist</Text>
  }
}