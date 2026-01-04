interface SceneControlsProps {
  onResetCamera: () => void;
}

export default function SceneControls({ onResetCamera }: SceneControlsProps) {
  return (
    <div className="absolute top-4 left-4 bg-black/50 text-white p-2 text-xs font-mono rounded">
      <div className="font-bold mb-1">Sterowanie</div>
      <div>Klawisze W/S: Ruch przód/tył</div>
      <div>Klawisze A/D: Ruch lewo/prawo</div>
      <div>Prawy przycisk myszy + klawisze A/D: Obróć kamerę</div>
      <div>Klawisz Shift: Sprint (2x prędkość)</div>
      <div>Lewy przycisk myszy + przeciągnij: Obróć widok</div>
      <div>Kółko myszy: Przybliż/oddal</div>
      <button
        onClick={onResetCamera}
        className="mt-2 w-full px-2 py-1 bg-black/70 hover:bg-black/85 cursor-pointer text-white text-xs rounded transition-colors"
      >
        Resetuj Kamerę
      </button>
    </div>
  );
}
