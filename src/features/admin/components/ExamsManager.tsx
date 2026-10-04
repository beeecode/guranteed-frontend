'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2, Clock, Users, BookOpen, Play, Monitor, Calendar, Layers } from 'lucide-react';
import { bundleExams, liveMonitorStats, liveMonitorStudents, singleExams as exams, type AdminExam } from '@/data/admin';

const statusConfig = {
  live: { label: '🟢 Live', classes: 'bg-green-100 text-green-700 border border-green-200' },
  scheduled: { label: 'Scheduled', classes: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', classes: 'bg-gray-100 text-gray-600' },
  draft: { label: 'Draft', classes: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-100 text-red-700' },
};

const steps = ['Basic Info', 'Questions', 'Settings', 'Schedule', 'Review'];

/** Bundle + single exam lists, the create-exam stepper and the live monitor modal. */
export function ExamsManager() {
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(0);
  const [liveMonitor, setLiveMonitor] = useState<AdminExam["id"] | null>(null);

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['All', 'Live', 'Scheduled', 'Completed', 'Bundle', 'Draft'].map((f) => (
            <button key={f} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${f === 'All' ? 'bg-[#B22234] text-white shadow-md' : 'bg-white text-gray-600 border border-[#D9C6B2] hover:border-[#B22234]'}`}>
              {f === 'Bundle' ? '📚 Bundle' : f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/bundles/create" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#5C1010] text-white text-sm font-medium hover:bg-[#3d0909] transition-colors shadow-md">
            <Layers className="w-4 h-4" /> Create Bundle
          </Link>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B22234] text-white text-sm font-medium hover:bg-[#8B0000] transition-colors shadow-md">
            <Plus className="w-4 h-4" /> Create Exam
          </button>
        </div>
      </div>

      {/* Bundle Exam Cards */}
      {bundleExams.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-bold text-[#7A5C3A] uppercase tracking-widest mb-3 px-1">📚 Multi-Subject Bundles</div>
          <div className="space-y-3">
            {bundleExams.map((exam, i) => {
              const st = statusConfig[exam.status as keyof typeof statusConfig];
              return (
                <div key={i} className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all border-2" style={{ borderColor: exam.status === 'live' ? 'rgba(22,163,74,0.25)' : 'transparent' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl" style={{ background: '#5C1010' }}>
                        📚
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-heading font-600 text-gray-900 text-base">{exam.title}</h3>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.classes}`}>{st.label}</span>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#5C1010]/10 text-[#5C1010]">MULTI-SUBJECT</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {exam.subject}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {exam.class}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.duration}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exam.date} · {exam.time}</span>
                          <span>{exam.questions} total questions</span>
                          {exam.attempts > 0 && <span className="text-[#B22234] font-medium">{exam.attempts} writing now</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {exam.status === 'live' && (
                        <Link href={`/admin/bundles/${exam.id}/monitor`} className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-medium hover:bg-green-100 transition-colors border border-green-200">
                          <Monitor className="w-3.5 h-3.5" /> Live Monitor
                        </Link>
                      )}
                      {exam.status === 'draft' && (
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-[#B22234]/10 text-[#B22234] rounded-xl text-xs font-medium hover:bg-[#B22234]/20 transition-colors">
                          <Play className="w-3.5 h-3.5" /> Publish
                        </button>
                      )}
                      <button className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Single Exam Cards */}
      <div className="mb-2">
        <div className="text-xs font-bold text-[#7A5C3A] uppercase tracking-widest mb-3 px-1">📄 Single-Subject Exams</div>
      </div>
      <div className="space-y-4">
        {exams.map((exam, i) => {
          const st = statusConfig[exam.status as keyof typeof statusConfig];
          return (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-[#D9C6B2]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#B22234] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-heading font-600 text-gray-900 text-base">{exam.title}</h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.classes}`}>{st.label}</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">SINGLE SUBJECT</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {exam.subject}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {exam.class}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.duration}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exam.date} · {exam.time}</span>
                      <span>{exam.questions} questions</span>
                      {exam.attempts > 0 && <span className="text-[#B22234] font-medium">{exam.attempts} submitted</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {exam.status === 'live' && (
                    <button onClick={() => setLiveMonitor(exam.id)} className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-medium hover:bg-green-100 transition-colors border border-green-200">
                      <Monitor className="w-3.5 h-3.5" /> Monitor
                    </button>
                  )}
                  {exam.status === 'draft' && (
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-[#B22234]/10 text-[#B22234] rounded-xl text-xs font-medium hover:bg-[#B22234]/20 transition-colors">
                      <Play className="w-3.5 h-3.5" /> Publish
                    </button>
                  )}
                  {exam.status === 'completed' && (
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-100 transition-colors">
                      View Results
                    </button>
                  )}
                  <button className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"><Edit className="w-4 h-4" /></button>
                  <button className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Exam Modal — Stepper */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Stepper header */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-heading text-xl font-700 text-gray-900 mb-4">Create Examination</h2>
              <div className="flex items-center">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-heading font-700 transition-all ${i === step ? 'bg-[#B22234] text-white shadow-md' : i < step ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <div className="hidden sm:block ml-2 flex-shrink-0">
                      <div className={`text-xs font-medium ${i === step ? 'text-[#B22234]' : 'text-gray-400'}`}>{s}</div>
                    </div>
                    {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6">
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam Title *</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none focus:ring-2 focus:ring-[#B22234]/30" placeholder="e.g. Third Term Mathematics Examination" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-[#D9C6B2] bg-white text-sm focus:outline-none">
                        <option>Mathematics</option>
                        <option>English Language</option>
                        <option>Basic Science</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Class *</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-[#D9C6B2] bg-white text-sm focus:outline-none">
                        <option>Primary 5B</option>
                        <option>Primary 5A</option>
                        <option>Primary 4A</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none resize-none" placeholder="Optional exam description or instructions..." />
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="bg-[#F9F5F1] rounded-2xl p-4 text-sm text-gray-600">
                    <p className="font-medium mb-2">Question Selection</p>
                    <p>Choose questions from your question bank, or enable random selection to auto-pick questions by difficulty.</p>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white border border-[#D9C6B2] rounded-2xl">
                    <input type="checkbox" id="random" className="w-4 h-4 accent-[#B22234]" />
                    <label htmlFor="random" className="text-sm text-gray-700">Auto-select questions randomly from bank</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of Questions</label>
                      <input type="number" defaultValue="40" className="w-full px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Marks</label>
                      <input type="number" defaultValue="100" className="w-full px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
                      <input type="number" defaultValue="45" className="w-full px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Passing Score (%)</label>
                      <input type="number" defaultValue="50" className="w-full px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none" />
                    </div>
                  </div>
                  {[
                    { label: 'Shuffle Questions', id: 'shuffle-q' },
                    { label: 'Shuffle Answer Options', id: 'shuffle-a' },
                    { label: 'Show Result Immediately After Submission', id: 'show-result' },
                    { label: 'Auto-Submit When Timer Expires', id: 'auto-submit' },
                  ].map((opt) => (
                    <div key={opt.id} className="flex items-center gap-3 p-4 bg-[#F9F5F1] rounded-2xl">
                      <input type="checkbox" id={opt.id} defaultChecked className="w-4 h-4 accent-[#B22234]" />
                      <label htmlFor={opt.id} className="text-sm text-gray-700">{opt.label}</label>
                    </div>
                  ))}
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam Date *</label>
                      <input type="date" className="w-full px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time *</label>
                      <input type="time" className="w-full px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                    <input type="time" className="w-full px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none" />
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="space-y-4 bg-[#F9F5F1] rounded-2xl p-5">
                  <h3 className="font-heading font-600 text-gray-900">Exam Summary</h3>
                  {[
                    ['Title', 'Third Term Mathematics Examination'],
                    ['Subject', 'Mathematics'],
                    ['Class', 'Primary 5B'],
                    ['Questions', '40'],
                    ['Duration', '45 minutes'],
                    ['Date', 'October 5, 2026 at 9:00 AM'],
                    ['Pass Mark', '50%'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-2 border-b border-[#D9C6B2]/50 last:border-0">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="px-5 py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm hover:border-gray-400">
                  Previous
                </button>
              )}
              <button onClick={() => setShowCreate(false)} className="px-5 py-3 border-2 border-[#D9C6B2] text-gray-500 rounded-xl font-medium text-sm">
                Save Draft
              </button>
              <div className="flex-1" />
              {step < steps.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)} className="px-6 py-3 bg-[#B22234] text-white rounded-xl font-medium text-sm hover:bg-[#8B0000] shadow-md">
                  Next Step
                </button>
              ) : (
                <button onClick={() => setShowCreate(false)} className="px-6 py-3 bg-[#B22234] text-white rounded-xl font-medium text-sm hover:bg-[#8B0000] shadow-md">
                  Publish Exam
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Monitor Modal */}
      {liveMonitor !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <h2 className="font-heading text-xl font-700 text-gray-900">Live Exam Monitor</h2>
                </div>
                <p className="text-sm text-gray-500">English Language — Primary 5B · Oct 6, 2026</p>
              </div>
              <button onClick={() => setLiveMonitor(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100">✕</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {liveMonitorStats.map((s, i) => (
                  <div key={i} className="bg-[#F9F5F1] rounded-2xl p-4 text-center">
                    <div className="font-heading text-2xl font-700" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {liveMonitorStudents.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#F9F5F1] rounded-xl text-sm">
                    <div className="w-8 h-8 rounded-xl bg-[#B22234] flex items-center justify-center text-white text-xs font-heading font-700">{s.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500">{s.progress}/{s.total} Qs</div>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                        <div className="h-full bg-[#B22234] rounded-full" style={{ width: `${(s.progress / s.total) * 100}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      s.status === 'Submitted' ? 'bg-green-100 text-green-700' :
                      s.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{s.status}</span>
                    <div className={`w-2 h-2 rounded-full ${s.connection === 'strong' ? 'bg-green-500' : s.connection === 'weak' ? 'bg-yellow-500' : 'bg-gray-300'}`} title={`Connection: ${s.connection}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
