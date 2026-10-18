// Signposting only, paraphrased from NHS guidance (nhs.uk "Get help" pages,
// Pharmacy First, NHS 111). It routes people to a service; it never tells
// anyone they are fine. Every row ends in a real service they can contact.

export interface Option {
  id: string;
  service: string;
  when: string;
  examples: string[];
  action: { label: string; href: string };
  urgent?: boolean;
}

export const WHERE_TO_GO: Option[] = [
  {
    id: "999",
    service: "Call 999",
    when: "Someone's life may be at risk.",
    examples: [
      "Chest pain, or pain spreading to the arm, neck or jaw",
      "Struggling to breathe, or choking",
      "Signs of a stroke: face drooping, arm weakness, slurred speech",
      "Heavy bleeding that won't stop",
      "Unconscious, or a seizure that won't stop",
      "A severe allergic reaction",
    ],
    action: { label: "Call 999", href: "tel:999" },
    urgent: true,
  },
  {
    id: "ae",
    service: "A&E",
    when: "It's serious and can't wait, and you can get there safely.",
    examples: ["A serious injury or sudden severe illness", "NHS 111 or a clinician has told you to go"],
    action: { label: "Compare A&E waits", href: "/now" },
  },
  {
    id: "utc",
    service: "Urgent treatment centre or minor injuries unit",
    when: "You need treatment today, but it isn't life-threatening.",
    examples: [
      "Sprains, strains and suspected broken bones",
      "Cuts that may need stitches, minor burns",
      "A minor head injury with no loss of consciousness",
      "Bites, stings and eye problems",
    ],
    action: { label: "Find one near you", href: "/now" },
  },
  {
    id: "111",
    service: "NHS 111",
    when: "You're not sure what you need, or need help fast.",
    examples: [
      "Available online and by phone, 24 hours a day",
      "Can book you a time slot at many urgent treatment centres",
      "Mental health crisis in England: call 111 and choose option 2",
    ],
    action: { label: "Go to NHS 111 online", href: "https://111.nhs.uk/" },
  },
  {
    id: "pharmacy",
    service: "A pharmacy",
    when: "A common minor illness. In England, Pharmacy First can treat some without a GP.",
    examples: [
      "Sore throat, sinusitis, earache (ages 1 to 17)",
      "Urinary infections (women aged 16 to 64)",
      "Infected insect bites, impetigo, shingles",
    ],
    action: { label: "Find a pharmacy", href: "https://www.nhs.uk/service-search/pharmacy/find-a-pharmacy" },
  },
  {
    id: "gp",
    service: "Your GP surgery",
    when: "It can wait a day or more, or it's an ongoing problem.",
    examples: ["Symptoms that aren't getting better", "Repeat medicines and referrals to a specialist"],
    action: { label: "Find a GP", href: "https://www.nhs.uk/service-search/find-a-gp" },
  },
];
