import { useAccountScreenQuery } from "@app/graphql/generated"
import { View } from "react-native"
import { Text, makeStyles } from "@rneui/themed"
import { useCallback } from "react"
import Clipboard from "@react-native-clipboard/clipboard"
import { toastShow } from "@app/utils/toast"
import { useI18nContext } from "@app/i18n/i18n-react"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"

export const AccountId: React.FC = () => {
  const { data } = useAccountScreenQuery()
  const { LL } = useI18nContext()

  const styles = useStyles()

  const accountId = data?.me?.defaultAccount?.id || ""
  const last6digitsOfAccountId = accountId?.slice(-6).toUpperCase()

  const copyToClipboard = useCallback(() => {
    Clipboard.setString(accountId)
    toastShow({
      message: (translations) => {
        return translations.AccountScreen.copiedAccountId()
      },
      type: "success",
      LL,
    })
  }, [LL, accountId])

  return (
    <View style={styles.accountId}>
      <Text type="p2">{LL.AccountScreen.yourAccountId()}</Text>
      <View style={styles.wrapper}>
        <View style={styles.accIdWrapper}>
          <View style={styles.accIdXs}>
            {Array(20)
              .fill(null)
              .map((_, i) => (
                <View style={styles.circle} key={i} />
              ))}
          </View>
          <Text type="p3" style={styles.accIdText}>
            {last6digitsOfAccountId}
          </Text>
        </View>
        <GaloyIconButton
          name="copy-paste"
          size="medium"
          iconOnly
          onPress={copyToClipboard}
        />
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  accountId: {
    margin: 20,
  },
  circle: {
    height: 4,
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.black,
  },
  wrapper: {
    marginTop: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.grey5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  accIdWrapper: {
    display: "flex",
    flexDirection: "row",
    columnGap: 3,
  },
  accIdText: {},
  accIdXs: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 3,
  },
}))
