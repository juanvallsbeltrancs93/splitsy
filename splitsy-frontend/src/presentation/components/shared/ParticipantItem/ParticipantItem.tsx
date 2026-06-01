import './styles.css';
import type { ParticipantItemProps } from './types';

export function ParticipantItem({
  name,
  firstLetter,
  amount,
  prefix,
  currencySymbol,
  isYou,
  isDisabled,
  variant = 'default',
}: ParticipantItemProps) {
  const disabledClass = isDisabled ? ' participant-item--disabled' : '';
  return (
    <div className={`participant-item participant-item--${variant}${disabledClass}`}>
      <div className="participant-item__avatar">{firstLetter}</div>
      <div className="participant-item__info">
        <span className="participant-item__name">{name}</span>
        {isYou && <span className="participant-item__you">you</span>}
      </div>
      {amount !== undefined && (
        <span className="participant-item__amount">
          {prefix}{currencySymbol}{amount}
        </span>
      )}
    </div>
  );
}
