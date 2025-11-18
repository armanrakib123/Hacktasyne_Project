import { Geist, Geist_Mono } from "next/font/google";
import DashboardLayout from "./components/DashboardLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function DoctorProfileLayout({ children }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <div className="mt-28">
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </div>
    </div>
  );
}
