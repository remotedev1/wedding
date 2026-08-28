import Image from "next/image";
import { wedding } from "@/data/wedding";
import { Countdown } from "./Countdown";
import { RsvpSection } from "./RsvpSection";
import { ScrollReveal } from "./ScrollReveal";
import { KodavaSymbol, ThumBolicha } from "./CulturalImage";

export function InvitationContent({ onReplay }: { onReplay: () => void }) {
  return (
    <div className="full-invitation">
      <section className="invite-hero section-shell">
        <div className="botanical botanical-left" aria-hidden="true">
          <Image src="/images/coffee-branch.svg" alt="" width={240} height={320} />
        </div>

        <div className="invite-hero-inner"> 
          <KodavaSymbol className="hero-symbol cultural-symbol mx-auto" />
          <p className="hero-message host-message">{wedding.invitation.message}</p>
          <h1 className="hero-names">
            <span>{wedding.couple.groom.name}</span>
            <em>&amp;</em>
            <span>{wedding.couple.bride.name}</span>
          </h1>
          <div className="fine-ornament" aria-hidden="true"><span /><b>✦</b><span /></div>
          <div className="hero-date">
            <strong>{wedding.invitation.date}</strong>
            <span>{wedding.invitation.time}</span>
            <span>{wedding.invitation.venue}</span>
          </div>
          <a className="text-link" href="#details">View celebration details</a>
        </div>
      </section>

      <section className="story-section section-shell" id="details">
        <ScrollReveal className="story-card">
          <p className="section-eyebrow">{wedding.story.eyebrow}</p>
          <h2>{wedding.story.title}</h2>
          <p>{wedding.story.body}</p>
        </ScrollReveal>
      </section>

      {wedding.couplePhoto.enabled && (
        <section className="couple-photo-section section-shell">
          <ScrollReveal className="couple-photo-card">
            <div className="couple-photo-frame">
              <Image src={wedding.couplePhoto.src} alt={wedding.couplePhoto.alt} width={900} height={1100} sizes="(max-width: 760px) 92vw, 44vw" />
            </div>
            <div className="couple-photo-copy">
              <p className="section-eyebrow">{wedding.couplePhoto.eyebrow}</p>
              <h2>{wedding.couplePhoto.title}</h2>
              <p>{wedding.couplePhoto.body}</p>
            </div>
          </ScrollReveal>
        </section>
      )}

      <section className="family-section section-shell">
        <ScrollReveal>
          <div className="section-heading">
            <p className="section-eyebrow">OUR FAMILIES</p>
            <h2>Together with our families</h2>
          </div>
        </ScrollReveal>
        <div className="family-grid">
          {[wedding.couple.bride, wedding.couple.groom].map((person, index) => (
            <ScrollReveal key={person.name} delay={index * 0.08}>
              <article className="family-card">
                <p>{person.familyLabel}</p>
                <h3>{person.name}</h3>
                <span>{person.parents}</span>
                <small>{person.place}</small>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="countdown-section section-shell">
        <ScrollReveal>
          <div className="section-heading compact">
            <p className="section-eyebrow">COUNTING DOWN</p>
            <h2>Until we celebrate together</h2>
          </div>
          <Countdown />
        </ScrollReveal>
      </section>

      <section className="events-section section-shell">
        <ScrollReveal>
          <div className="section-heading">
            <p className="section-eyebrow">THE CELEBRATION</p>
            <h2>Wedding day</h2>
          </div>
        </ScrollReveal>
        <div className="event-grid">
          {wedding.events.map((event, index) => (
            <ScrollReveal key={event.title} delay={index * 0.08}>
              <article className="event-card">
                <span className="event-number">0{index + 1}</span>
                <h3>{event.title}</h3>
                <p>{event.date}</p>
                {"time" in event && <strong>{event.time}</strong>}
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="venue-section section-shell">
        <ScrollReveal className="venue-card">
          <div className="venue-bolicha-panel">
            <div className="venue-bolicha-frame">
              <ThumBolicha className="venue-bolicha-image" />
            </div>
          </div>

          <div className="venue-content">
            <p className="section-eyebrow">{wedding.venue.eyebrow}</p>
            <h2>{wedding.venue.name}</h2>
            <p className="venue-place">{wedding.venue.place}</p>

            <div className="venue-divider" aria-hidden="true">
              <span />
              <b>✦</b>
              <span />
            </div>

            <p className="venue-address">{wedding.venue.address}</p>
            <p className="venue-description">{wedding.venue.description}</p>

            <a
              className="venue-map-button"
              href={wedding.venue.mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>View location</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </ScrollReveal>
      </section>

     
      <RsvpSection />

      <section className="closing-section section-shell">
        <ScrollReveal className="closing-inner">
          <p className="section-eyebrow">{wedding.closing.eyebrow}</p>
          <h2 >{wedding.closing.note}</h2>
          <div className="closing-names">
            {wedding.couple.bride.name} <span>&amp;</span> {wedding.couple.groom.name}
          </div>
          <button className="replay-button" type="button" onClick={onReplay}>Replay invitation</button>
        </ScrollReveal>
      </section>
    </div>
  );
}
