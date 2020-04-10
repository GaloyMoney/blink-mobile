import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { Story, StoryScreen } from "../../../storybook/views";
import { BankAccountRewardsScreen } from "./bank-onboarding-screen";


declare let module


storiesOf("BankOnboarding", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <BankAccountRewardsScreen />  
    </Story>
))
