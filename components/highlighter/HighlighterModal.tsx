// components/highlighter/HighlighterModals.tsx
import FortuneTellerCheckModal from '@/components/modals/FortuneTellerCheckModal';
import NumberSelectModal from '@/components/modals/NumberSelectModal';
import PairAndRoleModal from '@/components/modals/PairAndRoleModal';
import RavenkeeperModal from '@/components/modals/RavenkeeperModal';
import UndertakerModal from '@/components/modals/UndertakerModal';
import React from 'react';

type Props = {
  number: React.ComponentProps<typeof NumberSelectModal>;
  pair: React.ComponentProps<typeof PairAndRoleModal>;
  raven: React.ComponentProps<typeof RavenkeeperModal>;
  fortuneTeller: React.ComponentProps<typeof FortuneTellerCheckModal>;
  undertaker: React.ComponentProps<typeof UndertakerModal>;
};

export default function HighlighterModals(props: Props) {
  const { number, pair, raven, fortuneTeller, undertaker } = props;

  return (
    <>
      <NumberSelectModal {...number} />
      <PairAndRoleModal {...pair} />
      <RavenkeeperModal {...raven} />
      <FortuneTellerCheckModal {...fortuneTeller} />
      <UndertakerModal {...undertaker} />
    </>
  );
}
