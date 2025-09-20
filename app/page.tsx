import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto my-0 px-1">
      <Navbar />
      <Hero />
    </div>
  );
}
