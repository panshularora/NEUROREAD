import React, { useState, useEffect, useCallback } from 'react';
import ExerciseCard from './ExerciseCard';
import BKTLiveDisplay from './BKTLiveDisplay';
import {
  getPhonics,
  getFlashcard,
  getSoundMatch,
  getBuildWord,
  getRhyme,
  getPictureMatch,
  getComprehension,
  getLesson,
  getLearningProgress,
  updateLearningProgress,
  ensureUserId,
  checkAnswer,
} from '../services/api';
import AudioButton from './AudioButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Exercise {
  id: string;
  type: 'phonics' | 'spelling' | 'comprehension' | 'matching';
  prompt: string;
  options: string[];
  correct_answer: string;
  difficulty: number;
  target_skill: string;
  hint: string;
}

interface Skill {
  name: string;
  display_name: string;
  p_know: number;
  mastered: boolean;
}

export default function LearningMode({ active }: { active: boolean }) {
  const [subMode, setSubMode] = useState<'adaptive' | 'read-along' | 'phonics' | 'visual' | 'stories'>('adaptive');
  const userId = ensureUserId();

  if (!active) return null;

  const subModes = [
    { id: 'adaptive', name: 'Adaptive AI', icon: 'solar:magic-stick-3-bold-duotone', color: 'bg-moss/10 text-moss' },
    { id: 'read-along', name: 'Read Along', icon: 'solar:music-note-bold-duotone', color: 'bg-blue-50 text-blue-600' },
    { id: 'phonics', name: 'Phonics Lab', icon: 'solar:microphone-3-bold-duotone', color: 'bg-green-50 text-green-600' },
    { id: 'visual', name: 'Visual Mode', icon: 'solar:eye-bold-duotone', color: 'bg-clay/10 text-clay' },
    { id: 'stories', name: 'Story Mode', icon: 'solar:book-bold-duotone', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div id="content-learning" className="py-12 px-6 max-w-7xl mx-auto min-h-[80vh] animate-in fade-in duration-700">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl font-medium text-moss mb-4 tracking-tight">Learning Adventure</h2>
        <p className="text-text-muted text-lg leading-relaxed">
          Welcome to your reading space. Choose an activity below to start building your skills at your own pace.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-16">
        {subModes.map((m) => (
          <button
            key={m.id}
            onClick={() => setSubMode(m.id as any)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 border ${
              subMode === m.id
                ? 'bg-white border-moss shadow-md scale-105 text-moss'
                : 'bg-white/50 border-moss/10 text-text-muted hover:bg-white hover:border-moss/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center`}>
              <span className="iconify text-xl" data-icon={m.icon} />
            </div>
            <span className="font-medium">{m.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-moss/5 min-h-[500px] relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-moss/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-clay/5 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />

        <div className="relative z-10">
          {subMode === 'adaptive' && <AdaptiveLearningSection userId={userId} />}
          {subMode === 'read-along' && <ReadAlongSection userId={userId} />}
          {subMode === 'phonics' && <PhonicsLabSection userId={userId} />}
          {subMode === 'visual' && <VisualModeSection userId={userId} />}
          {subMode === 'stories' && <StoryModeSection userId={userId} />}
        </div>
      </div>
    </div>
  );
}

/* ── ADAPTIVE LEARNING SECTION (BKT/IRT wired) ─────────────────────────────── */
function AdaptiveLearningSection({ userId }: { userId: string }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSkillUpdate, setLastSkillUpdate] = useState<any>(null);
  const [lastIRTUpdate, setLastIRTUpdate] = useState<any>(null);
  const [lastSM2Update, setLastSM2Update] = useState<any>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0, longest_streak: 0 });
  const [answerDisabled, setAnswerDisabled] = useState(false);

  const age = parseInt(localStorage.getItem('neuroread-user-age') || '8', 10);

  // Start session on mount
  useEffect(() => {
    startSession();
  }, []);

  async function startSession() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/learning/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, age, session_type: 'learning' }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setCurrentExercise(data.first_exercise);
    } catch (err) {
      console.error('Could not start learning session:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSkills() {
    if (!sessionId) return;
    try {
      const res = await fetch(`${API_URL}/api/learning/session/${sessionId}/skills`);
      const data = await res.json();
      setSkills(data.skills || []);
      if (data.session_stats) setStats(data.session_stats);
    } catch (err) {
      console.error('Could not load skills:', err);
    }
  }

  async function handleAnswer(answer: string) {
    if (!sessionId || !currentExercise || answerDisabled) return;
    setAnswerDisabled(true);

    const startTime = Date.now();
    try {
      const res = await fetch(`${API_URL}/api/learning/session/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: currentExercise.id,
          answer,
          response_time_ms: Date.now() - startTime,
        }),
      });
      const data = await res.json();

      setFeedback(data.correct ? 'correct' : 'incorrect');
      setExplanation(data.explanation);
      setLastSkillUpdate(data.skill_update);
      setLastIRTUpdate(data.irt_update);
      setLastSM2Update(data.sm2_update);
      if (data.session_stats) setStats(data.session_stats);

      // Refresh skills panel
      await loadSkills();

      // Auto-advance after 3 seconds
      setTimeout(() => {
        setFeedback(null);
        setExplanation('');
        setCurrentExercise(data.next_exercise);
        setAnswerDisabled(false);
      }, 3000);
    } catch (err) {
      console.error('Answer submission failed:', err);
      setAnswerDisabled(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full border-4 border-moss border-t-transparent animate-spin mb-6" />
        <p className="text-moss font-medium">Starting your learning session...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-medium text-moss">Adaptive Learning</h3>
          <p className="text-sm text-text-muted">AI-powered exercises that adapt to your level in real-time</p>
        </div>
        {stats.streak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full">
            <span className="text-lg">🔥</span>
            <span className="font-bold text-orange-600 text-sm">{stats.streak} in a row!</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="px-4 py-2 bg-moss/5 rounded-xl">
          <span className="text-xs text-moss/60 font-medium uppercase">Correct</span>
          <div className="font-bold text-moss">{stats.correct}/{stats.total}</div>
        </div>
        <div className="px-4 py-2 bg-clay/5 rounded-xl">
          <span className="text-xs text-clay/60 font-medium uppercase">Best Streak</span>
          <div className="font-bold text-clay">{stats.longest_streak} 🔥</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Exercise area */}
        <div className="lg:col-span-3">
          {explanation && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 16,
              background: feedback === 'correct' ? 'rgba(76,175,80,0.08)' : 'rgba(255,152,0,0.08)',
              border: `1px solid ${feedback === 'correct' ? '#4CAF50' : '#FF9800'}`,
              fontWeight: 600, fontSize: 14,
            }}>
              {explanation}
            </div>
          )}

          {currentExercise ? (
            <ExerciseCard
              exercise={currentExercise}
              onAnswer={handleAnswer}
              disabled={answerDisabled}
              feedback={feedback}
            />
          ) : (
            <div className="text-center py-16">
              <p className="text-moss/50 mb-4">No exercise loaded yet.</p>
              <button onClick={startSession} className="px-6 py-3 bg-moss text-white rounded-xl font-bold">
                Start Session
              </button>
            </div>
          )}
        </div>

        {/* Skills sidebar */}
        <div className="lg:col-span-2">
          <BKTLiveDisplay
            skills={skills}
            lastSkillUpdate={lastSkillUpdate}
            lastIRTUpdate={lastIRTUpdate}
            lastSM2Update={lastSM2Update}
            sessionId={sessionId || undefined}
          />
        </div>
      </div>
    </div>
  );
}

/* ──────────────── SUB-SECTIONS (unchanged classic modes) ──────────────── */

function ReadAlongSection({ userId }: { userId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState(-1);
  const [speed, setSpeed] = useState(400);

  const story = {
    title: "The Brave Little Ant",
    text: "Once upon a time, there was a tiny ant named Andy. He found a giant cookie in the grass. It was too heavy to carry alone. Andy called his friends for help. Together, they moved the cookie to their home. They had a big feast that night!"
  };

  const words = story.text.split(' ');

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentWordIdx(prev => {
          if (prev >= words.length - 1) { setIsPlaying(false); return -1; }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, words.length, speed]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-3xl font-medium text-moss mb-2">{story.title}</h3>
          <p className="text-text-muted text-sm italic">Press play to start!</p>
        </div>
        <div className="flex items-center gap-4 bg-moss/5 p-2 rounded-2xl border border-moss/10">
          <div className="flex flex-col items-end px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-moss/40">Speed</span>
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-moss focus:outline-none">
              <option value={600}>Slow</option>
              <option value={400}>Normal</option>
              <option value={250}>Fast</option>
            </select>
          </div>
          <button onClick={() => { if (currentWordIdx === -1) setCurrentWordIdx(0); setIsPlaying(!isPlaying); }}
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-clay text-white shadow-lg' : 'bg-moss text-white hover:scale-105'}`}>
            <span className="iconify text-2xl" data-icon={isPlaying ? 'solar:pause-bold' : 'solar:play-bold'} />
          </button>
        </div>
      </div>

      <div className="bg-blue-50/30 p-12 rounded-[3.5rem] border border-blue-100 shadow-inner mb-8 leading-[2.5] min-h-[300px]">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {words.map((word, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                scale: currentWordIdx === idx ? '1.2' : '1',
                color: currentWordIdx === idx ? '#C66B44' : '#2E4036',
                backgroundColor: currentWordIdx === idx ? 'rgba(198,107,68,0.1)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
              className="text-2xl font-medium px-2 py-1 rounded-lg cursor-pointer hover:bg-moss/5"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => { setIsPlaying(false); setCurrentWordIdx(-1); }}
          className="text-xs font-bold uppercase tracking-widest text-clay hover:underline">
          Reset Story
        </button>
      </div>
    </div>
  );
}

function PhonicsLabSection({ userId }: { userId: string }) {
  const [letterIdx, setLetterIdx] = useState(0);
  const [flashcard, setFlashcard] = useState<any>(null);
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const fetchFlashcard = useCallback(async (idx: number) => {
    try {
      const res = await getFlashcard(LETTERS[idx]);
      setFlashcard(res?.data || res);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchFlashcard(letterIdx); }, [letterIdx, fetchFlashcard]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h3 className="text-3xl font-medium text-moss mb-6">Phonics Lab</h3>
          <p className="text-text-muted mb-10 leading-relaxed">Explore letters and their sounds with visual and auditory feedback.</p>
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-moss/40">Alphabet Explorer</h4>
            <div className="grid grid-cols-6 gap-2">
              {LETTERS.map((l, idx) => (
                <button key={l} onClick={() => setLetterIdx(idx)}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center font-bold text-lg transition-all border ${
                    letterIdx === idx ? 'bg-green-600 border-green-600 text-white shadow-md' : 'bg-white border-moss/10 text-moss/60 hover:border-moss/30'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-green-50/50 rounded-[3rem] p-10 border border-green-100 flex flex-col items-center justify-center min-h-[400px]">
          {flashcard ? (
            <div className="text-center space-y-8 w-full">
              <div className="relative inline-block">
                <span className="text-9xl font-bold text-green-700 block">{flashcard.letter || LETTERS[letterIdx]}</span>
                <div className="absolute -top-4 -right-8">
                  <AudioButton text={flashcard.letter || LETTERS[letterIdx]} className="bg-white text-green-600 w-12 h-12 shadow-sm" />
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100 w-full space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl font-medium text-moss">{flashcard.sound}</span>
                  <AudioButton text={flashcard.sound} className="bg-green-50 text-green-600" />
                </div>
                <p className="text-text-muted italic">"{flashcard.mnemonic}"</p>
                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  {(flashcard.examples || []).map((word: string) => (
                    <div key={word} className="px-4 py-2 bg-green-50 rounded-xl text-green-700 font-medium flex items-center gap-2">
                      {word}
                      <AudioButton text={word} className="w-6 h-6 bg-white text-green-600 scale-75" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-24 h-24 bg-green-100 rounded-full mb-4" />
              <div className="w-48 h-4 bg-green-100 rounded" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VisualModeSection({ userId }: { userId: string }) {
  const [text, setText] = useState('The cat and the dog play in the sun near the tree');

  const iconMap: Record<string, string> = {
    cat: 'ph:cat-bold', dog: 'ph:dog-bold', sun: 'ph:sun-bold',
    tree: 'ph:tree-bold', bird: 'ph:bird-bold', fish: 'ph:fish-bold',
    house: 'ph:house-bold', apple: 'ph:apple-bold', car: 'ph:car-bold',
    book: 'ph:book-bold', star: 'ph:star-bold', moon: 'ph:moon-bold', heart: 'ph:heart-bold',
  };

  const tokens = text.toLowerCase().split(/\s+/);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-clay/10 text-clay flex items-center justify-center mx-auto mb-6">
          <span className="iconify text-3xl" data-icon="solar:eye-bold-duotone" />
        </div>
        <h3 className="text-3xl font-medium text-moss mb-4">Visual Mode</h3>
        <p className="text-text-muted">Type something below to translate it into visual concepts.</p>
      </div>

      <div className="space-y-8">
        <textarea value={text} onChange={(e) => setText(e.target.value)}
          className="w-full h-32 p-8 rounded-[2.5rem] border border-moss/10 bg-moss/5 focus:outline-none focus:ring-2 focus:ring-moss/20 transition-all text-xl font-medium text-moss resize-none"
          placeholder="Type words like cat, dog, sun, tree..." />

        <div className="p-12 bg-white rounded-[3.5rem] border border-moss/5 shadow-sm min-h-[200px] flex flex-wrap gap-6 items-center justify-center">
          {tokens.map((token, i) => {
            const cleanToken = token.replace(/[.,!?;:]/g, '');
            const icon = iconMap[cleanToken];
            if (icon) {
              return (
                <div key={i} style={{ animation: 'correctPulse 0.3s ease' }}
                  className="flex flex-col items-center gap-3 p-4 bg-moss/5 rounded-2xl border border-moss/10 min-w-[100px]">
                  <span className="iconify text-5xl text-moss" data-icon={icon} />
                  <span className="text-xs font-bold uppercase tracking-widest text-clay">{cleanToken}</span>
                </div>
              );
            }
            return <span key={i} className="text-2xl text-moss/30 font-medium">{token}</span>;
          })}
          {tokens.length === 0 && <p className="text-moss/20 italic">Start typing to see the magic...</p>}
        </div>
      </div>
    </div>
  );
}

function StoryModeSection({ userId }: { userId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-12 text-center">
      <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-8">
        <span className="iconify text-4xl" data-icon="solar:book-bold-duotone" />
      </div>
      <h3 className="text-3xl font-medium text-moss mb-4">Adaptive Stories</h3>
      <p className="text-text-muted max-w-xl mx-auto mb-10">Stories that adjust to your reading level, providing just the right amount of challenge.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <div className="p-10 bg-purple-50/50 border border-purple-100 rounded-[3rem] relative overflow-hidden group hover:bg-white transition-all cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Easy</span>
          <h4 className="text-2xl font-medium text-purple-900 mb-2">The Brave Little Ant</h4>
          <p className="text-sm text-purple-900/60 leading-relaxed">A short story with simple words and visual aids.</p>
        </div>

        <div className="p-10 bg-moss/5 border border-moss/10 rounded-[3rem] relative overflow-hidden opacity-50 grayscale">
          <h4 className="text-2xl font-medium text-moss mb-2">Mystery at the Farm</h4>
          <p className="text-sm text-text-muted">Complete Level 1 to unlock more stories!</p>
        </div>
      </div>
    </div>
  );
}
