
import React, { useState } from 'react';
import { Token, TokenType } from '../types';
import TokenImage from './TokenImage';

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token;
  balances: Record<string, string>;
  onSelect: (token: Token) => void;
  onAddCustom: (token: Token) => void;
  isOpen: boolean;
  onClose: () => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ 
  tokens, selectedToken, balances, onSelect, isOpen, onClose 
}) => {
  const [activeTab, setActiveTab] = useState<TokenType>(TokenType.ERC20);
  if (!isOpen) return null;

  const filteredTokens = tokens.filter(t => t.type === activeTab);

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
          <h3 className="font-bold text-xl text-white">Inventory</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex p-2 bg-slate-800/50 border-b border-slate-800/50">
          <button 
            onClick={() => setActiveTab(TokenType.ERC20)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === TokenType.ERC20 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Tokens
          </button>
          <button 
            onClick={() => setActiveTab(TokenType.ERC721)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === TokenType.ERC721 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Collections
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => { onSelect(token); onClose(); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedToken.symbol === token.symbol ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg' : 'hover:bg-slate-800 border-transparent'}`}
            >
              <div className="flex items-center gap-4">
                <TokenImage token={token} className="w-12 h-12 rounded-full shadow-lg" />
                <div className="text-left">
                  <div className="font-bold text-white text-base flex items-center gap-2">{token.symbol}</div>
                  <div className="text-xs text-slate-500 font-medium">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-white text-sm font-semibold">{balances[token.symbol] || '0'}</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Ownership</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TokenSelector;
