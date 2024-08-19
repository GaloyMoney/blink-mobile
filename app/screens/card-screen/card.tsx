import { Button, makeStyles, Text, useTheme } from "@rneui/themed"
import * as React from "react"
import { useState } from "react"
import { ActivityIndicator, View, Image, Alert } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import nfcManager from "react-native-nfc-manager"
import {
  useAccountDefaultWalletLazyQuery,
  useScanningQrCodeScreenQuery,
} from "@app/graphql/generated"
import crashlytics from "@react-native-firebase/crashlytics"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { gql, useQuery } from "@apollo/client"
import { Screen } from "@app/components/screen"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { testProps } from "../../utils/testProps"
import { ModalNfcFlashcard } from "@app/components/modal-nfc"
import CardImage from "@app/assets/images/flashcard-front.png"
import { icons } from "@app/components/atomic/galoy-icon"

import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RouteProp } from "@react-navigation/native"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import {
  DestinationDirection,
  PaymentDestination,
} from "@app/screens/send-bitcoin-screen/payment-destination/index.types"
import { parseDestination } from "@app/screens/send-bitcoin-screen/payment-destination"

// Import the conversion functions
import { DisplayCurrency, toUsdMoneyAmount } from "@app/types/amounts"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { StackNavigationProp } from "@react-navigation/stack"
import { LNURL_DOMAINS } from "@app/config"

// hooks
import { usePriceConversion } from "@app/hooks"
import { usePersistentStateContext } from "@app/store/persistent-state"

type CardScreenNavigationProp = StackNavigationProp<RootStackParamList, "cardScreen">
type CardScreenRouteProp = RouteProp<RootStackParamList, "cardScreen">
type Props = {
  navigation: CardScreenNavigationProp
  route: CardScreenRouteProp
}

const warningText = "DO NOT THROW AWAY YOUR CARD!"
const warningDetails = "If your card is lost, the funds are not recoverable."
const multiple = (currentUnit: string) => {
  switch (currentUnit) {
    case "USDCENT":
      return 10 ** -5
    default:
      return 1
  }
}

const BTC_CURRENT_PRICE_QUERY = gql`
  query btcPriceList($range: PriceGraphRange!) {
    btcPriceList(range: $range) {
      timestamp
      price {
        base
        offset
        currencyUnit
      }
    }
  }
`

gql`
  query scanningQRCodeScreen {
    globals {
      network
    }
    me {
      id
      defaultAccount {
        id
        wallets {
          id
        }
      }
      contacts {
        id
        username
      }
    }
  }
`
const CARD_HTML_STORAGE_KEY = "CARD_HTML"
const CARD_TAG_STORAGE_KEY = "CARD_TAG"

export const CardScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  // const navigation = useNavigation()
  const { data } = useScanningQrCodeScreenQuery({ skip: !useIsAuthed() })
  const wallets = data?.me?.defaultAccount.wallets
  const bitcoinNetwork = data?.globals?.network
  const [accountDefaultWalletQuery] = useAccountDefaultWalletLazyQuery({
    fetchPolicy: "no-cache",
  })

  const isAuthed = useIsAuthed()
  const { formatMoneyAmount } = useDisplayCurrency()
  const { convertMoneyAmount } = usePriceConversion()
  const { persistentState, updateState } = usePersistentStateContext()

  const [balanceInDisplayCurrency, setBalanceInDisplayCurrency] = React.useState(
    persistentState.balance || "$0.00",
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [flashCards, setFlashCards] = useState<FlashCards[]>([])
  const [displayReceiveNfc, setDisplayReceiveNfc] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const { LL } = useI18nContext()

  const [cardHtml, setCardHtml] = useState<string | null>(null)
  const [cardTag, setCardTag] = useState<string | null>(null)
  const [refreshBalance, setRefreshBalance] = useState<string | null>("false")
  const [balance, setBalance] = useState<string>("$0.00")
  const [reloadLnurl, setReloadLnurl] = useState<PaymentDestination>()

  const {
    data: priceData,
    loading: priceLoading,
    error: priceError,
  } = useQuery(BTC_CURRENT_PRICE_QUERY, {
    fetchPolicy: "cache-first",
    variables: { range: "ONE_DAY" }, // Pass a valid range
  })

  const handleTagId = async (tag: string) => {
    await AsyncStorage.setItem(CARD_TAG_STORAGE_KEY, tag) // Save cardHtml to AsyncStorage
    processCardTag(tag)
  }

  const processCardTag = (tag: string) => {
    if (!cardTag) {
      setCardTag(tag)
    }
  }

  const cancelNfcRequest = async () => {
    try {
      await nfcManager.cancelTechnologyRequest()
    } catch (error) {
      console.warn("No existing NFC request to cancel", error)
    }
  }

  const handleCardHtmlUpdate = async (html: string) => {
    setCardHtml(html)
    await AsyncStorage.setItem(CARD_HTML_STORAGE_KEY, html) // Save cardHtml to AsyncStorage
    processCardHtml(html)
  }

  const processCardHtml = (html: string) => {
    if (priceData && !priceLoading && !priceError) {
      const currentPriceData =
        priceData.btcPriceList[priceData.btcPriceList.length - 1].price
      const usdPerSat =
        ((currentPriceData.base / 10 ** currentPriceData.offset) *
          multiple(currentPriceData.currencyUnit)) /
        1e5

      // Extract balance from the HTML
      const balanceMatch = html.match(/(\d{1,3}(?:,\d{3})*)\s*SATS<\/dt>/)
      if (balanceMatch) {
        const parsedBalance = balanceMatch[1].replace(/,/g, "") // Remove commas
        const satoshiAmount = parseInt(parsedBalance, 10)

        // Convert SATS to USD using the current BTC price
        const usdAmount = satoshiAmount * usdPerSat

        const convertedBalance =
          convertMoneyAmount &&
          convertMoneyAmount(toUsdMoneyAmount(usdAmount * 100), DisplayCurrency)
        console.log("convertedBalance", convertedBalance?.amount)
        if (convertedBalance) {
          const formattedBalance = formatMoneyAmount({
            moneyAmount: convertedBalance,
            noSymbol: false,
          })
          setBalanceInDisplayCurrency(formattedBalance)
          setBalance(formattedBalance)
          updateState((state: any) => {
            if (state)
              return {
                ...state,
                balance: formattedBalance,
              }
            return undefined
          })
        }
      }
      const lnurlMatch = html.match(/href="lightning:(lnurl\w+)"/)
      if (lnurlMatch) {
        parseAndSetDestination(lnurlMatch[1])
      }
    }
  }

  const parseAndSetDestination = async (lnurlMatch: string) => {
    if (!wallets || !bitcoinNetwork || !lnurlMatch) {
      return
    }
    try {
      const destination = await parseDestination({
        rawInput: lnurlMatch,
        myWalletIds: wallets.map((wallet) => wallet.id),
        bitcoinNetwork,
        lnurlDomains: LNURL_DOMAINS,
        accountDefaultWalletQuery,
      })
      if (destination.valid) {
        if (destination.destinationDirection === DestinationDirection.Send) {
          setReloadLnurl(destination)
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
        Alert.alert(err.toString(), "", [
          {
            text: LL.common.ok(),
          },
        ])
      }
    }
  }

  const resetCardHtml = async () => {
    await AsyncStorage.removeItem(CARD_HTML_STORAGE_KEY)
    await AsyncStorage.removeItem(CARD_TAG_STORAGE_KEY)
    setCardHtml(null)
    setCardTag(null)
  }

  let ListEmptyContent: React.ReactNode

  if (!initialized || priceLoading) {
    ListEmptyContent = (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  } else {
    ListEmptyContent = (
      <View style={styles.emptyListNoContacts}>
        <Text {...testProps(LL.CardScreen.noCardsTitle())} style={styles.emptyListTitle}>
          {LL.CardScreen.noCardsTitle()}
        </Text>
        <Text style={styles.emptyListText}>{LL.CardScreen.noCardsYet()}</Text>
        <View style={styles.emptyListScanIcon}>
          <Icon name="card" size={96} color={colors.primary} />
        </View>
      </View>
    )
  }

  React.useEffect(() => {
    const initializeNfc = async () => {
      if (await nfcManager.isSupported()) {
        await nfcManager.start()
        await cancelNfcRequest() // Cancel any existing NFC requests
        if (!cardHtml) {
          setDisplayReceiveNfc(true)
        }
      }
    }

    const handleFocus = async () => {
      setInitialized(false)
      await initializeNfc()
      initialize()
    }

    const unsubscribeFocus = navigation.addListener("focus", handleFocus)

    async function initialize() {
      if (!isAuthed) {
        return
      }
      setInitialized(true)
    }

    // Initialize NFC on mount
    initializeNfc()

    // Load cardHtml from AsyncStorage on mount
    const loadCardHtmlFromStorage = async () => {
      const storedCardHtml = await AsyncStorage.getItem(CARD_HTML_STORAGE_KEY)
      const storedCardTag = await AsyncStorage.getItem(CARD_TAG_STORAGE_KEY)
      if (storedCardHtml && storedCardTag && storedCardHtml !== cardHtml) {
        setCardHtml(storedCardHtml)
        processCardHtml(storedCardHtml)
        processCardTag(storedCardTag)
      }
    }

    loadCardHtmlFromStorage()

    return () => {
      unsubscribeFocus()
      cancelNfcRequest() // Ensure NFC request is cancelled on cleanup
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, isAuthed, cardHtml])

  const onMenuClick = (target: Target) => {
    if (isAuthed) {
      if (target === "sendBitcoinDetails" && reloadLnurl) {
        navigation.navigate("sendBitcoinDetails", {
          paymentDestination: reloadLnurl,
        })
      } else if (target === "cardScreen") {
        // Reload the card
        console.log("Reloading card")
        setRefreshBalance(null)
        setDisplayReceiveNfc(true)
      } else if (target === "topupFlashcard" && reloadLnurl) {
        navigation.navigate("flashcardTopup", {
          // @ts-ignore: Unreachable code error
          flashcardLnurl: reloadLnurl.validDestination.lnurl,
        })
      }
    } else {
      console.log("Reloading skipped")
    }
  }

  type Target = "cardScreen" | "sendBitcoinDetails" | "topupFlashcard"
  type IconNamesType = keyof typeof icons

  const buttons = [
    {
      title: LL.HomeScreen.balance(),
      target: "cardScreen" as Target,
      icon: "refresh" as IconNamesType,
    },
    {
      title: LL.HomeScreen.reload(),
      target: "sendBitcoinDetails" as Target,
      icon: "receive" as IconNamesType,
    },
    {
      title: LL.HomeScreen.showQrCode(),
      target: "topupFlashcard" as Target,
      icon: "qr-code" as IconNamesType,
    },
  ]

  return (
    <Screen
      keyboardOffset="navigationHeader"
      keyboardShouldPersistTaps="handled"
      style={styles.screenStyle}
    >
      {cardHtml ? (
        <>
          <Text style={styles.flashcardBalanceText}>{balance}</Text>
          <Image source={CardImage} style={styles.flashcardImage} />
          <View style={styles.listItemsContainer}>
            {buttons.map((item) => (
              <View key={item.icon} style={styles.button}>
                <GaloyIconButton
                  name={item.icon}
                  size="large"
                  text={item.title}
                  onPress={() => onMenuClick(item.target)}
                />
              </View>
            ))}
          </View>
          <Text style={styles.warningText}>{warningText}</Text>
          <Text style={styles.warningDetails}>{warningDetails}</Text>
          <Text style={styles.tagId}>ID:{cardTag}</Text>
          <Button
            style={styles.removeButton}
            title="Remove Flashcard"
            onPress={resetCardHtml}
          />
        </>
      ) : (
        <>
          <FlatList
            contentContainerStyle={styles.listContainer}
            data={flashCards}
            ListEmptyComponent={ListEmptyContent}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            renderItem={({ item }) => {
              return (
                <View></View>
                // return empty view as placeholer for now
                // will be used for transaction history in the future
              )
            }}
            keyExtractor={(item) => item.uuid}
          />
          <Text style={styles.warningDetails}>Want a Flashcard?</Text>
          <Button
            style={styles.removeButton}
            title="Find a Flashpoint"
            onPress={() => navigation.navigate("Map")}
          />
        </>
      )}
      {(!cardHtml || !refreshBalance) && !priceLoading && (
        <ModalNfcFlashcard
          isActive={displayReceiveNfc}
          setIsActive={setDisplayReceiveNfc}
          onCardHtmlUpdate={handleCardHtmlUpdate}
          tagId={handleTagId}
        />
      )}
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },

  activityIndicatorContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  emptyListNoContacts: {
    marginHorizontal: 12,
    marginTop: 32,
  },

  emptyListScanIcon: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: 74,
  },

  emptyListText: {
    fontSize: 18,
    marginTop: 30,
    textAlign: "center",
    color: colors.black,
  },

  emptyListTitle: {
    color: colors.black,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  listContainer: { flexGrow: 1 },

  flashcardImage: {
    width: "100%", // Adjust the size as needed
    height: 200, // Adjust the size as needed
    resizeMode: "contain",
    marginBottom: 16, // Add some space below the image
  },
  flashcardBalanceText: {
    fontSize: 36,
    marginBottom: 8,
    marginTop: 16,
    textAlign: "center",
  },
  warningText: {
    fontSize: 22,
    marginBottom: 8,
    paddingTop: 21,
    textAlign: "center",
    // make the font very bold
    fontWeight: "900",
  },
  warningDetails: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  tagId: {
    fontSize: 8,
    marginTop: 9,
    textAlign: "center",
  },
  listItemsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: colors.grey5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  button: {
    display: "flex",
    justifyContent: "space-between",
    width: "25%",
    // maxWidth: 184,
  },
  removeButton: {
    marginTop: 16,
    display: "flex",
    borderRadius: 12,
  },
}))
