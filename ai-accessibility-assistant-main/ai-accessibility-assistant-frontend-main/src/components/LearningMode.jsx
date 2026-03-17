import { useState, useEffect, useCallback } from 'react';
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
} from '../services/api';
import LearningModal from './LearningModal';

/* ──────────────── tiny helpers ──────────────── */
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const SOUND_KEYS = ['b','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','z'];
const WORD_POOL = ['cat','dog','bat','sun','run','map','pen','cup','bus','hat','pig','top','net','bed'];
const PICTURE_WORDS = ['cat','dog','fish','bird','frog','sun','tree','star','moon','ball','book','hat','cup','car','bus','cake','ring','lamp','ship','drum'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ──────────────── main component ──────────────── */
export default function LearningMode({ active }) {
  const [modalType, setModalType] = useState(null);
  const userId = ensureUserId();

  const closeModal = () => setModalType(null);

  return (
    <div
      id="content-learning"
      className={`col-start-1 row-start-1 transition-all duration-700 ease-spring ${
        active ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-8 pointer-events-none z-0'
      }`}
    >
      <div className="bg-[#1A1A1A] rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden h-full">
        <div className="absolute inset-0 z-0 bg-moss/5 mix-blend-multiply border border-cream/5 rounded-[3rem]" />
        <div className="relative z-10">
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <span className="font-mono text-xs text-clay uppercase tracking-wider mb-4 block">System 02</span>
            <h2 className="font-medium text-4xl tracking-tight text-cream mb-4">Learning Mode</h2>
            <p className="text-cream/70 text-sm md:text-base leading-relaxed">
              For early readers. <span className="italic text-clay text-lg">Playful yet clinical precision</span>{' '}
              to build fundamental literacy skills effortlessly.
            </p>
          </div>

          <div className="h-px bg-cream/10 my-8 w-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr min-h-[600px]">
            {/* Card 1 — Phonics */}
            <div
              onClick={() => setModalType('phonics')}
              className="clickable-card md:col-span-2 bg-[#2A2A2A] border-l-4 border-clay rounded-[2rem] p-10 flex flex-col md:flex-row gap-8 items-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_-15px_rgba(204,88,51,0.3)] group relative cursor-pointer h-full"
              style={{ boxShadow: 'inset 0 0 40px rgba(204,88,51,0.06)' }}
            >
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-clay/10 flex items-center justify-center group-hover:scale-105 transition-transform border border-clay/20 group-hover:bg-clay">
                <span className="iconify text-2xl text-clay group-hover:text-charcoal" data-icon="solar:microphone-3-linear" />
              </div>
              <div className="text-center md:text-left flex-1">
                <span className="text-[10px] text-clay/70 font-mono uppercase tracking-wider mb-2 block">PHONICS</span>
                <h3 className="font-medium text-3xl tracking-tight text-cream mb-3">Phonics & Reading</h3>
                <p className="text-base text-cream/50 leading-relaxed max-w-2xl">
                  Phonics flashcards + Interactive phonics. Break down words into sounds with real-time visual and auditory feedback designed for developing minds.
                </p>
              </div>
            </div>

            {/* Card 2 — Games */}
            <div
              onClick={() => setModalType('games')}
              className="clickable-card bg-[#2A2A2A] border-l-4 border-clay rounded-[2rem] p-10 flex flex-col gap-6 items-start justify-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_-15px_rgba(204,88,51,0.3)] group relative cursor-pointer h-full"
              style={{ boxShadow: 'inset 0 0 40px rgba(204,88,51,0.06)' }}
            >
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-clay/10 flex items-center justify-center group-hover:scale-105 transition-transform border border-clay/20 group-hover:bg-clay">
                <span className="iconify text-2xl text-clay group-hover:text-charcoal" data-icon="solar:gamepad-linear" />
              </div>
              <div>
                <span className="text-[10px] text-clay/70 font-mono uppercase tracking-wider mb-2 block">GAMES</span>
                <h3 className="font-medium text-2xl tracking-tight text-cream mb-3">Games & Play</h3>
                <p className="text-base text-cream/50 leading-relaxed">
                  Sound matching · Word builder · Rhyming quiz · Picture-word matching
                </p>
              </div>
            </div>

            {/* Card 3 — Comprehension */}
            <div
              onClick={() => setModalType('comprehension')}
              className="clickable-card bg-[#2A2A2A] border-l-4 border-clay rounded-[2rem] p-10 flex flex-col gap-6 items-start justify-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_-15px_rgba(204,88,51,0.3)] group relative cursor-pointer h-full"
              style={{ boxShadow: 'inset 0 0 40px rgba(204,88,51,0.06)' }}
            >
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-clay/10 flex items-center justify-center group-hover:scale-105 transition-transform border border-clay/20 group-hover:bg-clay">
                <span className="iconify text-2xl text-clay group-hover:text-charcoal" data-icon="solar:brain-linear" />
              </div>
              <div>
                <span className="text-[10px] text-clay/70 font-mono uppercase tracking-wider mb-2 block">COMPREHENSION</span>
                <h3 className="font-medium text-2xl tracking-tight text-cream mb-3">Comprehension & Lessons</h3>
                <p className="text-base text-cream/50 leading-relaxed">
                  Comprehension questions + Daily lesson path
                </p>
              </div>
            </div>

            {/* Card 4 — Progress */}
            <div
              onClick={() => setModalType('progress')}
              className="clickable-card md:col-span-2 bg-[#2A2A2A] border-l-4 border-clay rounded-[2rem] p-10 flex flex-col md:flex-row gap-8 items-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_-15px_rgba(204,88,51,0.3)] group relative cursor-pointer h-full"
              style={{ boxShadow: 'inset 0 0 40px rgba(204,88,51,0.06)' }}
            >
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-clay/10 flex items-center justify-center group-hover:scale-105 transition-transform border border-clay/20 group-hover:bg-clay">
                <span className="iconify text-2xl text-clay group-hover:text-charcoal" data-icon="solar:chart-2-linear" />
              </div>
              <div className="text-center md:text-left flex-1">
                <span className="text-[10px] text-clay/70 font-mono uppercase tracking-wider mb-2 block">PROGRESS</span>
                <h3 className="font-medium text-3xl tracking-tight text-cream mb-3">Progress Tracker</h3>
                <p className="text-base text-cream/50 leading-relaxed max-w-2xl">
                  Track your learning journey with badges, accuracy stats, and level progression.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}

      {modalType === 'phonics' && (
        <PhonicsModal open onClose={closeModal} userId={userId} />
      )}

      {modalType === 'games' && (
        <GamesModal open onClose={closeModal} userId={userId} />
      )}

      {modalType === 'comprehension' && (
        <ComprehensionModal open onClose={closeModal} userId={userId} />
      )}

      {modalType === 'progress' && (
        <ProgressModal open onClose={closeModal} userId={userId} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. PHONICS MODAL
   ═══════════════════════════════════════════════════════════════ */
function PhonicsModal({ open, onClose, userId }) {
  const [letterIdx, setLetterIdx] = useState(0);
  const [flashcard, setFlashcard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Interactive phonics
  const [word, setWord] = useState('');
  const [phonicsResult, setPhonicsResult] = useState(null);
  const [phonicsLoading, setPhonicsLoading] = useState(false);

  const fetchFlashcard = useCallback(async (idx) => {
    setLoading(true);
    setError(null);
    setIsFlipped(false);
    try {
      const res = await getFlashcard(LETTERS[idx]);
      setFlashcard(res?.data || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchFlashcard(letterIdx);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const goLetter = (dir) => {
    const next = (letterIdx + dir + 26) % 26;
    setLetterIdx(next);
    fetchFlashcard(next);
  };

  const handlePhonics = async () => {
    if (!word.trim()) return;
    setPhonicsLoading(true);
    try {
      const res = await getPhonics(word.trim());
      setPhonicsResult(res);
    } catch { /* silently ignore */ }
    setPhonicsLoading(false);
  };

  return (
    <LearningModal open={open} onClose={onClose} title="Phonics & Reading">
      <div className="space-y-12">
        {/* Flashcard Section */}
        <section>
          <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-6">Phonics Flashcards</h4>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex items-center justify-center gap-6">
            <button onClick={() => goLetter(-1)} className="w-10 h-10 rounded-full bg-charcoal/5 hover:bg-charcoal/10 flex items-center justify-center transition-colors text-charcoal/50 hover:text-charcoal text-xl font-bold">‹</button>

            <div
              className={`relative w-64 h-80 transition-all duration-500 [transform-style:preserve-3d] cursor-pointer ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front */}
              <div className="absolute inset-0 bg-white rounded-3xl border-2 border-clay/20 shadow-xl flex flex-col items-center justify-center p-8 [backface-visibility:hidden]">
                {loading ? (
                  <div className="animate-pulse text-clay/40 text-xl">Loading…</div>
                ) : flashcard ? (
                  <>
                    <span className="text-8xl font-bold text-clay mb-2">{flashcard.letter || LETTERS[letterIdx].toUpperCase()}</span>
                    <span className="text-lg text-charcoal/60 mb-1">{flashcard.examples?.[0] || ''}</span>
                    <p className="mt-6 text-[10px] text-charcoal/30 uppercase tracking-widest">Click to flip</p>
                  </>
                ) : null}
              </div>
              {/* Back */}
              <div className="absolute inset-0 bg-clay rounded-3xl border-2 border-clay shadow-xl flex flex-col items-center justify-center p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                {flashcard && (
                  <>
                    <span className="text-3xl font-medium text-white mb-3">{flashcard.sound}</span>
                    <p className="text-white/80 text-center text-sm mb-4">{flashcard.mnemonic}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {flashcard.examples?.map((ex) => (
                        <span key={ex} className="px-3 py-1 rounded-full bg-white/20 text-white text-xs">{ex}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <button onClick={() => goLetter(1)} className="w-10 h-10 rounded-full bg-charcoal/5 hover:bg-charcoal/10 flex items-center justify-center transition-colors text-charcoal/50 hover:text-charcoal text-xl font-bold">›</button>
          </div>

          <p className="text-center text-charcoal/30 text-xs mt-4">
            Letter {letterIdx + 1} of 26
          </p>
        </section>

        {/* Interactive Section */}
        <section className="bg-white/50 rounded-3xl p-8 border border-charcoal/5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-6">Interactive Phonics</h4>
          <div className="flex gap-4">
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePhonics()}
              className="flex-1 rounded-2xl border border-charcoal/10 bg-white px-6 py-4 text-charcoal focus:outline-none focus:ring-2 focus:ring-clay/30"
              placeholder="Enter a word (e.g., octopus)"
            />
            <button
              onClick={handlePhonics}
              disabled={phonicsLoading}
              className="px-8 py-4 rounded-2xl bg-clay text-white font-medium hover:brightness-110 transition-all disabled:opacity-50"
            >
              {phonicsLoading ? '...' : 'GET PHONICS'}
            </button>
          </div>
          {phonicsResult && (
            <div className="mt-6 p-6 bg-clay/5 rounded-2xl border border-clay/10 animate-in fade-in slide-in-from-top-4">
              <p className="text-clay font-medium mb-2">Breakdown for "{phonicsResult.word}":</p>
              <div className="flex gap-3 text-3xl font-bold text-charcoal flex-wrap">
                {(phonicsResult.tokens || []).map((tok, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="bg-white w-12 h-16 flex items-center justify-center rounded-xl border border-clay/10 shadow-sm">{tok.grapheme}</span>
                    <span className="text-xs text-clay/60 mt-1">{tok.sound}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </LearningModal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. GAMES MODAL
   ═══════════════════════════════════════════════════════════════ */
function GamesModal({ open, onClose, userId }) {
  const [activeGame, setActiveGame] = useState(null); // 'sound_match' | 'word_builder' | 'rhyme' | 'picture_match'
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'

  // Word builder specific
  const [builtWord, setBuiltWord] = useState([]);

  const GAMES = [
    { id: 'sound_match', name: 'Sound Matching', icon: 'solar:music-note-linear', color: 'bg-blue-50 text-blue-500' },
    { id: 'word_builder', name: 'Word Builder', icon: 'solar:box-linear', color: 'bg-orange-50 text-orange-500' },
    { id: 'rhyme', name: 'Rhyming Quiz', icon: 'solar:chat-round-dots-linear', color: 'bg-purple-50 text-purple-500' },
    { id: 'picture_match', name: 'Picture-Word', icon: 'solar:gallery-linear', color: 'bg-green-50 text-green-500' },
  ];

  const startGame = async (gameId) => {
    setActiveGame(gameId);
    setSelected(null);
    setFeedback(null);
    setBuiltWord([]);
    setLoading(true);
    try {
      let res;
      if (gameId === 'sound_match') res = await getSoundMatch(pick(SOUND_KEYS));
      else if (gameId === 'word_builder') res = await getBuildWord(pick(WORD_POOL));
      else if (gameId === 'rhyme') res = await getRhyme(pick(WORD_POOL));
      else if (gameId === 'picture_match') res = await getPictureMatch(pick(PICTURE_WORDS));
      setGameData(res?.data || res);
    } catch (e) {
      setGameData({ error: e.message });
    }
    setLoading(false);
  };

  const handleAnswer = async (answer, correctAnswer) => {
    setSelected(answer);
    const isCorrect = answer === correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    try {
      await updateLearningProgress(userId, activeGame, isCorrect);
    } catch { /* best effort */ }
  };

  const nextRound = () => startGame(activeGame);

  if (!activeGame) {
    return (
      <LearningModal open={open} onClose={onClose} title="Games & Play">
        <div className="grid grid-cols-2 gap-6">
          {GAMES.map((game) => (
            <div key={game.id} className="bg-white rounded-[2rem] p-8 border border-charcoal/5 flex flex-col items-center text-center gap-4 hover:shadow-lg transition-all group">
              <div className={`w-16 h-16 rounded-2xl ${game.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className="iconify text-3xl" data-icon={game.icon} />
              </div>
              <h5 className="font-bold text-charcoal">{game.name}</h5>
              <button
                onClick={() => startGame(game.id)}
                className="mt-2 w-full py-3 rounded-xl bg-charcoal text-white text-xs font-bold uppercase tracking-widest hover:bg-charcoal/80 transition-colors"
              >
                START
              </button>
            </div>
          ))}
        </div>
      </LearningModal>
    );
  }

  return (
    <LearningModal open={open} onClose={() => { setActiveGame(null); onClose(); }} title={GAMES.find(g => g.id === activeGame)?.name || 'Game'}>
      <div className="min-h-[300px]">
        <button onClick={() => setActiveGame(null)} className="text-sm text-clay hover:underline mb-6 inline-flex items-center gap-1">← Back to games</button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-clay/30 border-t-clay rounded-full animate-spin" />
          </div>
        ) : gameData?.error ? (
          <p className="text-red-500">{gameData.error}</p>
        ) : gameData && activeGame === 'word_builder' ? (
          /* ── Word Builder ── */
          <WordBuilderGame data={gameData} onComplete={(correct) => {
            setFeedback(correct ? 'correct' : 'wrong');
            updateLearningProgress(userId, 'word_builder', correct).catch(() => {});
          }} feedback={feedback} onNext={nextRound} />
        ) : gameData ? (
          /* ── Multiple Choice Games (sound, rhyme, picture) ── */
          <div className="space-y-6">
            {/* Prompt */}
            <div className="text-center">
              {activeGame === 'picture_match' && gameData.targetEmoji && (
                <span className="text-7xl block mb-4">{gameData.targetEmoji}</span>
              )}
              <p className="text-xl font-medium text-charcoal">{gameData.prompt || `Find the right answer!`}</p>
            </div>

            {/* Options */}
            <div className="grid gap-3 max-w-md mx-auto">
              {(gameData.options || []).map((opt) => {
                const isCorrect = opt === gameData.correct;
                const isSelected = opt === selected;
                let cls = 'text-left px-6 py-4 rounded-2xl border transition-all font-medium ';
                if (!feedback) cls += 'border-charcoal/10 hover:bg-clay/5 hover:border-clay/30 text-charcoal/70 cursor-pointer';
                else if (isSelected && isCorrect) cls += 'bg-green-100 border-green-400 text-green-800';
                else if (isSelected && !isCorrect) cls += 'bg-red-100 border-red-400 text-red-800';
                else if (isCorrect && feedback) cls += 'bg-green-50 border-green-300 text-green-700';
                else cls += 'border-charcoal/10 text-charcoal/40';

                return (
                  <button key={opt} className={cls} disabled={!!feedback} onClick={() => handleAnswer(opt, gameData.correct)}>
                    {activeGame === 'picture_match' ? (
                      <span className="flex items-center gap-3">
                        <span className="text-2xl">{gameData.optionDetails?.find(o => o.word === opt)?.emoji || '❓'}</span>
                        <span>{opt}</span>
                      </span>
                    ) : opt}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className="text-center space-y-4 animate-in fade-in duration-300">
                <p className={`text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
                  {feedback === 'correct' ? '🎉 Correct!' : `❌ The answer was "${gameData.correct}"`}
                </p>
                <button onClick={nextRound} className="px-8 py-3 rounded-2xl bg-clay text-white font-medium hover:brightness-110 transition-all">
                  Next Round →
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </LearningModal>
  );
}

/* ── Word Builder Sub-Game ── */
function WordBuilderGame({ data, onComplete, feedback, onNext }) {
  const [built, setBuilt] = useState([]);
  const [remaining, setRemaining] = useState(data.letters || []);

  useEffect(() => {
    setBuilt([]);
    setRemaining(data.letters || []);
  }, [data]);

  const addLetter = (letter, idx) => {
    if (feedback) return;
    const newBuilt = [...built, letter];
    const newRemaining = [...remaining];
    newRemaining.splice(idx, 1);
    setBuilt(newBuilt);
    setRemaining(newRemaining);

    // Check if complete
    if (newRemaining.length === 0) {
      const word = newBuilt.join('');
      onComplete(word === data.word);
    }
  };

  const removeLetter = (idx) => {
    if (feedback) return;
    const letter = built[idx];
    const newBuilt = [...built];
    newBuilt.splice(idx, 1);
    setBuilt(newBuilt);
    setRemaining([...remaining, letter]);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-sm text-charcoal/50 mb-2">Arrange the letters to build the word</p>
        {data.hint && <p className="text-clay text-sm font-medium">{data.hint}</p>}
        <div className="flex gap-1 justify-center mt-2">
          {(data.phonemes || []).map((p, i) => (
            <span key={i} className="text-xs text-charcoal/30">/{p}/</span>
          ))}
        </div>
      </div>

      {/* Built slots */}
      <div className="flex gap-3 justify-center min-h-[64px]">
        {Array.from({ length: data.letterCount || data.word?.length || 0 }).map((_, i) => (
          <div
            key={i}
            onClick={() => built[i] && removeLetter(i)}
            className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all cursor-pointer ${
              built[i]
                ? feedback === 'correct' ? 'bg-green-100 border-green-400 text-green-700'
                  : feedback === 'wrong' ? 'bg-red-100 border-red-400 text-red-700'
                  : 'bg-white border-clay/30 text-charcoal shadow-sm hover:border-clay'
                : 'bg-charcoal/5 border-dashed border-charcoal/15'
            }`}
          >
            {built[i] || ''}
          </div>
        ))}
      </div>

      {/* Available letters */}
      <div className="flex gap-3 justify-center flex-wrap">
        {remaining.map((letter, i) => (
          <button
            key={`${letter}-${i}`}
            onClick={() => addLetter(letter, i)}
            disabled={!!feedback}
            className="w-14 h-14 rounded-xl bg-white border border-charcoal/10 text-xl font-bold text-charcoal shadow-sm hover:shadow-md hover:border-clay/30 transition-all disabled:opacity-50"
          >
            {letter}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="text-center space-y-4 animate-in fade-in duration-300">
          <p className={`text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
            {feedback === 'correct' ? '🎉 Correct!' : `❌ The word was "${data.word}"`}
          </p>
          <button onClick={onNext} className="px-8 py-3 rounded-2xl bg-clay text-white font-medium hover:brightness-110 transition-all">
            Next Word →
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. COMPREHENSION MODAL
   ═══════════════════════════════════════════════════════════════ */
function ComprehensionModal({ open, onClose, userId }) {
  const [activeTab, setActiveTab] = useState('comprehension');

  // Comprehension state
  const [compText, setCompText] = useState('');
  const [compData, setCompData] = useState(null);
  const [compLoading, setCompLoading] = useState(false);
  const [answers, setAnswers] = useState({});

  // Lesson state
  const [lesson, setLesson] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  const fetchComprehension = async () => {
    if (!compText.trim()) return;
    setCompLoading(true);
    setAnswers({});
    try {
      const res = await getComprehension(compText.trim(), 4);
      setCompData(res?.data || res);
    } catch { setCompData(null); }
    setCompLoading(false);
  };

  const fetchLesson = useCallback(async () => {
    setLessonLoading(true);
    try {
      const res = await getLesson(userId);
      setLesson(res?.data || res);
    } catch { /* ignore */ }
    setLessonLoading(false);
  }, [userId]);

  useEffect(() => {
    if (open && activeTab === 'lesson') fetchLesson();
  }, [open, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompAnswer = (qIdx, answer, correct) => {
    setAnswers(prev => ({ ...prev, [qIdx]: { answer, correct: answer === correct } }));
    updateLearningProgress(userId, 'comprehension', answer === correct).catch(() => {});
  };

  return (
    <LearningModal open={open} onClose={onClose} title="Comprehension & Lessons">
      <div className="flex flex-col h-full">
        <div className="flex bg-charcoal/5 p-1 rounded-2xl mb-8 self-center">
          {['comprehension', 'lesson'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal/40 hover:text-charcoal/60'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activeTab === 'comprehension' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Input */}
              <div className="flex gap-3">
                <textarea
                  value={compText}
                  onChange={(e) => setCompText(e.target.value)}
                  rows={3}
                  className="flex-1 rounded-2xl border border-charcoal/10 bg-white px-6 py-4 text-charcoal focus:outline-none focus:ring-2 focus:ring-clay/30 resize-none"
                  placeholder="Paste or type a paragraph for comprehension questions…"
                />
              </div>
              <button
                onClick={fetchComprehension}
                disabled={compLoading || !compText.trim()}
                className="px-8 py-3 rounded-2xl bg-clay text-white font-medium hover:brightness-110 transition-all disabled:opacity-50"
              >
                {compLoading ? 'Generating…' : 'Generate Questions'}
              </button>

              {/* Questions */}
              {compData?.questions?.map((q, qIdx) => (
                <div key={qIdx} className="bg-white p-6 rounded-2xl border border-charcoal/5 shadow-sm space-y-4">
                  <p className="font-bold text-charcoal">{qIdx + 1}. {q.question}</p>
                  <div className="grid gap-2">
                    {(q.options || []).map((opt) => {
                      const ans = answers[qIdx];
                      let cls = 'text-left px-5 py-3 rounded-xl border text-sm transition-all ';
                      if (!ans) cls += 'border-charcoal/10 hover:bg-clay/5 hover:border-clay/30 text-charcoal/70 cursor-pointer';
                      else if (opt === ans.answer && ans.correct) cls += 'bg-green-100 border-green-400 text-green-800';
                      else if (opt === ans.answer && !ans.correct) cls += 'bg-red-100 border-red-400 text-red-800';
                      else if (opt === q.correct && ans) cls += 'bg-green-50 border-green-300 text-green-700';
                      else cls += 'border-charcoal/10 text-charcoal/40';

                      return (
                        <button key={opt} className={cls} disabled={!!ans} onClick={() => handleCompAnswer(qIdx, opt, q.correct)}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── Lesson Tab ── */
            <div className="animate-in fade-in duration-300">
              {lessonLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-clay/30 border-t-clay rounded-full animate-spin" />
                </div>
              ) : lesson ? (
                <div className="space-y-8">
                  <div className="text-center bg-clay/5 p-6 rounded-2xl border border-clay/10">
                    <p className="text-sm text-clay font-mono uppercase tracking-wider mb-1">Level {lesson.level} of {lesson.totalLevels}</p>
                    <h3 className="text-2xl font-bold text-charcoal mb-2">{lesson.focus}</h3>
                    <p className="text-charcoal/60 text-sm">{lesson.description}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal/40">Today's Activities</h4>
                    {(lesson.activities || []).map((act, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-charcoal/5 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-clay/10 text-clay flex items-center justify-center font-bold">{i + 1}</div>
                        <div className="flex-1">
                          <p className="font-medium text-charcoal">{act.label}</p>
                          {act.sampleInput && <p className="text-xs text-charcoal/40">Practice with: {act.sampleInput}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-3">Target Words</h4>
                    <div className="flex flex-wrap gap-2">
                      {(lesson.targetWords || []).map((w) => (
                        <span key={w} className="px-4 py-2 bg-white rounded-xl border border-charcoal/5 text-sm font-medium text-charcoal">{w}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-charcoal/40 text-center py-12">Could not load lesson data.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </LearningModal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PROGRESS MODAL
   ═══════════════════════════════════════════════════════════════ */
function ProgressModal({ open, onClose, userId }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getLearningProgress(userId)
      .then((res) => setProgress(res?.data || res))
      .catch(() => setProgress(null))
      .finally(() => setLoading(false));
  }, [open, userId]);

  if (loading) {
    return (
      <LearningModal open={open} onClose={onClose} title="Progress Tracker">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-clay/30 border-t-clay rounded-full animate-spin" />
        </div>
      </LearningModal>
    );
  }

  const p = progress || { wordsLearned: 0, accuracy: 0, currentLevel: 1, lessonsCompleted: 0, badges: [], nextBadge: null };

  return (
    <LearningModal open={open} onClose={onClose} title="Progress Tracker">
      <div className="space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Current Level', val: `Level ${p.currentLevel}`, icon: 'solar:fire-linear', color: 'text-orange-500' },
            { label: 'Words Learned', val: String(p.wordsLearned), icon: 'solar:book-linear', color: 'text-blue-500' },
            { label: 'Accuracy', val: `${p.accuracy}%`, icon: 'solar:chart-2-linear', color: 'text-green-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-charcoal/5 shadow-sm text-center flex flex-col items-center justify-center">
              <span className={`iconify text-3xl mb-2 ${stat.color}`} data-icon={stat.icon} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-charcoal">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Second row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-charcoal/5 shadow-sm text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 mb-1">Lessons Completed</p>
            <p className="text-3xl font-bold text-charcoal">{p.lessonsCompleted}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-charcoal/5 shadow-sm text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 mb-1">Total Badges</p>
            <p className="text-3xl font-bold text-charcoal">{p.badges?.length || 0}</p>
          </div>
        </div>

        {/* Badges */}
        <section>
          <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-6 text-center">Badges Earned</h4>
          {p.badges?.length > 0 ? (
            <div className="flex flex-wrap gap-4 justify-center">
              {p.badges.map((b) => (
                <div key={b.name} className="flex flex-col items-center gap-2 bg-white p-4 rounded-2xl border border-charcoal/5 shadow-sm min-w-[100px]">
                  <span className="text-3xl">{b.emoji}</span>
                  <span className="text-xs font-bold text-charcoal text-center">{b.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-charcoal/40 text-sm">No badges earned yet. Keep learning!</p>
          )}
        </section>

        {/* Next Badge */}
        {p.nextBadge && (
          <section className="bg-clay/5 p-6 rounded-2xl border border-clay/10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-clay/60 mb-2">Next Badge</p>
            <span className="text-4xl block mb-2">{p.nextBadge.emoji}</span>
            <p className="font-bold text-charcoal">{p.nextBadge.name}</p>
            <p className="text-sm text-charcoal/50">Learn {p.nextBadge.wordsNeeded} more word{p.nextBadge.wordsNeeded === 1 ? '' : 's'} to unlock!</p>
          </section>
        )}
      </div>
    </LearningModal>
  );
}
