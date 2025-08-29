import FinalCTA from "./components/FinalCTA";
import Hero from "./components/Hero";
import FeaturedMarkets from "./components/markets/FeaturedMarkets";

export default function Page() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Featured Markets Section */}
      <FeaturedMarkets />

      {/* Final CTA Section */}
      <FinalCTA />
    </>
  );
}
