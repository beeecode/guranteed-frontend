'use client';

import { useState } from 'react';
import { Search, Plus, Download, Upload, ChevronLeft, ChevronRight, Edit, Trash2, KeyRound } from 'lucide-react';
import { adminStudents as students } from '@/data/admin';

/** Searchable student table with bulk selection and an "Add Student" modal. */
export function StudentsManager() {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = students.filter(s =>
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)) &&
    (classFilter === 'All' || s.class.includes(classFilter))
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(s => s.id)));
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or student ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm bg-white" />
        </div>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B22234]/30">
          <option>All</option>
          <option value="Primary 1">Primary 1</option>
          <option value="Primary 2">Primary 2</option>
          <option value="Primary 3">Primary 3</option>
          <option value="Primary 4">Primary 4</option>
          <option value="Primary 5">Primary 5</option>
          <option value="Primary 6">Primary 6</option>
        </select>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D9C6B2] text-sm bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B22234] text-white text-sm font-medium hover:bg-[#8B0000] transition-colors shadow-md">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="mb-4 bg-[#B22234]/10 border border-[#B22234]/20 rounded-xl px-4 py-3 flex items-center gap-4">
          <span className="text-sm font-medium text-[#B22234]">{selected.size} selected</span>
          <button className="text-sm text-gray-600 hover:text-[#B22234]">Activate</button>
          <button className="text-sm text-gray-600 hover:text-[#B22234]">Deactivate</button>
          <button className="text-sm text-red-600 hover:text-red-700">Delete Selected</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-left">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-4 h-4 accent-[#B22234] rounded" />
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Student ID</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Class</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Login</th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((student, i) => (
                <tr key={i} className="hover:bg-[#F9F5F1] transition-colors">
                  <td className="px-5 py-4">
                    <input type="checkbox" checked={selected.has(student.id)} onChange={() => toggleSelect(student.id)} className="w-4 h-4 accent-[#B22234] rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#B22234] flex items-center justify-center font-heading font-600 text-white text-xs flex-shrink-0">
                        {student.avatar}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 font-mono text-xs">{student.id}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{student.class}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{student.gender}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {student.status === 'active' ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">{student.lastLogin}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors" title="Reset Password">
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {filtered.length} of {students.length} students</span>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl border border-[#D9C6B2] text-gray-500 hover:border-[#B22234] hover:text-[#B22234] transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-9 h-9 rounded-xl bg-[#B22234] text-white flex items-center justify-center text-sm font-medium">1</span>
            <button className="w-9 h-9 rounded-xl border border-[#D9C6B2] text-gray-500 hover:border-[#B22234] flex items-center justify-center text-sm">2</button>
            <button className="p-2 rounded-xl border border-[#D9C6B2] text-gray-500 hover:border-[#B22234] hover:text-[#B22234] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-heading text-xl font-700 text-gray-900 mb-6">Add New Student</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">First Name *</label>
                  <input type="text" className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm" placeholder="First name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Last Name *</label>
                  <input type="text" className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm" placeholder="Last name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Gender *</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] bg-white focus:outline-none text-sm">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Class *</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] bg-white focus:outline-none text-sm">
                    <option>Select class</option>
                    <option>Primary 1A</option>
                    <option>Primary 1B</option>
                    <option>Primary 2A</option>
                    <option>Primary 3A</option>
                    <option>Primary 4A</option>
                    <option>Primary 5A</option>
                    <option>Primary 5B</option>
                    <option>Primary 6A</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Guardian Email</label>
                <input type="email" className="w-full px-3 py-2.5 rounded-xl border border-[#D9C6B2] focus:outline-none focus:ring-2 focus:ring-[#B22234]/30 text-sm" placeholder="guardian@email.com" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border-2 border-[#D9C6B2] text-gray-700 rounded-xl font-medium text-sm hover:border-gray-400 transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-[#B22234] text-white rounded-xl font-medium text-sm hover:bg-[#8B0000] transition-colors shadow-md">
                Save Student
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
