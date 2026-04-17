import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "South African Airways | Virtual Airline",
  description:
    "South African Airways Virtual — Experience the spirit of Africa with our premier virtual airline. Join our community of pilots and explore the world from the skies.",
  keywords: "virtual airline, flight simulation, South African Airways, SAA, aviation",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>

        {children}
      </body>
    </html>
  );
}
