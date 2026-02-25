import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { testService } from '../services/api';

export default function TakeTest() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [testData, setTestData] = useState<any>({});
  const reactionStartTimeRef = useRef<number>(0);

  // Memory Test State
  const [memoryWords] = useState(['Apple', 'Train', 'Garden', 'Cloud', 'River', 'Stone', 'Tiger', 'Chair']);
  const [showWords, setShowWords] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [recalledWords, setRecalledWords] = useState('');

  // Reaction Test State
  const [reactionStarted, setReactionStarted] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [reactionAttempt, setReactionAttempt] = useState(0);

  // Attention Test State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [attentionScore, setAttentionScore] = useState(0);
  const attentionTests = [
    { word: 'RED', color: 'text-blue-600', correctAnswer: 'Blue' },
    { word: 'BLUE', color: 'text-green-600', correctAnswer: 'Green' },
    { word: 'GREEN', color: 'text-red-600', correctAnswer: 'Red' },
    { word: 'YELLOW', color: 'text-purple-600', correctAnswer: 'Purple' },
  ];

  // Typing Test State
  const sampleParagraph = "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. It is commonly used to test typewriters and computer keyboards.";
  const [typedText, setTypedText] = useState('');
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);

  const steps = [
    'Memory Test',
    'Reaction Test',
    'Attention Test',
    'Typing Test',
  ];

  // Memory Test Timer
  useEffect(() => {
    if (currentStep === 0 && showWords && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setShowWords(false);
    }
  }, [currentStep, showWords, countdown]);

  const handleMemorySubmit = () => {
    const recalled = recalledWords.toLowerCase().split(',').map(w => w.trim());
    const correct = memoryWords.filter(w => recalled.includes(w.toLowerCase())).length;
    const score = (correct / memoryWords.length) * 100;

    setTestData({ ...testData, memoryScore: score });
    toast.success(`Memory Score: ${score.toFixed(0)}%`);
    setCurrentStep(1);
  };

  // Reaction Test Helper
  const startNextReactionTrial = () => {
    setShowButton(false);
    const delay = Math.random() * 3000 + 2000;
    setTimeout(() => {
      setShowButton(true);
      reactionStartTimeRef.current = Date.now();
    }, delay);
  };

  const startReactionTest = () => {
    setReactionStarted(true);
    setReactionTimes([]);
    setReactionAttempt(0);
    startNextReactionTrial();
  };

  const handleReactionClick = () => {
    const reactionTime = Date.now() - reactionStartTimeRef.current;
    const newTimes = [...reactionTimes, reactionTime];
    setReactionTimes(newTimes);

    if (reactionAttempt < 4) {
      setReactionAttempt(prev => prev + 1);
      startNextReactionTrial();
    } else {
      const avgTime = newTimes.reduce((a, b) => a + b, 0) / 5;
      setTestData({ ...testData, reactionTime: avgTime });
      toast.success(`Average Reaction Time: ${avgTime.toFixed(0)}ms`);
      setShowButton(false);
      setTimeout(() => setCurrentStep(2), 1500);
    }
  };

  const handleAttentionAnswer = (answer: string) => {
    const isCorrect = answer === attentionTests[currentQuestion].correctAnswer;
    const newScore = isCorrect ? attentionScore + 1 : attentionScore;

    if (currentQuestion < attentionTests.length - 1) {
      setAttentionScore(newScore);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const finalScore = (newScore / attentionTests.length) * 100;
      setTestData({ ...testData, attentionScore: finalScore });
      toast.success(`Attention Test Complete! Score: ${finalScore.toFixed(0)}%`);
      setCurrentStep(3);
    }
  };

  const handleTypingStart = () => {
    if (!typingStartTime) {
      setTypingStartTime(Date.now());
    }
  };

  const handleTypingSubmit = async () => {
    if (typingStartTime) {
      const duration = (Date.now() - typingStartTime) / 1000;
      const wordsPerMinute = (typedText.split(' ').length / duration) * 60;

      const finalData = {
        ...testData,
        typingSpeed: wordsPerMinute,
        rawData: { typedText, duration }
      };

      try {
        const response = await testService.submit(finalData);
        toast.success('All tests completed and processed by AI!');

        setTimeout(() => {
          navigate('/test/results', { state: { testData: response.data } });
        }, 1500);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to submit test');
      }
    }
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
      navigate('/dashboard/patient');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <button onClick={handleExit} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex-1 mx-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${idx <= currentStep
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-1 w-full ${idx < currentStep ? 'bg-cyan-600' : 'bg-gray-200'
                        }`}
                      style={{ width: '60px' }}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </p>
          </div>

          <button
            onClick={handleExit}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Test Content */}
      <div className="max-w-4xl mx-auto">
        {/* Memory Test */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Memory Test</h2>

            {showWords ? (
              <div>
                <p className="text-gray-600 mb-6">Memorize these words (you have {countdown} seconds)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {memoryWords.map((word, idx) => (
                    <div key={idx} className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-4">
                      <span className="text-xl font-semibold text-gray-900">{word}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 text-cyan-600">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg font-semibold">{countdown}s</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">Type the words you remember (separated by commas)</p>
                <textarea
                  value={recalledWords}
                  onChange={(e) => setRecalledWords(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={4}
                  placeholder="Apple, Train, Garden..."
                />
                <button
                  onClick={handleMemorySubmit}
                  className="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reaction Test */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reaction Test</h2>

            {!reactionStarted ? (
              <div>
                <p className="text-gray-600 mb-6">Click the button as soon as it turns GREEN</p>
                <button
                  onClick={startReactionTest}
                  className="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700"
                >
                  Start Test
                </button>
              </div>
            ) : showButton ? (
              <button
                id="reaction-btn"
                onClick={handleReactionClick}
                className="w-32 h-32 bg-green-500 text-white font-bold text-xl rounded-full hover:bg-green-600 shadow-lg animate-pulse"
              >
                CLICK!
              </button>
            ) : (
              <div className="text-gray-500">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                  <p className="text-sm">Wait...</p>
                </div>
                <p className="mt-4">Attempt {reactionAttempt + 1}/5</p>
              </div>
            )}
          </div>
        )}

        {/* Attention Test (Stroop Test) */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Attention Test</h2>
            <p className="text-gray-600 mb-8">Select the COLOR of the text, not the word itself</p>

            <div className="mb-8">
              <p className={`text-6xl font-bold ${attentionTests[currentQuestion].color}`}>
                {attentionTests[currentQuestion].word}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Red', 'Blue', 'Green', 'Yellow', 'Purple'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleAttentionAnswer(color)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-cyan-50 hover:border-cyan-600 transition-colors font-semibold"
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing Test */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Typing Pattern Test</h2>
            <p className="text-gray-600 mb-6 text-center">Type the paragraph below exactly as shown</p>

            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p className="text-gray-900 leading-relaxed">{sampleParagraph}</p>
            </div>

            <textarea
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              onFocus={handleTypingStart}
              className="w-full p-4 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              rows={6}
              placeholder="Start typing here..."
            />

            <div className="flex justify-center">
              <button
                onClick={handleTypingSubmit}
                disabled={typedText.length < 50}
                className="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Complete Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
