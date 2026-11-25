import { PortalLogin, type PortalLoginCopy } from "./PortalLogin"
import { PortalLoginForm, type PortalLoginFormConfig } from "./PortalLoginForm"
import { SCHOOL_PHOTOS } from "@/features/site/schoolPhotos"

const copy: PortalLoginCopy = {
  portalName: "Student Portal",
  heroImage: {
    src: SCHOOL_PHOTOS.uniform.src,
    alt: SCHOOL_PHOTOS.uniform.alt,
  },
  chips: [
    { emoji: "🔒", text: "100% Secure" },
    { emoji: "⚡", text: "Instant Results" },
  ],
  heroTitle: "You've Got This! 🌟",
  heroText:
    "Log in to access your exams, check your scores, and track how well you're doing every term.",
  safetyNote:
    "Never share your login details with anyone. Your account is yours alone.",
  badge: { emoji: "📚", label: "Student Login" },
  heading: "Welcome Back! 👋",
  intro: "Enter your Student ID and password to continue.",
}

const form: PortalLoginFormConfig = {
  idLabel: "Student ID / Reg. Number",
  idPlaceholder: "e.g. GFMS/2026/001",
  secretLabel: "Password",
  secretPlaceholder: "Enter your password",
  forgotLabel: "Forgot Password?",
  rememberLabel: "Remember me on this device",
  submitLabel: "Login to My Portal 🚀",
  successPath: "/student/dashboard",
  errorMessage: "Please enter your Student ID and password.",
}

export function StudentLogin() {
  return <PortalLogin copy={copy} form={<PortalLoginForm config={form} />} />
}
