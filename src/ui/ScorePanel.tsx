import { useGameStore } from './gameStore';

export function ScorePanel() {
  const score = useGameStore((s) => s.score);
  const target = useGameStore((s) => s.target);
  const movesLeft = useGameStore((s) => s.movesLeft);

  const pct = Math.min(100, (score / target) * 100);

  return (
    <header className="score-panel" aria-live="polite">
      <div className="score-panel__moves" role="img" aria-label="Осталось ходов">
        <span className="score-panel__moves-value">{movesLeft}</span>
      </div>
      <div className="score-panel__score">
        <div className="score-panel__label">ОЧКИ</div>
        <div className="score-panel__value">
          <span>{score}</span>
          <span className="score-panel__target">/{target}</span>
        </div>
        <div className="score-panel__bar" aria-hidden="true">
          <div className="score-panel__bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </header>
  );
}
