import * as React from "react"
import { render } from "@testing-library/react-native"
import { GaloyGQL } from "@galoymoney/client"
import { createMock } from "ts-auto-mock"
import moment from "moment"

import { TransactionDate } from "../../app/components/transaction-date"
import { LocalizationContextProvider } from "../../app/store/localization-context"

describe("Display the createdAt date for a transaction", () => {
  it("Displays pending for a pending onchain transaction", () => {
    const mockedTransaction = createMock<GaloyGQL.Transaction>({
      status: "PENDING",
      createdAt: new Date().getDate(),
    })

    const { queryAllByText } = render(<LocalizationContextProvider><TransactionDate tx={mockedTransaction} /></LocalizationContextProvider>)
    expect(queryAllByText("pending")).not.toBeNull()
  })
  it("Displays friendly date", () => {
    const testTransactionCreatedAtDate = moment().subtract(1, "days")
    const mockedTransaction = createMock<GaloyGQL.Transaction>({
      createdAt: testTransactionCreatedAtDate.unix(),
    })

    const { queryByText } = render(
      <LocalizationContextProvider><TransactionDate tx={mockedTransaction} diffDate={true} friendly={true} /></LocalizationContextProvider>,
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
