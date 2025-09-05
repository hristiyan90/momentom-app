import { Home, Calendar, Activity, BarChart3, Settings, User, Palette, Target, Trophy, Gauge } from "lucide-react"

export interface NavigationItem {
  href: string
  label: string
  icon: keyof typeof NAVIGATION_ICONS
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "/cockpit", label: "Cockpit", icon: "Gauge" },
  { href: "/calendar", label: "Calendar", icon: "Calendar" },
  { href: "/training", label: "Training", icon: "Activity" },
  { href: "/progress", label: "Progress", icon: "BarChart3" },
  { href: "/races", label: "Races", icon: "Trophy" },
  { href: "/zones", label: "Zones", icon: "Target" },
  { href: "/profile", label: "Profile", icon: "User" },
  { href: "/preferences", label: "Preferences", icon: "Settings" },
  { href: "/design/colors", label: "Color System", icon: "Palette" },
  { href: "/onboarding", label: "Onboarding", icon: "User" },
]

export const NAVIGATION_ICONS = {
  Home,
  Calendar,
  Activity,
  BarChart3,
  Target,
  User,
  Settings,
  Palette,
  Trophy,
  Gauge,
} as const

// Legacy exports for backward compatibility
export const NAV = NAVIGATION_ITEMS
export const NAV_ICONS = NAVIGATION_ICONS
