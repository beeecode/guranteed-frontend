import { PortalLogin, type PortalLoginCopy } from './PortalLogin';
import { PortalLoginForm, type PortalLoginFormConfig } from './PortalLoginForm';

const copy: PortalLoginCopy = {
  portalName: 'Student Portal',
  heroImage: {
    src: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=520&h=360&fit=crop&auto=format',
    alt: 'Student ready for exam',
  },
  chips: [{ emoji: '🔒', text: '100% Secure' }, { emoji: '⚡', text: 'Instant Results' }],
  heroTitle: "You've Got This! 🌟",
  heroText: "Log in to access your exams, check your scores, and track how well you're doing every term.",
  safetyNote: 'Never share your login details with anyone. Your account is yours alone.',
  badge: { emoji: '📚', label: 'Student Login' },
  heading: 'Welcome Back! 👋',
  intro: 'Enter your Student ID and password to continue.',
};

const form: PortalLoginFormConfig = {
  idLabel: 'Student ID / Reg. Number',
  idPlaceholder: 'e.g. GFMS/2026/001',
  secretLabel: 'Password',
  secretPlaceholder: 'Enter your password',
  forgotLabel: 'Forgot Password?',
  rememberLabel: 'Remember me on this device',
  submitLabel: 'Login to My Portal 🚀',
  successPath: '/student/dashboard',
  errorMessage: 'Please enter your Student ID and password.',
};

export function StudentLogin() {
  return <PortalLogin copy={copy} form={<PortalLoginForm config={form} />} />;
}
