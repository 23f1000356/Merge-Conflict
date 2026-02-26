import { useState } from 'react';
import { useLocation, Link } from 'react-router';
import Sidebar from '../components/Sidebar';
import { Menu, ArrowLeft, Brain, Zap, Grid3X3 } from 'lucide-react';

type Mode = 'memory' | 'reaction' | 'focus';

const memoryRounds = [
  { prompt: 'Remember these 3 words', items: ['Apple', 'River', 'Chair'] },
  { prompt: 'Remember these 4 words', items: ['Tiger', 'Cloud', 'Stone', 'Garden'] },
  { prompt: 'Remember this sequence', items: ['Red', 'Blue', 'Green', 'Yellow'] },
  { prompt: 'Remember these objects', items: ['Phone', 'Book', 'Lamp', 'Door'] },
  { prompt: 'Remember these places', items: ['Paris', 'Delhi', 'Tokyo', 'London'] },
  { prompt: 'Remember these numbers', items: ['14', '27', '39', '52'] },
  { prompt: 'Remember these animals', items: ['Lion', 'Zebra', 'Panda', 'Eagle'] },
  { prompt: 'Remember this pattern', items: ['▲', '●', '■', '●', '▲'] },
  { prompt: 'Remember these foods', items: ['Bread', 'Milk', 'Rice', 'Honey'] },
  { prompt: 'Remember this short list', items: ['Sun', 'Tree', 'Road', 'Clock'] },
];

const reactionPrompts = [
  'Tap as soon as the circle turns GREEN',
  'Tap when you see a SQUARE',
  'Tap when the background flashes',
  'Tap when you see the word GO',
  'Tap when the icon turns into a ⚡',
  'Tap when the timer reaches 00:01',
  'Tap when the bar fills completely',
  'Tap when the shape stops moving',
  'Tap as soon as you hear “Now!” (simulated)',
  'Tap when the number changes to 3',
];

const focusPatterns = [
  ['A1', 'B2', 'C3'],
  ['2', '4', '6', '8'],
  ['Red', 'Red', 'Blue', 'Blue'],
  ['▲', '■', '■', '▲'],
  ['Left', 'Right', 'Left', 'Right'],
  ['Up', 'Down', 'Up', 'Down'],
  ['1', '3', '5', '7'],
  ['Sun', 'Moon', 'Star'],
  ['Cat', 'Dog', 'Cat', 'Dog'],
  ['North', 'South', 'East', 'West'],
];

export default function BrainGym() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialMode = (searchParams.get('mode') as Mode) || 'memory';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [memoryStep, setMemoryStep] = useState(0);
  const [memoryInput, setMemoryInput] = useState('');
  const [memoryScore, setMemoryScore] = useState(0);

  const [reactionIndex, setReactionIndex] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [reactionReady, setReactionReady] = useState(false);
  const [reactionStart, setReactionStart] = useState<number | null>(null);

  const [focusIndex, setFocusIndex] = useState(0);
  const [focusCorrect, setFocusCorrect] = useState(0);

  const currentMemoryRound = memoryRounds[memoryStep];
  const currentReactionPrompt = reactionPrompts[reactionIndex];
  const currentPattern = focusPatterns[focusIndex];

  const handleMemoryCheck = () => {
    const answers = memoryInput.toLowerCase().split(',').map((w) => w.trim()).filter(Boolean);
    const correct = currentMemoryRound.items.filter((w) => answers.includes(w.toLowerCase())).length;
    const roundScore = (correct / currentMemoryRound.items.length) * 100;
    setMemoryScore((prev) => Math.round((prev + roundScore) / 2));
    setMemoryInput('');
    setMemoryStep((prev) => Math.min(memoryRounds.length - 1, prev + 1));
  };

  const startReactionTrial = () => {
    setReactionReady(false);
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      setReactionReady(true);
      setReactionStart(Date.now());
    }, delay);
  };

  const handleReactionTap = () => {
    if (!reactionReady || !reactionStart) return;
    const time = Date.now() - reactionStart;
    setReactionTimes((prev) => [...prev, time]);
    setReactionReady(false);
    setReactionStart(null);
    setReactionIndex((prev) => {
      const next = prev + 1;
      if (next < reactionPrompts.length) {
        startReactionTrial();
      }
      return next;
    });
  };

  const avgReaction =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

  const handleFocusAnswer = (correct: boolean) => {
    if (correct) setFocusCorrect((c) => c + 1);
    setFocusIndex((prev) => Math.min(focusPatterns.length - 1, prev + 1));
  };

  const renderMemoryGame = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Daily Memory Drill</h2>
      <p className="text-sm text-gray-600 mb-4">
        10 short rounds of word and pattern recall. Aim to remember as many items as you can.
      </p>
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">Round {memoryStep + 1} / {memoryRounds.length}</span>
        <span className="text-gray-700">
          Avg score: <span className="font-semibold text-cyan-600">{memoryScore}%</span>
        </span>
      </div>
      <div className="mb-4">
        <p className="font-semibold text-gray-800 mb-2">{currentMemoryRound.prompt}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {currentMemoryRound.items.map((item) => (
            <span key={item} className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-sm text-gray-800">
              {item}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mb-2">Look at the list for a few seconds, then type everything you remember.</p>
        <textarea
          value={memoryInput}
          onChange={(e) => setMemoryInput(e.target.value)}
          rows={3}
          placeholder="Apple, River, Chair..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={handleMemoryCheck}
        className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold"
      >
        Check & Next
      </button>
    </div>
  );

  const renderReactionGame = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Reaction Mini Games</h2>
      <p className="text-sm text-gray-600 mb-4">
        10 fast reaction tasks. Tap as quickly as possible when the condition is met.
      </p>
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Task {Math.min(reactionIndex + 1, reactionPrompts.length)} / {reactionPrompts.length}
        </span>
        <span className="text-gray-700">
          Avg reaction: <span className="font-semibold text-purple-600">{avgReaction || '—'} ms</span>
        </span>
      </div>
      {reactionIndex === 0 && reactionTimes.length === 0 ? (
        <button
          onClick={startReactionTrial}
          className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
        >
          Start Games
        </button>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-4">
          <p className="text-sm text-gray-700 text-center max-w-md">{currentReactionPrompt}</p>
          <button
            onClick={handleReactionTap}
            disabled={!reactionReady || reactionIndex >= reactionPrompts.length}
            className={`w-32 h-32 rounded-full text-white font-bold text-lg shadow-lg transition-colors ${
              reactionIndex >= reactionPrompts.length
                ? 'bg-gray-300 cursor-not-allowed'
                : reactionReady
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-gray-400'
            }`}
          >
            {reactionIndex >= reactionPrompts.length ? 'Done' : reactionReady ? 'TAP!' : 'Wait'}
          </button>
        </div>
      )}
    </div>
  );

  const renderFocusGame = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Pattern Focus Game</h2>
      <p className="text-sm text-gray-600 mb-4">
        Watch the short pattern and answer whether the sequence follows a rule. 10 quick rounds to train focus.
      </p>
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">Round {focusIndex + 1} / {focusPatterns.length}</span>
        <span className="text-gray-700">
          Correct: <span className="font-semibold text-emerald-600">{focusCorrect}</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {currentPattern.map((item, idx) => (
          <span
            key={`${item}-${idx}`}
            className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-sm text-gray-800"
          >
            {item}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Does this pattern look consistent and follow a simple rule?
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => handleFocusAnswer(true)}
          className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
        >
          Yes
        </button>
        <button
          onClick={() => handleFocusAnswer(false)}
          className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
        >
          No
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="patient" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/patient"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Brain Gym</h1>
                <p className="text-xs text-gray-500">
                  Short, focused games to keep your brain active between full tests.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 inline-flex rounded-full bg-gray-100 p-1 text-xs">
          <button
            onClick={() => setMode('memory')}
            className={`px-4 py-1 rounded-full font-medium flex items-center gap-1 ${
              mode === 'memory' ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Brain className="w-3 h-3" />
            Memory Drill
          </button>
          <button
            onClick={() => setMode('reaction')}
            className={`px-4 py-1 rounded-full font-medium flex items-center gap-1 ${
              mode === 'reaction' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Zap className="w-3 h-3" />
            Reaction Games
          </button>
          <button
            onClick={() => setMode('focus')}
            className={`px-4 py-1 rounded-full font-medium flex items-center gap-1 ${
              mode === 'focus' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid3X3 className="w-3 h-3" />
            Focus Patterns
          </button>
        </div>

        <div className="mt-4">
          {mode === 'memory' && renderMemoryGame()}
          {mode === 'reaction' && renderReactionGame()}
          {mode === 'focus' && renderFocusGame()}
        </div>
      </main>
    </div>
  );
}

