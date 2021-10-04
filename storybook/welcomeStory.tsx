import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen } from "../storybook/views"
import {reactNavigationDecorator} from "../storybook/storybook-navigator";
import {Screen} from "../app/components/screen";
import {palette} from "../app/theme/palette";
import {translate} from "../app/i18n";
import {Image, Text} from "react-native";
import {styles} from "../app/screens/welcome-screens/welcome-screens";
import BitcoinBeachLogo from "../app/screens/get-started-screen/bitcoinBeach3.png";

declare let module


storiesOf("Bitcoin Beach Storybook", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
  .add("Home", () => (
       <Screen backgroundColor={palette.lightBlue} statusBar="light-content">
        <Image style={{
              marginTop: 24,
              maxHeight: "50%",
              maxWidth: "50%",
              marginLeft: 100
              }}
               source={BitcoinBeachLogo} resizeMode="contain" />
        <Text style={styles.text}>{translate("storybook.welcome")}</Text>
    </Screen>
  ))
