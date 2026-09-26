export default function ReadingModes({ mode, onChange }) {
  const modes = [
    { id: 'guided', label: 'Guided' },
    { id: 'focus', label: 'Focus' },
    { id: 'chunk', label: 'Chunk' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <p className="text-xs font-medium text-charcoal/40 mr-2">Reading mode</p>
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
            mode === m.id
              ? 'bg-moss text-cream border-moss'
              : 'bg-white text-charcoal/60 border-moss/15 hover:bg-moss/8'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

