import { useMutation } from "@galoymoney/client"
import * as React from "react"
import { ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"
import useToken from "../../hooks/use-token"
import useMainQuery from "@app/hooks/use-main-query"
import { translate } from "@app/utils/translate"

const styles = EStyleSheet.create({
  screenStyle: {
    marginHorizontal: 48,
  },
})

export const LanguageScreen: ScreenType = () => {
  const { tokenUid } = useToken()
  const { userPreferredLanguage, refetch: refetchMain } = useMainQuery()
  const [updateLanguage] = useMutation.userUpdateLanguage({
    onCompleted: () => refetchMain(),
  })

  const list = ["DEFAULT", "en-US", "es-SV", "pt-BR", "fr-CA"]

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
      {list.map((language) => (
        <ListItem
          key={language}
          bottomDivider
          onPress={() => {
            if (language !== userPreferredLanguage) {
              updateLanguage({
                variables: { input: { language } },
                optimisticResponse: {
                  __typename: "Mutation",
                  userUpdateLanguage: {
                    __typename: "UserUpdateLanguagePayload",
                    errors: [],
                    user: {
                      __typename: "User",
                      id: tokenUid,
                      language,
                    },
                  },
                },
              })
            }
          }}
        >
          <ListItem.Title>{translate(`Languages.${language}`)}</ListItem.Title>
          {userPreferredLanguage === language && (
            <Icon name="ios-checkmark-circle" size={18} color={palette.green} />
          )}
        </ListItem>
      ))}
    </Screen>
  )
}
