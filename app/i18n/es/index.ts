// prettier-ignore

import { Translation } from "../i18n-types";

/* eslint-disable no-template-curly-in-string */
/* eslint-disable max-lines */
const es: Translation = {
  AuthenticationScreen: {
    authenticationDescription: "Autentiquese para continuar",
    setUp: "Configurar autenticación biométrica",
    setUpAuthenticationDescription: "Utilice sus datos biométricos para autenticarse",
    skip: "Saltar",
    unlock: "Desbloquear",
    usePin: "Usar PIN",
  },
  BalanceHeader: {
    currentBalance: "Saldo actual",
    hiddenBalanceToolTip: "Presione para ver el saldo",
  },
  ContactsScreen: {
    noContactsTitle: "No se encontraron contactos",
    noContactsYet:
      "Envíe o reciba un pago utilizando un nombre de usuario y los contactos se agregarán automáticamente aquí",
    noMatchingContacts: "No se encontraron coincidencias para su búsqueda.",
    title: "Contactos",
  },
  ContactDetailsScreen: {
    title: "Transacciones con {username}",
  },
  ConversionDetailsScreen: {
    title: "Convertir",
    percentageToConvert: "% a convertir",
  },
  ConversionConfirmationScreen: {
    title: "Confirmar conversión",
    youreConverting: "Está convirtiendo",
    receivingAccount: "Cuenta destino",
  },
  ConversionSuccessScreen: {
    title: "Conversión exitosa",
    message: "Conversión exitosa",
  },
  EarnScreen: {
    earnSats: "Gana ‪{formattedNumber|sats}‬",
    earnSections: {
      bitcoinWhatIsIt: {
        title: "Bitcoin: ¿Qué es?",
        questions: {
          whatIsBitcoin: {
            answers: [
              "Dinero Digital",
              "Un juego de Video",
              "Un nuevo personaje de caricatura.",
            ],
            feedback: [
              'Correcto. ¡Acabas de ganar 1 "Satoshi"!',
              "Incorrecto, por favor intenta de nuevo",
              "¡Nooo. ¡Al menos ninguno que conozcamos!",
            ],
            question: "Entonces, ¿Qué es Bitcoin?",
            text: "Bitcoin es dinero digital. \n\n\nSe puede transferir de forma instantánea y segura entre dos personas en el mundo, sin la necesidad de un banco o cualquier otra empresa financiera en el medio.",
            title: "Entonces, ¿Qué es Bitcoin?",
            type: "Text",
          },
          sat: {
            answers: [
              "La unidad más pequeña de Bitcoin.",
              "Un pequeño Satélite",
              "Un gato espacial 🐱🚀",
            ],
            feedback: [
              "¡¡Correcto!! ¡¡Acabas de ganar otros dos Satoshis!!",
              "¡Podría ser13<… pero no es la respuesta correcta en este contexto 🙂",
              "Ummm.... ¡ni cerca!",
            ],
            question: 'Acabo de ganar un "Satoshi". ¿Qué es eso?',
            text: "Un “Satoshi” es la unidad más pequeña de un Bitcoin.\n\nTodos sabemos que un US Dólar puede dividirse en 100 centavos. de manera similar, un bitcoin puede dividirse en 100,000,000 Satoshis. \n\nDe hecho, NO necesitas ser el dueño de todo un bitcoin para poder usarlo. puedes usarla cantidad de Satoshis que tengas, no importa que tengas 20, 3000 o hasta 100,000,000 de Satoshis (que como sabes es igual a un Bitcoin).",
            title: 'Acabo de ganar un "Satoshi". ¿Qué es eso?',
            type: "Text",
          },
          whereBitcoinExist: {
            answers: ["En el Internet", "En La Luna", "En una cuenta del Banco Federal"],
            feedback: [
              "¡Correcto! Acabas de ganar otros 5 Satoshis.",
              "Incorrecto, Buen... Aun no.",
              "¡Equivocado!, por favor intenta de nuevo",
            ],
            question: "¿De dónde existen los Bitcoins?",
            text: "Bitcoin es una nueva forma de dinero. puede ser usado por cualquiera, en cualquier momento y en cualquier lugar del mundo. \n\nNo está atado a ningún gobierno o región en específico como el dólar estadounidense. tampoco hay papeles escritos, monedas metálicas o tarjetas de plástico. \n\nTodo es 100% digital. Bitcoin es una red de computadoras funcionando en el internet. \n\nTu Bitcoin es fácilmente manejado por software en tu teléfono o computadora",
            title: "¿De dónde existen los Bitcoins?",
            type: "Text",
          },
          whoControlsBitcoin: {
            answers: [
              "Una comunidad voluntaria de usuarios alrededor del mundo.",
              "El Señor Burns de Los Simpson",
              "El Gobierno de Francia",
            ],
            feedback: [
              "¡Es Correcto! Bitcoin es posible gracias a que gente alrededor del mundo corre el software de Bitcoin es sus computadoras y smartphones.",
              "Un divertido pensamiento — ¡pero no es correcto!",
              "¡Equivocado! No hay ninguna compañía o gobierno que controle Bitcoin.",
            ],
            question: "¿Quién controla Bitcoin?",
            text: "Bitcoin no es controlada por ninguna persona, compañía o gobierno. \n\nEs manejada por una comunidad de usuarios, personas y compañías alrededor del mundo, quienes voluntariamente corren los programas de bitcoin en sus computadores y teléfonos.",
            title: "¿Quién controla Bitcoin?",
            type: "Text",
          },
          copyBitcoin: {
            answers: [
              "No — es imposible copiar o duplicar el valor de un Bitcoin",
              "Si, tú puedes copiar Bitcoin tan fácil como copiar una fotografía digital.",
              "Si, pero copiar Bitcoin requiere computadoras bastante especializadas.",
            ],
            feedback: [
              "¡Esto es absolutamente correcto!",
              "Sabes que no es cierto. Prueba de nuevo.",
              "Incorrecto. No hay manera de que nadie copie, cree o duplique un Bitcoin.",
            ],
            question:
              "¿Si Bitcoin es dinero digital, puede alguien solo copiar y crear dinero gratis?",
            text: "El valor de un Bitcoin nunca puede ser copiado. ¡¡Esta es la razón por la que un Bitcoin es una poderoso y nuevo invento!! \n\nLa mayoría de archivos digitales — Como un iPhone fotografías, una canción en MP2, o un documento hecho en Microsoft Word— pueden ser fácilmente duplicados y compartidos. \n\nLa programación de Bitcoin software previenen la duplicación— o “doble gasto” — de dinero digital. ¡Te compartiremos exactamente como trabaja esto más adelante!",
            title:
              "¿Si Bitcoin es dinero digital, puede alguien solo copiar y crear dinero gratis?",
            type: "Text",
          },

      },
    },
      WhatIsMoney: {
        title: "¿Qué es el dinero? ",
        questions: {
          moneySocialAggrement: {
            answers: [
              "Porque la gente confía que otras personas valuarán su dinero de manera similar.",
              "Porque tu mamá te lo dijo.",
              "Por qué el billete de un dólar vale su peso en Oro.",
            ],
            feedback: [
              "Correcto. ¡Esto es lo que permite al dinero trabajar!",
              "Podría ser, pero no es la respuesta correcta.",
              "No. En el pasado podrías cambiar dólares por oro. Pero ya no es más el caso.",
            ],
            question: "¿Por qué el dinero tiene valor?",
            text: "El dinero necesita la confianza de la gente. \n \n La gente cree en el billete de dólar en sus bolsillos. Confían en los dígitos de su cuenta bancaria. Confían que el saldo de un certificado de regalo de una tienda puede ser canjeable.\n \n Tener dinero le permite a la gente hacer intercambios rápidos por bienes o servicios.",
            title: "El dinero es un acuerdo social.",
            type: "Text",
          },
          coincidenceOfWants: {
            answers: [
              "Coincidencia de lo que se desea",
              "Coincidencia del día y la noche.",
              "Por coincidencia de la luna bloqueando el sol",
            ],
            feedback: [
              "Es correcto. El dinero te permite fácilmente la compra de algo sin rebuscar una forma de pago",
              "No tontillo, sabes que esa no es la respuesta.",
              "Ni cerca, A eso le llamamos un eclipse solar. 🌚",
            ],
            question: "¿Cuál coincidencia resuelve el dinero?",
            text: 'Desde hace siglos, antes de que la gente tuviera dinero, ellos trueques, -- O tenían que ver la forma de cambiar un único artículo, a cambio de otro artículo o servicio. \n \n Digamos que deseas un plato de comida de un restaurante, y le ofreces a cambio al dueño una escoba. El dueño podría decir "NO" -- pero podría aceptar 3 sombreros a cambio. Si tu felizmente los tienes. \n \n ¡¡"Puedes imaginar lo difícil e ineficiente que una "Economía de Trueque" puede ser!! \n \n Por el contrario, con dinero, simplemente entregas un billete de a $20 y sabrás que inmediatamente el dueño del restaurant lo aceptara.',
            title:
              "El dinero resuelve la “coincidencia de lo que se quiere o desea” ... ¿¿Qué es eso??",
            type: "Text",
          },
          moneyEvolution: {
            answers: [
              "Piedras, conchas marinas y oro",
              "El tablerito plástico del juego de mesa de Monopoly",
              "Monedas hechas de chocolate",
            ],
            feedback: [
              "Correcto. Cosas que son raras y difíciles de copiar a menudo son usadas como dinero.",
              "Equivocado, Podría tener valor en cuando juegas, pero no en el mundo real.",
              "Nooo. Pueden ser sabrosas. pero no sería un dinero útil.",
            ],
            question: "¿Qué cosas han sido usadas históricamente como unidad de dinero?",
            text: "Miles de años atrás, la sociedad de Micronesia piedras largas y cortas como una forma aceptable de moneda. \n \n A Principios de los 1500’s, raras conchas de porcelana (halladas en el océano) se convirtieron en dinero de uso común en varias naciones.\n \n Y por miles de años, el oro ha sido usado como una forma de dinero por países alrededor del mundo. -- Incluyendo a Estados Unidos (hasta 1971).",
            title: "El dinero ha evolucionado desde el principio de los tiempos.",
            type: "Text",
          },
          whyStonesShellGold: {
            answers: [
              "Porque tienen características. Como ser durables, uniformes, y divisibles.",
              "Porque son bonitas y brillantes",
              "Porque caben en tu bolsillo",
            ],
            feedback: [
              "Correcto. Otras características clave incluye que sean escasas y portable.",
              "Incorrecto. Podría ser cierto. Pero solas no son grandes características del dinero.",
              "Ni cerca. Aunque estos artículos son seguramente portables, solamente eso, no es una razón para que pueda ser usado como moneda.",
            ],
            question:
              "¿Por qué fueron usadas piedras, conchas y oro usadas comúnmente como unidades de dinero?",
            text: 'Bueno, todos estos artículos tienen algunas --pero no todas-- las características de un buen dinero. \n \n ¿Entonces que características hacen un "buen" dinero?\n Limitada: No abundante, tampoco fácil de reproducir o copiar \n Aceptada: Relativamente fácil que la gente verifique su autenticidad\n Durable: Fácil de guardar, no perece o se deshace en pedazos.\n Uniforme: Rápidamente intercambiable por otro objeto de la misma forma Portable: Fácil de transportar\n Divisible: Puede ser dividida y compartida en piezas más pequeñas.',
            title:
              "¿Por qué fueron usadas piedras, conchas y oro usadas comúnmente como dinero en el pasado?",
            type: "Text",
          },
          moneyIsImportant: {
            answers: [
              "El dinero les permite a las personas comprar bienes y servicios hoy y en el mañana.",
              "El dinero te permite ir a la luna",
              "El dinero es la solución a todos los problemas",
            ],
            feedback: [
              "¡Es correcto!",
              "Incorrecto. Aunque podría cambiar en el futuro.",
              "Ni cerca. Aunque mucha gente pueda creerlo, esta respuesta no te dirige al propósito primario del dinero.",
            ],
            question:
              "¿Cuál es la razón principal para que el dinero sea tan importante?",
            text: "Todos sabemos que el dinero importa.\n \n La mayoría de la gente cambia su vida y energía -en forma de trabajo-- para obtener dinero.\n  \n La gente también, es capaz de comprar bienes y servicios hoy y en el futuro.",
            title: "El dinero es importante para las personas",
            type: "Text",
          },
          moneyImportantGovernement: {
            answers: [
              "El Banco Central de Estados Unidos (La Reserva Federal)",
              "El Señor Burns de Los Simpson",
              "Un chico con una prensa impresora en su sótano.",
            ],
            feedback: [
              "Correcto. El Gobierno de los Estados Unidos puede imprimir tanto dinero como quieran y cuando quieran.",
              "Incorrecto. Aunque podría parecer como que siempre tiene mucho dinero.",
              "No. Aunque algunas personas pueden crear dinero falso con los billetes del dólar, definitivamente esto no es legal.",
            ],
            question:
              "¿Quién puede imprimir legalmente Dolarea americanas, cada vez que quiera?",
            text: 'Las economías modernas están organizadas por naciones-estado: USA, Japón, Suiza, Brasil, Noruega, China, etc. \n \n En consecuencia, casi en cada nación, el gobierno mantiene el poder y el control del dinero. \n \n En los Estados Unidos, el Banco Central (conocido como la Reserva Federal, o "Fed") puede imprimir o crear más dólares estadounidenses en cualquier momento que quiera. \n \n La “Fed” no necesita permiso del presidente, ni del congreso, y ciertamente tampoco de los ciudadanos estadounidenses. \n \n Imagina si tienes la posibilidad de imprimir dólares de los Estados Unidos, cada vez que quieras, ¿Qué harías?',
            title: "El dinero también es importante para los gobiernos.",
            type: "Text",
          },
        },
      },
      HowDoesMoneyWork: {
        title: "¿Cómo funciona el dinero? ",
        questions: {
          WhatIsFiat: {
            answers: [
              "Es creado por orden del gobierno nacional de un determinado país.",
              "Por el gerente de un banco local",
              "El hombrecito del Monopoly",
            ],
            feedback: [
              "Correcto. El banco de un gobierno crea dinero Fiat.",
              "Incorrecto. Un banco local solo puede manejar dinero que ha sido previamente creado por el gobierno.",
              "Nooo. ¡Intenta de nuevo!",
            ],
            question:
              "¿Quién crea la moneda fiar, como el Dólar estadounidense o el Franco Suizo?",
            text: 'Todas las divisas nacionales en circulación hoy son llamadas divisa o moneda "FIAT". esto incluye El Dólar Estadounidense, El Yen Japones, Es Franco Suizo, y así sucesivamente.\n \n La palabra "FIAT" proviene del latín y significa "por decreto" lo que quiere decir "por orden oficial" \n \n Esto significa que todas las monedas Fiat, incluyendo el Dólar Estadounidense, simplemente fueron creadas por orden del gobierno nacional al que representan.',
            title: "Divisa o Moneda Fiat: ¿qué es esto?",
            type: "Text",
          },
          whyCareAboutFiatMoney: {
            answers: [
              "Todas las divisas Fiat son eventualmente abusadas por las autoridades de gobernó.",
              "Las bóvedas de un banco local, podrían no tener suficiente espacio para contener todos los billetes de Dólar.",
              "No habría forma de que hubiera suficientes árboles para hacer papel para todos los billetes adicionales del Dólar.",
            ],
            feedback: [
              "Correcto. A través de la historia, los gobiernos han sido incapaces de resistir la habilidad de imprimir dinero, ya que efectivamente no tienen ninguna obligación de recompensar este dinero.",
              "No, Ciertamente ese no es el caso.",
              "Equivocado. Por favor intenta de nuevo.",
            ],
            question:
              "¿Debería preocuparme por que el gobierno controle el dinero impreso (Fiat)?",
            text: 'Como compartimos en una pregunta anterior, el Banco Central de los Estados Unidos es la Reserva Federal conocida también como "Fed".\n \n La Fed puede imprimir dólares en cualquier momento, y no necesitan el permiso del presidente, del congreso e incluso el permiso de ningún ciudadano de Estados Unidos. \n \n Tener el control del dinero puede ser muy tentador para que las autoridades abusen de la impresión y al pasar el tiempo esto lleve a una masiva inflación, confiscaciones arbitrarias y corrupción. \n \n De hecho, Alan Greenspan, El famoso creador de la Fed, Dijo la famosa frase que los Estados Unidos "pueden pagar cualquier deuda que tenga, porque siempre podemos imprimir dinero más para hacerlo”.',
            title:
              "Yo creo en mi gobierno. \n ¿Debería preocuparme por el dinero Fiat (Impreso)?",
            type: "Text",
          },
          GovernementCanPrintMoney: {
            answers: [
              "La impresión de dinero adicional lleva a la inflación.",
              "La gente debe cambiar los billetes viejos de Dólar cada año.",
              "Que la apariencia del billete del dólar cambie.",
            ],
            feedback: [
              "Correcto. Esto significa que bienes y servicios costarán más en el futuro.",
              "Nooo. Los billetes viejos de Dólar son tan válidos y valiosos como los más nuevos.",
              "Incorrecto, Aunque el gobierno pueda implementar una nueva apariencia para los billetes, eso no tienen nada que ver con el incremento del suministro del dinero.",
            ],
            question: "¿Qué significa cuando el gobierno imprime más dinero?",
            text: "Bueno, ¡Todos deberían preocuparse! \n \n La práctica del gobierno de imprimir dinero -- o incrementar el suministro de dólares-- lleva a la inflación.\n \n La Inflación es un incremento de precio de los bienes y servicios. En otras palabras, el precio de algo en el futuro será mucho más caro que hoy.\n \n ¿Entonces que puede significar la inflación a los ciudadanos? \n \n En el Reino Unido, la Libra Esterlina ha perdido el 99.5% de su valor desde que fue introducida hace más de 300 años. \n \n En los Estados Unidos el dólar ha perdido el 97% de su valor desde el fin de la primera guerra mundial, cerca de 100 años atrás. \n \n Esto significa que si un filete de carne costaba $0.30 en 1920... era de $3 en 1990… y ¡cerca de $15 hoy, en el año 2020!",
            title:
              "¿Debería preocupare por que el gobierno puede imprimir dinero ilimitadamente?",
            type: "Text",
          },
          FiatLosesValueOverTime: {
            answers: [
              "Cada divisa Fiat que ha existido pierde masivamente su valor nominal.",
              "El valor permanece igual por siempre",
              "La apariencia y el diseño de los billetes de papel es actualizada cada 10 años aproximadamente.",
            ],
            feedback: [
              "Correcto. Es cierto incluso para el dólar estadounidense USD, el cual ha perdido 97% de su valor durante los últimos 100 años.",
              "Incorrecto. Por favor intenta de nuevo.",
              "Ni cerca. Aunque el diseño del billete de papel pueda cambiar, esto no tiene nada que ver con el valor de la moneda que representa.",
            ],
            question:
              "¿Qué pasa con el valor del dinero impreso (Fiat) a través del tiempo?",
            text: "Esto es correcto. \n \n En la historia del mundo, han existido 775 monedas Fiat creadas. la mayoría ya no existen, y el promedio de vida de cualquier moneda Fiat es de solo 27 años.\n \n La libra británica es la más vieja divisa Fiat, ha perdido más del 99% de su valor desde 1694. \n \n No hay ningún precedente de que alguna moneda Fiat mantenga su valor a través del tiempo. Esto es inflación. \n ¡Esto es efectivamente una forma de robo de nuestro propio dinero duramente ganado!",
            title:
              "¿Quiere decir que todas las monedas impresas (Fiat) pierden su valor a lo largo del tiempo?",
            type: "Text",
          },
          // TODO: @dolcalmi please check all the below answers and feedback
          OtherIssues: {
            answers: [
              "El dinero es difícil de mover por el mundo y también puede ser vigilado.",
              "El dinero ya no es necesario en el siglo XXI.",
              "El dinero es la raíz del mal.",
            ],
            feedback: [
              "Correcto. Explicaremos más acerca de estos problemas en los siguientes módulos de prueba. ¡¡Sigue cavando!!",
              "Respuesta incorrecta. Sabes que eso no es cierto.",
              "Si bien algunos pueden creer que esto es así, no es la respuesta que estamos buscando aquí.",
            ],
            question:
              "¿Cuáles son algunos otros problemas que existen con el dinero fiduciario?",
            text: "Sí, existen muchos otros problemas con el dinero fiduciario moderno. \n\nPrimero, puede ser extremadamente difícil mover dinero alrededor del mundo. A menudo, los gobiernos restringirán directamente el movimiento, y en ocasiones incluso confiscarán dinero, sin una razón o explicación válida. E incluso cuando puede enviar dinero, las altas tarifas de transacción lo hacen muy costoso.\n\nEn segundo lugar, incluso en los EE. UU., ha habido una pérdida total de privacidad, ya que la mayoría del comercio se realiza con tarjetas de débito y crédito, así como en línea con otros sistemas como PayPal y Apple Pay.\n\n¿Alguna vez ha notado cómo un ¿Aparece el anuncio en sus redes sociales o Gmail momentos después de buscar un determinado producto o servicio? Esto se conoce como “capitalismo de vigilancia” y se basa en empresas que venden sus datos financieros personales.",
            title:
              "Bien, el dinero fiduciario pierde valor con el tiempo. ¿Hay otros problemas?",
            type: "Text",
          },
        },
      },
      BitcoinWhySpecial: {
        title: "Bitcoin: ¿Por qué es especial? ",
        questions: {
          LimitedSupply: {
            answers: [
              "Si. Nunca podrán existir más de los 21 millones de Bitcoin que han sido Creados.",
              "No. El gobierno puede crear más Bitcoin en cualquier momento.",
              "No, Los programas de Bitcoin pueden ser cambiados para permitir que puedan ser creados más Bitcoins.",
            ],
            feedback: [
              "Correcto. Al limitar la cantidad de Bitcoin que pueden ser creados. Bitcoin está diseñado para incrementar su valor a través del tiempo.",
              "Respuesta incorrecta. El gobierno no tiene ningún control sobre Bitcoin.",
              "Incorrecto. Uno de los atributos del Bitcoin, es que su suministro está limitado para siempre.",
            ],
            question: "¿Está el suministro de Bitcoin Limitado para Siempre?",
            text: "Los gobiernos pueden imprimir todo el dinero (Fiat) en cantidades ilimitadas. \n \n Por el contrario, el suministro de Bitcoin está arreglado --y nunca excederá de los 21 millones de monedas. \n \n Un continuo incremento del suministro de moneda impresa (Fiat) crea inflación. Esto significa que el dinero que guardes ahora tendrá menos valor en el futuro.\n \n Un simple ejemplo: \n Un pedazo de pan costaba cerca de 8 centavos en 1920. en 1990 es mismo pedazo de pan en 1990 cotaba cerca de $1.00, ¡y hoy el precio estaría cercano a $2.50! \n \n El suministro limitado de Bitcoin crea el efecto opuesto, uno de deflación.\n \n Esto significa que el bitcoin que guardes hoy, está diseñado para adquirir mayor valor en el futuro. --- porque se escasea.",
            title: "Característica Especial #1: \n Suministro Limitado",
            type: "Text",
          },
          Decentralized: {
            answers: [
              "No. Bitcoin es completamente “descentralizada”.",
              "Si, centralizada y controlada por las Naciones Unidas.",
              "Si, es centralizada y controlada por los bancos más grandes del mundo.",
            ],
            feedback: [
              "Esto es correcto. No hay ninguna compañía o gobierno, o institución que controle Bitcoin. Cualquiera puede usar Bitcoin, todo lo que necesitan es una computadora o un teléfono inteligente y su conexión a internet.",
              "Respuesta Incorrecta. Por favor intenta de nuevo.",
              "Incorrecto. ¡Tú ya sabes que eso no es cierto!",
            ],
            question: "¿Bitcoin es Centralizada?",
            text: "El dinero Fiat es controlado por los bancos y los gobiernos, es por eso que las personas se refieren a esto como divisas “centralizas”.\n \n Bitcoin no está controlada por ninguna persona, gobierno o compañía, lo que la vuelve “descentralizada” \n \n El no tener involucrado a ningún banco significa que nadie puede negarte el acceso a Bitcoin, Ni por cuestiones de raza, genero, ingresos, historia crediticia, localización geográfica, o cualquier otro factor. \n \n Cualquiera, en cualquier lugar del mundo puede acceder y usar Bitcoin cada vez que lo desee. ¡Todo lo que necesitas es una computadora o smartphone, y una conexión de internet!",
            title: "Característica Especial #2: Descentralizada",
            type: "Text",
          },
          NoCounterfeitMoney: {
            answers: [
              "No. Es imposible falsificar Bitcoin.",
              "Si... Aunque crear un Bitcoin Falso requiere computadoras especializadas.",
              "Si. El gobierno puede imprimir tanto Bitcoin como quiera.",
            ],
            feedback: [
              "Es la respuesta correcta. ¡En posteriores preguntas, “Honey Badger” te explicara más detalles de por qué esto es así!",
              "Incorrecto. No hay forma que nadie pueda copiar o duplicar el valor de un Bitcoin.",
              "Equivocado. Aunque los gobiernos pueden imprimir cantidades ilimitadas de dólares, ellos no pueden imprimir Bitcoin.",
            ],
            question: "¿pueden las personas falsificar Bitcoin?",
            text: "El papel Moneda, cheques y las transacciones tarjetas de crédito, todas pueden ser falsificadas o falsas. \n \n El único programa que corre en la red Bitcoin, elimina la posibilidad de duplicidad de pago por propósitos de falsificación. \n \n El nuevo Bitcoin puede ser emitido solo si hay consentimiento entre todos los participantes en la red Bitcoin. Gente que voluntariamente corren el software de Bitcoin en sus propias computadoras y teléfonos inteligentes.\n \n Esto asegura que sea imposible de falsificar, o crear Bitcoin falsos.",
            title: "Característica Especial #3: \n No hay Dinero Falso en Bitcoin",
            type: "Text",
          },
          HighlyDivisible: {
            answers: [
              "0.00000001 BTC",
              "Solo un bitcoin completo. No es posible usar nada menos.",
              "0.01 BTC",
            ],
            feedback: [
              "Si. Puedes dividir un Bitcoin hasta en 100,000,000 unidades como sabrás, esa sería la unidad más pequeña de Bitcoin. — B0.00000001 — y esta es conocida con el nombre de “Satoshi” o también “Sat” en abreviación.",
              "Equivocado. Bitcoin es altamente divisible. Puedes fácilmente usar fácilmente una pequeña fracción de bitcoin.",
              "Incorrecto. Aunque la unidad más pequeña del dólar estadounidense es el centavo. un Bitcoin es divisible por 100 veces más que eso.",
            ],
            question:
              "¿Cuál es la menor cantidad de Bitcoin que alguien pueda tener o usar?",
            text: 'La vieja moneda impresa, puede ser gastada en montos tan pequeños como un centavo. --- o dos decimales por dólar ($0.01).\n \n Por otro lado, Bitcoin puede dividirse 100,000,000 de veces más. Esto significa que puedes gastar una cantidad tan pequeña como ₿0.00000001. Notaras que el símbolo "₿", que es el equivalente en Bitcoin al "$". algunas veces puede usarse el de BTC, en lugar de ₿.\n \n Por el contrario, Bitcoin puede manejar pequeñísimos gastos, algunos de estos incluso ¡más pequeños que el centavo americano!',
            title: "Característica Especial #4: \n Altamente Divisible",
            type: "Text",
          },
          securePartOne: {
            answers: [
              "Si. La red de Bitcoin es muy segura.",
              "Talvez, eso depende del día de la semana.",
              "No. Esta es programa open source, y es fácilmente atacada.",
            ],
            feedback: [
              "Correcto. De hecho, la red de Bitcoin jamás ha sido hackeada ni una vez. Responde la próxima pregunta para aprender más.",
              "Buen intento, pero estas Equivocado. La red de Bitcoin está a salvo y segura. 24 horas al día, 365 días al año.",
              "Incorrecto. Aunque es en efecto software “open source” — o disponible para el público gratis— aun así, es extremadamente segura.",
            ],
            question: "¿Es la red Bitcoin segura?",
            text: "La red de Bitcoin vale ahora más de $100 billones hoy. Por consiguiente, la red debe ser muy segura, por eso el dinero nunca ha sido robado.\n \n Bitcoin es conocido mundialmente como la primer Criptomoneda o Criptodivisa. \n \n la palabra “crypto” proviene en parte del nombre criptografía. En simples palabras, la criptografía protege información a través de muchas funciones matemáticas complejas. \n \n La mayoría de gente no se da cuenta, pero ¡Bitcoin es actualmente la moneda digital más segura del mundo! \n \n (Probablemente escucharas de algunos Hackeos o robos de Bitcoin. De esto hablaremos en la siguiente pregunta.)",
            title: "Característica Especial #5: \n Seguridad -- Parte I",
            type: "Text",
          },
          securePartTwo: {
            answers: [
              "No. Bitcoin Nunca ha sido hackeada.",
              "Si, Bitcoin es hackeada frecuentemente.",
              "Si. Bitcoin usualmente tiene hackeos en Días festivos. cuando los bancos están cerrados.",
            ],
            feedback: [
              "Esto es correcto. La red de Bitcoin nunca se ha visto comprometida. De cualquier manera, es importante que uses unca cartera digital segura (¡Como lo es Bitcoin Beach Wallet, desarrollada por Galoy!) para mantener tus Bitcoins personales seguros todo el tiempo.",
              "Equivocado, intenta de nuevo.",
              "No amiguito, sabes bien que eso no es correcto.",
            ],
            question: "¿Bitcoin ha sido alguna vez hackeada?",
            text: "Siendo directos: la red Bitcoin por si misma NUNCA ha sido hackeada. ni siquiera una vez. \n \n ¿Exactamente que ha sido hackeado? \n \n Algunas Carteras digitales que no tienen la seguridad apropiada en sus aplicaciones. \n \n Justo como una cartera o billetera física guarda nuestro dinero impreso (Fiat) en forma de papel, las carteras digitales guardan cierta cantidad de Bitcoin. \n \n En el mundo físico, los criminales roban bancos, y se van con dólares estadounidenses. El hecho de que alguien robe un banco no tiene ninguna relación de que el dólar americano sea o no una moneda estable. \n \n De manera similar, algunos hackers de computadoras han robado dinero de carteras digitales inseguras. el equivalente en línea al robo de un banco. \n \n Sin embargo, es importante conocer, ¡Que la red de Bitcoin NUNCA ha sido hackeada o comprometida!",
            title: "Característica Especial #5: \n Seguridad -- Parte II",
            type: "Text",
          },
        },
      },
    },
    finishText: "Eso es todo por ahora, te avisaremos cuando haya más por desenterrar",
    getRewardNow: "Responder al cuestionario",
    keepDigging: "Sigue nadando",
    phoneNumberNeeded: "Numero de telefono requerido",
    quizComplete: "Prueba completada, has ganado {{amount}} sats",
    reviewQuiz: "Cuestionario de repaso",
    satAccumulated: "Satoshis acumulado",
    satsEarned: "‪{formattedNumber|sats}‬ ganados",
    sectionsCompleted: "Has completado",
    title: "Ganar",
    unlockQuestion: "Para desbloquear, responda la pregunta:",
    youEarned: "Usted Ganó",
  },
  GetStartedScreen: {
    getStarted: "Empezar",
    headline: "El banco con dinero sólido",
  },
  MapScreen: {
    locationPermissionMessage: "Active la localización para poder ubicarlo en el mapa",
    locationPermissionNegative: "Cancelar",
    locationPermissionNeutral: "Pregúntarme más tarde",
    locationPermissionPositive: "OK",
    locationPermissionTitle: "Ubícate en el mapa",
    payBusiness: "pagar a este negocio",
    title: "Mapa",
  },
  ModalClipboard: {
    dismiss: "Rechazar",
    open: "Abrir",
    pendingBitcoin: "Hay una dirección Bitcoin en el portapapeles",
    pendingInvoice: "Hay una factura Lightning en el portapapeles",
  },
  MoveMoneyScreen: {
    receive: "Recibir",
    send: "Enviar",
    title: "Mover dinero",
    updateAvailable: "Hay una actualización disponible.\nToque para actualizar",
    useLightning: "Usamos la red de lightning",
  },
  Overlay: {
    accounts: "¡Empiece por conseguir algunas recompensas!",
    rewards: {
      download: "Te regalamos 1 Satoshi para descargar la aplicación.",
      getMore: "Aprende mas sobre Bitcoin y gane mas",
    },
  },
  PinScreen: {
    attemptsRemaining: "PIN incorrecto. Quedan {attemptsRemaining} intentos.",
    oneAttemptRemaining: "PIN incorrecto. Queda 1 intento.",
    setPin: "Establezca su PIN",
    setPinFailedMatch: "El PIN no coincide. Establezca su PIN",
    storePinFailed: "No se puede guardar su PIN.",
    tooManyAttempts: "Ha superado el límite de intentos. Cerrando sesión.",
    verifyPin: "Verifique su PIN",
  },
  PriceScreen: {
    oneDay: "1D",
    oneMonth: "1M",
    oneWeek: "1S",
    oneYear: "1A",
    fiveYears: "5Y",
    prevMonths: "Meses anteriores",
    satPrice: "Precio por 100,000 sats: ",
    thisMonth: "Este mes",
    thisWeek: "Esta semana",
    thisYear: "Este año",
    lastFiveYears: "últimos cinco años",
    today: "Hoy",
    yesterday: "Ayer",
  },
  PrimaryScreen: {
    title: "Inicio",
  },
  ReceiveBitcoinScreen: {
    activateNotifications:
      "¿Quieres activar notificaciones para que te avisen cuando haya llegado el pago?",
    copyClipboard: "La factura se ha copiado al portapapeles.",
    copyClipboardBitcoin: "La dirección de Bitcoin se ha copiado en el portapapeles",
    invoicePaid: "Esta factura ha sido pagada",
    setNote: "ingrese una nota",
    tapQrCodeCopy: "Toque el código QR para copiar",
    title: "Recibir Bitcoin",
    usdTitle: "Recibir USD",
    error:
      "Error al generar la factura. Póngase en contacto con el soporte técnico si este problema persiste.",
    copyInvoice: "Copiar factura",
    shareInvoice: "Compartir factura",
    addAmount: "Solicitar Monto Específico",
    expired: "La factura ha expirado",
    expiresIn: "Expira en",
    // TODO:  @dolcalmi please review these translations
    updateInvoice: "Actualizar factura",
    flexibleAmountInvoice: "Factura flexible",
    copyAddress: "Copiar dirección",
    shareAddress: "Compartir dirección",
    generatingInvoice: "Generando factura",
    useABitcoinOnchainAddress: "Usar una dirección de Bitcoin en el blockchain",
    useALightningInvoice: "Usar una factura Lightning",
    setANote: "Establecer una nota",
    invoiceAmount: "Monto de la factura",
  },
  ScanningQRCodeScreen: {
    invalidContent:
      "Encontramos lo siguiente:\n\n{{found}}\n\nEsto no es una dirección Bitcoin o factura Lightning válida",
    invalidTitle: "Código QR inválido",
    noQrCode: "No pudimos encontrar un código QR en la imagen",
    title: "Escanear QR",
    invalidContentLnurl:
      "Encontramos lo siguiente:\n\n{{found}}\n\n actualmente no es compatible",
  },
  SecurityScreen: {
    biometricDescription: "Desbloqueo con huella dactilar o reconocimiento facial.",
    biometricSubtitle: "Habilitar la autenticación biométrica",
    biometricTitle: "Biométrica",
    biometryNotAvailable: "El sensor biométrico no está disponible.",
    biometryNotEnrolled:
      "Registre al menos un sensor biométrico para utilizar la autenticación basada en datos biométricos.",
    hideBalanceDescription:
      "Ocultar su saldo de forma predeterminada para no mostrarlo si alguien está viendo su pantalla.",
    hideBalanceSubtitle: "Ocultar saldo",
    hideBalanceTitle: "Saldo",
    pinDescription:
      "El PIN se utiliza como método de autenticación de respaldo para la autenticación biométrica.",
    pinSubtitle: "Habilitar PIN",
    pinTitle: "Código PIN",
    setPin: "Establecer PIN",
  },
  SendBitcoinConfirmationScreen: {
    amountLabel: "Cantidad:",
    confirmPayment: "Confirmar y pagar",
    confirmPaymentQuestion: "¿Desea confirmar este pago?",
    destinationLabel: "Para:",
    feeLabel: "Tarifa de red",
    memoLabel: "Nota:",
    paymentFinal:
      "Recuerde que los pagos son definitivos y una vez realizados son irreversibles.",
    stalePrice:
      "El precio de bitcoin está desactualizado, se actualizó por última vez hace {{timePeriod}}. Por favor reinicie la aplicación antes de realizar el pago.",
    title: "Confirmar pago",
    totalLabel: "Total:",
    totalExceed: "El total excede su saldo de {{balance}}",
    maxFeeSelected:
      "Tarifa máxima que se cobrará por esta transacción. Podría ser menor una vez se realice el pago.",
    feeError: "Error al calcular la tarifa",
  },
  SendBitcoinScreen: {
    amount: "Cantidad",
    // TODO: @dolcalmi please check this
    amountExceed: "La cantidad excede su saldo de {balance}",
    amountIsRequired: "Se requiere cantidad",
    cost: "Costo",
    destination: "Destino",
    destinationIsRequired: "El destino es obligatorio",
    fee: "tarifa de red",
    feeCalculationUnsuccessful: "Error al calcular, inténtelo de nuevo ⚠️",
    input: "Nombre de usuario o factura",
    invalidUsername: "Nombre de usuario no válido",
    noAmount:
      "Esta factura no tiene un monto, por lo que debe especificar manualmente cuánto dinero desea enviar",
    notConfirmed:
      "El pago ha sido enviado.\npero aún no está confirmado\n\nPuedes comprobar el estado\ndel pago en Transacciones",
    note: "Nota",
    success: "El pago se ha enviado correctamente.",
    title: "Enviar Bitcoin",
    usernameNotFound: "El usuario no fue encontrado.",
    failedToFetchLnurlParams: "No se pudieron recuperar los parámetros de lnurl",
    failedToFetchLnurlInvoice: "Error al obtener la factura de lnurl",
    youCantSendAPaymentToYourself: "No puedes enviar un pago a ti mismo",
  },
  SettingsScreen: {
    activated: "Activada",
    tapLogIn: "\nIngrese aquí para iniciar sesión",
    tapUserName: "Ingrese aquí para configurarlo",
    title: "Configuración",
    csvTransactionsError:
      "No se pueden exportar transacciones a csv. Algo salió mal. Si el problema persiste, póngase en contacto con el soporte.",
    lnurlNoUsername:
      "Para generar una dirección lnurl primero debe establecer un nombre de usuario. ¿Desea establecer un nombre de usuario ahora?",
    copyClipboardLnurl: "La dirección de Lnurl se ha copiado en el portapapeles",
  },
  Languages: {
    "DEFAULT": "Predeterminado (OS)",
    "en": "Inglés",
    "en-US": "Inglés",
    "es": "Español",
    "es-SV": "Español",
    "pt-BR": "Portugués (Brasil)",
    "fr-CA": "Francés (Canadá)",
  },
  StablesatsModal: {
    header: "¡Ya tienes una cuenta en USD agregada a su billetera con StableSats!",
    body: "Puedes enviar y recibir bitcoins, transferir el valor instantáneamente entre tu cuenta BTC y USD. El valor en la cuenta en USD no fluctúa con el precio de Bitcoin. Esta función no es compatible con el sistema bancario tradicional.",
    termsAndConditions: "Lee los términos y condiciones.",
    learnMore: "Aprende más sobre StableSats"
  },
  SplashScreen: {
    update:
      "\nTu aplicación está desactualizada. Se necesita una actualización antes de que se pueda utilizar la aplicación. Esto se puede hacer desde PlayStore para Android y Testflight para iOS.",
  },
  TransactionDetailScreen: {
    detail: "Detalles de la transacción",
    paid: "Pagado a/desde",
    received: "Recibiste",
    spent: "Gastaste",
  },
  TransactionScreen: {
    noTransaction: "\nNo se han realizado transacciones",
    title: "Transacciones",
    transactionHistoryTitle: "Historial",
  },
  TransferScreen: {
    title: "Transferir",
    percentageToConvert: "% para convertir",
  },
  UsernameScreen: {
    "3CharactersMinimum": "al menos de 3 letras son necesarias",
    "50CharactersMaximum": "Este nombre de usuario no puede tener más de 50 letras",
    "available": "✅  {username} está disponible",
    "confirmSubtext":
      "Este nombre de usuario es permanente y no se podrá cambiar más adelante.",
    "confirmTitle": "¿Desea establecer {username} como su nombre de usuario?",
    "forbiddenStart":
      "No debe empezar con lnbc1, bc1, 1 o 3 y no debe ser Bitcoin o factura Lightning",
    "letterAndNumber": "Solo se aceptan letras en minúscula, números y guiones bajos (_)",
    "emailAddress": "el nombre de usuario no debe ser correo electrónico",
    "notAvailable": "❌  {username} no está disponible",
    "success": "¡{username} es ahora su nombre de usuario!",
    "usernameToUse": "¿Qué nombre de usuario desea usar?",
  },
  WelcomeFirstScreen: {
    bank: "Bitcoin está diseñado para permitirle almacenar, enviar y recibir dinero, sin depender de un banco o tarjeta de crédito.",
    before:
      "Antes de Bitcoin, la gente tenía que depender de bancos o proveedores de tarjetas de crédito para gastar, enviar y recibir dinero.",
    care: "¿Por qué debería importarme?",
    learn: "Es hora de empezar a nadar en el Océano de Bitcoin.",
    learnToEarn: "Aprende y gana",
  },
  WelcomePhoneInputScreen: {
    header:
      "Ingrese su número de teléfono, y le enviaremos un mensaje de texto con un código de acceso.",
    headerVerify: "¿Eres un robot?",
    placeholder: "Número de teléfono",
    verify: "No soy un robot",
    continue: "Continuar",
  },
  WelcomePhoneValidationScreen: {
    errorLoggingIn: "Error al iniciar sesión. ¿Usó el código correcto?",
    header:
      "Para confirmar su cuenta, ingrese el código que le acabamos de enviar al teléfono {phoneNumber}",
    need6Digits: "El código debe tener 6 dígitos",
    placeholder: "Código de 6 dígitos",
    sendAgain: "enviar de nuevo",
  },
  common: {
    account: "Cuenta",
    activateWallet: "Activar billetera",
    amountRequired: "Se requiere una cantidad",
    back: "Atrás",
    bank: "Banco",
    backHome: "Atrás",
    bankAccount: "Cuenta de efectivo",
    bitcoin: "Bitcoin",
    bitcoinPrice: "Precio de Bitcoin",
    btcAccount: "Cuenta BTC",
    cancel: "Cancelar",
    close: "Cerrar ",
    confirm: "Confirmar",
    convert: "Convertir",
    csvExport: "Exportar transacciones (CSV)",
    date: "Fecha ",
    description: "Descripción",
    domain: "Dominio",
    email: "Correo electrónico",
    error: "Error",
    fatal: "Fatal",
    fee: "Cuota",
    Fee: "Tarifa",
    fees: "\nTarifa",
    feeSats: "Tarifas (sats)",
    feesUsd: "Tarifas (USD) ",
    firstName: "Nombre",
    from: "Desde",
    hour: "hora",
    hours: "horas",
    invoice: "Factura",
    language: "Idioma",
    languagePreference: "Configuración de idioma",
    lastName: "Apellido",
    later: "Más tarde",
    loggedOut: "Se ha cerrado su sesión.",
    logout: "Cerrar sesion",
    minutes: "minutos",
    needWallet: "Valide su teléfono para abrir su billetera",
    next: "Siguiente",
    No: "No",
    note: "Nota ",
    notification: "Notificación",
    ok: "OK",
    openWallet: "Abrir billetera",
    phoneNumber: "Número de teléfono",
    rate: "Tasa",
    reauth: "Su sesión ha expirado. Inicie sesión de nuevo.",
    restart: "Reiniciar",
    sats: "Satoshis",
    search: "Buscar",
    security: "Seguridad",
    send: "Enviar",
    setAnAmount: "Establecer una cantidad",
    share: "Compartir",
    shareBitcoin: "compartir la dirección de Bitcoin",
    shareLightning: "compartir factura de lightning",
    soon: "Próximamente",
    success: "Éxito",
    to: "Para",
    total: "Total",
    transactions: "\nLas transacciones",
    transactionsError: "Error al cargar las transacciones",
    tryAgain: "Inténtalo de Nuevo",
    type: "tipo",
    usdAccount: "Cuenta USD",
    username: "Nombre de usuario",
    usernameRequired: "El nombre de usuario es requerido",
    viewTransaction: "Ver transacción",
    yes: "Sí",
    pending: "pendiente",
  },
  errors: {
    generic: "Hubo un error inesperado.\nPor favor intente más tarde",
    invalidEmail: "Correo inválido",
    invalidPhoneNumber: "Esto no es un número de teléfono válido",
    tooManyRequestsPhoneCode:
      "Demasiadas peticiones. Por favor, espere antes de solicitar otro mensaje de texto.",
    network: {
      server: "Hubo un error en el servidor.\nPor favor intente más tarde",
      connection: "Error al conectar.\nVerifique su conexión a internet.",
      request:
        "Hay un error en el requerimiento. Póngase en contacto con el soporte técnico si este problema persiste.",
    },
    unexpectedError: "Ocurrió un error inesperado",
    restartApp: "Reinicie la aplicación.",
    problemPersists: "Si el problema persiste, comuníquese con el soporte técnico.",
    fatalError:
      "Lo sentimos, parece que estamos teniendo problemas para cargar la aplicación por usted. Si los problemas persisten, comuníquese con el soporte técnico.",
    showError: "Mostrar error",
  },
  notifications: {
    payment: {
      body: "Acabas de recibir sats ${{value}}",
      title: "Pago recibido",
    },
  },
  tippingLink: {
    title: "Comparte este link para recibir pagos o propinas de tus clientes o amigos",
    copied: "{{data}} se ha copiado en el portapapeles",
  },
  support: {
    contactUs: "¿Necesitas ayuda? Contáctenos.",
    whatsapp: "WhatsApp",
    email: "Correo electrónico",
    phone: "Teléfono",
    defaultEmailSubject: "Bitcoin Beach Wallet - Apoyo",
    defaultSupportMessage: "¡Hola! Necesito ayuda con Bitcoin Beach Wallet",
  },
  lnurl: {
    overLimit: "No se puede enviar más de la cantidad máxima",
    underLimit: "No se puede enviar una cantidad inferior a la mínima",
    commentRequired: "Se requiere una nota",
    viewPrintable: "Ver Versión Imprimible",
  },
}

export default es
