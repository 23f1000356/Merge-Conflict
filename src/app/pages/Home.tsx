import { Link } from 'react-router';
import Navbar from '../components/Navbar';
import { Brain, Activity, TrendingUp, Shield, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-br-[200px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Monitor Your
                <span className="text-cyan-600"> Cognitive Health</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                AI-powered early detection of cognitive decline through comprehensive assessments
                of memory, reaction time, voice patterns, and behavioral analysis.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-cyan-600 text-cyan-600 font-semibold rounded-xl hover:bg-cyan-50 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl p-6 text-white">
                    <Brain className="w-12 h-12 mb-4" />
                    <h3 className="font-semibold mb-1">Memory Test</h3>
                    <p className="text-sm opacity-90">Cognitive Assessment</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white">
                    <Activity className="w-12 h-12 mb-4" />
                    <h3 className="font-semibold mb-1">Voice Analysis</h3>
                    <p className="text-sm opacity-90">Speech Patterns</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white">
                    <TrendingUp className="w-12 h-12 mb-4" />
                    <h3 className="font-semibold mb-1">Trend Tracking</h3>
                    <p className="text-sm opacity-90">Progress Monitoring</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white">
                    <Shield className="w-12 h-12 mb-4" />
                    <h3 className="font-semibold mb-1">Risk Detection</h3>
                    <p className="text-sm opacity-90">Early Warning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Assessment</h2>
            <p className="text-xl text-gray-600">Multi-dimensional cognitive health monitoring</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🧠',
                title: 'Memory & Attention Tests',
                description: 'Word recall, attention span, and working memory assessments with AI-powered scoring.',
              },
              {
                icon: '⚡',
                title: 'Reaction Time Analysis',
                description: 'Measure cognitive processing speed and detect subtle changes over time.',
              },
              {
                icon: '🎤',
                title: 'Voice Biomarkers',
                description: 'Analyze speech patterns, pause frequency, fluency, and emotional stability.',
              },
              {
                icon: '⌨️',
                title: 'Typing Behavior',
                description: 'Track typing speed, hesitation patterns, and backspace frequency.',
              },
              {
                icon: '📊',
                title: 'Trend Visualization',
                description: 'Beautiful charts showing your cognitive performance over time.',
              },
              {
                icon: '🔮',
                title: 'AI Predictions',
                description: 'Machine learning models predict future cognitive health trends.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-cyan-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple, effective, evidence-based</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Register', desc: 'Create your account in minutes' },
              { step: '2', title: 'Take Tests', desc: 'Complete cognitive assessments' },
              { step: '3', title: 'AI Analysis', desc: 'Get instant AI-powered insights' },
              { step: '4', title: 'Track Progress', desc: 'Monitor your cognitive health' },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center">
                <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-cyan-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose CogniHealth?
              </h2>
              <div className="space-y-4">
                {[
                  'Early detection of cognitive decline',
                  'Comprehensive multi-modal assessment',
                  'AI-powered risk prediction',
                  'HIPAA-compliant data security',
                  'Easy sharing with healthcare providers',
                  'Personalized recommendations',
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-colors shadow-lg"
              >
                Start Free Assessment <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl p-8 text-white">
              <h3 className="text-3xl font-bold mb-6">Key Statistics</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-5xl font-bold mb-2">99.9%</div>
                  <p className="text-cyan-100">Uptime & Reliability</p>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">Secure</div>
                  <p className="text-cyan-100">HIPAA Compliant Data</p>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">15min</div>
                  <p className="text-cyan-100">Average assessment time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Take Control of Your Cognitive Health Today
          </h2>
          <p className="text-xl text-cyan-100 mb-8">
            Join thousands who are proactively monitoring their brain health
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-cyan-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-8 h-8 text-cyan-400" />
                <span className="text-xl font-bold text-white">CogniHealth</span>
              </div>
              <p className="text-sm">
                AI-powered cognitive health monitoring for early detection and prevention.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-cyan-400">Features</Link></li>
                <li><Link to="/" className="hover:text-cyan-400">How It Works</Link></li>
                <li><Link to="/" className="hover:text-cyan-400">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-cyan-400">About Us</Link></li>
                <li><Link to="/" className="hover:text-cyan-400">Contact</Link></li>
                <li><Link to="/" className="hover:text-cyan-400">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-cyan-400">Privacy Policy</Link></li>
                <li><Link to="/" className="hover:text-cyan-400">Terms of Service</Link></li>
                <li><Link to="/" className="hover:text-cyan-400">HIPAA Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2026 CogniHealth. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
