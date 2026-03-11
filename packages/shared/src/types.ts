export type Role = "parent" | "adulte" | "ado" | "enfant" | "autre";
export type HousingType = "appartement" | "maison";
export type Frequency = "quotidienne" | "hebdomadaire" | "mensuelle" | "personnalisee";
export type TaskCategory =
  | "menage"
  | "cuisine"
  | "animaux"
  | "enfants"
  | "administratif"
  | "budget"
  | "courses"
  | "hygiene"
  | "entretien"
  | "routine";
export type TaskStatus = "todo" | "in_progress" | "done" | "late";
export type BudgetItemType = "income" | "fixed" | "variable";
export type BudgetCategory =
  | "loyer_credit"
  | "courses"
  | "transport"
  | "abonnements"
  | "loisirs"
  | "sorties"
  | "restaurant_fast_food"
  | "animaux"
  | "enfants"
  | "sante"
  | "imprevus"
  | "maison";
export type HabitDomain = "sorties" | "repas" | "courses" | "linge" | "animaux" | "organisation";
export type PdfTheme = "minimal" | "familial-kawaii" | "premium" | "print";
export type PaperFormat = "A4";
export type PetType = "chien" | "chat" | "autre";
export type SubscriptionPlan = "free" | "plus" | "family-pro";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  locale: string;
  currency: string;
  plan: SubscriptionPlan;
}

export interface Household {
  id: string;
  name: string;
  housingType: HousingType;
  surfaceSqm: number;
  rooms: number;
  childrenCount: number;
  hasPets: boolean;
  city?: string;
  balanceScore: number;
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  name: string;
  age: number;
  role: Role;
  avatarColor: string;
  availabilityHoursPerWeek: number;
  favoriteCategories: TaskCategory[];
  blockedCategories: TaskCategory[];
}

export interface Pet {
  id: string;
  householdId: string;
  name: string;
  type: PetType;
  notes?: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  minAge: number;
  roles: Role[];
  requiresPetType?: PetType | "any";
  housingTypes?: HousingType[];
  baseFrequency: Frequency;
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  indirectCostPerMonth?: number;
  points: number;
}

export interface Task {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  frequency: Frequency;
  dueDate: string;
  status: TaskStatus;
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  indirectCostPerMonth?: number;
  assignedMemberId?: string;
  templateId?: string;
  minimumAge?: number;
  recommendedRoles?: Role[];
  origin: "template" | "custom" | "smart";
  createdAt: string;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  memberId: string;
  completedAt: string;
}

export interface BudgetMonth {
  id: string;
  householdId: string;
  month: string;
  targetSavings: number;
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  type: BudgetItemType;
  category: BudgetCategory;
  label: string;
  amount: number;
  recurring: boolean;
}

export interface SavingsScenario {
  id: string;
  householdId: string;
  title: string;
  description: string;
  domain: HabitDomain;
  monthlyCost: number;
  improvedMonthlyCost: number;
  linkedTaskCategory?: TaskCategory;
  effort: "facile" | "moyen" | "avance";
}

export interface SavingsProjection {
  label: string;
  months: number;
  currentCost: number;
  improvedCost: number;
  savings: number;
}

export interface PdfExportPreference {
  theme: PdfTheme;
  includeLegend: boolean;
  includeBudgetSummary: boolean;
  includeLogo: boolean;
  paperFormat: PaperFormat;
}

export interface NotificationSetting {
  emailDigest: boolean;
  budgetReminder: boolean;
  weeklyPdfReminder: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface HouseholdProfile {
  household: Household;
  members: HouseholdMember[];
  pets: Pet[];
}

export interface DemoDataset {
  user: UserProfile;
  profile: HouseholdProfile;
  tasks: Task[];
  completions: TaskCompletion[];
  budget: BudgetMonth;
  budgetItems: BudgetItem[];
  savingsScenarios: SavingsScenario[];
  pdfPreferences: PdfExportPreference;
  notificationSettings: NotificationSetting;
}

