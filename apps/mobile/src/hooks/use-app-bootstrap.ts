import { useCallback, useEffect } from "react";

import { supabase } from "../lib/supabase";
import { useMobileAppStore } from "../state/use-mobile-app-store";

const todayIso = new Date().toISOString().slice(0, 10);

const monday = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const base = new Date(now);
  base.setDate(now.getDate() + diff);
  return base.toISOString().slice(0, 10);
};

export function useAppBootstrap() {
  const store = useMobileAppStore();

  const loadHouseholdData = useCallback(async () => {
    if (!store.user) return;

    store.setLoading(true);

    const owned = await supabase
      .from("households")
      .select("*")
      .eq("owner_user_id", store.user.id)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    let household = owned.data;
    if (!household) {
      const memberLink = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", store.user.id)
        .is("deleted_at", null)
        .limit(1)
        .maybeSingle();

      if (memberLink.data?.household_id) {
        const joined = await supabase
          .from("households")
          .select("*")
          .eq("id", memberLink.data.household_id)
          .is("deleted_at", null)
          .maybeSingle();
        household = joined.data;
      }
    }

    if (!household) {
      store.hydrate({ household: null });
      return;
    }

    const [{ data: members }, { data: pets }, { data: tasks }, { data: goals }, { data: meals }, { data: shopping }, { data: birthList }] =
      await Promise.all([
        supabase
          .from("household_members")
          .select("id, display_name, age, role, avatar_color, availability_hours_per_week")
          .eq("household_id", household.id)
          .is("deleted_at", null)
          .order("created_at"),
        supabase
          .from("pets")
          .select("id, name, type, notes")
          .eq("household_id", household.id)
          .is("deleted_at", null)
          .order("created_at"),
        supabase
          .from("tasks")
          .select("id, title, category, due_date, status, estimated_minutes")
          .eq("household_id", household.id)
          .is("deleted_at", null)
          .order("due_date"),
        supabase
          .from("household_goals")
          .select("id, title, status, current_value, target_value, unit")
          .eq("household_id", household.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
        supabase
          .from("meal_plans")
          .select("id, week_start, day_of_week, meal_type, title")
          .eq("household_id", household.id)
          .eq("week_start", monday())
          .order("day_of_week"),
        supabase
          .from("shopping_list_items")
          .select("id, name, quantity, category, is_checked")
          .eq("household_id", household.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
        supabase
          .from("birth_list_items")
          .select("id, title, priority, status, quantity, reserved_quantity")
          .eq("household_id", household.id)
          .order("created_at", { ascending: false })
      ]);

    store.hydrate({
      household,
      members: members ?? [],
      pets: pets ?? [],
      tasks: tasks ?? [],
      goals: goals ?? [],
      meals: meals ?? [],
      shopping: shopping ?? [],
      birthList: birthList ?? []
    });
  }, [store]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      store.setAuth(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      store.setAuth(session);
      if (!session) store.resetData();
    });

    return () => listener.subscription.unsubscribe();
  }, [store]);

  useEffect(() => {
    if (!store.session) {
      store.setLoading(false);
      return;
    }
    loadHouseholdData();
  }, [loadHouseholdData, store.session]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const createHousehold = async (payload: {
    name: string;
    city: string;
    housingType: "appartement" | "maison";
    rooms: number;
    surfaceSqm: number;
    childrenCount: number;
    hasPets: boolean;
    memberName: string;
  }) => {
    const { error } = await supabase.rpc("create_household_with_members", {
      p_name: payload.name,
      p_housing_type: payload.housingType,
      p_surface_sqm: payload.surfaceSqm,
      p_rooms: payload.rooms,
      p_children_count: payload.childrenCount,
      p_has_pets: payload.hasPets,
      p_city: payload.city,
      p_is_expecting_baby: false,
      p_pregnancy_due_date: null,
      p_members: [{ displayName: payload.memberName, age: 32, role: "parent", avatarColor: "#6D5EF4" }]
    });
    if (error) throw error;
    await loadHouseholdData();
  };

  const toggleTask = async (taskId: string, current: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: current === "done" ? "todo" : "done" })
      .eq("id", taskId);
    if (error) throw error;
    await loadHouseholdData();
  };

  const assignTask = async (taskId: string, memberId: string) => {
    const task = store.tasks.find((item) => item.id === taskId);
    if (!task) return;
    const { error } = await supabase.from("task_assignments").upsert({
      task_id: taskId,
      member_id: memberId,
      scheduled_for: task.due_date || todayIso,
      status: task.status
    });
    if (error) throw error;
    await loadHouseholdData();
  };

  const toggleShoppingItem = async (itemId: string, checked: boolean) => {
    const { error } = await supabase
      .from("shopping_list_items")
      .update({ is_checked: !checked })
      .eq("id", itemId);
    if (error) throw error;
    await loadHouseholdData();
  };

  return {
    ...store,
    refresh: loadHouseholdData,
    signIn,
    signUp,
    signOut,
    createHousehold,
    toggleTask,
    assignTask,
    toggleShoppingItem
  };
}
