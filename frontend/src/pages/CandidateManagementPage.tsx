import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Search, CheckCircle, XCircle, User } from 'lucide-react';

export default function CandidateManagementPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await API.get('/candidates/');
      setCandidates(res.data);
    } catch (err) {
      console.error('Failed to load candidate list', err);
    }
  };

  const updateCandidateStatus = async (candidateId: string, newStatus: string) => {
    try {
      await API.patch(`/candidates/${candidateId}/status`, { status: newStatus });
      setCandidates(candidates.map(c => (c.id === candidateId || c.candidate_id === candidateId) ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert('Failed to update candidate status.');
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-gray-950 p-5 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold text-white">Candidate Pool & Shortlisting</h2>
        
        {/* Search & Filter Controls */}
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search candidate name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800 text-left text-sm text-gray-300">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Candidate Name</th>
                <th className="px-6 py-4">Match Score</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((c, index) => {
                  const id = c.id || c.candidate_id;
                  return (
                    <tr key={id || index} className="hover:bg-gray-900/50 transition">
                      <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-400" /> {c.name}
                      </td>
                      <td className="px-6 py-4 text-indigo-400 font-bold">{c.match_score}%</td>
                      <td className="px-6 py-4">{c.experience} years</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.status === 'Shortlisted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          c.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {c.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => updateCandidateStatus(id, 'Shortlisted')}
                          className="inline-flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Shortlist
                        </button>
                        <button 
                          onClick={() => updateCandidateStatus(id, 'Rejected')}
                          className="inline-flex items-center gap-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No candidates found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}