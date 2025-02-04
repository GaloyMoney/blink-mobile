import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { ApolloError } from "@apollo/client"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { listRefundables, RefundableSwap } from "@breeztech/react-native-breez-sdk-liquid"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"

// components
import { GaloyIcon } from "../atomic/galoy-icon"
import { GaloyErrorBox } from "../atomic/galoy-error-box"
import { GaloyTertiaryButton } from "../atomic/galoy-tertiary-button"

// gql
import { GraphQLError } from "graphql"
import { GraphQlApplicationError } from "@app/graphql/generated"
import { getErrorMessages } from "@app/graphql/utils"

type ErrorInput =
  | readonly GraphQLError[]
  | readonly GraphQlApplicationError[]
  | ApolloError

type Props = {
  error?: ErrorInput
}

const Info: React.FC<Props> = ({ error }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const styles = useStyles()
  const { colors, mode } = useTheme().theme
  const { LL } = useI18nContext()

  const [refundables, setRefundables] = useState<RefundableSwap[]>([])

  const color = mode === "light" ? colors.warning : colors.black

  useEffect(() => {
    fetchRefundables()
  }, [])

  const fetchRefundables = async () => {
    try {
      const refundables = (await listRefundables()) || []
      setRefundables(refundables)
    } catch (err) {
      console.log("List Refundables Err: ", err)
    }
  }

  if (error || refundables.length > 0) {
    return (
      <View style={styles.marginButtonContainer}>
        {refundables.length > 0 && (
          <View
            style={error ? { ...styles.container, marginBottom: 5 } : styles.container}
          >
            <GaloyIcon name="warning" size={14} color={color} />
            <Text style={styles.textContainer} type={"p3"} color={color}>
              {`${LL.HomeScreen.refundableWarning()} `}
              <GaloyTertiaryButton
                clear
                title={LL.HomeScreen.refundables()}
                onPress={() => navigation.navigate("RefundTransactionList")}
                containerStyle={{ marginTop: -4 }}
              />
            </Text>
          </View>
        )}
        {error && <GaloyErrorBox errorMessage={getErrorMessages(error)} />}
      </View>
    )
  } else {
    return null
  }
}

export default Info

const useStyles = makeStyles(({ colors }) => ({
  marginButtonContainer: {
    marginBottom: 20,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.warning9,
  },
  textContainer: {
    overflow: "hidden",
    marginLeft: 4,
    flex: 1,
  },
}))
