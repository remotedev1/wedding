export const wedding = {
  assets: {
    kodavaSymbol:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStRU5nH8Vvm4uzpG4YLiIqaAj-Xum79oOkMGclnDA6N99_CGikeAPgR48l&s=10",
    thumBolicha:
      "https://kodavaclan.com/kodaguheritage/wp-content/uploads/2019/02/bolcha.jpg",
  },

  site: {
    title: "Tharun & Ashwitha | Wedding Invitation",
    description:
      "You are warmly invited to celebrate the wedding of Tharun Chinnappa and Ashwitha Accamma in Ponnampet, Kodagu.",
    url: "https://your-wedding-domain.com",
    locale: "en_IN",
  },

  splash: {
    durationMs: 3000,
    location: "PONNAMPET • KODAGU",
    line: "A Kodava wedding celebration",
  },

  couple: {
    bride: {
      name: "Ashwitha Accamma",
      honorific: "Sou.",
      familyLabel: "Bride's Family",
      parents: "Daughter of Mr. Nellira Poonacha Manu & Mrs. Surekha",
      place: "Parakatageri",
    },
    groom: {
      name: "Tharun Chinnappa",
      honorific: "Chi.",
      familyLabel: "Groom's Family",
      parents: "Son of Late Mr. Konganda Nanjappa & Mrs. Nalini Nanjappa",
      place: "V Badaga",
    },
  },

  invitation: {
    message: "We cordially invite you to celebrate the wedding of us.",
    date: "THURSDAY • 5 NOVEMBER 2026",
    time: "Dampathi Muhurtham • 10:30 AM",
    venue: "Kodava Samaja, Ponnampet",
  },

  weddingDate: "2026-11-05T10:30:00+05:30",
  weddingEndDate: "2026-11-05T14:30:00+05:30",

  story: {
    eyebrow: "WITH THE BLESSINGS OF OUR FAMILIES",
    title: "Tharun & Ashwitha",
    body: "With joy and the blessings of our families, we invite you to join us in Ponnampet as we celebrate our wedding.",
  },

  events: [
    {
      title: "Oorkuduvo",
      date: "Wednesday, 4 November 2026",
    },
    {
      title: "Dampathi Muhurtham",
      date: "Thursday, 5 November 2026",
      time: "10:30 AM",
    },
  ],

  venue: {
    eyebrow: "THE VENUE",
    name: "Kodava Samaja",
    place: "Ponnampet, Kodagu",
    address: "Kodava Samaja, Ponnampet, Kodagu, Karnataka",
    description:
      "We look forward to welcoming our family, relatives and friends to celebrate this special day with us.",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Kodava+Samaja+Ponnampet",
  },

  couplePhoto: {
    enabled: true,
    src: "/images/image01.jpeg",
    alt: "Tharun Chinnappa and Ashwitha Accamma",
    eyebrow: "OUR WEDDING",
    title: "A new chapter begins.",
  },

  gallery: [
    {
      src: "/images/kodagu-landscape.svg",
      alt: "Kodagu landscape",
    },
    {
      src: "/images/coffee-branch.svg",
      alt: "Coffee branch illustration",
    },
  ],

  compliments: {
    eyebrow: "WITH BEST COMPLIMENTS",
    primary: "Konganda Teena Muthamma",
    secondary: "Family Members, Relatives and Friends",
  },

  rsvp: {
    enabled: false,
    eyebrow: "RSVP",
    title: "We would love to celebrate with you.",
    message: "Please confirm your presence with our family.",
    contacts: [],
  },

  sharing: {
    message:
      "You are warmly invited to celebrate the wedding of Tharun Chinnappa and Ashwitha Accamma on Thursday, 5 November 2026 at Kodava Samaja, Ponnampet. Dampathi Muhurtham at 10:30 AM.",
  },

  closing: {
    eyebrow: "WITH BEST COMPLIMENTS",
    note: "Family Members, Relatives and Friends",
  },

  audio: {
    enabled: true,
    src: "/audio/wedding-theme.mp3",
    label: "Music",
  },
} as const;
