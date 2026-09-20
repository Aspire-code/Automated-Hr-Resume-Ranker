import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('user_name') || 'User';
  const userRole = localStorage.getItem('user_role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const dashboardRoute = userRole === 'Candidate' ? '/candidate-dashboard' : '/dashboard';

  return (
    <nav className="bg-indigo-600 shadow-md">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link to={dashboardRoute} className="text-xl font-bold text-white">
              HR Resume Ranker
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to={dashboardRoute} className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-indigo-100">Welcome, {userName}</span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-indigo-700 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}