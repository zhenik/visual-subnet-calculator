import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/themeRegistry"; // Import the new hydration wrapper

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Visual Subnet Calculator",
	description: "Next.js-based Subnet Calculator",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<ThemeRegistry>
					{/* Wrap app with MUI hydration wrapper */}
					{children}
				</ThemeRegistry>
			</body>
		</html>
	);
}
