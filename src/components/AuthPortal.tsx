"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  User as UserIcon,
  Building2,
  Truck,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { demoUsers, DEMO_PASSWORD } from "@/lib/seed-data";
import type { Role, User } from "@/lib/types";

const HOME: Record<Role, string> = {
  CUSTOMER: "/dashboard",
  B2B: "/dashboard",
  ADMIN: "/admin",
  DELIVERY: "/delivery",
};

const PORTAL_CONFIG: Record<
  Role,
  {
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    accentColor: string;
    allowRegister: boolean;
  }
> = {
  CUSTOMER: {
    title: "Customer Portal",
    subtitle: "Fresh dairy deliveries & recurring household subscriptions",
    badge: "B2C & Subscriptions",
    icon: UserIcon,
    accentColor: "bg-sky/10 text-sky border-sky/20",
    allowRegister: true,
  },
  B2B: {
    title: "B2B Wholesale Portal",
    subtitle: "Bulk dairy pricing for cafés, hotels, restaurants & sweet shops",
    badge: "Wholesale & Commercial",
    icon: Building2,
    accentColor: "bg-gold/10 text-gold border-gold/20",
    allowRegister: true,
  },
  DELIVERY: {
    title: "Delivery Staff Hub",
    subtitle: "Today's delivery routes, real-time route optimization & status updates",
    badge: "Delivery Operations",
    icon: Truck,
    accentColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    allowRegister: true,
  },
  ADMIN: {
    title: "Admin Management Portal",
    subtitle: "Inventory controls, EDI supplier feeds, orders & analytics",
    badge: "Staff & Management",
    icon: ShieldAlert,
    accentColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    allowRegister: false,
  },
};

const FIRST_NAMES = ["Anaya", "Priya", "Rohan", "Vikram", "Tanvi", "Aarav", "Aditya", "Neha", "Pooja", "Rahul", "Ishaan", "Sneha", "Kunal", "Meera", "Siddharth"];
const LAST_NAMES = ["Kulkarni", "Deshpande", "Joshi", "Patil", "Sharma", "Mehta", "Shinde", "Pawar", "Bapat", "Gaikwad", "Tambe", "Kadam", "Bhosale"];

const B2B_BUSINESSES = [
  "The Sweet Spot Café",
  "Green Leaf Bistro",
  "Chai & Bun Maska Co.",
  "Royal Confectionery",
  "Pure Delight Sweets",
  "Café GoodLuck Treats",
  "Sunrise Bakers & Dairy",
  "Silver Spoon Eatery",
  "Urban Kettle Café",
  "Fresh Morning Foods",
];

const DELIVERY_NAMES = [
  "Suresh Pawar",
  "Ramesh Gaikwad",
  "Sachin More",
  "Ganesh Jadhav",
  "Manoj Shinde",
  "Nitin Kadam",
  "Santosh Sawant",
  "Mahesh Bhosale",
  "Deepak Chavan",
];

const PUNE_LOCATIONS = [
  { area: "Kothrud", pincode: "411038", streets: ["14, Sunrise Apartments, Paud Road", "Flat 302, Mayur Colony", "B-12, Karve Road", "Plot 45, Dahanukar Colony"] },
  { area: "Baner", pincode: "411045", streets: ["Flat 501, Green Vista, Baner Road", "Row House 4, Pan Card Club Road", "18, Beverly Hills Society"] },
  { area: "Viman Nagar", pincode: "411014", streets: ["B-404, Clover Park", "Shop 6, Dutta Mandir Chowk", "Flat 12, Sky Lounge, Symbiosis Road"] },
  { area: "Aundh", pincode: "411007", streets: ["12, Rose Villa, DP Road", "Flat 204, Sindh Society", "Plot 8, ITI Road"] },
  { area: "Kalyani Nagar", pincode: "411006", streets: ["Flat 702, Central Park View", "Villa 9, Princeton Town", "C-3, East Avenue"] },
  { area: "Wakad", pincode: "411057", streets: ["Tower 3, Flat 904, Costa Rica", "Flat 102, Park Street", "Shop 2, Datta Mandir Road"] },
  { area: "Shivajinagar", pincode: "411005", streets: ["Shop 4, FC Road", "Flat 101, Model Colony", "22, Ghole Road"] },
  { area: "Hadapsar", pincode: "411028", streets: ["Flat 602, Magarpatta City", "B-10, Amanora Park Town", "Plot 33, Gadital"] },
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPhone(): string {
  const prefix = getRandomItem(["98", "97", "99", "88", "86", "77", "94", "96"]);
  const suffix = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${suffix}`.slice(0, 10);
}

function generateRandomRegisterData(portalRole: Role) {
  const loc = getRandomItem(PUNE_LOCATIONS);
  const street = getRandomItem(loc.streets);
  const randomSuffix = Math.floor(100 + Math.random() * 900);

  if (portalRole === "B2B") {
    const bizName = getRandomItem(B2B_BUSINESSES);
    const slug = bizName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
    return {
      name: bizName,
      phone: getRandomPhone(),
      email: `${slug}.${randomSuffix}@gmail.com`,
      password: DEMO_PASSWORD,
      line: street,
      area: loc.area,
      city: "Pune",
      pincode: loc.pincode,
    };
  }

  if (portalRole === "DELIVERY") {
    const staffName = getRandomItem(DELIVERY_NAMES);
    const slug = staffName.toLowerCase().replace(/\s+/g, ".");
    return {
      name: staffName,
      phone: getRandomPhone(),
      email: `${slug}.${randomSuffix}@dairyfresh.test`,
      password: DEMO_PASSWORD,
      line: street,
      area: loc.area,
      city: "Pune",
      pincode: loc.pincode,
    };
  }

  // Customer
  const firstName = getRandomItem(FIRST_NAMES);
  const lastName = getRandomItem(LAST_NAMES);
  const fullName = `${firstName} ${lastName}`;
  const slug = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  return {
    name: fullName,
    phone: getRandomPhone(),
    email: `${slug}.${randomSuffix}@gmail.com`,
    password: DEMO_PASSWORD,
    line: street,
    area: loc.area,
    city: "Pune",
    pincode: loc.pincode,
  };
}

const inputClass = "mt-1 w-full rounded-lg border border-dairy/20 px-3 py-2 text-sm focus:border-sky focus:outline-none";

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-medium text-dairy">
      {label}
      <input required className={inputClass} {...props} />
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  showPassword,
  setShowPassword,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm font-medium text-dairy">
      {label}
      <div className="relative mt-1">
        <input
          required
          type={showPassword ? "text" : "password"}
          minLength={6}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-dairy/20 px-3 py-2 pr-10 text-sm focus:border-sky focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/40 transition hover:text-dairy focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

const ROLE_TABS: { value: Role; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { value: "CUSTOMER", label: "Customer", icon: UserIcon },
  { value: "B2B", label: "B2B Buyer", icon: Building2 },
  { value: "DELIVERY", label: "Delivery", icon: Truck },
  { value: "ADMIN", label: "Admin", icon: ShieldAlert },
];

export default function AuthPortal({ role = "CUSTOMER" }: { role?: Role }) {
  const { db, login } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;

  const [currentRole, setCurrentRole] = useState<Role>(role);
  const [mode, setMode] = useState<"login" | "register">("login");

  const config = PORTAL_CONFIG[currentRole] ?? PORTAL_CONFIG.CUSTOMER;
  const IconComponent = config.icon;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [line, setLine] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Pune");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [quickFilledNotice, setQuickFilledNotice] = useState<string | null>(null);

  function handleRegisterQuickFill() {
    const data = generateRandomRegisterData(currentRole);
    setName(data.name);
    setPhone(data.phone);
    setEmail(data.email);
    setPassword(data.password);
    setLine(data.line);
    setArea(data.area);
    setCity(data.city);
    setPincode(data.pincode);
    setError("");
    setQuickFilledNotice(`Generated random ${currentRole} profile: "${data.name}"`);
    setTimeout(() => setQuickFilledNotice(null), 3500);
  }

  // Mock auth: any password is accepted; the email just picks (or creates) a local user.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    let user: User;

    if (mode === "register") {
      if (existing) return setError("An account with this email already exists. Log in instead.");
      user = {
        id: `u_${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        phone,
        role: currentRole,
        addresses: currentRole === "DELIVERY" ? [] : [{ id: "addr1", line, area, city, pincode, isDefault: true }],
        walletBalance: 0,
        loyaltyPoints: 0,
      };
    } else {
      if (!existing) return setError("No account found for this email. Register first.");
      if (existing.role !== currentRole) return setError(`This account is a ${existing.role} account. Pick that tab to log in.`);
      user = existing;
    }

    login(user);
    router.push(next ?? HOME[user.role]);
  }

  // Demo user for the currently active role tab
  const portalDemoUser = demoUsers.find((u) => u.role === currentRole);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      {/* Active Portal Header */}
      <div className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-dairy/10 bg-white shadow-xs">
          <IconComponent size={24} className="text-dairy" />
        </div>
        <div className="inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
          <span className={`rounded-full px-2 py-0.5 ${config.accentColor}`}>{config.badge}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-dairy">{config.title}</h1>
        <p className="mt-1 text-xs text-foreground/60">{config.subtitle}</p>
      </div>

      {/* Tab Switcher (Log in / Register) */}
      <div className="mt-6 flex rounded-full border border-dairy/20 p-1">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(""); setQuickFilledNotice(null); }}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
            mode === "login" ? "bg-dairy text-white shadow-xs" : "text-dairy hover:bg-dairy/5"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            if (currentRole === "ADMIN") setCurrentRole("CUSTOMER");
            setError("");
            setQuickFilledNotice(null);
          }}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
            mode === "register" ? "bg-dairy text-white shadow-xs" : "text-dairy hover:bg-dairy/5"
          }`}
        >
          Register
        </button>
      </div>

      {/* Interactive Role Selection Tabs (Positioned directly below Log in / Register tab) */}
      <div className="mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50 mb-1.5 px-1">
          Select Account Type
        </div>
        <div className={`grid gap-1.5 rounded-2xl border border-dairy/15 bg-dairy/[0.04] p-1.5 text-xs font-semibold shadow-xs ${
          mode === "register" ? "grid-cols-3" : "grid-cols-4"
        }`}>
          {ROLE_TABS.map((t) => {
            if (mode === "register" && t.value === "ADMIN") return null;
            const active = currentRole === t.value;
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setCurrentRole(t.value);
                  setError("");
                  setQuickFilledNotice(null);
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-center transition ${
                  active
                    ? "bg-white text-dairy shadow-sm font-bold border border-dairy/10"
                    : "text-foreground/60 hover:text-dairy hover:bg-white/50"
                }`}
              >
                <Icon size={14} className={active ? "text-sky" : "opacity-70"} />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Fill Bar - ONLY in Register Mode for this specific portal */}
      {mode === "register" && config.allowRegister && (
        <div className="mt-5 rounded-2xl border border-sky/30 bg-sky/5 p-3.5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-dairy">
              <Sparkles size={14} className="text-gold" />
              <span>Quick Fill ({currentRole})</span>
            </div>
            <span className="text-[11px] text-foreground/60">Random data (does not submit)</span>
          </div>
          <div className="mt-2.5">
            <button
              type="button"
              onClick={handleRegisterQuickFill}
              className="inline-flex items-center gap-1.5 rounded-full border border-dairy/15 bg-white px-3.5 py-1.5 text-xs font-medium text-dairy shadow-xs transition hover:border-sky hover:bg-sky/10 hover:text-sky"
            >
              <span>🎲 Generate Random {currentRole === "B2B" ? "B2B Buyer" : currentRole === "DELIVERY" ? "Delivery Staff" : "Customer"}</span>
            </button>
          </div>
          {quickFilledNotice && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-700">
              <CheckCircle2 size={13} className="shrink-0" />
              <span>{quickFilledNotice}</span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "register" && (
          <>
            <Field
              label={currentRole === "B2B" ? "Business name" : "Full name"}
              name="name"
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <Field
              label="Mobile number"
              name="phone"
              type="tel"
              pattern="[6-9][0-9]{9}"
              title="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </>
        )}

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        {mode === "register" && currentRole !== "DELIVERY" && (
          <fieldset className="space-y-3 rounded-xl border border-dairy/10 p-3">
            <legend className="px-1 text-sm font-medium text-dairy">
              {currentRole === "B2B" ? "Business delivery address" : "Delivery address"}
            </legend>
            <Field
              label="House / shop, street"
              name="line"
              value={line}
              onChange={(e) => setLine(e.target.value)}
              autoComplete="street-address"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Area"
                name="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
              <Field
                label="City"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
              />
            </div>
            <Field
              label="Pincode"
              name="pincode"
              inputMode="numeric"
              pattern="[0-9]{6}"
              title="6-digit pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              autoComplete="postal-code"
            />
          </fieldset>
        )}

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button
          className="w-full rounded-full bg-dairy py-2.5 font-medium text-white transition hover:bg-sky disabled:opacity-60"
        >
          {mode === "login"
            ? `Log in as ${currentRole === "B2B" ? "B2B Buyer" : currentRole === "DELIVERY" ? "Delivery Staff" : currentRole === "ADMIN" ? "Admin" : "Customer"}`
            : `Create ${currentRole === "B2B" ? "B2B" : currentRole === "DELIVERY" ? "Delivery" : "Customer"} Account`}
        </button>
      </form>

      {/* Demo Credentials quick fill for Login Mode */}
      {mode === "login" && portalDemoUser && (
        <div className="mt-8 rounded-2xl border border-dairy/10 bg-dairy/5 p-4 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
            Demo {currentRole} Account
          </div>
          <p className="mt-1 text-xs text-foreground/50">Click below to auto-fill demo credentials</p>
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => {
                setEmail(portalDemoUser.email);
                setPassword(DEMO_PASSWORD);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-sky/15 px-4 py-1.5 text-xs font-medium text-sky transition hover:bg-sky/25"
            >
              <span>{portalDemoUser.email} (Password: {DEMO_PASSWORD})</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
