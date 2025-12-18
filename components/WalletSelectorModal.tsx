
import React from 'react';
import { EIP6963ProviderDetail } from '../types';

interface WalletSelectorModalProps {
  providers: EIP6963ProviderDetail[];
  onSelect: (provider: EIP6963ProviderDetail) => void;
  onClose: () => void;
  isOpen: boolean;
}

const WalletSelectorModal: React.FC<WalletSelectorModalProps> = ({ providers, onSelect, onClose, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden relative p-8">
        <h3 className="text-2xl font-black text-white mb-6 text-center tracking-tight">Select Wallet</h3>
        
        <div className="space-y-3">
          {providers.length > 0 ? (
            providers.map((p) => (
              <button
                key={p.info.uuid}
                onClick={() => onSelect(p)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all group"
              >
                {p.info.icon ? (
                  <img src={p.info.icon} alt={p.info.name} className="w-8 h-8 rounded-lg" />
                ) : (
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center font-bold text-indigo-400">
                    {p.info.name[0]}
                  </div>
                )}
                <span className="font-bold text-slate-200 group-hover:text-white">{p.info.name}</span>
              </button>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm font-medium mb-4">No wallet extensions detected.</p>
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-indigo-400 font-bold hover:underline"
              >
                Install MetaMask
              </a>
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-4 text-slate-500 hover:text-slate-300 font-bold text-xs uppercase tracking-widest transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WalletSelectorModal;
