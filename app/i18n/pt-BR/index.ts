// prettier-ignore

import { Translation } from "../i18n-types"

/* eslint-disable no-template-curly-in-string */
/* eslint-disable max-lines */
const ptBR: Translation = {
  AuthenticationScreen: {
    authenticationDescription: "Autenticar para continuar",
    setUp: "Configurar autenticação biométrica",
    setUpAuthenticationDescription: "Usar biometria para autenticar",
    skip: "Pular",
    unlock: "Desbloquear",
    usePin: "Usar PIN",
  },
  BalanceHeader: {
    currentBalance: "Saldo atual",
    hiddenBalanceToolTip: "Toque para revelar seu saldo",
  },
  ContactsScreen: {
    noContactsTitle: "Nenhum contato encontrado",
    noContactsYet:
      "Envie ou receba um pagamento usando um nome de usuário e os contatos serão adicionados automaticamente aqui",
    noMatchingContacts: "Nenhum contato correspondente à sua pesquisa foi encontrado.",
    title: "Contatos",
  },
  ContactDetailsScreen: {
    title: "Transações com {username}",
  },
  EarnScreen: {
    earnSats: "Ganhe {formattedNumber}",
    earns: [
      {
        content: [
          {
            answers: [
              "Dinheiro digital",
              "Um videogame",
              "Um novo personagem de desenho animado",
            ],
            feedback: [
              "Correto. Você acabou de ganhar 1 “sat”!",
              "Incorreto, tente novamente.",
              "Não. Pelo menos não um que conhecemos!",
            ],
            id: "whatIsBitcoin",
            question: "Então, o que exatamente é Bitcoin?",
            text: "Bitcoin é dinheiro digital. \n\nEle pode ser transferido instantaneamente e com segurança entre duas pessoas no mundo, sem a necessidade de um banco ou qualquer outra empresa financeira no meio.",
            title: "Então, o que exatamente é Bitcoin?",
            type: "Text",
          },
          {
            answers: [
              "A menor unidade de Bitcoin",
              "Um pequeno satélite",
              "O ET Bilu 🐱🚀",
            ],
            feedback: [
              "Correto. Você acabou de ganhar mais dois sats!!",
              "Talvez… mas essa não é a resposta correta neste contexto 🙂",
              "Ummm... não exatamente!",
            ],
            id: "sat",
            question: 'Acabei de ganhar um “Sat". O que é isso?',
            text: "Um “Sat” é a menor unidade de um bitcoin. \n\nTodos sabemos que um dólar americano pode ser dividido em 100 centavos. Da mesma forma, um Bitcoin pode ser dividido em 100.000.000 sats. \n\nNa verdade , você não precisa possuir um bitcoin inteiro para usá-lo. Você pode usar bitcoin se tiver 20 sats, 3.000 sats — ou 100.000.000 sats (que agora você sabe que é igual a um bitcoin).",
            title: 'Acabei de ganhar um “Sat". O que é isso?',
            type: "Text",
          },
          {
            answers: ["Na Internet", "Na lua", "Em uma conta bancária"],
            feedback: [
              "Correto. Você acabou de ganhar mais 5 sats.",
              "Incorreto. Bem... pelo menos ainda não ;)",
              "Errado. Por favor, tente novamente.",
            ],
            id: "whereBitcoinExist",
            question: "Onde existem os bitcoins?",
            text: "Bitcoin é uma nova forma de dinheiro. Ele pode ser usado por qualquer pessoa, a qualquer hora -- em qualquer lugar do mundo. \n\nEle não está vinculado a um governo ou região específica (como dólares americanos). Há também sem notas de papel, moedas de metal ou cartões de plástico. \n\nTudo é 100% digital. Bitcoin é uma rede de computadores rodando na internet. \n\nSeu bitcoin é facilmente gerenciado com software em seu smartphone ou computador!",
            title: "Onde os bitcoins existem?",
            type: "Text",
          },
          {
            answers: [
              "Uma comunidade voluntária de usuários em todo o mundo",
              "Senhor Burns de Os Simpsons",
              "O governo da França",
            ],
            feedback: [
              "Isso mesmo. Bitcoin é possível graças a pessoas de todo o mundo executando software bitcoin em seus computadores e smartphones.",
              "Um pensamento divertido - mas não correto!",
              "Errado. Não há empresa nem governo que controle o Bitcoin.",
            ],
            id: "whoControlsBitcoin",
            question: "Quem controla o Bitcoin?",
            text: "Bitcoin não é controlado por qualquer pessoa, empresa ou governo. \n\nEle é administrado pela comunidade de usuários -- pessoas e empresas em todo o mundo -- executando voluntariamente software bitcoin em seus computadores e smartphones.",
            title: "Quem controla o Bitcoin?",
            type: "Text",
          },
          {
            answers: [
              "Não - é impossível copiar ou duplicar o valor do bitcoin",
              "Sim, você pode copiar bitcoins tão facilmente quanto copiar uma foto digital",
              "Sim, mas copiar bitcoin requer computadores muito especializados",
            ],
            feedback: [
              "Isso é absolutamente correto!",
              "Você sabe que não é verdade. Tente novamente.",
              "Incorreto. Não há como alguém copiar ou criar uma duplicata do bitcoin.",
            ],
            id: "copyBitcoin",
            question:
              "Se o Bitcoin é dinheiro digital, alguém não pode simplesmente copiá-lo - e criar dinheiro grátis?",
            text: "O valor de um bitcoin nunca pode ser copiado. Esta é a razão pela qual o Bitcoin é uma nova invenção tão poderosa!!\n\nA maioria dos arquivos digitais — como uma foto do iPhone, uma música MP3 ou um arquivo da Microsoft Documento do Word — pode ser facilmente duplicado e compartilhado. \n\nO software Bitcoin impede de forma exclusiva a duplicação — ou “gasto duplo” — de dinheiro digital. Compartilharemos exatamente como isso funciona mais tarde!",
            title:
              "Se o Bitcoin é dinheiro digital, alguém não pode simplesmente copiá-lo - e criar dinheiro grátis?",
            type: "Text",
          },
        ],
        meta: {
          id: "bitcoinWhatIsIt",
          title: "Bitcoin: O que é isso?",
        },
      },
      {
        content: [
          {
            answers: [
              "Porque as pessoas confiam que outras pessoas irão valorizar o dinheiro da mesma forma",
              "Porque sua mãe te disse isso",
              "Porque uma nota de dólar vale seu peso em ouro",
            ],
            feedback: [
              "Correto. Isso é o que permite que o dinheiro funcione!",
              "Ela pode muito bem ter. Mas essa não é a resposta correta aqui!",
              "Não. No passado, você podia trocar dólares americanos por ouro. Mas isso não é mais o caso.",
            ],
            id: "moneySocialAggrement",
            question: "Por que o dinheiro tem valor?",
            text: "Dinheiro exige que as pessoas confiem. \n\nAs pessoas confiam nas notas de dólar em seu bolso. Elas confiam nos dígitos de sua conta bancária on-line. Elas confiam que o saldo de um vale-presente da loja será resgatável. \n\nTer dinheiro permite às pessoas trocá-lo imediatamente por um bem ou serviço.",
            title: "Dinheiro é um acordo social.",
            type: "Text",
          },
          {
            answers: [
              "Coincidência de desejos",
              "Coincidência do dia e da noite",
              "Coincidência da lua bloqueando o sol",
            ],
            feedback: [
              "Isso mesmo. O dinheiro permite que você compre algo facilmente, sem pechinchar sobre a forma de pagamento",
              "Não bobo, você sabe que não é a resposta.",
              "Não exatamente. Chamamos isso de eclipse solar 🌚",
            ],
            id: "coincidenceOfWants",
            question: "Qual coincidência o dinheiro resolve?",
            text: "Séculos atrás, antes que as pessoas tivessem dinheiro, elas trocavam -- ou regateavam sobre como trocar um item único por outro item ou serviço. \n\nDigamos que você queira fazer uma refeição no local restaurante e ofereceu uma vassoura ao proprietário. O proprietário pode dizer “não”, mas eu aceitarei três chapéus em vez disso, se você os tiver. \n\nVocê pode imaginar como seria difícil e ineficiente uma “economia de troca” ! \n\nPor outro lado, com dinheiro, você pode simplesmente apresentar uma nota de US$ 20. E você sabe que o dono do restaurante a aceitará prontamente.",
            title: "Dinheiro resolve a “coincidência de desejos”... O que é isso??",
            type: "Text",
          },
          {
            answers: [
              "Pedras, conchas e ouro",
              "Casas de jogo de tabuleiro Monopoly de plástico",
              "Moedas feitas de chocolate",
            ],
            feedback: [
              "Correto. Itens raros e difíceis de copiar costumam ser usados como dinheiro.",
              "Errado. Eles podem ter valor ao jogar um jogo - mas não na palavra real!",
              "Não. Eles podem ser saborosos. Mas não são úteis como dinheiro.",
            ],
            id: "moneyEvolution",
            question:
              "Quais são alguns itens que foram historicamente usados como unidade monetária?",
            text: "Milhares de anos atrás, a sociedade na Micronésia usava pedras muito grandes e escassas como uma forma de moeda acordada. \n\nA partir de 1500, raras conchas de cauris (encontradas no oceano) tornaram-se comumente usadas em muitas nações como uma forma de dinheiro.\n\nE por milênios, o ouro tem sido usado como uma forma de dinheiro para países ao redor do mundo, incluindo os Estados Unidos (até 1971).",
            title: "O dinheiro evoluiu, desde quase o início dos tempos.",
            type: "Text",
          },
          {
            answers: [
              "Porque eles têm características-chave - como serem duráveis, uniformes e divisíveis.",
              "Porque eles são bonitos e brilhantes.",
              "Porque cabem no seu bolso",
            ],
            feedback: [
              "Correto. Mais características importantes incluem ser escasso e portátil.",
              "Incorreto. Isso pode ser verdade, mas por si só não são grandes características do dinheiro.",
              "Não exatamente. Embora esses itens fossem certamente portáteis, isso por si só não era a razão para ser usado como dinheiro.",
            ],
            id: "whyStonesShellGold",
            question:
              "Por que pedras, conchas e ouro foram usados como unidades de dinheiro?",
            text: "Bem, todos esses itens tinham algumas, mas não todas, as características de um bom dinheiro. \n\nEntão, quais características fazem um “bom” dinheiro? \nPouco: não é abundante, nem fácil de reproduzir ou cópia \nAceito: relativamente fácil para as pessoas verificarem sua autenticidade \nDurável: fácil de manter, e não perece ou desmorona\nUniforme: facilmente intercambiável com outro item da mesma forma\nPortátil: fácil de transportar\nDivisível: pode ser dividido e dividido em pedaços menores",
            title:
              "Por que pedras, conchas e ouro eram comumente usados como dinheiro no passado?",
            type: "Text",
          },
          {
            answers: [
              "O dinheiro permite que as pessoas comprem bens e serviços hoje - e amanhã.",
              "O dinheiro permite que você vá para a lua.",
              "O dinheiro é a solução para todos os problemas.",
            ],
            feedback: [
              "Isso está certo!",
              "Incorreto. Embora isso possa mudar no futuro ;)",
              "Não exatamente. Embora algumas pessoas possam acreditar nisso, esta resposta não aborda o objetivo principal do dinheiro.",
            ],
            id: "moneyIsImportant",
            question: "Qual é a principal razão pela qual o dinheiro é importante?",
            text: "Todo mundo sabe que o dinheiro é importante.\n\nA maioria das pessoas troca seu tempo e energia -- na forma de trabalho -- para obter dinheiro. As pessoas fazem isso para poder comprar bens e serviços hoje -- e no futuro.",
            title: "O dinheiro é importante para os indivíduos",
            type: "Text",
          },
          {
            answers: [
              "O Banco Central dos EUA (Federal Reserve)",
              "Senhor Burns de Os Simpsons",
              "Um cara com uma impressora no porão",
            ],
            feedback: [
              "Correto. O governo dos EUA pode imprimir quanto dinheiro quiser a qualquer momento.",
              "Incorreto. Embora pareça que ele sempre teve muito dinheiro.",
              "Não. Embora algumas pessoas criem notas de dólar falsas, isso definitivamente não é legal!",
            ],
            id: "moneyImportantGovernement",
            question:
              "Quem pode imprimir legalmente dólares americanos, sempre que desejar?",
            text: "As economias modernas são organizadas por estados-nação: EUA, Japão, Suíça, Brasil, Noruega, China etc. \n\nAssim, na maioria das nações, o governo detém o poder de emitir e controlar dinheiro . \n\nNos Estados Unidos, o Banco Central (conhecido como Federal Reserve, ou “Fed”) pode imprimir ou criar mais dólares americanos a qualquer momento. \n\nO “Fed” não precisa de permissão do Presidente, nem do Congresso, e certamente não de cidadãos dos EUA. \n\nImagine se você pudesse imprimir dólares americanos sempre que quisesse -- o que você faria??",
            title: "O dinheiro também é importante para os governos",
            type: "Text",
          },
        ],
        meta: {
          id: "WhatIsMoney",
          title: "O que é dinheiro? ",
        },
      },
      {
        content: [
          {
            answers: [
              "É criado por ordem do governo nacional em um determinado país.",
              "Pelo gerente da agência bancária local.",
              "O Homem do Dinheiro Monoploy.",
            ],
            feedback: [
              "Correto. O banco central de um governo cria moeda fiduciária.",
              "Incorreto. Um banco local só pode administrar dinheiro que foi criado anteriormente pelo governo.",
              "Não. Tente novamente!",
            ],
            id: "WhatIsFiat",
            question:
              "Quem cria moeda fiduciária, como dólares americanos ou francos suíços?",
            text: "Todas as moedas nacionais em circulação hoje são chamadas de moeda fiduciária. Isso inclui dólares americanos, ienes japoneses, francos suíços e assim por diante. \n\nA palavra fiduciária é latina para por “decreto” -- que significa “por ordem oficial”. \n\nIsso significa que todo dinheiro fiduciário, incluindo o dólar americano, é simplesmente criado por ordem do governo nacional.",
            title: "Moeda fiduciária: o que é isso?",
            type: "Text",
          },
          {
            answers: [
              "Toda moeda fiduciária acaba sendo abusada pelas autoridades governamentais.",
              "Os bancos locais podem não ter espaço suficiente no cofre para guardar todas as notas de dólar.",
              "Pode não haver árvores suficientes para fazer papel para todas as notas de dólar adicionais.",
            ],
            feedback: [
              "Correto. Ao longo da história, os governos foram incapazes de resistir à capacidade de imprimir dinheiro, pois eles efetivamente não têm obrigação de devolver esse dinheiro.",
              "Não, isso certamente não é o caso.",
              "Errado. Por favor, tente novamente.",
            ],
            id: "whyCareAboutFiatMoney",
            question:
              "Por que eu deveria me preocupar com o governo controlando a moeda fiduciária?",
            text: "Conforme compartilhado em um teste anterior, o Banco Central dos EUA é o Federal Reserve, ou o “Fed”.\n\nO Fed pode imprimir mais dólares a qualquer momento -- e não precisa de permissão do presidente, nem do Congresso, e certamente não de cidadãos dos EUA. \n\nTer o controle do dinheiro pode ser muito tentador para as autoridades abusarem - e muitas vezes o tempo leva a uma inflação maciça, confisco arbitrário e corrupção. \n\nNa verdade, Alan Greenspan, o famoso ex-presidente do Fed, disse que os EUA “podem pagar qualquer dívida que tenham, porque sempre podemos imprimir mais para fazer isso”.",
            title:
              "Confio no meu governo. \nPor que devo me preocupar com dinheiro fiduciário?",
            type: "Text",
          },
          {
            answers: [
              "A impressão de dinheiro adicional leva à inflação.",
              "As pessoas devem trocar notas de dólar antigas no banco todos os anos.",
              "A aparência da nota de dólar muda.",
            ],
            feedback: [
              "Correto. Isso significa que bens e serviços custarão mais no futuro.",
              "Não. Notas de dólar mais antigas são tão válidas quanto as mais novas.",
              "Incorreto. Embora o governo possa emitir novos olhares para as contas, isso não tem nada a ver com o aumento da oferta de dinheiro.",
            ],
            id: "GovernementCanPrintMoney",
            question: "O que significa quando o governo imprime dinheiro?",
            text: "Bem, todos deveriam se importar! \n\nA prática do governo imprimir dinheiro -- ou aumentar a oferta de dólares -- leva à inflação.\n\nA inflação é um aumento no preço de bens e serviços. Em em outras palavras, o preço de algo no futuro será mais caro do que hoje.\n\nEntão, o que a inflação significa para os cidadãos?\n\nNo Reino Unido, a libra esterlina perdeu 99,5% de seu valor desde que foi introduzida em 300 anos atrás. \n\nNos Estados Unidos, o dólar perdeu 97% de seu valor desde o fim da Primeira Guerra Mundial, cerca de 100 anos atrás. \n\nIsso significa que um bife que custava US$ 0,30 em 1920... custava US$ 3 em 1990… e cerca de US$ 15 hoje, no ano de 2020!",
            title:
              "Quem deve se importar que o governo possa imprimir dinheiro ilimitado?",
            type: "Text",
          },
          {
            answers: [
              "Toda moeda fiduciária que já existiu perdeu uma enorme quantidade de valor.",
              "O valor permanece o mesmo para sempre.",
              "A aparência e o design das contas de papel são atualizados a cada 10 anos ou mais.",
            ],
            feedback: [
              "Correto. Isso vale até para o dólar, que perdeu 97% de seu valor nos últimos 100 anos.",
              "Incorreto. Tente novamente.",
              "Não exatamente. Embora o design das notas de papel possa mudar, isso não tem nada a ver com seu valor.",
            ],
            id: "FiatLosesValueOverTime",
            question:
              "O que acontece com o valor de todas as moedas fiduciárias ao longo do tempo?",
            text: "Correto. \n\nNa história do mundo, foram criadas 775 moedas fiduciárias. A maioria não existe mais, e a vida média de qualquer moeda fiduciária é de apenas 27 anos.\n\nOs britânicos A libra é a moeda fiduciária mais antiga. Ela perdeu mais de 99% de seu valor desde 1694. \n\nNão há precedentes para qualquer moeda fiduciária manter seu valor ao longo do tempo. Isso é inflação. \nÉ efetivamente uma forma de roubo de dinheiro seu próprio dinheiro suado!",
            title:
              "Isso significa que todo dinheiro fiduciário perde valor ao longo do tempo?",
            type: "Text",
          },
          {
            answers: [
              "Dinheiro é difícil de movimentar pelo mundo, e também pode ser vigiado.",
              "O dinheiro não é mais necessário no século 21.",
              "Dinheiro é a raiz de todo o mal.",
            ],
            feedback: [
              "Correto. Vamos explicar mais sobre esses problemas em modos de quiz subseqüentes. Continue cavando!!",
              "Resposta errada. Você sabe que isso não é verdade.",
              "Enquanto alguns podem acreditar que é assim, não é a resposta que estamos procurando aqui.",
            ],
            id: "OtherIssues",
            question:
              "Quais são alguns outros problemas que existem com dinheiro fiduciário?",
            text: "Sim, existem muitos outros problemas que existem com a moeda fiduciária moderna. \n\nPrimeiro, pode ser extremamente difícil movimentar dinheiro ao redor do mundo. Muitas vezes, os governos restringem completamente o movimento -- e às vezes até confiscam dinheiro -- sem um motivo ou explicação válida. E mesmo quando você pode enviar dinheiro, as altas taxas de transação o tornam muito caro.\n\nSegundo, mesmo nos EUA, houve uma perda total de privacidade, já que a maioria do comércio ocorre com cartões de débito e crédito, bem como on-line com outros sistemas, como PayPal e Apple Pay.\n\nVocê já reparou como um anúncio aparece em suas redes sociais ou no Gmail momentos depois de pesquisar um determinado produto ou serviço? Isso é conhecido como “capitalismo de vigilância”, e é baseado em empresas que vendem seus dados financeiros pessoais.",
            title:
              "OK, dinheiro fiduciário perde valor com o tempo. Existem outros problemas?",
            type: "Text",
          },
        ],
        meta: {
          id: "HowDoesMoneyWork",
          title: "Como funciona o dinheiro? ",
        },
      },
      {
        content: [
          {
            answers: [
              "Sim. Nunca pode haver mais de 21 milhões de bitcoins criados.",
              "Não. O governo pode criar mais bitcoins a qualquer momento.",
              "Não, o software bitcoin pode ser alterado para permitir que mais bitcoins sejam criados.",
            ],
            feedback: [
              "Correto. Ao limitar a quantidade que pode ser criada, o Bitcoin é projetado para aumentar seu valor ao longo do tempo.",
              "Resposta errada. O governo não tem controle sobre o Bitcoin.",
              "Incorreto. Um dos principais atributos do bitcoin é que a oferta é limitada para sempre.",
            ],
            id: "LimitedSupply",
            question: "O fornecimento de bitcoin é limitado para sempre?",
            text: "Os governos podem imprimir moeda fiduciária em quantidades ilimitadas. \n\nPor outro lado, a oferta de Bitcoin é fixa — e nunca pode exceder 21 milhões de moedas. \n\nUma oferta cada vez maior de moeda fiduciária cria inflação. Isso significa que o dinheiro que você tem hoje é menos valioso no futuro. \n\nUm exemplo simples: \nUm pão que custava cerca de 8 centavos em 1920. No ano de 1990, um pão custava cerca de US$ 1,00, e hoje o preço é mais perto de US$ 2,50 ! \n\nA oferta limitada de bitcoin tem o efeito oposto, de deflação. \n\nIsso significa que o bitcoin que você possui hoje foi projetado para ser mais valioso no futuro — porque é escasso.",
            title: "Característica Especial #1:\nFornecimento Limitado",
            type: "Text",
          },
          {
            answers: [
              "Não. O Bitcoin é completamente “decentralizado”.",
              "Sim. É controlado centralmente pelas Nações Unidas.",
              "Sim. É controlado centralmente pelos maiores bancos do mundo.",
            ],
            feedback: [
              "Correto. Não há empresa, governo ou instituição que controle o bitcoin. Qualquer um pode usar bitcoin - tudo o que é necessário é um smartphone e uma conexão com a internet.",
              "Resposta errada. Por favor, tente novamente.",
              "Incorreto. Você já sabe que isso não é verdade!",
            ],
            id: "Decentralized",
            question: "O bitcoin é centralizado?",
            text: "A moeda fiduciária é controlada por bancos e governos - e é por isso que as pessoas se referem a ela como uma moeda “centralizada”.\n\nBitcoin não é controlado por nenhuma pessoa, governo ou empresa - o que a torna “descentralizada” \n\nNão ter bancos envolvidos significa que ninguém pode negar o acesso ao bitcoin — por causa de raça, sexo, renda, histórico de crédito, localização geográfica — ou qualquer outro fator. \n\nQualquer pessoa — em qualquer lugar do mundo — pode acessar e usar o Bitcoin a hora que você quiser. Tudo que você precisa é de um computador ou smartphone e uma conexão com a internet!",
            title: "Característica Especial #2: Descentralizado",
            type: "Text",
          },
          {
            answers: [
              "Não. É impossível falsificar Bitcoin.",
              "Sim. Embora a criação de bitcoin falso exija computadores muito especializados.",
              "Sim. O governo pode imprimir quanto bitcoin quiser.",
            ],
            feedback: [
              "Essa é a resposta certa. Em um teste subsequente, Honey Badger explicará os detalhes de por que isso acontece!",
              "Incorreto. Não há como alguém copiar ou duplicar o valor de um bitcoin.",
              "Errado. Embora o governo possa imprimir dólares ilimitados, ele não pode imprimir bitcoins.",
            ],
            id: "NoCounterfeitMoney",
            question: "As pessoas podem falsificar Bitcoin?",
            text: "Papel-moeda, cheques e transações com cartão de crédito podem ser falsificados ou falsificados. \n\nO software exclusivo que executa a rede Bitcoin elimina a possibilidade de duplicar dinheiro para fins de falsificação. \n\nNovos bitcoins só podem ser emitido se houver acordo entre os participantes da rede. Pessoas que executam voluntariamente software bitcoin em seus próprios computadores e smartphones.\n\nIsso garante que é impossível falsificar ou criar bitcoins falsos.",
            title: "Característica especial nº 3: \nSem dinheiro falso",
            type: "Text",
          },
          {
            answers: [
              "0.00000001 BTC",
              "Um bitcoin inteiro. Não é possível usar nada menos.",
              "0.01 BTC",
            ],
            feedback: [
              "Sim. Você pode dividir um bitcoin em 100.000.000 pedaços. Como você já sabe, a menor unidade de bitcoin - B0.00000001 - é conhecida como “sat”.",
              "Errado. Bitcoin é altamente divisível. Você pode facilmente usar uma fração muito pequena de um bitcoin.",
              "Incorreto. Embora a menor unidade da moeda americana seja um centavo, um bitcoin é divisível por muito mais do que 100x.",
            ],
            id: "HighlyDivisible",
            question:
              "Qual é a menor quantidade de Bitcoin que alguém pode possuir ou usar?",
            text: 'O dinheiro fiduciário antiquado só pode ser gasto em quantias tão pequenas quanto um centavo - ou duas casas decimais para um dólar americano (US$ 0,01).\n\nPor outro lado, o Bitcoin pode ser dividido 100.000.000 vezes. Isso significa que você pode gastar apenas ₿0,00000001. Você notará o símbolo "₿", que é o equivalente Bitcion de "$". Às vezes, você também verá o uso de BTC, em vez de ₿.\n\nPor outro lado, o Bitcoin pode lidar com pagamentos muito pequenos - mesmo aqueles com menos de um centavo dos EUA!',
            title: "Característica especial nº 4: \nAltamente divisível",
            type: "Text",
          },
          {
            answers: [
              "Sim. A rede bitcoin é muito segura.",
              "Talvez. Depende do dia da semana.",
              "Não. É um software de código aberto e é facilmente atacado.",
            ],
            feedback: [
              "Correto. Na verdade, a rede Bitcoin nunca foi hackeada. Responda à próxima pergunta para saber mais!",
              "Boa tentativa, mas errada. A rede bitcoin é segura e protegida - 24 horas por dia, 365 dias por ano.",
              "Correto. Embora o bitcoin seja de fato um software de “código aberto” - ou disponível ao público gratuitamente - ainda é extremamente seguro.",
            ],
            id: "securePartOne",
            question: "A rede Bitcoin é segura?",
            text: "A rede bitcoin vale bem mais de US$ 100 bilhões hoje. Portanto, a rede deve ser muito segura — para que o dinheiro nunca seja roubado. \n\nBitcoin é conhecido como a primeira criptomoeda do mundo. \n\nA “criptografia” ” parte do nome vem da criptografia. Simplificando, a criptografia protege as informações por meio de funções matemáticas muito complexas. \n\nA maioria das pessoas não percebe, mas o Bitcoin é, na verdade, a rede de computadores mais segura do mundo! \n\n(você pode já ouviu falar sobre “hacks” de bitcoin – que vamos desmascarar no próximo quiz)",
            title: "Característica especial nº 5: \nSegurança -- Parte I",
            type: "Text",
          },
          {
            answers: [
              "Não. O Bitcoin nunca foi hackeado.",
              "Sim. O Bitcoin é hackeado com frequência.",
              "Sim. O Bitcoin geralmente é hackeado nos feriados, quando os bancos tradicionais estão fechados.",
            ],
            feedback: [
              "Isso está correto. A rede bitcoin nunca foi comprometida. No entanto, é importante fazer você usar uma carteira digital segura (como Galoy!) para manter seus bitcoins pessoais seguros o tempo todo.",
              "Errado. Tente novamente.",
              "Não bobo, você sabe que não é a resposta correta.",
            ],
            id: "securePartTwo",
            question: "O Bitcoin já foi hackeado?",
            text: "Para ser direto: a própria rede bitcoin nunca foi hackeada. Nunca.\n\nEntão o que exatamente foi hackeado? \n\nCertas carteiras digitais que não tinham segurança adequada. \n\nApenas assim como uma carteira física contém moeda fiduciária (na forma de notas de papel), as carteiras digitais contêm uma certa quantidade de bitcoin. \n\nNo mundo físico, os criminosos roubam bancos e saem com dólares americanos. O fato de alguém ter roubado um banco não tem qualquer relação se o dólar americano é um dinheiro estável ou confiável. \n\nDa mesma forma, alguns hackers de computador roubaram bitcoins de carteiras digitais inseguras, o equivalente on-line de um assalto a banco. \n\nNo entanto, é importante saiba que a rede bitcoin nunca foi hackeada ou comprometida!",
            title: "Característica especial nº 5: \nSegurança -- Parte II",
            type: "Text",
          },
        ],
        meta: {
          id: "BitcoinWhySpecial",
          title: "Bitcoin: Por que é especial? ",
        },
      },
    ],
    finishText: "Por enquanto é só, avisaremos quando houver mais para descobrir",
    getRewardNow: "Responder quiz",
    keepDigging: "Continue cavando!",
    phoneNumberNeeded: "Número de telefone obrigatório",
    quizComplete: "Quiz concluído e {amount} sats ganhos",
    reviewQuiz: "Revisar quiz",
    satAccumulated: "Sats acumulados",
    satsEarned: "{formattedNumber} ganhos",
    sectionsCompleted: "Você concluiu",
    title: "Ganhar",
    unlockQuestion: "Para desbloquear, responda a pergunta:",
    youEarned: "Você ganhou",
  },
  GetStartedScreen: {
    getStarted: "Começar",
    headline: "Carteira com tecnologia Galoy",
  },
  MapScreen: {
    locationPermissionMessage: "Ative sua localização para saber onde está no mapa",
    locationPermissionNegative: "Cancelar",
    locationPermissionNeutral: "Pergunte-me mais tarde",
    locationPermissionPositive: "OK",
    locationPermissionTitle: "Localize-se no mapa",
    payBusiness: "pagar este negócio",
    title: "Map",
  },
  ModalClipboard: {
    dismiss: "Dispensar",
    open: "Abrir",
    pendingBitcoin: "Você tem um endereço Bitcoin na sua área de transferência",
    pendingInvoice: "Você tem uma fatura Lightning em sua área de transferência",
  },
  MoveMoneyScreen: {
    receive: "Receber",
    send: "Enviar",
    title: "Home",
    updateAvailable: "Uma atualização está disponível.\nPressione para atualizar agora",
    useLightning: "Nós usamos a Rede Lightning.",
  },
  Overlay: {
    accounts: "Comece recebendo\nalgumas recompensas!",
    rewards: {
      download: "Nós lhe demos 1 sessão de presente\npara baixar o aplicativo.",
      getMore: "Aprenda sobre #bitcoin e ganhe mais!",
    },
  },
  PinScreen: {
    attemptsRemaining: "PIN incorreto. {attemptsRemaining} tentativas restantes.",
    oneAttemptRemaining: "PIN incorreto. 1 tentativa restante.",
    setPin: "Defina seu código PIN",
    setPinFailedMatch: "Os PINs não correspondem - Defina seu código PIN",
    storePinFailed: "Não foi possível armazenar seu pin.",
    tooManyAttempts: "Muitas tentativas falharam. Saindo.",
    verifyPin: "Verifique seu código PIN",
  },
  PriceScreen: {
    oneDay: "1D",
    oneMonth: "1M",
    oneWeek: "1S",
    oneYear: "1A",
    // TODO: Review five years
    fiveYears: "5A",
    prevMonths: "Meses anteriores",
    satPrice: "Preço para 100.000 sats: ",
    thisMonth: "Este mês",
    thisWeek: "Esta semana",
    thisYear: "Este ano",
    lastFiveYears: "últimos cinco anos",
    today: "Hoje",
    yesterday: "Ontem",
  },
  PrimaryScreen: {
    title: "Home",
  },
  ReceiveBitcoinScreen: {
    activateNotifications:
      "Deseja ativar as notificações para ser notificado quando o pagamento chegar?",
    copyClipboard: "A fatura foi copiada na área de transferência",
    copyClipboardBitcoin: "O endereço do Bitcoin foi copiado na área de transferência",
    invoicePaid: "Esta fatura foi paga",
    setNote: "definir uma nota",
    tapQrCodeCopy: "Toque em QR Code para Copiar",
    title: "Receber Bitcoin",
    usdTitle: "Receber USD",
    error:
      "Falha ao gerar a fatura. Entre em contato com o suporte se o problema persistir.",
    // TODO: Review the below translations in ReceiveBitcoinScreen section
    copyInvoice: "Copiar fatura",
    shareInvoice: "Compartilhar fatura",
    addAmount: "Adicionar quantidade",
    expired: "Fatura expirada",
    expiresIn: "Expira em",
    updateInvoice: "Atualizar fatura",
    flexibleAmountInvoice: "Fatura flexível",
    copyAddress: "Copiar endereço",
    shareAddress: "Compartilhar endereço",
    generatingInvoice: "Gerando fatura",
    useABitcoinOnchainAddress: "Use um endereço Bitcoin on-chain",
    useALightningInvoice: "Use uma fatura Lightning",
    setANote: "Defina uma nota",
    invoiceAmount: "Quantidade da fatura",
  },
  ScanningQRCodeScreen: {
    invalidContent:
      "Encontramos:\n\n{found}\n\nEste não é um endereço Bitcoin válido ou fatura Lightning",
    invalidTitle: "Código QR inválido",
    noQrCode: "Não foi possível encontrar um código QR na imagem",
    title: "Ler código QR",
    invalidContentLnurl: "Encontramos:\n\n{found}\n\n não é suportado no momento",
  },
  SecurityScreen: {
    biometricDescription: "Desbloqueie com impressão digital ou reconhecimento facial.",
    biometricSubtitle: "Ativar autenticação biométrica",
    biometricTitle: "Biometric",
    biometryNotAvailable: "O sensor biométrico não está disponível.",
    biometryNotEnrolled:
      "Por favor, registre pelo menos um sensor biométrico para usar a autenticação baseada em biometria.",
    hideBalanceDescription:
      "Oculta seu saldo na tela inicial por padrão, para que você não o revele a ninguém olhando para sua tela.",
    hideBalanceSubtitle: "Ocultar saldo",
    hideBalanceTitle: "Saldo",
    pinDescription:
      "PIN é usado como método de autenticação de backup para autenticação biométrica.",
    pinSubtitle: "Ativar PIN",
    pinTitle: "Código PIN",
    setPin: "Definir PIN",
  },
  SendBitcoinConfirmationScreen: {
    amountLabel: "Quantidade:",
    confirmPayment: "Confirmar pagamento",
    confirmPaymentQuestion: "Deseja confirmar este pagamento?",
    destinationLabel: "Para:",
    feeLabel: "Taxa:",
    memoLabel: "Observação:",
    paymentFinal: "Os pagamentos são finais.",
    stalePrice:
      "O preço do seu bitcoin é antigo e foi atualizado pela última vez {timePeriod} atrás. Reinicie o aplicativo antes de fazer um pagamento.",
    title: "Confirmar Pagamento",
    totalLabel: "Total:",
    totalExceed: "O total excede seu saldo de {balance}",
    // TODO review the below 2 translations
    maxFeeSelected:
      "Esta é a taxa máxima que será cobrada por esta transação. Pode acabar sendo menor uma vez que o pagamento foi feito.",
    feeError: "Falha ao calcular a taxa",
  },
  SendBitcoinScreen: {
    amount: "quantidade",
    amountExceed: "O valor excede seu saldo de {balance}",
    cost: "Custo",
    fee: "Taxa da rede",
    feeCalculationUnsuccessful: "Cálculo sem sucesso ⚠️",
    input: "nome de usuário ou fatura",
    invalidUsername: "Nome de usuário inválido",
    noAmount:
      "Esta fatura não tem um valor, então você precisa especificar manualmente quanto dinheiro deseja enviar",
    notConfirmed:
      "Pagamento foi enviado\nmas ainda não está confirmado\n\nVocê pode verificar o status\no pagamento em Transações",
    note: "Nota opcional",
    success: "Pagamento enviado com sucesso",
    title: "Enviar Bitcoin",
    usernameNotFound:
      "Um usuário correspondente ao nome de usuário digitado não pôde ser encontrado.",
    failedToFetchLnurlParams: "Falha ao buscar parâmetros lnurl",
    failedToFetchLnurlInvoice: "Falha ao buscar a fatura lnurl",
    // TODO review the below 3 translations
    amountIsRequired: "Quantidade é obrigatória",
    destination: "Destino",
    destinationIsRequired: "Destino é obrigatório",
    youCantSendAPaymentToYourself: "Você não pode enviar um pagamento para você mesmo",
  },
  SettingsScreen: {
    activated: "Ativado",
    tapLogIn: "Toque para entrar",
    tapUserName: "Toque para definir o nome de usuário",
    title: "Configurações",
    csvTransactionsError:
      "Não foi possível exportar transações para csv. Algo deu errado. Se o problema persistir, entre em contato com o suporte.",
    lnurlNoUsername:
      "Para gerar um endereço lnurl você deve primeiro definir um nome de usuário. Deseja definir um nome de usuário agora?",
    copyClipboardLnurl: "O endereço Lnurl foi copiado na área de transferência",
  },
  Languages: {
    "DEFAULT": "Default (OS)",
    "en": "English",
    "en-US": "English",
    "es": "Spanish",
    "es-SV": "Spanish",
    "pt-BR": "Portuguese (Brazil)",
    "fr-CA": "French (Canada)",
  },
  SplashScreen: {
    update:
      "Seu aplicativo está desatualizado. Uma atualização é necessária antes que o aplicativo possa ser usado.\n\nIsso pode ser feito na PlayStore para Android e Testflight para iOS",
  },
  TransactionDetailScreen: {
    detail: "Detalhes da transação",
    paid: "Pago de/para",
    received: "Você recebeu",
    spent: "Você gastou",
  },
  TransactionScreen: {
    noTransaction: "Nenhuma transação para mostrar",
    title: "Transações",
    transactionHistoryTitle: "Histórico de transações",
  },
  UsernameScreen: {
    "3CharactersMinimum": "são necessários pelo menos 3 caracteres",
    "50CharactersMaximum": "O nome de usuário não pode ter mais de 50 caracteres",
    "confirmSubtext":
      "O nome de usuário é permanente e não pode ser alterado posteriormente",
    "confirmTitle": "Definir {username} como seu nome de usuário?",
    "forbiddenStart":
      "Não pode começar com lnbc1, bc1, 1 ou 3 e não pode ser um endereço Bitcoin ou fatura Lightning",
    "letterAndNumber": "Apenas letras minúsculas, números e sublinhado (_) são aceitos",
    "emailAddress": "Nome de usuário não deve ser endereço de e-mail",
    "notAvailable": "❌ {username} não está disponível",
    "success": "{username} agora é seu nome de usuário!",
    "usernameToUse": "Qual nome de usuário você deseja usar?",
    // TODO review the below translation
    "available": "✅ {username} está disponível",
  },
  WelcomeFirstScreen: {
    bank: "O Bitcoin foi projetado para permitir que você armazene, envie e receba dinheiro, sem depender de um banco ou cartão de crédito.",
    before:
      "Antes do Bitcoin, as pessoas dependiam de bancos ou provedores de cartão de crédito para gastar, enviar e receber dinheiro.",
    care: "Por que eu deveria me importar?",
    learn: "Eu não quero te atormentar, mas há muito mais para aprender, cavar...",
    learnToEarn: "Aprenda a ganhar",
  },
  WelcomePhoneInputScreen: {
    header:
      "Digite seu número de telefone e enviaremos um código de acesso por mensagem de texto.",
    headerVerify: "Verifique se você é humano",
    placeholder: "Número de telefone",
    verify: "Clique para verificar",
    continue: "Continuar",
  },
  WelcomePhoneValidationScreen: {
    errorLoggingIn: "Erro ao fazer login. Você usou o código correto?",
    header:
      "Para confirmar seu número de telefone, digite o código que acabamos de enviar para você em {phoneNumber}",
    need6Digits: "O código precisa ter 6 dígitos",
    placeholder: "Código de 6 dígitos",
    sendAgain: "Enviar novamente",
  },
  common: {
    activateWallet: "Ativar Carteira",
    amountRequired: "O valor é obrigatório",
    back: "Voltar",
    bank: "Banco",
    bankAccount: "Conta de Dinheiro",
    bitcoin: "Bitcoin",
    bitcoinPrice: "Preço do Bitcoin",
    cancel: "Cancelar",
    close: "Fechar",
    confirm: "Confirmar",
    csvExport: "Exportar transações como CSV",
    date: "Data",
    description: "Descrição",
    domain: "Domínio",
    email: "E-mail",
    error: "Erro",
    fatal: "Fatal",
    fee: "taxa",
    Fee: "Taxa",
    fees: "Taxas",
    feeSats: "Taxas (sats)",
    feesUsd: "Taxas (USD)",
    firstName: "Primeiro Nome",
    hour: "hora",
    hours: "horas",
    invoice: "Fatura",
    language: "Idioma",
    languagePreference: "Idioma de preferência",
    lastName: "Último nome",
    later: "depois",
    loggedOut: "Você foi desconectado.",
    logout: "Sair",
    minutes: "minutos",
    needWallet: "Validar seu telefone para abrir sua carteira",
    next: "Próximo",
    No: "Não",
    note: "Nota",
    notification: "Notificação",
    ok: "OK",
    openWallet: "Abrir carteira",
    phoneNumber: "Número de Telefone",
    reauth: "Sua sessão expirou. Faça login novamente.",
    restart: "Reiniciar",
    sats: "sats",
    search: "Pesquisar",
    security: "Segurança",
    send: "Enviar",
    setAnAmount: "definir um valor",
    share: "Compartilhar",
    shareBitcoin: "Compartilhar endereço Bitcoin",
    shareLightning: "Compartilhar fatura do Lightning",
    soon: "Em breve!",
    success: "Sucesso!",
    to: "Para",
    total: "Total",
    transactions: "Transações",
    transactionsError: "Erro ao carregar transações",
    tryAgain: "Tente novamente",
    type: "Tipo",
    username: "Nome de usuário",
    usernameRequired: "O nome de usuário é obrigatório",
    yes: "Sim",
    pending: "pendente",
    account: "conta",
    backHome: "De volta para casa",
    btcAccount: "Conta Bitcoin",
    convert: "Converter",
    from: "De",
    rate: "Taxa",
    usdAccount: "Conta USD",
    viewTransaction: "Ver transação",
  },
  errors: {
    generic: "Ocorreu um erro.\nPor favor, tente novamente mais tarde.",
    invalidEmail: "E-mail inválido",
    invalidPhoneNumber: "não é um número de telefone válido",
    tooManyRequestsPhoneCode:
      "Muitas solicitações. Aguarde antes de solicitar outra mensagem de texto.",
    network: {
      server: "Erro no servidor. Tente novamente mais tarde",
      request:
        "Solicite problema.\nEntre em contato com o suporte se o problema persistir",
      connection: "Problema de conexão.\nVerifique sua conexão com a internet",
    },
    unexpectedError: "Ocorreu um erro inesperado",
    restartApp: "Por favor, reinicie o aplicativo.",
    problemPersists: "Se o problema persistir entre em contato com o suporte.",
    fatalError:
      "Desculpe, parece que estamos tendo problemas para carregar os dados do aplicativo. Se os problemas persistirem, entre em contato com o suporte.",
    showError: "Mostrar erro",
  },
  notifications: {
    payment: {
      body: "Você acabou de receber {value} sats",
      title: "Pagamento recebido",
    },
  },
  tippingLink: {
    title: "Quer receber gorjetas? Compartilhe seu link de gorjetas!",
    copied: "{data} salvo na área de transferência",
  },
  support: {
    contactUs: "Preciso de ajuda? Contate-Nos.",
    whatsapp: "WhatsApp",
    email: "E-mail",
    phone: "Telefone",
    defaultEmailSubject: "Bitcoin Beach Wallet - Suporte",
    defaultSupportMessage: "Ei! Preciso de ajuda com a Bitcoin Beach Wallet",
  },
  lnurl: {
    overLimit: "Você não pode enviar mais do que o valor máximo",
    underLimit: "Você não pode enviar menos que o valor mínimo",
    commentRequired: "Comentário obrigatório",
    viewPrintable: "Ver versão para impressão",
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
  TransferScreen: {
    title: "",
    percentageToConvert: "",
  },
}

export default ptBR
