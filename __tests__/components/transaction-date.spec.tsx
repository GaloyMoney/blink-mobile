import * as React from "react"
import { render } from "@testing-library/react-native"
import { createMock } from "ts-auto-mock"
import moment from "moment"

import { TransactionDate } from "../../app/components/transaction-date"
import { i18nObject } from "../../app/i18n/i18n-util"
import { Transaction } from "../../app/graphql/generated"

jest.mock("@app/i18n/i18n-react", () => ({
  useI18nContext: () => {
    return i18nObject("en")
  },
}))

describe("Display the createdAt date for a transaction", () => {
  it("Displays pending for a pending onchain transaction", () => {
    const mockedTransaction = createMock<Transaction>({
      status: "PENDING",
      createdAt: new Date().getDate(),
    })

    const { queryAllByText } = render(
      <TransactionDate
        status={mockedTransaction.status}
        createdAt={mockedTransaction.createdAt}
      />,
    )
    expect(queryAllByText("pending")).not.toBeNull()
  })
  it("Displays friendly date", () => {
    const testTransactionCreatedAtDate = moment().subtract(1, "days")
    const mockedTransaction = createMock<Transaction>({
      createdAt: testTransactionCreatedAtDate.unix(),
    })

    const { queryByText } = render(
      <TransactionDate
        status={mockedTransaction.status}
        createdAt={mockedTransaction.createdAt}
        diffDate={true}
        friendly={true}
      />,
    )
    expect(
      queryByText(
        moment
          .duration(Math.min(0, moment.unix(mockedTransaction.createdAt).diff(moment())))
          .humanize(true),
      ),
    ).not.toBeNull()
  })
})
