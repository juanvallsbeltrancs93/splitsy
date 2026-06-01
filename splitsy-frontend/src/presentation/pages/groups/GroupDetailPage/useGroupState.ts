import { useState, useCallback } from 'react';
import { useLoaderData } from 'react-router-dom';
import type { Group } from '@/domain/group/entities/Group';
import type { UserBalance } from '@/domain/group/entities/UserBalance';
import { getCompositionRoot } from '@/CompositionRoot';
import type { GroupDetailLoaderData } from './types';

export function useGroupState() {
  const { group: loaderGroup, settlements, balances: initialBalances } = useLoaderData() as GroupDetailLoaderData;

  const [groupState, setGroupState] = useState<Group>(loaderGroup);
  const [activeTab, setActiveTab] = useState(0);
  const [balances, setBalances] = useState<UserBalance[]>(initialBalances);
  const [settlementsState, setSettlementsState] = useState<Settlement[]>(settlements);

  const refreshBalances = useCallback(async () => {
    try {
      const result = await getCompositionRoot().useCases.groups.getBalances.execute({ groupId: groupState.id });
      setBalances(result);
    } catch (err) {
      console.error('[useGroupState] Failed to refresh balances:', err);
    }
  }, [groupState.id]);

  const refreshSettlements = useCallback(async () => {
    try {
      const result = await getCompositionRoot().useCases.settlements.list.execute({ groupId: groupState.id });
      setSettlementsState(result);
    } catch (err) {
      console.error('[useGroupState] Failed to refresh settlements:', err);
    }
  }, [groupState.id]);

  const handleGroupUpdated = useCallback((updatedGroup: Group) => {
    setGroupState(updatedGroup);
  }, []);

  return {
    group: groupState,
    balances,
    settlements: settlementsState,
    activeTab,
    setActiveTab,
    refreshBalances,
    refreshSettlements,
    handleGroupUpdated,
  };
}
