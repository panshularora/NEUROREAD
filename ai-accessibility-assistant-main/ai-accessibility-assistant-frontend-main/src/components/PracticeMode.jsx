import React, { useState, useEffect } from 'react';
import ExerciseCard from './ExerciseCard';
import { ensureUserId } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PracticeMode = ({ active }) => {
  const [sessionId, setSessionId] = useState(null);
  const [practiceQueue, setPracticeQueue] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [dueCount, setDueCount] = useState(0);
  const [allCaughtUp, setAllCaughtUp] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
  const [explanation, setExplanation] = useState('');
  const [sm2Update, setSm2Update] = useState(null);
  const [answerDisabled, setAnswerDisabled] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0, longest_streak: 0 });
  const [loading, setLoading] = useState(false);
  const [useAdaptive, setUseAdaptive] = useState(null); // null = undecided

  // Also preserve classic mode
  const [classicSession, setClassicSession] = useState(null);
  const [classicStep, setClassicStep] = useState(0);
  const [classicScore, setClassicScore] = useState(0);

  const userId = ensureUserId();
  const age = parseInt(localStorage.getItem('neuroread-user-age') || '8', 10);

  if (!active) return null;

  // ── Adaptive Practice ────────────────────────────────────────────────────

  async function startAdaptiveSession() {
    setLoading(true);
    try {
      // First, start a session
      const startRes = await fetch(`${API_URL}/api/learning/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, age, session_type: 'practice' }),
      });
      const startData = await startRes.json();
      const sid = startData.session_id;
      setSessionId(sid);

      // Then get due items
      const recRes = await fetch(`${API_URL}/api/learning/session/${sid}/recommend`);
      const recData = await recRes.json();

      setDueCount(recData.due_count || 0);
      setAllCaughtUp(recData.all_caught_up || false);
      setPracticeQueue(recData.due_skills || []);
      setCurrentExercise(recData.next_exercise || null);
    } catch (err) {
      console.error('Could not start practice session:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(answer) {
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
      setSm2Update(data.sm2_update);
      if (data.session_stats) setStats(data.session_stats);

      // After feedback, load next via recommend
      setTimeout(async () => {
        setFeedback(null);
        setExplanation('');
        setSm2Update(null);

        // Check if more items due
        const recRes = await fetch(`${API_URL}/api/learning/session/${sessionId}/recommend`);
        const recData = await recRes.json();

        if (recData.all_caught_up || recData.due_count === 0) {
          // Show session summary
          setSessionSummary({
            totalReviewed: stats.total + 1,
            correct: stats.correct + (data.correct ? 1 : 0),
            longestStreak: stats.longest_streak,
          });
          setCurrentExercise(null);
        } else {
          setDueCount(recData.due_count);
          setCurrentExercise(recData.next_exercise);
        }

        setAnswerDisabled(false);
      }, 3000);
    } catch (err) {
      console.error('Answer failed:', err);
      setAnswerDisabled(false);
    }
  }

  // ── Classic Practice (unchanged) ─────────────────────────────────────────

  const errorData = [
    { question: "Select the correct spelling:", options: ["bake", "dake"], answer: "bake" },
    { question: "Which word means 'very big'?", options: ["huge", "huj"], answer: "huge" },
    { question: "Choose the right word:", options: ["because", "becuz"], answer: "because" },
  ];

  const memoryData = [
    { text: "The quick brown fox jumps over the lazy dog. It was a sunny day and the fox was very energetic.", type: 'mcq', question: "What was the weather like?", options: ["Rainy", "Sunny", "Cloudy"], answer: "Sunny" },
    { text: "Water turns to ice when it gets very cold. This happens at zero degrees Celsius.", type: 'mcq', question: "At what temperature does water freeze?", options: ["0", "10", "100"], answer: "0" },
  ];

  const spacedCards = [
    { word: "because", difficulty: "High", lastSeen: "2 hours ago" },
    { word: "friend", difficulty: "Moderate", lastSeen: "yesterday" },
    { word: "beautiful", difficulty: "High", lastSeen: "3 days ago" },
  ];

  const handleClassicAnswer = (correct) => {
    if (correct) setClassicScore(s => s + 1);
    setClassicStep(s => s + 1);
  };

  // ── Mode selection screen ─────────────────────────────────────────────────

  if (useAdaptive === null) {
    return (
      <div className="py-12 px-6 max-w-5xl mx-auto">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-medium text-moss mb-4 tracking-tight">Practice Engine</h2>
          <p className="text-text-muted text-lg">How would you like to practice today?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <button
            onClick={() => { setUseAdaptive(true); startAdaptiveSession(); }}
            className="p-10 bg-white border-2 border-moss/20 rounded-[2.5rem] text-left hover:shadow-2xl hover:-translate-y-2 transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-moss/10 text-moss flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-moss group-hover:text-white transition-all">
              <span className="iconify text-3xl" data-icon="solar:magic-stick-3-bold-duotone" />
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">AI-Powered Review</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              SM-2 spaced repetition + BKT — reviews exactly what you're about to forget, at the perfect moment.
            </p>
            <div className="mt-4 px-4 py-2 bg-moss/5 text-moss text-xs font-bold rounded-full w-fit">
              Recommended
            </div>
          </button>

          <button
            onClick={() => setUseAdaptive(false)}
            className="p-10 bg-white border border-moss/10 rounded-[2.5rem] text-left hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <span className="iconify text-3xl" data-icon="solar:history-bold-duotone" />
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">Classic Practice</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Error correction, memory recall, and spaced repetition exercises with manual selection.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // ── Classic Practice mode ─────────────────────────────────────────────────

  if (useAdaptive === false) {
    const renderClassicSession = () => {
      if (classicSession === 'error-correction') {
        if (classicStep >= errorData.length) {
          return (
            <div className="text-center py-20 bg-white rounded-3xl animate-in fade-in zoom-in duration-500">
              <h3 className="text-4xl text-moss font-bold mb-4">Session Complete!</h3>
              <p className="text-xl text-text-muted mb-8">You scored {classicScore} / {errorData.length}</p>
              <button onClick={() => { setClassicSession(null); setClassicStep(0); setClassicScore(0); }}
                className="px-8 py-3 bg-moss text-white rounded-full font-bold">Back to Menu</button>
            </div>
          );
        }
        const current = errorData[classicStep];
        return (
          <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-moss/10 animate-in fade-in slide-in-from-bottom flex flex-col items-center">
            <p className="text-sm font-bold text-clay uppercase tracking-widest mb-2">Question {classicStep + 1} of {errorData.length}</p>
            <h3 className="text-3xl font-medium text-charcoal mb-8 text-center">{current.question}</h3>
            <div className="grid grid-cols-2 gap-4 w-full">
              {current.options.map(opt => (
                <button key={opt} onClick={() => handleClassicAnswer(opt === current.answer)}
                  className="py-6 rounded-2xl border-2 border-moss/10 text-xl font-bold text-moss hover:bg-moss/5 transition-all hover:scale-105 hover:border-moss">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }
      if (classicSession === 'memory-recall') {
        if (classicStep >= memoryData.length) {
          return (
            <div className="text-center py-20 bg-white rounded-3xl animate-in fade-in zoom-in duration-500">
              <h3 className="text-4xl text-blue-600 font-bold mb-4">Great Memory!</h3>
              <p className="text-xl text-text-muted mb-8">You recalled {classicScore} / {memoryData.length} correctly.</p>
              <button onClick={() => { setClassicSession(null); setClassicStep(0); setClassicScore(0); }}
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold">Back to Menu</button>
            </div>
          );
        }
        const current = memoryData[classicStep];
        return (
          <div className="max-w-2xl mx-auto bg-blue-50/50 p-10 rounded-3xl shadow-xl border border-blue-100 animate-in fade-in slide-in-from-bottom flex flex-col items-center">
            <div className="bg-white p-6 rounded-2xl w-full mb-8 text-lg font-medium shadow-sm leading-relaxed">{current.text}</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-6">{current.question}</h3>
            <div className="grid grid-cols-3 gap-4 w-full">
              {current.options.map(opt => (
                <button key={opt} onClick={() => handleClassicAnswer(opt === current.answer)}
                  className="py-4 rounded-xl border border-blue-200 bg-white text-lg font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition-all hover:scale-105">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }
    };

    return (
      <div className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button onClick={() => setUseAdaptive(null)} className="text-clay font-medium flex items-center gap-2 hover:underline">
            <span className="iconify" data-icon="solar:arrow-left-linear" /> Switch Mode
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-4xl font-medium text-moss tracking-tight">Classic Practice</h2>
          </div>
        </div>

        {!classicSession ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white p-10 rounded-[2.5rem] border border-moss/10 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group cursor-pointer"
              onClick={() => { setClassicSession('error-correction'); setClassicStep(0); setClassicScore(0); }}>
              <div className="w-16 h-16 rounded-2xl bg-clay/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-clay text-clay group-hover:text-white transition-all">
                <span className="iconify text-3xl" data-icon="solar:magic-stick-3-bold-duotone" />
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-3">Error Correction</h3>
              <p className="text-sm text-text-muted mb-8 leading-relaxed">Identify and fix common spelling mistakes.</p>
              <button className="w-full py-3 bg-moss/5 rounded-full text-moss font-bold group-hover:bg-moss group-hover:text-white transition-all">Start Engine</button>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group cursor-pointer"
              onClick={() => { setClassicSession('memory-recall'); setClassicStep(0); setClassicScore(0); }}>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 text-blue-600 group-hover:text-white transition-all">
                <span className="iconify text-3xl" data-icon="solar:incognito-bold-duotone" />
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-3">Memory Recall</h3>
              <p className="text-sm text-text-muted mb-8 leading-relaxed">Read passages and answer contextual MCQs.</p>
              <button className="w-full py-3 bg-blue-50 rounded-full text-blue-700 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">Start Quiz</button>
            </div>
          </div>
        ) : (
          <div>
            <button onClick={() => setClassicSession(null)} className="mb-8 text-clay font-medium flex items-center gap-2 hover:underline">
              <span className="iconify" data-icon="solar:arrow-left-linear" /> Back to Menu
            </button>
            {renderClassicSession()}
          </div>
        )}
      </div>
    );
  }

  // ── Adaptive Practice mode ────────────────────────────────────────────────

  // Session summary screen
  if (sessionSummary) {
    return (
      <div className="py-12 px-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-moss/10 text-center animate-in fade-in zoom-in duration-500">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-4xl font-bold text-moss mb-4">All caught up!</h2>
          <p className="text-text-muted text-lg mb-8">Great session. Here's your summary:</p>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-moss/5 rounded-2xl">
              <div className="text-3xl font-bold text-moss">{sessionSummary.totalReviewed}</div>
              <div className="text-xs font-bold text-moss/50 uppercase tracking-wider mt-1">Reviewed</div>
            </div>
            <div className="p-6 bg-green-50 rounded-2xl">
              <div className="text-3xl font-bold text-green-600">{sessionSummary.correct}</div>
              <div className="text-xs font-bold text-green-500 uppercase tracking-wider mt-1">Correct</div>
            </div>
            <div className="p-6 bg-orange-50 rounded-2xl">
              <div className="text-3xl font-bold text-orange-500">🔥 {sessionSummary.longestStreak}</div>
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mt-1">Best Streak</div>
            </div>
          </div>

          <p className="text-sm text-text-muted mb-8">Come back tomorrow for your next review session.</p>
          <button onClick={() => { setUseAdaptive(null); setSessionSummary(null); setSessionId(null); }}
            className="px-10 py-4 bg-moss text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform">
            Done
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-12 px-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full border-4 border-moss border-t-transparent animate-spin mb-6" />
        <p className="text-moss font-medium">Loading your review queue...</p>
      </div>
    );
  }

  if (allCaughtUp && !currentExercise) {
    return (
      <div className="py-12 px-6 max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-4xl font-medium text-moss mb-4">All caught up!</h2>
        <p className="text-text-muted text-lg mb-8">Come back tomorrow for your next review.</p>
        <button onClick={() => setUseAdaptive(null)}
          className="px-8 py-3 bg-moss text-white rounded-2xl font-bold hover:scale-105 transition-transform">
          Back to menu
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <button onClick={() => setUseAdaptive(null)} className="text-clay font-medium flex items-center gap-2 hover:underline text-sm">
          <span className="iconify" data-icon="solar:arrow-left-linear" /> Change mode
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-medium text-moss">Review Queue</h2>
        </div>
        <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl">
          <span className="text-sm font-bold text-orange-600">
            {dueCount} item{dueCount !== 1 ? 's' : ''} due for review
          </span>
        </div>
        {stats.streak > 0 && (
          <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl">
            <span className="text-sm font-bold text-orange-500">🔥 {stats.streak} streak</span>
          </div>
        )}
      </div>

      {/* SM-2 update banner */}
      {sm2Update && (
        <div style={{
          padding: '10px 16px', borderRadius: 12, marginBottom: 16,
          background: 'rgba(33,150,243,0.06)', border: '1px solid rgba(33,150,243,0.2)',
          fontSize: 14, fontWeight: 500, color: '#1565C0',
        }}>
          📅 Next review: <strong>{sm2Update.next_review_label}</strong>
          <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
            (Easiness: {sm2Update.easiness_factor})
          </span>
        </div>
      )}

      {/* Explanation */}
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
          <div className="w-12 h-12 rounded-full border-4 border-moss border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-moss/50">Loading next exercise...</p>
        </div>
      )}
    </div>
  );
};

export default PracticeMode;
