import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Candidate' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await API.post('/auth/register', formData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-cover bg-center relative px-4 py-10"
      style={{ 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1920')` 
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white/95 backdrop-blur-md p-8 shadow-2xl relative z-10 border border-white/20">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-gray-800 tracking-tight">Create Account</h2>
        {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600 font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Register As</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-gray-800"
            >
              <option value="Candidate">Candidate / Job Seeker</option>
              <option value="Admin">Administrator / HR</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-3 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition shadow-md"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}