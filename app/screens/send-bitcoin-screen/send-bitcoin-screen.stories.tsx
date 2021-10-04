import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { StoryScreen } from "../../../storybook/views"
import { SendBitcoinScreenJSX } from "./send-bitcoin-screen"
import {reactNavigationDecorator} from "../../../storybook/storybook-navigator";
import { withKnobs, select, number, text} from "@storybook/addon-knobs";


const noop = () => null
const defaultParams = {
  setStatus: noop,
  setAmount: noop,
  goBack: noop,
  setMemo: noop,
  pay: noop,
  price: 10000,
  prefCurrency: "BTC",
  nextPrefCurrency: noop,
  invoice:
    "lnbc1p0kxle6pp5f936pgsmu7qjk0tph7uw8v9vhqlq3k37k3w6tulhy3rkf9ecqqcsdqu2askcmr9wssx7e3q2dshgmmndp5scqzpgxqyz5vqsp5z2hre6tcqrs67emaqvlewhf8klzm7hx5ly3scs7lkd4xlrgp52gs9qy9qsq0k704xkrj82sueam0zthx95luwdpeg60307x48gq3mrrwdnz6g0y2vpluy5z8keep463gdenrfy23f23mayhevs27ffjvu5nh0napacqjdeesl",
  address: "bcrt1qttw6a49hcayl0nx0xm7yur4pw9szftaanxpmd5",
  destination: "test",
}

declare let module

storiesOf("Send bitcoin Screen", module)
  .addDecorator(withKnobs)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
    .addDecorator(reactNavigationDecorator)
  .add("Send Bitcoin - Dynamic", () => (
    <SendBitcoinScreenJSX
      status={ select("status", ["loading", "idle", "success"], "loading") }
      paymentType="lightning"
      amountless={false}
      initAmount={number("initAmount", 1000)}
      note={text("note", "")}
      err={text("err", "")}
      amount={number("amount", 1000)}
      primaryAmount={{
        value: number("value", 1000),
        currency: select("currency", ["USD", "BTC"], "BTC"),
      }}
      secondaryAmount={{
        value: number("value", 1000),
        currency: select("currency", ["USD", "BTC"], "USD"),
      }}
      {...defaultParams}
    />
  ))
