// hooks/useHighlighterActionsAndModals.ts
import type { Action } from '@/models/action';
import type { RoleName } from '@/models/role';
import type { rolesList } from '@/models/rolesList';
import { useMemo, useState } from 'react';

type Player = { id: string; name: string };

type PairState = {
  player1: Player | null;
  player2: Player | null;
  highlightedRole: RoleName | null;
};

type RevealState = {
  selectedPlayer: Player | null;
  highlightedRole: RoleName | null;
};

const defaultPair: PairState = { player1: null, player2: null, highlightedRole: null };
const defaultReveal: RevealState = { selectedPlayer: null, highlightedRole: null };

// Which roles open which modal
const NUMBER_MODAL_ROLES: RoleName[] = ['Chef', 'Empath'] as any;
const PAIR_MODAL_ROLES: RoleName[] = ['Librarian', 'Investigator', 'Washerwoman'] as any;
const RAVEN_MODAL_ROLES: RoleName[] = ['Ravenkeeper'] as any;
const FT_MODAL_ROLES: RoleName[] = ['FortuneTeller'] as any;
const UNDERTAKER_MODAL_ROLES: RoleName[] = ['Undertaker'] as any;

export function useHighlighterActionsAndModals(args: {
  players: Player[];
  selectedRole: RoleName | null;

  // ✅ now required for ID-first actions
  focusedPlayerId: string | undefined;

  excludedPlayerId?: string;
  highlightedPlayers: Player[];
  roleByName: Map<RoleName, (typeof rolesList)[number]>;
  onAction: (a: Action) => void;
}) {
  const {
    players,
    selectedRole,
    focusedPlayerId,
    excludedPlayerId,
    highlightedPlayers,
    roleByName,
    onAction,
  } = args;

  // modal open flags
  const [pairModalOpen, setPairModalOpen] = useState(false);
  const [numberModalOpen, setNumberModalOpen] = useState(false);
  const [ravenOpen, setRavenOpen] = useState(false);
  const [ftOpen, setFtOpen] = useState(false);
  const [undertakerOpen, setUndertakerOpen] = useState(false);

  // value state
  const [selectedNumber, setSelectedNumber] = useState<0 | 1 | 2 | null>(null);
  const [ftResultByRole, setFtResultByRole] = useState<Record<string, boolean | null>>({});

  // per-role persisted modal state (store whole players)
  const [pairStateByRole, setPairStateByRole] = useState<Record<string, PairState>>({});
  const [ravenByRole, setRavenByRole] = useState<Record<string, RevealState>>({});
  const [undertakerByRole, setUndertakerByRole] = useState<Record<string, RevealState>>({});

  // lookup: id -> player
  const playerById = useMemo(() => {
    const m = new Map<string, Player>();
    for (const p of players) m.set(p.id, p);
    return m;
  }, [players]);

  const getName = useMemo(() => {
    return (id: string) => playerById.get(id)?.name ?? 'Unknown';
  }, [playerById]);

  const currentPairState: PairState = useMemo(() => {
    if (!selectedRole) return defaultPair;
    return pairStateByRole[selectedRole] ?? defaultPair;
  }, [pairStateByRole, selectedRole]);

  const ravenState: RevealState = useMemo(() => {
    if (!selectedRole) return defaultReveal;
    return ravenByRole[selectedRole] ?? defaultReveal;
  }, [ravenByRole, selectedRole]);

  const undertakerState: RevealState = useMemo(() => {
    if (!selectedRole) return defaultReveal;
    return undertakerByRole[selectedRole] ?? defaultReveal;
  }, [undertakerByRole, selectedRole]);

  const ftResult = useMemo(() => {
    if (!selectedRole) return null;
    return ftResultByRole[selectedRole] ?? null;
  }, [ftResultByRole, selectedRole]);

  const updatePairStateForCurrentRole = (patch: Partial<PairState>) => {
    if (!selectedRole) return;
    setPairStateByRole((prev) => ({
      ...prev,
      [selectedRole]: {
        ...(prev[selectedRole] ?? defaultPair),
        ...patch,
      },
    }));
  };

  const updateRaven = (patch: Partial<RevealState>) => {
    if (!selectedRole) return;
    setRavenByRole((prev) => ({
      ...prev,
      [selectedRole]: { ...(prev[selectedRole] ?? defaultReveal), ...patch },
    }));
  };

  const updateUndertaker = (patch: Partial<RevealState>) => {
    if (!selectedRole) return;
    setUndertakerByRole((prev) => ({
      ...prev,
      [selectedRole]: { ...(prev[selectedRole] ?? defaultReveal), ...patch },
    }));
  };

  const updateFT = (v: boolean) => {
    if (!selectedRole) return;
    setFtResultByRole((prev) => ({ ...prev, [selectedRole]: v }));
  };

  const emitRoleAction = (opts?: {
    recipients?: Player[];
    result?: boolean;
    isDrunk?: boolean;
    roleToken?: RoleName;
    number?: number;
  }) => {
    if (!selectedRole) return;

    const roleObj = roleByName.get(selectedRole);
    if (!roleObj?.doAction) return;

    if (!focusedPlayerId) return;

    const recipients = (opts?.recipients ?? []).filter(Boolean);
    const recipientIds = Array.from(new Set(recipients.map((p) => p.id)));

    const action = roleObj.doAction({
      actorId: focusedPlayerId,
      recipientIds: recipientIds.length ? recipientIds : undefined,
      getName,
      result: opts?.result,
      isDrunk: opts?.isDrunk ?? false,
      roleToken: opts?.roleToken,
      number: opts?.number,
    });

    onAction(action);
  };

  const onCenterPressHighlight = () => {
    if (!selectedRole) return;

    if (PAIR_MODAL_ROLES.includes(selectedRole)) {
      setPairModalOpen(true);
      return;
    }

    if (NUMBER_MODAL_ROLES.includes(selectedRole)) {
      setNumberModalOpen(true);
      return;
    }

    if (RAVEN_MODAL_ROLES.includes(selectedRole)) {
      setRavenOpen(true);
      return;
    }

    if (FT_MODAL_ROLES.includes(selectedRole)) {
      setFtOpen(true);
      return;
    }

    if (UNDERTAKER_MODAL_ROLES.includes(selectedRole)) {
      setUndertakerOpen(true);
      return;
    }

    // default: roles with no special modal -> use highlighted players
    emitRoleAction({ recipients: highlightedPlayers });
  };

  return {
    onCenterPressHighlight,

    // props to feed into HighlighterModals
    modals: {
      number: {
        visible: numberModalOpen,
        value: selectedNumber,
        onChange: setSelectedNumber,
        onClose: () => {
          emitRoleAction({ number: selectedNumber ?? undefined });
          setNumberModalOpen(false);
        },
      },

      pair: {
        visible: pairModalOpen,
        onClose: () => {
          emitRoleAction({
            recipients: [currentPairState.player1, currentPairState.player2].filter(Boolean) as Player[],
            roleToken: currentPairState.highlightedRole ?? undefined,
          });
          setPairModalOpen(false);
        },
        players,
        excludedPlayerId,
        player1Id: currentPairState.player1?.id ?? null,
        player2Id: currentPairState.player2?.id ?? null,
        highlightedRole: currentPairState.highlightedRole,
        onChangePlayer1: (id: string | null) => {
          const next = id ? playerById.get(id) ?? null : null;
          updatePairStateForCurrentRole({ player1: next });
        },
        onChangePlayer2: (id: string | null) => {
          const next = id ? playerById.get(id) ?? null : null;
          updatePairStateForCurrentRole({ player2: next });
        },
        onChangeHighlightedRole: (role: RoleName | null) =>
          updatePairStateForCurrentRole({ highlightedRole: role }),
      },

      raven: {
        visible: ravenOpen,
        onClose: () => {
          emitRoleAction({
            recipients: ravenState.selectedPlayer ? [ravenState.selectedPlayer] : [],
            roleToken: ravenState.highlightedRole ?? undefined,
          });
          setRavenOpen(false);
        },
        players,
        excludedPlayerId,
        selectedPlayerId: ravenState.selectedPlayer?.id ?? null,
        highlightedRole: ravenState.highlightedRole,
        onChangePlayer: (id: string | null) => {
          const next = id ? playerById.get(id) ?? null : null;
          updateRaven({ selectedPlayer: next });
        },
        onChangeHighlightedRole: (role: RoleName | null) =>
          updateRaven({ highlightedRole: role }),
      },

      fortuneTeller: {
        visible: ftOpen,
        value: selectedRole ? (ftResultByRole[selectedRole] ?? null) : null,
        onChange: updateFT,
        onClose: () => {
          emitRoleAction({
            recipients: highlightedPlayers.slice(0, 2),
            result: ftResult ?? undefined,
          });
          setFtOpen(false);
        },
      },

      undertaker: {
        visible: undertakerOpen,
        onClose: () => {
          emitRoleAction({
            recipients: undertakerState.selectedPlayer ? [undertakerState.selectedPlayer] : [],
            roleToken: undertakerState.highlightedRole ?? undefined,
          });
          setUndertakerOpen(false);
        },
        players,
        excludedPlayerId,
        selectedPlayerId: undertakerState.selectedPlayer?.id ?? null,
        highlightedRole: undertakerState.highlightedRole,
        onChangePlayer: (id: string | null) => {
          const next = id ? playerById.get(id) ?? null : null;
          updateUndertaker({ selectedPlayer: next });
        },
        onChangeHighlightedRole: (role: RoleName | null) =>
          updateUndertaker({ highlightedRole: role }),
      },
    },
  };
}
