
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Network, NetworkType, BridgeStage, Token, BridgeProtocol, TokenType, EIP6963ProviderDetail } from './types';
import { 
  connectWallet, getChainId, switchNetwork, getTokenBalance, approveAsset,
  burnToken, CCTP_CONTRACTS, SUPPORTED_TOKENS, checkRpcReachability, 
  LZ_ENDPOINTS, LZ_EIDS, sendLayerZero, mintUSDC, mintNFT, bridgeNFT, discoverProviders
} from './services/walletService';
import { mockApprove, mockBurn, generateTxHash, wait } from './services/mockChainService';
import { analyzeBridgeTransaction } from './services/geminiService';
import NetworkBadge from './components/NetworkBadge';
import ActivityChart from './components/ActivityChart';
import TokenSelector from './components/TokenSelector';
import TokenImage from './components/TokenImage';
import NetworkModal from './components/NetworkModal';
import NetworkSelector from './components/NetworkSelector';
import RpcEditModal from './components/RpcEditModal';
import TenderlySettings from './components/TenderlySettings';
import WalletSelectorModal from './components/WalletSelectorModal';
import { ChevronDownIcon, ArrowRightIcon, CheckCircleIcon, ShieldCheckIcon, ArrowPathIcon } from './components/Icons';

const RpcHealthIndicator: React.FC<{ healthy: boolean | null }> = ({ healthy }) => (
  <div className={`w-2.5 h-2.5 rounded-full border-2 border-slate-900 shadow-sm transition-colors duration-500 ${
    healthy === null ? 'bg-slate-600 animate-pulse' :
    healthy ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
    'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
  }`} />
);

const DEFAULT_NETWORKS: Network[] = [
  { 
    id: 'sepolia', name: 'Sepolia Testnet', type: NetworkType.TESTNET, chainId: 11155111, chainIdHex: '0xaa36a7',
    currency: 'ETH', rpcUrls: ['https://rpc.sepolia.org'], explorerUrl: 'https://sepolia.etherscan.io',
    cctpTokenMessenger: CCTP_CONTRACTS.sepolia.tokenMessenger, cctpMessageTransmitter: CCTP_CONTRACTS.sepolia.messageTransmitter,
    lzEndpoint: LZ_ENDPOINTS.sepolia, lzChainId: LZ_EIDS.sepolia, cctpDomain: 0 
  },
  { 
    id: 'mainnet', name: 'Ethereum Mainnet', type: NetworkType.MAINNET, chainId: 1, chainIdHex: '0x1',
    currency: 'ETH', rpcUrls: ['https://eth.llamarpc.com'], explorerUrl: 'https://etherscan.io',
    cctpTokenMessenger: CCTP_CONTRACTS.mainnet.tokenMessenger, cctpMessageTransmitter: CCTP_CONTRACTS.mainnet.messageTransmitter,
    lzEndpoint: LZ_ENDPOINTS.mainnet, lzChainId: LZ_EIDS.mainnet, cctpDomain: 0 
  }
];

const App: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('');
  const [protocol, setProtocol] = useState<BridgeProtocol>(BridgeProtocol.CCTP);
  const [tokens] = useState<Token[]>(SUPPORTED_TOKENS);
  const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0]);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<BridgeStage>(BridgeStage.IDLE);
  const [isSimulated, setIsSimulated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  
  const [tenderlyRpc, setTenderlyRpc] = useState<string>('');
  const [tenderlyChainId, setTenderlyChainId] = useState<string>('3030');
  const [customNetworks, setCustomNetworks] = useState<Network[]>(() => {
    const saved = localStorage.getItem('ab_custom_nets');
    return saved ? JSON.parse(saved) : [];
  });

  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [isNetworkSelectorOpen, setIsNetworkSelectorOpen] = useState<'source' | 'dest' | null>(null);
  const [isTenderlyOpen, setIsTenderlyOpen] = useState(false);
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [sourceNetworkId, setSourceNetworkId] = useState<string>('sepolia');
  const [destNetworkId, setDestNetworkId] = useState<string>('mainnet');
  const [networkHealth, setNetworkHealth] = useState<Record<string, boolean | null>>({});

  const supportedNetworks = useMemo(() => [...DEFAULT_NETWORKS, ...customNetworks], [customNetworks]);
  const sourceNetwork = useMemo(() => supportedNetworks.find(n => n.id === sourceNetworkId) || supportedNetworks[0], [supportedNetworks, sourceNetworkId]);
  const destNetwork = useMemo(() => supportedNetworks.find(n => n.id === destNetworkId) || supportedNetworks[1], [supportedNetworks, destNetworkId]);

  // Defined statusText to fix the error: Cannot find name 'statusText' on line 227
  const statusText = useMemo(() => {
    switch (stage) {
      case BridgeStage.CHECKING_NETWORK: return 'Validating Connection';
      case BridgeStage.APPROVING: return 'Granting Permission';
      case BridgeStage.BURNING: return 'Igniting Burn';
      case BridgeStage.SENDING_LZ: return 'Transmitting Data';
      case BridgeStage.WAITING_ATTESTATION: return 'Awaiting Circle Proof';
      case BridgeStage.WAITING_LZ_DELIVERY: return 'Relaying Asset';
      case BridgeStage.MINTING: return 'Synthesizing Asset';
      case BridgeStage.SETTLING: return 'Finalizing Hub';
      case BridgeStage.COMPLETED: return 'Migration Complete';
      case BridgeStage.FAILED: return 'System Error';
      default: return 'Processing';
    }
  }, [stage]);

  const isNFT = selectedToken.type === TokenType.ERC721;
  const isNative = selectedToken.type === TokenType.NATIVE;

  useEffect(() => {
    if (isNFT || isNative) setProtocol(BridgeProtocol.LAYERZERO);
    else if (selectedToken.symbol === 'USDC') setProtocol(BridgeProtocol.CCTP);
  }, [isNFT, isNative, selectedToken]);

  const fetchBalances = useCallback(async (addr: string) => {
    if (isSimulated) { setBalances({ 'ETH': '4.20', 'USDC': '1000.00', 'AZR': '3' }); return; }
    const res: Record<string, string> = {};
    await Promise.all(tokens.map(async (t) => {
      const bal = await getTokenBalance(addr, t.address[sourceNetwork.id] || t.address['mainnet'], t.decimals, t.type, sourceNetwork);
      res[t.symbol] = bal;
    }));
    setBalances(res);
  }, [tokens, sourceNetwork, isSimulated]);

  useEffect(() => {
    supportedNetworks.forEach(async (net) => {
      setNetworkHealth(p => ({ ...p, [net.id]: null }));
      const h = await checkRpcReachability(net.rpcUrls[0]);
      setNetworkHealth(p => ({ ...p, [net.id]: h }));
    });
  }, [supportedNetworks]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      const p = await discoverProviders();
      setAvailableProviders(p);
      setIsWalletSelectorOpen(true);
    } catch (e: any) { setErrorMsg(e.message); }
    finally { setIsConnecting(false); }
  };

  const executeConnect = async (provider?: EIP6963ProviderDetail) => {
    try {
      const { address } = await connectWallet(provider);
      setWalletAddress(address);
      setIsWalletSelectorOpen(false);
      fetchBalances(address);
    } catch (e: any) { setErrorMsg(e.message); }
  };

  const handleBridge = async () => {
    if (!isSimulated && (await getChainId()) !== sourceNetwork.chainId) {
      await switchNetwork(sourceNetwork);
      return;
    }
    setErrorMsg(null);
    setAiInsight(null);
    try {
      if (!isNative) {
        setStage(BridgeStage.APPROVING);
        const spender = protocol === BridgeProtocol.CCTP ? sourceNetwork.cctpTokenMessenger! : sourceNetwork.lzEndpoint!;
        if (isSimulated) await mockApprove();
        else await approveAsset(walletAddress!, spender, selectedToken.address[sourceNetwork.id] || selectedToken.address['mainnet'], isNFT ? tokenId : amount, selectedToken.type, selectedToken.decimals);
      }

      setStage(isNFT ? BridgeStage.SENDING_LZ : (protocol === BridgeProtocol.CCTP ? BridgeStage.BURNING : BridgeStage.SENDING_LZ));
      const hash = isSimulated ? generateTxHash() : (isNFT ? await bridgeNFT(walletAddress!, sourceNetwork.lzEndpoint!, "", tokenId, destNetwork.lzChainId!) : (protocol === BridgeProtocol.CCTP ? await burnToken(walletAddress!, sourceNetwork.cctpTokenMessenger!, selectedToken.address[sourceNetwork.id]!, amount, selectedToken.decimals, destNetwork.cctpDomain!) : await sendLayerZero(walletAddress!, sourceNetwork.lzEndpoint!, "", amount, selectedToken.decimals, destNetwork.lzChainId!, "0.005", isNative)));
      
      analyzeBridgeTransaction(Number(isNFT ? 1 : amount), sourceNetwork.name, destNetwork.name, hash).then(setAiInsight);
      setStage(BridgeStage.WAITING_LZ_DELIVERY);
      await wait(isSimulated ? 4000 : 12000);
      setStage(BridgeStage.COMPLETED);
      fetchBalances(walletAddress!);
    } catch (e: any) { setStage(BridgeStage.FAILED); setErrorMsg(e.message); }
  };

  const deployHub = (overrides: any) => {
    const newNet: Network = {
      id: `hub-${tenderlyChainId}-${Date.now()}`,
      name: `Virtual Hub (${tenderlyChainId})`,
      type: NetworkType.VNET,
      chainId: parseInt(tenderlyChainId),
      chainIdHex: `0x${parseInt(tenderlyChainId).toString(16)}`,
      rpcUrls: tenderlyRpc.split(',').map(s => s.trim()),
      currency: 'ETH',
      isCustom: true,
      ...overrides
    };
    const updated = [...customNetworks, newNet];
    setCustomNetworks(updated);
    localStorage.setItem('ab_custom_nets', JSON.stringify(updated));
    setSourceNetworkId(newNet.id);
    setIsTenderlyOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8 flex flex-col items-center relative overflow-hidden font-inter">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #475569 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
      
      <TokenSelector isOpen={isTokenSelectorOpen} onClose={() => setIsTokenSelectorOpen(false)} tokens={tokens} selectedToken={selectedToken} balances={balances} onSelect={setSelectedToken} onAddCustom={() => {}} />
      <NetworkSelector title="Origin Node" isOpen={isNetworkSelectorOpen === 'source'} onClose={() => setIsNetworkSelectorOpen(null)} networks={supportedNetworks} selectedNetwork={sourceNetwork} onSelect={n => setSourceNetworkId(n.id)} onEditRpc={() => {}} networkHealth={networkHealth} />
      <NetworkSelector title="Target Hub" isOpen={isNetworkSelectorOpen === 'dest'} onClose={() => setIsNetworkSelectorOpen(null)} networks={supportedNetworks} selectedNetwork={destNetwork} onSelect={n => setDestNetworkId(n.id)} onEditRpc={() => {}} networkHealth={networkHealth} />
      <WalletSelectorModal isOpen={isWalletSelectorOpen} providers={availableProviders} onSelect={executeConnect} onClose={() => setIsWalletSelectorOpen(false)} />
      {isTenderlyOpen && <TenderlySettings rpc={tenderlyRpc} chainId={tenderlyChainId} onRpcChange={setTenderlyRpc} onChainIdChange={setTenderlyChainId} onClose={() => setIsTenderlyOpen(false)} onSave={deployHub} />}

      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-16 gap-8 z-20">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-emerald-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl border border-white/10"><ArrowRightIcon className="w-8 h-8 text-white" /></div>
          <div><h1 className="text-4xl font-black tracking-tighter text-white">AetherBridge</h1><p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em]">Universal Asset Pipeline</p></div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsTenderlyOpen(true)} className="px-6 py-3 bg-slate-800/60 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-700 hover:border-emerald-500/50 transition-all">+ Deploy Hub</button>
          <button onClick={handleConnect} disabled={isConnecting} className={`px-8 py-3 rounded-2xl font-black text-xs transition-all shadow-xl flex items-center gap-3 border ${walletAddress ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/30' : 'bg-indigo-600 text-white border-white/10'}`}>
            <div className={`w-2 h-2 rounded-full ${walletAddress ? 'bg-emerald-500 animate-pulse' : 'bg-white/40'}`}></div>
            {walletAddress ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : 'Connect Identity'}
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 z-20">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-slate-800/30 backdrop-blur-[60px] border border-white/5 rounded-[4rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-transparent to-emerald-500 opacity-30"></div>
            <h2 className="text-3xl font-black text-white mb-10">Bridge Assets</h2>

            <div className="space-y-6">
              <div className="bg-slate-900/50 rounded-[3rem] p-10 border border-white/5 relative shadow-inner">
                <div className="flex justify-between mb-6"><span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Origin Node</span><div className="flex items-center gap-3"><span className="text-xs font-mono text-indigo-400 font-black">{balances[selectedToken.symbol] || '0.00'}</span><RpcHealthIndicator healthy={networkHealth[sourceNetwork.id] ?? null} /></div></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <button onClick={() => setIsNetworkSelectorOpen('source')} className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-3xl border border-white/10 hover:bg-slate-700 transition-all"><div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center font-black text-indigo-400 border border-indigo-500/20">{sourceNetwork.name[0]}</div><div className="text-left"><span className="font-black text-white text-lg block">{sourceNetwork.name}</span><span className="text-[9px] text-slate-500 font-black uppercase">ID: {sourceNetwork.chainId}</span></div></button>
                  <div className="text-right w-full md:w-auto">
                    {isNFT ? <input value={tokenId} onChange={e => setTokenId(e.target.value)} placeholder="TOKEN ID" className="bg-transparent text-6xl font-black text-right w-full md:w-64 outline-none placeholder:text-slate-800 text-white" /> : <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-6xl font-black text-right w-full md:w-64 outline-none placeholder:text-slate-800 text-white" />}
                    <button onClick={() => setIsTokenSelectorOpen(true)} className="flex items-center gap-3 mt-4 ml-auto text-[10px] bg-slate-800/80 px-5 py-2.5 rounded-2xl border border-white/5 hover:bg-slate-700 transition-all font-black text-white tracking-widest"><TokenImage token={selectedToken} className="w-6 h-6 rounded-full" /> {selectedToken.symbol} <ChevronDownIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center -my-10 relative z-10"><div className="bg-slate-800 border-[8px] border-[#0f172a] rounded-[2.2rem] p-4 transition-transform group-hover:rotate-180 duration-1000 shadow-2xl"><ChevronDownIcon className="w-10 h-10 text-indigo-400" /></div></div>

              <div className="bg-slate-900/50 rounded-[3rem] p-10 border border-white/5 relative shadow-inner">
                <div className="flex justify-between mb-6"><span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Destination Hub</span><RpcHealthIndicator healthy={networkHealth[destNetwork.id] ?? null} /></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <button onClick={() => setIsNetworkSelectorOpen('dest')} className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-3xl border border-white/10 hover:bg-slate-700 transition-all"><div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center font-black text-emerald-400 border border-emerald-500/20">{destNetwork.name[0]}</div><div className="text-left"><span className="font-black text-white text-lg block">{destNetwork.name}</span><span className="text-[9px] text-slate-500 font-black uppercase">Domain: {destNetwork.cctpDomain || 0}</span></div></button>
                  <span className="text-6xl font-black text-slate-800">{isNFT ? (tokenId ? `#${tokenId}` : '---') : (amount || '0.00')}</span>
                </div>
              </div>
            </div>

            {errorMsg && <div className="mt-10 p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-[2rem] text-xs font-black flex gap-5 items-center animate-in slide-in-from-top-4"><ShieldCheckIcon className="w-6 h-6" /><span>{errorMsg}</span></div>}

            <button onClick={handleBridge} disabled={stage !== BridgeStage.IDLE && stage !== BridgeStage.COMPLETED || !walletAddress} className={`w-full py-8 mt-12 rounded-[3rem] font-black text-2xl transition-all shadow-2xl uppercase tracking-widest ${!walletAddress ? 'bg-slate-800 text-slate-600 grayscale' : stage === BridgeStage.COMPLETED ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
              <span className="flex items-center justify-center gap-4">{!walletAddress ? 'Auth Required' : stage === BridgeStage.IDLE ? `Migrate ${selectedToken.symbol}` : statusText}{stage !== BridgeStage.IDLE && stage !== BridgeStage.COMPLETED && <ArrowPathIcon className="w-6 h-6 animate-spin" />}</span>
            </button>
            {stage === BridgeStage.COMPLETED && <button onClick={() => { setStage(BridgeStage.IDLE); setAmount(''); setTokenId(''); }} className="w-full mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors">Start New Migration</button>}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <div className="bg-slate-800/20 border border-white/5 rounded-[4rem] p-12 shadow-2xl relative group/audit overflow-hidden">
            <div className="flex items-center gap-5 mb-10"><div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"><ShieldCheckIcon className="w-8 h-8 text-emerald-400" /></div><div><h3 className="font-black text-xs uppercase tracking-widest text-white">Security Auditor</h3><p className="text-[9px] text-slate-500 font-black mt-1">Universal Asset Verification</p></div></div>
            <div className="bg-slate-950/70 rounded-[3rem] p-10 min-h-[220px] text-sm leading-relaxed text-slate-400 font-medium italic border border-white/5 shadow-inner">{aiInsight || "System dormant... Monitoring hub RPC pool for packet dispatch fingerprinting."}</div>
            {aiInsight && <div className="absolute top-12 right-12"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)] animate-ping"></div></div>}
          </div>
          <ActivityChart />
        </div>
      </main>

      <footer className="mt-24 text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] pb-20">AetherBridge Operational Tier-1 Infrastructure</footer>
    </div>
  );
};

export default App;
