'use client';

import { useState } from 'react';
import { Search, Plus, Upload, Edit, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { bankQuestions as questions } from '@/data/admin';

const difficultyColor = (d: string) => ({
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
}[d] || 'bg-gray-100 text-gray-600');

/** Question bank table with filters and a "Create Question" modal. */
export function QuestionBank() {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQ, setNewQ] = useState({ subject: '', class: '', topic: '', difficulty: 'Easy', type: 'MCQ', text: '', a: '', b: '', c: '', d: '', correct: 'A', marks: '2', explanation: '' });

  const filtered = questions.filter(q =>
    (q.text.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase())) &&
    (subjectFilter === 'All' || q.subject === subjectFilter)
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search questions or topics..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm bg-white" />
        </div>
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white focus:outline-none">
          <option>All</option>
          <option>English</option>
          <option>Mathematics</option>
          <option>Basic Science</option>
          <option>Social Studies</option>
          <option>Computer Studies</option>
        </select>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white text-gray-600 hover:bg-gray-50">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B22234] text-white text-sm font-medium hover:bg-[#8B0000] transition-colors shadow-md">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">#</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Question</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Topic</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Difficulty</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Marks</th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((q, i) => (
                <tr key={i} className="hover:bg-[#F9F5F1] transition-colors">
                  <td className="px-5 py-4 text-xs text-gray-400 font-mono">{q.id}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900 line-clamp-1 max-w-xs">{q.text}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${q.status === 'active' ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-800">{q.subject}</div>
                    <div className="text-xs text-gray-400">{q.class}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{q.topic}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500 bg-gray-50 rounded-lg">{q.type}</td>
                  <td className="px-4 py-4 text-sm font-heading font-700 text-[#B22234]">{q.marks}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {filtered.length} of {questions.length} questions</span>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl border border-[#D9C6B2]"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
            <span className="w-9 h-9 rounded-xl bg-[#B22234] text-white flex items-center justify-center text-sm">1</span>
            <button className="p-2 rounded-xl border border-[#D9C6B2]"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl p-7 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-heading text-xl font-700 text-gray-900 mb-6">Create Question</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Subject *</label>
                  <select value={newQ.subject} onChange={e => setNewQ({...newQ, subject: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] bg-white text-sm focus:outline-none">
                    <option value="">Select subject</option>
                    <option>English</option>
                    <option>Mathematics</option>
                    <option>Basic Science</option>
                    <option>Social Studies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Class *</label>
                  <select value={newQ.class} onChange={e => setNewQ({...newQ, class: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] bg-white text-sm focus:outline-none">
                    <option value="">Select class</option>
                    <option>Primary 4</option>
                    <option>Primary 5</option>
                    <option>Primary 6</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Topic</label>
                  <input type="text" value={newQ.topic} onChange={e => setNewQ({...newQ, topic: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none" placeholder="e.g. Nouns" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Difficulty</label>
                  <select value={newQ.difficulty} onChange={e => setNewQ({...newQ, difficulty: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] bg-white text-sm focus:outline-none">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Marks</label>
                  <input type="number" value={newQ.marks} onChange={e => setNewQ({...newQ, marks: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none" min="1" max="10" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Question Text *</label>
                <textarea value={newQ.text} onChange={e => setNewQ({...newQ, text: e.target.value})} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none resize-none" placeholder="Type the question here..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-3">Answer Options</label>
                <div className="grid grid-cols-2 gap-3">
                  {['A', 'B', 'C', 'D'].map((letter) => (
                    <div key={letter} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-heading font-700 text-xs flex-shrink-0 ${newQ.correct === letter ? 'bg-[#B22234] text-white' : 'bg-gray-100 text-gray-600'}`}>{letter}</div>
                      <input type="text" className="flex-1 px-3 py-2 rounded-xl border border-[#D9C6B2] text-sm focus:outline-none" placeholder={`Option ${letter}`} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Correct Answer</label>
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D'].map((letter) => (
                    <button key={letter} type="button" onClick={() => setNewQ({...newQ, correct: letter})} className={`w-10 h-10 rounded-xl font-heading font-700 text-sm transition-all ${newQ.correct === letter ? 'bg-[#B22234] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-[#D9C6B2]'}`}>
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-[#B22234] text-white rounded-xl font-medium text-sm hover:bg-[#8B0000] shadow-md">Save Question</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
