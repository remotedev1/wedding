import { wedding } from "@/data/wedding";
import { KodavaSymbol } from "./CulturalImage";

export function SplashScreen() {
  return (
    <section className="splash-screen" aria-label="Wedding invitation introduction">
      <div className="splash-inner">
        <div className="splash-symbol">
          <KodavaSymbol className="splash-kodava-symbol" />
        </div>

        <p className="splash-location">{wedding.splash.location}</p>
        <p className="splash-line">{wedding.splash.line}</p>
      </div>
    </section>
  );
}
