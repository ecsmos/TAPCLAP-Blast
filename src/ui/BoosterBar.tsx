import type { BoosterId } from '../game/types';
import { useGame } from './GameContext';
import { useGameStore } from './gameStore';

interface BoosterDef {
  id: BoosterId;
  label: string;
  icon: string;
  hint: string;
}

const BOOSTERS: readonly BoosterDef[] = [
  { id: 'shuffle', label: 'Перемешать', icon: '⇄', hint: 'Перемешивает все тайлы' },
  { id: 'bomb', label: 'Бомба', icon: '💣', hint: 'Взрывает тайлы в радиусе' },
  { id: 'teleport', label: 'Телепорт', icon: '⇆', hint: 'Меняет местами два тайла' },
];

export function BoosterBar() {
  const gameRef = useGame();
  const boosters = useGameStore((s) => s.boosters);
  const armed = useGameStore((s) => s.armedBooster);
  const phase = useGameStore((s) => s.phase);

  const disabled = phase !== 'idle';

  return (
    <section className="booster-bar" aria-label="Бустеры">
      <div className="booster-bar__title">БУСТЕРЫ</div>
      <div className="booster-bar__row">
        {BOOSTERS.map((b) => {
          const count = boosters[b.id];
          const active = armed === b.id;
          const isDisabled = disabled || count <= 0;
          return (
            <button
              key={b.id}
              type="button"
              className={`booster${active ? ' booster--active' : ''}`}
              disabled={isDisabled}
              aria-pressed={active}
              aria-label={`${b.label}. Осталось ${count}`}
              title={b.hint}
              onClick={() => gameRef.current?.pushIntent({ type: 'booster', id: b.id })}
            >
              <span className="booster__icon" aria-hidden="true">
                {b.icon}
              </span>
              <span className="booster__count">{count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
