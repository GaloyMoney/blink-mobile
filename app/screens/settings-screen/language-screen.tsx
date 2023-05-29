import { gql } from "@apollo/client"
import { useLanguageQuery, useUserUpdateLanguageMutation } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { LocaleToTranslateLanguageSelector } from "@app/i18n/mapping"
import { getLanguageFromString, Languages } from "@app/utils/locale-detector"
import { ListItem, makeStyles, useTheme } from "@rneui/themed"
import * as React from "react"
import { ActivityIndicator, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { testProps } from "../../utils/testProps"

const useStyles = makeStyles(({ colors }) => ({
  viewSelectedIcon: { width: 18 },
  container: { backgroundColor: colors.white },
  text: { color: colors.black },
}))

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
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
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
            containerStyle={styles.container}
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
                  <Icon name="ios-checkmark-circle" size={18} color={colors.green} />
                ))}
            </View>
            <ListItem.Title {...testProps(languageTranslated)} style={styles.text}>
              {languageTranslated}
            </ListItem.Title>
          </ListItem>
        )
      })}
    </Screen>
  )
}
