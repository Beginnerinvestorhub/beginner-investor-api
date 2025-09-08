import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface Props {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export default function GlossaryTooltip({ term, definition, children }: Props) {
  return (
    <Tooltip.Provider delayDuration={100} skipDelayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            className="max-w-xs rounded bg-gray-900 text-gray-100 px-3 py-2 text-sm shadow-lg z-50"
          >
            <strong className="block text-indigo-300 mb-1">{term}</strong>
            {definition}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
