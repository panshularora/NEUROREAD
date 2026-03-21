import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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

export default function LearningMode({ active }) {
  const [subMode, setSubMode] = useState('read-along');
  const userId = ensureUserId();

  if (!active) return null;

  const subModes = [
    { id: 'read-along', name: 'Read Along', icon: 'solar:music-note-bold-duotone', color: 'bg-blue-50 text-blue-600' },
    { id: 'phonics', name: 'Phonics Lab', icon: 'solar:microphone-3-bold-duotone', color: 'bg-green-50 text-green-600' },
    { id: 'visual', name: 'Visual Mode', icon: 'solar:eye-bold-duotone', color: 'bg-clay/10 text-clay' },
    { id: 'practice', name: 'Practice', icon: 'solar:magic-stick-3-bold-duotone', color: 'bg-orange-50 text-orange-600' },
    { id: 'stories', name: 'Story Mode', icon: 'solar:book-bold-duotone', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div id="content-learning" className="py-12 px-6 max-w-7xl mx-auto min-h-[80vh] animate-in fade-in duration-700">
      {/* Header */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl font-medium text-moss mb-4 tracking-tight">Learning Adventure</h2>
        <p className="text-text-muted text-lg leading-relaxed">
          Welcome to your reading space. Choose an activity below to start building your skills at your own pace.
        </p>
      </div>

      {/* Sub-mode Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-16">
        {subModes.map((m) => (
          <button
            key={m.id}
            onClick={() => setSubMode(m.id)}
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

      {/* Mode Content Container */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-moss/5 min-h-[500px] relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-moss/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-clay/5 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
        
        <div className="relative z-10">
          {subMode === 'read-along' && <ReadAlongSection userId={userId} />}
          {subMode === 'phonics' && <PhonicsLabSection userId={userId} />}
          {subMode === 'visual' && <VisualModeSection userId={userId} />}
          {subMode === 'practice' && <PracticeSection userId={userId} />}
          {subMode === 'stories' && <StoryModeSection userId={userId} />}
        </div>
      </div>
    </div>
  );
}

/* ──────────────── SUB-SECTIONS ──────────────── */

function ReadAlongSection({ userId }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState(-1);
  const [speed, setSpeed] = useState(400); // ms per word approx

  const story = {
    title: "The Brave Little Ant",
    text: "Once upon a time, there was a tiny ant named Andy. He found a giant cookie in the grass. It was too heavy to carry alone. Andy called his friends for help. Together, they moved the cookie to their home. They had a big feast that night!"
  };

  const words = story.text.split(' ');

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentWordIdx(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return -1;
          }
          return prev + 1;
        });
      }, speed);
    } else {
       clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, words.length, speed]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-3xl font-medium text-moss mb-2">{story.title}</h3>
          <p className="text-text-muted text-sm italic">Press play to start the adventure!</p>
        </div>
        
        <div className="flex items-center gap-4 bg-moss/5 p-2 rounded-2xl border border-moss/10">
          <div className="flex flex-col items-end px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-moss/40">Speed</span>
            <select 
              value={speed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-moss focus:outline-none"
            >
              <option value={600}>Slow</option>
              <option value={400}>Normal</option>
              <option value={250}>Fast</option>
            </select>
          </div>
          <button 
            onClick={() => {
              if (currentWordIdx === -1) setCurrentWordIdx(0);
              setIsPlaying(!isPlaying);
            }}
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
              isPlaying ? 'bg-clay text-white shadow-lg' : 'bg-moss text-white hover:scale-105'
            }`}
          >
            <span className="iconify text-2xl" data-icon={isPlaying ? 'solar:pause-bold' : 'solar:play-bold'} />
          </button>
        </div>
      </div>

      <div className="bg-blue-50/30 p-12 rounded-[3.5rem] border border-blue-100 shadow-inner mb-8 leading-[2.5] min-h-[300px] relative">
        <div className="flex flex-wrap gap-x-2 gap-y-1 relative z-10">
          {words.map((word, idx) => (
            <motion.span
              key={idx}
              onClick={() => {
                alert(`Tap Action:\n📚 Meaning: Example meaning for ${word}\n🔊 Pronunciation available.`);
              }}
              animate={{
                scale: currentWordIdx === idx ? 1.2 : 1,
                color: currentWordIdx === idx ? '#C66B44' : '#2E4036',
                backgroundColor: currentWordIdx === idx ? 'rgba(198, 107, 68, 0.1)' : 'transparent',
              }}
              className={`text-2xl font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer hover:bg-moss/5 ${currentWordIdx === idx ? 'z-10 shadow-sm' : ''}`}
              title="Tap for meaning and pronunciation"
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <button 
          onClick={() => {
            alert('💡 simple explanation: "The sun acts as a giant heater and flashlight for the entire Earth, making sure plants can grow and we see during the day. Before this, they were hiding out in caves."');
          }}
          className="px-6 py-3 bg-clay text-white rounded-full font-bold shadow-md hover:scale-105 hover:shadow-lg transition-all flex items-center gap-3 animate-in fade-in"
        >
          <span className="iconify text-2xl" data-icon="solar:lightbulb-bold-duotone" />
          Help me understand
        </button>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-moss/50 text-xs font-bold uppercase tracking-widest">
            <span className="iconify text-lg" data-icon="solar:info-circle-linear" />
            <span>Tap any word to explore it</span>
          </div>
          <button 
            onClick={() => {
              setIsPlaying(false);
              setCurrentWordIdx(-1);
            }}
            className="text-xs font-bold uppercase tracking-widest text-clay hover:underline pr-4"
          >
            Reset Story
          </button>
        </div>
      </div>
    </div>
  );
}

function PhonicsLabSection({ userId }) {
  const [letterIdx, setLetterIdx] = useState(0);
  const [flashcard, setFlashcard] = useState(null);
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const fetchFlashcard = useCallback(async (idx) => {
    try {
      const res = await getFlashcard(LETTERS[idx]);
      setFlashcard(res?.data || res);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchFlashcard(letterIdx);
  }, [letterIdx, fetchFlashcard]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h3 className="text-3xl font-medium text-moss mb-6">Phonics Lab</h3>
          <p className="text-text-muted mb-10 leading-relaxed">Break words into phonemes and interact with their sounds. Explore letters and their sounds with visual and auditory feedback.</p>
          
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-moss/40">Alphabet Explorer</h4>
            <div className="grid grid-cols-6 gap-2">
              {LETTERS.map((l, idx) => (
                <button 
                  key={l} 
                  onClick={() => setLetterIdx(idx)}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center font-bold text-lg transition-all border ${
                    letterIdx === idx 
                    ? 'bg-green-600 border-green-600 text-white shadow-md' 
                    : 'bg-white border-moss/10 text-moss/60 hover:border-moss/30'
                  }`}
                >
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
                  {(flashcard.examples || []).map(word => (
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

function VisualModeSection({ userId }) {
  const [text, setText] = useState('The cat and the dog play in the sun near the tree');
  
  const iconMap = {
    cat: 'ph:cat-bold',
    dog: 'ph:dog-bold',
    sun: 'ph:sun-bold',
    tree: 'ph:tree-bold',
    bird: 'ph:bird-bold',
    fish: 'ph:fish-bold',
    house: 'ph:house-bold',
    apple: 'ph:apple-bold',
    car: 'ph:car-bold',
    book: 'ph:book-bold',
    star: 'ph:star-bold',
    moon: 'ph:moon-bold',
    heart: 'ph:heart-bold'
  };

  const tokens = text.toLowerCase().split(/\s+/);
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-6 max-w-4xl mx-auto">
       <div className="text-center mb-10">
         <div className="w-16 h-16 rounded-2xl bg-clay/10 text-clay flex items-center justify-center mx-auto mb-6">
           <span className="iconify text-3xl" data-icon="solar:eye-bold-duotone" />
         </div>
         <h3 className="text-3xl font-medium text-moss mb-4">Visual Mode</h3>
         <p className="text-text-muted">Type something below, and we'll translate it into visual concepts to aid comprehension.</p>
       </div>

       <div className="space-y-8">
         <div className="relative group">
           <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 p-8 pr-16 rounded-[2.5rem] border border-moss/10 bg-moss/5 focus:outline-none focus:ring-2 focus:ring-moss/20 transition-all text-xl font-medium text-moss resize-none"
              placeholder="Type words like cat, dog, sun, tree..."
           />
           <button 
             type="button"
             onClick={() => {
               try {
                 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                 if (SpeechRecognition) {
                    const recognition = new SpeechRecognition();
                    recognition.onstart = () => {};
                    recognition.onresult = (event) => {
                      const transcript = event.results[0][0].transcript;
                      setText(text ? text + ' ' + transcript : transcript);
                    };
                    recognition.start();
                 } else {
                    alert('Speech recognition is not supported in this browser.');
                 }
               } catch (e) {
                  console.error(e);
               }
             }}
             className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white shadow-sm border border-moss/10 hover:bg-clay hover:text-white hover:border-clay flex items-center justify-center text-moss transition-all group-focus-within:shadow-md"
             title="Dictate text"
           >
             <span className="iconify text-2xl" data-icon="solar:microphone-3-bold-duotone" />
           </button>
         </div>
         
         <div className="p-12 bg-white rounded-[3.5rem] border border-moss/5 shadow-sm min-h-[200px] flex flex-wrap gap-6 items-center justify-center">
           {tokens.map((token, i) => {
             const cleanToken = token.replace(/[.,!?;:]/g, '');
             const icon = iconMap[cleanToken];
             if (icon) {
               return (
                 <motion.div 
                   key={i} 
                   initial={{ scale: 0 }} 
                   animate={{ scale: 1 }}
                   className="flex flex-col items-center gap-3 p-4 bg-moss/5 rounded-2xl border border-moss/10 min-w-[100px]"
                 >
                   <span className="iconify text-5xl text-moss" data-icon={icon} />
                   <span className="text-xs font-bold uppercase tracking-widest text-clay">{cleanToken}</span>
                 </motion.div>
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

function PracticeSection({ userId }) {
  const [activeGame, setActiveGame] = useState(null);

  const games = [
    { id: 'sound-match', name: 'Sound Match', icon: 'solar:music-note-bold-duotone', desc: 'Listen and find the right word.', color: 'bg-blue-50 text-blue-600' },
    { id: 'word-builder', name: 'Word Builder', icon: 'solar:box-bold-duotone', desc: 'Arrange letters to make words.', color: 'bg-orange-50 text-orange-600' },
  ];

  if (activeGame === 'sound-match') {
    return (
      <div className="animate-in fade-in duration-500">
        <button onClick={() => setActiveGame(null)} className="mb-8 text-clay font-medium flex items-center gap-2 hover:underline">
          <span className="iconify" data-icon="solar:arrow-left-linear" /> Back to Practice
        </button>
        <div className="max-w-xl mx-auto py-12 text-center bg-blue-50/50 rounded-[3rem] border border-blue-100 p-10">
           <h3 className="text-2xl font-medium text-moss mb-8">Sound Match</h3>
           <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-blue-100 flex items-center justify-center mx-auto mb-10">
             <AudioButton text="cat" className="text-blue-600 w-full h-full" />
           </div>
           <div className="grid grid-cols-2 gap-4">
             {['bat', 'cat', 'rat', 'mat'].map(w => (
               <button key={w} className="p-6 bg-white rounded-2xl border border-blue-100 hover:border-blue-400 hover:bg-blue-600 hover:text-white transition-all font-bold text-xl text-blue-900">
                 {w}
               </button>
             ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
       <div className="text-center mb-12">
         <h3 className="text-3xl font-medium text-moss mb-4">Practice Games</h3>
         <p className="text-text-muted">Fun challenges to sharpen your skills!</p>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
         {games.map(game => (
           <button 
             key={game.id} 
             onClick={() => setActiveGame(game.id)}
             className="p-10 bg-white border border-moss/5 rounded-[3rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all text-left flex items-start gap-8 group"
           >
             <div className={`w-16 h-16 rounded-2xl ${game.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
               <span className="iconify text-3xl" data-icon={game.icon} />
             </div>
             <div>
               <h4 className="text-2xl font-medium text-moss mb-2">{game.name}</h4>
               <p className="text-sm text-text-muted leading-relaxed">{game.desc}</p>
             </div>
           </button>
         ))}
       </div>
    </div>
  );
}

function StoryModeSection({ userId }) {
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
           <p className="text-sm text-purple-900/60 leading-relaxed">A short story with simple words and plenty of visual aids.</p>
         </div>
         
         <div className="p-10 bg-moss/5 border border-moss/10 rounded-[3rem] relative overflow-hidden opacity-50 grayscale">
            <h4 className="text-2xl font-medium text-moss mb-2">Mystery at the Farm</h4>
            <p className="text-sm text-text-muted">Complete Level 1 to unlock more stories!</p>
         </div>
       </div>
    </div>
  );
}
