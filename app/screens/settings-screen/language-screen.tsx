import { gql, useMutation, useQuery } from "@apollo/client"
import { translate } from "../../i18n"
import * as React from "react"
import { ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { MAIN_QUERY } from "../../graphql/query"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"
import useToken from "../../utils/use-token"
import { cacheIdVar } from "../../graphql/client-only-query"

const styles = EStyleSheet.create({
  screenStyle: {
    marginHorizontal: 48,
  },
})

export const LanguageScreen: ScreenType = () => {
  const { tokenUid, hasToken } = useToken()
  const { data } = useQuery(MAIN_QUERY, {
    variables: { hasToken },
    fetchPolicy: "cache-only",
  })

  const currentLanguage = data?.me?.language

  const [updateLanguage] = useMutation(
    gql`
      mutation updateLanguage($language: Language!) {
        userUpdateLanguage(input: { language: $language }) {
          errors {
            message
          }
          user {
            id
            language
          }
        }
      }
    `,
    {
      onCompleted: () => cacheIdVar(Date.now()),
    },
  )

  const list = ["DEFAULT", "en-US", "es-SV"]

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
      {list.map((language) => (
        <ListItem
          key={language}
          bottomDivider
          onPress={() => {
            if (language !== currentLanguage) {
              updateLanguage({
                variables: { language },
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
          {currentLanguage === language && (
            <Icon name="ios-checkmark-circle" size={18} color={palette.green} />
          )}
        </ListItem>
      ))}
    </Screen>
  )
}
