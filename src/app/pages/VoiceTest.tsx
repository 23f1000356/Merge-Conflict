import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mic, Square, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function VoiceTest() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const readingText = `The sun rises in the east and sets in the west. 
  Nature provides us with beautiful landscapes and diverse ecosystems. 
  Technology has transformed the way we communicate and work. 
  Health and wellness are essential for a fulfilling life.`;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setHasRecorded(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording();
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSubmit = () => {
    toast.success('Voice analysis submitted!');
    setTimeout(() => {
      navigate('/test/results');
    }, 1500);
  };

  const handleReRecord = () => {
    setHasRecorded(false);
    setAudioURL('');
    setRecordingTime(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard/patient')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Voice Assessment</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Instructions */}
        <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            📝 Instructions
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-cyan-600">•</span>
              <span>Please read the paragraph clearly and naturally</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600">•</span>
              <span>Speak at your normal speed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600">•</span>
              <span>Avoid background noise</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600">•</span>
              <span>Maximum recording time: 60 seconds</span>
            </li>
          </ul>
        </div>

        {/* Reading Text */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Please read this text:</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-line">
              {readingText}
            </p>
          </div>
        </div>

        {/* Recording Interface */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          {!hasRecorded ? (
            <div>
              {/* Recording Button */}
              <div className="mb-8">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all mx-auto"
                  >
                    <Mic className="w-16 h-16" />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full flex items-center justify-center shadow-2xl animate-pulse mx-auto"
                  >
                    <Square className="w-12 h-12" />
                  </button>
                )}
              </div>

              {/* Timer */}
              <div className="mb-4">
                <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </div>
                {isRecording && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-500 rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 30 + 10}px`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-red-600 font-semibold">Recording...</span>
                  </div>
                )}
              </div>

              <p className="text-gray-600">
                {isRecording ? 'Click the square button to stop recording' : 'Click the microphone to start recording'}
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recording Complete!</h3>
              
              {/* Audio Player */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Play className="w-6 h-6 text-cyan-600" />
                  <audio controls src={audioURL} className="max-w-full">
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <p className="text-sm text-gray-600">
                  Duration: {recordingTime} seconds
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleReRecord}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Re-record
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 shadow-lg"
                >
                  Submit for Analysis
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            🔒 <strong>Privacy:</strong> Your voice recording is encrypted and will be analyzed for cognitive biomarkers only. 
            The audio file will be automatically deleted after analysis. Only extracted features (speech rate, pause duration, etc.) are stored.
          </p>
        </div>
      </div>
    </div>
  );
}
