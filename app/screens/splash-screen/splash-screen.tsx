import * as React from "react"

import { View, ActivityIndicator } from "react-native";
import { VersionComponent } from "../../components/version";
import { color } from "../../theme";
import { StyleSheet } from "react-native"
import { palette } from "../../theme/palette";

const styles = StyleSheet.create({
    centerBackground: {
      backgroundColor: color.background,
      flex: 1,
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "space-around",
    },
  })
  
export const SplashScreen = ({lndVersion}) => (
    <View style={styles.centerBackground}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color={palette.lightGrey} />
        <VersionComponent style={{ paddingVertical: 30 }} lndVersion={lndVersion} />
    </View>
)