/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Anchor } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-3 justify-center mb-12">
      <div className="relative">
        <Anchor className="w-8 h-8 text-pirate-gold" />
        <div className="absolute inset-0 blur-md bg-pirate-gold/40 animate-pulse"></div>
      </div>
      <h1 className="font-serif text-3xl tracking-wide flex items-baseline gap-1">
        <span className="text-white font-medium uppercase">Pirate</span>
        <span className="text-pirate-gold">.</span>
        <span className="text-pirate-gold font-mono text-2xl uppercase tracking-tighter">Cyber</span>
      </h1>
    </div>
  );
}
