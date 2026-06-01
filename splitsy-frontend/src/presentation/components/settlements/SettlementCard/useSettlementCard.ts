import type { SettlementCardProps, UseSettlementCardReturn } from './types';

export function useSettlementCard({
  settlement,
  participants,
}: SettlementCardProps): UseSettlementCardReturn {
  const from = participants.find((p) => p.id === settlement.fromParticipantId.value);
  const to = participants.find((p) => p.id === settlement.toParticipantId.value);
  const fromName = from?.displayName ?? 'Unknown';
  const toName = to?.displayName ?? 'Unknown';
  const formattedDate = new Date(settlement.date).toLocaleDateString();

  return { fromName, toName, formattedDate };
}
