import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle } from 'lucide-react'; // Ensure lucide-react is installed
import API from '../../services/api';

export default function AvailableJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/jobs/')
      .then((res) => {
        setJobs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load jobs', err);
        setLoading(false);
      });
  }, []);

  // Helper to check if a job is expiring soon (within 3 days)
  const isExpiringSoon = (dateString: string) => {
    const expiry = new Date(dateString);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  // Helper to check if job is already expired
  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/20">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Available Job Openings</h3>
      {loading ? (
        <p className="text-gray-600">Loading vacancies...</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-600">No job openings currently available.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => {
            const expired = isExpired(job.expiry_date);
            const expiringSoon = !expired && isExpiringSoon(job.expiry_date);

            return (
              <div key={job.job_id} className={`p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${expired ? 'bg-gray-100 opacity-75' : 'bg-gray-50'}`}>
                <div className="flex-1">
                  <h4 className={`text-lg font-bold ${expired ? 'text-gray-500' : 'text-indigo-600'}`}>{job.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{job.description}</p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Requirements: {job.requirements}</p>
                  
                  {/* Expiry Date Display */}
                  <div className={`mt-3 flex items-center gap-2 text-xs font-semibold ${expired ? 'text-red-600' : expiringSoon ? 'text-orange-600' : 'text-gray-500'}`}>
                    <Calendar className="w-3 h-3" />
                    <span>{expired ? 'Expired on: ' : 'Deadline: '}{new Date(job.expiry_date).toLocaleDateString()}</span>
                    {expiringSoon && (
                      <span className="flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" /> Ending Soon
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  disabled={expired}
                  onClick={() => navigate('/candidate/apply', { state: { selectedJob: job } })}
                  className={`rounded-md px-4 py-2 text-white text-sm font-semibold transition shadow whitespace-nowrap ${
                    expired 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {expired ? 'Application Closed' : 'Apply Now'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}