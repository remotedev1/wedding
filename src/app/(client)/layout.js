import ContactUs from "@/modules/public/components/ContactUs";
import Footer from "@/modules/public/components/Footer";
import Header from "@/modules/public/components/Header";

export default async function RootLayout({ children }) {
  return (
    <div className={` font-sans  min-h-screen overflow-x-hidden`}>
      <Header />

      {children}
      <ContactUs />

      <Footer />
    </div>
  );
}
