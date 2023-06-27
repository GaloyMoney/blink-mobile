import * as React from "react"
import Modal from "react-native-modal"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { View, TextInput } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import { useI18nContext } from "@app/i18n/i18n-react"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { testProps } from "../../utils/testProps"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

export const SuggestAnImprovement: React.FC<{
  navigation: StackNavigationProp<RootStackParamList>
  showImprovement: boolean
  setShowImprovement: (value: boolean) => void
}> = ({ navigation, showImprovement, setShowImprovement }) => {
  const { LL } = useI18nContext()
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const [improvement, setImprovement] = React.useState("")

  const submitImprovement = async () => {
    navigation.popToTop()
    setShowImprovement(false)
    // code for posting user feedbacks to mattermost feedback channel
    // await fetch("https://chat.galoy.io/api/v4/posts", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `bearer personal_access_token`,
    //   },
    //   body: JSON.stringify({
    //     // eslint-disable-next-line camelcase
    //     channel_id: "n59hg9abetdrtygof11kncjbdw",
    //     message: improvement,
    //   }),
    // }).then(() => {
    //   setshowImprovement(false)
    //   navigation.popToTop()
    // })
  }

  const dismissSuggestionModal = () => {
    navigation.popToTop()
    setShowImprovement(false)
  }

  return (
    <Modal
      isVisible={showImprovement}
      onBackdropPress={dismissSuggestionModal}
      backdropOpacity={0.3}
      backdropColor={colors.grey3}
    >
      <View style={styles.view}>
        <Text type="h2" {...testProps(LL.support.thankyouText())}>
          {LL.support.thankyouText()}
        </Text>
        <View style={styles.field}>
          <TextInput
            {...testProps(LL.SendBitcoinScreen.suggestionInput())}
            style={styles.noteInput}
            onChangeText={(improvement: React.SetStateAction<string>) =>
              setImprovement(improvement)
            }
            placeholder={LL.SendBitcoinScreen.suggestionInput()}
            placeholderTextColor={colors.grey2}
            value={improvement}
            multiline={true}
            numberOfLines={3}
            autoFocus
          />
        </View>
        <GaloySecondaryButton
          {...testProps(LL.common.submit())}
          title={LL.common.submit()}
          onPress={submitImprovement}
        />
      </View>
    </Modal>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  view: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
  },
  noteInput: {
    color: colors.black,
  },
  field: {
    padding: 10,
    marginTop: 10,
    backgroundColor: colors.grey5,
    borderRadius: 10,
    marginBottom: 12,
  },
}))
