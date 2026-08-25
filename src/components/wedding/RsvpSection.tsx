import { wedding } from "@/data/wedding";

type RsvpContact = {
  label: string;
  name: string;
  phone: string;
};

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function whatsappHref(phone: string, name: string) {
  const clean = phone.replace(/[^\d]/g, "");
  const message = `Hello ${name}, I am confirming my presence for the wedding of ${wedding.couple.bride.name} and ${wedding.couple.groom.name}.`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function RsvpSection() {
  const contacts = wedding.rsvp.contacts as readonly RsvpContact[];

  if (!wedding.rsvp.enabled) return null;

  return (
    <section className="rsvp-section section-shell">
      <div className="section-heading">
        <p className="section-eyebrow">{wedding.rsvp.eyebrow}</p>
        <h2>{wedding.rsvp.title}</h2>
        <p className="section-copy">{wedding.rsvp.message}</p>
      </div>

      <div className="rsvp-grid">
        {contacts.map((contact) => (
          <article className="rsvp-card" key={`${contact.label}-${contact.phone}`}>
            <p>{contact.label}</p>
            <h3>{contact.name}</h3>
            <span>{contact.phone}</span>

            <div className="rsvp-actions">
              <a href={telHref(contact.phone)}>Call</a>
              <a
                href={whatsappHref(contact.phone, contact.name)}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
