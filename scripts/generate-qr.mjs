import { writeFileSync } from "node:fs";
import QRCode from "qrcode";

const url = "https://habjeb.github.io/maquette-dieteticien/carte/";
const svg = await QRCode.toString(url, {
  type: "svg",
  margin: 1,
  errorCorrectionLevel: "M",
  color: { dark: "#244B42", light: "#F7F6F2" },
});

writeFileSync(new URL("../public/carte-qr.svg", import.meta.url), svg);
console.log("QR code écrit : public/carte-qr.svg →", url);
