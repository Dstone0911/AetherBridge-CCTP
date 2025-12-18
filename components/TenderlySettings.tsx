import React, { useState } from 'react';
import { ShieldCheckIcon } from './Icons';

interface TenderlySettingsProps {
  rpc: string;
  chainId: string;
  onRpcChange: (val: string) => void;
  onChainIdChange: (val: string) => void;
  onClose: () => void;
  onSave: (addresses: { messenger?: string, transmitter?: string, domain?: number, endpoint?: string, lzId?: number }) => void;
}

const TenderlySettings: React.FC<TenderlySettingsProps> = ({
  rpc,
  chainId,
  onRpcChange,
  onChainIdChange,
  onClose,
  onSave
}) => {
  const [messenger, setMessenger] = useState('0xBd3fa81B58Ba92a8b13A8FE9cC680bF6d09181DB');
  const [transmitter, setTransmitter] = useState('0x0a992d191DEeC32aFe36203Ad87D7d289a738F81');
  const [domain, setDomain] = useState('0');
  const [endpoint, setEndpoint] = useState('0x1a44076050125825900e736c501f859c50fE728c');
  const [lzId, setLzId] = useState('30101');

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative p-8 my-8">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
            <ShieldCheckIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Infrastructure Config</h3>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Deploy Virtual vNet / Fork Node</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">RPC Endpoints (comma-separated)</label>
              <textarea 
                value={rpc}
                onChange={(e) => onRpcChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 transition-all min-h-[80px] shadow-inner"
                placeholder="https://rpc.tenderly.co/fork/..."
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Chain ID</label>
              <input 
                type="number" 
                value={chainId}
                onChange={(e) => onChainIdChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="1"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">CCTP Domain ID</label>
              <input 
                type="number" 
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">CCTP Stack</h4>
            <div className="space-y-3">
              <input 
                value={messenger}
                onChange={(e) => setMessenger(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500/50"
                placeholder="Token Messenger Address"
              />
              <input 
                value={transmitter}
                onChange={(e) => setTransmitter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500/50"
                placeholder="Message Transmitter Address"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">LayerZero Stack</h4>
            <div className="grid grid-cols-3 gap-3">
              <input 
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="col-span-2 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500/50"
                placeholder="LZ Endpoint V2"
              />
              <input 
                value={lzId}
                onChange={(e) => setLzId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500/50"
                placeholder="LZ EID"
              />
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <p className="text-[10px] text-emerald-500/70 leading-relaxed italic font-medium">
              Treating virtual nodes as first-class citizens. All standard CCTP and LayerZero functions will use these overridden addresses.
            </p>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave({ 
              messenger, transmitter, domain: parseInt(domain), 
              endpoint, lzId: parseInt(lzId) 
            })}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
          >
            Deploy Node
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenderlySettings;