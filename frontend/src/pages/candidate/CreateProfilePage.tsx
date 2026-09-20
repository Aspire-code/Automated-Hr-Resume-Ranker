import React, { useState } from 'react';

export default function CreateProfilePage() {
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/25">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Candidate Profile Setup</h3>
      {saved && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm font-semibold">
          Profile updated successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
        <div>
          <label className="block text-sm font-semibold">Professional Headline</label>
          <input type="text" placeholder="e.g. Full Stack Software Engineer" className="mt-1 w-full rounded-md border border-gray-300 p-2.5" />
        </div>
        <div>
          <label className="block text-sm font-semibold">Skills (Comma separated)</label>
          <input type="text" placeholder="React, Python, SQL Server, FastAPI" className="mt-1 w-full rounded-md border border-gray-300 p-2.5" />
        </div>
        <div>
          <label className="block text-sm font-semibold">Bio / Summary</label>
          <textarea rows={4} placeholder="Write a short summary about yourself..." className="mt-1 w-full rounded-md border border-gray-300 p-2.5"></textarea>
        </div>
        <button type="submit" className="rounded-md bg-indigo-600 px-5 py-2.5 text-white font-semibold hover:bg-indigo-700 transition shadow">
          Save Profile
        </button>
      </form>
    </div>
  );
}