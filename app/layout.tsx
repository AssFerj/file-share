/* eslint-disable @typescript-eslint/no-explicit-any */
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Providers } from "./providers";
import { SignOutButton } from "@/components/SignOutButton";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

export const metadata = {
  title: "FileShare — Compartilhe arquivos facilmente",
  description: "Envie e compartilhe arquivos com links temporários.",
  openGraph: {
    title: "FileShare — Compartilhe arquivos facilmente",
    description: "Envie e compartilhe arquivos com links temporários.",
    images: [
      {
        url: "https://file-share-orpin.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        siteName: "FileShare",
        type: "website",
        locale: "pt-BR",
      },
    ],
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
        <Providers>
          <main className="max-w-4xl mx-auto py-10 px-4">
            <header className="flex items-center justify-between mb-10">
              <Link href="/">
                <h1 className="text-2xl font-semibold tracking-tight hover:text-gray-700 transition-colors">
                  📤 FileShare
                </h1>
              </Link>
              <nav className="flex items-center gap-4">
                {session?.user ? (
                  <>
                    <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                      Upload
                    </Link>
                    <Link href="/files" className="text-sm text-gray-600 hover:text-gray-900">
                      Meus Arquivos
                    </Link>
                    {(session.user as any).role === 'admin' && (
                      <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                        Admin
                      </Link>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{session.user.name || session.user.email}</span>
                    </div>
                    <SignOutButton />
                  </>
                ) : (
                  <>
                    <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                      Home
                    </Link>
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm">
                        Começar Grátis
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </header>
            {children}
            <ToastContainer position="bottom-right" />
            <Analytics />
            <GoogleAnalytics />
          </main>
        </Providers>
      </body>
    </html>
  );
}