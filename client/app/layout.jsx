import "./globals.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export const metadata = {
  title: "Dhaka City Tour Guiding System",
  description: "Experience-based Dhaka tours with verified local guides."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
