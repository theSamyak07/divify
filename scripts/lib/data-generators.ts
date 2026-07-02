const FIRST_NAMES = [
  "Aarav", "Alice", "Alex", "Amelia", "Arjun", "Ava", "Ayaka", "Beatrice", "Caleb", "Camila",
  "Chen", "Chloe", "Daniel", "David", "Diego", "Elena", "Elif", "Emma", "Ethan", "Fatima",
  "Felix", "Gabriel", "Grace", "Hana", "Haruki", "Hassan", "Ingrid", "Ivan", "Jack", "Jasmine",
  "Jin", "Kai", "Karen", "Kenji", "Khalid", "Layla", "Leo", "Liam", "Lina", "Lucas",
  "Mai", "Marco", "Maya", "Mei", "Miguel", "Nadia", "Noah", "Nora", "Omar", "Olivia",
  "Oscar", "Priya", "Quan", "Raj", "Ravi", "Rina", "Rosa", "Rui", "Sakura", "Samuel",
  "Sara", "Sergei", "Shin", "Sofia", "Sven", "Tariq", "Tatiana", "Theo", "Uma", "Vera",
  "Victor", "Wei", "Xena", "Yara", "Yuki", "Zara", "Zhen", "Aditya", "Bianca", "Cyrus",
  "Daria", "Emi", "Farah", "Goran", "Hiro", "Iris", "Joon", "Kira", "Lars", "Mira",
  "Niko", "Oren", "Pia", "Rico", "Suki", "Tariq", "Vidal", "Yuki", "Zane", "Anya",
];

const LAST_NAMES = [
  "Anderson", "Bauer", "Brown", "Campbell", "Chen", "Davis", "Diaz", "Evans", "Fischer", "Garcia",
  "Goldberg", "Green", "Gupta", "Hansen", "Hassan", "Hernandez", "Ivanov", "Johnson", "Kapoor", "Kim",
  "Kobayashi", "Kumar", "Lee", "Lopez", "Martinez", "Mason", "Miller", "Miyamoto", "Mori", "Nakamura",
  "Nguyen", "O'Brien", "Okafor", "Patel", "Petrov", "Rossi", "Russo", "Schmidt", "Sharma", "Silva",
  "Singh", "Smith", "Suzuki", "Tanaka", "Taylor", "Thomas", "Volkov", "Wang", "Williams", "Yamamoto",
  "Yamada", "Zhang", "Abadi", "Becker", "Costa", "Dimitrov", "Eriksson", "Ferrari", "Gupta", "Haddad",
  "Ito", "Johansson", "Kowalski", "Larsen", "Mancini", "Novak", "Olsen", "Park", "Rasmussen", "Schultz",
  "Tan", "Ueno", "Vargas", "Watanabe", "Xu", "Yamamoto", "Zhou", "Ali", "Bianchi", "Costa",
  "Dubois", "Engström", "Fontana", "Gallo", "Hwang", "Iwasaki", "Janssen", "Khan", "Lombardi", "Moretti",
  "Nishimura", "Ozturk", "Park", "Romano", "Saito", "Thompson", "Ueno", "Voss", "Weber", "Young",
];

const DOMAINS = [
  "gmail.com", "outlook.com", "proton.me", "yahoo.com", "icloud.com",
  "hotmail.com", "zoho.com", "tutanota.com", "fastmail.com", "mail.com",
];

const EXPENSE_DESCRIPTIONS = [
  "Tokyo dinner split", "AirBnB weekend in Lisbon", "Groceries from Whole Foods",
  "Pizza night with friends", "Uber rides shared", "Concert tickets group buy",
  "Office lunch split", "Coffee run for the team", "Birthday dinner for Sarah",
  "Weekend hiking trip supplies", "Shared Netflix subscription", "Electricity bill split",
  "Birthday gift for Mike", "Restaurant bill - Italian place", "Taxi to airport",
  "Hotel room in Barcelona", "Ski trip rental gear", "Book club snacks",
  "Game night pizza order", "Beach trip sunscreen and snacks", "Moving truck rental",
  "Furniture delivery split", "Team building dinner", "Conference hotel split",
  "Airport parking shared", "Birthday cake for mom", "Weekly grocery haul",
  "Pharmacy run for the group", "Camping gear rental", "Potluck dinner supplies",
];

const FAVORITE_FEATURES = [
  "Expense Splitter", "Multi-Wallet Support", "Quick Send",
  "Activity Feed", "Contract Events", "Onboarding Flow",
  "Mobile Experience", "Referral Program", "Analytics Dashboard",
];

const IMPROVEMENT_SUGGESTIONS = [
  "Would love multi-currency support beyond USD and XLM",
  "Add receipt upload for expense splits",
  "Persistent groups for recurring splits would be amazing",
  "Push notifications when someone sends me XLM",
  "A mobile app would be great for on-the-go splitting",
  "Add dark mode toggle in settings",
  "Show transaction history with filters by date",
  "Add recurring expense schedules for rent and utilities",
  "Integration with calendar for expense reminders",
  "Add expense categories for better tracking",
  "Would be nice to see spending analytics over time",
  "Add support for custom tokens beyond XLM",
  "Group chat feature for expense discussions",
  "Export expenses to CSV for accounting",
  "Add budget limits and alerts",
];

const BUG_REPORTS = [
  "Sometimes the balance takes a few seconds to update after sending",
  "The activity feed doesn't refresh automatically",
  "Mobile layout could be improved on smaller screens",
  "Occasional delay when connecting xBull wallet",
  null, null, null, null, null, null, null, null, null, null, null,
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export function generateEmail(name: string): string {
  const handle = name.toLowerCase().replace(/[^a-z0-9]/g, ".").replace(/\.+/g, ".");
  const num = randomInt(1, 999);
  return `${handle}${num}@${pick(DOMAINS)}`;
}

export function generateReferralCode(publicKey: string): string {
  const prefix = publicKey.slice(2, 6).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DIVIFY-${prefix}${suffix}`;
}

export function generateExpenseDescription(): string {
  return pick(EXPENSE_DESCRIPTIONS);
}

export function generateFavoriteFeature(): string {
  return pick(FAVORITE_FEATURES);
}

export function generateImprovementSuggestion(): string {
  return pick(IMPROVEMENT_SUGGESTIONS);
}

export function generateBugReport(): string | null {
  return pick(BUG_REPORTS);
}

export function generateRating(): number {
  const r = Math.random();
  if (r < 0.45) return 5;
  if (r < 0.75) return 4;
  if (r < 0.90) return 3;
  if (r < 0.97) return 2;
  return 1;
}

export function generateTransactionAmount(): number {
  const amounts = [1.5, 2.0, 3.5, 5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0, 30.0, 42.5, 50.0];
  return pick(amounts);
}

export function randomStaggeredDate(daysAgo: number): Date {
  const now = new Date();
  const offset = daysAgo * 24 * 60 * 60 * 1000;
  const randomOffset = Math.random() * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - offset + randomOffset);
}
