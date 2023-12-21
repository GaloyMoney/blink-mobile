import React, { useCallback, useEffect, useMemo, useReducer } from "react"
import { TextInput, TouchableOpacity, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "@app/components/screen"
import { gql } from "@apollo/client"
import ScanIcon from "@app/assets/icons/scan.svg"
import {
  useAccountDefaultWalletLazyQuery,
  useRealtimePriceQuery,
  useSendBitcoinDestinationQuery,
} from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { logParseDestinationResult } from "@app/utils/analytics"
import { toastShow } from "@app/utils/toast"
import { PaymentType } from "@galoymoney/client"
import Clipboard from "@react-native-clipboard/clipboard"
import crashlytics from "@react-native-firebase/crashlytics"
import { StackNavigationProp } from "@react-navigation/stack"
import { SearchBar } from "@rneui/base"
import { FlatList } from "react-native-gesture-handler"

import { LNURL_DOMAINS } from "@app/config"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { makeStyles, useTheme, Text, ListItem } from "@rneui/themed"
import { testProps } from "../../utils/testProps"
import { ConfirmDestinationModal } from "./confirm-destination-modal"
import { DestinationInformation } from "./destination-information"
import { parseDestination } from "./payment-destination"
import {
  DestinationDirection,
  InvalidDestinationReason,
} from "./payment-destination/index.types"
import {
  DestinationState,
  SendBitcoinActions,
  sendBitcoinDestinationReducer,
  SendBitcoinDestinationState,
} from "./send-bitcoin-reducer"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

gql`
  query sendBitcoinDestination {
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

  query accountDefaultWallet($username: Username!) {
    accountDefaultWallet(username: $username) {
      id
    }
  }
`

export const defaultDestinationState: SendBitcoinDestinationState = {
  unparsedDestination: "",
  destinationState: DestinationState.Entering,
}

type Props = {
  route: RouteProp<RootStackParamList, "sendBitcoinDestination">
}

const SendBitcoinDestinationScreen: React.FC<Props> = ({ route }) => {
  const styles = usestyles()
  const {
    theme: { colors },
  } = useTheme()

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinDestination">>()
  const isAuthed = useIsAuthed()

  const [destinationState, dispatchDestinationStateAction] = useReducer(
    sendBitcoinDestinationReducer,
    defaultDestinationState,
  )
  const [goToNextScreenWhenValid, setGoToNextScreenWhenValid] = React.useState(false)

  const { loading, data } = useSendBitcoinDestinationQuery({
    fetchPolicy: "cache-and-network",
    returnPartialData: true,
    skip: !isAuthed,
  })

  // forcing price refresh
  useRealtimePriceQuery({
    fetchPolicy: "network-only",
    skip: !isAuthed,
  })

  const wallets = useMemo(
    () => data?.me?.defaultAccount.wallets,
    [data?.me?.defaultAccount.wallets],
  )
  const bitcoinNetwork = useMemo(() => data?.globals?.network, [data?.globals?.network])
  const contacts = useMemo(() => data?.me?.contacts ?? [], [data?.me?.contacts])

  const { LL } = useI18nContext()
  const [accountDefaultWalletQuery] = useAccountDefaultWalletLazyQuery({
    fetchPolicy: "no-cache",
  })

  const [matchingContacts, setMatchingContacts] = useState<Contact[]>([])
  const allContacts: Contact[] = useMemo(() => {
    const contactsCopy = contacts.slice() ?? []
    const compareUsernames = (a: Contact, b: Contact) => {
      return a.username.toLocaleLowerCase().localeCompare(b.username.toLocaleLowerCase())
    }
    contactsCopy.sort(compareUsernames)

    return contactsCopy
  }, [contacts])

  const [selectedId, setSelectedId] = useState("")

  const handleSelection = (id: string) => {
    if (selectedId === id) setSelectedId("")
    else setSelectedId(id)
  }

  const reset = useCallback(() => {
    dispatchDestinationStateAction({
      type: "set-unparsed-destination",
      payload: { unparsedDestination: "" },
    })
    setGoToNextScreenWhenValid(false)
    setSelectedId("")
    setMatchingContacts(allContacts)
  }, [allContacts])

  const wordMatchesContact = (searchWord: string, contact: Contact): boolean => {
    let contactPrettyNameMatchesSearchWord: boolean

    const contactNameMatchesSearchWord = contact.username
      .toLowerCase()
      .includes(searchWord.toLowerCase())

    if (contact.username) {
      contactPrettyNameMatchesSearchWord = contact.username
        .toLowerCase()
        .includes(searchWord.toLowerCase())
    } else {
      contactPrettyNameMatchesSearchWord = false
    }

    return contactNameMatchesSearchWord || contactPrettyNameMatchesSearchWord
  }

  let ListEmptyContent: React.ReactNode

  if (allContacts.length > 0) {
    ListEmptyContent = (
      <View style={styles.emptyListNoMatching}>
        <Text style={styles.emptyListTitle}>{LL.PeopleScreen.noMatchingContacts()}</Text>
      </View>
    )
  } else if (loading) {
    ListEmptyContent = (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  } else {
    ListEmptyContent = (
      <View style={styles.emptyListNoContacts}>
        <Text
          {...testProps(LL.PeopleScreen.noContactsTitle())}
          style={styles.emptyListTitle}
        >
          {LL.PeopleScreen.noContactsTitle()}
        </Text>
        <Text style={styles.emptyListText}>{LL.PeopleScreen.noContactsYet()}</Text>
      </View>
    )
  }

  const updateMatchingContacts = useCallback(
    (newSearchText: string) => {
      if (newSearchText.length > 0) {
        const searchWordArray = newSearchText
          .split(" ")
          .filter((text) => text.trim().length > 0)
        const matchingContacts = allContacts.filter((contact) =>
          searchWordArray.some((word) => wordMatchesContact(word, contact)),
        )
        setMatchingContacts(matchingContacts)
      } else {
        setMatchingContacts(allContacts)
      }
    },
    [allContacts],
  )

  const willInitiateValidation = React.useCallback(() => {
    if (!bitcoinNetwork || !wallets || !contacts) {
      return false
    }

    dispatchDestinationStateAction({
      type: SendBitcoinActions.SetValidating,
      payload: {},
    })
    return true
  }, [bitcoinNetwork, wallets, contacts])

  const validateDestination = React.useCallback(
    async (rawInput: string) => {
      // extra check for typescript even though these were checked in willInitiateValidation
      if (!bitcoinNetwork || !wallets || !contacts) {
        return
      }

      const destination = await parseDestination({
        rawInput,
        myWalletIds: wallets.map((wallet) => wallet.id),
        bitcoinNetwork,
        lnurlDomains: LNURL_DOMAINS,
        accountDefaultWalletQuery,
      })
      logParseDestinationResult(destination)

      if (destination.valid === false) {
        if (destination.invalidReason === InvalidDestinationReason.SelfPayment) {
          dispatchDestinationStateAction({
            type: SendBitcoinActions.SetUnparsedDestination,
            payload: {
              unparsedDestination: rawInput,
            },
          })
          navigation.navigate("conversionDetails")
          return
        }

        dispatchDestinationStateAction({
          type: SendBitcoinActions.SetInvalid,
          payload: {
            invalidDestination: destination,
            unparsedDestination: rawInput,
          },
        })
        return
      }

      if (
        destination.destinationDirection === DestinationDirection.Send &&
        destination.validDestination.paymentType === PaymentType.Intraledger
      ) {
        if (
          !contacts
            .map((contact) => contact.username.toLowerCase())
            .includes(destination.validDestination.handle.toLowerCase())
        ) {
          dispatchDestinationStateAction({
            type: SendBitcoinActions.SetRequiresUsernameConfirmation,
            payload: {
              validDestination: destination,
              unparsedDestination: rawInput,
              confirmationUsernameType: {
                type: "new-username",
                username: destination.validDestination.handle,
              },
            },
          })
          return
        }
      }
      dispatchDestinationStateAction({
        type: SendBitcoinActions.SetValid,
        payload: {
          validDestination: destination,
          unparsedDestination: rawInput,
        },
      })
    },
    [
      navigation,
      accountDefaultWalletQuery,
      dispatchDestinationStateAction,
      bitcoinNetwork,
      wallets,
      contacts,
    ],
  )

  const handleChangeText = useCallback(
    (newDestination: string) => {
      dispatchDestinationStateAction({
        type: SendBitcoinActions.SetUnparsedDestination,
        payload: { unparsedDestination: newDestination },
      })
      setGoToNextScreenWhenValid(false)
    },
    [dispatchDestinationStateAction, setGoToNextScreenWhenValid],
  )

  useEffect(() => {
    setMatchingContacts(allContacts)
  }, [allContacts])

  useEffect(() => {
    if (
      !goToNextScreenWhenValid ||
      destinationState.destinationState !== DestinationState.Valid
    ) {
      return
    }

    if (
      destinationState?.destination?.destinationDirection === DestinationDirection.Send
    ) {
      // go to send bitcoin details screen
      setGoToNextScreenWhenValid(false)
      navigation.navigate("sendBitcoinDetails", {
        paymentDestination: destinationState.destination,
      })
      return
    }

    if (
      destinationState?.destination?.destinationDirection === DestinationDirection.Receive
    ) {
      // go to redeem bitcoin screen
      setGoToNextScreenWhenValid(false)
      navigation.navigate("redeemBitcoinDetail", {
        receiveDestination: destinationState.destination,
      })
    }
  }, [destinationState, goToNextScreenWhenValid, navigation, setGoToNextScreenWhenValid])

  // setTimeout here allows for the main JS thread to update the UI before the long validateDestination call
  const waitAndValidateDestination = React.useCallback(
    (input: string) => {
      setTimeout(() => validateDestination(input), 0)
    },
    [validateDestination],
  )

  const initiateGoToNextScreen = React.useCallback(async () => {
    if (willInitiateValidation()) {
      setGoToNextScreenWhenValid(true)
      waitAndValidateDestination(destinationState.unparsedDestination)
    }
  }, [
    willInitiateValidation,
    waitAndValidateDestination,
    destinationState.unparsedDestination,
  ])

  useEffect(() => {
    if (route.params?.payment) {
      handleChangeText(route.params?.payment)
    }
  }, [route.params?.payment, handleChangeText])

  useEffect(() => {
    if (route.params?.autoValidate) {
      initiateGoToNextScreen()
    }
  }, [route.params?.autoValidate, initiateGoToNextScreen])

  useEffect(() => {
    // If we scan a QR code encoded with a payment url for a specific user e.g. https://{domain}/{username}
    // then we want to detect the username as the destination
    if (route.params?.username) {
      handleChangeText(route.params?.username)
    }
  }, [route.params?.username, handleChangeText])

  const handlePaste = async () => {
    try {
      const clipboard = await Clipboard.getString()
      dispatchDestinationStateAction({
        type: SendBitcoinActions.SetUnparsedPastedDestination,
        payload: {
          unparsedDestination: clipboard,
        },
      })
      toastShow({
        type: "success",
        message: (translations) =>
          translations.SendBitcoinDestinationScreen.pastedClipboardSuccess(),
        LL,
      })
      if (willInitiateValidation()) {
        waitAndValidateDestination(clipboard)
      }
    } catch (err) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
      }
      toastShow({
        type: "error",
        message: (translations) =>
          translations.SendBitcoinDestinationScreen.clipboardError(),
        LL,
      })
    }
  }

  const inputContainerStyle = React.useMemo(() => {
    switch (destinationState.destinationState) {
      case DestinationState.Validating:
        return styles.enteringInputContainer
      case DestinationState.Invalid:
        return styles.errorInputContainer
      case DestinationState.RequiresUsernameConfirmation:
        return styles.warningInputContainer
      case DestinationState.Valid:
        if (!destinationState.confirmationUsernameType) {
          return styles.validInputContainer
        }
        return styles.warningInputContainer
      default:
        return {}
    }
  }, [
    destinationState.destinationState,
    destinationState.confirmationUsernameType,
    styles,
  ])

  return (
    <Screen
      style={styles.screenStyle}
      keyboardOffset="navigationHeader"
      keyboardShouldPersistTaps="handled"
    >
      <ConfirmDestinationModal
        destinationState={destinationState}
        dispatchDestinationStateAction={dispatchDestinationStateAction}
      />
      <View style={styles.sendBitcoinDestinationContainer}>
        <Text
          {...testProps(LL.SendBitcoinScreen.destination())}
          style={styles.fieldTitleText}
        >
          {LL.SendBitcoinScreen.destination()}
        </Text>

        <View style={[styles.fieldBackground, inputContainerStyle]}>
          <TextInput
            style={styles.input}
            {...testProps(LL.SendBitcoinScreen.placeholder())}
            placeholder={LL.SendBitcoinScreen.placeholder()}
            value={destinationState.unparsedDestination}
            onSubmitEditing={async () =>
              willInitiateValidation() &&
              waitAndValidateDestination(destinationState.unparsedDestination)
            }
            platform="default"
            showLoading={false}
            containerStyle={styles.searchBarContainer}
            inputContainerStyle={styles.searchBarInputContainerStyle}
            inputStyle={styles.searchBarText}
            searchIcon={<></>}
            autoCapitalize="none"
            autoCorrect={false}
            clearIcon={
              <Icon name="close" size={24} onPress={reset} color={styles.icon.color} />
            }
          />
          <TouchableOpacity onPress={() => navigation.navigate("scanningQRCode")}>
            <View style={styles.iconContainer}>
              <ScanIcon fill={colors.primary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePaste}>
            <View style={styles.iconContainer}>
              <Icon name="clipboard-outline" color={colors.primary} size={22} />
            </View>
          </TouchableOpacity>
        </View>
        <DestinationInformation destinationState={destinationState} />
        <FlatList
          style={styles.flatList}
          contentContainerStyle={styles.flatListContainer}
          data={matchingContacts}
          extraData={selectedId}
          ListEmptyComponent={ListEmptyContent}
          renderItem={({ item }) => (
            <ListItem
              key={item.username}
              style={styles.item}
              containerStyle={
                item.id === selectedId ? styles.selectedContainer : styles.itemContainer
              }
              onPress={() => {
                handleSelection(item.id)
                handleChangeText(item.username)
              }}
            >
              <Icon name={"person-outline"} size={24} color={colors.primary} />
              <ListItem.Content>
                <ListItem.Title style={styles.itemText}>{item.username}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          )}
          keyExtractor={(item) => item.username}
        />
        <View style={styles.buttonContainer}>
          <GaloyPrimaryButton
            title={
              destinationState.unparsedDestination
                ? LL.common.next()
                : LL.SendBitcoinScreen.destinationIsRequired()
            }
            loading={destinationState.destinationState === DestinationState.Validating}
            disabled={
              destinationState.destinationState === DestinationState.Invalid ||
              !destinationState.unparsedDestination
            }
            onPress={initiateGoToNextScreen}
          />
        </View>
      </View>
    </Screen>
  )
}

export default SendBitcoinDestinationScreen

const usestyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  sendBitcoinDestinationContainer: {
    flex: 1,
  },
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: colors.grey5,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  enteringInputContainer: {},
  errorInputContainer: {
    borderColor: colors.error,
  },
  validInputContainer: {
    borderColor: colors._green,
  },
  warningInputContainer: {
    borderColor: colors.warning,
  },
  buttonContainer: {
    marginTop: 26,
    flex: 0,
    justifyContent: "flex-end",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    color: colors.black,
  },
  fieldTitleText: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  iconContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarContainer: {
    flex: 1,
    backgroundColor: colors.grey5,
    borderBottomColor: colors.grey5,
    borderTopColor: colors.grey5,
    padding: 0,
  },
  searchBarInputContainerStyle: {
    backgroundColor: colors.grey5,
  },
  searchBarText: {
    color: colors.black,
    textDecorationLine: "none",
  },
  icon: {
    color: colors.primary,
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
  emptyListNoMatching: {
    marginHorizontal: 26,
    marginTop: 8,
  },
  emptyListText: {
    fontSize: 18,
    marginTop: 30,
    textAlign: "center",
    color: colors.black,
  },
  emptyListTitle: {
    color: colors.warning,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  flatList: {
    flex: 1,
  },
  flatListContainer: {
    margin: 0,
  },
  item: {
    marginHorizontal: 32,
    marginBottom: 16,
  },
  itemContainer: {
    borderRadius: 8,
    backgroundColor: colors.grey5,
  },
  selectedContainer: {
    borderRadius: 8,
    backgroundColor: colors.grey3,
  },
  itemText: { color: colors.black },
}))
