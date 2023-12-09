import React, { useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { ActivityIndicator, TouchableWithoutFeedback, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "@app/components/screen"
import { gql } from "@apollo/client"
import ScanIcon from "@app/assets/icons/scan.svg"
import {
  useAccountDefaultWalletLazyQuery,
  useRealtimePriceQuery,
  useSendBitcoinDestinationQuery,
  useContactsQuery,
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

  query contacts {
    me {
      id
      contacts {
        id
        username
        alias
        transactionsCount
      }
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

  const { data } = useSendBitcoinDestinationQuery({
    fetchPolicy: "cache-and-network",
    returnPartialData: true,
    skip: !isAuthed,
  })

  // forcing price refresh
  useRealtimePriceQuery({
    fetchPolicy: "network-only",
    skip: !isAuthed,
  })

  const wallets = data?.me?.defaultAccount.wallets
  const bitcoinNetwork = data?.globals?.network
  const contacts = useMemo(() => data?.me?.contacts ?? [], [data?.me?.contacts])

  const { LL } = useI18nContext()
  const [accountDefaultWalletQuery] = useAccountDefaultWalletLazyQuery({
    fetchPolicy: "no-cache",
  })

  const {
    loading,
    data: contactsData,
    error,
  } = useContactsQuery({
    skip: !isAuthed,
    fetchPolicy: "cache-and-network",
  })

  if (error) {
    toastShow({ message: error.message, LL })
  }

  const [matchingContacts, setMatchingContacts] = useState<Contact[]>([])
  const allContacts: Contact[] = useMemo(() => {
    const contactsCopy = contactsData?.me?.contacts.slice() ?? []
    const compareUsernames = (a: Contact, b: Contact) => {
      return a.username.toLocaleLowerCase().localeCompare(b.username.toLocaleLowerCase())
    }
    contactsCopy.sort(compareUsernames)

    return contactsCopy
  }, [contactsData])

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

    if (contact.alias) {
      contactPrettyNameMatchesSearchWord = contact.alias
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

  const validateDestination = useMemo(() => {
    if (!bitcoinNetwork || !wallets || !contacts) {
      return null
    }

    return async (rawInput: string) => {
      if (destinationState.destinationState !== "entering") {
        return
      }

      dispatchDestinationStateAction({
        type: SendBitcoinActions.SetValidating,
        payload: {
          unparsedDestination: rawInput,
        },
      })

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
    }
  }, [
    bitcoinNetwork,
    wallets,
    contacts,
    destinationState.destinationState,
    accountDefaultWalletQuery,
    dispatchDestinationStateAction,
    navigation,
  ])

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

    if (destinationState.destination.destinationDirection === DestinationDirection.Send) {
      // go to send bitcoin details screen
      setGoToNextScreenWhenValid(false)
      navigation.navigate("sendBitcoinDetails", {
        paymentDestination: destinationState.destination,
      })
      return
    }

    if (
      destinationState.destination.destinationDirection === DestinationDirection.Receive
    ) {
      // go to redeem bitcoin screen
      setGoToNextScreenWhenValid(false)
      navigation.navigate("redeemBitcoinDetail", {
        receiveDestination: destinationState.destination,
      })
    }
  }, [destinationState, goToNextScreenWhenValid, navigation, setGoToNextScreenWhenValid])

  const initiateGoToNextScreen = useMemo(() => {
    return async () => {
      if (validateDestination) {
        await validateDestination(destinationState.unparsedDestination)
        setGoToNextScreenWhenValid(true)
      }
    }
  }, [validateDestination, destinationState.unparsedDestination])

  useEffect(() => {
    if (route.params?.payment) {
      handleChangeText(route.params?.payment)
    }
  }, [route.params?.payment, handleChangeText])

  useEffect(() => {
    if (route.params?.autoValidate) {
      initiateGoToNextScreen && initiateGoToNextScreen()
    }
  }, [route.params?.autoValidate, initiateGoToNextScreen])

  useEffect(() => {
    // If we scan a QR code encoded with a payment url for a specific user e.g. https://{domain}/{username}
    // then we want to detect the username as the destination
    if (route.params?.username) {
      handleChangeText(route.params?.username)
    }
  }, [route.params?.username, handleChangeText])

  let inputContainerStyle
  switch (destinationState.destinationState) {
    case "entering":
    case "validating":
      inputContainerStyle = styles.enteringInputContainer
      break
    case "invalid":
      inputContainerStyle = styles.errorInputContainer
      break
    case "valid":
      if (!destinationState.confirmationUsernameType) {
        inputContainerStyle = styles.validInputContainer
        break
      }
      inputContainerStyle = styles.warningInputContainer
      break
    case "requires-destination-confirmation":
      inputContainerStyle = styles.warningInputContainer
  }

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
          <SearchBar
            {...testProps(LL.SendBitcoinScreen.placeholder())}
            placeholder={LL.SendBitcoinScreen.placeholder()}
            value={destinationState.unparsedDestination}
            onChangeText={(text) => {
              handleChangeText(text)
              updateMatchingContacts(text)
            }}
            onSubmitEditing={() =>
              validateDestination &&
              validateDestination(destinationState.unparsedDestination)
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
          <TouchableWithoutFeedback onPress={() => navigation.navigate("scanningQRCode")}>
            <View style={styles.iconContainer}>
              <ScanIcon fill={colors.primary} />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={async () => {
              try {
                const clipboard = await Clipboard.getString()
                dispatchDestinationStateAction({
                  type: SendBitcoinActions.SetUnparsedDestination,
                  payload: {
                    unparsedDestination: clipboard,
                  },
                })
                validateDestination && (await validateDestination(clipboard))
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
            }}
          >
            <View style={styles.iconContainer}>
              {/* we could Paste from "FontAwesome" but as svg*/}
              <Icon name="clipboard-outline" color={colors.primary} size={22} />
            </View>
          </TouchableWithoutFeedback>
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
                <ListItem.Title style={styles.itemText}>{item.alias}</ListItem.Title>
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
            loading={destinationState.destinationState === "validating"}
            disabled={
              destinationState.destinationState === "invalid" ||
              !destinationState.unparsedDestination ||
              !initiateGoToNextScreen
            }
            onPress={initiateGoToNextScreen || undefined}
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
    marginBottom: 26,
  },
  enteringInputContainer: {},
  errorInputContainer: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  validInputContainer: {
    borderColor: colors.green,
    borderWidth: 1,
  },
  warningInputContainer: {
    borderColor: colors.warning,
    borderWidth: 1,
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
