import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"
import { getQuizQuestionsContent } from "@app/screens/earns-screen/earns-utils"
const expectedEnglishQuizSections = [
  {
    meta: { id: "bitcoinWhatIsIt", title: "Bitcoin: What is it?" },
    content: [
      {
        id: "whatIsBitcoin",
        type: "Text",
        title: "So what exactly is Bitcoin?",
        text: "Bitcoin is digital money. \n\nIt can be transferred instantly and securely between any two people in the world — without the need for a bank or any other financial company in the middle.",
        question: "So what exactly is Bitcoin?",
        answers: ["Digital money", "A video game", "A new cartoon character"],
        feedback: [
          "Correct. You just earned 1 “sat”!",
          "Incorrect, please try again.",
          "Nope. At least not one that we know of!",
        ],
      },
      {
        id: "sat",
        type: "Text",
        title: 'I just earned a “Sat". What is that?',
        text: "One “Sat” is the smallest unit of a bitcoin. \n\nWe all know that one US Dollar can be divided into 100 cents. Similarly, one Bitcoin can be divided into 100,000,000 sats. \n\nIn fact, you do not need to own one whole bitcoin in order to use it. You can use bitcoin whether you have 20 sats, 3000 sats — or 100,000,000 sats (which you now know is equal to one bitcoin).",
        question: 'I just earned a “Sat". What is that?',
        answers: [
          "The smallest unit of Bitcoin",
          "A small satellite",
          "A space cat 🐱🚀",
        ],
        feedback: [
          "Correct. You just earned another two sats!!",
          "Maybe… but that is not the correct answer in this context 🙂",
          "Ummm.... not quite!",
        ],
      },
      {
        id: "whereBitcoinExist",
        type: "Text",
        title: "Where do the bitcoins exist?",
        text: "Bitcoin is a new form of money. It can be used by anyone, anytime -- anywhere in the world. \n\nIt is not tied to a specific government or region (like US Dollars). There are also no paper bills, metal coins or plastic cards. \n\nEverything is 100% digital. Bitcoin is a network of computers running on the internet. \n\nYour bitcoin is easily managed with software on your smartphone or computer!",
        question: "Where do the bitcoins exist?",
        answers: ["On the Internet", "On the moon", "In a Federal bank account"],
        feedback: [
          "Correct. You just earned another 5 sats.",
          "Incorrect. Well… at least not yet ;)",
          "Wrong. Please try again.",
        ],
      },
      {
        id: "whoControlsBitcoin",
        type: "Text",
        title: "Who controls Bitcoin?",
        text: "Bitcoin is not controlled by any person, company or government. \n\nIt is run by the community of users -- people and companies all around the world -- voluntarily running bitcoin software on their computers and smartphones.",
        question: "Who controls Bitcoin?",
        answers: [
          "A voluntary community of users around the world",
          "Mr Burns from The Simpsons",
          "The government of France",
        ],
        feedback: [
          "That is right. Bitcoin is made possible by people all around the world running bitcoin software on their computers and smartphones.",
          "An amusing thought — but not correct!",
          "Wrong. There is no company nor government that controls Bitcoin.",
        ],
      },
      {
        id: "copyBitcoin",
        type: "Text",
        title:
          "If Bitcoin is digital money, can’t someone just copy it — and create free money?",
        text: "The value of a bitcoin can never be copied. This is the very reason why Bitcoin is such a powerful new invention!!\n\nMost digital files — such as an iPhone photo, an MP3 song, or a Microsoft Word document — can easily be duplicated and shared. \n\nThe Bitcoin software uniquely prevents the duplication — or “double spending” — of digital money. We will share exactly how this works later on!",
        question:
          "If Bitcoin is digital money, can’t someone just copy it — and create free money?",
        answers: [
          "No — it is impossible to copy or duplicate the value of bitcoin",
          "Yes, you can copy bitcoins just as easily as copying a digital photo",
          "Yes, but copying bitcoin requires very specialized computers",
        ],
        feedback: [
          "That is absolutely correct!",
          "You know that it is not true. Try again.",
          "Incorrect. There is no way for anyone to copy, or create a duplicate, of bitcoin.",
        ],
      },
    ],
  },
  {
    meta: { id: "WhatIsMoney", title: "What is Money? " },
    content: [
      {
        id: "moneySocialAggrement",
        type: "Text",
        title: "Money is a social agreement.",
        text: "Money requires people to trust. \n\nPeople trust the paper dollar bills in their pocket. They trust the digits in their online bank account. They trust the balance on a store gift card will be redeemable. \n\nHaving money allows people to easy trade it immediately for a good, or a service.",
        question: "Why does money have value?",
        answers: [
          "Because people trust that other people will value money similarly",
          "Because your mother told you so",
          "Because a dollar bill is worth its weight in gold",
        ],
        feedback: [
          "Correct. This is what allows money to work!",
          "She may well have. But that is not the correct answer here!",
          "Nope. In the past you could exchange US dollars for gold. But this is no longer the case.",
        ],
      },
      {
        id: "coincidenceOfWants",
        type: "Text",
        title: "Money solves the “coincidence of wants”...  What is that??",
        text: "Centuries ago, before people had money, they would barter -- or haggle over how to trade one unique item, in exchange for another item or service. \n\nLet’s say you wanted to have a meal at the local restaurant, and offered the owner a broom. The owner might say “no” -- but I will accept three hats instead, if you happen to have them. \n\nYou can imagine how difficult and inefficient a “barter economy” would be !  \n\nBy contrast, with money, you can simply present a $20 bill. And you know that the restaurant owner will readily accept it.",
        question: "Which coincidence does money solve?",
        answers: [
          "Coincidence of wants",
          "Coincidence of day and night",
          "Coincidence of the moon blocking the sun",
        ],
        feedback: [
          "That is right. Money allows you to easily purchase something, without haggling about the form of payment",
          "No silly, you know that is not the answer.",
          "Not quite. We call that a solar eclipse 🌚",
        ],
      },
      {
        id: "moneyEvolution",
        type: "Text",
        title: "Money has evolved, since almost the beginning of time.",
        text: "Thousands of years ago, society in Micronesia used very large and scarce stones as a form of agreed currency. \n\nStarting in the 1500’s, rare Cowrie shells (found in the ocean) became commonly used in many nations as a form of money.\n\nAnd for millenia, gold has been used as a form of money for countries around the world -- including the United States (until 1971).",
        question:
          "What are some items that have been historically used as a unit of money?",
        answers: [
          "Stones, seashells and gold",
          "Tiny plastic Monopoly board game houses",
          "Coins made of chocolate",
        ],
        feedback: [
          "Correct. Items that are rare and difficult to copy have often been used as money.",
          "Wrong. They may have value when playing a game -- but not in the real word!",
          "Nope. They may be tasty. But they are not useful as money.",
        ],
      },
      {
        id: "whyStonesShellGold",
        type: "Text",
        title: "Why were stones, shells and gold commonly used as money in the past?",
        text: "Well, these items all had some -- but not all -- of the characteristics of good money. \n\nSo what characteristics make for “good” money? \nScarce: not abundant, nor easy to reproduce or copy \nAccepted: relatively easy for people to verify its authenticity \nDurable: easy to maintain, and does not perish or fall apart\nUniform: readily interchangeable with another item of the same form\nPortable: easy to transport\nDivisible: can be split and shared in smaller pieces",
        question: "Why were stones, seashells and gold used as units of money?",
        answers: [
          "Because they have key characteristics -- such as being durable, uniform and divisible.",
          "Because they are pretty and shiny.",
          "Because they fit inside of your pocket",
        ],
        feedback: [
          "Correct. More key characteristics include being scarce and portable.",
          "Incorrect. That may be true, but alone are not great characteristics of money.",
          "Not quite. Although these items were surely portable, that alone was not the reason to be used as money.",
        ],
      },
      {
        id: "moneyIsImportant",
        type: "Text",
        title: "Money is important to individuals",
        text: "Everybody knows that money matters.\n\nMost people exchange their time and energy -- in the form of work -- to obtain money. People do so, to be able to buy goods and services today -- and in the future.",
        question: "What is the primary reason money is important?",
        answers: [
          "Money allows people to buy goods and services today -- and tomorrow.",
          "Money allows you to go to the moon.",
          "Money is the solution to all problems.",
        ],
        feedback: [
          "That is right!",
          "Incorrect. Although that may change in the future ;)",
          "Not quite. Although some people may believe such, this answer does not address the primary purpose of money.",
        ],
      },
      {
        id: "moneyImportantGovernement",
        type: "Text",
        title: "Money is also important to governments",
        text: "Modern-day economies are organized by nation-states: USA, Japan, Switzerland, Brazil, Norway, China, etc. \n\nAccordingly, in most every nation, the government holds the power to issue and control money. \n\nIn the United States, the Central Bank (known as the Federal Reserve, or “Fed”) can print, or create, more US Dollars at any time it wants. \n\nThe “Fed” does not need permission from the President, nor Congress, and certainly not from US citizens.  \n\nImagine if you had the ability to print US Dollars anytime you wanted to -- what would you do??",
        question: "Who can legally print US Dollars, anytime they wish?",
        answers: [
          "The US Central Bank (The Federal Reserve)",
          "Mr Burns from The Simpsons",
          "A guy with a printing press in his basement",
        ],
        feedback: [
          "Correct. The US Government can print as much money as they want at any time.",
          "Incorrect. Although it did seem like he always had a lot of money.",
          "No. Whilst some people do create fake dollar bills, it is definitely not legal!",
        ],
      },
    ],
  },
  {
    meta: { id: "HowDoesMoneyWork", title: "How Does Money Work? " },
    content: [
      {
        id: "WhatIsFiat",
        type: "Text",
        title: "Fiat Currency: What is that?",
        text: "All national currencies in circulation today are called “fiat” money. This includes US Dollars, Japanese Yen, Swiss Francs, and so forth. \n\nThe word “fiat” is latin for “by decree” -- which means “by official order”. \n\nThis means that all fiat money -- including the US Dollar -- is simply created by the order of the national government.",
        question: "Who creates fiat money, such as US Dollars or Swiss Francs?",
        answers: [
          "It is created by order of the National government in a given country.",
          "By the manager of the local branch bank.",
          "The Monopoly Money Man.",
        ],
        feedback: [
          "Correct. The central bank of a government creates fiat money.",
          "Incorrect. A local bank can only manage money that has been previously created by the government.",
          "Nope. Try again!",
        ],
      },
      {
        id: "whyCareAboutFiatMoney",
        type: "Text",
        title: "I trust my government. \nWhy should I care about fiat money?",
        text: "As shared in a prior quiz, the US Central Bank is the Federal Reserve, or the “Fed”.\n\nThe Fed can print more dollars at any time -- and does not need permission from the President, nor Congress, and certainly not from US citizens.  \n\nHaving control of money can be very tempting for authorities to abuse -- and often time leads to massive inflation, arbitrary confiscation and corruption. \n\nIn fact, Alan Greenspan, the famous former chairman of The Fed, famously said the US “can pay any debt that it has, because we can always print more to do that”.",
        question: "Why should I care about the government controlling fiat money?",
        answers: [
          "All fiat currency is eventually abused by government authorities.",
          "Local banks might not have enough vault space to hold all of the dollar bills.",
          "There might not be enough trees to make paper for all of the additional dollar bills.",
        ],
        feedback: [
          "Correct. Throughout history, governments have been unable to resist the ability to print money, as they effectively have no obligation to repay this money.",
          "Nope, that is certainly not the case.",
          "Wrong. Please try again.",
        ],
      },
      {
        id: "GovernementCanPrintMoney",
        type: "Text",
        title: "Who should care that the government can print unlimited money?",
        text: "Well, everybody should care! \n\nThe practice of government printing money -- or increasing the supply of dollars -- leads to inflation.\n\nInflation is an increase in the price of goods and services. In other words, the price for something in the future will be more expensive than today.\n\nSo what does inflation mean for citizens? \n\nIn the United Kingdom, the Pound Sterling has lost 99.5% of its value since being introduced over 300 years ago. \n\nIn the United States, the dollar has lost 97% of its value since the end of WWI, about 100 years ago. \n\nThis means a steak that cost $0.30 in 1920... was $3 in 1990… and about $15 today, in the year 2020!",
        question: "What does it mean when the government prints money?",
        answers: [
          "The printing of additional money leads to inflation.",
          "People must exchange old dollar bills at the bank every year.",
          "The appearance of the dollar bill changes.",
        ],
        feedback: [
          "Correct. This means that goods and services will cost more in the future.",
          "Nope. Older dollar bills are just as valid as newer ones.",
          "Incorrect. Although the government may issue new looks for bills, this has nothing to do with increasing the money supply.",
        ],
      },
      {
        id: "FiatLosesValueOverTime",
        type: "Text",
        title: "Does this mean that all fiat money loses value over time?",
        text: "That is correct. \n\nIn the history of the world, there have been 775 fiat currencies created. Most no longer exist, and the average life for any fiat money is only 27 years.\n\nThe British Pound is the oldest fiat currency. It has lost more than 99% of its value since 1694. \n\nThere is no precedent for any fiat money maintaining its value over time. This is inflation. \nIt is effectively a form of theft of your own hard earned money !",
        question: "What happens to the value of all fiat money over time?",
        answers: [
          "Every fiat currency that ever existed has lost a massive amount of value.",
          "The value stays the same forever.",
          "The look and design of paper bills is updated every 10 years or so.",
        ],
        feedback: [
          "Correct. This is true even for USD, which has lost 97% of its value during the last 100 years.",
          "Incorrect. Please try again.",
          "Not quite. Although the design of papers bills may change, this has nothing to do with their value.",
        ],
      },
      {
        id: "OtherIssues",
        type: "Text",
        title: "OK, fiat money loses value over time. Are there other issues?",
        text: "Yes, there are many other issues that exist with modern fiat money. \n\nFirst, it can be extremely difficult to move money around the world. Often, governments will outright restrict the movement -- and sometimes even confiscate money -- without a valid reason or explanation. And even when you can send money, high transaction fees make it very expensive.\n\nSecond, even in the US, there has been a complete loss of privacy, as the majority of commerce takes places with debit and credit cards, as well as online with other systems such as PayPal and Apple Pay.\n\nEver notice how an ad appears in your social media or Gmail just moments after searching for a certain product or service? This is known as “surveillance capitalism”, and is based on companies selling your personal financial data.",
        question: "What are some other issues that exist with fiat money?",
        answers: [
          "Money is difficult to move around the world, and can also be surveilled.",
          "Money is no longer needed in the 21st Century.",
          "Money is the root of all evil.",
        ],
        feedback: [
          "Correct. We will explain more about these issues in subsequent quiz modules. Keep digging!!",
          "Wrong answer. You know that is not true.",
          "While some may believe this to be so, it is not the answer we are looking for here.",
        ],
      },
    ],
  },
  {
    meta: { id: "BitcoinWhySpecial", title: "Bitcoin: Why is it special? " },
    content: [
      {
        id: "LimitedSupply",
        type: "Text",
        title: "Special Characteristic #1:\nLimited Supply",
        text: "Governments can print fiat money in unlimited quantities. \n\nBy way of contrast, the supply of Bitcoin is fixed — and can never exceed 21 million coins. \n\nA continually increasing supply of fiat money creates inflation. This means that the money you hold today is less valuable in the future. \n\nOne simple example: \nA loaf of bread that cost about 8 cents in 1920. In the year 1990 one loaf cost about $1.00, and today the price is closer to $2.50 ! \n\nThe limited supply of bitcoin has the opposite effect, one of deflation. \n\nThis means that the bitcoin you hold today is designed to be more valuable in the future — because it is scarce.",
        question: "Is the supply of bitcoin limited forever?",
        answers: [
          "Yes. There can never be more than 21 million bitcoin created.",
          "No. The government can create more bitcoin at any time.",
          "No, the bitcoin software can be changed to allow more bitcoins to be created.",
        ],
        feedback: [
          "Correct. By limiting the amount that can be created, Bitcoin is designed to increase in value over time.",
          "Wrong answer. The government has no control over Bitcoin.",
          "Incorrect. One of the key attributes of bitcoin is that the supply is limited forever.",
        ],
      },
      {
        id: "Decentralized",
        type: "Text",
        title: "Special Characteristic #2: Decentralized",
        text: "Fiat money is controlled by banks and governments — which is why people refer to it as a “centralized” currency.\n\nBitcoin is not controlled by any person, government or company — which makes it “decentralized” \n\nNot having banks involved means that nobody can deny you access to bitcoin — because of race, gender, income, credit history, geographical location — or any other factor. \n\nAnybody — anywhere in the world — can access and use Bitcoin anytime you want. All you need is a computer or smartphone, and an internet connection!",
        question: "Is bitcoin centralized?",
        answers: [
          "No. Bitcoin is completely “decentralized”.",
          "Yes. It is centrally controlled by the United Nations.",
          "Yes. It is centrally controlled by the world’s largest banks.",
        ],
        feedback: [
          "That is correct. There is no company, government or institution that controls bitcoin. Anyone can use bitcoin — all need is a smartphone and an internet connection.",
          "Wrong answer. Please try again.",
          "Incorrect. You already know this is not true!",
        ],
      },
      {
        id: "NoCounterfeitMoney",
        type: "Text",
        title: "Special Characteristic #3: \nNo Counterfeit Money",
        text: "Paper money, checks and credit card transactions can all be counterfeit, or faked. \n\nThe unique software that runs the Bitcoin network eliminates the possibility of duplicating money for counterfeit purposes.  \n\nNew bitcoin can only be issued if there is agreement amongst the participants in the network. People who are voluntarily running bitcoin software on their own computers and smartphones.\n\nThis ensures that it is impossible to counterfeit, or create fake bitcoins.",
        question: "Can people counterfeit Bitcoin?",
        answers: [
          "No. It is impossible to counterfeit Bitcoin.",
          "Yes. Although creating fake bitcoin requires very specialized computers.",
          "Yes. The government can print as much bitcoin as it likes.",
        ],
        feedback: [
          "That is the right answer. In a subsequent quiz, Honey Badger will explain details as to why this is so!",
          "Incorrect. There is no way for anyone to copy or duplicate the value of a bitcoin.",
          "Wrong. Although the government can print unlimited dollars, it can not print bitcoin.",
        ],
      },
      {
        id: "HighlyDivisible",
        type: "Text",
        title: "Special Characteristic #4: \nHighly Divisible",
        text: 'Old-fashioned fiat money can only be spent in amounts as small as one penny — or two decimal places for one US Dollar ($0.01).\n\nOn the other hand, Bitcoin can be divided 100,000,000 times over. This means that you could spend as little as ₿0.00000001. You will note the "₿" symbol, which is the Bitcoin equivalent of "$". Sometimes you will also see the use of BTC, instead of ₿.\n\nBy way of contrast, Bitcoin can handle very small payments — even those less than one US penny!',
        question: "What is the smallest amount of Bitcoin one can own, or use?",
        answers: [
          "0.00000001 BTC",
          "One whole bitcoin. It is not possible to use anything less.",
          "0.01 BTC",
        ],
        feedback: [
          "Yes. You can divide a bitcoin into 100,000,000 pieces. As you already know, the smallest unit of bitcoin — B0.00000001 — is known as a “sat”.",
          "Wrong. Bitcoin is highly divisible. You can easily use a very small fraction of a bitcoin.",
          "Incorrect. Although the smallest unit of US currency is one penny, a bitcoin is divisible by much more than 100x.",
        ],
      },
      {
        id: "securePartOne",
        type: "Text",
        title: "Special Characteristic #5: \nSecure -- Part I",
        text: "The bitcoin network is worth well over $100 billion today. Accordingly, the network must be very secure — so that money is never stolen. \n\nBitcoin is known as the world’s first cryptocurrency. \n\nThe “crypto” part of the name comes from cryptography. Simply put, cryptography protects information through very complex math functions. \n\nMost people do not realize — but Bitcoin is actually the most secure computer network in the world ! \n\n(you may have heard about bitcoin “hacks” — which we will debunk in the next quiz)",
        question: "Is the Bitcoin network secure?",
        answers: [
          "Yes. The bitcoin network is very secure.",
          "Maybe. It depends on the day of the week.",
          "No. It is open source software, and is easily attacked.",
        ],
        feedback: [
          "Correct. In fact, the Bitcoin network has never once been hacked. Answer the next question to learn more!",
          "Nice try, but wrong. The bitcoin network is safe and secure — 24 hours a day, 365 days a year.",
          "Icorrect. Although bitcoin is indeed “open source” software — or available to the public for free — is still extremely secure.",
        ],
      },
      {
        id: "securePartTwo",
        type: "Text",
        title: "Special Characteristic #5: \nSecure -- Part II",
        text: "To be direct: the bitcoin network itself has never been hacked. Never once.\n\nThen what exactly has been hacked? \n\nCertain digital wallets that did not have proper security in place. \n\nJust like a physical wallet holds fiat currency (in the form of paper bills), digital wallets hold some amount of bitcoin. \n\nIn the physical world, criminals rob banks — and walk away with US Dollars. The fact that someone robbed a bank does not have any relationship as to whether the US Dollar is stable or reliable money. \n\nSimilarly, some computer hackers have stolen bitcoin from insecure digital wallets — the online equivalent of a bank robbery. \n\nHowever, it is important to know that the bitcoin network has never been hacked or compromised !",
        question: "Has Bitcoin ever been hacked?",
        answers: [
          "No. Bitcoin has never been hacked.",
          "Yes. Bitcoin gets hacked frequently.",
          "Yes. Bitcoin usually gets hacked on holidays, when traditional banks are closed.",
        ],
        feedback: [
          "That is correct. The bitcoin network has never been compromised. However, it is important to use only secure digital wallets to keep your personal bitcoins safe at all times.",
          "Wrong. Please try again.",
          "No silly, you know that is not the correct answer.",
        ],
      },
    ],
  },
]
describe("Earn utils test", () => {
  it("Converts quiz sections to proper types", () => {
    loadLocale("en")
    const LL = i18nObject("en")
    const quizSectionContent = getQuizQuestionsContent({ LL })
    expect(quizSectionContent).toStrictEqual(expectedEnglishQuizSections)
  })
})
