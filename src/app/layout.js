import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
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
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>

        {children}
      </body>
    </html>
  );
}
