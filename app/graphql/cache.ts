import { InMemoryCache } from "@apollo/client"
import * as currency_fmt from "currency.js"
import moment, { Moment } from "moment"
import { prefCurrencyVar } from "./query"

const date_options: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
}

// manage sign for usd. unlike for amount usd is not signed
const signAmount = ({ amount, usd }) =>
  prefCurrencyVar() === "sats" ? amount : amount > 0 ? usd : -usd
const getPrecision = ({ usd }) => (prefCurrencyVar() === "sats" ? 0 : usd < 0.01 ? 4 : 2)

export const cache = new InMemoryCache({
  typePolicies: {
    Contact: {
      fields: {
        prettyName: {
          read(_, { readField }) {
            return readField("id") || readField("name")
          },
        },
      },
    },
    Transaction: {
      fields: {
        date: {
          read: (_, { readField }) => moment.unix(readField("created_at")),
        },
        date_format: {
          read: (_, { readField }) =>
            (readField("date") as Date).toLocaleString("en-US", date_options),
        },
        date_nice_print: {
          read: (_, { readField }) =>
            moment
              .duration(Math.min(0, (readField("date") as Moment).diff(moment())))
              .humanize(true),
        },
        isReceive: {
          read: (_, { readField }) => readField("amount") > 0,
        },
        text: {
          read(_, { readField }) {
            const usd = readField("usd")
            const amount = readField("amount")
            const symbol = prefCurrencyVar() === "sats" ? "" : "$"
            return currency_fmt
              .default(signAmount({ amount, usd }), {
                separator: ",",
                symbol,
                precision: getPrecision({ usd }),
              })
              .format()
          },
        },
      },
    },
    Earn: {
      fields: {
        completed: {
          read: (value) => value ?? false,
        },
      },
    },
  },
})
