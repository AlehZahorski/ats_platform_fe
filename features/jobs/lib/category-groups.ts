/**
 * Top-level grouping for the 172 categories. Labels are looked up via
 * i18n keys `jobs.categoryGroups.{code}` — codes themselves are stable
 * machine identifiers and never change across locales.
 */
import {
  Code2, Palette, Megaphone, TrendingUp, Headphones, Wallet, Users, Scale,
  Settings2, Truck, Factory, Construction, Wrench, Stethoscope, GraduationCap,
  UtensilsCrossed, ShoppingBag, Scissors, Home, Shield, Camera, FlaskConical,
  Sprout, Car, Zap, Building2,
  type LucideIcon,
} from "lucide-react";

export type GroupCode =
  | "tech" | "design" | "marketing" | "sales" | "customer_service"
  | "finance" | "hr" | "legal" | "operations" | "logistics" | "manufacturing"
  | "construction" | "engineering" | "healthcare" | "education"
  | "hospitality" | "retail" | "beauty" | "cleaning" | "security"
  | "media" | "science" | "agriculture" | "automotive" | "energy" | "government";

export interface CategoryGroup {
  code: GroupCode;
  icon: LucideIcon;
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { code: "tech",             icon: Code2 },
  { code: "design",           icon: Palette },
  { code: "marketing",        icon: Megaphone },
  { code: "sales",            icon: TrendingUp },
  { code: "customer_service", icon: Headphones },
  { code: "finance",          icon: Wallet },
  { code: "hr",               icon: Users },
  { code: "legal",            icon: Scale },
  { code: "operations",       icon: Settings2 },
  { code: "logistics",        icon: Truck },
  { code: "manufacturing",    icon: Factory },
  { code: "construction",     icon: Construction },
  { code: "engineering",      icon: Wrench },
  { code: "healthcare",       icon: Stethoscope },
  { code: "education",        icon: GraduationCap },
  { code: "hospitality",      icon: UtensilsCrossed },
  { code: "retail",           icon: ShoppingBag },
  { code: "beauty",           icon: Scissors },
  { code: "cleaning",         icon: Home },
  { code: "security",         icon: Shield },
  { code: "media",            icon: Camera },
  { code: "science",          icon: FlaskConical },
  { code: "agriculture",      icon: Sprout },
  { code: "automotive",       icon: Car },
  { code: "energy",           icon: Zap },
  { code: "government",       icon: Building2 },
];

export const GROUP_MAP: Record<GroupCode, CategoryGroup> =
  CATEGORY_GROUPS.reduce((acc, g) => { acc[g.code] = g; return acc; }, {} as Record<GroupCode, CategoryGroup>);
