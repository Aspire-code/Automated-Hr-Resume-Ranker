import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function CreateJobPage() {
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    requirements: '', 
    expiry_date: '' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Calculate today's date in YYYY-MM-DD format to prevent past date selections
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('Unauthorized. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      await API.post('/jobs/', {
        user_id: parseInt(userId),
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        expiry_date: formData.expiry_date
      });
      alert('Job created successfully with expiry date!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create job.');
    } finally {
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
      <div className="mx-auto max-w-2xl relative z-10">
        <h2 className="mb-6 text-3xl font-extrabold text-white tracking-tight">Post New Job Opening</h2>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white/95 backdrop-blur-md p-6 shadow-2xl border border-white/20">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Job Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Job Expiry Date</label>
            <input
              type="date"
              name="expiry_date"
              required
              min={today}
              value={formData.expiry_date}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Job Description</label>
            <textarea
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Required Qualifications / Skills</label>
            <textarea
              name="requirements"
              rows={3}
              required
              value={formData.requirements}
              onChange={handleChange}
              placeholder="e.g. React, TypeScript, 3+ years experience..."
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition shadow-md"
          >
            {loading ? 'Posting...' : 'Create Job'}
          </button>
        </form>
      </div>
    </div>
  );
}