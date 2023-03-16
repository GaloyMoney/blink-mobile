import * as React from "react"
import { ListItem } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useLanguageQuery, useUserUpdateLanguageMutation } from "@app/graphql/generated"
import { testProps } from "../../utils/testProps"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getLanguageFromString, Languages } from "@app/utils/locale-detector"
import { LocaleToTranslateLanguageSelector } from "@app/i18n/mapping"
import { ActivityIndicator, View } from "react-native"
import { useDarkMode } from "@app/hooks/use-darkmode"

const styles = EStyleSheet.create({
  viewSelectedIcon: { width: 18 },

  containerLight: { backgroundColor: palette.white },
  containerDark: { backgroundColor: palette.black },

  textLight: {
    color: palette.darkGrey,
  },

  textDark: {
    color: palette.white,
  },
})

gql`
  query language {
    me {
      id
      language
    }
  }

  mutation userUpdateLanguage($input: UserUpdateLanguageInput!) {
    userUpdateLanguage(input: $input) {
      errors {
        message
      }
      user {
        id
        language
      }
    }
  }
`

export const LanguageScreen: React.FC = () => {
  const darkMode = useDarkMode()
  const isAuthed = useIsAuthed()

  const { data } = useLanguageQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  const languageFromServer = getLanguageFromString(data?.me?.language)

  const [updateLanguage, { loading }] = useUserUpdateLanguageMutation()
  const { LL } = useI18nContext()

  const [newLanguage, setNewLanguage] = React.useState("")

  return (
    <Screen preset="scroll">
      {Languages.map((language) => {
        let languageTranslated: string
        if (language === "DEFAULT") {
          languageTranslated = LL.Languages[language]()
        } else {
          languageTranslated = LocaleToTranslateLanguageSelector[language]
        }

        return (
          <ListItem
            key={language}
            bottomDivider
            containerStyle={darkMode ? styles.containerDark : styles.containerLight}
            onPress={() => {
              if (language !== languageFromServer) {
                setNewLanguage(language)
                updateLanguage({
                  variables: { input: { language } },
                })
              }
            }}
          >
            <View style={styles.viewSelectedIcon}>
              {(newLanguage === language && loading && <ActivityIndicator />) ||
                (languageFromServer === language && !loading && (
                  <Icon name="ios-checkmark-circle" size={18} color={palette.green} />
                ))}
            </View>
            <ListItem.Title
              {...testProps(languageTranslated)}
              style={darkMode ? styles.textDark : styles.textLight}
            >
              {languageTranslated}
            </ListItem.Title>
          </ListItem>
        )
      })}
    </Screen>
  )
}
