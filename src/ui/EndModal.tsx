import { useGame } from '@/ui/GameContext';
import { useGameStore } from '@/ui/gameStore';

export const EndModal = () => {
  const gameRef = useGame();
  const phase = useGameStore((s) => s.phase);
  const score = useGameStore((s) => s.score);
  const target = useGameStore((s) => s.target);

  if (phase !== 'win' && phase !== 'lose') return null;

  const isWin = phase === 'win';

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="end-title">
      <div className={`modal modal--${isWin ? 'win' : 'lose'}`}>
        <h2 id="end-title" className="modal__title">
          {isWin ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ'}
        </h2>
        <p className="modal__text">
          {isWin ? `Вы набрали ${score} очков!` : `Цель: ${target} очков. Вы набрали ${score}.`}
        </p>
        <button
          type="button"
          className="modal__button"
          onClick={() => gameRef.current?.pushIntent({ type: 'restart' })}
        >
          Играть снова
        </button>
      </div>
    </div>
  );
};
