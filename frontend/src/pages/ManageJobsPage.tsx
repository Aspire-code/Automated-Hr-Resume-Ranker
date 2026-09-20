import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Briefcase, Calendar, Edit, Trash2, X } from 'lucide-react';

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<any | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get('/api/jobs/');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: number) => {
    if (!window.confirm('Are you sure you want to delete this job vacancy?')) return;
    try {
      await API.delete(`/api/jobs/${jobId}`);
      setJobs(jobs.filter(j => j.job_id !== jobId));
      alert('Job deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete job.');
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.put(`/api/jobs/${editingJob.job_id}`, editingJob);
      setJobs(jobs.map(j => (j.job_id === editingJob.job_id ? editingJob : j)));
      setEditingJob(null);
      alert('Job updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update job.');
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Loading job postings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8 px-4">
      <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Manage Job Vacancies</h2>
          <p className="text-sm text-gray-400 mt-1">Edit or remove active job listings posted on the platform.</p>
        </div>
        <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-500/20 font-medium">
          Total Jobs: {jobs.length}
        </span>
      </div>

      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div 
              key={job.job_id} 
              className="bg-gray-950 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" /> Expires: {job.expiry_date || 'No deadline set'}
                </p>
                <p className="text-sm text-gray-300 line-clamp-1">{job.description}</p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-900">
                <button
                  onClick={() => setEditingJob(job)}
                  className="inline-flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(job.job_id)}
                  className="inline-flex items-center gap-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-950 rounded-xl border border-gray-800 p-12 text-center text-gray-400">
            No job vacancies found. Create one to get started.
          </div>
        )}
      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-950 border border-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setEditingJob(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-4">Edit Job Vacancy</h3>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={editingJob.expiry_date || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, expiry_date: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Requirements</label>
                <textarea
                  rows={3}
                  value={editingJob.requirements || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-lg shadow-indigo-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}