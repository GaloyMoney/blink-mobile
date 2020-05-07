import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { Story, StoryScreen, UseCase } from "../../../storybook/views";
import { EarnQuiz } from "./earns-quiz";
import { cloneDeep } from "lodash"
import { Text, SafeAreaView } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

declare let module


const route = { params: {
  title: "So what exactly is Bitcoin?",
  text: "Bitcoin is digital money.\n\nIt can be transferred swiftly and securely between any two people in the world — without the need for a bank or any other financial company in the middle.",
  amount: 1,
  question: "So what exactly is Bitcoin?",
  answers: [
    "The smallest unit of Bitcoin",
    "An alternative crypto currency",
    "A small satellite"
  ],
  feedback: [
    "You just earned 1 sat, the smallest unit of Bitcoin. Congrats!",
    "Nope, it is not analtcoin",
    "Maybe... but that's not the correct answer in this context 😂"
  ],
  onComplete: () => {},
  completed: false,
}}

let route_completed = cloneDeep(route)
route_completed.params.completed = true

let route_long = cloneDeep(route)
route_long.params.answers[0] = "a \n b \n c \n d \n e \n f \n g \n h"
route_long.params.feedback[1] = "a \n b \n c \n d \n e \n f \n g \n h"

storiesOf("Quiz", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Not earned", () => (
    <SafeAreaProvider>
      <Story>
        <UseCase text="not earned">
          <EarnQuiz route={route} />  
        </UseCase>
      </Story>
    </SafeAreaProvider>
  ))
  .add("Not earned - long text", () => (
    <SafeAreaProvider>
      <Story>
        <UseCase text="Not earned - long text">
          <EarnQuiz route={route_long} />  
        </UseCase>
      </Story>
    </SafeAreaProvider>
  ))
  .add("Earned", () => (
  <SafeAreaProvider>
    <Story>
      <UseCase text="earned">
        <EarnQuiz route={route_completed} />
      </UseCase>
    </Story>
  </SafeAreaProvider>
  ))