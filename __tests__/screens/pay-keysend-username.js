import * as React from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput,
} from 'react-native'
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react-native"
import { MockedProvider } from '@apollo/client/testing'
import { gql, useMutation } from '@apollo/client'

export const PAY_KEYSEND_USERNAME = gql`
  mutation payKeysendUsername(
    $amount: Int!
    $destination: String!
    $username: String!
    $memo: String
  ) {
    invoice {
      payKeysendUsername(
        amount: $amount
        destination: $destination
        username: $username
        memo: $memo
      )
    }
  }
`

function QuestionsBoard({ questions }) {
  // const [data, setData] = React.useState({});
  const [payKeysendUsername, { loading: paymentKeysendLoading }] = useMutation(
    PAY_KEYSEND_USERNAME,
    { update: () => {
      console.log("PayKeysendUsername on update")
    }},
  )
  // console.log(loading, error, data)

  const pay = async () => {
    let mutation
    let variables
    let errors
    let data

    mutation = payKeysendUsername
    variables = {amount:25211,destination:"",username:"Bitcoin",memo:"None"}
    try {
      console.log(variables)
      console.log("PayKeysendUsername about to be called")
      ;({ data, errors } = await mutation({ variables }))
      // ;({ data, errors } = await mutation({ variables }))
    } catch (err) {
      console.log({ err, errors }, "mutation error")
      console.log("PayKeysendUsername error")
      setStatus("error")
      // setErrs([err])
      return
    }
    console.log("PayKeysendUsername is done")
  }

  return (
    <ScrollView>
      {questions.map((q, index) => {
        return (
          <View key={q}>
            <Text>{q}</Text>
          </View>
        );
      })}
      <TouchableOpacity onPress={() => pay()}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

test('form submits two answers', async () => {
  const allQuestions = ['q1', 'q2'];

  const mocks = [
    {
      request: {
        query: PAY_KEYSEND_USERNAME,
        variables: {amount:25211,destination:"",username:"Bitcoin",memo:"None"},
      },
      result: { 
        data: {
          invoice: { 
            payKeySendUsername: "success" 
          } 
        } 
      },
    },
  ];

  const { getAllByA11yLabel, getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <QuestionsBoard questions={allQuestions} />
    </MockedProvider>
  )

  // const answerInputs = getAllByA11yLabel('answer input');

  // fireEvent.changeText(answerInputs[0], 'a1');
  // fireEvent.changeText(answerInputs[1], 'a2');
  fireEvent.press(getByText('Submit'));

  await act(async () => await new Promise(resolve => setTimeout(resolve, 0)))

  // expect(mockFn).toBeCalledWith({
  //   '1': { q: 'q1', a: 'a1' },
  //   '2': { q: 'q2', a: 'a2' },
  // });
});
