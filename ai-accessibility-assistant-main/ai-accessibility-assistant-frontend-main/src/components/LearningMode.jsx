import { useMemo, useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { getPhonics, getLearningExercise, getSpellingPractice, getComprehension } from '../services/api';

export default function LearningMode({ active }) {
  const [word, setWord] = useState('');
  const [text, setText] = useState('');

  const [phonicsResult, setPhonicsResult] = useState(null);
  const [exerciseResult, setExerciseResult] = useState(null);
  const [spellingResult, setSpellingResult] = useState(null);
  const [comprehensionResult, setComprehensionResult] = useState(null);

  const phonicsAsync = useAsync(getPhonics, { retries: 0 });
  const exerciseAsync = useAsync(getLearningExercise, { retries: 0 });
  const spellingAsync = useAsync(getSpellingPractice, { retries: 0 });
  const comprehensionAsync = useAsync(getComprehension, { retries: 0 });

  const anyLoading = phonicsAsync.loading || exerciseAsync.loading || spellingAsync.loading || comprehensionAsync.loading;

  return (
    <div
      id="content-learning"
      className={`col-start-1 row-start-1 transition-all duration-700 ease-spring ${
        active ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-8 pointer-events-none z-0'
      }`}
    >
      <div className="bg-charcoal rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden h-full">
        <div className="absolute inset-0 z-0 bg-moss/5 mix-blend-multiply border border-cream/5 rounded-[3rem]" />
        <div className="relative z-10">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <span className="font-mono text-xs text-clay uppercase tracking-wider mb-4 block">System 02</span>
            <h2 className="font-medium text-4xl tracking-tight text-cream mb-4">Learning Mode</h2>
            <p className="text-cream/70 text-sm md:text-base leading-relaxed">
              For early readers. <span className="italic text-clay text-lg">Playful yet clinical precision</span>{' '}
              to build fundamental literacy skills effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-cream/5 bg-cream/[0.03] rounded-[2rem] p-8 flex flex-col gap-5 items-start transition-all duration-300 hover:-translate-y-2 hover:bg-cream/[0.06] group">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-clay/10 flex items-center justify-center group-hover:scale-105 transition-transform border border-clay/20">
                <span className="iconify text-2xl text-clay" data-icon="solar:microphone-3-linear" data-inline="false" />
              </div>
              <div>
                <h3 className="font-medium text-2xl tracking-tight text-cream mb-2">Interactive Phonics</h3>
                <p className="text-sm text-cream/50 leading-relaxed">
                  Break down words into sounds. Real-time visual and auditory feedback designed for developing minds.
                </p>
              </div>

              <div className="w-full">
                <label className="text-[10px] font-medium text-cream/50 uppercase tracking-wider block mb-1.5">Word</label>
                <input
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="w-full rounded-xl border border-cream/10 bg-black/10 px-4 py-2.5 text-sm text-cream focus:outline-none focus:ring-2 focus:ring-clay/30"
                  placeholder="e.g., apple"
                />
                <button
                  type="button"
                  disabled={phonicsAsync.loading || !word.trim()}
                  onClick={async () => {
                    try {
                      const res = await phonicsAsync.run(word.trim());
                      setPhonicsResult(res);
                    } catch {
                      setPhonicsResult(null);
                    }
                  }}
                  className="mt-3 px-5 py-2.5 rounded-full bg-clay text-charcoal text-xs font-medium uppercase tracking-wide disabled:opacity-60"
                >
                  {phonicsAsync.loading ? 'Loading…' : 'Get phonics'}
                </button>

                {phonicsAsync.error ? (
                  <p className="mt-3 text-xs text-red-300">{phonicsAsync.error.message}</p>
                ) : null}

                {phonicsResult ? (
                  <div className="mt-4 rounded-2xl border border-cream/10 bg-black/10 p-4 text-cream/80 text-sm whitespace-pre-wrap">
                    {JSON.stringify(phonicsResult, null, 2)}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border border-cream/5 bg-cream/[0.03] rounded-[2rem] p-8 flex flex-col gap-5 items-start transition-all duration-300 hover:-translate-y-2 hover:bg-cream/[0.06] group">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-clay/10 flex items-center justify-center group-hover:scale-105 transition-transform border border-clay/20">
                <span className="iconify text-2xl text-clay" data-icon="solar:pen-new-square-linear" data-inline="false" />
              </div>
              <div>
                <h3 className="font-medium text-2xl tracking-tight text-cream mb-2">Spelling Trainer</h3>
                <p className="text-sm text-cream/50 leading-relaxed">
                  Gamified spelling practice that algorithmically adapts to the child's unique learning curve.
                </p>
              </div>

              <div className="w-full">
                <label className="text-[10px] font-medium text-cream/50 uppercase tracking-wider block mb-1.5">Text</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-cream/10 bg-black/10 px-4 py-3 text-sm text-cream focus:outline-none focus:ring-2 focus:ring-clay/30"
                  placeholder="Paste a short sentence…"
                />
                <div className="flex gap-3 flex-wrap mt-3">
                  <button
                    type="button"
                    disabled={exerciseAsync.loading || !text.trim()}
                    onClick={async () => {
                      try {
                        const res = await exerciseAsync.run(text.trim(), 3);
                        setExerciseResult(res);
                      } catch {
                        setExerciseResult(null);
                      }
                    }}
                    className="px-5 py-2.5 rounded-full bg-cream text-charcoal text-xs font-medium uppercase tracking-wide disabled:opacity-60"
                  >
                    {exerciseAsync.loading ? 'Loading…' : 'Fill-in-the-blank'}
                  </button>
                  <button
                    type="button"
                    disabled={spellingAsync.loading || !text.trim()}
                    onClick={async () => {
                      try {
                        const res = await spellingAsync.run(text.trim(), 5);
                        setSpellingResult(res);
                      } catch {
                        setSpellingResult(null);
                      }
                    }}
                    className="px-5 py-2.5 rounded-full bg-clay text-charcoal text-xs font-medium uppercase tracking-wide disabled:opacity-60"
                  >
                    {spellingAsync.loading ? 'Loading…' : 'Scramble words'}
                  </button>
                </div>

                {(exerciseAsync.error || spellingAsync.error) ? (
                  <p className="mt-3 text-xs text-red-300">
                    {(exerciseAsync.error || spellingAsync.error).message}
                  </p>
                ) : null}

                {exerciseResult ? (
                  <div className="mt-4 rounded-2xl border border-cream/10 bg-black/10 p-4 text-cream/80 text-sm whitespace-pre-wrap">
                    <p className="text-[10px] font-medium text-cream/50 uppercase tracking-wider mb-2">Exercise</p>
                    {JSON.stringify(exerciseResult, null, 2)}
                  </div>
                ) : null}

                {spellingResult ? (
                  <div className="mt-4 rounded-2xl border border-cream/10 bg-black/10 p-4 text-cream/80 text-sm whitespace-pre-wrap">
                    <p className="text-[10px] font-medium text-cream/50 uppercase tracking-wider mb-2">Spelling tasks</p>
                    {JSON.stringify(spellingResult, null, 2)}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border border-cream/5 bg-cream/[0.03] rounded-[2rem] p-8 flex flex-col gap-5 items-start transition-all duration-300 hover:-translate-y-2 hover:bg-cream/[0.06] group md:col-span-2">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-clay/10 flex items-center justify-center group-hover:scale-105 transition-transform border border-clay/20">
                <span className="iconify text-2xl text-clay" data-icon="solar:brain-linear" data-inline="false" />
              </div>
              <div>
                <h3 className="font-medium text-2xl tracking-tight text-cream mb-2">Comprehension Lab</h3>
                <p className="text-sm text-cream/50 leading-relaxed">
                  Engaging mini-quizzes and interactive exercises to verify deep understanding after every chapter.
                </p>
              </div>

              <div className="w-full">
                <button
                  type="button"
                  disabled={comprehensionAsync.loading || !text.trim()}
                  onClick={async () => {
                    try {
                      const res = await comprehensionAsync.run(text.trim(), 3);
                      setComprehensionResult(res);
                    } catch {
                      setComprehensionResult(null);
                    }
                  }}
                  className="px-5 py-2.5 rounded-full bg-moss text-cream text-xs font-medium uppercase tracking-wide disabled:opacity-60"
                >
                  {comprehensionAsync.loading ? 'Loading…' : 'Generate questions'}
                </button>

                {comprehensionAsync.error ? (
                  <p className="mt-3 text-xs text-red-300">{comprehensionAsync.error.message}</p>
                ) : null}

                {comprehensionResult?.questions?.length ? (
                  <div className="mt-4 rounded-2xl border border-cream/10 bg-black/10 p-4 text-cream/80 text-sm">
                    <p className="text-[10px] font-medium text-cream/50 uppercase tracking-wider mb-2">Questions</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {comprehensionResult.questions.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {anyLoading ? (
            <p className="mt-8 text-center text-xs text-cream/40">Loading learning tools…</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

