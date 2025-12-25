"use client"

import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/navigation";
import { I18nProvider } from "@/lib/i18n";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <I18nProvider>
                    <Navigation />
                    {children}
                </I18nProvider>
            </body>
        </html>
    );
}
