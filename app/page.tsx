import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import Rules from "@/components/Rules";
import Filming from "@/components/Filming";
import Premiere from "@/components/Premiere";
import History from "@/components/History";
import Inspiration from "@/components/Inspiration";
import CallToAction from "@/components/CallToAction";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <Hero />
      <Reveal>
        <Rules />
      </Reveal>
      <Reveal>
        <Filming />
      </Reveal>
      <Reveal>
        <Premiere />
      </Reveal>
      <Reveal>
        <History />
      </Reveal>
      <Reveal>
        <Inspiration />
      </Reveal>
      <Reveal>
        <CallToAction />
      </Reveal>
      <Reveal>
        <FAQ />
      </Reveal>
      <Footer />
    </div>
  );
}
