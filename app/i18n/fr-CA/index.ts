// prettier-ignore

import { Translation } from "../i18n-types";

/* eslint-disable no-template-curly-in-string */
/* eslint-disable max-lines */
const frCA: Translation = {
  AuthenticationScreen: {
    authenticationDescription: "Authentifiez vous pour continuer",
    setUp: "Configurez l'authentification biométrique",
    setUpAuthenticationDescription: "Utilisez l'authentification biométrique",
    skip: "Sautez cette étape",
    unlock: "Déverrouillez",
    usePin: "Utilisez un NIP",
  },
  BalanceHeader: {
    currentBalance: "Solde actuel",
    hiddenBalanceToolTip: "Appuyez pour révéler votre solde",
  },
  ContactsScreen: {
    noContactsTitle: "Aucun contact trouvé",
    noContactsYet:
      "Envoyez ou recevez un paiement en utilisant un nom d'utilisateur et il sera automatiquement ajouté à vos contacts ici",
    noMatchingContacts: "Aucun contact ne correspond à votre recherche.",
    title: "Contacts",
  },
  ContactDetailsScreen: {
    title: "Transactions avec {username}",
  },
  EarnScreen: {
    earnSats: "Gagner {formattedNumber|sats}",
    earnSections: {
      bitcoinWhatIsIt: {
        title: "Bitcoin: Qu'est-ce que c'est?",
        questions: {
          whatIsBitcoin: {
            answers: [
              "Monnaie numérique",
              "Un jeu vidéo",
              "Un nouveau personnage de dessins animés",
            ],
            feedback: [
              "Exact. Vous avez gagné 1 “sat”!",
              "Faux, svp essayez de nouveau.",
              "Vraiment pas. Au moins, aucun que l'on connait!",
            ],
            question: "Qu'est-ce que le Bitcoin exactement?",
            text: "Le Bitcoin est une monnaie numérique. \n\n Deux personnes peuvent s'échanger un bitcoin instantanément et en toute sécurité partout dans le monde, sans l'aide d'une banque ou d'autre compagnie financière.",
            title: "Qu'est-ce que le Bitcoin exactement?",
            type: "Text",
          },
          sat: {
            answers: [
              "La plus petite unité de bitcoin",
              "Un petit satellite",
              "Un chat spatial 🐱🚀",
            ],
            feedback: [
              "Exact. Vous vous méritez deux sats!!",
              "Peut-être… mais ce n'est pas la bonne réponse dans ce contexte 🙂",
              "Vraiment pas.... mais ce serait génial!",
            ],
            question: "Je viens de gagner un “Sat”, qu'est-ce que c'est?",
            text: "Un “Sat” est la plus petite unité d'un bitcoin. \n\n On sait tous qu'un dollar peut être diviser en 100 centimes. De façon similaire, un bitcoin peut se diviser en 100,000,000 sats. \n\n En fait, on a pas besoin d'avoir tout un bitcoin pour s'en servir. On peut se servir de Bitcoin que l'on possède 20 sats, 3000 sats ou 100,000,000 sats (ce qui équivaut à un bitcoin).",
            title: "Je viens de gagner un “Sat”, qu'est-ce que c'est?",
            type: "Text",
          },
          whereBitcoinExist: {
            answers: [
              "Dans le réseau Internet",
              "Sur la Lune",
              "Dans un compte en banque fédéral",
            ],
            feedback: [
              "Exact. Vous gagnez un autre 5 sats.",
              "Faux. Au moins pas pour l'instant ;)",
              "Faux, svp essayez de nouveau.",
            ],
            question: "Où sont définis les bitcoins?",
            text: "Le Bitcoin est une nouvelle forme de monnaie. Tout le monde peuvent s'en servir, à n'importe quel moment et n'importe où dans le monde. \n\n Il n'est pas rattaché à un gouvernment ou une région spécifique (comme le dollard US par exemple). De plus, il n'y a pas de version sur papier, sur pièces métalliques ou de cartes de plastique. \n\n Tout est 100% numérique. Le Bitcoin est un réseau d'ordinateurs reliés par internet. \n\n Vos bitcoins sont facilement gérés à partir de votre ordinateur ou de votre téléphone!",
            title: "Où sont définis les bitcoins?",
            type: "Text",
          },
          whoControlsBitcoin: {
            answers: [
              "Une communauté mondiale d'utilisateurs volontaires",
              "Mr Burns de la série télévisée Les Simpson",
              "Le gouvernement de France",
            ],
            feedback: [
              "C'est la bonne réponse. Le Bitcoin est possible grâce à la participation de personnes exécutant le logiciel Bitcoin sur leurs ordinateurs ou leurs téléphones.",
              "Une idée amusante, mais incorrecte!",
              "Faux. Aucun gouvernement ni aucune compagnie ne contrôle le Bitcoin.",
            ],
            question: "Qui contrôle le Bitcoin?",
            text: "Le Bitcoin n'est pas controlé pour une personne, une compagnie ou un gouvernement. \n\n Il est dirigé par la communauté d'utilisateurs, des gens et des compagnies d'un peu partout dans le monde, qui roulent logiciel Bitcoin de façon volontaire sur leurs ordinateurs ou leurs téléphones.",
            title: "Qui contrôle le Bitcoin?",
            type: "Text",
          },
          copyBitcoin: {
            answers: [
              "Non, c'est impossible de copier ou dupliquer la valeur du bitcoin",
              "Oui, on peut copier des bitcoins aussi facilement que l'on peut copier des photos numériques",
              "Oui, mais copier des bitcoins nécessite des ordinateurs spécialisés",
            ],
            feedback: [
              "C'est tout à fait juste!",
              "Tu sais que ce n'est pas vrai. Essaie de nouveau.",
              "Faux. Il n'y a aucune façon de copier ou dupliquer des bitcoins.",
            ],
            question:
              "Si le Bitcoin est une monnaie numérique, est-ce que quelqu'un pourrait le copier et ainsi créer de l'argent gratuit?",
            text: "La valeur d'un bitcoin ne peut jamais être copié. C'est justement pour cela que le Bitcoin est une invention aussi puissante!!\n\n La plupart des fichiers numériques, comme les photos d'un iPhone, une chanson en format MP3, ou un document Microsoft Word, peuvent facilement être dupliqués et partagés. \n\n Le logiciel Bitcoin empêche la duplication, ou dans le jargon Bitcoin “la double dépense”, de la monnaie numérique. On va expliquer le fonctionnement précis de l'algorithme plus tard!",
            title:
              "Si le Bitcoin est une monnaie numérique, est-ce que quelqu'un pourrait le copier et ainsi créer de l'argent gratuit?",
            type: "Text",
          },
        },
      },
      WhatIsMoney: {
         title: "Qu'est-ce que c'est de la monnaie? ",
        questions: {
          moneySocialAggrement: {
            answers: [
              "Parce que les gens ont confiance que d'autres personnes vont évaluer la monnaie de façon similaire",
              "Parce que votre mère vous l'a dit",
              "Parce qu'un billet d'un dollar vaut son poids en or",
            ],
            feedback: [
              "Exact. C'est ce qui permet à la monnaie de fonctionner!",
              "Elle l'a peut être fait. Mais ce n'est pas la bonne réponse ici!",
              "Non, plus maintenant. Dans le passé, on pouvait échanger des dollars contre de l'or, mais ce n'est plus le cas.",
            ],
            question: "Pourquoi les monnaies ont de la valeur?",
            text: "La monnaie nécessite la confiance du peuple.\n\n Les gens font confiance à la monnaie papier dans leurs poches. Ils font confiance aux chiffres dans leurs comptes banquaires en ligne. Ils font confiance que le solde de leurs cartes cadeaux sera disponible pour des transactions. \n\n Avoir de la monnaie permet au gens de l'échanger facilement pour des biens ou des services.",
            title: "L'argent est un contrat social.",
            type: "Text",
          },
          coincidenceOfWants: {
            answers: [
              "La double coïncidence des besoins",
              "La coïncidence du jour et de la nuit",
              "La coïncidence de la lune bloquant la lumière du Soleil",
            ],
            feedback: [
              "Exact. La monnaie permet des transactions qui ne nécessitent pas de négotiation sur la forme du paiement.",
              "Il ne faut pas cliquer sur n'importe quoi voyons...",
              "Et non, on appelle cette coïncidence une éclipse solaire 🌚 et la monnaie ne change rien dans ce cas.",
            ],
            question: "Quelle coïncidence est évitée par l'utilisation de la monnaie?",
            text: "Il y a des siècles, avant l'invention de la monnaie, les gens faisaient du troc -- c'est-à-dire ils négotiaient l'échange d'un bien contre un autre type de bien ou de service. \n\n Disons que vous vouliez manger dans un restaurant et que vous offriez au propriétaire un balais en échange d'un repas. Le propriétaire pouvait dire “non, mais je vais prendre trois chapeaux, si vous en avez”. \n\n Vous pouvez imaginer comme un système de troc pouvait être difficile et inefficace!\n\n En contrast, avec de la monnaie, un simple billet de 20$ règle cette transaction en sachant que le propriétaire du restaurant l'acceptera volontier.",
            title:
              "La monnaie permet d'éviter la “double coïncidence des besoins”...  C'est quoi ça??",
            type: "Text",
          },
          moneyEvolution: {
            answers: [
              "Des pierres, des coquillages et de l'or",
              "Des petites maisons de Monopoly en plastique",
              "Des pièces en chocolat",
            ],
            feedback: [
              "Exact. Des objets rares et difficiles à copier étaient souvent utilisés comme monnaie.",
              "Faux. Ils ont de la valeur lorsque l'on joue au jeu, mais pas dans le monde réel!",
              "Non. Ils sont délicieux, mais ils ne seraient pas utile comme monnaie.",
            ],
            question: "Historiquement, quels objets ont déjà été utilisés comme monnaie?",
            text: "Il y a des milliers d'années, la société en Micronésie a utilisé des pierres très grosses et rares comme forme de monnaie. \n\nAu début du XVIe siècle, les cauris rares (trouvés dans l'océan) sont devenus couramment utilisés dans de nombreux pays comme forme de monnaie.\n\nEt pendant des millénaires, l'or a été utilisé comme une forme de monnaie par les pays du monde entier -- incluant les États-Unis (jusqu'en 1971).",
            title: "La monnaie a évoluée depuis le début de la civilisation.",
            type: "Text",
          },
          whyStonesShellGold: {
            answers: [
              "Parce qu'ils ont des caractéristiques essentielles, comme une bonne durabilité, une uniformité et qu'ils sont divisibles.",
              "Parce qu'ils brillent et qu'ils sont jolis.",
              "Parce qu'ils peuvent être transportés dans nos poches.",
            ],
            feedback: [
              "Exact. D'autres caractéristiques essentielles sont qu'ils sont rares et portables.",
              "Faux. C'est peut-être le cas, mais ce ne sont pas des caractéristiques utiles pour de la monnaie.",
              "Pas tout à fait. Bien que c'est objets étaient portable, ce n'est pas une raison suffisante en soi.",
            ],
            question:
              "Pourquoi les pierres, les coquillages et l'or furent utilisés comme monnaie?",
            text: "Ces objets possèdent des caractéristiques essentielles, mais pas tous, pour une bonne monnaie. \n\n Quelles sont les caractéristiques essentielles pour une “bonne” monnaie? \n Rareté: peu abondante et difficile à reproduire ou copier \n Elle doit être acceptée: c'est relativement facile de vérifier son authenticité \n Durabilité: facile à maintenir, sans qu'elle périsse ou tombe en pièces \n Uniformité: facilement échangeable avec un autre objet du même type \n Portabilité: facile à transporter \n Divisible: peut-être séparée en pièces plus petites.",
            title:
              "Pourquoi les pierres, les coquillages et l'or furent utilisés comme monnaie?",
            type: "Text",
          },
          moneyIsImportant: {
            answers: [
              "La monnaie permet d'acheter des biens et des services aujourd'hui et demain.",
              "La monnaie permet de se rendre sur la Lune.",
              "La monnaie est la solution de tous les problèmes.",
            ],
            feedback: [
              "C'est tout à fait cela!",
              "Faux. Bien que cela puisse changer dans le futur ;)",
              "Pas tout à fait. Bien que des gens le croient, cette réponse n'identifie pas la raison d'être principale de la monnaie.",
            ],
            question:
              "Quelle est la raison d'être principale de la monnaie? Pourquoi est-elle importante?",
            text: "Tout le monde sait que la monnaie est importante. \n\n La plupart des gens échangent leur temps et leur énergie, sous la forme de travail, pour obtenir de la monnaie. Ils le font pour pouvoir acheter des biens et des servies aujourd'hui et dans le futur.",
            title: "La monnaie est importante pour les individus",
            type: "Text",
          },
          moneyImportantGovernement: {
            answers: [
              "La banque centrale du pays, par exemple la Banque Centrale des États-Unis (La Réserve Fédérale)",
              "Mr Burns de la série télévisée Les Simpson",
              "Un gars avec une imprimante dans son sous-sol",
            ],
            feedback: [
              "Exact. Le gouvernement peut imprimer autant de monnaie qu'il veut, quand il veut.",
              "Faux. Bien que dans la série, il ne manque presque jamais d'argent.",
              "Non. Certaines personnes peuvent imprimer des faux billets, mais ce n'est définitivement pas légal!",
            ],
            question: "Qui peut imprimer de la monnaie quand ils le veulent?",
            text: "Les économies modernes sont organisées par les nations: USA, Japon, Suisse, Brésil, Norvège, Chine, etc. \n\n Ainsi, dans la majorité des nations, le gouvernement détient le pouvoir de créer et de contrôler la monnaie. \n\n Aux États-Unis, la Banque Centrale (appelée la Réserve Fédérale, ou “Fed”) peut imprimer ou créer plus de dollars US quand elle le désire. \n\n La “Fed” ne requière pas la permission du Président, ni du Congrès, et certainement pas des citoyens. \n\n Imaginez si vous pouviez imprimer des dollars US quand vous le vouliez, que feriez-vous??",
            title: "La monnaie est aussi importante pour les gouvernements",
            type: "Text",
          },
        },
      },
      HowDoesMoneyWork: {
        title: "Comment fonctionne la monnaie? ",
        questions: {
          WhatIsFiat: {
            answers: [
              "Elle est créée sous les ordres du gouvernement national du pays.",
              "Par le gérant d'une banque locale.",
              "Par le créateur du jeu Monopoly.",
            ],
            feedback: [
              "Exact. La banque centrale d'un gouvernement crée la monnaie fiduciaire.",
              "Faux. Une banque locale ne peut que gérer de la monnaie qui a été créée précédemment par le gouvernement.",
              "Non. Essayez encore!",
            ],
            question: "Qui crée la monnaie fiduciaire, comme le Dollar US ou Canadien?",
            text: "Toutes les monnaies nationales en circulation aujourd'hui sont appelées monnaies fiduciaires. Ceci inclu le Dollar US, le Yen Japonais, le Franc Suisse, le Dollar Canadien et ainsi de suite. \n\n Le mot “fiduciaire” signifie que sa valeur est fondée seulement sur la confiance accordée à celui qui les émets. \n\n Ceci signifie que toute monnaie fiduciaire, incluant le Dollar US, est simplement créée sous les ordres du gouvernement national.",
            title: "La monnaie fiduciaire: qu'est-ce que c'est?",
            type: "Text",
          },
          whyCareAboutFiatMoney: {
            answers: [
              "Tous les gouvernements abusent éventuellement de leur pouvoir sur leurs monnaies fiduciaires.",
              "Les banques locales peuvent manquer d'espace dans leur coffres pour stoquer tous les billets.",
              "On pourrait manquer d'arbres pour fabriquer tous ces billets en papier additionnels.",
            ],
            feedback: [
              "Exact. Historiquement, les gouvernements n'ont pas pu résister à la tentation d'imprimer plus de monnaie puisqu'ils n'ont pas d'obligation de repayer cette nouvelle monnaie.",
              "Non, c'est certainement pas le cas.",
              "Faux. D'ailleur plusieurs billets ne sont pas fait à partir des arbres. Essayez encore.",
            ],
            question:
              "Pourquoi devrais-je me soucier du contrôle du gouvernement sur la monnaie fiduciaire?",
            text: "Tel que vu dans un quiz précédent, la banque centrale des États-Unis est la Réserve Fédérale, ou la “Fed”.\n\n La Fed peut imprimer plus de monnaie quand elle le désire et elle ne requiert pas la permission du Président, ni du Congrès et certainement pas des citoyens. \n\n Avec ce genre de contrôle sur la monnaie, il peut être très tentant pour ces autorités d'en abuser. Cela mène parfois à de l'inflation massive, des confiscations arbitraires et de la corruption. \n\n En fait, Alan Greenspan, le célèbre ex-président de la Fed, a déclaré que les États-Unis “peuvent payer n'importe quelle dette, puisqu'on peut toujours imprimer plus de billets pour faire cela”.",
            title:
              "Je fais confiance à mon gouvernement. \n Pourquoi je devrais me soucier de la monnaie fiduciaire?",
            type: "Text",
          },
          GovernementCanPrintMoney: {
            answers: [
              "La création de monnaie supplémentaire cause de l'inflation.",
              "Les gens doivent échanger leur anciens billets de banque à chaque année.",
              "L'apparence des billets change.",
            ],
            feedback: [
              "Exact. Ceci signifie que les biens et les services vont être plus dispendieux à l'avenir.",
              "Non. Les vieux billets sont aussi valides que les nouveaux.",
              "Faux. Bien que le gouvernement peut changer l'apparence des billets, ceci n'a rien à voir avec l'accroissement des réserves monétaires.",
            ],
            question: "Quel impact aura l'impression de monnaie par le gouvernement?",
            text: "Tout le monde devrait s'en soucier! \n\n L'impression de monnaie par le gouvernement, ou plutôt l'accroissement de la réserve monétaire, cause de l'inflation. \n\n L'inflation est un accroissement du prix des biens et des services. En d'autre mots, le prix d'un objet sera plus dispendieux à l'avenir que maintenant. \n\n Alors que signifie l'inflation pour les citoyens? \n\n Au Royaume-Uni, la Livre Sterling a perdu 99.5% de sa valeur depuis sont introduction il y a plus de 300 ans. \n\n Aux Etats-Unis, le dollar a perdu 97% de sa valeur depuis la fin de la Deuxième Guerre Mondiale, il y a environ 100 ans. \n\n Cela signifie qu'un bifteck qui coûtait $0.30 en 1920... était $3 en 1990… et est environ $15 aujourd'hui, en l'an 2020!",
            title:
              "Qui devrait se soucier que le gouvernement peut imprimer de la monnaie sans limite?",
            type: "Text",
          },
          FiatLosesValueOverTime: {
            answers: [
              "Toutes les monnaies fiduciaires ont perdu une quantité massive de valeur.",
              "La valeur reste la même pour toujours.",
              "L'apparence et la forme des billets papier change à tous les 10 ans environ.",
            ],
            feedback: [
              "Exact. Ceci est vrai même pour le USD, qui a perdu 97% de sa valeur dans le dernier 100 ans.",
              "Faux. Essayez de nouveau.",
              "Pas tout à fait. Bien que l'apparence et la forme des billets peuvent changer, ceci n'a aucun impacte sur leur valeur.",
            ],
            question:
              "Qu'arrive-t-il à la valeur des monnaies fiduciaires avec le temps?",
            text: "C'est le cas. \n\n À travers l'histoire, il y a eu 775 monnaies fiduciaires qui ont été créées. La plupart n'existe plus et l'espérance de vie d'une nouvelle monnaie fiduciaire est de seulement 27 ans. \n\n La livre Sterling est la plus vieille monnaie fiduciaire du monde. Elle a perdu plus de 99% de sa valeur depuis 1694. \n\n Il n'y a aucun exemple de monnaie fiduciaire ayant conservé sa valeur. Ceci est l'inflation. \n C'est une forme de vol de votre argent durement gagner!",
            title:
              "Est-ce que cela signifie que toutes les monnaies fiduciaires perdent de la valeur avec le temps?",
            type: "Text",
          },
          OtherIssues: {
            answers: [
              "La monnaie est difficile a transférer autour du monde et elle peut être surveillée.",
              "On a plus besoin de monnaie au 21ième siècle.",
              "L'argent est la source de tous les maux.",
            ],
            feedback: [
              "Exact. On va expliquer ces enjeux avec plus de détails dans un prochain quiz. Continuez de creuser!!",
              "Faux. Vous savez que ce n'est pas la cas.",
              "Bien que plusieurs personnes peuvent y croire, ce n'est pas la réponse que l'on cherche.",
            ],
            question: "Quels autres enjeux sont associés avec les monnaies fiduciaires?",
            text: "Oui, il y a plusieurs autres enjeux avec les monnaies fiduciaires modernes. \n\n Premièrement, il peut être extrêmement difficile de déplacer de la monnaie dans le monde. Souvent, les gouvernements vont mettre des restrictions sur ces déplacements, et parfois, ils vont même confisquer les fonds sans justifications valides. Même quand on réussit a envoyer de l'argent, des frais de transaction énormes rendent le déplacement dispendieux. \n\n Deuxièmement, même aux États-Unis, il y a eu une perte totale de discrétion puisque la majorité du commerce utilise des carte de débit ou de crédit, ainsi que des systèmes en ligne tel que PayPal et Apple Pay.\n\n Avez-vous remarqué que des publicités apparaissent sur vos média sociaux ou dans vos courriels quelques instants après que vous ayez fait une recherche sur un bien ou un service? On appelle ceci “l'économie de la surveillance”, et c'est basé sur la vente de vos données financières.",
            title:
              "D'accord, les monnaies fiduciaires perdent de la valeur avec le temps. Y-a-t-il d'autres problèmes?",
            type: "Text",
          },
        },
      },
      BitcoinWhySpecial: {
        title: "Bitcoin: Pourquoi est-ce spécial? ",
        questions: {
          LimitedSupply: {
            answers: [
              "Oui. On ne pourra jamais créer plus de 21 millions de bitcoins.",
              "Non. Le gouvernement peut créer plus de bitcoin quand il le veut.",
              "Non, le logiciel Bitcoin peut être changé pour permettre la création de plus de bitcoins.",
            ],
            feedback: [
              "Exact. En limitant la quantité qui peut être créée, le Bitcoin a été conçu pour accroître sa valeur avec le temps.",
              "Faux. Le gouvernement n'a aucun contrôle sur le Bitcoin.",
              "Faux. Une des caractéristiques clées du bitcoin est que la réserve est limitée pour toujours.",
            ],
            question: "Est-ce que la réserve de bitcoin est limitée pour toujours?",
            text: "Les gouvernements peuvent imprimer de la monnaie fiduciaire en quantités illimitées. \n\n Contrairement à cela, la réserve maximale de Bitcoin est fixée et elle ne peut jamais dépasser 21 millions de bitcoins. \n\n Un accroissement continuel de la réserve de monnaie fiduciaire cause de l'inflation. Ceci signifie que l'argent que vous avez aujourd'hui aura une valeur moindre dans le futur. \n\n Un exemple simple de ceci: \n Une miche de pain qui valait environ 8 centimes en 1920, valait environ $1.00 en 1990 et aujourd'hui il vaut environ $2.50 ! \n\n La réserve limitée de bitcoin a l'effet inverse, un effet de déflation. \n\n Ceci signifie que le bitcoin que vous détenez aujourd'hui est conçu pour avoir plus de valeur dans le futur, parce qu'il est rare.",
            title: "Caractéristique spéciale #1:\n Une réserve limitée",
            type: "Text",
          },
          Decentralized: {
            answers: [
              "Non.  Le Bitcoin est complètement “décentralisé”.",
              "Oui. Il est contrôlé par les Nations Unis.",
              "Oui. Il est contrôlé par les plus grandes banques du monde.",
            ],
            feedback: [
              "Exact. Il n'y a pas de compagnie, de gouvernement ou d'institution qui contrôle le Bitcoin. N'importe qui peut utiliser le Bitcoin et tout ce qu'il faut c'est un téléphone intelligent et une connection à internet.",
              "Faux. Essayez de nouveau.",
              "Faux, mais vous le saviez déjà!",
            ],
            question: "Est-ce que le Bitcoin est centralisé?",
            text: "La monnaie fiduciaire est contrôlée par les banques et les gouvernements, c'est pour cela que l'on dit qu'elle est centralisée. \n\n Le Bitcoin n'est pas contrôlé par une personne, un gouvernement ou une compagnie, se qui signifie qu'il est décentralisé. \n\n Puisque personne ne contrôle le Bitcoin, cela signifie que personne ne peut vous limiter son accès, pour des raisons de race, de genre, de votre revenu, de votre cote de crédit, votre position géographique ou n'importe quel autre facteur. \n\n N'importe qui, n'importe où dans le monde, peut utiliser le Bitcoin quand il le veut. Tout ce qui est nécessaire est un ordinateur ou un téléphone intelligent et une connection internet!",
            title: "Caractéristique spéciale #2: Décentralisation",
            type: "Text",
          },
          NoCounterfeitMoney: {
            answers: [
              "Non. Il est impossible de faire des contrefaçons de Bitcoin.",
              "Oui. Sauf que la création de faux bitcoin nécessite des ordinateurs très spécialisés.",
              "Oui. Le gouvernement peut imprimer autant de bitcoins qu'il le souhaite.",
            ],
            feedback: [
              "Ceci est la bonne réponse. Dans un prochain quiz, “Honey Badger” vous expliquera pourquoi c'est ainsi!",
              "Faux. Il n'y a aucune façon de copier ou dupliquer la valeur du bitcoin.",
              "Faux. Bien que le gouvernement peut imprimer une quantité illimité de dollars, il ne peut pas imprimer de bitcoin.",
            ],
            question: "Est-ce que l'on peut créer des contrefaçons de Bitcoin?",
            text: "La monnaie papier, les chèques et les transactions par carte de crédit peuvent tous être contrefaits ou frauduleux. \n\n Le logiciel unique sur lequel repose le réseau Bitcoin élimine toute possibilité de duplication, y compris pour faire des contrefaçons. \n\n Les nouveaux bitcoins peuvent seulement être créés s'il y a un consensus parmis les participants du réseau, c'est-à-dire les gens qui exécutent le logiciel Bitcoin sur leurs ordinateurs ou téléphone intelligent. \n\n Ceci rend impossible la création de contrefaçons ou de faux bitcoins.",
            title: "Caractéristique spéciale #3: \nPas de contrefaçon",
            type: "Text",
          },
          HighlyDivisible: {
            answers: [
              "0.00000001 BTC",
              "Un bitcoin entier. Il est impossible d'utiliser moins d'un bitcoin.",
              "0.01 BTC",
            ],
            feedback: [
              "Oui. On peut diviser un bitcoin en 100 000 000 d'unités. Comme mentionné, la plus petite unité d'un bitcoin - 0.00000001 BTC - s'appelle un “sat”",
              "Faux. Un bitcoin est très divisible. On peut facilement utiliser une très petite fraction de bitcoin",
              "Incorrect. Quoique la plus petite unité du dollar US est un centime, un bitcoin est divisible par un facteur de plus de 100x.",
            ],
            question:
              "Quelle est la plus petite fraction de bitcoin qu'une personne peut posséder, ou utiliser?",
            text: "La monnaie fiduciaire peut être seulement dépensée en montants multiples d'un centime - c'est-à-dire deux décimales pour un dollar CAD ($0.01).\n\n D'autre part, un bitcoin peut être divisé en 100 000 000 d'unités. Cela signifie qu'il est possible de dépenser aussi peu que ₿0.00000001. Notez le symbole \"₿\" utilisé, qui est l'équivalent Bitcoin du \"$\". Vous verrez parfois l'utilisation de \"BTC\", au lieu du ₿. \n\nPar contraste, Bitcoin permet de très petits paiements - aussi peu qu'un centime de CAD",
            title: "Caractéristique spéciale #4: \nHautement divisible",
            type: "Text",
          },
          securePartOne: {
            answers: [
              "Oui. Le réseau Bitcoin est extrêmement sécuritaire",
              "Peut-être. Cela dépends du jour de la semaine.",
              "Non. Bitcoin est un logiciel libre et est facilement attaquable.",
            ],
            feedback: [
              "Correct. Dans les faits, le réseau Bitcoin n'a jamais été attaqué. Répondez à la prochaine question pour en apprendre plus!",
              "Bel essai, mais faux. Le réseau Bitcoin est sûr et sécuritaire - 24 heures par jour, 365 jours par année.",
              'Incorrect. Quoique Bitcoin est en effet un "logiciel libre" - c\'est-à-dire disponible au public gratuitement - il est extrêmement sécuritaire.',
            ],
            question: "Est-ce que Bitcoin est un réseau sécuritaire?",
            text: "Le réseau bitcoin vaut bien plus de 100 milliards de dollars aujourd'hui. En conséquence, le réseau doit être très sécurisé pour que l'argent ne soit jamais volé. \n\nBitcoin est la première crypto-monnaie au monde. \n\nLa partie “crypto” du nom vient de la cryptographie. En termes simples, la cryptographie protège les informations grâce à des fonctions mathématiques très complexes. \n\nLa plupart des gens ne réalisent pas que Bitcoin est en fait le réseau informatique le plus sécurisé au monde ! \n\n(Vous avez peut-être entendu parler des “piratages” du Bitcoin que nous démystifierons dans le prochain quiz.)",
            title: "Caractéristique spéciale #5: \nSécurité -- Partie I",
            type: "Text",
          },
          securePartTwo: {
            answers: [
              "Non. Bitcoin n'a jamais été piraté",
              "Oui. Bitcoin se fait piraté régulièrement.",
              "Oui. Bitcoin se fait piraté habituellement la fin de semaine lorsque les banques traditionnelles sont fermées.",
            ],
            feedback: [
              "Correct. Le réseau Bitcoin n'a jamais été compromis. Cependant, il est important d'utiliser des portefeuilles numériques sécuritaires en tout temps pour conserver vos bitcoins.",
              "Faux. Essayez encore.",
              "Très drôle, vous savez que ce n'est pas la bonne réponse.",
            ],
            question: "Est-ce que Bitcoin a déjà été piraté?",
            text: "Pour être direct: le réseau Bitcoin lui-même n'a jamais été piraté, ne serait-ce qu'une seule fois.\n\nAlors, qu'est-ce qui été piraté exactement? \n\nCertains portefeuilles numériques qui n'avaient pas de système sécuritaire adéquat. \n\nDe la même façon qu'un portefeuille physique contient de la monnaie fiduciaire (sous la forme de billets de banque), les portefeuilles numériques contiennent un certain montant en bitcoin.\n\nDans le monde physique, les criminels attaquent des banques et s'enfuient avec des dollars sous forme de billets de banque. Le fait que certaines personnes volents des banques n'a aucun lien avec la stabilité ou la fiabilité du dollar CAD. De la même façon, certains pirates informatiques ont volé des bitcoins dans des portefeuilles numériques non sécuritaires - l'équivalent en ligne d'un vol de banque. \n\nCependant, il est important de savoir que le réseau Bitcoin n'a jamais été piraté ou compromis!",
            title: "Caractéristique spéciale #5: \nSécurité -- Partie II",
            type: "Text",
          },
        },
      },
    },
    finishText:
      "C'est tout pour l'instant, nous vous laisserons savoir quand il y aura plus à découvrir.",
    getRewardNow: "Répondez au quiz",
    keepDigging: "Continuez à chercher!",
    phoneNumberNeeded: "Numéro de téléphone requis",
    quizComplete: "Quiz complété et {{amount}} sats gagnés",
    reviewQuiz: "Révisez le quiz",
    satAccumulated: "Sats accumulés",
    satsEarned: "{formattedNumber|sats} gagnés",
    sectionsCompleted: "Vous avez terminé",
    title: "Gain",
    unlockQuestion: "Pour débloquer, répondez à la question:",
    youEarned: "Vous avez gagné",
  },
  GetStartedScreen: {
    getStarted: "Commencez",
    headline: "Portefeuille développé par Galoy",
  },
  MapScreen: {
    locationPermissionMessage:
      "Entrez votre localisation, vous pourrez ainsi être inscrit sur la carte",
    locationPermissionNegative: "Annuler",
    locationPermissionNeutral: "Demandez moi plus tard",
    locationPermissionPositive: "OK",
    locationPermissionTitle: "Localisez votre position sur la carte",
    payBusiness: "payez l'entreprise",
    title: "Carte",
  },
  ModalClipboard: {
    dismiss: "Rejeter",
    open: "Ouvrir",
    pendingBitcoin: "Vous avez une adresse Bitcoin dans votre presse-papier",
    pendingInvoice: "Vous avez une Facture Lightning dans votre presse-papier",
  },
  MoveMoneyScreen: {
    receive: "Recevoir",
    send: "Envoyer",
    title: "Accueil",
    updateAvailable:
      "Une mise-à-jour est disponible.\nAppuyez sur “tab” pour lancer la mise-à-jour maintenant",
    useLightning: "Nous utilisons le Réseau Lightning.",
  },
  Overlay: {
    accounts: "Commencez par obtenir\nquelques récompenses!",
    rewards: {
      download:
        "Nous vous avons donné 1 sat comme cadeau\npour télécharger l'application.",
      getMore: "Apprenez à propos de Bitcoin et gagnez plus!",
    },
  },
  PinScreen: {
    attemptsRemaining: "NIP incorrect. {attemptsRemaining} tentatives restantes.",
    oneAttemptRemaining: "NIP incorrect. 1 tentative restante.",
    setPin: "Définisser votre code NIP",
    setPinFailedMatch: "Les NIP ne correspondent pas - Corrigez votre code NIP",
    storePinFailed: "Impossible d'enregistrer votre NIP.",
    tooManyAttempts: "Trop de tentatives échouées. Déconnexion...",
    verifyPin: "Vérifier votre code NIP",
  },
  PriceScreen: {
    oneDay: "1J",
    oneMonth: "1M",
    oneWeek: "1S",
    oneYear: "1A",
    fiveYears: "5Y",
    prevMonths: "Mois précédents",
    satPrice: "Prix pour 100,000 sats: ",
    thisMonth: "Mois courant",
    thisWeek: "Semaine courante",
    thisYear: "Année courante",
    lastFiveYears: "cinq dernières années",
    today: "Aujourd'hui",
    yesterday: "Hier",
  },
  PrimaryScreen: {
    title: "Accueil",
  },
  ReceiveBitcoinScreen: {
    activateNotifications:
      "Voulez-vous activer les notifications pour être notifié lors de la réception de nouveaux paiements?",
    copyClipboard: "La facture a été copiée dans le presse-papier",
    copyClipboardBitcoin: "L'adresse Bitcoin a été copiée dans le presse-papier",
    invoicePaid: "Cette facture a été payée",
    setNote: "Ajouter une note",
    tapQrCodeCopy: "Appuyer sur le code QR pour copier",
    title: "Recever des Bitcoins",
    usdTitle: "Recever des USD",
    error:
      "Impossible de générer une facture. SVP contactez le support technique si le problème persiste.",
    copyInvoice: "Copier la facture",
    shareInvoice: "Partager la facture",
    addAmount: "Demander un montant spécifique",
    // TODO: @nicolasburtey please sanity check these translations
    expired: "Expirée",
    expiresIn: "Expire dans",
    updateInvoice: "Mettre à jour la facture",
    flexibleAmountInvoice: "Facture flexible",
    copyAddress: "Copier l'adresse",
    shareAddress: "Partager l'adresse",
    generatingInvoice: "Génération de la facture",
    useABitcoinOnchainAddress: "Utiliser une adresse Bitcoin onchain",
    useALightningInvoice: "Utiliser une facture Lightning",
    setANote: "Ajouter une note",
    invoiceAmount: "Montant de la facture",
  },
  ScanningQRCodeScreen: {
    invalidContent:
      "Nous avons trouvé:\n\n{{found}}\n\nCeci n'est pas une adresse valide pour une facture Lightning.",
    invalidTitle: "Code QR invalide",
    noQrCode: "Nous n'avons pas trouvé de code QR dans l'image",
    title: "Scanner le code QR",
    invalidContentLnurl: "Nous avons trouvé:\n\n{{found}}\n\n n'est pas supporté",
  },
  SecurityScreen: {
    biometricDescription: "Débloquer la reconnaissance faciale ou digitale.",
    biometricSubtitle: "Autoriser l'authentification biométrique",
    biometricTitle: "Biométrie",
    biometryNotAvailable: "Le senseur biométrique n'est pas disponible.",
    biometryNotEnrolled:
      "SVP enregistrez au moins un senseur biométrique pour utiliser l'authentification biométrique.",
    hideBalanceDescription:
      "Masquer votre solde sur l'écran d'accueil par défaut pour dissimuler vos informations à quiconque regarderait votre écran.",
    hideBalanceSubtitle: "Masquer le solde",
    hideBalanceTitle: "Solde",
    pinDescription:
      "Le NIP est utilisé comme méthode de sauvegarde pour l'authentification biométrique.",
    pinSubtitle: "Activer le code NIP",
    pinTitle: "Code NIP",
    setPin: "Définir le NIP",
  },
  SendBitcoinConfirmationScreen: {
    amountLabel: "Montant:",
    confirmPayment: "Confirmer le paiement",
    confirmPaymentQuestion: "Voulez-vous confirmer le paiement?",
    destinationLabel: "À:",
    feeLabel: "Frais",
    memoLabel: "Note:",
    paymentFinal: "Les paiements sont définitifs.",
    stalePrice:
      "Votre prix pour un bitcoin est périmé et a été mis-à-jour il y a {{timePeriod}}. Veuillez redémarrer l'application avant d'effectuer un paiement.",
    title: "Confirmer le paiement",
    totalLabel: "Solde:",
    totalExceed: "Le total excède votre solde de {{balance}}",
    // TODO: @nicolasburtey please sanity check this translation
    maxFeeSelected:
      "Il s'agit des frais maximum qui vous seront facturés pour cette transaction. Il peut finir par être inférieur une fois le paiement effectué.",
    feeError: "Échec du calcul des frais",
  },
  // TODO translate the below section
  SendBitcoinDestinationScreen: {
    usernameNowAddress: "{bankName} usernames are now {bankName} addresses.",
    usernameNowAddressInfo: "When you enter a {bankName} username, we will add “@{lnDomain}” to it (e.g maria@{lnDomain}) to make it an address. Your username is now a {bankName} address too.\n\nGo to your {bankName} address page from your Settings to learn how to use it or to share it to receive payments.",
    enterValidDestination: "Please enter a valid destination",
    destinationOptions: "You can send to a {bankName} address, LN address, LN invoice, or BTC address.",
    expiredInvoice: "This invoice has expired. Please generate a new invoice.",
    wrongNetwork: "This invoice is for a different network. Please generate a new invoice.",
    invalidAmount: "This contains an invalid amount. Please regenerate with a valid amount.",
    usernameDoesNotExist: "{lnAddress} doesn't seem to be a {bankName} address that exists.",
    usernameDoesNotExistAdvice: "Either make sure the spelling is right or ask the recipient for an LN invoice or BTC address instead.",
    selfPaymentError: "{lnAddress} is your {bankName} address.",
    selfPaymentAdvice: "If you want to send money to another account that you own, you can use an invoice, LN or BTC address instead.",
    lnAddressError: "We can't reach this Lightning address. If you are sure it exists, you can try again later.",
    lnAddressAdvice: "Either make sure the spelling is right or ask the recipient for an invoice or BTC address instead.",
    unknownLightning: "We can't parse this Lightning address. Please try again.",
    unknownOnchain: "We can't parse this Bitcoin address. Please try again.",
    newBankAddressUsername: "{lnAddress} exists as a {bankName} address, but you've never sent money to it.",
    confirmModal: {
      title: "You've never sent money to \"{lnAddress}\" before.",
      body:  "Please make sure the recipient gave you a {bankName} address, **not a username from another wallet**. Otherwise, the money will go to a {bankName} Account that has the “{lnAddress}” address.\n\nCheck the spelling of the first part of the address as well. e.g. jackie and jack1e are 2 different addresses",
      warning: "If the {bankName} address is entered incorrectly, {bankName} can't undo the transaction.",
      checkBox: "{lnAddress} is the right address.",
      confirmButton: "I'm 100% sure",
    }
  },
  SendBitcoinScreen: {
    amount: "Montant",
    amountExceed: "Le montant excède votre solde de {balance}",
    amountIsRequired: "Un montant est requis",
    cost: "Coût",
    destination: "Destination",
    destinationIsRequired: "Une destination est requise",
    fee: "frais de réseau",
    feeCalculationUnsuccessful: "Calcul infructueux ⚠️",
    input: "nom d'usager, adresse Lightning ou BTC",
    invalidUsername: "nom d'usager invalide",
    noAmount:
      "Cette facture ne contient pas de montant, vous devez indiquer manuellement quel montant vous désirez envoyer",
    notConfirmed:
      "Le paiement a été envoyé\nmais n'est pas encore confirmé\n\nVous pouvez vérifier l'état du paiement dans Transactions",
    note: "note optionnelle",
    success: "Le paiement a été envoyé avec succès",
    title: "Envoyer des bitcoins",
    failedToFetchLnurlInvoice: "Échec de la récupération de la facture lnurl",
  },
  SettingsScreen: {
    activated: "Activé",
    tapLogIn: "Appuyer pour vous connecter",
    tapUserName: "Appuyer pour définir le nom d'usager",
    title: "Configurations",
    csvTransactionsError:
      "Impossible d'exporter les transactions vers un fichier CSV. Une erreur s'est produite. Si le problème persiste, veuillez contacter le support technique.",
    lnurlNoUsername:
      "Pour générer une adresse LNURL, vous devez d'abord définir un nom d'usager. Voulez-vous définir un nom d'usager maintenant?",
    copyClipboardLnurl: "L'adresse a été copiée dans le presse-papiers",
    deleteAccount: "Supprimer le compte",
  },
  Languages: {
    "DEFAULT": "Default (OS)",
    "en": "English",
    "en-US": "English",
    "es": "Spanish",
    "es-SV": "Spanish",
    "pt-BR": "Portuguese",
    "fr-CA": "Français Canada",
  },
  // TODO translate StablesatsModal
  StablesatsModal: {
    header: "With Stablesats, you now have a USD account added to your wallet!",
    body: "You can use it to send and receive Bitcoin, and instantly transfer value between your BTC and USD account. Value in the USD account will not fluctuate with the price of Bitcoin. This feature is not compatible with the traditional banking system.",
    termsAndConditions: "Read the Terms & Conditions.",
    learnMore: "Learn more about Stablesats"
  },
  SplashScreen: {
    update:
      "Votre application n'est plus à jour. Une mise à jour est nécessaire avant que l'application puisse être utilisée.\n\nCela peut être fait depuis le PlayStore pour Android et Testflight pour iOS",
  },
  TransactionDetailScreen: {
    detail: "Détails de la transaction",
    paid: "Payé à/de",
    received: "Vous avez reçu",
    spent: "Vous avez dépensé",
  },
  TransactionScreen: {
    noTransaction: "Aucune transaction à afficher",
    title: "Transactions",
    transactionHistoryTitle: "Historique des transactions",
  },
  TransferScreen: {
    title: "Transfert",
    percentageToConvert: "% à convertir",
  },
  UsernameScreen: {
    "3CharactersMinimum": "Au moins trois caractères sont nécessaires",
    "50CharactersMaximum": "Le nom d'usager ne peut excéder 50 caractères",
    "available": "✅  {username} est disponible",
    "confirmSubtext": "Le nom d'usager est permanent et ne peut être changé plus tard",
    "confirmTitle": "Définir {username} comme nom d'usager?",
    "forbiddenStart":
      "Ne peut débuter par lnbc1, bc1, 1, ou 3 et ne peut pas être une adresse Bitcoin ou une facture Lightning",
    "letterAndNumber":
      "Lettre minuscule uniquement, chiffre et sousligné (_) sont acceptés",
    "emailAddress": "Le nom d'usager ne peut pas être un courriel",
    "notAvailable": "❌  {username} n'est pas disponible",
    "success": "{username} est maintenant votre nom d'usager!",
    "usernameToUse": "Quel nom d'usager désirez-vous utiliser?",
  },
  WelcomeFirstScreen: {
    bank: "Bitcoin a été conçu pour vous permettre de conserver, d'envoyer ou de recevoir de l'argent, sans dépendre d'une banque ou d'une carte de crédit.",
    before:
      "Avant Bitcoin, les gens dépendaient des banques ou des fournisseurs de cartes de crédit pour dépenser, recevoir et envoyer de l'argent.",
    care: "Pourquoi devrais-je m'en soucier?",
    learn: "Je ne veux pas te déranger, mais il y a beaucoup plus à apprendre...",
    learnToEarn: "Apprendre à gagner",
  },
  WelcomePhoneInputScreen: {
    header:
      "Entrez votre numéro de téléphone et nous vous enverrons un code d'accès par texto.",
    headerVerify: "Vérifier que vous êtes humain",
    placeholder: "Numéro de téléphone",
    verify: "Cliquer pour vérifier",
    continue: "Continuer",
  },
  WelcomePhoneValidationScreen: {
    errorLoggingIn: "Erreur de connexion. Avez-vous utilisé le bon code?",
    header:
      "Pour confirmer votre numéro de téléphone, entrez le code que nous venons de vous envoyer au {phoneNumber}",
    need6Digits: "Le code doit avoir 6 chiffres",
    placeholder: "Code de 6 chiffres",
    sendAgain: "Envoyer de nouveau",
  },
  common: {
    activateWallet: "Activer le portefeuille",
    amountRequired: "Un montant est requis",
    back: "Retour",
    bank: "Retour",
    bankAccount: "Compte comptant",
    bitcoin: "Bitcoin",
    bitcoinPrice: "Prix Bitcoin",
    // TO DO: Translate
    bankAdvice: "{bankName} Advice",
    // TO DO: Translate
    bankInfo: "{bankName} Info",
    cancel: "Annuler",
    close: "Fermer",
    confirm: "Confirmer",
    csvExport: "Exporter les transactions sous format CSV",
    date: "Date",
    description: "Description",
    domain: "Domaine",
    email: "Courriel",
    error: "Erreur",
    fatal: "Fatal",
    fee: "frais",
    Fee: "Frais",
    fees: "Frais",
    feeSats: "Frais (sats)",
    feesUsd: "Frais (CAD)",
    firstName: "Prénom",
    from: "De",
    hour: "heure",
    hours: "heures",
    invoice: "Facture",
    language: "Langue",
    languagePreference: "Langue de préférence",
    lastName: "Nom",
    later: "Plus tard",
    loggedOut: "Vous avez été déconnecté.",
    logout: "Déconnexion",
    minutes: "minutes",
    needWallet: "Validez votre téléphone pour ouvrir votre portefeuille",
    next: "Suivant",
    No: "Non",
    note: "Note",
    notification: "Notification",
    ok: "OK",
    openWallet: "Ouvrir Portefeuille",
    phoneNumber: "Numéro de téléphone",
    reauth: "Session expirée. SVP connectez-vous à nouveau.",
    restart: "Recommencer",
    sats: "sats",
    search: "Recherche",
    security: "Sécurité",
    send: "Envoyer",
    setAnAmount: "Fixer un montant",
    share: "Partager",
    shareBitcoin: "Partager l'adresse Bitcoin",
    shareLightning: "Partager la facture Lightning",
    soon: "bientôt disponible!",
    success: "Succès!",
    to: "À",
    total: "Total",
    transactions: "Transactions",
    transactionsError: "Erreur de chargement des transactions",
    tryAgain: "Essayer à nouveau",
    type: "Type",
    username: "Nom d'usager",
    usernameRequired: "Un nom d'usager est requis",
    yes: "Oui",
    pending: "en attendant",
    // TODO: @nicolasburtey can you please review the common transactions below this comment
    account: "Compte",
    backHome: "Retour à l'accueil",
    btcAccount: "Compte Bitcoin",
    usdAccount: "Compte USD",
    convert: "Convertir",
    rate: "Taux",
    viewTransaction: "Voir la transaction",
  },
  errors: {
    generic: "Une erreur est survenue.\nSVP essayer plus tard.",
    invalidEmail: "Courriel invalide",
    invalidPhoneNumber: "n'est pas un numéro de téléphone valid",
    tooManyRequestsPhoneCode:
      "Trop de requêtes. Veuillez patienter avant de demander un autre texto.",
    network: {
      server: "Erreur de serveur. SVP essayer plus tard",
      request:
        "Problème avec une requête.\nContactez le support technique si le problème persiste",
      connection: "Problème de connexion.\nVérifiez votre connexion Internet",
    },
    unexpectedError: "Une erreur inattendue s'est produite",
    restartApp: "Veuillez redémarrer l'application.",
    problemPersists: "Si le problème persiste, contactez le support technique.",
    fatalError:
      "Désolé, nous semblons avoir des problèmes pour charger les données de l'application. Si le problème persiste, contactez le support technique.",
    showError: "Afficher l'erreur",
  },
  notifications: {
    payment: {
      body: "Vous avez reçu ${{value}} sats",
      title: "Paiement reçu",
    },
  },
  tippingLink: {
    title: "Vous souhaitez recevoir des pourboires? Partagez votre lien de pourboires!",
    copied: "{{data}} sauvegardé dans votre presse-papier",
  },
  support: {
    contactUs: "Besoin d'aide? Contactez-nous.",
    whatsapp: "WhatsApp",
    email: "E-mail",
    phone: "Téléphoner",
    defaultEmailSubject: "Bitcoin Beach Wallet - Soutien",
    defaultSupportMessage: "Salut! J'ai besoin d'aide avec Bitcoin Forest Wallet",
    deleteAccount: "Bonjour. Veuillez supprimer mon compte.",
    deleteAccountEmailSubject: "Demande de suppression de compte: {phoneNumber}"
  },
  lnurl: {
    overLimit: "Vous ne pouvez pas envoyer plus que le montant maximum",
    underLimit: "Vous ne pouvez pas envoyer moins que le montant minimum",
    commentRequired: "Commentaires requis",
    viewPrintable: "Voir la version imprimable",
  },
  // TODO: Translate the below screens
  ConversionDetailsScreen: {
    title: "",
    percentageToConvert: "",
  },
  ConversionConfirmationScreen: {
    title: "",
    youreConverting: "",
    receivingAccount: "",
  },
  ConversionSuccessScreen: {
    title: "",
    message: "",
  },
}

export default frCA
