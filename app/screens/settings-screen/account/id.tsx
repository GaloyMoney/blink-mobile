import { useCallback } from "react"
import { View } from "react-native"
import { Skeleton, Text, makeStyles } from "@rneui/themed"

import { gql } from "@apollo/client"
import { useAccountIdQuery } from "@app/graphql/generated"

import { useI18nContext } from "@app/i18n/i18n-react"

import Clipboard from "@react-native-clipboard/clipboard"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { toastShow } from "@app/utils/toast"

gql`
  query AccountId {
    me {
      defaultAccount {
        id
      }
    }
  }
`

export const AccountId: React.FC = () => {
  const { data, loading } = useAccountIdQuery()
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
    <View>
      <Text type="p2" bold>
        {LL.AccountScreen.accountId()}
      </Text>
      {loading ? (
        <Skeleton style={styles.wrapper} />
      ) : (
        <View style={[styles.wrapper, styles.spacing]}>
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
      )}
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  circle: {
    height: 4,
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.black,
  },
  spacing: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  wrapper: {
    marginTop: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.grey5,
    borderRadius: 10,
    marginBottom: 10,
    height: 48,
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
