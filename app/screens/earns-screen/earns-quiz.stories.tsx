import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import cloneDeep from "lodash.clonedeep"
import { action } from "@storybook/addon-actions"
import { EarnQuiz } from "./earns-quiz"
import {  StoryScreen} from "../../../storybook/views"
import {reactNavigationDecorator} from "../../../storybook/storybook-navigator";

declare let module

const route = {
  params: {
    title: "So what exactly is Bitcoin?",
    text: "Bitcoin is digital money.\n\nIt can be transferred swiftly and securely between any two people in the world — without the need for a bank or any other financial company in the middle.",
    amount: 1,
    question: "So what exactly is Bitcoin?",
    answers: [
      "The smallest unit of Bitcoin",
      "An alternative crypto currency",
      "A small satellite",
    ],
    feedback: [
      "You just earned 1 sat, the smallest unit of Bitcoin. Congrats!",
      "Nope, it is not analtcoin",
      "Maybe... but that's not the correct answer in this context 😂",
    ],
    onComplete: () => null,
    completed: false,
  },
}

const route_completed = cloneDeep(route)
route_completed.params.completed = true

const route_long = cloneDeep(route)
route_long.params.answers[0] = "a \n b \n c \n d \n e \n f \n g \n h"
route_long.params.feedback[1] = "a \n b \n c \n d \n e \n f \n g \n h"

storiesOf("Quiz", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
    .addDecorator(reactNavigationDecorator)
  .add("Not earned", () => (
          <EarnQuiz route={route} navigation={{ goBack: action("goBack") }} />
  ))
  .add("Not earned - long text", () => (
          <EarnQuiz route={route_long} navigation={{ goBack: action("goBack") }} />
  ))
  .add("Earned", () => (
          <EarnQuiz route={route_completed} navigation={{ goBack: action("goBack") }} />
  ))
