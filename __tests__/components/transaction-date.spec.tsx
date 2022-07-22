import * as React from "react"
import { render } from "@testing-library/react-native"
import { TransactionDate } from "../../app/components/transaction-date"
import { GaloyGQL, translateUnknown } from "@galoymoney/client"
import { createMock } from "ts-auto-mock"
import moment from "moment"

describe("Display the createdAt date for a transaction", () => {
  it("Displays pending for a pending onchain transaction", () => {
    const mockedTransaction = createMock<GaloyGQL.Transaction>({
      status: "PENDING",
      createdAt: new Date().getDate(),
    })

    const { queryAllByText } = render(<TransactionDate tx={mockedTransaction} />)
    expect(queryAllByText(translateUnknown("common.pending"))).not.toBeNull()
  })

  it("Displays non-friendly date which adapts to timezone", () => {
    const testTransactionCreatedAtDate = moment.utc("2022-07-15T14:15:00+00:00")
    const mockedTransaction = createMock<GaloyGQL.Transaction>({
      createdAt: testTransactionCreatedAtDate.unix(),
    })

    const { queryByText } = render(<TransactionDate tx={mockedTransaction} />)
    expect(queryByText("July 15, 2022 3:15 PM")).not.toBeNull()
  })

  it("Displays friendly date", () => {
    const testTransactionCreatedAtDate = moment().subtract(1, "days")
    const mockedTransaction = createMock<GaloyGQL.Transaction>({
      createdAt: testTransactionCreatedAtDate.unix(),
    })

    const { queryByText } = render(
      <TransactionDate tx={mockedTransaction} diffDate={true} friendly={true} />,
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
