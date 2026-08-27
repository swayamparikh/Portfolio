import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { DemoBox } from "@/components/landing/demo-box";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <DemoBox />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
