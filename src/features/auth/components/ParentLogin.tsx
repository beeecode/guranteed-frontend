import { PortalLogin, type PortalLoginCopy } from "./PortalLogin"
import { PortalLoginForm, type PortalLoginFormConfig } from "./PortalLoginForm"
import { SCHOOL_PHOTOS } from "@/features/site/schoolPhotos"

const copy: PortalLoginCopy = {
  portalName: "Parent Portal",
  heroImage: {
    src: SCHOOL_PHOTOS.frontOfSchool2.src,
    alt: SCHOOL_PHOTOS.frontOfSchool2.alt,
  },
  chips: [
    { emoji: "🔒", text: "100% Secure" },
    { emoji: "📊", text: "Published Results" },
  ],
  heroTitle: "Stay Close to Your Child's Progress 🌟",
  heroText:
    "Log in to view your child's published results, subject performance and teacher remarks every term.",
  safetyNote:
    "Your parent PIN is issued by the school. Keep it private — it gives access to your child's records.",
  badge: { emoji: "👨‍👩‍👧", label: "Parent Login" },
  heading: "Welcome, Parent! 👋",
  intro: "Enter your child's Student ID and your parent PIN to continue.",
}

const form: PortalLoginFormConfig = {
  portal: "parent",
  idLabel: "Child's Student ID",
  idPlaceholder: "e.g. GFMS/2026/001",
  secretLabel: "Parent PIN",
  secretPlaceholder: "Enter your parent PIN",
  secretInputMode: "numeric",
  forgotLabel: "Forgot PIN?",
  rememberLabel: "Remember me on this device",
  submitLabel: "View My Child’s Results 📊",
  successPath: "/parent/dashboard",
  errorMessage: "Please enter your child's Student ID and your parent PIN.",
}

export function ParentLogin() {
  return <PortalLogin copy={copy} form={<PortalLoginForm config={form} />} />
}
