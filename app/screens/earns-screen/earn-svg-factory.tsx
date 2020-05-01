import * as React from "react"
import { Text, Dimensions } from "react-native"
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

import WhatIsFiat from "./01-fiat-currency-01.svg"
import WhyCareAboutFiatMoney from "./02-i-trust-my-government-01.svg"
import GovernementCanPrintMoney from "./03-print-unlimited-money-01.svg"
import FiatLosesValueOverTime from "./04-fiat-money-loses-value-01.svg"
import OtherIssues from "./05-are-there-other-issues-01.svg"

import LimitedSupply from "./01-limited-supply-01.svg"
import Decentralized from "./02-decentralized-01.svg"
import NoCounterfeitMoney from "./03-no-counterfeit-money-01.svg"
import HighlyDivisible from "./04-highly-divisible-01.svg"
import SecurePartOne from "./05-secure-part-i-01.svg"
import SecurePartTwo from "./06-secure-part-ii-01.svg"


import LottieView from 'lottie-react-native'
const lottieTest = require('./02-i-trust-my-government-01.json')

interface ISVGs {
  name: string, 
  width?: number,
  height?: number
}

export const SVGs = ({name, width, height}: ISVGs) => {
  const { width: screenWidth } = Dimensions.get("window")

  const rWidth = width ?? screenWidth
  const rHeight = height ?? screenWidth

  switch (name) {
    case "whatIsBitcoin": return <WhatIsBitcoinSVG width={rWidth} height={rHeight} />     
    case "sat": return <SatSVG width={rWidth} height={rHeight} />
    case "whereBitcoinExist": return <WhereBitcoinExistSVG width={rWidth} height={rHeight} />
    case "whoControlsBitcoin": return <WhoControlsBitcoinSVG width={rWidth} height={rHeight} />
    case "copyBitcoin": return <CopyBitcoinSVG width={rWidth} height={rHeight} />

    case "moneySocialAggrement": return <MoneySocialAggrement width={rWidth} height={rHeight} /> 
    case "coincidenceOfWants": return <CoincidenceOfWants width={rWidth} height={rHeight} /> 
    case "moneyEvolution": return <MoneyEvolution width={rWidth} height={rHeight} />
    case "whyStonesShellGold": return <WhyStonesShellGold width={rWidth} height={rHeight} />
    case "moneyIsImportant": return <MoneyIsImportant width={rWidth} height={rHeight} />
    case "moneyImportantGovernement": return <MoneyImportantGovernement width={rWidth} height={rHeight} />

    case "WhatIsFiat": return <WhatIsFiat width={rWidth} height={rHeight} /> 
    // case "whyCareAboutFiatMoney": return <WhyCareAboutFiatMoney width={rWidth} height={rHeight} />
    case "GovernementCanPrintMoney": return <GovernementCanPrintMoney width={rWidth} height={rHeight} />
    case "FiatLosesValueOverTime": return <FiatLosesValueOverTime width={rWidth} height={rHeight} />
    case "OtherIssues": return <OtherIssues width={rWidth} height={rHeight} />

    case "LimitedSupply": return <LimitedSupply width={rWidth} height={rHeight} /> 
    case "Decentralized": return <Decentralized width={rWidth} height={rHeight} />
    case "NoCounterfeitMoney": return <NoCounterfeitMoney width={rWidth} height={rHeight} />
    case "HighlyDivisible": return <HighlyDivisible width={rWidth} height={rHeight} />
    case "securePartOne": return <SecurePartOne width={rWidth} height={rHeight} />
    case "securePartTwo": return <SecurePartTwo width={rWidth} height={rHeight} />

    default: return <LottieView source={lottieTest} 
      style={{width: screenWidth, height: screenWidth, alignSelf: "center"}} autoPlay loop />
    // default: return <Text>{name} does not exist</Text>
  }
}