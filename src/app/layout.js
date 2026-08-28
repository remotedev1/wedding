import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import "./globals.css";
import { Providers } from "./Providers";
import PageLoader from "@/components/common/PageLoader";

export const metadata = {
  title: "Chenanda",
  description: "kodava okka",
  openGraph: {
    title: "Chenanda Hockey Tournament",
    description: "Official tournament fixtures, live scores, standings and results.",
    url: "https://chenanda.in/",
    siteName: "Chenanda Hockey Tournament",
  },
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-mundial  transition-colors duration-500 ease-in-out">
        <SessionProvider session={session} refetchInterval={5 * 60}>
          <Providers>{children}</Providers>
          <PageLoader />
        </SessionProvider>
      </body>
    </html>
  );
}
