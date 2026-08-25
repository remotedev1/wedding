import { wedding } from "@/data/wedding";

export function SplashScreen() {
  const groomFirstName = wedding.couple.groom.name.split(" ")[0];
  const brideFirstName = wedding.couple.bride.name.split(" ")[0];

  return (
    <section className="splash-screen" aria-label="Wedding invitation introduction">
      <div className="splash-inner">
        <h1 className="splash-title">
          <span className="splash-name">{groomFirstName}</span>
          <span className="splash-weds">weds</span>
          <span className="splash-name">{brideFirstName}</span>
        </h1>
      </div>
    </section>
  );
}