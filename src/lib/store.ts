import { create } from "zustand";
import { persist } from "zustand/middleware";
import { bucketFund, bucketMeta, type Bucket } from "../data/funds";
import { templateById } from "../data/templates";
import { addMonths, monthsBetween } from "./format";
import { futureValue, recommendBucket, requiredMonthly, roundUpTo, type Risk } from "./plan";

export type Vibe = "student" | "intern" | "firstjob" | "freelancer";
export type Rhythm = "monthly" | "irregular" | "allowance";
export type PlanMode = "monthly" | "weekly" | "payday";

export interface Profile {
  name: string;
  vibe: Vibe;
  rhythm: Rhythm;
  payday: number;
  risk: Risk;
  monthly: number;
  idle: number;
}

export interface Plan {
  mode: PlanMode;
  amount: number;
  paused: boolean;
  skipNext: boolean;
  stepUp: number;
}

export interface Stash {
  id: string;
  templateId: string;
  name: string;
  emoji: string;
  color: string;
  target: number;
  deadline: string;
  bucket: Bucket;
  fundId: string;
  invested: number;
  growth: number;
  plan: Plan;
  createdAt: string;
}

export interface Txn {
  id: string;
  stashId: string;
  amount: number;
  kind: "in" | "out";
  note: string;
  date: string;
}

export interface Notice {
  title: string;
  body: string;
  route?: string;
}

interface Settings {
  calm: boolean;
  dark: boolean;
  roundups: boolean;
  spice: boolean;
}

interface State {
  onboarded: boolean;
  profile: Profile;
  stashes: Stash[];
  txns: Txn[];
  streakWeeks: number;
  freezes: number;
  settings: Settings;
  dip: boolean;
  paydayPending: boolean;
  bytesDone: string[];
  fnoUnlockAt: number | null;
  notice: Notice | null;
  toast: string | null;
  celebrate: string | null;
  decode: string | null;

  completeOnboarding: (profile: Profile, templateIds: string[]) => void;
  addStash: (input: NewStashInput) => string;
  invest: (stashId: string, amount: number, note: string) => void;
  withdraw: (stashId: string, amount: number) => void;
  updatePlan: (stashId: string, plan: Partial<Plan>) => void;
  deleteStash: (stashId: string) => void;
  splitPayday: (allocations: Record<string, number>) => void;
  dismissPayday: () => void;
  spendFreeze: () => void;
  triggerPayday: () => void;
  setDip: (dip: boolean) => void;
  setSetting: (key: keyof Settings, value: boolean) => void;
  markByte: (id: string) => void;
  startFnoCooloff: () => void;
  loadDemo: () => void;
  reset: () => void;
  setName: (name: string) => void;
  showToast: (message: string | null) => void;
  setNotice: (notice: Notice | null) => void;
  setCelebrate: (kind: string | null) => void;
  openDecode: (key: string | null) => void;
}

export interface NewStashInput {
  templateId: string;
  name: string;
  target: number;
  deadline: string;
  bucket: Bucket;
  plan: Plan;
}

const id = () => Math.random().toString(36).slice(2, 10);

const defaultProfile: Profile = { name: "", vibe: "firstjob", rhythm: "monthly", payday: 7, risk: "steady", monthly: 2000, idle: 0 };

const freshState = {
  onboarded: false,
  profile: defaultProfile,
  stashes: [] as Stash[],
  txns: [] as Txn[],
  streakWeeks: 0,
  freezes: 2,
  settings: { calm: true, dark: false, roundups: false, spice: false },
  dip: false,
  paydayPending: false,
  bytesDone: [] as string[],
  fnoUnlockAt: null as number | null,
};

function makeStash(input: NewStashInput): Stash {
  const template = templateById(input.templateId);
  return {
    id: id(),
    templateId: input.templateId,
    name: input.name,
    emoji: template.emoji,
    color: template.color,
    target: input.target,
    deadline: input.deadline,
    bucket: input.bucket,
    fundId: bucketFund[input.bucket],
    invested: 0,
    growth: 0,
    plan: input.plan,
    createdAt: new Date().toISOString(),
  };
}

export interface StarterStash extends NewStashInput {
  fullTarget: number;
  fullMonthly: number;
}

// splits the monthly comfort amount across goals so it adds up exactly; the emergency cushion gets
// double weight, no goal gets more than it needs, and a goal that isn't affordable yet becomes a
// first milestone that can actually be hit on time
export function starterPlan(profile: Profile, templateIds: string[]): { stashes: StarterStash[]; spare: number } {
  const mode: PlanMode = profile.rhythm === "allowance" ? "monthly" : "payday";
  const items = templateIds.map((templateId) => {
    const template = templateById(templateId);
    const { bucket } = recommendBucket(template.defaultMonths, profile.risk, templateId === "emergency");
    const rate = bucketMeta[bucket].rate;
    const needed = roundUpTo(requiredMonthly(template.defaultTarget, 0, template.defaultMonths, rate), 100);
    return { templateId, template, bucket, rate, needed, weight: templateId === "emergency" ? 2 : 1, amount: 0 };
  });
  const budget = Math.floor(profile.monthly / 100) * 100;
  let open = [...items];
  let remaining = budget;
  while (open.length && remaining >= 100) {
    const totalWeight = open.reduce((sum, item) => sum + item.weight, 0);
    const shareOf = (item: (typeof items)[number]) => Math.floor((remaining * item.weight) / totalWeight / 100) * 100;
    const capped = open.filter((item) => item.needed <= shareOf(item));
    if (capped.length) {
      capped.forEach((item) => {
        item.amount = item.needed;
        remaining -= item.needed;
      });
      open = open.filter((item) => !capped.includes(item));
      continue;
    }
    open.forEach((item) => (item.amount = shareOf(item)));
    remaining = budget - items.reduce((sum, item) => sum + item.amount, 0);
    for (const item of open) {
      const top = Math.min(remaining, item.needed - item.amount);
      item.amount += top;
      remaining -= top;
    }
    break;
  }
  const stashes = items.map(({ templateId, template, bucket, rate, needed, amount }) => {
    const value = futureValue(0, amount, template.defaultMonths, rate);
    const step = value >= 10000 ? 1000 : 100;
    const reachable = Math.floor(value / step) * step;
    return {
      templateId,
      name: template.defaultName,
      target: amount === 0 ? template.defaultTarget : Math.min(template.defaultTarget, reachable),
      fullTarget: template.defaultTarget,
      fullMonthly: needed,
      deadline: addMonths(new Date(), template.defaultMonths).toISOString(),
      bucket,
      plan: { mode, amount: amount || 100, paused: amount === 0, skipNext: false, stepUp: 0 },
    };
  });
  return { stashes, spare: remaining };
}

export const incomeMoment: Record<Vibe, { source: string; amount: number; title: string; body: string }> = {
  firstjob: { source: "Salary", amount: 42000, title: "Salary just landed 💸", body: "Pay future-you first? Your split is ready — one tap." },
  intern: { source: "Stipend", amount: 18000, title: "Stipend's in 💸", body: "Want to send a slice to your stashes before the month happens?" },
  freelancer: { source: "Client payment", amount: 18000, title: "₹18,000 from a client just landed", body: "Put 10% towards your stashes? You choose how much." },
  student: { source: "Pocket money", amount: 4000, title: "Pocket money's in", body: "₹400 to future-you? Only if it works this month." },
};

export const demoName = "Parth";

function demoState(name: string) {
  const now = new Date();
  const monthsAgo = (months: number) => addMonths(now, -months).toISOString();
  const profile: Profile = { name, vibe: "firstjob", rhythm: "monthly", payday: 7, risk: "steady", monthly: 7500, idle: 18000 };
  const stashes: Stash[] = [
    {
      ...makeStash({
        templateId: "emergency",
        name: "Emergency cushion",
        target: 40000,
        deadline: addMonths(now, 8).toISOString(),
        bucket: "steady",
        plan: { mode: "payday", amount: 3000, paused: false, skipNext: false, stepUp: 0 },
      }),
      invested: 16000,
      growth: 0.021,
      createdAt: monthsAgo(5),
    },
    {
      ...makeStash({
        templateId: "trip",
        name: "Goa with the gang",
        target: 25000,
        deadline: addMonths(now, 5).toISOString(),
        bucket: "steady",
        plan: { mode: "payday", amount: 2500, paused: false, skipNext: false, stepUp: 0 },
      }),
      invested: 13000,
      growth: 0.018,
      createdAt: monthsAgo(6),
    },
    {
      ...makeStash({
        templateId: "freedom",
        name: "Freedom fund",
        target: 450000,
        deadline: addMonths(now, 118).toISOString(),
        bucket: "growth",
        plan: { mode: "payday", amount: 2000, paused: false, skipNext: false, stepUp: 0 },
      }),
      invested: 10000,
      growth: 0.064,
      createdAt: monthsAgo(5),
    },
  ];
  const txns: Txn[] = [];
  stashes.forEach((stash) => {
    const count = Math.round(stash.invested / stash.plan.amount);
    for (let index = 0; index < count; index++) {
      txns.push({ id: id(), stashId: stash.id, amount: stash.plan.amount, kind: "in", note: "Payday SIP", date: monthsAgo(count - index - 1) });
    }
  });
  txns.sort((a, b) => b.date.localeCompare(a.date));
  return {
    ...freshState,
    onboarded: true,
    profile,
    stashes,
    txns,
    streakWeeks: 19,
    freezes: 1,
    bytesDone: ["mutual-funds", "emergency"],
  };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...freshState,
      notice: null,
      toast: null,
      celebrate: null,
      decode: null,

      completeOnboarding: (profile, templateIds) => {
        const stashes = starterPlan(profile, templateIds).stashes.map(makeStash);
        set({ onboarded: true, profile, stashes, txns: [], streakWeeks: 0 });
      },

      addStash: (input) => {
        const stash = makeStash(input);
        set({ stashes: [...get().stashes, stash] });
        return stash.id;
      },

      invest: (stashId, amount, note) => {
        const { stashes, txns, streakWeeks } = get();
        const isFirst = txns.length === 0;
        set({
          stashes: stashes.map((stash) => (stash.id === stashId ? { ...stash, invested: stash.invested + amount } : stash)),
          txns: [{ id: id(), stashId, amount, kind: "in", note, date: new Date().toISOString() }, ...txns],
          streakWeeks: streakWeeks === 0 ? 1 : streakWeeks,
          celebrate: isFirst ? "first" : get().celebrate,
        });
      },

      withdraw: (stashId, amount) => {
        set({
          stashes: get().stashes.map((stash) =>
            stash.id === stashId ? { ...stash, invested: Math.max(0, stash.invested - amount / (1 + stash.growth)) } : stash,
          ),
          txns: [{ id: id(), stashId, amount, kind: "out", note: "Withdrawal to bank", date: new Date().toISOString() }, ...get().txns],
        });
      },

      updatePlan: (stashId, plan) =>
        set({ stashes: get().stashes.map((stash) => (stash.id === stashId ? { ...stash, plan: { ...stash.plan, ...plan } } : stash)) }),

      deleteStash: (stashId) => set({ stashes: get().stashes.filter((stash) => stash.id !== stashId) }),

      splitPayday: (allocations) => {
        Object.entries(allocations).forEach(([stashId, amount]) => {
          if (amount > 0) get().invest(stashId, amount, "Payday split");
        });
        set({ paydayPending: false, streakWeeks: get().streakWeeks + 1 });
      },

      dismissPayday: () => set({ paydayPending: false }),

      spendFreeze: () => set({ freezes: Math.max(0, get().freezes - 1), paydayPending: false }),

      triggerPayday: () => {
        const moment = incomeMoment[get().profile.vibe];
        set({ paydayPending: true, notice: { title: moment.title, body: moment.body, route: "/payday" } });
      },

      setDip: (dip) =>
        set({
          dip,
          notice: dip ? { title: "Markets are having a moment", body: "Nifty is down 4.1% this week. Here's what it means for you (spoiler: not much).", route: "/" } : null,
        }),

      setSetting: (key, value) => set({ settings: { ...get().settings, [key]: value } }),

      markByte: (byteId) => {
        if (!get().bytesDone.includes(byteId)) set({ bytesDone: [...get().bytesDone, byteId] });
      },

      startFnoCooloff: () => set({ fnoUnlockAt: Date.now() + 24 * 60 * 60 * 1000 }),

      // the demo account keeps whatever name the user already gave us
      loadDemo: () => set({ ...demoState(get().profile.name.trim() || demoName), notice: null, celebrate: null, toast: null }),

      setName: (name) => set({ profile: { ...get().profile, name } }),

      reset: () => set({ ...freshState, notice: null, celebrate: null, toast: null, settings: { ...freshState.settings, dark: get().settings.dark } }),

      showToast: (toast) => set({ toast }),
      setNotice: (notice) => set({ notice }),
      setCelebrate: (celebrate) => set({ celebrate }),
      openDecode: (decode) => set({ decode }),
    }),
    {
      name: "groww-genz",
      version: 3,
      migrate: () => ({ ...freshState }) as never,
      partialize: ({ notice, toast, celebrate, decode, ...rest }) => rest,
    },
  ),
);

const dipDrop: Record<Bucket, number> = { steady: -0.001, balanced: -0.034, growth: -0.071 };
const todayMove: Record<Bucket, { up: number; down: number }> = {
  steady: { up: 0.0002, down: -0.0001 },
  balanced: { up: 0.0031, down: -0.012 },
  growth: { up: 0.0062, down: -0.027 },
};

export function stashValue(stash: Stash, dip: boolean): number {
  return stash.invested * (1 + stash.growth) * (1 + (dip ? dipDrop[stash.bucket] : 0));
}

export function stashDayChange(stash: Stash, dip: boolean): number {
  const move = todayMove[stash.bucket];
  return stashValue(stash, dip) * (dip ? move.down : move.up);
}

export function portfolio(stashes: Stash[], dip: boolean) {
  const value = stashes.reduce((sum, stash) => sum + stashValue(stash, dip), 0);
  const invested = stashes.reduce((sum, stash) => sum + stash.invested, 0);
  const day = stashes.reduce((sum, stash) => sum + stashDayChange(stash, dip), 0);
  return { value, invested, gain: value - invested, day };
}

export function monthsLeft(stash: Stash): number {
  return monthsBetween(new Date(), new Date(stash.deadline));
}

export function monthlyEquivalent(plan: Plan): number {
  if (plan.paused) return 0;
  return plan.mode === "weekly" ? plan.amount * 4.33 : plan.amount;
}
