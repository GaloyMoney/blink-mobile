import { gql, useMutation, useQuery } from "@apollo/client"
import * as React from "react"
import { ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { MAIN_QUERY } from "../../graphql/query"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"
import useToken from "../../utils/use-token"

const styles = EStyleSheet.create({
  screenStyle: {
    marginHorizontal: 48,
  },
})

export const LANGUAGES = {
  "DEFAULT": "Default (OS)",
  "en-US": "English",
  "es-SV": "Español",
} as const

export const LanguageScreen: ScreenType = () => {
  const { tokenUid, hasToken } = useToken()
  const { data } = useQuery(MAIN_QUERY, {
    variables: { hasToken },
    fetchPolicy: "cache-only",
  })

  const currentLanguage = data?.me?.language ?? "DEFAULT"

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
      refetchQueries: ["mainQuery"],
    },
  )

  const list = ["DEFAULT", "en-US", "es-SV"]

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
      {list.map((language) => (
        <ListItem
          key={language}
          bottomDivider
          onPress={() =>
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
        >
          <ListItem.Title>{LANGUAGES[language]}</ListItem.Title>
          {currentLanguage === language && (
            <Icon name="ios-checkmark-circle" size={18} color={palette.green} />
          )}
        </ListItem>
      ))}
    </Screen>
  )
}
