import { redirect } from 'next/navigation';

// Unknown URLs go home, matching the old `<Route path="*" element={<Navigate to="/" replace />} />`.
export default function CatchAllPage() {
  redirect('/');
}
