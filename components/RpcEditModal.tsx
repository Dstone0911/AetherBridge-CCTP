import React, { useState, useEffect } from 'react';
import { Network } from '../types';

interface RpcEditModalProps {
  network: Network;
  onClose: () => void;
  onSave: (networkId: string, rpcs: string[]) => void;
}

const RpcEditModal: React.FC<RpcEditModalProps> = ({ network, onClose, onSave }) => {
  const [rpcText, setRpcText] = useState(network.rpcUrls.join(', '));

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative p-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-50"></div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.797.939a4.109 4.109 0 01.594.306c.402.245.888.243 1.288-.007l.79-.504a1.125 1.125 0 011.517.186l.773.773a1.125 1.125 0 01.186 1.517l-.504.79c-.25.4-.252.886-.007 1.288.106.173.208.354.306.539.175.413.515.727.939.797l.894.149c.542.09.94.56.94 1.11v1.093c0 .55-.398 1.02-.94 1.11l-.894.149c-.424.07-.764.384-.939.797a4.109 4.109 0 01-.306.594c-.245.402-.243.888.007 1.288l.504.79a1.125 1.125 0 01-.186 1.517l-.773.773a1.125 1.125 0 01-1.517-.186l-.79-.504a1.125 1.125 0 00-1.288.007 4.108 4.108 0 01-.594.306c-.413.175-.727.515-.797.939l-.149.894c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.797-.939a4.109 4.109 0 01-.594.306c-.402-.245-.888-.243-1.288.007l-.79.504a1.125 1.125 0 01-1.517-.186l-.773-.773a1.125 1.125 0 01-.186-1.517l.504-.79a1.125 1.125 0 00-.007-1.288 4.108 4.108 0 01-.306-.594c-.175-.413-.515-.727-.939-.797l-.894-.149a1.125 1.125 0 01-.94-1.11v-1.093c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.384.939-.797.098-.185.2-.366.306-.539.245-.402.243-.888-.007-1.288l-.504-.79a1.125 1.125 0 01.186-1.517l.773-.773a1.125 1.125 0 011.517.186l.79.504c.4.25.886.252 1.288.007.185-.106.366-.208.539-.306.413-.175.727-.515.797-.939l.149-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Configure RPCs</h3>
            <p className="text-xs text-slate-500">{network.name}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">RPC Endpoints</label>
            <textarea 
              value={rpcText}
              onChange={(e) => setRpcText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-indigo-400 focus:outline-none focus:border-indigo-500/50 transition-all min-h-[120px] shadow-inner"
              placeholder="Enter comma-separated URLs: https://rpc.example.com, https://fallback.com"
            />
            <p className="mt-2 text-[10px] text-slate-600 font-medium">
              List multiple URLs separated by commas. The bridge will automatically use them sequentially if a connection fails.
            </p>
          </div>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex gap-3">
             <div className="text-indigo-400 mt-0.5 flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
               </svg>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed">
               Adding multiple RPCs significantly improves transaction reliability, especially during high network congestion.
             </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-sm transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              const rpcs = rpcText.split(',').map(s => s.trim()).filter(s => s !== '');
              onSave(network.id, rpcs);
            }}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
          >
            Update Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default RpcEditModal;