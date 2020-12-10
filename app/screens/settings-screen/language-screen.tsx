import { observer } from "mobx-react"
import * as React from "react"
import { ListItem } from "react-native-elements"
import EStyleSheet from 'react-native-extended-stylesheet'
import { Screen } from "../../components/screen"
import { StoreContext } from "../../models"
import { palette } from "../../theme/palette"
import Icon from "react-native-vector-icons/Ionicons"

const styles = EStyleSheet.create({
  screenStyle: {
    marginHorizontal: 48,
    // marginVertical: 24,
  },

  text: {
    fontSize: "16rem",
    paddingVertical: "18rem",
    textAlign: "center",
  },
})

export const language_mapping = {
  null: 'Default (OS)',
  'en': 'English',
  'es': 'Español'
}

export const LanguageScreen = observer(({navigation}) => {
  const store = React.useContext(StoreContext)

  const list = [null, 'en', 'es']

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
    {
      list.map((l, i) => (
        <ListItem key={i} bottomDivider  onPress={() => store.setLanguage({language: l})}>
            <ListItem.Title>{language_mapping[l]}</ListItem.Title>
            {store.user.language === l && <Icon name="ios-checkmark-circle" size={18} color={palette.green} />}
        </ListItem>
      ))
    }
    </Screen>
)})