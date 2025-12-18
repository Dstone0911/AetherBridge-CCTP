import React from 'react';
import { Network, NetworkType } from '../types';

interface NetworkSelectorProps {
  networks: Network[];
  selectedNetwork: Network;
  onSelect: (network: Network) => void;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onEditRpc: (network: Network) => void;
  networkHealth: Record<string, boolean | null>;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ 
  networks, 
  selectedNetwork, 
  onSelect, 
  isOpen, 
  onClose,
  title,
  onEditRpc,
  networkHealth
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {networks.map((network) => {
            const health = networkHealth[network.id];
            return (
              <div key={network.id} className="relative group mb-2">
                <button
                  onClick={() => {
                    onSelect(network);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border ${
                    selectedNetwork.id === network.id 
                    ? 'bg-indigo-600/20 border-indigo-500/50' 
                    : 'hover:bg-slate-800 border-transparent hover:border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                        network.type === NetworkType.MAINNET ? 'bg-indigo-500/20 text-indigo-400' : 
                        network.type === NetworkType.TESTNET ? 'bg-amber-500/20 text-amber-500' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {network.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        health === null ? 'bg-slate-600 animate-pulse' :
                        health ? 'bg-emerald-500 shadow-glow shadow-emerald-500/50' :
                        'bg-red-500 shadow-glow shadow-red-500/50'
                      }`} title={health === null ? 'Checking RPC...' : health ? 'RPC Healthy' : 'RPC Unreachable'} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">{network.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {network.rpcUrls.length} RPC{network.rpcUrls.length !== 1 ? 's' : ''} configured
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {network.isCustom && (
                      <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-500 font-bold uppercase">
                        Custom
                      </div>
                    )}
                  </div>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditRpc(network);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 bg-slate-700 hover:bg-indigo-600 text-white rounded-lg transition-all shadow-lg"
                  title="Configure RPCs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.797.939a4.109 4.109 0 01.594.306c.402.245.888.243 1.288-.007l.79-.504a1.125 1.125 0 011.517.186l.773.773a1.125 1.125 0 01.186 1.517l-.504.79c-.25.4-.252.886-.007 1.288.106.173.208.354.306.539.175.413.515.727.939.797l.894.149c.542.09.94.56.94 1.11v1.093c0 .55-.398 1.02-.94 1.11l-.894.149c-.424.07-.764.384-.939.797a4.109 4.109 0 01-.306.594c-.245.402-.243.888.007 1.288l.504.79a1.125 1.125 0 01-.186 1.517l-.773.773a1.125 1.125 0 01-1.517-.186l-.79-.504a1.125 1.125 0 00-1.288.007 4.108 4.108 0 01-.594.306c-.413.175-.727.515-.797.939l-.149.894c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.797-.939a4.109 4.109 0 01-.594-.306c-.402-.245-.888-.243-1.288.007l-.79.504a1.125 1.125 0 01-1.517-.186l-.773-.773a1.125 1.125 0 01-.186-1.517l.504-.79a1.125 1.125 0 00-.007-1.288 4.108 4.108 0 01-.306-.594c-.175-.413-.515-.727-.939-.797l-.894-.149a1.125 1.125 0 01-.94-1.11v-1.093c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.384.939-.797.098-.185.2-.366.306-.539.245-.402.243-.888-.007-1.288l-.504-.79a1.125 1.125 0 01.186-1.517l.773-.773a1.125 1.125 0 011.517.186l.79.504c.4.25.886.252 1.288.007.185-.106.366-.208.539-.306.413-.175.727-.515.797-.939l.149-.894z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 bg-slate-900/50 border-t border-slate-800">
           <p className="text-xs text-slate-500 text-center">
             Manage fallback RPC endpoints to ensure high availability across testnets and mainnets.
           </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkSelector;