import { Link } from 'react-router';
import { Brain, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-cyan-600">CogniHealth</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/#services" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">
              Services
            </Link>
            <Link to="/#features" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">
              Features
            </Link>
            <Link to="/#about" className="text-gray-700 hover:text-cyan-600 font-medium transition-colors">
              About
            </Link>
            <Link to="/login" className="px-4 py-2 text-cyan-600 font-semibold hover:bg-cyan-50 rounded-lg transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors shadow-lg">
              Register
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              <Link to="/" className="px-4 py-2 text-gray-700 hover:bg-cyan-50 rounded-lg">
                Home
              </Link>
              <Link to="/#services" className="px-4 py-2 text-gray-700 hover:bg-cyan-50 rounded-lg">
                Services
              </Link>
              <Link to="/#features" className="px-4 py-2 text-gray-700 hover:bg-cyan-50 rounded-lg">
                Features
              </Link>
              <Link to="/#about" className="px-4 py-2 text-gray-700 hover:bg-cyan-50 rounded-lg">
                About
              </Link>
              <Link to="/login" className="px-4 py-2 text-cyan-600 hover:bg-cyan-50 rounded-lg">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 bg-cyan-600 text-white rounded-lg mx-4">
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
