"use client"

import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/navigation";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <I18nProvider>
                    <AuthProvider>
                        <Navigation />
                        {children}
                        <Toaster position="top-right" richColors />
                    </AuthProvider>
                </I18nProvider>
            </body>
        </html>
    );
}
