import { useAccountScreenQuery } from "@app/graphql/generated"
import { View } from "react-native"
import { Text, makeStyles } from "@rneui/themed"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { useCallback } from "react"
import Clipboard from "@react-native-clipboard/clipboard"
import { toastShow } from "@app/utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"

export const AccountId: React.FC = () => {
  const { data } = useAccountScreenQuery()
  const { LL } = useI18nContext()

  const styles = useStyles()

  const accountId = data?.me?.id || ""
  const last6digitsOfAccountId = accountId?.slice(-6).toUpperCase()

  const xs = "********—****—****—****—****** "

  const copyToClipboard = useCallback(() => {
    Clipboard.setString(accountId)
    toastShow({
      message: (translations) => {
        return translations.AccountScreen.copiedAccountId()
      },
      type: "success",
      currentTranslation: LL,
    })
  }, [LL, accountId])

  return (
    <View>
      <Text style={styles.accountId}>{LL.AccountScreen.yourAccountId()}</Text>
      <View style={styles.wrapper}>
        <Text style={styles.accIdWrapper}>
          <Text style={styles.accIdXs}>{xs}</Text>
          <Text style={styles.accIdText}>{last6digitsOfAccountId}</Text>
        </Text>
        <GaloySecondaryButton
          containerStyle={styles.overrideButton}
          titleStyle={styles.copyButton}
          title={LL.AccountScreen.copy()}
          onPress={copyToClipboard}
        />
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  accountId: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
  },
  wrapper: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  overrideButton: {
    backgroundColor: colors.primary,
    borderRadius: 0,
  },
  copyButton: {
    color: colors.white,
    fontSize: 18,
    marginLeft: -16,
  },
  accIdWrapper: {
    width: "80%",
    textAlign: "center",
  },
  accIdText: {
    fontWeight: "700",
    fontSize: 18,
  },
  accIdXs: {
    fontSize: 12,
    color: colors.grey3,
  },
}))
