import React, { useState } from 'react';

const PracticeMode = ({ active }) => {
  const [session, setSession] = useState(null); // null | 'error-correction' | 'memory-recall' | 'spaced-repetition'
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  if (!active) return null;

  const errorData = [
    { question: "Select the correct spelling:", options: ["bake", "dake"], answer: "bake" },
    { question: "Which word means 'very big'?", options: ["huge", "huj"], answer: "huge" },
    { question: "Choose the right word:", options: ["because", "becuz"], answer: "because" }
  ];

  const memoryData = [
    { text: "The quick brown fox jumps over the lazy dog. It was a sunny day and the fox was very energetic.", type: 'mcq', question: "What was the weather like?", options: ["Rainy", "Sunny", "Cloudy"], answer: "Sunny" },
    { text: "Water turns to ice when it gets very cold. This happens at zero degrees Celsius.", type: 'mcq', question: "At what temperature does water freeze?", options: ["0", "10", "100"], answer: "0" }
  ];

  const spacedCards = [
    { word: "because", difficulty: "High", lastSeen: "2 hours ago" },
    { word: "friend", difficulty: "Moderate", lastSeen: "yesterday" },
    { word: "beautiful", difficulty: "High", lastSeen: "3 days ago" }
  ];

  const handleAnswer = (correct) => {
    if (correct) setScore(s => s + 1);
    setStep(s => s + 1);
  };

  const renderActiveSession = () => {
    if (session === 'error-correction') {
      if (step >= errorData.length) {
        return (
          <div className="text-center py-20 bg-white rounded-3xl animate-in fade-in zoom-in duration-500">
            <h3 className="text-4xl text-moss font-bold mb-4">Session Complete!</h3>
            <p className="text-xl text-text-muted mb-8">You scored {score} / {errorData.length}</p>
            <button onClick={() => { setSession(null); setStep(0); setScore(0); }} className="px-8 py-3 bg-moss text-white rounded-full font-bold">Back to Menu</button>
          </div>
        );
      }
      const current = errorData[step];
      return (
        <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-moss/10 animate-in fade-in slide-in-from-bottom flex flex-col items-center">
          <p className="text-sm font-bold text-clay uppercase tracking-widest mb-2">Question {step + 1} of {errorData.length}</p>
          <h3 className="text-3xl font-medium text-charcoal mb-8 text-center">{current.question}</h3>
          <div className="grid grid-cols-2 gap-4 w-full">
            {current.options.map(opt => (
              <button 
                key={opt}
                onClick={() => handleAnswer(opt === current.answer)}
                className="py-6 rounded-2xl border-2 border-moss/10 text-xl font-bold text-moss hover:bg-moss/5 transition-all hover:scale-105 hover:border-moss"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (session === 'memory-recall') {
      if (step >= memoryData.length) {
        return (
          <div className="text-center py-20 bg-white rounded-3xl animate-in fade-in zoom-in duration-500">
            <h3 className="text-4xl text-blue-600 font-bold mb-4">Great Memory!</h3>
            <p className="text-xl text-text-muted mb-8">You recalled {score} / {memoryData.length} correctly.</p>
            <button onClick={() => { setSession(null); setStep(0); setScore(0); }} className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold">Back to Menu</button>
          </div>
        );
      }
      const current = memoryData[step];
      return (
        <div className="max-w-2xl mx-auto bg-blue-50/50 p-10 rounded-3xl shadow-xl border border-blue-100 animate-in fade-in slide-in-from-bottom flex flex-col items-center">
          <div className="bg-white p-6 rounded-2xl w-full mb-8 text-lg font-medium shadow-sm leading-relaxed">{current.text}</div>
          <h3 className="text-2xl font-bold text-blue-900 mb-6">{current.question}</h3>
          <div className="grid grid-cols-3 gap-4 w-full">
            {current.options.map(opt => (
              <button 
                key={opt}
                onClick={() => handleAnswer(opt === current.answer)}
                className="py-4 rounded-xl border border-blue-200 bg-white text-lg font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition-all hover:scale-105"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (session === 'spaced-repetition') {
      return (
        <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-moss/10 animate-in fade-in slide-in-from-bottom">
          <h3 className="text-3xl font-medium text-charcoal mb-8 text-center">Spaced Repetition Engine</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spacedCards.map(c => (
              <div key={c.word} className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 flex flex-col items-center text-center group cursor-pointer hover:bg-white transition-all hover:shadow-lg hover:-translate-y-2">
                <span className="text-3xl font-bold text-orange-600 mb-2 group-hover:scale-110 transition-transform">{c.word}</span>
                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Difficulty: {c.difficulty}</span>
                <span className="text-xs text-text-muted mt-4">Last seen: {c.lastSeen}</span>
                <button className="mt-4 px-4 py-2 bg-orange-600/10 text-orange-600 font-bold text-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Review Now</button>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => setSession(null)} className="px-8 py-3 bg-moss/10 text-moss rounded-full font-bold hover:bg-moss hover:text-white transition-colors">Back to Menu</button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h2 className="text-5xl font-medium text-moss mb-4 tracking-tight">Practice Engine</h2>
        <p className="text-text-muted text-lg">
          Active exercises designed with dyslexia in mind to strengthen memory and phonics through spaced repetition.
        </p>
      </div>

      {!session ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-moss/10 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group cursor-pointer" onClick={() => { setSession('error-correction'); setStep(0); setScore(0); }}>
            <div className="w-16 h-16 rounded-2xl bg-clay/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-clay text-clay group-hover:text-white transition-all">
              <span className="iconify text-3xl" data-icon="solar:magic-stick-3-bold-duotone" />
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">Error Correction</h3>
            <p className="text-sm text-text-muted mb-8 leading-relaxed">Identify and fix common spelling mistakes dynamically using our word bank.</p>
            <button className="w-full py-3 bg-moss/5 rounded-full text-moss font-bold group-hover:bg-moss group-hover:text-white transition-all">Start Engine</button>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group cursor-pointer" onClick={() => { setSession('memory-recall'); setStep(0); setScore(0); }}>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 text-blue-600 group-hover:text-white transition-all">
              <span className="iconify text-3xl" data-icon="solar:incognito-bold-duotone" />
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">Memory Recall</h3>
            <p className="text-sm text-text-muted mb-8 leading-relaxed">Boost comprehension by reading passages and answering contextual MCQs immediately.</p>
            <button className="w-full py-3 bg-blue-50 rounded-full text-blue-700 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">Start Quiz</button>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-orange-100 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group cursor-pointer" onClick={() => setSession('spaced-repetition')}>
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-600 text-orange-600 group-hover:text-white transition-all">
              <span className="iconify text-3xl" data-icon="solar:history-bold-duotone" />
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">Spaced Repetition</h3>
            <p className="text-sm text-text-muted mb-8 leading-relaxed">An intelligent algorithm tracks what you forget to surface words right when you need them.</p>
            <button className="w-full py-3 bg-orange-50 rounded-full text-orange-700 font-bold group-hover:bg-orange-600 group-hover:text-white transition-all">View Memory Bank</button>
          </div>
        </div>
      ) : (
        renderActiveSession()
      )}
    </div>
  );
};

export default PracticeMode;
