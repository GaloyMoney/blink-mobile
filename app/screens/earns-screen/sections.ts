export type EarnSectionType = keyof typeof earnSections

export const earnSections = {
  bitcoinWhatIsIt: {
    questions: [
      "whatIsBitcoin",
      "sat",
      "whereBitcoinExist",
      "whoControlsBitcoin",
      "copyBitcoin",
    ],
  },
  WhatIsMoney: {
    questions: [
      "moneySocialAggrement",
      "coincidenceOfWants",
      "moneyEvolution",
      "whyStonesShellGold",
      "moneyIsImportant",
      "moneyImportantGovernement",
    ],
  },
  HowDoesMoneyWork: {
    questions: [
      "WhatIsFiat",
      "whyCareAboutFiatMoney",
      "GovernementCanPrintMoney",
      "FiatLosesValueOverTime",
      "OtherIssues",
    ],
  },
  BitcoinWhySpecial: {
    questions: [
      "LimitedSupply",
      "Decentralized",
      "NoCounterfeitMoney",
      "HighlyDivisible",
      "securePartOne",
      "securePartTwo",
    ],
  },
} as const
