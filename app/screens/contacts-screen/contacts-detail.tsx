import * as React from "react"
import { View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

import { gql } from "@apollo/client"
import { useUserContactUpdateAliasMutation, WalletCurrency } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Input, Text } from "@rneui/base"

import { testProps } from "../../utils/testProps"
import { CloseCross } from "../../components/close-cross"
import { IconTransaction } from "../../components/icon-transactions"
import { LargeButton } from "../../components/large-button"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import { ContactTransactions } from "./contact-transactions"

import type {
  ContactStackParamList,
  RootStackParamList,
} from "../../navigation/stack-param-lists"
import { makeStyles } from "@rneui/themed"
const useStyles = makeStyles((theme) => ({
  actionsContainer: {
    marginBottom: 15,
    backgroundColor: theme.colors.lighterGreyOrBlack,
  },

  amount: {
    color: palette.white,
    fontSize: 36,
  },

  amountSecondary: {
    color: palette.white,
    fontSize: 16,
  },

  amountView: {
    alignItems: "center",
    paddingBottom: 6,
    backgroundColor: palette.coolGrey,
    paddingTop: 40,
  },

  contactBodyContainer: {
    flex: 1,
  },

  icon: { margin: 0 },

  inputContainer: {
    flexDirection: "row",
  },

  inputStyle: { textAlign: "center", textDecorationLine: "underline" },

  screenTitle: {
    fontSize: 18,
    marginBottom: 12,
    marginTop: 18,
    color: theme.colors.darkGreyOrWhite,
  },

  transactionsView: {
    flex: 1,
    marginHorizontal: 30,
  },
}))

type ContactDetailProps = {
  route: RouteProp<ContactStackParamList, "contactDetail">
}

export const ContactsDetailScreen: React.FC<ContactDetailProps> = ({ route }) => {
  const { contact } = route.params
  return <ContactsDetailScreenJSX contact={contact} />
}

type ContactDetailScreenProps = {
  contact: Contact
}

gql`
  mutation userContactUpdateAlias($input: UserContactUpdateAliasInput!) {
    userContactUpdateAlias(input: $input) {
      errors {
        message
      }
      contact {
        alias
        id
      }
    }
  }
`

export const ContactsDetailScreenJSX: React.FC<ContactDetailScreenProps> = ({
  contact,
}) => {
  const styles = useStyles()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "transactionHistory">>()

  const [contactName, setContactName] = React.useState(contact.alias)
  const { LL } = useI18nContext()

  // TODO: feature seems broken. need to fix.
  const [userContactUpdateAlias] = useUserContactUpdateAliasMutation({})

  const updateName = async () => {
    // TODO: need optimistic updates
    // FIXME this one doesn't work
    if (contactName) {
      await userContactUpdateAlias({
        variables: { input: { username: contact.username, alias: contactName } },
      })
    }
  }

  return (
    <Screen unsafe>
      <View style={styles.amountView}>
        <Icon
          {...testProps("contact-detail-icon")}
          name="ios-person-outline"
          size={86}
          color={palette.white}
          style={styles.icon}
        />
        <View style={styles.inputContainer}>
          <Input
            style={styles.amount}
            inputStyle={styles.inputStyle}
            inputContainerStyle={{ borderColor: palette.coolGrey }}
            onChangeText={setContactName}
            onSubmitEditing={updateName}
            onBlur={updateName}
            returnKeyType="done"
          >
            {contact.alias}
          </Input>
        </View>
        <Text style={styles.amountSecondary}>{`${LL.common.username()}: ${
          contact.username
        }`}</Text>
      </View>
      <View style={styles.contactBodyContainer}>
        <View style={styles.transactionsView}>
          <Text style={styles.screenTitle}>
            {LL.ContactDetailsScreen.title({
              username: contact.alias || contact.username,
            })}
          </Text>
          <ContactTransactions contactUsername={contact.username} />
        </View>
        <View style={styles.actionsContainer}>
          <LargeButton
            title={LL.HomeScreen.send()}
            icon={
              <IconTransaction
                isReceive={false}
                walletCurrency={WalletCurrency.Btc}
                pending={false}
                onChain={false}
              />
            }
            onPress={() =>
              navigation.navigate("sendBitcoinDestination", {
                username: contact.username,
              })
            }
          />
        </View>
      </View>

      <CloseCross color={palette.white} onPress={navigation.goBack} />
    </Screen>
  )
}
