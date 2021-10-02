import React from 'react'
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { BalanceHeader } from "./balance-header"
import {reactNavigationDecorator} from "../../../storybook/storybook-navigator";
import { MockedProvider } from '@apollo/react-testing';
import EStyleSheet from "react-native-extended-stylesheet";
import {HIDE_BALANCE} from "./../../graphql/client-only-query";


const storyStyle = EStyleSheet.create({
    header: {
    alignItems: "center",
    marginBottom: "12rem",
    marginTop: "32rem",
    minHeight: "75rem",
    width:"200rem"
  },
});

const mocks = [
  {
    request: {
      query: HIDE_BALANCE,
    },
    result: {
      data: {
        HideBalance: { hideBalance: true },
      },
    },
  },
]

storiesOf("BalanceHeader", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .addDecorator(reactNavigationDecorator)
  .add("No Currency Amount", () => (
    <Story>
      <UseCase text="Dollar" usage="Loading">
          <BalanceHeader currency={"USD"} amount={NaN} style={storyStyle.header}/>
      </UseCase>
    </Story>))
   .add("No currency but not null",() => (
    <Story>
       <UseCase text="Dollar" usage="0 (to separate with null)">
           <MockedProvider mocks={mocks}>
            <BalanceHeader currency={"USD"} amount={0} style={storyStyle.header}/>
           </MockedProvider>
      </UseCase>
    </Story>))
  .add("$100", () => (
    <Story>
        <UseCase text="Dollar" usage="The primary.">
            <BalanceHeader currency={"USD"} amount={100} style={storyStyle.header}/>
        </UseCase>
    </Story>))
  .add("10000 sats", () => (
      <Story>
          <UseCase text="Sat" usage="The secondary.">
            <BalanceHeader currency={"BTC"} amount={10000} style={storyStyle.header}/>
          </UseCase>
       </Story>
        ))
    .add("10000 sats with dollar amount secondary", () => (
        <Story>
          <UseCase text="Sat with dollar" usage="Bitcoin Account">
            <BalanceHeader currency={"BTC"} amount={10000} amountOtherCurrency={10} style={storyStyle.header}/>
          </UseCase>
        </Story>
    ))
