import { PARENT_PORTAL_ENABLED } from "@/lib/features"

export const siteNavLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Academics", path: "/academics" },
  { label: "Gallery", path: "/gallery" },
  { label: "Admissions", path: "/admissions" },
  { label: "Contact", path: "/contact" },
]

export const portalLinks = [
  { label: "CBT Portal", path: "/cbt" },
  { label: "Student Login", path: "/student/login" },
  ...(PARENT_PORTAL_ENABLED ? [{ label: "Parent Login", path: "/parent/login" }] : []),
]
