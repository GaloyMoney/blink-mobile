import axios from "axios"

export const fetchEmail = async (username: string) => {
  const url = `https://www.mailinator.com/v2/fetch/inbox?to=${username}`
  const options = {
    headers: {
      Authorization: "YourTeamAPIToken",
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
