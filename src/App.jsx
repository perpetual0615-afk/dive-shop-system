import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Waves, Home, LifeBuoy, CalendarDays, User, Settings, ClipboardList, CheckCircle, Clock, X, Menu, ChevronRight, ChevronLeft, ChevronDown, Plus, Trash2, Edit3, Save, AlertTriangle, PenTool, Phone, MessageCircle, MapPin, Scale, Info, Check, ArrowRight, ShoppingCart, Search, BookOpen, Fish, Lock, KeyRound, Download, CircleDollarSign } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, serverTimestamp, deleteDoc, setDoc, getDoc } from 'firebase/firestore';

// --- Firebase 基礎配置 ---
const firebaseConfig = {
  apiKey: "AIzaSyA9NlT0rJXbUqhHWJD647CEuMYWgkmkfU0",
  authDomain: "sharkenting777550.firebaseapp.com",
  projectId: "sharkenting777550",
  storageBucket: "sharkenting777550.firebasestorage.app",
  messagingSenderId: "1092791454866",
  appId: "1:1092791454866:web:b4f17685c6c58b521caa4b",
  measurementId: "G-TYT7E313E2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'dive-shop-demo';

// --- 預設問卷與服務 ---
const DEFAULT_MEDICAL_FORM = [
  { id: 1, text: "一、您的肺部/呼吸系統、心臟/血液系統是否有任何狀況或病史？", subItems: [{ id: 11, text: "1. 曾罹患氣喘、氣胸，或過去12個月內曾出現喘息等呼吸困難症狀？" }, { id: 12, text: "2. 曾接受過胸部、肺部或心臟/血管手術？" }, { id: 13, text: "3. 曾有心臟病發作、心律不整、中風，或目前正服用治療血壓、心血管疾病的藥物？" }]},
  { id: 2, text: "二、您是否年滿 45 歲，且符合以下任一健康狀況？", subItems: [{ id: 21, text: "1. 目前有抽菸習慣（包含紙菸、雪茄或電子菸）？" }, { id: 22, text: "2. 患有高血壓或膽固醇過高？" }]},
  { id: 3, text: "三、您是否曾有眼睛、耳朵、鼻腔或鼻竇的疾病與手術病史？", subItems: [{ id: 31, text: "1. 過去6個月內曾接受過眼睛、耳朵或鼻竇手術？" }, { id: 32, text: "2. 在搭乘飛機或前往高海拔地區時，曾有嚴重的耳朵/鼻竇氣壓性擠壓傷？" }]},
  { id: 4, text: "四、您是否有神經系統、腦部或心理健康的狀況？", subItems: [{ id: 41, text: "1. 曾有癲癇、抽搐，或目前正在服用預防性藥物？" }, { id: 43, text: "3. 曾被診斷出患有恐慌症、幽閉恐懼症、廣場恐懼症或嚴重憂鬱症？" }]}
];

const DEFAULT_SERVICES = ['🛏️ 背包房床位', '🥪 提供早午餐', '📃 潛水意外責任險', '🚗 提供潛店到潛點的接駁', '👤 教練１對４人以下指導'];

// --------------------------------------------------------
// 圖示與背景元件 (Icons & Watermarks)
// --------------------------------------------------------
const StaghornCoralWatermark = ({ className }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="coralGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BE123C" />
        <stop offset="50%" stopColor="#F43F5E" />
        <stop offset="100%" stopColor="#FDA4AF" />
      </linearGradient>
      <linearGradient id="coralAccent" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#9D174D" />
        <stop offset="100%" stopColor="#FBCFE8" />
      </linearGradient>
    </defs>
    <g style={{ transformOrigin: '60px 120px' }} stroke="#FDA4AF" strokeLinecap="round" opacity="0.4">
      <animateTransform attributeName="transform" type="rotate" values="-4; 4; -4" dur="7s" repeatCount="indefinite" ease="ease-in-out" />
      <path d="M60 120 Q 35 90 10 50 M60 120 Q 45 70 25 15 M60 120 Q 75 70 95 15 M60 120 Q 85 90 110 50" strokeWidth="3" />
      <path d="M22 80 Q 60 65 98 80 M13 55 Q 60 30 107 55 M27 30 Q 60 10 93 30" strokeWidth="2" strokeDasharray="3 5" />
    </g>
    <g style={{ transformOrigin: '60px 110px' }} strokeLinecap="round" strokeLinejoin="round">
      <animateTransform attributeName="transform" type="rotate" values="2; -2; 2" dur="5s" repeatCount="indefinite" ease="ease-in-out" />
      <path d="M60 120 C 50 80 20 60 15 25 M60 120 C 70 80 100 60 105 25 M60 120 C 55 70 35 40 45 10 M60 120 C 65 70 85 40 75 10 M60 120 V 30" stroke="#FFF" strokeWidth="12" opacity="0.25" filter="blur(2px)" />
      <path d="M60 120 C 50 80 20 60 15 25" stroke="url(#coralGrad)" strokeWidth="8" opacity="0.95" />
      <path d="M60 120 C 70 80 100 60 105 25" stroke="url(#coralGrad)" strokeWidth="8" opacity="0.95" />
      <path d="M60 120 C 55 70 35 40 45 10" stroke="url(#coralAccent)" strokeWidth="7" opacity="0.9" />
      <path d="M60 120 C 65 70 85 40 75 10" stroke="url(#coralAccent)" strokeWidth="7" opacity="0.9" />
      <path d="M60 120 V 30" stroke="url(#coralGrad)" strokeWidth="9" opacity="0.95" />
      <path d="M35 70 Q 20 50 5 45" stroke="url(#coralGrad)" strokeWidth="5.5" />
      <path d="M85 70 Q 100 50 115 45" stroke="url(#coralGrad)" strokeWidth="5.5" />
    </g>
  </svg>
);

const DivingGearWatermark = ({ className }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="tankGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#0891B2" /><stop offset="50%" stopColor="#22D3EE" /><stop offset="100%" stopColor="#164E63" /></linearGradient>
      <linearGradient id="bcdGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#334155" /><stop offset="50%" stopColor="#1E293B" /><stop offset="100%" stopColor="#0F172A" /></linearGradient>
    </defs>
    <g>
      <animateTransform attributeName="transform" type="translate" values="0,3; 0,-3; 0,3" dur="5s" repeatCount="indefinite" ease="ease-in-out" />
      <rect x="50" y="10" width="28" height="90" rx="14" fill="url(#tankGrad)" opacity="0.95" />
      <path d="M58 4 H 70 V 10 H 58 Z" fill="#94A3B8" opacity="0.9" />
      <g opacity="0.95">
        <path d="M35 30 C 35 15, 50 15, 55 30 C 60 50, 40 60, 35 80" fill="none" stroke="url(#bcdGrad)" strokeWidth="12" strokeLinecap="round" />
        <path d="M93 30 C 93 15, 78 15, 73 30 C 68 50, 88 60, 93 80" fill="none" stroke="url(#bcdGrad)" strokeWidth="12" strokeLinecap="round" />
        <path d="M25 70 C 25 60, 103 60, 103 70 V 95 C 103 105, 25 105, 25 95 Z" fill="url(#bcdGrad)" />
      </g>
    </g>
  </svg>
);

const AbyssExplorerWatermark = ({ className }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g style={{ transformOrigin: '60px 60px' }}>
      <circle cx="60" cy="60" r="50" stroke="#4F46E5" strokeWidth="1" strokeDasharray="2 4" opacity="0.5"><animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="20s" repeatCount="indefinite" linear="true" /></circle>
      <circle cx="60" cy="60" r="20" stroke="#818CF8" strokeWidth="1" strokeDasharray="1 3" opacity="0.8"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="15s" repeatCount="indefinite" linear="true" /></circle>
    </g>
    <g opacity="0.9">
      <animateTransform attributeName="transform" type="translate" values="0,-3; 0,3; 0,-3" dur="4s" repeatCount="indefinite" ease="ease-in-out" />
      <rect x="42" y="52" width="24" height="14" rx="4" fill="#1E1B4B" stroke="#A5B4FC" strokeWidth="1.5" />
      <path d="M 44 52 Q 54 42 64 52" fill="none" stroke="#818CF8" strokeWidth="1.5" />
      <circle cx="54" cy="48" r="1.5" fill="#6366F1" />
    </g>
  </svg>
);

const WhaleSharkTopDownIcon = ({ className }) => (
  <svg viewBox="0 0 150 250" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="wsBody" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#0F172A" /><stop offset="40%" stopColor="#1E3A8A" /><stop offset="100%" stopColor="#172554" /></linearGradient>
      <linearGradient id="wsFin" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1E3A8A" /><stop offset="100%" stopColor="#0F172A" /></linearGradient>
    </defs>
    <path d="M 35 60 C 10 70, -5 100, 5 110 C 20 95, 35 90, 45 85 Z" fill="url(#wsFin)" />
    <path d="M 115 60 C 140 70, 155 100, 145 110 C 130 95, 115 90, 105 85 Z" fill="url(#wsFin)" />
    <path d="M 55 160 C 40 170, 35 185, 45 190 C 50 180, 55 175, 60 175 Z" fill="url(#wsFin)" />
    <path d="M 95 160 C 110 170, 115 185, 105 190 C 100 180, 95 175, 90 175 Z" fill="url(#wsFin)" />
    <path d="M 75 220 C 50 230, 40 250, 45 245 C 60 235, 90 235, 105 245 C 110 250, 100 230, 75 220 Z" fill="url(#wsFin)" />
    <path d="M 40 20 C 30 30, 20 60, 45 140 C 60 200, 70 230, 75 240 C 80 230, 90 200, 105 140 C 130 60, 120 30, 110 20 C 95 5, 55 5, 40 20 Z" fill="url(#wsBody)" />
    <g fill="#FFFFFF" opacity="0.7">
       <circle cx="75" cy="35" r="2.5" /><circle cx="60" cy="40" r="1.5" /><circle cx="90" cy="40" r="1.5" />
       <circle cx="50" cy="50" r="2" /><circle cx="100" cy="50" r="2" /><circle cx="75" cy="55" r="3" />
    </g>
  </svg>
);

const AbyssRadarIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 2v20" opacity="0.3" /><path d="M2 12h20" opacity="0.3" /><circle cx="12" cy="12" r="6" strokeDasharray="2 2" /><circle cx="12" cy="12" r="2" fill="currentColor" /><path d="M12 12L18.5 5.5" strokeDasharray="1 2" /></svg>);
const CoralIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22v-7" /><path d="M12 17c-2.5-1-3-3-3-5a3 3 0 0 1 2-2" /><path d="M12 18c3-1 4.5-2 4.5-5 0-1.5-1-2.5-2-3" /><path d="M7 22v-4" /><path d="M7 19c-2-1-3-2-3-4" /><path d="M17 22v-5" /><path d="M17 19c2-.5 3-2 3-4" /></svg>);
const CardDivingMaskIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 11c0-3.87 3.13-7 7-7h4c3.87 0 7 3.13 7 7v3c0 2.21-1.79 4-4 4h-1.5l-1.5 2h-4l-1.5-2H7c-2.21 0-4-1.79-4-4v-3z" /><path d="M12 11v6" /></svg>);
const CardDivingTankIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 2h2v3h-2z" /><path d="M13 3h1.5a1 1 0 0 1 0 2H13" /><path d="M7 10.5C7 7.46 9.24 5 12 5c2.76 0 5 2.46 5 5.5V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9.5Z" /><path d="M7 13h10" /><path d="M7 19h10" /></svg>);

// --------------------------------------------------------
// 輔助工具 (Helpers)
// --------------------------------------------------------
function formatTs(ts) {
  if (!ts) return '處理中...';
  try {
    if (typeof ts === 'string') return ts;
    if (typeof ts === 'number') return new Date(ts).toLocaleString();
    if (typeof ts.toDate === 'function') return ts.toDate().toLocaleString();
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
  } catch (e) { return '日期錯誤'; }
  return JSON.stringify(ts);
}

function formatDateTs(ts) {
  if (!ts) return '處理中...';
  try {
    if (typeof ts === 'string') return ts;
    if (typeof ts === 'number') return new Date(ts).toLocaleDateString();
    if (typeof ts.toDate === 'function') return ts.toDate().toLocaleDateString();
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
  } catch (e) { return '日期錯誤'; }
  return JSON.stringify(ts);
}

function formatPhoneNumber(value) {
  if (!value) return '';
  const numbers = value.replace(/[^\d]/g, '');
  if (numbers.length <= 4) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
  return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 10)}`;
}

function exportToCSV(filename, rows) {
  const processRow = function (row) {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
      if (row[j] instanceof Date) innerValue = row[j].toLocaleString();
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };
  let csvFile = '\uFEFF'; 
  for (let i = 0; i < rows.length; i++) csvFile += processRow(rows[i]);
  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url); link.setAttribute("download", filename);
    link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }
}

function calculateRecommendedSize(h, w) {
  if (!h || !w) return '';
  const height = parseFloat(h), weight = parseFloat(w);
  if (height < 160 && weight < 55) return 'XS';
  if (height < 170 && weight < 65) return 'S';
  if (height < 178 && weight < 75) return 'M';
  if (height < 185 && weight < 85) return 'L';
  return 'XL';
}
function calculateFinSize(shoe) {
  const s = parseFloat(shoe);
  if (!s) return '';
  if (s <= 23) return 'XS'; if (s <= 25) return 'S'; if (s <= 27) return 'M'; if (s <= 29) return 'L';
  return 'XL';
}
function calculateBootSize(shoe) { return parseFloat(shoe) ? String(Math.round(parseFloat(shoe))) : ''; }

function AISizeAdvisor({ height, weight, shoeSize, showWeight = false, dark = false }) {
  const h = parseFloat(height), w = parseFloat(weight);
  if (!h || !w) return null;
  const bmi = w / ((h / 100) ** 2);
  const scaleY = Math.max(0.85, Math.min(1.15, h / 170));
  const scaleX = Math.max(0.75, Math.min(1.4, bmi / 22));
  const recSize = calculateRecommendedSize(h, w), recWeight = Math.max(1, Math.round(w * 0.08)), recBoot = calculateBootSize(shoeSize), recFin = calculateFinSize(shoeSize);

  return (
    <div className={`border rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-6 overflow-hidden relative ${dark ? 'bg-slate-800/50 border-slate-700' : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200/60'}`}>
       <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none ${dark ? 'bg-cyan-500/10' : 'bg-blue-500/10'}`}></div>
       <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none ${dark ? 'bg-blue-500/10' : 'bg-indigo-500/10'}`}></div>
       <div className="relative w-40 h-48 flex items-end justify-center bg-slate-900 rounded-2xl border border-indigo-900/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>
          <div className="flex flex-col items-center origin-bottom transition-transform duration-700 ease-out z-10" style={{ transform: `scaleX(${scaleX}) scaleY(${scaleY})`, marginBottom: '12px' }}>
             <div className="w-9 h-9 bg-slate-700 rounded-full mb-1 relative border-2 border-slate-600 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                <div className="absolute top-1.5 left-[4px] right-[4px] h-3.5 bg-cyan-400/90 rounded-[3px] backdrop-blur-sm border border-cyan-200/50 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
             </div>
             <div className="w-[56px] h-[76px] bg-slate-700 rounded-t-xl relative border-2 border-slate-600 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-14 bg-slate-600/50 rounded-full"></div>
                <div className="absolute top-3 -left-2.5 -right-2.5 h-12 bg-slate-800 rounded-lg border border-slate-500 flex justify-center items-center shadow-lg">
                   <div className="w-2 h-full bg-blue-500/80 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.8)]"></div>
                   <div className="absolute -right-1.5 top-2 w-2.5 h-2.5 bg-slate-400 rounded-full border border-slate-500"></div> 
                </div>
             </div>
             <div className="flex gap-[2px] w-[56px]">
               <div className="w-[27px] h-14 bg-slate-700 rounded-b-lg border-2 border-slate-600 border-t-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
               <div className="w-[27px] h-14 bg-slate-700 rounded-b-lg border-2 border-slate-600 border-t-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
             </div>
          </div>
          <div className="absolute inset-0 pointer-events-none z-30">
             <div className="absolute top-[35%] left-[2%] flex items-center">
                <div className="bg-slate-800/90 backdrop-blur-sm text-cyan-300 text-[10px] font-black px-1.5 py-1 rounded shadow-md border border-cyan-500/50 leading-none">BCD {recSize}</div>
             </div>
             {showWeight && (
                <div className="absolute bottom-[16%] left-[2%] flex items-center">
                    <div className="bg-slate-800/90 backdrop-blur-sm text-blue-300 text-[10px] font-black px-1.5 py-1 rounded shadow-md border border-blue-500/50 flex items-center gap-0.5 leading-none"><Scale className="w-2.5 h-2.5" /> {recWeight}kg</div>
                </div>
             )}
          </div>
       </div>
       <div className="flex-1 space-y-3 z-10">
          <h4 className={`font-black flex items-center gap-2 ${dark ? 'text-cyan-400' : 'text-indigo-900'}`}><User className={`w-5 h-5 ${dark ? 'text-cyan-500' : 'text-indigo-600'}`} /> AI 體型測繪與智能裝備建議</h4>
          <div className="flex flex-wrap gap-3 pt-1.5">
             <div className={`px-3.5 py-2.5 rounded-xl border shadow-sm flex items-center gap-3 ${dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-indigo-100'}`}>
               <div className={`p-2 rounded-lg ${dark ? 'bg-slate-700' : 'bg-indigo-50'}`}><LifeBuoy className={`w-4 h-4 ${dark ? 'text-cyan-400' : 'text-indigo-600'}`}/></div>
               <div><span className={`text-[10px] block font-bold mb-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>推薦 BCD/防寒衣</span><span className={`text-xl font-black leading-none ${dark ? 'text-cyan-300' : 'text-indigo-700'}`}>{recSize}</span></div>
             </div>
             {showWeight && (
                <div className={`px-3.5 py-2.5 rounded-xl border shadow-sm flex items-center gap-3 ${dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-indigo-100'}`}>
                  <div className={`p-2 rounded-lg ${dark ? 'bg-slate-700' : 'bg-blue-50'}`}><Scale className={`w-4 h-4 ${dark ? 'text-blue-400' : 'text-blue-600'}`}/></div>
                  <div><span className={`text-[10px] block font-bold mb-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>教練參考配重</span><span className={`text-xl font-black leading-none ${dark ? 'text-blue-400' : 'text-blue-700'}`}>{recWeight} <span className="text-xs font-bold">KG</span></span></div>
                </div>
             )}
          </div>
       </div>
    </div>
  )
}

// --------------------------------------------------------
// 基礎 UI 組件
// --------------------------------------------------------
function AdminLoginModal({ onVerify, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true); setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const adminDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admins', user.uid));
      if (adminDoc.exists()) {
        onVerify(true);
      } else {
        await signOut(auth); 
        throw new Error('此帳號未獲授權進入管理後台。');
      }
    } catch (err) {
      setError(err.message === '此帳號未獲授權進入管理後台。' ? err.message : '帳號或密碼錯誤');
      setPassword('');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative animate-in zoom-in-95 border border-white">
        <h2 className="text-2xl font-black text-slate-900 text-center mb-2">營運管理登入</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <input autoFocus type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="管理員 Email" className={`w-full p-4 bg-slate-50 border-2 rounded-2xl text-center font-bold outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-500 focus:bg-white'}`} />
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="密碼" className={`w-full p-4 bg-slate-50 border-2 rounded-2xl text-center font-black tracking-widest outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-500 focus:bg-white'}`} />
          </div>
          {error && <p className="text-red-500 text-xs font-bold text-center mt-2 animate-bounce">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-2">{isSubmitting ? '驗證中...' : <><KeyRound className="w-5 h-5" /> 登入並解鎖權限</>}</button>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="w-full py-2 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">取消返回</button>
        </form>
      </div>
    </div>
  );
}

function QuickCard({ icon, title, desc, onClick, colorTheme = "cyan", variant, bgIcon }) {
  const themeMap = {
    teal: { wrapper: "border-teal-100 hover:border-teal-300 hover:shadow-[0_15px_30px_rgba(20,184,166,0.15)]", iconBg: "bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 group-hover:from-teal-400 group-hover:to-teal-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]", titleHover: "group-hover:text-teal-700", watermark: "text-teal-400", glow: "bg-teal-400/10" },
    rose: { wrapper: "border-rose-100 hover:border-rose-300 hover:shadow-[0_15px_30px_rgba(244,63,94,0.15)]", iconBg: "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 group-hover:from-rose-400 group-hover:to-rose-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]", titleHover: "group-hover:text-rose-700", watermark: "text-rose-400", glow: "bg-rose-400/10" },
    cyan: { wrapper: "border-cyan-100 hover:border-cyan-300 hover:shadow-[0_15px_30px_rgba(6,182,212,0.15)]", iconBg: "bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-600 group-hover:from-cyan-400 group-hover:to-cyan-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]", titleHover: "group-hover:text-cyan-700", watermark: "text-cyan-400", glow: "bg-cyan-400/10" },
    indigo: { wrapper: "border-indigo-100 hover:border-indigo-300 hover:shadow-[0_15px_30px_rgba(99,102,241,0.15)]", iconBg: "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 group-hover:from-indigo-400 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]", titleHover: "group-hover:text-indigo-700", watermark: "text-indigo-400", glow: "bg-indigo-400/10" }
  };
  const theme = themeMap[colorTheme] || themeMap.cyan;
  return (
    <div onClick={onClick} className={`bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer group hover:-translate-y-2 relative overflow-hidden ${theme.wrapper} h-full flex flex-col`}>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform duration-700 group-hover:scale-150 ${theme.glow}`}></div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem] z-0">
        {variant === 'accommodations' && <StaghornCoralWatermark className={`absolute bottom-0 right-2 w-44 h-44 opacity-[0.2] transition-all duration-700 group-hover:scale-105 group-hover:opacity-[0.35] ${theme.watermark}`} />}
        {variant === 'equipments' && <DivingGearWatermark className={`absolute bottom-2 right-4 w-36 h-36 opacity-[0.2] transition-all duration-700 group-hover:-translate-y-2 group-hover:opacity-[0.35] ${theme.watermark}`} />}
        {variant === 'dashboard' && <AbyssExplorerWatermark className={`absolute bottom-0 right-0 w-48 h-48 opacity-[0.25] transition-all duration-700 group-hover:scale-110 group-hover:opacity-[0.45] ${theme.watermark} translate-x-4 translate-y-4`} />}
        {variant === 'activities' && <Waves className={`absolute bottom-0 right-0 w-44 h-44 opacity-[0.15] transition-all duration-700 group-hover:scale-110 group-hover:opacity-[0.25] ${theme.watermark}`} />}
      </div>
      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] relative z-10 ${theme.iconBg}`}>{icon}</div>
      <div className="relative z-10 mt-auto">
         <h3 className={`text-xl font-black text-slate-800 mb-2 transition-colors ${theme.titleHover}`}>{String(title)}</h3>
         <p className="text-slate-500 text-sm font-bold leading-relaxed">{String(desc)}</p>
      </div>
    </div>
  );
}

function AdminTabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center w-full p-4 border-b border-slate-100 transition-all group ${active ? 'bg-blue-50 text-blue-700 font-bold border-l-[4px] border-l-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
      <span className={`mr-3 ${active ? 'text-blue-600' : 'text-slate-400'}`}>{icon}</span><span className="font-bold">{String(label)}</span>
    </button>
  );
}

function SubTabBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${active ? 'bg-white shadow-sm text-blue-700 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-200/50'}`}>{String(label)}</button>
  );
}

function ControlPanelCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> {String(title)}</h4>
      {children}
    </div>
  );
}

function FormInput({ label, required, type = "text", value, onChange, placeholder, dark = false }) {
  return (
    <div className="space-y-2">
      <label className={`text-sm font-bold ml-1 block ${dark ? 'text-slate-400' : 'text-slate-700'}`}>{String(label)} {required && <span className="text-red-500">*</span>}</label>
      <input required={required} type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full p-3.5 rounded-xl outline-none focus:ring-2 focus:border-blue-500 transition-colors font-medium ${dark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border border-slate-300 shadow-sm text-slate-900'}`} />
    </div>
  );
}

function BirthdaySelect({ label, required, value, onChange, dark = false }) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]); setMonth(String(parseInt(parts[1], 10))); setDay(String(parseInt(parts[2], 10)));
      }
    }
  }, [value]);

  const getDaysInMonth = (y, m) => (!y || !m) ? 31 : new Date(y, m, 0).getDate();

  const handleUpdate = (y, m, d) => {
    const maxDays = getDaysInMonth(y, m);
    let newD = d;
    if (d && parseInt(d, 10) > maxDays) newD = String(maxDays);
    setYear(y); setMonth(m); setDay(newD);
    if (y && m && newD) onChange(`${y}-${String(m).padStart(2, '0')}-${String(newD).padStart(2, '0')}`);
    else onChange('');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1);

  const selectClass = `w-full p-3.5 pl-4 pr-8 rounded-xl outline-none focus:ring-2 focus:border-blue-500 transition-colors font-medium appearance-none cursor-pointer ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border border-slate-300 shadow-sm text-slate-900'}`;

  return (
    <div className="space-y-2">
      <label className={`text-sm font-bold ml-1 block ${dark ? 'text-slate-400' : 'text-slate-700'}`}>{String(label)} {required && <span className="text-red-500">*</span>}</label>
      <div className="flex gap-2">
        <div className="relative flex-[4]"><select value={year} onChange={e => handleUpdate(e.target.value, month, day)} className={selectClass}><option value="" disabled>年份</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select><ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /></div>
        <div className="relative flex-[3]"><select value={month} onChange={e => handleUpdate(year, e.target.value, day)} className={selectClass}><option value="" disabled>月</option>{months.map(m => <option key={m} value={m}>{m}</option>)}</select><ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /></div>
        <div className="relative flex-[3]"><select value={day} onChange={e => handleUpdate(year, month, e.target.value)} className={selectClass}><option value="" disabled>日</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select><ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /></div>
      </div>
    </div>
  );
}

function ContactItem({ label, value, subValue, icon, href, highlight = false }) {
  const isLine = highlight === 'line';
  const isBlue = highlight === true || highlight === 'blue';
  const bgClasses = isLine ? 'bg-gradient-to-br from-[#F4FFF4] to-[#E6FFE6] border border-[#00C300]/30 hover:border-[#00C300]/60 hover:shadow-[0_10px_30px_rgba(0,195,0,0.15)]' : isBlue ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 hover:border-cyan-400 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]' : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/50';

  return (
    <div className={`flex items-start gap-4 p-5 sm:p-6 rounded-[2rem] transition-all duration-500 group relative overflow-hidden hover:-translate-y-1.5 ${bgClasses}`}>
      {(isLine || isBlue) && <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 ${isLine ? 'bg-[#00C300]/10' : 'bg-cyan-400/10'}`}></div>}
      <div className={`absolute -bottom-4 -right-4 opacity-[0.04] group-hover:scale-125 transition-transform duration-700 pointer-events-none [&>svg]:w-32 [&>svg]:h-32 rotate-12 ${isLine ? 'text-[#00C300]' : isBlue ? 'text-blue-500' : 'text-slate-400'}`}>{icon}</div>
      <div className={`shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm relative z-10 ${isLine ? 'bg-white text-[#00C300] border border-[#00C300]/20 group-hover:bg-[#00C300] group-hover:text-white' : isBlue ? 'bg-white text-cyan-600 border border-cyan-200 group-hover:bg-cyan-500 group-hover:text-white' : 'bg-slate-50 text-slate-500 border border-slate-100 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500'}`}>{icon}</div>
      <div className="flex-1 min-w-0 pt-0.5 z-10 relative">
        <h4 className={`text-[11px] sm:text-xs font-black mb-1.5 tracking-wider uppercase transition-colors ${isLine ? 'text-[#009E00]' : isBlue ? 'text-cyan-700' : 'text-slate-400 group-hover:text-blue-400'}`}>{String(label || '')}</h4>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className={`text-lg sm:text-xl font-black block break-words transition-colors flex items-center flex-wrap gap-2.5 text-slate-900 group-hover:${isLine ? 'text-[#009E00]' : 'text-cyan-700'}`}>
            <span>{String(value || '')}</span>
            {isLine && <span className="text-[10px] bg-white text-[#00A000] border border-[#00A000]/30 px-2.5 py-1 rounded-full font-black shadow-sm shrink-0 leading-none flex items-center gap-1 group-hover:bg-[#00A000] group-hover:text-white transition-colors"><Plus className="w-3 h-3" /> 加入好友</span>}
          </a>
        ) : (<p className="text-lg sm:text-xl font-black break-words text-slate-900">{String(value || '')}</p>)}
        {subValue && (
          <div className="mt-3 flex flex-wrap gap-2 items-start">
            {String(subValue).split('\n').map((line, i) => line.trim() ? <div key={i} className={`text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg inline-flex text-left leading-relaxed shadow-sm bg-white/60 text-slate-600 border border-slate-200/60 group-hover:bg-white group-hover:border-slate-200 transition-colors`}>{line.trim()}</div> : null)}
          </div>
        )}
      </div>
    </div>
  );
}

function WeightControl({ label, value, onAdd, onSub }) {
  return (
    <div className="p-3 rounded-xl flex flex-col items-center border bg-white border-slate-200 shadow-sm">
      <span className="text-xs font-bold mb-2 text-slate-500">{String(label)}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onSub} className="w-8 h-8 rounded-lg flex items-center justify-center font-bold bg-slate-100 hover:bg-slate-200 text-slate-700">-</button>
        <span className="font-bold text-lg min-w-[24px] text-center text-slate-900">{Number(value)}</span>
        <button type="button" onClick={onAdd} className="w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-sm bg-blue-600 text-white hover:bg-blue-700">+</button>
      </div>
    </div>
  );
}

// --------------------------------------------------------
// 訂單管理及後台元件
// --------------------------------------------------------
function BookingCard({ booking: b, type, db, appId }) {
  const [expanded, setExpanded] = useState(false);
  const bName = String(b.name || b.details?.name || '未知');
  const bPhone = String(b.phone || b.details?.phone || '未知');
  const submitDate = formatTs(b.timestamp);

  const updateStatus = async (status) => {
    try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'bookings', b.id), { status }); }
    catch (e) { alert("狀態更新失敗"); }
  };

  const handleDelete = async () => {
    if (window.confirm("確定要永久刪除此筆預約紀錄嗎？此動作無法撤回。")) {
       try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'bookings', b.id)); }
       catch (e) { alert("刪除失敗，請檢查權限"); }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow mb-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
         <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${b.status === 'pending' ? 'bg-amber-50 text-amber-600' : b.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
             {b.status === 'pending' ? <Clock className="w-5 h-5" /> : b.status === 'confirmed' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
           </div>
           <div>
             <div className="flex items-center gap-2 mb-1">
               <h4 className="font-bold text-lg text-slate-900">{String(b.itemName || '未知')}</h4>
               {b.isReturningCustomer && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-black">回客優惠</span>}
               {type === 'accommodation' && b.details?.breakdown && <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-[10px] font-black">系統試算</span>}
             </div>
             <div className="flex gap-3 text-sm text-slate-500 font-medium">
               <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {bName}</span>
               <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {bPhone}</span>
             </div>
           </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-black text-lg text-blue-600">NT$ {String(b.price || 0)}</div>
              <div className="text-xs text-slate-400">{submitDate}</div>
            </div>
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
               <div className="flex bg-slate-100 rounded-lg p-1">
                  <button onClick={() => updateStatus('pending')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${b.status === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>待審</button>
                  <button onClick={() => updateStatus('confirmed')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${b.status === 'confirmed' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>確認</button>
                  <button onClick={() => updateStatus('cancelled')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${b.status === 'cancelled' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>取消</button>
               </div>
               <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="永久刪除此紀錄"><Trash2 className="w-4 h-4" /></button>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
         </div>
      </div>
      {expanded && (
         <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {type === 'activity' && (
              <>
                <div className="space-y-2">
                   <p className="font-bold text-slate-700 border-b pb-1">學員詳細資料</p>
                   <p><span className="text-slate-400 w-24 inline-block">證件號碼</span> {String(b.idNumber || '未提供')}</p>
                   <p><span className="text-slate-400 w-24 inline-block">出生日期</span> {String(b.birthday || '未提供')}</p>
                   <p><span className="text-slate-400 w-24 inline-block">身高體重</span> {String(b.height)} cm / {String(b.weight)} kg</p>
                   <p><span className="text-slate-400 w-24 inline-block">配重需求</span> {((b.weights?.w1||0)*1 + (b.weights?.w2||0)*2 + (b.weights?.w25||0)*2.5 + (b.weights?.w3||0)*3)} kg</p>
                </div>
                <div className="space-y-2">
                   <p className="font-bold text-slate-700 border-b pb-1">預約配置與選修</p>
                   <p><span className="text-slate-400 w-24 inline-block">住宿</span> {b.accOption === 'trip' ? '依潛旅安排' : b.accOption === 'included' ? '內附背包床' : b.accOption === 'upgrade' ? `升級房型` : b.accOption === 'release' ? '釋出床位' : '自理'}</p>
                   {b.selectedElectives?.length > 0 && <p className="flex items-start mt-1"><span className="text-slate-400 w-24 inline-block shrink-0">選修加購</span> <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">{b.selectedElectives.map(e=>e.name).join('、')}</span></p>}
                   {b.certFee > 0 && <p className="mt-1"><span className="text-slate-400 w-24 inline-block">簽證費用</span> <span className="font-bold">+{b.certFee} ({b.certSystem})</span></p>}
                   <p className="mt-1"><span className="text-slate-400 w-24 inline-block">裝備租借</span> {b.rentals?.length > 0 ? b.rentals.map(r => typeof r === 'string' ? String(r) : `${String(r?.name || '未知')}(${String(r?.size || 'F')})`).join(', ') : '無/自備'}</p>
                   {b.useLocalShopEq && <p className="text-indigo-600 font-bold">※ 使用潛旅當地潛店裝備</p>}
                </div>
                <div className="col-span-1 md:col-span-2 mt-2">
                   <p className="font-bold text-slate-700 border-b pb-1 mb-2">個人潛水經驗</p>
                   {b.divingExperience ? (
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <p><span className="text-slate-400 w-24 inline-block">證照級別</span> {b.divingExperience.certSystem} / {b.divingExperience.certLevel}</p>
                        <p><span className="text-slate-400 w-24 inline-block">總潛水支數</span> {b.divingExperience.loggedDives ? `${b.divingExperience.loggedDives} 支` : '未填寫'}</p>
                        <p className="md:col-span-2"><span className="text-slate-400 w-24 inline-block">特殊專長</span> {b.divingExperience.specialties?.length > 0 ? b.divingExperience.specialties.join('、') : '無'}</p>
                        {b.divingExperience.personalNotes && <p className="md:col-span-2 mt-2 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm"><span className="font-bold text-slate-400 block mb-1">備註提醒：</span>{b.divingExperience.personalNotes}</p>}
                     </div>
                   ) : <p className="text-slate-400 text-sm font-bold">無紀錄資料</p>}
                </div>
                <div className="col-span-1 md:col-span-2 mt-2">
                   <p className="font-bold text-slate-700 border-b pb-1 mb-2">健康聲明與風險評估</p>
                   {b.hasMedicalIssue ? (
                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                         <p className="font-bold text-rose-800 mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> 需注意之健康狀況：</p>
                         <ul className="text-rose-700 text-sm space-y-1 pl-6 list-disc font-medium">
                           {(b.medicalIssues || []).map((issue, idx) => <li key={idx} className={issue.startsWith('↳') ? 'list-none -ml-4 text-rose-600 text-xs mt-1 mb-2' : ''}>{issue}</li>)}
                         </ul>
                      </div>
                   ) : b.medicalAnswers ? (
                      <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-green-700 text-sm font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5"/> 評估皆為正常 (無勾選「是」之項目)</div>
                   ) : <p className="text-slate-400 text-sm font-bold">無紀錄資料</p>}
                </div>
              </>
            )}
            {type === 'accommodation' && (
               <div className="col-span-2 space-y-2">
                  <p className="font-bold text-slate-700 border-b border-slate-100 pb-1">入住預約明細</p>
                  <p><span className="text-slate-400 w-24 inline-block">入住日期</span> <span className="font-black text-blue-600">{String(b.details?.checkIn || '')}</span></p>
                  <p><span className="text-slate-400 w-24 inline-block">預訂明細</span> <span className="font-black">{String(b.details?.nights || 1)} 晚 / {String(b.details?.roomCount || 1)} 間 / 共 {String(b.details?.guests || 1)} 人</span></p>
                  
                  {b.details?.cart && b.details.cart.length > 0 && (
                     <div className="mt-2 space-y-1">
                        {b.details.cart.map((c, i) => (
                           <div key={i} className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 font-bold text-slate-600">
                              <span className="text-slate-800">{c.room?.name || '未知房型'}</span> × {c.roomCount} 間
                              {c.isDorm ? '' : <span className="ml-2 text-blue-600">({c.ruleName || `${c.guestsPerRoom}人方案`})</span>}
                           </div>
                        ))}
                     </div>
                  )}

                  {b.details?.courseDeductTotal > 0 && (
                     <p className="mt-2 pt-2 border-t border-slate-50 flex items-start">
                        <span className="text-amber-500 w-24 inline-block font-bold shrink-0 mt-0.5">課程折抵</span> 
                        <span className="font-black text-amber-600 bg-amber-50 px-2 py-1 rounded shadow-sm">申請 {b.details.courseStudents} 位同行學員升級，共可折抵 NT$ {b.details.courseDeductTotal}</span>
                     </p>
                  )}
               </div>
            )}
            {type === 'equipment' && (
              <div className="col-span-2 space-y-4">
                 <div className="flex gap-6 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <div><span className="text-xs font-bold text-slate-400 block mb-0.5">取件日期</span><span className="font-bold text-slate-800">{b.details?.date || '-'}</span></div>
                   <div><span className="text-xs font-bold text-slate-400 block mb-0.5">租借天數</span><span className="font-bold text-slate-800">{b.details?.days || 1} 天</span></div>
                 </div>
                 <div>
                   <p className="font-bold text-slate-700 border-b border-slate-100 pb-1 mb-2">租借項目清單</p>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                     {b.rentals?.map((r, idx) => (
                       <div key={idx} className="bg-slate-50 p-2 rounded border flex justify-between text-xs font-bold">
                          <span>{typeof r === 'string' ? String(r) : String(r?.name || '未知')}</span><span className="text-blue-600 font-black">{typeof r === 'string' ? '' : String(r?.size || 'F')}</span>
                       </div>
                     ))}
                   </div>
                 </div>
              </div>
            )}
         </div>
      )}
    </div>
  );
}

function BookingAdminPanel({ db, appId, bookings, type, title }) {
  const typeBookings = bookings.filter(b => b.type === type).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
  
  const handleExport = () => {
    let headers = [];
    let rows = [];

    if (type === 'activity') {
      headers = ['訂單狀態', '報名時間', '活動/課程名稱', '參加者姓名', '聯絡電話', '身分證/護照', '出生年月日', '身高(cm)', '體重(kg)', '總配重(kg)', '預估金額(NT$)', '住宿配套', '選修加購', '裝備需求', '使用當地裝備', '證照系統', '證照等級', '總潛水支數', '特殊專長', '備註提醒'];
      rows = typeBookings.map(b => {
        const weight = ((b.weights?.w1||0)*1 + (b.weights?.w2||0)*2 + (b.weights?.w25||0)*2.5 + (b.weights?.w3||0)*3);
        const eqStr = b.rentals?.length > 0 ? b.rentals.map(r => `${r.name}(${r.size||'F'})`).join('、 ') : '無/自備';
        const accStr = b.accOption === 'trip' ? '依潛旅安排' : b.accOption === 'included' ? '維持背包房床位' : b.accOption === 'upgrade' ? '升級獨立房型' : b.accOption === 'release' ? '釋出床位' : '住宿自理';
        const electivesStr = b.selectedElectives?.length > 0 ? b.selectedElectives.map(e=>e.name).join('、 ') : '無';
        const statusStr = b.status === 'confirmed' ? '已確認' : b.status === 'cancelled' ? '已取消' : '待審核';
        const exp = b.divingExperience || {};
        const specStr = exp.specialties?.length > 0 ? exp.specialties.join('、') : '無';
        return [statusStr, formatTs(b.timestamp), b.itemName || '', `${b.name||''} ${b.nickname ? '('+b.nickname+')' : ''}`, b.phone || '', b.idNumber || '', b.birthday || '', b.height || '', b.weight || '', weight, b.price || 0, accStr, electivesStr, eqStr, b.useLocalShopEq ? '是' : '否', exp.certSystem || '', exp.certLevel || '', exp.loggedDives || '', specStr, exp.personalNotes || ''];
      });
    } else if (type === 'accommodation') {
      headers = ['訂單狀態', '提交時間', '預訂房型', '預訂人姓名', '聯絡電話', '入住日期', '預訂晚數', '預訂房間數', '入住人數', '課程升級折抵'];
      rows = typeBookings.map(b => {
        const statusStr = b.status === 'confirmed' ? '已確認' : b.status === 'cancelled' ? '已取消' : '待審核';
        const deductStr = b.details?.courseDeductTotal > 0 ? `${b.details.courseStudents}人, 折$${b.details.courseDeductTotal}` : '無';
        return [statusStr, formatTs(b.timestamp), b.itemName || '', b.details?.name || '', b.details?.phone || '', b.details?.checkIn || '', b.details?.nights || 1, b.details?.roomCount || 1, b.details?.guests || 1, deductStr];
      });
    } else if (type === 'equipment') {
      headers = ['訂單狀態', '提交時間', '租借人姓名', '聯絡電話', '取件日期', '租借天數', '總計金額(NT$)', '租借項目清單'];
      rows = typeBookings.map(b => {
        const eqStr = b.rentals?.length > 0 ? b.rentals.map(r => `${r.name}(${r.size||'F'})`).join('、 ') : '';
        const statusStr = b.status === 'confirmed' ? '已確認' : b.status === 'cancelled' ? '已取消' : '待審核';
        return [statusStr, formatTs(b.timestamp), b.name || '', b.phone || '', b.details?.date || '', b.details?.days || 1, b.price || 0, eqStr];
      });
    }
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    exportToCSV(`${title}_${dateStr}.csv`, [headers, ...rows]);
  };

  return (
     <div className="h-full flex flex-col animate-in fade-in">
       <div className="p-6 border-b bg-slate-50 shrink-0 rounded-t-2xl flex justify-between items-center">
         <div>
           <h3 className="text-xl font-bold text-slate-800">{String(title)}</h3>
           <p className="text-slate-500 text-sm mt-1">處理顧客提交之預約單</p>
         </div>
         {typeBookings.length > 0 && (
           <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-green-700 transition-colors">
             <Download className="w-4 h-4" /> 匯出 EXCEL
           </button>
         )}
       </div>
       <div className="p-6 flex-1 overflow-y-auto bg-slate-50/20">
         {typeBookings.length === 0 ? <div className="text-center py-16 text-slate-400 border-2 border-dashed rounded-2xl font-bold">目前無相關紀錄</div> : typeBookings.map(b => <BookingCard key={b.id} booking={b} type={type} db={db} appId={appId} />)}
       </div>
     </div>
  );
}

// --------------------------------------------------------
// 房型與定價管理模組 (動態計價方案引擎)
// --------------------------------------------------------
function RoomManageModal({ db, appId, room, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initData = useMemo(() => {
    if (room) return { ...room, pricingRules: room.pricingRules || [] };
    return {
      name: '', quantity: 1, bedCount: 2, isDorm: false,
      priceLowWeekday: 0, priceLowWeekend: 0, pricePeakWeekday: 0, pricePeakWeekend: 0, priceHoliday: 0,
      pricingRules: []
    };
  }, [room]);

  const [f, setF] = useState(initData);
  useEffect(() => { setF(initData); }, [initData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isSubmitting) return;

    if (!f.isDorm && (!f.pricingRules || f.pricingRules.length === 0)) {
        alert('請至少新增一個「計價方案」！'); return;
    }

    setIsSubmitting(true);
    try {
      const dataToSave = {
         ...f, quantity: parseInt(f.quantity) || 1, bedCount: parseInt(f.bedCount) || 1,
         priceLowWeekday: parseInt(f.priceLowWeekday) || 0, priceLowWeekend: parseInt(f.priceLowWeekend) || 0,
         pricePeakWeekday: parseInt(f.pricePeakWeekday) || 0, pricePeakWeekend: parseInt(f.pricePeakWeekend) || 0,
         priceHoliday: parseInt(f.priceHoliday) || 0,
      };
      
      delete dataToSave.lessPersonDiscount; delete dataToSave.lessPersonDiscountLowWeekday; delete dataToSave.lessPersonDiscountLowWeekend;
      delete dataToSave.lessPersonDiscountPeakWeekday; delete dataToSave.lessPersonDiscountPeakWeekend;
      delete dataToSave.priceExtraBed; delete dataToSave.priceExtraBedLowWeekday; delete dataToSave.priceExtraBedLowWeekend;
      delete dataToSave.priceExtraBedPeakWeekday; delete dataToSave.priceExtraBedPeakWeekend; delete dataToSave.maxExtraBeds;

      if (room) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accommodations', room.id), dataToSave);
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'accommodations'), dataToSave);
      onClose();
    } catch (err) { alert("儲存失敗"); setIsSubmitting(false); }
  };

  const addPricingRule = () => {
      setF({...f, pricingRules: [...(f.pricingRules || []), { id: Date.now() + Math.random(), name: '新方案', guests: f.bedCount || 2, extraBeds: 0, prices: { lowWeekday: 0, lowWeekend: 0, peakWeekday: 0, peakWeekend: 0, holiday: 0 } }]});
  };

  // 👉 新增：一鍵帶入雙人房公版方案
  const applyTemplateDouble = () => {
      setF({
          ...f,
          name: f.name || '豪華雙人房 (可加沙發床)', quantity: f.quantity || 1, bedCount: 2, isDorm: false,
          pricingRules: [
              { id: Date.now() + 1, name: '1人入住', guests: 1, extraBeds: 0, prices: { lowWeekday: 1800, lowWeekend: 2200, peakWeekday: 2500, peakWeekend: 2800, holiday: 3200 } },
              { id: Date.now() + 2, name: '2人入住', guests: 2, extraBeds: 0, prices: { lowWeekday: 2200, lowWeekend: 2800, peakWeekday: 3200, peakWeekend: 3600, holiday: 4000 } },
              { id: Date.now() + 3, name: '3人入住 (含1加床)', guests: 3, extraBeds: 1, prices: { lowWeekday: 2800, lowWeekend: 3400, peakWeekday: 3800, peakWeekend: 4200, holiday: 4600 } }
          ]
      });
  };

  // 👉 新增：一鍵帶入四人房公版方案
  const applyTemplateQuad = () => {
      setF({
          ...f,
          name: f.name || '家庭四人房 (可加沙發床)', quantity: f.quantity || 1, bedCount: 4, isDorm: false,
          pricingRules: [
              { id: Date.now() + 1, name: '2人入住', guests: 2, extraBeds: 0, prices: { lowWeekday: 3200, lowWeekend: 3800, peakWeekday: 4200, peakWeekend: 4800, holiday: 5200 } },
              { id: Date.now() + 2, name: '3人入住', guests: 3, extraBeds: 0, prices: { lowWeekday: 3800, lowWeekend: 4400, peakWeekday: 4800, peakWeekend: 5400, holiday: 5800 } },
              { id: Date.now() + 3, name: '3人入住 (含1加床)', guests: 3, extraBeds: 1, prices: { lowWeekday: 4400, lowWeekend: 5000, peakWeekday: 5400, peakWeekend: 6000, holiday: 6400 } },
              { id: Date.now() + 4, name: '4人入住', guests: 4, extraBeds: 0, prices: { lowWeekday: 4400, lowWeekend: 5000, peakWeekday: 5400, peakWeekend: 6000, holiday: 6400 } },
              { id: Date.now() + 5, name: '5人入住 (含1加床)', guests: 5, extraBeds: 1, prices: { lowWeekday: 5000, lowWeekend: 5600, peakWeekday: 6000, peakWeekend: 6600, holiday: 7000 } }
          ]
      });
  };

  const updateRule = (id, field, value, isPrice = false) => {
      const newRules = f.pricingRules.map(r => {
          if (r.id === id) {
              if (isPrice) return { ...r, prices: { ...r.prices, [field]: value === '' ? '' : Math.max(0, parseInt(value)) } };
              else if (field === 'name') return { ...r, [field]: value };
              else return { ...r, [field]: value === '' ? '' : Math.max(0, parseInt(value)) };
          }
          return r;
      });
      setF({ ...f, pricingRules: newRules });
  };

  const deleteRule = (id) => setF({ ...f, pricingRules: f.pricingRules.filter(r => r.id !== id) });

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl p-8 shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Settings className="w-6 h-6 text-blue-600"/> 房型與動態計價方案設定</h2>
            <button onClick={onClose} disabled={isSubmitting} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4">
             <FormInput label="房型/床位名稱" required value={f.name} onChange={v => setF({ ...f, name: v })} placeholder="例如：背包客房 或 豪華四人房" />
             <label className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl cursor-pointer shadow-sm hover:bg-indigo-100 transition-colors">
                <input type="checkbox" checked={f.isDorm || false} onChange={e => setF({...f, isDorm: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
                <div>
                  <span className="font-black text-indigo-900 block text-sm">此為背包房 / 青旅模式 (以「單一床位」計價)</span>
                  <span className="text-xs font-bold text-indigo-600 mt-1 block">若啟用，下方只需設定單一床位的淡旺季價格。顧客預訂將直接以「床位」為計算單位。</span>
                </div>
             </label>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
               <FormInput label="實體房間數量 (間)" required type="number" value={f.quantity} onChange={v => setF({ ...f, quantity: v === '' ? '' : Math.max(1, parseInt(v)) })} />
               <FormInput label={f.isDorm ? "每間床位數" : "標準容納人數 (不含加床)"} required type="number" value={f.bedCount} onChange={v => setF({ ...f, bedCount: v === '' ? '' : Math.max(1, parseInt(v)) })} />
             </div>
          </div>

          {f.isDorm ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                   <h4 className="font-black text-blue-800 text-sm flex items-center gap-2 border-b border-blue-100 pb-2"><CalendarDays className="w-4 h-4"/> 單一床位：淡季價格設定 (Low Season)</h4>
                   <div className="grid grid-cols-2 gap-4">
                     <FormInput label="平日單價" required type="number" value={f.priceLowWeekday} onChange={v => setF({ ...f, priceLowWeekday: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                     <FormInput label="假日單價" required type="number" value={f.priceLowWeekend} onChange={v => setF({ ...f, priceLowWeekend: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                   </div>
                </div>
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-4">
                   <h4 className="font-black text-amber-800 text-sm flex items-center gap-2 border-b border-amber-100 pb-2"><Waves className="w-4 h-4"/> 單一床位：旺季價格設定 (Peak Season)</h4>
                   <div className="grid grid-cols-2 gap-4">
                     <FormInput label="平日單價" required type="number" value={f.pricePeakWeekday} onChange={v => setF({ ...f, pricePeakWeekday: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                     <FormInput label="假日單價" required type="number" value={f.pricePeakWeekend} onChange={v => setF({ ...f, pricePeakWeekend: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                   </div>
                </div>
                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 space-y-4">
                   <h4 className="font-black text-rose-800 text-sm flex items-center gap-2 border-b border-rose-100 pb-2"><Info className="w-4 h-4"/> 單一床位：特殊連假設定 (Holidays)</h4>
                   <div className="grid grid-cols-1 gap-4"><FormInput label="連假每晚收費" required type="number" value={f.priceHoliday} onChange={v => setF({ ...f, priceHoliday: v === '' ? '' : Math.max(0, parseInt(v)) })} /></div>
                </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-3 mb-4 gap-3">
                    <h4 className="font-black text-lg text-slate-800 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-600"/> 動態計價方案 (Smart Pricing Rules)</h4>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={applyTemplateDouble} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 shadow-sm">帶入: 雙人房(1~3人)</button>
                        <button type="button" onClick={applyTemplateQuad} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 shadow-sm">帶入: 四人房(2~5人)</button>
                        <button type="button" onClick={addPricingRule} className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">+ 新增空方案</button>
                    </div>
                </div>
                
                <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-xl text-sm font-bold text-blue-800 mb-4 flex items-start gap-2 shadow-sm">
                    <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                    <div>
                        <p>請為此房型設定不同的入住人數對應的**「整間房總價」**。系統將在前台為顧客直接顯示符合人數的報價。</p>
                        <p className="text-blue-600 mt-1 text-xs">您可直接點擊上方的「帶入」按鈕，快速建立標準的折抵與加床方案！</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {(f.pricingRules || []).map((rule, idx) => (
                        <div key={rule.id} className="bg-white border-2 border-slate-100 hover:border-blue-300 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors relative group">
                            <button type="button" onClick={() => deleteRule(rule.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 bg-slate-50 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4"/></button>
                            <div className="flex items-center gap-2 mb-4 pr-10">
                                <span className="bg-blue-600 text-white text-xs font-black px-2 py-0.5 rounded shadow-sm shrink-0">方案 {idx + 1}</span>
                                <input type="text" required value={rule.name} onChange={e => updateRule(rule.id, 'name', e.target.value)} placeholder="方案名稱 (例: 2人入住價位)" className="flex-1 p-2 border-b border-dashed border-slate-300 font-bold text-slate-800 outline-none focus:border-blue-500 bg-transparent text-sm" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-7 gap-3 items-end">
                                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase">總入住人數</label><div className="relative"><User className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="number" min="1" required value={rule.guests} onChange={e => updateRule(rule.id, 'guests', e.target.value)} className="w-full p-2.5 pl-8 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500 text-center" /></div></div>
                                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase">其中含加床數</label><div className="relative"><Plus className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="number" min="0" required value={rule.extraBeds} onChange={e => updateRule(rule.id, 'extraBeds', e.target.value)} className="w-full p-2.5 pl-8 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500 text-center" /></div></div>
                                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-1 rounded block text-center">淡季平日 $</label><input type="number" min="0" required value={rule.prices?.lowWeekday ?? ''} onChange={e => updateRule(rule.id, 'lowWeekday', e.target.value, true)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500 text-right" /></div>
                                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-1 rounded block text-center">淡季假日 $</label><input type="number" min="0" required value={rule.prices?.lowWeekend ?? ''} onChange={e => updateRule(rule.id, 'lowWeekend', e.target.value, true)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500 text-right" /></div>
                                <div className="space-y-1.5"><label className="text-[10px] font-black text-amber-600 uppercase bg-amber-50 px-1 rounded block text-center">旺季平日 $</label><input type="number" min="0" required value={rule.prices?.peakWeekday ?? ''} onChange={e => updateRule(rule.id, 'peakWeekday', e.target.value, true)} className="w-full p-2.5 border border-amber-300 rounded-lg text-sm font-bold outline-none focus:border-amber-500 text-right" /></div>
                                <div className="space-y-1.5"><label className="text-[10px] font-black text-amber-600 uppercase bg-amber-50 px-1 rounded block text-center">旺季假日 $</label><input type="number" min="0" required value={rule.prices?.peakWeekend ?? ''} onChange={e => updateRule(rule.id, 'peakWeekend', e.target.value, true)} className="w-full p-2.5 border border-amber-300 rounded-lg text-sm font-bold outline-none focus:border-amber-500 text-right" /></div>
                                <div className="space-y-1.5 md:col-span-1 col-span-2"><label className="text-[10px] font-black text-rose-600 uppercase bg-rose-50 px-1 rounded block text-center">連續假期 $</label><input type="number" min="0" required value={rule.prices?.holiday ?? ''} onChange={e => updateRule(rule.id, 'holiday', e.target.value, true)} className="w-full p-2.5 border border-rose-300 rounded-lg text-sm font-bold outline-none focus:border-rose-500 text-right" /></div>
                            </div>
                        </div>
                    ))}
                    {(!f.pricingRules || f.pricingRules.length === 0) && (
                        <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2"/>
                            <p className="text-sm font-bold text-slate-500">尚無計價方案，顧客將無法預訂此房型。</p>
                        </div>
                    )}
                </div>
            </div>
          )}
        </form>
        
        <div className="flex gap-4 pt-6 border-t mt-6 shrink-0">
           <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-4 bg-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50">取消返回</button>
           <button onClick={handleSubmit} disabled={isSubmitting} className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-black shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
             {isSubmitting ? '處理中...' : '儲存房型資訊'}
           </button>
        </div>
      </div>
    </div>
  );
}

function CalendarDateModal({ dateStr, sysConfig, onSave, onClose }) {
  const [isFull, setIsFull] = useState((sysConfig.fullDates || []).includes(dateStr));
  const [isHoliday, setIsHoliday] = useState((sysConfig.specialHolidays || []).includes(dateStr));
  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
        <p className="text-slate-500 text-sm font-bold mb-1">單日狀態編輯</p>
        <h4 className="text-2xl font-bold mb-6 text-slate-900">{dateStr}</h4>
        <div className="space-y-3">
          <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${isFull ? 'bg-red-50 border-red-400 text-red-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
            <span className="font-bold">設為「滿房停售」</span>
            <input type="checkbox" className="hidden" checked={isFull} onChange={e => setIsFull(e.target.checked)} />
            {isFull ? <CheckCircle className="w-5 h-5 text-red-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
          </label>
          <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${isHoliday ? 'bg-rose-50 border-rose-400 text-rose-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
            <span className="font-bold">標記為「連假」</span>
            <input type="checkbox" className="hidden" checked={isHoliday} onChange={e => setIsHoliday(e.target.checked)} />
            {isHoliday ? <CheckCircle className="w-5 h-5 text-rose-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
          </label>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t"><button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">取消</button><button onClick={() => onSave(dateStr, isFull, isHoliday)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors">確認更新</button></div>
      </div>
    </div>
  );
}

function AccommodationAdminPanel({ db, appId, accommodations, sysConfig, saveSysConfig, subTab, setSubTab }) {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [localHolidays, setLocalHolidays] = useState([]);
  const [isSubmittingHolidays, setIsSubmittingHolidays] = useState(false);

  useEffect(() => { setLocalHolidays(sysConfig.holidayRanges || []); }, [sysConfig.holidayRanges]);

  const handleSaveHolidays = async () => {
    setIsSubmittingHolidays(true);
    const validHolidays = localHolidays.filter(h => h.name.trim() || h.start || h.end);
    await saveSysConfig({ ...sysConfig, holidayRanges: validHolidays });
    setIsSubmittingHolidays(false);
  };

  const loadDefaultHolidays = () => {
    const defaults = ['元旦連假', '春節連假', '和平紀念日連假', '清明節及兒童節連假', '勞動節連假', '端午節連假', '中秋節連假', '教師節連假', '國慶日連假', '光復節連假', '行憲紀念日連假'];
    const newHolidays = defaults.map((name, i) => ({ id: Date.now() + i, name, start: '', end: '' }));
    setLocalHolidays([...localHolidays, ...newHolidays]);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); 
  const calendarCells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const getDateStatus = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month, day);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const currentM = month + 1;
    const pS = parseInt(sysConfig.peakSeasonStart || '05');
    const pE = parseInt(sysConfig.peakSeasonEnd || '10');
    const isPeak = pS <= pE ? (currentM >= pS && currentM <= pE) : (currentM >= pS || currentM <= pE);
    
    let isHoliday = (sysConfig.specialHolidays || []).includes(dateStr);
    if (!isHoliday && sysConfig.holidayRanges) {
      for (const r of sysConfig.holidayRanges) {
        if (dateStr >= r.start && dateStr <= r.end) { isHoliday = true; break; }
      }
    }
    
    return { dateStr, isWeekend, isPeak, isHoliday, isFull: (sysConfig.fullDates || []).includes(dateStr) };
  };

  const saveDateStatus = (dateStr, isFull, isHoliday) => {
    let fD = [...(sysConfig.fullDates || [])];
    let sH = [...(sysConfig.specialHolidays || [])];
    if (isFull) { if (!fD.includes(dateStr)) fD.push(dateStr); } else { fD = fD.filter(d => d !== dateStr); }
    if (isHoliday) { if (!sH.includes(dateStr)) sH.push(dateStr); } else { sH = sH.filter(d => d !== dateStr); }
    saveSysConfig({ ...sysConfig, fullDates: fD, specialHolidays: sH });
    setIsDateModalOpen(false);
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm("確定要刪除此房型嗎？此動作無法復原。")) {
       try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accommodations', id)); }
       catch (e) { alert("刪除失敗"); }
    }
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-2">
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex gap-2 overflow-x-auto rounded-t-2xl">
         <SubTabBtn active={subTab === 'rooms'} onClick={() => setSubTab('rooms')} label="房型及價格設定" />
         <SubTabBtn active={subTab === 'calendar'} onClick={() => setSubTab('calendar')} label="營運狀態與月曆" />
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        {subTab === 'rooms' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
             <button onClick={() => { setEditingRoom(null); setIsRoomModalOpen(true); }} className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black hover:border-blue-400 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-3">
                <Plus className="w-8 h-8" /> 新增房型與方案
             </button>
             {accommodations.map(room => (
               <div key={room.id} className="bg-white border border-slate-200 p-6 rounded-3xl group relative shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => { setEditingRoom(room); setIsRoomModalOpen(true); }} className="p-2 bg-slate-100 rounded-xl hover:bg-blue-600 hover:text-white transition-colors shadow-sm"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteRoom(room.id)} className="p-2 bg-slate-100 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  
                  <h4 className="font-black text-slate-900 text-xl mb-4 pr-16">
                    {String(room.name)}
                    {room.isDorm && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg ml-2 align-middle shadow-sm font-bold">背包床位計價</span>}
                  </h4>
                  
                  <div className="flex justify-between text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                     <span>實體房間數: {room.quantity} 間</span>
                     <span>標準容納人數: {room.bedCount||1} 人</span>
                  </div>

                  {room.isDorm ? (
                      <div className="grid grid-cols-2 gap-3 text-xs font-bold mb-2">
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-slate-400 mb-1 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5"/>淡季 (平/假)</p>
                            <p className="text-slate-700 text-sm">${room.priceLowWeekday} / ${room.priceLowWeekend}</p>
                         </div>
                         <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                            <p className="text-amber-600 mb-1 flex items-center gap-1"><Waves className="w-3.5 h-3.5"/>旺季 (平/假)</p>
                            <p className="text-amber-800 text-sm">${room.pricePeakWeekday} / ${room.pricePeakWeekend}</p>
                         </div>
                      </div>
                  ) : (
                      <div className="space-y-2 mt-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                         {room.pricingRules && room.pricingRules.length > 0 ? (
                             room.pricingRules.map((rule) => (
                                 <div key={rule.id} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm hover:border-blue-200 transition-colors">
                                     <div className="flex justify-between items-center mb-1.5">
                                        <span className="font-black text-slate-800 text-sm">{rule.name} <span className="text-slate-500 font-bold text-xs ml-1">({rule.guests}人入住)</span></span>
                                        {rule.extraBeds > 0 && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-black">含 {rule.extraBeds} 加床</span>}
                                     </div>
                                     <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold text-slate-500 bg-slate-50 p-1.5 rounded-md border border-slate-100">
                                        <div>淡平<br/><span className="text-slate-800 text-xs">${rule.prices?.lowWeekday}</span></div>
                                        <div>淡假<br/><span className="text-slate-800 text-xs">${rule.prices?.lowWeekend}</span></div>
                                        <div>旺平<br/><span className="text-amber-700 text-xs">${rule.prices?.peakWeekday}</span></div>
                                        <div>旺假<br/><span className="text-amber-700 text-xs">${rule.prices?.peakWeekend}</span></div>
                                        <div>連假<br/><span className="text-rose-700 text-xs">${rule.prices?.holiday}</span></div>
                                     </div>
                                 </div>
                             ))
                         ) : (
                             <div className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
                                 <AlertTriangle className="w-4 h-4"/> 舊版資料或尚未設定計價方案，請點擊編輯新增
                             </div>
                         )}
                      </div>
                  )}
               </div>
             ))}
          </div>
        ) : (
          <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <ControlPanelCard title="活動搭配住宿優惠設定">
                 <div className="space-y-4">
                   <div className="flex p-1 bg-slate-100 rounded-lg">
                     <button onClick={()=>saveSysConfig({...sysConfig, accDiscountType:'percent'})} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${sysConfig.accDiscountType==='percent'?'bg-white shadow text-blue-600':'text-slate-500'}`}>成數折扣</button>
                     <button onClick={()=>saveSysConfig({...sysConfig, accDiscountType:'fixed'})} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${sysConfig.accDiscountType==='fixed'?'bg-white shadow text-blue-600':'text-slate-500'}`}>金額折抵</button>
                   </div>
                   <div className="flex items-center gap-3">
                     <input type="number" value={sysConfig.accDiscountValue ?? ''} onChange={e=>saveSysConfig({...sysConfig, accDiscountValue: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value))})} className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-center outline-none focus:border-blue-500" />
                     <span className="font-bold text-slate-600 text-sm shrink-0">{sysConfig.accDiscountType==='percent'?'% (例 90為九折)':'元 / 晚'}</span>
                   </div>
                 </div>
               </ControlPanelCard>
               <ControlPanelCard title="全館旺季月份定義">
                 <div className="flex items-center gap-3 h-full pb-2">
                   <select value={sysConfig.peakSeasonStart || '05'} onChange={e=>saveSysConfig({...sysConfig, peakSeasonStart: e.target.value})} className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm font-bold bg-white outline-none focus:border-amber-500">
                     {Array.from({length:12}, (_,i)=>String(i+1).padStart(2,'0')).map(m=><option key={m} value={m}>{parseInt(m)} 月開始</option>)}
                   </select>
                   <span className="text-slate-500">~</span>
                   <select value={sysConfig.peakSeasonEnd || '10'} onChange={e=>saveSysConfig({...sysConfig, peakSeasonEnd: e.target.value})} className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm font-bold bg-white outline-none focus:border-amber-500">
                     {Array.from({length:12}, (_,i)=>String(i+1).padStart(2,'0')).map(m=><option key={m} value={m}>{parseInt(m)} 月結束</option>)}
                   </select>
                 </div>
               </ControlPanelCard>
               <div className="lg:col-span-2">
                 <ControlPanelCard title="特殊連假區間設定">
                   <div className="flex justify-between items-start sm:items-center mb-4 flex-col sm:flex-row gap-3">
                     <p className="text-xs text-slate-500 font-bold">可直接調整連假區間，或修改名稱以合併假期</p>
                     <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={loadDefaultHolidays} className="flex-1 sm:flex-none text-xs bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors shadow-sm whitespace-nowrap">載入預設清單</button>
                        <button disabled={isSubmittingHolidays} onClick={handleSaveHolidays} className="flex-1 sm:flex-none text-xs bg-green-600 text-white px-3 py-2 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap">{isSubmittingHolidays ? '儲存中...' : '儲存變更'}</button>
                     </div>
                   </div>
                   <div className="space-y-4">
                     <div className="max-h-[350px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                       {localHolidays.map((hr, idx) => (
                         <div key={hr.id} className="flex flex-col lg:flex-row lg:items-center bg-slate-50 p-3 rounded-xl border border-slate-200 gap-3 hover:border-blue-300 transition-colors">
                           <input type="text" value={hr.name} onChange={e => {
                              const newH = [...localHolidays];
                              newH[idx].name = e.target.value;
                              setLocalHolidays(newH);
                           }} placeholder="連假名稱 (例: 春節連假)" className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                           <div className="flex gap-2 items-center justify-between lg:justify-end">
                              <input type="date" value={hr.start} onChange={e => {
                                 const newH = [...localHolidays];
                                 newH[idx].start = e.target.value;
                                 setLocalHolidays(newH);
                              }} className="w-full sm:w-[135px] p-2.5 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                              <span className="text-slate-400 font-bold">~</span>
                              <input type="date" value={hr.end} onChange={e => {
                                 const newH = [...localHolidays];
                                 newH[idx].end = e.target.value;
                                 setLocalHolidays(newH);
                              }} className="w-full sm:w-[135px] p-2.5 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                              <button onClick={() => setLocalHolidays(localHolidays.filter(r => r.id !== hr.id))} className="text-slate-400 hover:text-red-500 p-2.5 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm shrink-0"><Trash2 className="w-4 h-4"/></button>
                           </div>
                         </div>
                       ))}
                       {localHolidays.length === 0 && <p className="text-xs text-slate-400 text-center py-8 border-2 border-dashed border-slate-200 rounded-xl font-bold">尚無連假設定，請點擊「載入預設清單」或新增</p>}
                     </div>
                     <div className="pt-3 border-t border-slate-100">
                       <button onClick={() => setLocalHolidays([...localHolidays, { id: Date.now(), name: '', start: '', end: '' }])} className="w-full py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-sm">+ 新增自訂連假區間</button>
                     </div>
                   </div>
                 </ControlPanelCard>
               </div>
             </div>
             
             <div className="bg-white border rounded-2xl p-6 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <div className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-blue-600"/><h4 className="font-bold text-slate-800">月曆狀態總覽</h4></div>
                   <div className="flex items-center gap-4">
                     <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 bg-white rounded-lg border hover:bg-slate-100 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                     <span className="font-bold text-lg text-slate-800">{year} 年 {month + 1} 月</span>
                     <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 bg-white rounded-lg border hover:bg-slate-100 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                   </div>
                </div>
                
                <div className="p-3 mb-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded-sm"></div> 滿房停售</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-rose-50 border border-rose-200 rounded-sm"></div> 連假</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded-sm"></div> 旺季</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded-sm"></div> 週末假日</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-slate-200 rounded-sm"></div> 淡季平日</div>
                  <div className="text-slate-400 ml-auto hidden sm:block">※ 點擊日期可單獨設定狀態</div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                  {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="bg-slate-100 py-3 text-center text-sm font-black text-slate-500 uppercase tracking-widest">{d}</div>)}
                  {calendarCells.map((day, i) => {
                    if (!day) return <div key={i} className="bg-slate-50/50 h-24"></div>;
                    const s = getDateStatus(day);
                    
                    let bgClass = "bg-white hover:bg-blue-50";
                    let textClass = "text-slate-700";
                    let label = "";
                    
                    if (s.isFull) { bgClass = "bg-red-50 hover:bg-red-100"; textClass = "text-red-700"; label = "滿房"; }
                    else if (s.isHoliday) { bgClass = "bg-rose-50 hover:bg-rose-100"; textClass = "text-rose-700"; label = "連假"; }
                    else if (s.isPeak) { bgClass = "bg-amber-50 hover:bg-amber-100"; textClass = "text-amber-700"; label = "旺季"; }
                    else if (s.isWeekend) { bgClass = "bg-slate-100 hover:bg-slate-200"; textClass = "text-slate-800"; label = "假日"; }

                    return (
                      <div key={i} onClick={() => { setSelectedDateStr(s.dateStr); setIsDateModalOpen(true); }} className={`h-24 border-t border-l p-2 flex flex-col items-center cursor-pointer transition-colors ${bgClass}`}>
                        <span className={`text-sm font-bold ${textClass}`}>{day}</span>
                        {label && <span className={`mt-2 text-[10px] font-black px-2 py-0.5 rounded border border-current ${textClass}`}>{label}</span>}
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>
        )}
      </div>
      {isRoomModalOpen && <RoomManageModal db={db} appId={appId} room={editingRoom} onClose={() => setIsRoomModalOpen(false)} />}
      {isDateModalOpen && <CalendarDateModal dateStr={selectedDateStr} sysConfig={sysConfig} onSave={saveDateStatus} onClose={() => setIsDateModalOpen(false)} />}
    </div>
  );
}

function EquipmentManageModal({ editingItem, db, appId, onClose }) {
  const isEdit = !!editingItem;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initData = useMemo(() => {
    if (editingItem) return { ...editingItem, specDetails: editingItem.specDetails || [] };
    return { name: '', category: '重裝備', hasSpecs: false, price: 0, readyQuantity: 1, repairQuantity: 0, specDetails: [] };
  }, [editingItem]);

  const [f, setF] = useState(initData);
  useEffect(() => { setF(initData); }, [initData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isSubmitting) return;
    setIsSubmitting(true);
    try {
      const dataToSave = { ...f, price: parseInt(f.price) || 0, readyQuantity: parseInt(f.readyQuantity) || 0 };
      if (dataToSave.hasSpecs && dataToSave.specDetails) {
         dataToSave.specDetails = dataToSave.specDetails.map(s => ({ ...s, ready: parseInt(s.ready) || 0 }));
      } else { dataToSave.specDetails = []; }
      
      if (isEdit) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'equipments', editingItem.id), dataToSave);
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'equipments'), dataToSave);
      onClose();
    } catch (err) { alert("儲存失敗"); setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in zoom-in-95">
        <h2 className="text-xl font-bold mb-6 text-slate-800">裝備品項設定</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="裝備名稱" required value={f.name} onChange={v => setF({ ...f, name: v })} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">分類</label>
               <select value={f.category} onChange={e=>setF({...f, category: e.target.value})} className="w-full p-3.5 border border-slate-300 rounded-xl font-bold outline-none">
                  <option value="重裝備">重裝備</option><option value="輕裝備">輕裝備</option><option value="其他配件">其他配件</option>
               </select>
            </div>
            <FormInput label="單租價格" required type="number" value={f.price} onChange={v => setF({ ...f, price: v === '' ? '' : Math.max(0, parseInt(v)) })} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input type="checkbox" checked={f.hasSpecs} onChange={e => setF({...f, hasSpecs: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
            <span className="font-bold text-slate-700">此裝備區分尺寸規格</span>
          </label>
          {!f.hasSpecs && <FormInput label="可用庫存數量" required type="number" value={f.readyQuantity} onChange={v => setF({ ...f, readyQuantity: v === '' ? '' : Math.max(0, parseInt(v)) })} />}
          {f.hasSpecs && (
             <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-200 max-h-48 overflow-y-auto">
                <p className="text-sm font-bold text-slate-600">規格庫存管理</p>
                {(f.specDetails || []).map((spec, idx) => (
                   <div key={spec.id || idx} className="flex gap-2 items-center">
                      <input placeholder="規格名稱(如: S, M)" required value={spec.name} onChange={e => { const ns = [...(f.specDetails || [])]; ns[idx] = { ...ns[idx], name: e.target.value }; setF({...f, specDetails: ns}); }} className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500" />
                      <input type="number" placeholder="庫存" required value={spec.ready} onChange={e => { const ns = [...(f.specDetails || [])]; ns[idx] = { ...ns[idx], ready: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)) }; setF({...f, specDetails: ns}); }} className="w-24 p-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500" />
                      <button type="button" onClick={() => setF({...f, specDetails: (f.specDetails || []).filter((_, i) => i !== idx)})} className="text-slate-400 hover:text-red-500 p-2 transition-colors"><Trash2 className="w-5 h-5"/></button>
                   </div>
                ))}
                <button type="button" onClick={() => setF({...f, specDetails: [...(f.specDetails||[]), {id: Date.now() + Math.random(), name: '', ready: 1, repair: 0}]})} className="text-blue-600 text-sm font-bold hover:text-blue-800 transition-colors">+ 新增規格</button>
             </div>
          )}
          <div className="flex gap-4 pt-4 mt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3.5 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50">取消</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? '處理中...' : '儲存'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EquipmentAdminPanel({ db, appId, equipments, sysConfig, saveSysConfig, subTab, setSubTab }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const categories = ['重裝備', '輕裝備', '其他配件'];
  const [packages, setPackages] = useState(sysConfig.equipmentPackages || { heavy: 600, light: 400, full: 1000, studentDiscount: 80, returnCustomerDiscount: 80 });
  const [eqPrices, setEqPrices] = useState({});
  const [isSubmittingPricing, setIsSubmittingPricing] = useState(false);

  useEffect(() => { const prices = {}; equipments.forEach(e => prices[e.id] = e.price || 0); setEqPrices(prices); }, [equipments]);

  const handleSavePricing = async () => {
    if(isSubmittingPricing) return;
    setIsSubmittingPricing(true);
    try {
      const sanitizedPackages = {
         heavy: parseInt(packages.heavy) || 0, light: parseInt(packages.light) || 0, full: parseInt(packages.full) || 0,
         studentDiscount: parseInt(packages.studentDiscount) || 0, returnCustomerDiscount: parseInt(packages.returnCustomerDiscount) || 0
      };
      await saveSysConfig({ ...sysConfig, equipmentPackages: sanitizedPackages });
      const updates = equipments.map(e => eqPrices[e.id] !== undefined ? updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'equipments', e.id), { price: parseInt(eqPrices[e.id]) || 0 }) : null).filter(Boolean);
      await Promise.all(updates);
      alert("儲存成功");
    } catch(e) { alert("儲存失敗"); } finally { setIsSubmittingPricing(false); }
  };

  const updateEqStock = async (item, specId, readyDelta, repairDelta, isRepairDone = false) => {
     try {
        let newData = { ...item };
        if (item.hasSpecs) {
           newData.specDetails = item.specDetails.map(s => {
              if (s.id === specId) {
                 let newReady = (s.ready || 0) + readyDelta;
                 let newRepair = (s.repair || 0) + repairDelta;
                 if (isRepairDone && newRepair > 0) { newRepair -= 1; newReady += 1; }
                 return { ...s, ready: Math.max(0, newReady), repair: Math.max(0, newRepair) };
              }
              return s;
           });
        } else {
           let newReady = (item.readyQuantity || 0) + readyDelta;
           let newRepair = (item.repairQuantity || 0) + repairDelta;
           if (isRepairDone && newRepair > 0) { newRepair -= 1; newReady += 1; }
           newData.readyQuantity = Math.max(0, newReady); newData.repairQuantity = Math.max(0, newRepair);
        }
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'equipments', item.id), newData);
     } catch(e) { alert('更新庫存失敗'); }
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-2 relative">
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex gap-2 overflow-x-auto rounded-t-2xl">
        <SubTabBtn active={subTab === 'inventory'} onClick={() => setSubTab('inventory')} label="庫存管理" />
        <SubTabBtn active={subTab === 'pricing'} onClick={() => setSubTab('pricing')} label="收費設定" />
      </div>
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {subTab === 'inventory' ? (
          <>
             <div className="flex justify-between items-center">
               <h3 className="text-xl font-bold">裝備各規格庫存狀態</h3>
               <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-blue-700 transition-colors">+ 新增品項</button>
             </div>
             {categories.map(cat => {
               const catItems = equipments.filter(e => e.category === cat);
               if (catItems.length === 0) return null;
               return (
                 <div key={cat} className="space-y-1.5">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{cat}</h4>
                   <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      {catItems.map(item => (
                        <div key={item.id} className="flex flex-col px-4 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors gap-3">
                           <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                {String(item.name)} 
                                {item.hasSpecs && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black">分規格</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"><Settings className="w-3.5 h-3.5" /> <span className="hidden sm:inline">屬性設定</span></button>
                                <button type="button" onClick={async () => { if (window.confirm(`確定要刪除「${item.name}」嗎？`)) { try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'equipments', item.id)); } catch (e) { alert("刪除失敗"); } } }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           </div>
                           
                           <div className="flex flex-col gap-2">
                             <div className="hidden sm:flex items-center text-[10px] font-black text-slate-400 px-3 mt-1">
                                <span className="w-24">尺寸 / 規格</span><span className="flex-1 text-center">可用數量</span><span className="flex-1 text-center">維修數量</span><span className="w-16 text-center">操作</span>
                             </div>
                             {item.hasSpecs ? (
                               item.specDetails?.map(spec => (
                                 <div key={spec.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-3 sm:p-2 rounded-xl shadow-sm gap-3 sm:gap-2">
                                   <span className="font-black text-slate-700 text-sm sm:text-xs sm:w-24 truncate border-b border-slate-100 sm:border-0 pb-2 sm:pb-0" title={spec.name}>{spec.name}</span>
                                   <div className="flex items-end sm:items-center justify-between sm:justify-center gap-2 sm:flex-1">
                                     <div className="flex flex-col items-center sm:flex-1">
                                       <span className="text-[10px] font-bold text-slate-400 sm:hidden mb-1">可用數量</span>
                                       <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200">
                                         <button onClick={() => updateEqStock(item, spec.id, -1, 0)} className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded-l-lg sm:rounded-l">-</button>
                                         <span className="text-sm sm:text-xs font-bold w-10 sm:w-8 text-center">{spec.ready || 0}</span>
                                         <button onClick={() => updateEqStock(item, spec.id, 1, 0)} className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded-r-lg sm:rounded-r">+</button>
                                       </div>
                                     </div>
                                     <div className="flex flex-col items-center sm:flex-1">
                                       <span className="text-[10px] font-bold text-slate-400 sm:hidden mb-1">維修數量</span>
                                       <div className="flex items-center bg-rose-50 rounded-lg border border-rose-200">
                                         <button onClick={() => updateEqStock(item, spec.id, 0, -1)} className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-rose-500 hover:bg-rose-200 rounded-l-lg sm:rounded-l">-</button>
                                         <span className="text-sm sm:text-xs font-bold w-10 sm:w-8 text-center text-rose-700">{spec.repair || 0}</span>
                                         <button onClick={() => updateEqStock(item, spec.id, 0, 1)} className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-rose-500 hover:bg-rose-200 rounded-r-lg sm:rounded-r">+</button>
                                       </div>
                                     </div>
                                     <div className="flex flex-col justify-end sm:w-16 shrink-0">
                                       <button onClick={() => updateEqStock(item, spec.id, 0, 0, true)} disabled={!(spec.repair > 0)} className="w-full h-8 sm:h-6 text-xs sm:text-[10px] font-black px-2 rounded-lg sm:rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-center">修妥</button>
                                     </div>
                                   </div>
                                 </div>
                               ))
                             ) : (
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-3 sm:p-2 rounded-xl shadow-sm gap-3 sm:gap-2">
                                   <span className="font-black text-slate-400 text-sm sm:text-xs sm:w-24 truncate border-b border-slate-100 sm:border-0 pb-2 sm:pb-0">單一規格</span>
                                   <div className="flex items-end sm:items-center justify-between sm:justify-center gap-2 sm:flex-1">
                                     <div className="flex flex-col items-center sm:flex-1">
                                       <span className="text-[10px] font-bold text-slate-400 sm:hidden mb-1">可用數量</span>
                                       <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200">
                                         <button onClick={() => updateEqStock(item, null, -1, 0)} className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded-l-lg sm:rounded-l">-</button>
                                         <span className="text-sm sm:text-xs font-bold w-10 sm:w-8 text-center">{item.readyQuantity || 0}</span>
                                         <button onClick={() => updateEqStock(item, null, 1, 0)} className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded-r-lg sm:rounded-r">+</button>
                                       </div>
                                     </div>
                                     <div className="flex flex-col items-center sm:flex-1">
                                       <span className="text-[10px] font-bold text-slate-400 sm:hidden mb-1">維修數量</span>
                                       <div className="flex items-center bg-rose-50 rounded-lg border border-rose-200">
                                         <button onClick={() => updateEqStock(item, null, 0, -1)} className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-rose-500 hover:bg-rose-200 rounded-l-lg sm:rounded-l">-</button>
                                         <span className="text-sm sm:text-xs font-bold w-10 sm:w-8 text-center text-rose-700">{item.repairQuantity || 0}</span>
                                         <button onClick={() => updateEqStock(item, null, 0, 1)} className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-rose-500 hover:bg-rose-200 rounded-r-lg sm:rounded-r">+</button>
                                       </div>
                                     </div>
                                     <div className="flex flex-col justify-end sm:w-16 shrink-0">
                                       <button onClick={() => updateEqStock(item, null, 0, 0, true)} disabled={!(item.repairQuantity > 0)} className="w-full h-8 sm:h-6 text-xs sm:text-[10px] font-black px-2 rounded-lg sm:rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-center">修妥</button>
                                     </div>
                                   </div>
                               </div>
                             )}
                           </div>
                        </div>
                      ))}
                   </div>
                 </div>
               )
             })}
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">收費與優惠設定</h3>
              <button disabled={isSubmittingPricing} onClick={handleSavePricing} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isSubmittingPricing ? '儲存中...' : '儲存定價'}</button>
            </div>
            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 shadow-sm">
              <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2"><LifeBuoy className="w-4 h-4"/> 優惠套裝與折扣設定</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-purple-700">重裝套裝 (NT$)</label><input type="number" value={packages.heavy ?? ''} onChange={e => setPackages({ ...packages, heavy: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)) })} className="w-full p-2.5 border border-purple-200 rounded-lg font-bold bg-white outline-none focus:border-purple-500" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-purple-700">輕裝套裝 (NT$)</label><input type="number" value={packages.light ?? ''} onChange={e => setPackages({ ...packages, light: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)) })} className="w-full p-2.5 border border-purple-200 rounded-lg font-bold bg-white outline-none focus:border-purple-500" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-purple-700">全套裝備 (NT$)</label><input type="number" value={packages.full ?? ''} onChange={e => setPackages({ ...packages, full: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)) })} className="w-full p-2.5 border border-purple-200 rounded-lg font-bold bg-white outline-none focus:border-purple-500" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-purple-700">學生折扣 (%)</label><input type="number" value={packages.studentDiscount ?? ''} onChange={e => setPackages({ ...packages, studentDiscount: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)) })} className="w-full p-2.5 border border-purple-200 rounded-lg font-bold bg-white outline-none focus:border-purple-500" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-purple-700">回客折扣 (%)</label><input type="number" value={packages.returnCustomerDiscount ?? ''} onChange={e => setPackages({ ...packages, returnCustomerDiscount: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)) })} className="w-full p-2.5 border border-purple-200 rounded-lg font-bold bg-white outline-none focus:border-purple-500" /></div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-slate-800 border-b pb-2">單品租借定價</h4>
              {categories.map(cat => {
                const catItems = equipments.filter(e => e.category === cat);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat} className="space-y-1.5">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{cat}</h5>
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      {catItems.map(e => (
                        <div key={e.id} className="flex items-center justify-between px-4 py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <span className="font-bold text-slate-800 text-sm">{String(e.name)}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">NT$</span>
                            <input type="number" value={eqPrices[e.id] ?? ''} onChange={ev => setEqPrices({ ...eqPrices, [e.id]: ev.target.value === '' ? '' : Math.max(0, parseInt(ev.target.value)) })} className="w-20 p-1.5 border border-slate-200 rounded-md text-right font-bold text-sm bg-slate-50 outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      {isModalOpen && <EquipmentManageModal editingItem={editingItem} db={db} appId={appId} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentView, setCurrentView] = useState('home'); 
  const [adminSection, setAdminSection] = useState('book-activities'); 
  const [adminSubTab, setAdminSubTab] = useState('list'); 

  const [bookings, setBookings] = useState([]);
  const [activities, setActivities] = useState([]); 
  const [courseTemplates, setCourseTemplates] = useState([]); 
  const [accommodations, setAccommodations] = useState([]);
  const [equipmentsList, setEquipmentsList] = useState([]);
  const [sysConfig, setSysConfig] = useState({
    title: "鯊墾丁 SHARKENTING", subtitle: "整合課程、住宿與裝備租借，提供您最專業、便利的潛水體驗。", heroBadgeText: "Top-Down Ocean View & Whale Sharks", phoneDiving: "0980-175-777", serviceHoursDiving: "08:00-20:00", phoneAcc: "0987-367-550", line: "@tbj1448p", address: "946屏東縣恆春鎮恆西路33巷123弄5號", transport: "🚄 高鐵左營站搭乘台灣好行至恆春轉運站\n🚗 自行開車前往", peakSeasonStart: '05', peakSeasonEnd: '10', equipmentPackages: { studentDiscount: 80, returnCustomerDiscount: 80 }, coaches: [{id: 1, name: '阿龍教練'}], checkInAcc: '15:00', checkOutAcc: '11:00', adminCode: '0000', accDiscountType: 'fixed', accDiscountValue: 200, defaultServices: DEFAULT_SERVICES, airTankPrice: 800, nitroxTankPrice: 1200
  });

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const hasSeeded = useRef(false);

  const [showAccPromptModal, setShowAccPromptModal] = useState(false);
  const [pendingAccAction, setPendingAccAction] = useState(null); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (u) => { 
        setUser(u); setIsLoading(false); 
        if (u && !u.isAnonymous) {
          const adminDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admins', u.uid));
          setIsAdminMode(adminDoc.exists());
        } else { setIsAdminMode(false); }
    });
    return () => unsubscribe();
  }, []);

  const handleError = (err) => { console.warn("資料庫讀取受限 (Security Rules 阻擋):", err.message); };

  useEffect(() => {
    if (!user) return;
    const unsubB = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'bookings'), (s) => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))), handleError);
    const unsubA = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'activities'), (s) => setActivities(s.docs.map(d => ({ id: d.id, ...d.data() }))), handleError);
    const unsubC = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courseTemplates'), (s) => setCourseTemplates(s.docs.map(d => ({ id: d.id, ...d.data() }))), handleError);
    const unsubAc = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'accommodations'), (s) => setAccommodations(s.docs.map(d => ({ id: d.id, ...d.data() }))), handleError);
    const unsubE = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'equipments'), (s) => setEquipmentsList(s.docs.map(d => ({ id: d.id, ...d.data() }))), handleError);
    const unsubS = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'systemConfig'), (d) => {
       if (d.exists()) {
           const data = d.data();
           if (!data.medicalForm || data.medicalForm.length === 0) data.medicalForm = DEFAULT_MEDICAL_FORM;
           if (data.transport === "高鐵左營站搭乘台灣好行至恆春轉運站、自行開車前往") data.transport = "🚄 高鐵左營站搭乘台灣好行至恆春轉運站\n🚗 自行開車前往";
           if (!data.defaultServices || data.defaultServices.length === 0) data.defaultServices = DEFAULT_SERVICES;
           setSysConfig(prev => ({ ...prev, ...data }));
       }
    }, handleError);
    return () => { unsubB(); unsubA(); unsubC(); unsubAc(); unsubE(); unsubS(); };
  }, [user]);

  useEffect(() => {
    if (!isAdminMode) return; 
    const cleanDuplicates = (list, collectionName, keyFn) => {
      const seen = new Set();
      const duplicates = [];
      list.forEach(item => {
        const key = keyFn(item);
        if (seen.has(key)) duplicates.push(item.id);
        else seen.add(key);
      });
      duplicates.forEach(id => { deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id)).catch(() => {}); });
    };
    if (equipmentsList.length > 0) cleanDuplicates(equipmentsList, 'equipments', eq => `${eq.name}-${eq.category}`);
    if (accommodations.length > 0) cleanDuplicates(accommodations, 'accommodations', acc => acc.name);
    if (courseTemplates.length > 0) cleanDuplicates(courseTemplates, 'courseTemplates', c => c.courseName);
  }, [equipmentsList, accommodations, courseTemplates, isAdminMode]);

  useEffect(() => {
    if (!isAdminMode) return;
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', updateActivity); window.addEventListener('keydown', updateActivity);
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 15 * 60 * 1000) { handleLogout(); alert('【安全提示】閒置時間過長，已自動登出管理員身分。'); }
    }, 60000);
    return () => { window.removeEventListener('mousemove', updateActivity); window.removeEventListener('keydown', updateActivity); clearInterval(interval); };
  }, [isAdminMode, lastActivity]);

  const handleLogout = async () => {
    await signOut(auth);
    await signInAnonymously(auth);
    setIsAdminMode(false); setCurrentView('home'); window.scrollTo(0,0);
  };

  useEffect(() => {
    const seed = async () => {
      if (!isAdminMode || !user || hasSeeded.current || sysConfig.isSeeded) return;
      hasSeeded.current = true;
      try {
        const cRef = collection(db, 'artifacts', appId, 'public', 'data', 'courseTemplates');
        await addDoc(cRef, { 
            courseName: '開放水域潛水員 (OWD)', price: 13000, days: 3, materialSystem: 'PADI', certFee: 0, 
            compulsories: ['平靜水域技巧', '4次開放水域潛水', '200公尺游泳'], electives: [], courseNotes: '自備泳衣、毛巾。',
            schedule: [
               { day: 1, slots: [{ period: '09:00-12:00', content: '學科理論與裝備介紹' }, { period: '13:30-17:00', content: '平靜水域技巧練習' }] },
               { day: 2, slots: [{ period: '09:00-12:00', content: '開放水域潛水 1' }, { period: '13:30-17:00', content: '開放水域潛水 2 與中性浮力練習' }] },
               { day: 3, slots: [{ period: '09:00-12:00', content: '開放水域潛水 3' }, { period: '13:30-17:00', content: '開放水域潛水 4 與結業' }] }
            ]
        });
        await addDoc(cRef, { 
            courseName: '進階開放水域潛水員 (AOWD)', price: 11000, days: 2, materialSystem: 'PADI', certFee: 0, 
            compulsories: ['深潛', '水底導航', '3項探險潛水'], electives: [], courseNotes: '需具備OWD',
            schedule: [
               { day: 1, slots: [{ period: '09:00-12:00', content: '進階浮力控制' }, { period: '13:30-17:00', content: '水底導航探險潛水' }, { period: '18:30-20:00', content: '夜潛 (選修)' }] },
               { day: 2, slots: [{ period: '09:00-12:00', content: '深潛探險潛水' }, { period: '13:30-17:00', content: '放流/其他探險潛水與結業' }] }
            ]
        });

        const rRef = collection(db, 'artifacts', appId, 'public', 'data', 'accommodations');
        // 建立背包房預設
        await addDoc(rRef, { name: '背包客房', quantity: 1, bedCount: 6, isDorm: true, priceLowWeekday: 500, priceLowWeekend: 600, pricePeakWeekday: 700, pricePeakWeekend: 800, priceHoliday: 1000 });
        
        // 👉 建立雙人房預設 (1床+沙發床) 3種方案
        await addDoc(rRef, {
            name: '豪華雙人房 (可加沙發床)', quantity: 3, bedCount: 2, isDorm: false,
            pricingRules: [
                { id: 1, name: '1人入住', guests: 1, extraBeds: 0, prices: { lowWeekday: 1800, lowWeekend: 2200, peakWeekday: 2500, peakWeekend: 2800, holiday: 3200 } },
                { id: 2, name: '2人入住', guests: 2, extraBeds: 0, prices: { lowWeekday: 2200, lowWeekend: 2800, peakWeekday: 3200, peakWeekend: 3600, holiday: 4000 } },
                { id: 3, name: '3人入住 (含1加床)', guests: 3, extraBeds: 1, prices: { lowWeekday: 2800, lowWeekend: 3400, peakWeekday: 3800, peakWeekend: 4200, holiday: 4600 } }
            ]
        });

        // 👉 建立四人房預設 (2床+沙發床) 5種方案
        await addDoc(rRef, {
            name: '家庭四人房 (可加沙發床)', quantity: 2, bedCount: 4, isDorm: false,
            pricingRules: [
                { id: 1, name: '2人入住', guests: 2, extraBeds: 0, prices: { lowWeekday: 3200, lowWeekend: 3800, peakWeekday: 4200, peakWeekend: 4800, holiday: 5200 } },
                { id: 2, name: '3人入住', guests: 3, extraBeds: 0, prices: { lowWeekday: 3800, lowWeekend: 4400, peakWeekday: 4800, peakWeekend: 5400, holiday: 5800 } },
                { id: 3, name: '3人入住 (含1加床)', guests: 3, extraBeds: 1, prices: { lowWeekday: 4400, lowWeekend: 5000, peakWeekday: 5400, peakWeekend: 6000, holiday: 6400 } },
                { id: 4, name: '4人入住', guests: 4, extraBeds: 0, prices: { lowWeekday: 4400, lowWeekend: 5000, peakWeekday: 5400, peakWeekend: 6000, holiday: 6400 } },
                { id: 5, name: '5人入住 (含1加床)', guests: 5, extraBeds: 1, prices: { lowWeekday: 5000, lowWeekend: 5600, peakWeekday: 6000, peakWeekend: 6600, holiday: 7000 } }
            ]
        });
        
        const eqRef = collection(db, 'artifacts', appId, 'public', 'data', 'equipments');
        await addDoc(eqRef, { name: 'BCD', category: '重裝備', hasSpecs: true, specDetails: [{id: 1, name: 'XS', ready: 3}, {id: 2, name: 'S', ready: 5}, {id: 3, name: 'M', ready: 10}, {id: 4, name: 'L', ready: 8}, {id: 5, name: 'XL', ready: 3}], readyQuantity: 29, price: 350 });
        await addDoc(eqRef, { name: '調節器 (含備用二級頭及儀錶)', category: '重裝備', hasSpecs: true, specDetails: [{id:1, name:'標準 (YOKE)', ready:15}, {id:2, name:'DIN', ready:5}], readyQuantity: 20, price: 350 });
        await addDoc(eqRef, { name: '防寒衣 (Wetsuit)', category: '輕裝備', hasSpecs: true, specDetails: [{id: 1, name: 'XS', ready: 3}, {id: 2, name: 'S', ready: 5}, {id: 3, name: 'M', ready: 10}, {id: 4, name: 'L', ready: 8}, {id: 5, name: 'XL', ready: 3}], readyQuantity: 29, price: 150 });
        await addDoc(eqRef, { name: '面鏡 (Mask)', category: '輕裝備', hasSpecs: true, specDetails: [{id:1, name:'無度數', ready:20}, {id:2, name:'近視 -150', ready:2}, {id:3, name:'近視 -200', ready:2}], readyQuantity: 32, price: 100 });
        await addDoc(eqRef, { name: '蛙鞋 (Fins)', category: '輕裝備', hasSpecs: true, specDetails: [{id: 1, name: 'S', ready: 5}, {id: 2, name: 'M', ready: 10}, {id: 3, name: 'L', ready: 5}], readyQuantity: 20, price: 100 });
        await addDoc(eqRef, { name: '套鞋 (Boots)', category: '輕裝備', hasSpecs: true, specDetails: [{id:1, name:'23', ready:5}, {id:2, name:'24', ready:8}, {id:3, name:'25', ready:8}], readyQuantity: 40, price: 50 });
        
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'systemConfig'), { ...sysConfig, isSeeded: true, medicalForm: DEFAULT_MEDICAL_FORM, coaches: [{id: 1, name: '阿龍教練'}], adminCode: '0000', equipmentPackages: { heavy: 600, light: 400, full: 1000, studentDiscount: 80, returnCustomerDiscount: 80 }, airTankPrice: 800, nitroxTankPrice: 1200 }, { merge: true });
      } catch (e) { console.error("Seeding failed:", e); }
    };
    seed();
  }, [user, sysConfig]);

  const handleNavClick = (v) => { 
    if (v === 'accommodations' && !pendingAccAction) { setShowAccPromptModal(true); return; }
    setCurrentView(v); setIsAdminMode(false); window.scrollTo(0, 0); 
  };

  const handleAdminToggle = () => { 
    if (!isAdminMode) setShowLoginModal(true);
    else handleLogout();
  };

  const verifyAdmin = (success) => {
    if (success) {
      setIsAdminMode(true);
      setLastActivity(Date.now());
      setShowLoginModal(false);
      setCurrentView('dashboard');
    }
  };

  const submitRegistration = async (data) => {
    if (!user) throw new Error("尚未登入系統");
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'bookings'), { userId: user.uid, ...data, status: 'pending', timestamp: serverTimestamp() });
  };

  const saveSysConfig = async (cfg) => { 
    try { 
      const cleanCfg = JSON.parse(JSON.stringify(cfg));
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'systemConfig'), cleanCfg, { merge: true }); 
      alert("已儲存設定"); 
    } catch (e) { alert("儲存失敗"); } 
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-100 font-black text-slate-400 tracking-widest animate-pulse">SYSTEM LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center cursor-pointer group" onClick={() => { setCurrentView('home'); setIsAdminMode(false); }}>
            <div className="bg-blue-600 p-2 rounded-lg transition-transform group-hover:scale-110"><Waves className="h-5 w-5 text-white" /></div>
            <span className="ml-3 text-xl font-black text-slate-900 tracking-tight">鯊墾丁 (SHARKENTING)</span>
          </div>
          <div className="flex items-center gap-3">
             {isAdminMode && <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-full border border-green-200 shadow-inner"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>最高權限已載入</div>}
             <button onClick={handleAdminToggle} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${isAdminMode ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
               {isAdminMode ? <><X className="w-4 h-4 mr-2" /> 退出管理後台</> : <><Settings className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">營運管理中心</span></>}
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAdminMode ? (
          <>
            {currentView === 'home' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="rounded-[3rem] overflow-hidden text-white p-8 md:p-12 lg:p-16 relative shadow-[0_30px_60px_rgba(6,182,212,0.3)] bg-cyan-500 min-h-[450px] flex items-center group border border-cyan-300/50">
                  <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,#a5f3fc_0%,#06b6d4_40%,#0284c7_70%,#082f49_100%)] opacity-95"></div>
                  <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6)_0%,transparent_50%)] pointer-events-none mix-blend-overlay animate-[pulse_5s_ease-in-out_infinite]"></div>
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                     <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -ml-[400px] -mt-[400px] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(255,255,255,0.2)_45%,transparent_50%)] rounded-full animate-[ripple_8s_ease-out_infinite]"></div>
                     <div className="absolute top-1/3 left-2/3 w-[600px] h-[600px] -ml-[300px] -mt-[300px] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(255,255,255,0.15)_45%,transparent_50%)] rounded-full animate-[ripple_6s_ease-out_infinite_2s]"></div>
                     <div className="absolute top-2/3 left-1/4 w-[1000px] h-[1000px] -ml-[500px] -mt-[500px] bg-[radial-gradient(circle_at_center,transparent_45%,rgba(255,255,255,0.1)_50%,transparent_55%)] rounded-full animate-[ripple_10s_ease-out_infinite_4s]"></div>
                  </div>
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                     <div className="absolute top-[10%] opacity-30 animate-[swim-diagonal-1_28s_linear_infinite]"><WhaleSharkTopDownIcon className="w-[180px] h-[300px] transform rotate-[135deg] blur-[2px]" /></div>
                     <div className="absolute top-[50%] opacity-60 animate-[swim-diagonal-1_22s_linear_infinite_5s]"><WhaleSharkTopDownIcon className="w-[300px] h-[500px] transform rotate-[120deg] blur-[0.5px]" /></div>
                     <div className="absolute bottom-[20%] opacity-20 animate-[swim-diagonal-2_35s_linear_infinite_2s]"><WhaleSharkTopDownIcon className="w-[240px] h-[400px] transform -rotate-[45deg] blur-[1px]" /></div>
                  </div>
                  
                  <div className="relative z-10 w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-cyan-50 text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-yellow-300 animate-ping"></div>
                        {String(sysConfig.heroBadgeText || 'Top-Down Ocean View & Whale Sharks')}
                      </div>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] text-white">{String(sysConfig.title || '')}</h1>
                      <p className="text-lg md:text-xl text-cyan-50 mb-10 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] font-bold">{String(sysConfig.subtitle || '')}</p>
                      <button onClick={() => setCurrentView('activities')} className="bg-white text-blue-900 px-8 py-3.5 md:px-10 md:py-4 rounded-xl font-black shadow-[0_10px_30px_rgba(0,182,212,0.4)] hover:bg-cyan-50 hover:scale-105 transition-all flex items-center gap-2 group">
                        展開潛水旅程 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <div className="w-full lg:w-[420px] xl:w-[460px] bg-slate-900/60 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 shadow-2xl relative z-30 transform transition-all duration-500 hover:scale-[1.02] mt-6 lg:mt-0 shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-[2rem] pointer-events-none"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                           <div className="flex items-center gap-2.5">
                             <div className="bg-cyan-500/30 p-2 rounded-lg text-cyan-300"><CircleDollarSign className="w-5 h-5"/></div>
                             <h3 className="font-black text-white text-lg tracking-wide">活動與收費</h3>
                           </div>
                        </div>
                        <div className="mb-4 bg-cyan-900/40 p-3 rounded-xl border border-cyan-500/20">
                           <p className="text-xs font-bold text-cyan-50 leading-relaxed flex items-start gap-2">
                             <Info className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400"/> 
                             先聯絡預約，等待教練開啟報名表單後，填寫預約潛水行程報名資訊。
                           </p>
                        </div>
                        <div className="space-y-3 max-h-[240px] overflow-y-auto custom-scrollbar pr-2 relative">
                          {sysConfig.priceList && sysConfig.priceList.length > 0 ? (
                            sysConfig.priceList.map((item, idx) => (
                              <div key={item.id || idx} className="group relative bg-white/5 hover:bg-white/10 p-3.5 rounded-xl transition-all border border-transparent hover:border-cyan-300/30 shadow-sm">
                                <div className="flex justify-between items-start gap-3 mb-1.5">
                                  <span className="font-bold text-cyan-50 text-sm group-hover:text-cyan-300 transition-colors leading-tight">{item.name}</span>
                                  <span className="font-black text-cyan-300 text-sm shrink-0">{item.price}</span>
                                </div>
                                {item.desc && <p className="text-xs font-medium text-slate-300/80 leading-relaxed pr-1">{item.desc}</p>}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-slate-400 text-sm font-bold border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/30">目前尚無收費項目</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20 mt-2">
                  <QuickCard variant="accommodations" icon={<CoralIcon className="w-6 h-6" />} colorTheme="rose" title="住宿預訂" desc="預約舒適房間，享活動專屬配套折抵優惠" onClick={() => handleNavClick('accommodations')} />
                  <QuickCard variant="equipments" icon={<CardDivingTankIcon className="w-6 h-6" />} colorTheme="cyan" title="專業裝備租借" desc="依據 AI 身型預測，為您準備最合適的潛水裝備" onClick={() => setCurrentView('equipments')} />
                  <QuickCard variant="dashboard" icon={<AbyssRadarIcon className="w-6 h-6" />} colorTheme="indigo" title="我的預約查詢" desc="追蹤報名審核進度，即時掌握所有訂單狀態" onClick={() => setCurrentView('dashboard')} />
                </div>

                <div className="relative mt-24 mb-12 rounded-[4rem] p-1 shadow-[0_20px_50px_rgba(8,145,178,0.08)] bg-gradient-to-b from-cyan-100 to-white z-0">
                   <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-blue-50 rounded-[4rem] -z-10 overflow-hidden border border-white">
                       <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-cyan-100/30 via-white/10 to-transparent blur-3xl transform skew-x-12 pointer-events-none"></div>
                       <div className="absolute top-0 right-1/4 w-1/3 h-full bg-gradient-to-b from-blue-100/30 via-white/10 to-transparent blur-3xl transform -skew-x-12 pointer-events-none"></div>
                       <div className="absolute top-10 left-10 text-cyan-500/10 transform -rotate-12 pointer-events-none animate-[pulse_6s_ease-in-out_infinite]"><Fish className="w-64 h-64" /></div>
                       <div className="absolute bottom-0 right-0 text-blue-500/10 pointer-events-none transform rotate-6 translate-x-1/4 translate-y-1/4"><Waves className="w-96 h-96" /></div>
                       <div className="absolute top-1/4 right-[10%] w-12 h-12 bg-cyan-200/30 rounded-full blur-[1px] animate-[bounce_4s_infinite] shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
                       <div className="absolute top-1/3 right-[25%] w-6 h-6 bg-blue-200/40 rounded-full blur-[0.5px] animate-[bounce_5s_infinite_1s]"></div>
                       <div className="absolute bottom-1/4 left-[15%] w-16 h-16 bg-white/60 rounded-full blur-[2px] animate-[bounce_7s_infinite_reverse] shadow-[0_0_30px_rgba(255,255,255,0.8)]"></div>
                       <div className="absolute top-1/2 left-[5%] w-3 h-3 bg-cyan-300/50 rounded-full animate-ping opacity-80"></div>
                   </div>
                   
                   <div className="bg-white/40 backdrop-blur-2xl p-8 md:p-14 rounded-[3.8rem] relative z-10">
                      <div className="text-center max-w-2xl mx-auto mb-12">
                         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 mb-4 shadow-sm">
                           <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                           <span className="text-cyan-700 font-black tracking-widest text-[10px] uppercase">Explore the Ocean</span>
                         </div>
                         <h3 className="text-3xl md:text-5xl font-black text-slate-800 flex items-center justify-center gap-4 tracking-tight drop-shadow-sm">聯絡與門市資訊</h3>
                         <p className="text-slate-600 font-bold mt-5 leading-relaxed text-sm md:text-base">無論是課程諮詢、裝備預留，還是想了解最新的潛水行程，<br className="hidden sm:block"/>歡迎透過以下方式與我們聯繫！</p>
                      </div>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                         <div className="xl:col-span-5 flex flex-col gap-5">
                            <ContactItem highlight="line" label="官方 LINE 客服 (快速預約/諮詢)" value={sysConfig.line} icon={<MessageCircle className="w-7 h-7"/>} href={sysConfig.line ? (String(sysConfig.line).startsWith('@') ? `https://line.me/R/ti/p/${sysConfig.line}` : `https://line.me/ti/p/~${sysConfig.line}`) : '#'} />
                            <ContactItem label="實體門市位置" value={sysConfig.address} subValue={sysConfig.transport} icon={<MapPin className="w-6 h-6"/>} />
                            <ContactItem highlight="blue" label="潛水服務專線" value={sysConfig.phoneDiving} subValue={`服務時間: ${sysConfig.serviceHoursDiving || '08:00 - 18:00'}`} href={`tel:${sysConfig.phoneDiving}`} icon={<Waves className="w-6 h-6"/>} />
                            <ContactItem label="住宿管家專線" value={sysConfig.phoneAcc} subValue={`進房: ${sysConfig.checkInAcc || '15:00'}\n退房: ${sysConfig.checkOutAcc || '11:00'}`} href={`tel:${sysConfig.phoneAcc}`} icon={<Home className="w-6 h-6"/>} />
                         </div>
                         
                         <div className="xl:col-span-7 relative min-h-[400px] lg:min-h-[500px] h-full bg-white/60 p-3 md:p-4 rounded-[3rem] shadow-[0_15px_40px_rgba(6,182,212,0.1)] border border-white group">
                            <iframe title="門市位置地圖" className="w-full h-full rounded-[2.5rem] bg-slate-50 transition-all duration-700 opacity-90 group-hover:opacity-100 shadow-inner" style={{ border: 0, minHeight: '400px' }} loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(sysConfig.address || '屏東縣恆春鎮')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}></iframe>
                            <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center gap-3 pointer-events-none group-hover:border-cyan-200 transition-colors duration-500 z-20">
                               <div className="relative flex items-center justify-center"><div className="absolute w-6 h-6 bg-cyan-400/30 rounded-full animate-ping"></div><div className="w-2.5 h-2.5 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)]"></div></div>
                               <span className="text-xs font-black text-slate-700 tracking-widest uppercase">實體門市位置</span>
                            </div>
                            <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                               <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sysConfig.address || '屏東縣恆春鎮')}`} target="_blank" rel="noreferrer" className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:bg-cyan-600 transition-all flex items-center gap-2 hover:scale-105 border border-white/10">
                                  <MapPin className="w-5 h-5"/> 在 Google Maps 中開啟
                               </a>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <footer className="text-center text-slate-400 text-[11px] font-bold mt-16 pb-4 tracking-wider uppercase">
                   {sysConfig.footerText || "© 2026 鯊墾丁 SHARKENTING . HUANG."}
                </footer>

              </div>
            )}
            {currentView === 'activities' && <ServiceSection title="潛水課程與活動" items={activities} type="activity" onBook={(item) => { setSelectedActivity(item); setIsRegModalOpen(true); }} sysConfig={sysConfig} bookings={bookings} />}
            {currentView === 'accommodations' && <AccommodationBookingPage accommodations={accommodations} sysConfig={sysConfig} context={pendingAccAction} onBook={async (data) => {
                try { await submitRegistration(data); setPendingAccAction(null); setCurrentView('dashboard'); window.scrollTo(0,0); } 
                catch(e) { alert("送出失敗"); }
            }} onBack={() => { setPendingAccAction(null); setCurrentView('home'); }} />}
            {currentView === 'equipments' && <EquipmentRentalPage equipments={equipmentsList} sysConfig={sysConfig} onBook={async (data) => {
                try { await submitRegistration(data); setCurrentView('dashboard'); window.scrollTo(0,0); } 
                catch(e) { alert("送出失敗"); }
            }} onBack={() => setCurrentView('home')} />}
            {currentView === 'dashboard' && <UserDashboard bookings={bookings} userUid={user?.uid} />}
          </>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 sticky top-24 z-10 overflow-hidden">
                <div className="p-5 bg-slate-800 text-white font-bold flex items-center gap-3"><Settings className="w-5 h-5 text-blue-400" /> 後台管理中心</div>
                <div className="flex flex-col">
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-50 pt-4">顧客預約管理</div>
                  <AdminTabBtn active={adminSection === 'book-activities'} onClick={() => setAdminSection('book-activities')} icon={<ClipboardList className="w-5 h-5"/>} label="潛水報名表" />
                  <AdminTabBtn active={adminSection === 'book-accommodations'} onClick={() => setAdminSection('book-accommodations')} icon={<CalendarDays className="w-5 h-5"/>} label="住宿預約表" />
                  <AdminTabBtn active={adminSection === 'book-equipments'} onClick={() => setAdminSection('book-equipments')} icon={<ShoppingCart className="w-5 h-5"/>} label="裝備租借表" />
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-50 pt-4">系統資源設定</div>
                  <AdminTabBtn active={adminSection === 'activities'} onClick={() => {setAdminSection('activities'); setAdminSubTab('list');}} icon={<Waves className="w-5 h-5"/>} label="活動上架" />
                  <AdminTabBtn active={adminSection === 'accommodations'} onClick={() => {setAdminSection('accommodations'); setAdminSubTab('rooms');}} icon={<Home className="w-5 h-5"/>} label="住宿與房控" />
                  <AdminTabBtn active={adminSection === 'equipments'} onClick={() => {setAdminSection('equipments'); setAdminSubTab('inventory');}} icon={<LifeBuoy className="w-5 h-5"/>} label="庫存與收費" />
                  <AdminTabBtn active={adminSection === 'system'} onClick={() => setAdminSection('system')} icon={<PenTool className="w-5 h-5"/>} label="基礎文案設定" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-[700px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {adminSection === 'book-activities' && <BookingAdminPanel db={db} appId={appId} bookings={bookings} type="activity" title="潛水課程與活動報名表" />}
              {adminSection === 'book-accommodations' && <BookingAdminPanel db={db} appId={appId} bookings={bookings} type="accommodation" title="住宿預約表" />}
              {adminSection === 'book-equipments' && <BookingAdminPanel db={db} appId={appId} bookings={bookings} type="equipment" title="裝備租借紀錄表" />}
              {adminSection === 'activities' && <ActivityAdminPanel db={db} appId={appId} activities={activities} courseTemplates={courseTemplates} sysConfig={sysConfig} saveSysConfig={saveSysConfig} subTab={adminSubTab} setSubTab={setAdminSubTab} bookings={bookings} />}
              {adminSection === 'accommodations' && <AccommodationAdminPanel db={db} appId={appId} accommodations={accommodations} sysConfig={sysConfig} saveSysConfig={saveSysConfig} subTab={adminSubTab} setSubTab={setAdminSubTab} />}
              {adminSection === 'equipments' && <EquipmentAdminPanel db={db} appId={appId} equipments={equipmentsList} sysConfig={sysConfig} saveSysConfig={saveSysConfig} subTab={adminSubTab} setSubTab={setAdminSubTab} />}
              {adminSection === 'system' && (
                <div className="p-8 space-y-6">
                    <h3 className="text-xl font-bold border-b pb-4">Firebase 進階安全狀態</h3>
                    <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-3xl flex items-start gap-4">
                      <div className="bg-white p-3 rounded-2xl text-indigo-600 shadow-sm"><Lock className="w-6 h-6" /></div>
                      <div>
                        <h4 className="font-black text-indigo-900 mb-1">後端安全規則連動中</h4>
                        <p className="text-sm font-bold text-indigo-700 leading-relaxed">
                          目前系統讀寫權限由 Firebase Auth UID 授權名單管控。未被列入 /admins/ 集合的帳號將無法執行任何修改。
                        </p>
                        <div className="mt-4 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">目前管理員 UID：{user?.uid}</div>
                      </div>
                    </div>
                    <SystemAdminPanel config={sysConfig} onSave={saveSysConfig} />
                  </div>
                )}
            </div>
          </div>
        )}
      </main>

      {/* --- 全域視窗 Modals --- */}
      {showLoginModal && <AdminLoginModal onVerify={verifyAdmin} onClose={() => setShowLoginModal(false)} />}
      
      {isRegModalOpen && selectedActivity && (
         <RegistrationForm 
            activity={selectedActivity} equipments={equipmentsList} onClose={() => setIsRegModalOpen(false)} onSubmit={submitRegistration} sysConfig={sysConfig} 
            onSuccess={(result) => {
               setIsRegModalOpen(false);
               if (result?.gotoAcc) { setPendingAccAction(result.accContext); setCurrentView('accommodations'); } 
               else { setCurrentView('dashboard'); }
               window.scrollTo(0,0);
            }}
         />
      )}

      {showAccPromptModal && <AccPromptModal sysConfig={sysConfig} onClose={() => setShowAccPromptModal(false)} onGoActivities={()=>{setShowAccPromptModal(false); setCurrentView('activities'); window.scrollTo(0,0);}} onGoAccommodations={()=>{setShowAccPromptModal(false); setCurrentView('accommodations'); window.scrollTo(0,0);}} />}
      
      <style>{`
        @keyframes wave { 0% { transform: translateX(0); } 50% { transform: translateX(-3%) scaleY(1.05); } 100% { transform: translateX(0); } }
        @keyframes float-up { 0% { transform: translateY(50px) scale(0.8); opacity: 0; } 20% { opacity: 0.7; } 80% { opacity: 0.7; } 100% { transform: translateY(-400px) scale(1.5); opacity: 0; } }
        @keyframes swim-across { 0% { left: -30%; opacity: 0; transform: translateY(10%) scale(0.8); } 10% { opacity: 0.6; } 90% { opacity: 0.6; } 100% { left: 120%; opacity: 0; transform: translateY(-10%) scale(1.2); } }
        @keyframes ripple { 0% { transform: scale(0.2); opacity: 0; } 20% { opacity: 0.3; } 100% { transform: scale(2); opacity: 0; } }
        @keyframes swim-diagonal-1 { 0% { top: -20%; left: -20%; opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.6; } 100% { top: 120%; left: 120%; opacity: 0; } }
        @keyframes swim-diagonal-2 { 0% { top: 120%; right: -20%; opacity: 0; } 10% { opacity: 0.4; } 90% { opacity: 0.4; } 100% { top: -20%; right: 120%; opacity: 0; } }
      `}</style>
    </div>
  );
}

export default App;