import { getDestination, getUsername } from "../app/utils/bolt11"
import * as lightningPayReq from "bolt11"

// beforeAll(() => {
//   moment.now = function () {
//     return 1605060217294 // Nov 10 2020
//   }
// })

it("I can get username from a custom invoice", () => {
  const invoice =
    "lnbcrt1p06472cpp5p3gfqm90wcj9zg7kdy8arvwxwnnuem5juazdaxgpl5awygn4ackq9qy9qsqxq92fjuqdq9v93xxsp54fwkhugr4lv2r3v5jp35d3jk4emfmxske6yt7mewv4xgj2c7uklqcqzpulq2v93xxer9vcu740zxh4qwamnkvw7q056x7fypqntpkf29kqushvf22yq297vc7hl0umxnszpgkc9w5xafuefusfjhmshak8can3f08gk3rrfm4nnrsq6r04nh"
  const decoded = lightningPayReq.decode(invoice)
  expect(getUsername(decoded)).toBe("abcdef")
})

it("I cannot get username from a standard invoice", () => {
  const invoice =
    "lnbcrt1p06kznkpp5rglhs59dzjn5nm79nxje3plnkg8kml9t5pergh8534egdracu92sdq9v93xxcqzpuxq92fjuqsp52y8wvlvazkexyq5qvr3gsv836tfe57nlza7aun9ke6egkuxxcswq9qy9qsqvahdkkyv6slhzjvm3wyslvzue0xka836xt3ltx3ep5plvu2jtm8kq96edzjh2ywzaaxmynznlxc7pw9e8n6tcnxvlsnzy99u6sn9jlcq03pusf"
  const decoded = lightningPayReq.decode(invoice)
  expect(getUsername(decoded)).toBe(undefined)
  expect(getDestination(decoded)).toBe(
    "032569bb72737c1c1e50f5babf763b56e0a36046f960d67e4273bddc632607cb1f",
  )
})
