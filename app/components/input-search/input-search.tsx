import * as React from "react"
import { View } from "react-native"
import { Input } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { translate } from "../../i18n"

const styles = EStyleSheet.create({

  container: {
    alignItems: "center",
    marginHorizontal: 26,
    marginVertical: 8
  }

})

export const InputSearch = ({
  onUpdateText,
}) => {


  return (
    <View 
      style={styles.container}>
      <Input
        placeholder={translate("common.search")}
        onChangeText={value => onUpdateText(value)}
      >
      </Input>
    </View>
  )
}