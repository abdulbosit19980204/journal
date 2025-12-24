import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/navigation";

export const metadata: Metadata = {
    title: "American Journal Platform",
    description: "Scientific Publishing Reimagined",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <Navigation />
                {children}
            </body>
        </html>
    );
}
