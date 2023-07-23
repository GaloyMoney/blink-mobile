import QRCode from "react-native-qrcode-svg"

export const QrCodeComponent = ({ otpauth }: { otpauth: string }) => {
  return (
    <QRCode
      value={otpauth}
      size={200}
      //   logo={require("./path/to/your/logo.png")} // Optional: If you want to include a logo within the QR code.
      //   logoSize={30}
      //   logoBackgroundColor="transparent"
    />
  )
}
