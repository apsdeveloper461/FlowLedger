import { Geist_Mono, Instrument_Sans, Noto_Serif } from "next/font/google"
import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { Toaster } from "sonner"
import { cn } from "@workspace/ui/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { template: "%s — FlowLedger", default: "FlowLedger · Track every rupee" },
  description: "Track every rupee. Visualize every flow. FlowLedger is your personal finance command center.",
}

const notoSerifHeading = Noto_Serif({ subsets: ["latin"], variable: "--font-heading" })
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        instrumentSans.variable,
        notoSerifHeading.variable,
        "font-sans",
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
