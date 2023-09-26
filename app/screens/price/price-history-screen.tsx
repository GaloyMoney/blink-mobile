import { makeStyles } from "@rneui/themed"
import * as React from "react"
import { PriceHistory } from "../../components/price-history"
import { Screen } from "../../components/screen"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { usePriceHistoryScreenQuery } from "@app/graphql/generated"
import { gql } from "@apollo/client"
import { useLevel } from "@app/graphql/level-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { isIos } from "@app/utils/helper"

const useStyles = makeStyles((_theme) => ({
  screen: { flex: 1 },
  button: { margin: 20 },
}))

gql`
  query priceHistoryScreen {
    me {
      id
      defaultAccount {
        id
      }
    }
  }
`

export const PriceHistoryScreen: React.FC = () => {
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, "Primary">>()
  const { LL } = useI18nContext()

  const { data } = usePriceHistoryScreenQuery()
  const accountId = data?.me?.defaultAccount?.id

  const { isAtLeastLevelTwo } = useLevel()

  const [urlWebView, setUrlWebView] = React.useState("https://fiat.blink.sv")
  React.useEffect(() => {
    setUrlWebView(`https://fiat.blink.sv?accountId=${accountId}`)
  }, [accountId])

  const styles = useStyles()
  return (
    <Screen preset="scroll" style={styles.screen}>
      <PriceHistory />
      {(isAtLeastLevelTwo || !isIos) && (
        <GaloyPrimaryButton
          title={LL.PriceHistoryScreen.buyAndSell()}
          onPress={() =>
            navigate("webView", {
              url: urlWebView,
              initialTitle: LL.PriceHistoryScreen.buyAndSell(),
            })
          }
          containerStyle={styles.button}
        />
      )}
    </Screen>
  )
}
