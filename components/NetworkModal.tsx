import React from 'react';
import { Network } from '../types';
import { ArrowRightIcon } from './Icons';

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetNetwork: Network;
  currentNetworkName: string;
  onSwitch: () => void;
}

const NetworkModal: React.FC<NetworkModalProps> = ({ 
  isOpen, 
  onClose, 
  targetNetwork, 
  currentNetworkName, 
  onSwitch 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative p-8">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-amber-500 animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.34c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Switch Network</h3>
          <p className="text-slate-400 text-sm mb-10 max-w-xs">
            CCTP requires you to be connected to <span className="text-white font-semibold">{targetNetwork.name}</span> to complete this action.
          </p>

          <div className="flex items-center gap-6 mb-10 w-full px-4">
            <div className="flex-1 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Current</div>
               <div className="text-sm font-bold text-slate-300 truncate">{currentNetworkName || 'Unknown'}</div>
            </div>
            
            <div className="flex-shrink-0 bg-indigo-600 p-2 rounded-full shadow-lg shadow-indigo-600/40">
               <ArrowRightIcon className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl">
               <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Target</div>
               <div className="text-sm font-bold text-white truncate">{targetNetwork.name}</div>
            </div>
          </div>

          <button 
            onClick={onSwitch}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Switch to {targetNetwork.name}
          </button>
          
          <button 
            onClick={onClose}
            className="mt-4 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
          >
            Stay on current network
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkModal;