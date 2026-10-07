import type { Parent } from '@/types/student';
import { currentStudent } from './student';

/** Mock signed-in parent. Each parent login maps to exactly one child. */
export const currentParent: Parent = {
  name: 'Mrs. Ngozi Johnson',
  avatar: 'NJ',
  relationship: 'Mother',
  child: currentStudent,
};
