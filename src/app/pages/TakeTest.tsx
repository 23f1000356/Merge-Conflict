import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Brain, CheckCircle, XCircle, RotateCcw, Clock, Home, LogOut, CheckCircle2, Circle, Mic, Square, Play } from 'lucide-react';
import { toast } from 'react-toastify';
import { testService } from '../services/api';

interface MemoryQuestion {
  id: number;
  type: 'word' | 'pattern' | 'sequence' | 'association';
  question: string;
  content: string[];
  correctAnswer: string | string[];
  timeLimit: number;
}

const memoryQuestions: MemoryQuestion[] = [
  {
    id: 1,
    type: 'word',
    question: 'Memorize these words for 5 seconds:',
    content: ['Apple', 'Table', 'Ocean', 'Mountain', 'Clock'],
    correctAnswer: ['Apple', 'Table', 'Ocean', 'Mountain', 'Clock'],
    timeLimit: 5
  },
  {
    id: 2,
    type: 'pattern',
    question: 'Remember the pattern sequence:',
    content: ['Circle', 'Square', 'Triangle', 'Circle', 'Square'],
    correctAnswer: ['Circle', 'Square', 'Triangle', 'Circle', 'Square'],
    timeLimit: 3
  },
  {
    id: 3,
    type: 'sequence',
    question: 'Memorize this number sequence:',
    content: ['7', '2', '9', '4', '8', '1', '5'],
    correctAnswer: '7294815',
    timeLimit: 4
  }
];

export default function TakeTest() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [testData, setTestData] = useState<any>({});
  const reactionStartTimeRef = useRef<number>(0);
  const [sectionTimeLeft, setSectionTimeLeft] = useState(60);

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

  // Voice Test State
  const voiceReadingText = `The sun rises in the east and sets in the west. 
  Nature provides us with beautiful landscapes and diverse ecosystems. 
  Technology has transformed the way we communicate and work. 
  Health and wellness are essential for a fulfilling life.`;
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [hasRecordedVoice, setHasRecordedVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const steps = [
    'Memory Test',
    'Reaction Test',
    'Attention Test',
    'Typing Test',
    'Voice Test',
  ];

  // Global 60s section timer
  useEffect(() => {
    setSectionTimeLeft(60);
    const interval = setInterval(() => {
      setSectionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.warning('Section time is up. You can still change or continue to the next section.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStep]);

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

  // Voice Test Methods
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setHasRecordedVoice(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopVoiceRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('Microphone access denied');
      console.error('Error accessing microphone:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleVoiceReRecord = () => {
    setHasRecordedVoice(false);
    setAudioURL('');
    setRecordingTime(0);
  };

  const handleVoiceSubmit = async () => {
    if (recordingTime < 5) {
      toast.error('Recording too short. Please record at least 5 seconds.');
      return;
    }

    // Calculate voice metrics based on recording
    const voiceScore = Math.min(100, (recordingTime / 20) * 100); // Normalize to 100 over 20 seconds
    
    const finalData = {
      ...testData,
      voiceMetrics: {
        duration: recordingTime,
        score: voiceScore,
      },
      rawData: { recordingTime }
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
  };

  const handleTypingSubmit = async () => {
    if (typingStartTime) {
      const duration = (Date.now() - typingStartTime) / 1000;
      const wordsPerMinute = (typedText.split(' ').length / duration) * 60;

      setTestData({ ...testData, typingSpeed: wordsPerMinute });
      toast.success(`Typing Speed: ${wordsPerMinute.toFixed(0)} WPM`);
      setCurrentStep(4); // Move to voice test
    }
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
      navigate('/dashboard/patient');
    }
  };

  const handleLogout = () => {
    if (confirm('Logout and discard current test progress?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-50 p-4 md:p-8">
      {/* Header */}
      <div className="w-full mx-auto mb-6">
        <div className="bg-white/90 backdrop-blur rounded-2xl border border-cyan-100 px-4 py-3 md:px-6 md:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-600 text-white font-bold text-sm">
              CH
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">CogniHealth Cognitive Assessment</p>
              <p className="text-xs text-gray-500">Each section is designed for ~60 seconds of focus.</p>
            </div>
          </div>

          <div className="flex-1 md:mx-6">
            <div className="flex items-center justify-between mb-1">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      idx <= currentStep ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-1 ${idx < currentStep ? 'bg-cyan-600' : 'bg-gray-200'}`}
                      style={{ width: '52px' }}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-xs md:text-sm text-gray-600 mt-1">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </p>
          </div>

          <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-2">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
              <Clock className="w-4 h-4 text-cyan-600" />
              <span>
                {sectionTimeLeft.toString().padStart(2, '0')}s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard/patient')}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={handleExit}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-red-100 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                End Test
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Test Content with Sidebar */}
      <div className="w-full mx-auto flex flex-col md:flex-row gap-6">
        {/* Sidebar Sections */}
        <aside className="md:w-60">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Test Sections</h3>
            <ul className="space-y-2 text-xs">
              {steps.map((step, idx) => {
                const status = idx === currentStep ? 'current' : idx < currentStep ? 'completed' : 'upcoming';
                return (
                  <li key={step}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(idx)}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                        status === 'current'
                          ? 'bg-cyan-50 border border-cyan-200 text-cyan-700'
                          : status === 'completed'
                          ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                          : 'bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Circle className="w-3 h-3" />
                        )}
                        <span className="font-medium truncate">
                          {idx + 1}. {step}
                        </span>
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {status === 'current' ? 'Now' : status === 'completed' ? 'Done' : ''}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11px] text-gray-500">
              Total sections: {steps.length}. You can jump between them any time.
            </p>
          </div>
        </aside>

        <div className="flex-1 space-y-6">
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
                Next: Voice Test
              </button>
            </div>
          </div>
        )}

        {/* Voice Test */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Voice Assessment</h2>
            
            {/* Instructions */}
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">📝 Instructions</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Please read the paragraph clearly and naturally</li>
                <li>• Speak at your normal speed</li>
                <li>• Avoid background noise</li>
                <li>• Minimum: 5 seconds | Maximum: 60 seconds</li>
              </ul>
            </div>

            {/* Reading Text */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-900 leading-relaxed text-sm">{voiceReadingText}</p>
            </div>

            {/* Recording Interface */}
            {!hasRecordedVoice ? (
              <div className="text-center">
                {/* Recording Button */}
                <div className="mb-6">
                  {!isRecordingVoice ? (
                    <button
                      onClick={startVoiceRecording}
                      className="w-28 h-28 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all mx-auto"
                    >
                      <Mic className="w-12 h-12" />
                    </button>
                  ) : (
                    <button
                      onClick={stopVoiceRecording}
                      className="w-28 h-28 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full flex items-center justify-center shadow-2xl animate-pulse mx-auto"
                    >
                      <Square className="w-10 h-10" />
                    </button>
                  )}
                </div>

                {/* Timer */}
                <div className="mb-4">
                  <div className="text-3xl font-mono font-bold text-gray-900">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </div>
                  {isRecordingVoice && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-1 bg-red-500 rounded-full animate-pulse"
                            style={{
                              height: `${Math.random() * 20 + 8}px`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-red-600 font-semibold text-sm">Recording...</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm">
                  {isRecordingVoice ? 'Click the square to stop' : 'Click the microphone to start'}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recording Complete!</h3>
                
                {/* Audio Player */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Play className="w-5 h-5 text-cyan-600" />
                    <audio controls src={audioURL} className="max-w-full">
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                  <p className="text-sm text-gray-600">Duration: {recordingTime} seconds</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleVoiceReRecord}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                  >
                    Re-record
                  </button>
                  <button
                    onClick={handleVoiceSubmit}
                    disabled={recordingTime < 5}
                    className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Submit All Tests
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
