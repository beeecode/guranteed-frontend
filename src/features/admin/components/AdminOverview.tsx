import Link from 'next/link';
import { AlertCircle, BarChart2, BookOpen, CheckCircle, ChevronRight, Clock, FileText, Users, Zap } from 'lucide-react';
import { bundleWidgets, recentExams, type ExamStatus } from '@/data/admin';
import { ClassScoreChart, PassFailChart } from './DashboardCharts';

const stats = [
  { label: 'Total Students', value: '512', change: '+12 this term', icon: Users, color: '#2563EB', bg: '#EFF6FF' },
  { label: 'Active Exams', value: '3', change: '2 live now', icon: Zap, color: '#16A34A', bg: '#F0FDF4' },
  { label: 'Total Subjects', value: '9', change: 'Across all classes', icon: BookOpen, color: '#B22234', bg: '#FFF0F0' },
  { label: 'Completed Exams', value: '47', change: 'This session', icon: CheckCircle, color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Pending Results', value: '6', change: 'Awaiting release', icon: Clock, color: '#D97706', bg: '#FFFBEB' },
  { label: 'Avg Performance', value: '78%', change: '+4% from last term', icon: BarChart2, color: '#0891B2', bg: '#ECFEFF' },
];

const activity = [
  { text: 'English exam (P5) submitted by 31 students', time: '2 min ago', icon: CheckCircle, color: '#16A34A' },
  { text: 'New student Emeka Obi added to Primary 3B', time: '1 hour ago', icon: Users, color: '#2563EB' },
  { text: 'Mathematics results published for Primary 4', time: '3 hours ago', icon: FileText, color: '#B22234' },
  { text: '15 new questions added to Science bank', time: 'Yesterday', icon: BookOpen, color: '#7C3AED' },
  { text: 'Exam time extended for Chidinma Eze (P5)', time: 'Yesterday', icon: AlertCircle, color: '#D97706' },
];

const quickActions = [
  { label: 'Add Student', icon: Users, path: '/admin/students', color: '#2563EB' },
  { label: 'Add Question', icon: BookOpen, path: '/admin/questions', color: '#B22234' },
  { label: 'Create Exam', icon: Zap, path: '/admin/exams', color: '#16A34A' },
  { label: 'Create Bundle', icon: FileText, path: '/admin/bundles/create', color: '#7C3AED' },
  { label: 'View Results', icon: FileText, path: '/admin/results', color: '#0891B2' },
];

const statusBadge: Record<ExamStatus, string> = {
  live: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  draft: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

/** Admin dashboard body: KPIs, charts, recent exams, activity, bundle widgets and quick actions. */
export function AdminOverview() {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="font-heading text-2xl font-700 text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-700 font-medium mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-heading font-700 text-gray-900 mb-5">Average Score by Class</h3>
          <ClassScoreChart />
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-heading font-700 text-gray-900 mb-5">Pass/Fail Rate</h3>
          <PassFailChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Exams */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-700 text-gray-900">Recent Examinations</h3>
            <Link href="/admin/exams" className="text-xs text-[#B22234] font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentExams.map((exam, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-[#F9F5F1] rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[#B22234] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{exam.subject}</div>
                  <div className="text-xs text-gray-400">{exam.class} · {exam.date} · {exam.students} students</div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusBadge[exam.status]}`}>
                  {exam.status === 'live' ? '🟢 Live' : exam.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-heading font-700 text-gray-900 mb-5">Recent Activity</h3>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: a.color + '15' }}>
                  <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                </div>
                <div>
                  <p className="text-xs text-gray-700 leading-snug">{a.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bundle widgets */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {bundleWidgets.map((w, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: w.bg }}>
              {w.emoji}
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: w.color }}>{w.value}</div>
              <div className="text-xs text-gray-500">{w.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.path} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-[#D9C6B2]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: action.color + '12' }}>
              <action.icon className="w-5 h-5" style={{ color: action.color }} />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500" />
          </Link>
        ))}
      </div>
    </>
  );
}
