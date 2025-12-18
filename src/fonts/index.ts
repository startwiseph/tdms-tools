import localFont from "next/font/local"

export const primaryFont = localFont({
  src: [
    {
      path: "./LibreBaskerville.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./LibreBaskerville.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./LibreBaskerville.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-primary-font",
})