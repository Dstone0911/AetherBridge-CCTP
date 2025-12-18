
import React from 'react';
import { Token, TokenType } from '../types';

interface TokenImageProps {
  token: Token;
  className?: string;
}

const TokenImage: React.FC<TokenImageProps> = ({ token, className }) => {
  if (token.type === TokenType.ERC721 && token.collectionImage) {
    return (
      <div className={`${className} bg-slate-800 border border-indigo-500/20 overflow-hidden`}>
        <img src={token.collectionImage} alt={token.name} className="w-full h-full object-cover" />
      </div>
    );
  }

  const getIdenticonColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return "#" + (hash & 0x00FFFFFF).toString(16).toUpperCase().padStart(6, '0');
  };

  if (!token.logoUrl) {
    return (
      <div style={{ backgroundColor: getIdenticonColor(token.symbol) }} className={`${className} flex items-center justify-center text-white font-black text-[10px]`}>
        {token.symbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <div className={`${className} bg-slate-800 border border-white/5 flex items-center justify-center overflow-hidden`}>
      <img src={token.logoUrl} alt={token.symbol} className="w-full h-full object-contain p-0.5" />
    </div>
  );
};

export default TokenImage;
