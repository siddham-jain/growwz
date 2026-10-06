export interface GoalTemplate {
  id: string;
  emoji: string;
  title: string;
  hint: string;
  defaultName: string;
  defaultTarget: number;
  defaultMonths: number;
  presets: { label: string; amount: number }[];
  color: string;
}

export const templates: GoalTemplate[] = [
  {
    id: "emergency",
    emoji: "🛟",
    title: "Emergency cushion",
    hint: "Job switch, laptop dies, surprise bill",
    defaultName: "Emergency cushion",
    defaultTarget: 60000,
    defaultMonths: 12,
    presets: [
      { label: "2 months of rent + food", amount: 40000 },
      { label: "3 months (the gold standard)", amount: 60000 },
      { label: "6 months (zen mode)", amount: 120000 },
    ],
    color: "#00D09C",
  },
  {
    id: "trip",
    emoji: "✈️",
    title: "A trip",
    hint: "Goa with the gang, Spiti, Bali",
    defaultName: "Goa with the gang",
    defaultTarget: 25000,
    defaultMonths: 8,
    presets: [
      { label: "Weekend getaway", amount: 12000 },
      { label: "Goa, 5 days", amount: 25000 },
      { label: "Bali / Vietnam", amount: 75000 },
    ],
    color: "#F58A3D",
  },
  {
    id: "gadget",
    emoji: "💻",
    title: "New gadget",
    hint: "Without the no-cost EMI trap",
    defaultName: "MacBook fund",
    defaultTarget: 90000,
    defaultMonths: 14,
    presets: [
      { label: "AirPods", amount: 20000 },
      { label: "New phone", amount: 60000 },
      { label: "MacBook Air", amount: 95000 },
    ],
    color: "#5367FF",
  },
  {
    id: "moveout",
    emoji: "🏠",
    title: "Moving out",
    hint: "Deposit, furniture, first month",
    defaultName: "My own place",
    defaultTarget: 150000,
    defaultMonths: 30,
    presets: [
      { label: "PG deposit + setup", amount: 50000 },
      { label: "1BHK deposit + furniture", amount: 150000 },
    ],
    color: "#C355F5",
  },
  {
    id: "studies",
    emoji: "🎓",
    title: "Higher studies",
    hint: "Master's, a course, a GRE attempt",
    defaultName: "Master's fund",
    defaultTarget: 400000,
    defaultMonths: 42,
    presets: [
      { label: "Certification course", amount: 60000 },
      { label: "Master's in India", amount: 400000 },
      { label: "Master's abroad (deposit)", amount: 1000000 },
    ],
    color: "#E0A100",
  },
  {
    id: "freedom",
    emoji: "🌱",
    title: "Freedom fund",
    hint: "Just grow it. Future-you will thank you",
    defaultName: "Freedom fund",
    defaultTarget: 1000000,
    defaultMonths: 120,
    presets: [
      { label: "First ₹1 lakh", amount: 100000 },
      { label: "₹10 lakh by 35", amount: 1000000 },
      { label: "₹1 crore, eventually", amount: 10000000 },
    ],
    color: "#00B386",
  },
];

export const templateById = (id: string): GoalTemplate => templates.find((template) => template.id === id) ?? templates[0];
