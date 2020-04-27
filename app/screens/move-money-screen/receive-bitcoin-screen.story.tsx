import { withKnobs } from "@storybook/addon-knobs";
import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { Story, StoryScreen, UseCase } from "../../../storybook/views";
import { ShowQRCode } from "./receive-bitcoin-screen";


declare let module

const route = { params : {
  // invoice: string('invoice', "abc")
  invoice: "lnbc1233210n1p02wmpypp5myhm36lafcujyd4uen6zpsc6gd52m8pq9550hcre89c24dzrpd7qdq8w35hg6gcqzpgsp5l6n28v9u7mtla205cnat5q40ffsgsxdgps0dkrydpfgkqwwd6z2s9qy9qsqss9fy5l5suekseqauk06qk4vpdrk6zp8qzfts4zmcha8jmzalx7zz2khd8z5jgegrqy2yjknlz348kdy6vv3m6auxc4adgd6lqw9p3sqrulmpt",
  amount: 123123
}}

storiesOf("Receive Bitcoin QRCode", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Dollar" usage="The primary.">
        <ShowQRCode
          route={route}
        />
      </UseCase>
    </Story>
  ))
