import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Rules from "@/components/Rules";
import Filming from "@/components/Filming";
import Premiere from "@/components/Premiere";
import History from "@/components/History";
import Inspiration from "@/components/Inspiration";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <Hero />
      <Rules />
      <Filming />
      <Premiere />
      <History />
      <Inspiration />
      <CallToAction />
      <Footer />
    </div>
  );
}
