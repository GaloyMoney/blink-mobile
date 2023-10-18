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
  TheOriginsOfMoney: {
    questions: [
      "originsOfMoney",
      "primitiveMoney",
      "anticipatingDemand",
      "nashEquilibrium",
      "singleStoreOfValue",
    ],
  },
  AttributesOfAGoodStoreOfValue: {
    questions: [
      "whatIsGoodSOV",
      "durability",
      "portability",
      "fungibility",
      "verifiability",
      "divisibility",
      "scarce",
      "establishedHistory",
      "censorshipResistance",
    ],
  },
  TheEvolutionOfMoneyI: {
    questions: [
      "evolutionMoney",
      "collectible",
      "storeOfValue",
      "mediumOfExchange",
      "unitOfAccount",
      "partlyMonetized",
      "monetizationStage",
    ],
  },
  TheEvolutionOfMoneyII: {
    questions: [
      "notFromGovernment",
      "primaryFunction",
      "monetaryMetals",
      "stockToFlow",
      "hardMoney",
    ],
  },
  TheEvolutionOfMoneyIII: {
    questions: [
      "convergingOnGold",
      "originsOfPaperMoney",
      "fractionalReserve",
      "bankRun",
      "modernCentralBanking",
      "goldBacked",
      "brettonWoods",
      "globalReserve",
    ],
  },
  TheEvolutionOfMoneyIV: {
    questions: [
      "nixonShock",
      "fiatEra",
      "digitalFiat",
      "plasticCredit",
      "doubleSpendProblem",
      "satoshisBreakthrough",
      "nativelyDigital",
      "CBDCs",
    ],
  },
  BitcoinWhyWasItCreated: {
    questions: [
      "rootProblem",
      "bitcoinCreator",
      "fiatRequiresTrust",
      "moneyPrinting",
      "genesisBlock",
      "cypherpunks",
    ],
  },
  BitcoinHowDoesItWork: {
    questions: [
      "peer2Peer",
      "blockchain",
      "privateKey",
      "publicKey",
      "mining",
      "proofOfWork",
      "difficultyAdjustment",
      "halving",
    ],
  },
  LightningWhatDoesItSolve: {
    questions: [
      "bitcoinDrawbacks",
      "blocksizeWars",
      "lightningNetwork",
      "instantPayments",
      "micropayments",
      "scalability",
      "paymentChannels",
      "routing",
    ],
  },
  BitcoinCriticismsFallaciesI: {
    questions: [
      "itsaBubble",
      "itstooVolatile",
      "itsnotBacked",
      "willbecomeObsolete",
      "toomuchEnergy",
      "strandedEnergy",
    ],
  },
  BitcoinCriticismsFallaciesII: {
    questions: [
      "internetDependent",
      "forcrimeOnly",
      "ponziScheme",
      "bitcoinisTooSlow",
      "supplyLimit",
      "governmentBan",
    ],
  },
  BitcoinCriticismsFallaciesIII: {
    questions: [
      "concentratedOwnership",
      "centralizedMining",
      "tooExpensive",
      "prohibitivelyHigh",
      "willBeHoarded",
      "canBeDuplicated",
    ],
  },
  BitcoinAndEconomicsI: {
    questions: [
      "scarcity",
      "monetaryPremium",
      "greshamsLaw",
      "thiersLaw",
      "cantillonEffect",
      "schellingPoint",
    ],
  },
  BitcoinAndEconomicsII: {
    questions: [
      "opportunityCost",
      "timePreference",
      "impossibleTrinity",
      "jevonsParadox",
      "powerLaws",
      "winnerTakeAll",
    ],
  },
  BitcoinAndEconomicsIII: {
    questions: [
      "unitBias",
      "veblenGood",
      "malinvestment",
      "asymmetricPayoff",
      "ansoffMatrix",
    ],
  },
} as const
