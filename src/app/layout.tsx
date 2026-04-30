import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Election Navigator AI | Trusted Civic Guidance",
  description: "A scalable civic education and election-process guidance platform built using Google technologies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <div className="app-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
