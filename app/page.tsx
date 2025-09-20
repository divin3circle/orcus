import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import BottomHero from "@/components/landing/BottomHero";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto my-0 px-1">
      <Navbar />
      <Hero />
      <BottomHero />
    </div>
  );
}
