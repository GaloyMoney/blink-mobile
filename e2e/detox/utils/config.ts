import { config } from "dotenv"
import path from "path"

config({ path: path.join(__dirname, "../../../dev/.env.tmp.ci") })

if (!process.env.ALICE_PHONE || !process.env.BOB_PHONE) {
  throw new Error("Development environment environment configuration is incorrect")
}

export const timeout = 10000
export const otp = process.env.GALOY_STAGING_GLOBAL_OTP || "000000"

export const ALICE_PHONE = process.env.ALICE_PHONE
export const ALICE_TOKEN = process.env.ALICE_TOKEN || ""
export const ALICE_USERNAME = process.env.ALICE_USERNAME || ""
export const ALICE_EMAIL = process.env.ALICE_USERNAME + "@galoy.io"

export const BOB_PHONE = process.env.BOB_PHONE
export const BOB_TOKEN = process.env.BOB_TOKEN || ""
export const BOB_USERNAME = process.env.BOB_USERNAME || ""
export const BOB_EMAIL = process.env.BOB_USERNAME + "@galoy.io"
