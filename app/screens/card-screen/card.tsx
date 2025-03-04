import React, { useCallback, useState } from "react"
import { View, Image, Alert, ScrollView, ActivityIndicator } from "react-native"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import crashlytics from "@react-native-firebase/crashlytics"
import { StackNavigationProp } from "@react-navigation/stack"
import Icon from "react-native-vector-icons/Ionicons"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useRealTimePrice } from "@app/hooks"
import { usePersistentStateContext } from "@app/store/persistent-state"

// gql
import {
  useAccountDefaultWalletLazyQuery,
  useScanningQrCodeScreenQuery,
} from "@app/graphql/generated"

// components
import { Screen } from "@app/components/screen"
import { icons } from "@app/components/atomic/galoy-icon"
import { ModalNfcFlashcard } from "@app/components/modal-nfc"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { SaveCardModal } from "@app/components/card"

// utils
import {
  DestinationDirection,
  PaymentDestination,
} from "@app/screens/send-bitcoin-screen/payment-destination/index.types"
import { parseDestination } from "@app/screens/send-bitcoin-screen/payment-destination"
import { testProps } from "../../utils/testProps"
import { LNURL_DOMAINS } from "@app/config"

// assets
import CardImage from "@app/assets/images/flashcard-front.png"

type Target = "cardScreen" | "sendBitcoinDetails" | "topupFlashcard"
type IconNamesType = keyof typeof icons

const warningText = "DO NOT THROW AWAY YOUR CARD!"
const warningDetails = "If your card is lost, the funds are not recoverable."

const CARD_HTML_STORAGE_KEY = "CARD_HTML"
const CARD_TAG_STORAGE_KEY = "CARD_TAG"

export const CardScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const isAuthed = useIsAuthed()
  const styles = useStyles()
  const { colors } = useTheme().theme
  const { LL } = useI18nContext()
  const { satsToCurrency, loading: realTimePriceLoading } = useRealTimePrice()
  const { updateState } = usePersistentStateContext()

  const [saveCardVisible, setSaveCardVisible] = useState(false)
  const [displayReceiveNfc, setDisplayReceiveNfc] = useState(false)
  const [cardHtml, setCardHtml] = useState<string | null>(null)
  const [cardTag, setCardTag] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>("$0.00")
  const [reloadLnurl, setReloadLnurl] = useState<PaymentDestination>()
  const [loading, setLoading] = useState(true)

  const { data } = useScanningQrCodeScreenQuery({ skip: !useIsAuthed() })
  const [accountDefaultWalletQuery] = useAccountDefaultWalletLazyQuery({
    fetchPolicy: "no-cache",
  })
  const wallets = data?.me?.defaultAccount.wallets
  const bitcoinNetwork = data?.globals?.network

  useFocusEffect(
    useCallback(() => {
      if (!cardHtml && !realTimePriceLoading) loadCardHtmlFromStorage()
    }, [cardHtml, realTimePriceLoading, satsToCurrency]),
  )

  const loadCardHtmlFromStorage = async () => {
    try {
      setLoading(true)
      const storedCardHtml = await AsyncStorage.getItem(CARD_HTML_STORAGE_KEY)
      const storedCardTag = await AsyncStorage.getItem(CARD_TAG_STORAGE_KEY)
      setLoading(false)
      if (storedCardHtml && storedCardTag) {
        processCardHtml(storedCardHtml)
        setCardTag(storedCardTag)
      } else {
        setDisplayReceiveNfc(true)
      }
    } catch (err) {
      console.log("Get cached card error: ", err)
      setLoading(false)
    }
  }

  const saveCard = async () => {
    setSaveCardVisible(false)
    if (cardTag && cardHtml) {
      await AsyncStorage.setItem(CARD_TAG_STORAGE_KEY, cardTag) // Save cardTag to AsyncStorage
      await AsyncStorage.setItem(CARD_HTML_STORAGE_KEY, cardHtml) // Save cardHtml to AsyncStorage
    }
  }

  const setTagId = async (tag: string) => {
    setCardTag(tag)
  }

  const handleCardHtmlUpdate = async (html: string) => {
    processCardHtml(html)
    if (!cardHtml) setSaveCardVisible(true)
  }

  const processCardHtml = (html: string) => {
    setCardHtml(html)
    const balanceMatch = html.match(/(\d{1,3}(?:,\d{3})*)\s*SATS<\/dt>/)
    if (balanceMatch) {
      const parsedBalance = balanceMatch[1].replace(/,/g, "") // Remove commas
      const satoshiAmount = parseInt(parsedBalance, 10)
      const { formattedCurrency } = satsToCurrency(Number(satoshiAmount))

      setBalance(formattedCurrency)
      updateState((state: any) => {
        if (state)
          return {
            ...state,
            balance: formattedCurrency,
          }
        return undefined
      })
    }

    const lnurlMatch = html.match(/href="lightning:(lnurl\w+)"/)
    if (lnurlMatch) {
      parseAndSetDestination(lnurlMatch[1])
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
    setDisplayReceiveNfc(true)
  }

  const onMenuClick = (target: Target) => {
    if (isAuthed) {
      if (target === "sendBitcoinDetails" && reloadLnurl) {
        navigation.navigate("sendBitcoinDetails", {
          paymentDestination: reloadLnurl,
        })
      } else if (target === "cardScreen") {
        setDisplayReceiveNfc(true)
      } else if (target === "topupFlashcard" && reloadLnurl) {
        navigation.navigate("flashcardTopup", {
          // @ts-ignore: Unreachable code error
          flashcardLnurl: reloadLnurl.validDestination.lnurl,
        })
      }
    }
  }

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

  if (loading) {
    return (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  } else {
    return (
      <Screen keyboardOffset="navigationHeader" keyboardShouldPersistTaps="handled">
        {cardHtml ? (
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.flashcardBalanceText}>{balance}</Text>
            <Image source={CardImage} style={styles.flashcardImage} />
            <View style={styles.listItemsContainer}>
              {buttons.map((item) => (
                <GaloyIconButton
                  key={item.title}
                  name={item.icon}
                  size="large"
                  text={item.title}
                  onPress={() => onMenuClick(item.target)}
                  style={{ width: "25%", alignItems: "center" }}
                />
              ))}
            </View>
            <Text style={styles.warningText}>{warningText}</Text>
            <Text style={styles.warningDetails}>{warningDetails}</Text>
            <Text style={styles.tagId}>ID:{cardTag}</Text>
            <GaloyPrimaryButton
              title="Remove Flashcard"
              onPress={resetCardHtml}
              buttonStyle={{ backgroundColor: "#60aa55" }}
              containerStyle={{ marginTop: 16 }}
            />
          </ScrollView>
        ) : (
          <View style={styles.noCard}>
            <View style={styles.emptyListNoContacts}>
              <Text
                {...testProps(LL.CardScreen.noCardsTitle())}
                style={styles.emptyListTitle}
              >
                {LL.CardScreen.noCardsTitle()}
              </Text>
              <Text style={styles.emptyListText}>{LL.CardScreen.noCardsYet()}</Text>
              <GaloyPrimaryButton
                title="Read NFC card"
                onPress={() => setDisplayReceiveNfc(true)}
                containerStyle={{ marginTop: 16 }}
              />
              <View style={styles.emptyListScanIcon}>
                <Icon name="card" size={96} color={colors.primary} />
              </View>
            </View>
            <Text style={styles.warningDetails}>Want a Flashcard?</Text>
            <GaloyPrimaryButton
              title="Find a Flashpoint"
              onPress={() => navigation.navigate("Map")}
              buttonStyle={{ backgroundColor: "#60aa55" }}
            />
          </View>
        )}
        <ModalNfcFlashcard
          isActive={displayReceiveNfc}
          setIsActive={setDisplayReceiveNfc}
          onCardHtmlUpdate={handleCardHtmlUpdate}
          setTagId={setTagId}
        />
        <SaveCardModal
          isVisible={saveCardVisible}
          onSave={saveCard}
          onCancel={() => setSaveCardVisible(false)}
        />
      </Screen>
    )
  }
}

const useStyles = makeStyles(({ colors }) => ({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
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
    marginTop: 10,
    textAlign: "center",
    color: colors.black,
  },
  emptyListTitle: {
    color: colors.black,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  flashcardImage: {
    width: "100%", // Adjust the size as needed
    height: 200, // Adjust the size as needed
    resizeMode: "contain",
    marginBottom: 20, // Add some space below the image
  },
  flashcardBalanceText: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: 5,
  },
  warningText: {
    fontSize: 22,
    marginBottom: 5,
    textAlign: "center",
    fontWeight: "900",
  },
  warningDetails: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  tagId: {
    fontSize: 8,
    marginBottom: 5,
    textAlign: "center",
  },
  listItemsContainer: {
    paddingVertical: 10,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: colors.grey5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  noCard: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  activityIndicatorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}))
