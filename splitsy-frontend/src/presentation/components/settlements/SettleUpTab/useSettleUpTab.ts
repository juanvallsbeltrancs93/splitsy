import { useState, useMemo, useCallback } from 'react';
import { CURRENCIES } from '../../../data/currencies';
import { calculateSettlementPlan } from '../../../utils/calculateSettlementPlan';
import type { SettleUpTabProps, UseSettleUpTabReturn } from './types';
import type { SettlementPlanItem } from '../../../utils/calculateSettlementPlan';

export function useSettleUpTab({
  balances,
  participants,
  currencyCode,
  onSettlementCreated,
}: SettleUpTabProps): UseSettleUpTabReturn {
  const plan = useMemo(() => calculateSettlementPlan(balances), [balances]);

  const isAllSettled = plan.length === 0;

  const getParticipantName = useCallback(
    (id: string) =>
      participants.find((p) => p.id === id)?.displayName ?? 'Unknown',
    [participants]
  );

  const currencySymbol =
    CURRENCIES.find((c) => c.code === currencyCode)?.symbol ?? currencyCode;

  const [selectedPlanItem, setSelectedPlanItem] =
    useState<SettlementPlanItem | null>(null);

  const isDialogOpen = selectedPlanItem !== null;

  const onRecordClick = useCallback((item: SettlementPlanItem) => {
    setSelectedPlanItem(item);
  }, []);

  const onCloseDialog = useCallback(() => {
    setSelectedPlanItem(null);
  }, []);

  const handleSettlementCreated = useCallback(() => {
    setSelectedPlanItem(null);
    onSettlementCreated();
  }, [onSettlementCreated]);

  return {
    plan,
    isAllSettled,
    getParticipantName,
    currencySymbol,
    selectedPlanItem,
    isDialogOpen,
    onRecordClick,
    onCloseDialog,
    onSettlementCreated: handleSettlementCreated,
  };
}
