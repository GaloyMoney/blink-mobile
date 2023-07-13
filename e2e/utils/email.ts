import axios from "axios"
import { mailinatorToken } from "./graphql"

export const fetchEmail = async (username: string) => {
  const url = `https://www.mailinator.com/v2/fetch/inbox?to=${username}`
  const options = {
    headers: {
      Authorization: mailinatorToken,
    },
  }
  try {
    const response = await axios.get(url, options)
    const data = response.data
    console.log(data)

    // Parse your code from the email here
  } catch (error) {
    console.error("Error:", error)
  }
}
