// src/utils/pdfExport.ts
import ReactNativeHTMLToPDF from "react-native-html-to-pdf"
import { Alert, Platform } from "react-native"
import RNFS from "react-native-fs"
import Share from "react-native-share"

// Define a type for a transaction object
type Transaction = {
  id: string
  displayDate: string
  direction: string
  settlementDisplayAmount: string
}

// Define the type for the export function parameters
interface ExportTransactionsToPDFParams {
  transactions: Transaction[]
  from: string
  to: string
  totalAmount: string
  balanceInDisplayCurrency: string
  currencySymbol: string
}

export const exportTransactionsToPDF = async ({
  transactions,
  from,
  to,
  totalAmount,
  balanceInDisplayCurrency,
  currencySymbol,
}: ExportTransactionsToPDFParams): Promise<void> => {
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .date-range { margin-top: 20px; text-align: center; }
          .total { margin-top: 20px; font-size: 20px; font-weight: bold; text-align: right; }
        </style>
      </head>
      <body>
        <h1>Reconciliation Report</h1>
        <p class="date-range">From: ${from} To: ${to}</p>
        <table>
          <tr>
            <th>Date</th>
            <th>Direction</th>
            <th>Amount</th>
          </tr>
          ${transactions
            .map(
              (tx) => `
            <tr key="${tx.id}">
              <td>${tx.displayDate}</td>
              <td>${tx.direction}</td>
              <td>${currencySymbol} ${tx.settlementDisplayAmount}</td>
            </tr>
          `,
            )
            .join("")}
        </table>
        <p class="total">Total: ${currencySymbol} ${totalAmount} ( ~${balanceInDisplayCurrency} )</p>
      </body>
    </html>
  `

  try {
    const options = {
      html: htmlContent,
      fileName: `Reconciliation-Report`,
      directory: Platform.OS === "ios" ? "Documents" : "Download", // Save in Download on Android
    }

    const file = await ReactNativeHTMLToPDF.convert(options)

    // Display the file path in a more user-friendly way
    const filePath =
      Platform.OS === "ios"
        ? `Documents/${options.fileName}.pdf`
        : `Download/${options.fileName}.pdf`

    console.log("PDF generated:", options.fileName)

    // Provide the user an option to open the file directly
    Alert.alert(
      "Success",
      `PDF saved to: ${filePath}`,
      [
        {
          text: "Open",
          onPress: () => openPDF(file.filePath),
        },
        {
          text: "OK",
          style: "cancel",
        },
      ],
      { cancelable: false },
    )
  } catch (error) {
    Alert.alert("Error", "Failed to create PDF")
  }
}

// Function to export the report as an HTML file
export const exportTransactionsToHTML = async ({
  transactions,
  from,
  to,
  totalAmount,
  balanceInDisplayCurrency,
  currencySymbol,
}: ExportTransactionsToPDFParams): Promise<void> => {
  const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .date-range { margin-top: 20px; text-align: center; }
            .total { margin-top: 20px; font-size: 20px; font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <h1>Reconciliation Report</h1>
          <p class="date-range">From: ${from} To: ${to}</p>
          <table>
            <tr>
              <th>Date</th>
              <th>Direction</th>
              <th>Amount</th>
            </tr>
            ${transactions
              .map(
                (tx) => `
              <tr key="${tx.id}">
                <td>${tx.displayDate}</td>
                <td>${tx.direction}</td>
                <td>${currencySymbol} ${tx.settlementDisplayAmount}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
          <p class="total">Total: ${currencySymbol} ${totalAmount} ( ~${balanceInDisplayCurrency} )</p>
        </body>
      </html>
    `

  try {
    const options = {
      html: htmlContent,
      fileName: `Reconciliation-Report`,
      directory: Platform.OS === "ios" ? "Documents" : "Download", // Save in Download on Android
    }

    const filePath = `${RNFS.DocumentDirectoryPath}/Reconciliation-Report.html`
    const filePathDisplay =
      Platform.OS === "ios"
        ? `Documents/${options.fileName}.html`
        : `Download/${options.fileName}.html`

    console.log("HTML generated:", options.fileName)

    // Write the HTML content to a file
    await RNFS.writeFile(filePath, htmlContent, "utf8")

    // Provide the user an option to open the file directly
    Alert.alert(
      "Success",
      `HTML report saved to: ${filePathDisplay}`,
      [
        {
          text: "Open",
          onPress: () => openHTML(filePath),
        },
        {
          text: "OK",
          style: "cancel",
        },
      ],
      { cancelable: false },
    )
  } catch (error) {
    Alert.alert("Error", "Failed to create HTML report")
  }
}

// Function to open the HTML file
const openHTML = async (filePath: string) => {
  try {
    await Share.open({
      title: "Open HTML",
      url: `file://${filePath}`,
      type: "text/html",
      failOnCancel: false,
    })
  } catch (error) {
    console.error("Failed to open HTML:", error)
  }
}

// Function to open the PDF file
const openPDF = async (filePath: string) => {
  try {
    await Share.open({
      title: "Open PDF",
      url: Platform.OS === "ios" ? filePath : `file://${filePath}`,
      type: "application/pdf",
      failOnCancel: false,
    })
  } catch (error) {
    console.error("Failed to open PDF:", error)
  }
}
