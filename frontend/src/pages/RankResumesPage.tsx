import React, { useState, useEffect } from 'react';
import API, { startBatchRanking, getBatchStatus } from '../services/api';

export default function RankResumesPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [rankedResults, setRankedResults] = useState<any[]>([]);

  useEffect(() => {
    API.get('/jobs/')
      .then((res) => setJobs(res.data))
      .catch((err) => console.error('Failed to load jobs', err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      alert('Please select a target job position.');
      return;
    }
    if (files.length === 0) {
      alert('Please attach at least one resume file.');
      return;
    }

    setLoading(true);
    setRankedResults([]);
    setProgress({ completed: 0, total: files.length });

    try {
      // Step 1: Trigger background batch ranking using the dedicated API helper with selectedJobId first
      const responseData = await startBatchRanking(selectedJobId, qualifications, files);
      const batchId = responseData?.batch_id;

      if (!batchId) {
        throw new Error('Batch ID was not returned by the server.');
      }

      // Step 2: Poll backend status endpoint using the dedicated API helper every 3 seconds
      const pollInterval = setInterval(async () => {
        try {
          const statusData = await getBatchStatus(batchId);

          setProgress({ 
            completed: statusData.completed || 0, 
            total: statusData.total || files.length 
          });

          if (statusData.status === 'completed') {
            clearInterval(pollInterval);
            setRankedResults(statusData.results || []);
            setLoading(false);
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            alert(statusData.error || 'Batch processing failed on the server.');
            setLoading(false);
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 3000);

    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Resume processing and ranking failed.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center relative py-10 px-4"
      style={{ 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1920')` 
      }}
    >
      <div className="mx-auto max-w-4xl relative z-10">
        <h2 className="mb-6 text-3xl font-extrabold text-white tracking-tight">AI Resume Ranker & Shortlisting</h2>
        
        <form onSubmit={handleRankSubmit} className="space-y-5 rounded-xl bg-white/95 backdrop-blur-md p-6 shadow-2xl mb-8 border border-white/20">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Select Job Position</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-gray-800"
            >
              <option value="">-- Choose Job --</option>
              {jobs.map((job) => (
                <option key={job.job_id} value={job.job_id}>{job.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Target Qualifications & Context</label>
            <textarea
              rows={3}
              required
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="Paste job description criteria or evaluation expectations..."
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Upload Resumes (PDF / Word)</label>
            <input
              type="file"
              multiple
              required
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition shadow-md"
          >
            {loading ? `Processing (${progress.completed}/${progress.total}) Resumes Safely...` : 'Rank Resumes'}
          </button>
        </form>

        {/* Live Progress Bar Section */}
        {loading && (
          <div className="rounded-xl bg-white/95 backdrop-blur-md p-6 shadow-2xl mb-8 border border-white/20 text-center">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Evaluating resumes sequentially via background worker to prevent rate limits...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-indigo-600 h-4 rounded-full transition-all duration-500" 
                style={{ width: `${(progress.completed / (progress.total || 1)) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Completed {progress.completed} of {progress.total} resumes
            </p>
          </div>
        )}

        {rankedResults.length > 0 && (
          <div className="rounded-xl bg-white/95 backdrop-blur-md p-6 shadow-2xl border border-white/20">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 border-b pb-2">Shortlisted Candidates</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {rankedResults.map((candidate, index) => (
                    <tr key={candidate.id || index} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 text-sm font-bold text-gray-900">#{index + 1}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{candidate.name}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-indigo-600">{candidate.match_score}%</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{candidate.experience} yrs</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{candidate.contact_info?.email || candidate.email || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}