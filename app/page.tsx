import { GridBackground } from "./components/grid-background";
import { Nav } from "./components/attesto/nav";
import { Hero } from "./components/attesto/hero";
import { HowItWorks } from "./components/attesto/how-it-works";
import { LiveActivity } from "./components/attesto/live-activity";
import { TryIt } from "./components/attesto/try-it";
import { ApiReference } from "./components/attesto/api-reference";
import { Footer } from "./components/attesto/footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GridBackground />

      <div className="relative z-10">
        <Nav />

        <main className="mx-auto max-w-6xl px-6">
          <Hero />
          <HowItWorks />
          <LiveActivity />
          <TryIt />
          <ApiReference />
        </main>

        <Footer />
      </div>
    </div>
  );
}
