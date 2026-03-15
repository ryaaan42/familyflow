import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

type Household = {
  id: string;
  name: string;
  housing_type: string;
  surface_sqm: number;
  rooms: number;
  children_count: number;
  has_pets: boolean;
  city: string | null;
  is_expecting_baby?: boolean;
};

type Member = {
  id: string;
  display_name: string;
  age: number;
  role: string;
  avatar_color: string;
  availability_hours_per_week: number;
};

type Pet = { id: string; name: string; type: string; notes: string | null };

type Task = {
  id: string;
  title: string;
  category: string;
  due_date: string;
  status: "todo" | "in_progress" | "done" | "late";
  estimated_minutes: number;
  assigned_member_id?: string;
};

type Goal = {
  id: string;
  title: string;
  status: "active" | "completed" | "abandoned";
  current_value: number;
  target_value: number | null;
  unit: string | null;
};

type Meal = {
  id: string;
  week_start: string;
  day_of_week: number;
  meal_type: "lunch" | "dinner";
  title: string;
};

type ShoppingItem = {
  id: string;
  name: string;
  quantity: string | null;
  category: string;
  is_checked: boolean;
};

type BirthItem = {
  id: string;
  title: string;
  priority: "essentiel" | "utile" | "confort";
  status: "wanted" | "reserved" | "received";
  quantity: number;
  reserved_quantity: number;
};

interface MobileAppState {
  session: Session | null;
  user: User | null;
  household: Household | null;
  members: Member[];
  pets: Pet[];
  tasks: Task[];
  goals: Goal[];
  meals: Meal[];
  shopping: ShoppingItem[];
  birthList: BirthItem[];
  loading: boolean;
  bootstrapped: boolean;
  setAuth: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  hydrate: (payload: Partial<MobileAppState>) => void;
  resetData: () => void;
}

const initialData = {
  household: null,
  members: [],
  pets: [],
  tasks: [],
  goals: [],
  meals: [],
  shopping: [],
  birthList: []
};

export const useMobileAppStore = create<MobileAppState>((set) => ({
  session: null,
  user: null,
  ...initialData,
  loading: true,
  bootstrapped: false,
  setAuth: (session) => set({ session, user: session?.user ?? null }),
  setLoading: (loading) => set({ loading }),
  hydrate: (payload) => set({ ...payload, loading: false, bootstrapped: true }),
  resetData: () => set({ ...initialData, loading: false, bootstrapped: true }),
}));

export type { BirthItem, Goal, Meal, Member, Pet, ShoppingItem, Task };
