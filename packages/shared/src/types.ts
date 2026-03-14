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
export type BirthListPriority = "essentiel" | "utile" | "confort";
export type BirthListStatus = "wanted" | "reserved" | "received";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  locale: string;
  currency: string;
  plan: SubscriptionPlan;
  isAdmin: boolean;
}

export interface AdminUserRow {
  id: string;
  email: string;
  displayName: string;
  plan: SubscriptionPlan;
  isAdmin: boolean;
  createdAt: string;
  householdName?: string;
}

export interface SiteContent {
  key: string;
  label: string;
  value: string;
  section: string;
  updatedAt: string;
}

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  category: string;
  enabled: boolean;
  updatedAt: string;
}


export interface AdminSetting {
  key: string;
  label: string;
  value: string;
  section: string;
  isSecret: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  maxRedemptions?: number;
  redeemedCount: number;
  validUntil?: string;
  active: boolean;
}

export interface SubscriptionPlanConfig {
  key: string;
  label: string;
  stripePriceId?: string;
  monthlyPriceCents: number;
  description: string;
  features: string[];
  active: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalHouseholds: number;
  totalTasks: number;
  totalExports: number;
  planBreakdown: Record<SubscriptionPlan, number>;
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
  isExpectingBaby?: boolean;
  pregnancyDueDate?: string;
  birthListShareSlug?: string;
  balanceScore: number;
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  name: string;
  age: number;
  role: Role;
  memberCategory?: "adulte" | "ado" | "enfant" | "bebe";
  avatarColor: string;
  availabilityHoursPerWeek: number;
  isPregnant?: boolean;
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
  maxAge?: number;
  roles: Role[];
  requiresPetType?: PetType | "any";
  housingTypes?: HousingType[];
  householdSizeMin?: number;
  childrenCountMin?: number;
  roomCountMin?: number;
  preferredDayOffset?: number;
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
  dayOfWeek?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  templateId?: string;
  minimumAge?: number;
  recommendedRoles?: Role[];
  smartReason?: string;
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

export interface BirthListItem {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  category: "mobilier" | "repas" | "sorties" | "hygiene" | "vetements" | "eveil" | "soin";
  priority: BirthListPriority;
  status: BirthListStatus;
  quantity: number;
  reservedQuantity: number;
  estimatedPrice?: number;
  storeUrl?: string;
  notes?: string;
}

export interface HouseholdProfile {
  household: Household;
  members: HouseholdMember[];
  pets: Pet[];
}

export interface AiHouseholdPlanItem {
  title: string;
  reason: string;
  who: string;
  when: string;
  category?: TaskCategory;
  frequency?: Frequency;
  suggestedMemberId?: string;
  estimatedMinutes?: number;
}

export interface AiRoutineSuggestion {
  title: string;
  timing: "matin" | "soir" | "hebdomadaire";
  steps: string[];
}

export interface AiBirthListSuggestion {
  title: string;
  reason: string;
  priority: BirthListPriority;
}

export interface AiHouseholdPlan {
  headline: string;
  summary: string;
  taskFocus: AiHouseholdPlanItem[];
  routines: string[];
  savingsMoves: string[];
  birthListSuggestions: AiBirthListSuggestion[];
  notes?: string[];
  routineSuggestions?: AiRoutineSuggestion[];
  budgetSuggestions?: string[];
  usedFallback: boolean;
}

// ── Meal planning ────────────────────────────────────────────────────────────

export type MealType = "lunch" | "dinner";

export interface MealPlan {
  id: string;
  householdId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  dayOfWeek: number; // 0 = Monday … 6 = Sunday
  mealType: MealType;
  title: string;
  notes?: string;
}

// ── Shopping list ─────────────────────────────────────────────────────────────

export type ShoppingCategory =
  | "epicerie"
  | "frais"
  | "boucherie_poisson"
  | "fruits_legumes"
  | "boissons"
  | "hygiene_beaute"
  | "menage"
  | "bebe"
  | "animaux"
  | "autre";

export interface ShoppingItem {
  id: string;
  householdId: string;
  name: string;
  quantity?: string;
  category: ShoppingCategory;
  isChecked: boolean;
  addedByMemberId?: string;
  createdAt: string;
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export type GoalCategory =
  | "budget"
  | "sante"
  | "organisation"
  | "education"
  | "sport"
  | "ecologie"
  | "autre";

export type GoalStatus = "active" | "completed" | "abandoned";

export interface HouseholdGoal {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue: number;
  unit?: string;
  category: GoalCategory;
  dueDate?: string;
  status: GoalStatus;
  createdAt: string;
}

export interface DemoDataset {
  user: UserProfile;
  profile: HouseholdProfile;
  tasks: Task[];
  completions: TaskCompletion[];
  budget: BudgetMonth;
  budgetItems: BudgetItem[];
  savingsScenarios: SavingsScenario[];
  birthListItems: BirthListItem[];
  pdfPreferences: PdfExportPreference;
  notificationSettings: NotificationSetting;
}
