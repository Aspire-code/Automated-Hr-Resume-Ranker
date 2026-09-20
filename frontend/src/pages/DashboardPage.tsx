import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Edit, Trash2, X, Download } from 'lucide-react';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Calculate today's date in YYYY-MM-DD format to prevent past date selections
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    API.get('/jobs/')
      .then((res) => setJobs(res.data))
      .catch((err) => console.error('Failed to load jobs', err));
  };

  const handleViewCandidates = async (jobId: any) => {
    setSelectedJobId(jobId);
    setLoadingCandidates(true);
    try {
      const response = await API.get(`/reports/${jobId}`);
      setCandidates(response.data);
    } catch (err) {
      console.error('Failed to fetch candidates for job', err);
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Handler to download all resumes as a ZIP file
  const handleDownloadAllResumes = async (jobId: number) => {
    setDownloadingZip(true);
    try {
      const response = await API.get(`/jobs/${jobId}/download-resumes`, {
        responseType: 'blob', // Important for handling binary data stream
      });

      // Create a blob link to trigger download
      const blob = new Blob([response.data], { type: 'application/x-zip-compressed' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `job_${jobId}_resumes.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      // If error occurs as blob, parse message if possible or show default fallback
      alert('Failed to download resumes zip package. Make sure candidates have uploaded files.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDeleteJob = async (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this job vacancy?')) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(j => j.job_id !== jobId));
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
        setCandidates([]);
      }
      alert('Job deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete job.');
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.put(`/jobs/${editingJob.job_id}`, editingJob);
      setJobs(jobs.map(j => (j.job_id === editingJob.job_id ? editingJob : j)));
      setEditingJob(null);
      alert('Job updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update job.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">HR Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Active Job Openings */}
        <div className="rounded-xl bg-white/95 backdrop-blur-md p-5 shadow-xl md:col-span-1 border border-white/20">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 border-b pb-2">Active Job Openings</h3>
          {jobs.length > 0 ? (
            <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {jobs.map((job) => (
                <li key={job.job_id}>
                  <div
                    onClick={() => handleViewCandidates(job.job_id)}
                    className={`w-full text-left rounded-lg p-3 transition cursor-pointer flex justify-between items-center ${selectedJobId === job.job_id ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-900' : 'bg-gray-50 hover:bg-gray-100 text-gray-800'}`}
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="font-semibold text-sm truncate">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Expires: {job.expiry_date || 'No deadline'}</p>
                      <p className="text-xs text-indigo-500 mt-1">Click to view applicants</p>
                    </div>

                    {/* Edit & Delete Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setEditingJob(job); }}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded transition"
                        title="Edit Job"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteJob(job.job_id, e)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded transition"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No job openings found.</p>
          )}
        </div>

        {/* Right Column: Applied Candidates & Resumes Report */}
        <div className="rounded-xl bg-white/95 backdrop-blur-md p-6 shadow-xl md:col-span-2 border border-white/20 flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-800">Applied Candidates & Resumes</h3>
            {selectedJobId && candidates.length > 0 && (
              <button
                type="button"
                onClick={() => handleDownloadAllResumes(selectedJobId)}
                disabled={downloadingZip}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {downloadingZip ? 'Packaging ZIP...' : 'Download All Resumes (.zip)'}
              </button>
            )}
          </div>

          {selectedJobId ? (
            loadingCandidates ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-gray-500 animate-pulse">Loading candidates...</p>
              </div>
            ) : candidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Candidate Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact Info</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Resume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {candidates.map((cand, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-3 py-3 text-sm font-bold text-gray-900">{cand.name}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">
                          <div>{cand.email}</div>
                          <div className="text-xs text-gray-400">{cand.phone}</div>
                        </td>
                        <td className="px-3 py-3 text-sm text-right">
                          {cand.file_name ? (
                            <a
                              href={`http://localhost:8000/uploads/${encodeURIComponent(cand.file_name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-block rounded bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
                            >
                              Download Resume
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">Not Available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No candidates have applied for this job yet.</p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">Select a job posting on the left to view applicants and resumes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative text-gray-900">
            <button 
              type="button"
              onClick={() => setEditingJob(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold mb-4">Edit Job Vacancy</h3>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  min={today}
                  value={editingJob.expiry_date || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, expiry_date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Requirements</label>
                <textarea
                  rows={3}
                  value={editingJob.requirements || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-md"
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