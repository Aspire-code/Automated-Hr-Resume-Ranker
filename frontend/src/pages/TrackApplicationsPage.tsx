import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Briefcase, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function TrackApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get('/applications/my-applications');
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'shortlisted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Shortlisted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8 px-4">
      <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Track Applications</h2>
          <p className="text-sm text-gray-400 mt-1">Monitor the status of the job positions you have applied for.</p>
        </div>
        <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-500/20 font-medium">
          Total Applied: {applications.length}
        </span>
      </div>

      <div className="space-y-4">
        {applications.length > 0 ? (
          applications.map((app) => {
            const id = app.id || app.application_id;
            return (
              <div 
                key={id} 
                className="bg-gray-950 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">{app.job_title || app.title || 'Job Position'}</h3>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" /> Applied on: {app.applied_date || app.created_at || 'Recently'}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-900">
                  {getStatusBadge(app.status)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-gray-950 rounded-xl border border-gray-800 p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-gray-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No applications found</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              You haven't submitted any job applications yet. Browse open listings to apply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}