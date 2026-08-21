import type { AppProps } from "next/app";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div
          className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-[#f7f8fb] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-150`}
        >
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
