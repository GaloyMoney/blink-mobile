import * as React from "react"
import { View, Text } from "react-native";
import Montain from "./mointains-cloud-01.svg"
import EStyleSheet from "react-native-extended-stylesheet";
import { translate } from "../../i18n"
import { palette } from "../../theme/palette";

const styles = EStyleSheet.create({
  mountainView: {
    alignItems: "center",
  },

  topView: {
    marginTop: "80rem",
  },

  headerSection: { color: palette.white,
    fontSize: "16rem",
    paddingTop: "18rem"
  },

  titleSection: { color: palette.white, 
    fontWeight: "bold",
    fontSize: "24rem",
    paddingTop: "6rem"
  },
})

export const MountainHeader = ({amount, color}) => (
<View style={{backgroundColor: color}}>
  <View style={[styles.topView]}>
    <View style={{alignItems: "center", paddingBottom: 16}}>
      <Text style={styles.headerSection}>{translate("EarnScreen.youEarned")}</Text>
      <Text style={styles.titleSection}>{amount} sats</Text>
    </View>
  </View>
  <View style={[styles.mountainView]}>
    <Montain />
  </View>
</View>)