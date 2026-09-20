import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react'; // Ensure lucide-react is installed
import API from '../../services/api';

export default function ApplyJobsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(location.state?.selectedJob || null);
  
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedJob) {
      API.get('/jobs/').then((res) => setJobs(res.data)).catch(console.error);
    }
  }, [selectedJob]);

  // Helper to check if job is expired
  const isExpired = selectedJob ? new Date(selectedJob.expiry_date) < new Date() : false;

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isExpired) {
      alert('This job application has closed.');
      return;
    }

    if (!selectedJob || !file) {
      alert('Please select a job and a resume file.');
      return;
    }

    const formData = new FormData();
    formData.append('candidate_name', candidateName);
    formData.append('candidate_email', candidateEmail);
    formData.append('candidate_phone', candidatePhone);
    formData.append('file', file);

    setSubmitting(true);
    try {
      await API.post(`/jobs/${selectedJob.job_id}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Application submitted successfully!');
      navigate('/candidate/jobs');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/20">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Submit Job Application</h3>
      
      {!selectedJob ? (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select a Job Opening to Apply</label>
          <select 
            className="w-full rounded-md border border-gray-300 p-2.5 bg-white text-gray-800 mb-4"
            onChange={(e) => {
              const found = jobs.find(j => j.job_id.toString() === e.target.value);
              setSelectedJob(found);
            }}
            defaultValue=""
          >
            <option value="" disabled>-- Choose a Job Position --</option>
            {jobs.map((j: any) => (
              <option key={j.job_id} value={j.job_id}>{j.title}</option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            <span className="text-sm font-bold text-gray-800">Applying for: <span className="text-indigo-600">{selectedJob.title}</span></span>
            <button 
              onClick={() => setSelectedJob(null)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
            >
              Change Job
            </button>
          </div>

          {isExpired ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center gap-3 text-red-700 mb-4">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-semibold">Application Closed: The deadline for this position has passed.</p>
            </div>
          ) : (
            <form onSubmit={handleApplySubmit} className="space-y-4">
              {/* Form inputs remain the same */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                <input type="text" required value={candidateName} onChange={(e) => setCandidateName(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2.5 bg-white text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                <input type="email" required value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2.5 bg-white text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                <input type="text" required value={candidatePhone} onChange={(e) => setCandidatePhone(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2.5 bg-white text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Upload Resume (PDF)</label>
                <input type="file" required accept=".pdf" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-indigo-600 py-3 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition shadow"
              >
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}