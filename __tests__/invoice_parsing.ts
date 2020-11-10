import { getDescription, getUsername  } from "../app/utils/bolt11"
import * as lightningPayReq from 'bolt11'
const util = require('util')

it('I can get username from the invoice', () => {  
  const invoice = "lnbcrt1p06472cpp5p3gfqm90wcj9zg7kdy8arvwxwnnuem5juazdaxgpl5awygn4ackq9qy9qsqxq92fjuqdq9v93xxsp54fwkhugr4lv2r3v5jp35d3jk4emfmxske6yt7mewv4xgj2c7uklqcqzpulq2v93xxer9vcu740zxh4qwamnkvw7q056x7fypqntpkf29kqushvf22yq297vc7hl0umxnszpgkc9w5xafuefusfjhmshak8can3f08gk3rrfm4nnrsq6r04nh"
  const decoded = lightningPayReq.decode(invoice)
  expect(getUsername(decoded)).toBe("abcdef")
})
