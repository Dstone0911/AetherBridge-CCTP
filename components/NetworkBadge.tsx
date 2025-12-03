import React from 'react';
import { Network, NetworkType } from '../types';

interface NetworkBadgeProps {
  network: Network;
  label?: string;
}

const NetworkBadge: React.FC<NetworkBadgeProps> = ({ network, label }) => {
  const isTestnet = network.type === NetworkType.TESTNET;

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</span>}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        isTestnet 
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isTestnet ? 'bg-amber-500' : 'bg-indigo-500'} animate-pulse`} />
        <span className="font-semibold text-sm">{network.name}</span>
      </div>
    </div>
  );
};

export default NetworkBadge;