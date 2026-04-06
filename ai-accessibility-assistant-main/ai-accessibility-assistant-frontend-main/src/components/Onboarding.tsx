import React, { useState, useEffect } from 'react';
import { useAccessibilityStore } from '../stores/accessibilityStore';

const SAMPLE_TEXT =
  "The big brown dog played in the garden. He found a beautiful red ball near the bed. Then he ran and jumped over the pond.";

const DIFFICULTIES = ['Reading words aloud', 'Spelling', 'Understanding long texts', 'All of these'];

const OVERLAY_OPTIONS = [
  { label: 'None', value: 'none', bg: 'transparent', border: true },
  { label: 'Cream', value: 'cream', bg: '#FFF8E7' },
  { label: 'Yellow', value: 'yellow', bg: '#FFFACD' },
  { label: 'Blue', value: 'blue', bg: '#E8F4FD' },
  { label: 'Pink', value: 'pink', bg: '#FCE4EC' },
];

const PHONEME_COLORS: Record<string, string | null> = {
  b: '#4A90D9', d: '#E8734A', p: '#9B59B6', q: '#27AE60',
};

function ColorizedText({ text, coloredLetters }: { text: string; coloredLetters: boolean }) {
  if (!coloredLetters) return <>{text}</>;
  return (
    <>
      {text.split('').map((char, i) => {
        const color = PHONEME_COLORS[char.toLowerCase()] ?? null;
        return color
          ? <span key={i} style={{ color, fontWeight: 700 }}>{char}</span>
          : <span key={i}>{char}</span>;
      })}
    </>
  );
}

interface OnboardingProps {
  onComplete: (userAge: number) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState(10);
  const [isParentTeacher, setIsParentTeacher] = useState(false);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const store = useAccessibilityStore();

  // Don't apply font to body during onboarding — just preview
  const previewStyle: React.CSSProperties = {
    fontFamily: store.font === 'opendyslexic'
      ? 'OpenDyslexic, sans-serif'
      : store.font === 'arial'
      ? 'Arial, sans-serif'
      : 'inherit',
    fontSize: store.fontSize,
    lineHeight: store.lineHeight,
    letterSpacing: `${store.letterSpacing}em`,
  };

  function toggleDifficulty(d: string) {
    setDifficulties(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  }

  function getRecommendedMode(): { mode: string; label: string; reason: string } {
    const wantsReview = difficulties.includes('All of these');
    const wantsReading = difficulties.includes('Reading words aloud') || difficulties.includes('Spelling');
    const wantsUnderstanding = difficulties.includes('Understanding long texts');

    if (age >= 5 && age <= 12 && wantsReading) {
      return {
        mode: 'learning',
        label: 'Learning Mode',
        reason: 'Introduces new skills with guided exercises and real-time feedback.',
      };
    }
    if (age >= 13 && wantsUnderstanding) {
      return {
        mode: 'assistive',
        label: 'Assistive Mode',
        reason: 'Simplifies complex text and reads it aloud with word-by-word highlighting.',
      };
    }
    if (wantsReview) {
      return {
        mode: 'practice',
        label: 'Practice Mode',
        reason: 'Reviews skills that need reinforcement based on your schedule.',
      };
    }
    return {
      mode: 'learning',
      label: 'Learning Mode',
      reason: 'A great starting point for building core reading skills.',
    };
  }

  function handleComplete() {
    localStorage.setItem('neuroread-onboarding-done', 'true');
    localStorage.setItem('neuroread-user-age', String(isParentTeacher ? 30 : age));
    onComplete(isParentTeacher ? 30 : age);
  }

  const recommended = getRecommendedMode();

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 28, padding: 40, maxWidth: 600, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>
        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              height: 4, flex: 1, borderRadius: 4,
              background: n <= step ? '#2d6a4f' : '#e0e0e0',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        {/* ── STEP 1: Age & Difficulty ─────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, color: '#2E4036' }}>
              Let's set up your reading preferences
            </h2>
            <p style={{ color: '#666', marginBottom: 32 }}>
              This takes about 2 minutes and helps us personalise your experience.
            </p>

            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#2E4036' }}>
              How old are you? {!isParentTeacher && <span style={{ color: '#2d6a4f' }}>{age}</span>}
            </label>
            {!isParentTeacher && (
              <input
                type="range" min={5} max={80} value={age}
                onChange={e => setAge(Number(e.target.value))}
                style={{ width: '100%', marginBottom: 12, accentColor: '#2d6a4f' }}
              />
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isParentTeacher}
                onChange={e => setIsParentTeacher(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#2d6a4f' }}
              />
              <span style={{ color: '#666', fontSize: 14 }}>I'm a parent or teacher</span>
            </label>

            <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, color: '#2E4036' }}>
              What's hardest for you? <span style={{ fontWeight: 400, color: '#999' }}>(select all that apply)</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDifficulty(d)}
                  style={{
                    padding: '12px 16px', borderRadius: 12, textAlign: 'left',
                    border: difficulties.includes(d) ? '2px solid #2d6a4f' : '2px solid #e0e0e0',
                    background: difficulties.includes(d) ? 'rgba(45,106,79,0.06)' : '#fff',
                    cursor: 'pointer', fontWeight: difficulties.includes(d) ? 600 : 400,
                    color: difficulties.includes(d) ? '#2d6a4f' : '#444',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {difficulties.includes(d) ? '✓ ' : ''}{d}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                background: '#2d6a4f', color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── STEP 2: Reading Preferences ──────────────────────────────── */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, color: '#2E4036' }}>
              Let's make the text comfortable
            </h2>
            <p style={{ color: '#666', marginBottom: 24 }}>
              Adjust the settings below and see the preview update live.
            </p>

            {/* Font selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 8, fontWeight: 600 }}>Font</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'opendyslexic', label: 'OpenDyslexic' },
                  { value: 'arial', label: 'Arial' },
                  { value: 'system', label: 'System' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => store.setFont(f.value as any)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8,
                      border: 'none',
                      background: store.font === f.value ? '#2d6a4f' : '#f0f0f0',
                      color: store.font === f.value ? '#fff' : '#333',
                      cursor: 'pointer', fontSize: 13, fontWeight: 500,
                      fontFamily: f.value === 'opendyslexic' ? 'OpenDyslexic, sans-serif' : f.value === 'arial' ? 'Arial' : 'inherit',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                Font size — {store.fontSize}px
              </label>
              <input type="range" min={14} max={24} step={1} value={store.fontSize}
                onChange={e => store.setFontSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2d6a4f' }} />
            </div>

            {/* Line height */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                Line height — {store.lineHeight.toFixed(1)}
              </label>
              <input type="range" min={1.5} max={2.5} step={0.1} value={store.lineHeight}
                onChange={e => store.setLineHeight(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2d6a4f' }} />
            </div>

            {/* Color overlay */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Color overlay
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {OVERLAY_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => store.setColorOverlay(o.value as any)}
                    title={o.label}
                    style={{
                      width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
                      background: o.bg,
                      border: store.colorOverlay === o.value ? '2.5px solid #2d6a4f' : '1.5px solid #ddd',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Live preview */}
            <div style={{
              padding: 20, borderRadius: 16, marginBottom: 24,
              background: (() => {
                const bgMap: Record<string, string> = {
                  cream: '#FFF8E7', yellow: '#FFFACD', blue: '#E8F4FD', pink: '#FCE4EC', none: '#f9f9f9',
                };
                return bgMap[store.colorOverlay] ?? '#f9f9f9';
              })(),
              border: '1px solid rgba(0,0,0,0.07)',
            }}>
              <p style={{ ...previewStyle, margin: 0, maxWidth: 65, color: '#2E4036', textAlign: 'left' } as any}>
                <ColorizedText text={SAMPLE_TEXT} coloredLetters={true} />
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1, padding: 14, borderRadius: 14, border: '2px solid #e0e0e0',
                  background: '#fff', color: '#666', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                style={{
                  flex: 2, padding: 14, borderRadius: 14, border: 'none',
                  background: '#2d6a4f', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Mode Recommendation ──────────────────────────────── */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, color: '#2E4036' }}>
              You're ready!
            </h2>
            <p style={{ color: '#666', marginBottom: 24 }}>
              Based on your answers, we recommend starting with:
            </p>

            <div style={{
              padding: 24, borderRadius: 16, marginBottom: 28,
              background: 'rgba(45,106,79,0.06)', border: '2px solid #2d6a4f',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>
                {recommended.mode === 'learning' ? '📖' : recommended.mode === 'assistive' ? '🔍' : '🔁'}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#2d6a4f' }}>
                {recommended.label}
              </h3>
              <p style={{ margin: 0, color: '#555', lineHeight: 1.6 }}>
                {recommended.reason}
              </p>
            </div>

            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
              You can switch between modes anytime from the navigation bar.
            </p>

            <button
              onClick={handleComplete}
              style={{
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #2d6a4f, #4CAF50)',
                color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(45,106,79,0.3)',
                letterSpacing: '0.02em',
              }}
            >
              Let's go →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
