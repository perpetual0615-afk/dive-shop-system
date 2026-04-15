import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Waves, Home, LifeBuoy, CalendarDays, User, Users, Settings, ClipboardList, CheckCircle, Clock, X, Menu, ChevronRight, ChevronLeft, ChevronDown, Plus, Trash2, Edit3, Save, AlertTriangle, PenTool, Phone, MessageCircle, MapPin, Scale, Info, Check, ArrowRight, ShoppingCart, Search, BookOpen, Fish, Lock, KeyRound, Download, Award } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, serverTimestamp, deleteDoc, setDoc } from 'firebase/firestore';

// --- Firebase 基礎配置 (加上安全防護) ---
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

// --- 預設醫療健康聲明問卷 ---
const DEFAULT_MEDICAL_FORM = [
  { id: 1, text: "一、您的肺部/呼吸系統、心臟/血液系統是否有任何狀況或病史？", subItems: [{ id: 11, text: "1. 曾罹患氣喘、氣胸，或過去12個月內曾出現喘息等呼吸困難症狀？" }, { id: 12, text: "2. 曾接受過胸部、肺部或心臟/血管手術？" }, { id: 13, text: "3. 曾有心臟病發作、心律不整、中風，或目前正服用治療血壓、心血管疾病的藥物？" }, { id: 14, text: "4. 曾因呼吸道疾病（如嚴重過敏、支氣管炎）需要看診或接受治療？" }]},
  { id: 2, text: "二、您是否年滿 45 歲，且符合以下任一健康狀況？", subItems: [{ id: 21, text: "1. 目前有抽菸習慣（包含紙菸、雪茄或電子菸）？" }, { id: 22, text: "2. 患有高血壓或膽固醇過高？" }, { id: 23, text: "3. 有心臟病或中風的家族病史？" }, { id: 24, text: "4. 患有糖尿病？" }]},
  { id: 3, text: "三、您是否曾有眼睛、耳朵、鼻腔或鼻竇的疾病與手術病史？", subItems: [{ id: 31, text: "1. 過去6個月內曾接受過眼睛、耳朵或鼻竇手術？" }, { id: 32, text: "2. 曾有過反覆性中耳炎、鼻竇炎或平衡障礙問題？" }, { id: 33, text: "3. 在搭乘飛機或前往高海拔地區時，曾有嚴重的耳朵/鼻竇氣壓性擠壓傷？" }]},
  { id: 4, text: "四、您是否有神經系統、腦部或心理健康的狀況？", subItems: [{ id: 41, text: "1. 曾有癲癇、抽搐，或目前正在服用預防性藥物？" }, { id: 42, text: "2. 曾有不明原因的暈厥、意識喪失或嚴重的偏頭痛？" }, { id: 43, text: "3. 曾被診斷出患有恐慌症、幽閉恐懼症、廣場恐懼症或嚴重憂鬱症？" }]},
  { id: 5, text: "五、您是否曾有過胃腸、腸道疾病，或骨骼肌肉問題？", subItems: [{ id: 51, text: "1. 曾有嚴重的胃食道逆流或潰瘍，並需要接受治療？" }, { id: 52, text: "2. 過去6個月內曾接受過腹部或胃腸道手術？" }, { id: 53, text: "3. 曾有背部、關節或脊椎的問題，且目前仍會因負重或運動感到不適？" }]},
  { id: 6, text: "六、其他重要的醫療與生理狀況", subItems: [{ id: 61, text: "1. 您目前是否懷孕，或者正在計畫懷孕？" }, { id: 62, text: "2. 您是否有過潛水減壓病（DCI）或其他潛水意外的病史？" }, { id: 63, text: "3. 除避孕藥或防瘧疾藥物外，您目前是否正在服用任何處方箋藥物？" }, { id: 64, text: "4. 您是否有任何會影響身體代謝的疾病（如糖尿病、甲狀腺異常）？" }]}
];

// --- 預設課程服務項目 ---
const DEFAULT_SERVICES = [
  '🛏️ 背包房床位',
  '🥪 提供早午餐',
  '📃 潛水意外責任險',
  '🚗 提供潛店到潛點的接駁',
  '👤 教練１對４人以下指導'
];

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

// 手機號碼自動格式化輔助函數 (四碼-三碼-三碼)
function formatPhoneNumber(value) {
  if (!value) return '';
  const numbers = value.replace(/[^\d]/g, '');
  if (numbers.length <= 4) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
  return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 10)}`;
}

// 匯出 CSV 輔助函數 (加入 BOM 確保 Excel 中文不亂碼)
function exportToCSV(filename, rows) {
  const processRow = function (row) {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };
  let csvFile = '\uFEFF'; 
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }
  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// --- AI 尺寸與配重分析工具 ---
function calculateRecommendedSize(h, w) {
  if (!h || !w) return '';
  const height = parseFloat(h);
  const weight = parseFloat(w);
  if (height < 160 && weight < 55) return 'XS';
  if (height < 170 && weight < 65) return 'S';
  if (height < 178 && weight < 75) return 'M';
  if (height < 185 && weight < 85) return 'L';
  return 'XL';
}

function calculateFinSize(shoe) {
  const s = parseFloat(shoe);
  if (!s) return '';
  if (s <= 23) return 'XS';
  if (s <= 25) return 'S';
  if (s <= 27) return 'M';
  if (s <= 29) return 'L';
  return 'XL';
}

function calculateBootSize(shoe) {
  const s = parseFloat(shoe);
  if (!s) return '';
  return String(Math.round(s));
}

function AISizeAdvisor({ height, weight, shoeSize, showWeight = false }) {
  const h = parseFloat(height);
  const w = parseFloat(weight);
  if (!h || !w) return null;

  const bmi = w / ((h / 100) ** 2);
  // 計算變形比例，基準值以 h=170, BMI=22 為主
  const scaleY = Math.max(0.85, Math.min(1.15, h / 170));
  const scaleX = Math.max(0.75, Math.min(1.4, bmi / 22));
  
  const recSize = calculateRecommendedSize(h, w);
  const recWeight = Math.max(1, Math.round(w * 0.08));
  const recBoot = calculateBootSize(shoeSize);
  const recFin = calculateFinSize(shoeSize);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/60 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-6 overflow-hidden relative">
       {/* 裝飾性背景光暈 */}
       <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

       {/* Visualizer: 科技感 AI 體型模擬艙 */}
       <div className="relative w-40 h-48 flex items-end justify-center bg-slate-900 rounded-2xl border border-indigo-900/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden shrink-0">
          {/* 背景網格 */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>
          
          {/* 掃描線動畫 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
             <div className="w-full h-[2px] bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,1)] absolute animate-[scan_2.5s_ease-in-out_infinite]"></div>
          </div>
          
          {/* 變形潛水員主體 */}
          <div className="flex flex-col items-center origin-bottom transition-transform duration-700 ease-out z-10" style={{ transform: `scaleX(${scaleX}) scaleY(${scaleY})`, marginBottom: '12px' }}>
             {/* 頭部與面鏡 */}
             <div className="w-9 h-9 bg-slate-700 rounded-full mb-1 relative border-2 border-slate-600 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                <div className="absolute top-1.5 left-[4px] right-[4px] h-3.5 bg-cyan-400/90 rounded-[3px] backdrop-blur-sm border border-cyan-200/50 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
             </div>
             {/* 軀幹與裝備 */}
             <div className="w-[56px] h-[76px] bg-slate-700 rounded-t-xl relative border-2 border-slate-600 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                {/* 防寒衣拉鍊紋路 */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-14 bg-slate-600/50 rounded-full"></div>
                
                {/* BCD Overlay */}
                <div className="absolute top-3 -left-2.5 -right-2.5 h-12 bg-slate-800 rounded-lg border border-slate-500 flex justify-center items-center shadow-lg">
                   <div className="w-2 h-full bg-blue-500/80 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.8)]"></div>
                   <div className="absolute -right-1.5 top-2 w-2.5 h-2.5 bg-slate-400 rounded-full border border-slate-500"></div> {/* 充氣閥示意 */}
                </div>
                {/* 配重帶 (模擬) */}
                {showWeight && (
                   <div className="absolute bottom-1 -left-1.5 -right-1.5 h-3 bg-slate-900 border border-slate-500 rounded flex items-center justify-center gap-1 shadow-md">
                      <div className="w-2 h-2 bg-slate-300 rounded-[1px]"></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-[1px]"></div>
                   </div>
                )}
             </div>
             {/* 雙腿 */}
             <div className="flex gap-[2px] w-[56px]">
               <div className="w-[27px] h-14 bg-slate-700 rounded-b-lg border-2 border-slate-600 border-t-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
               <div className="w-[27px] h-14 bg-slate-700 rounded-b-lg border-2 border-slate-600 border-t-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
             </div>
          </div>

          {/* HUD 資訊標籤 (不受外層縮放影響以保持清晰，精準指向模擬裝備) */}
          <div className="absolute inset-0 pointer-events-none z-30">
             {/* BCD 指示線與標籤 */}
             <div className="absolute top-[35%] left-[2%] flex items-center">
                <div className="bg-slate-800/90 backdrop-blur-sm text-cyan-300 text-[10px] font-black px-1.5 py-1 rounded shadow-md border border-cyan-500/50 leading-none">BCD {recSize}</div>
                <div className="w-4 h-[1px] bg-cyan-500/70"></div>
             </div>
             
             {/* 防寒衣 指示線與標籤 */}
             <div className="absolute top-[55%] right-[2%] flex items-center flex-row-reverse">
                <div className="bg-slate-800/90 backdrop-blur-sm text-indigo-300 text-[10px] font-black px-1.5 py-1 rounded shadow-md border border-indigo-500/50 leading-none">防寒衣 {recSize}</div>
                <div className="w-4 h-[1px] bg-indigo-500/70"></div>
             </div>

             {/* 套鞋/蛙鞋 指示線與標籤 */}
             {shoeSize && (
                <div className="absolute bottom-[2%] right-[2%] flex items-center flex-row-reverse">
                    <div className="bg-slate-800/90 backdrop-blur-sm text-teal-300 text-[10px] font-black px-1.5 py-1 rounded shadow-md border border-teal-500/50 flex flex-col items-center leading-none gap-0.5">
                        <span>套鞋 {recBoot}</span>
                        <span>蛙鞋 {recFin}</span>
                    </div>
                    <div className="w-4 h-[1px] bg-teal-500/70"></div>
                </div>
             )}

             {/* 配重 指示線與標籤 */}
             {showWeight && (
                <div className="absolute bottom-[16%] left-[2%] flex items-center">
                    <div className="bg-slate-800/90 backdrop-blur-sm text-blue-300 text-[10px] font-black px-1.5 py-1 rounded shadow-md border border-blue-500/50 flex items-center gap-0.5 leading-none">
                        <Scale className="w-2.5 h-2.5" /> {recWeight}kg
                    </div>
                    <div className="w-3 h-[1px] bg-blue-500/70"></div>
                </div>
             )}
          </div>
       </div>
       
       <div className="flex-1 space-y-3 z-10">
          <h4 className="font-black text-indigo-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" /> AI 體型測繪與智能裝備建議
          </h4>
          <p className="text-xs font-bold text-indigo-800/80 leading-relaxed">
            系統掃描您的身高 (<span className="text-indigo-900">{h}cm</span>) 與體重 (<span className="text-indigo-900">{w}kg</span>) 完成模擬身型。已同步推薦合適的裝備尺寸與配重於圖示中。
          </p>
          <div className="flex flex-wrap gap-3 pt-1.5">
             <div className="bg-white px-3.5 py-2.5 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-3">
               <div className="bg-indigo-50 p-2 rounded-lg"><LifeBuoy className="w-4 h-4 text-indigo-600"/></div>
               <div>
                  <span className="text-[10px] text-slate-500 block font-bold mb-0.5">推薦 BCD/防寒衣</span>
                  <span className="text-xl font-black text-indigo-700 leading-none">{recSize} <span className="text-xs text-indigo-400">SIZE</span></span>
               </div>
             </div>
             {shoeSize && (
                <div className="bg-white px-3.5 py-2.5 rounded-xl border border-teal-100 shadow-sm flex items-center gap-3">
                  <div className="bg-teal-50 p-2 rounded-lg text-lg">👣</div>
                  <div>
                     <span className="text-[10px] text-slate-500 block font-bold mb-0.5">建議 蛙鞋 / 套鞋</span>
                     <span className="text-xl font-black text-teal-700 leading-none">{recFin} <span className="text-xs text-teal-500 font-bold">/ {recBoot}</span></span>
                  </div>
                </div>
             )}
             {showWeight && (
                <div className="bg-white px-3.5 py-2.5 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg"><Scale className="w-4 h-4 text-blue-600"/></div>
                  <div>
                     <span className="text-[10px] text-slate-500 block font-bold mb-0.5">教練參考配重</span>
                     <span className="text-xl font-black text-blue-700 leading-none">{recWeight} <span className="text-xs font-bold">KG</span></span>
                  </div>
                </div>
             )}
          </div>
       </div>
       
       <style>{`
          @keyframes scan {
             0% { top: -10%; opacity: 0; }
             10% { opacity: 1; }
             50% { top: 100%; opacity: 1; }
             60% { opacity: 0; }
             100% { top: 100%; opacity: 0; }
          }
       `}</style>
    </div>
  )
}

// --------------------------------------------------------
// 基礎 UI 組件
// --------------------------------------------------------

function AdminLoginModal({ onVerify, onClose }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    onVerify(code, (success) => {
      setIsSubmitting(false);
      if (!success) {
        setError(true);
        setCode('');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative animate-in zoom-in-95">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Lock className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 text-center mb-2">安全存取驗證</h2>
        <p className="text-slate-500 text-sm text-center mb-8 font-medium">請輸入管理員密碼以進入營運中心</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input 
              autoFocus
              type="password" 
              value={code} 
              onChange={e => { setCode(e.target.value); setError(false); }}
              placeholder="權限碼" 
              className={`w-full p-4 bg-slate-50 border-2 rounded-2xl text-center text-2xl font-black tracking-[1em] outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-500 focus:bg-white'}`}
            />
            {error && <p className="text-red-500 text-xs font-bold text-center mt-2 animate-bounce">密碼錯誤，請重新輸入</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? '驗證中...' : <><Check className="w-5 h-5" /> 驗證並進入</>}
          </button>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="w-full py-2 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors disabled:opacity-50">
            取消返回
          </button>
        </form>
      </div>
    </div>
  );
}

// --- 導引卡片專屬背景裝飾圖示 (修正截斷與最佳化動態版) ---
const SeaweedBg = () => (
  <svg className="w-56 h-56 overflow-visible opacity-[0.65] group-hover:opacity-100 transition-all duration-700 transform group-hover:translate-y-[-10px] group-hover:scale-105" viewBox="-10 -20 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes swayL { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(4deg); } }
      @keyframes swayR { 0%, 100% { transform: rotate(4deg); } 50% { transform: rotate(-5deg); } }
      @keyframes floatUp { 0% { transform: translateY(10px) scale(0.5); opacity: 0; } 20% { opacity: 0.9; } 80% { opacity: 0.5; } 100% { transform: translateY(-45px) scale(1.3); opacity: 0; } }
      @keyframes fishSwim1 { 0% { transform: translate(-30px, 20px) scale(0.8); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translate(120px, -10px) scale(1.1); opacity: 0; } }
      @keyframes fishSwim2 { 0% { transform: translate(120px, 40px) scale(0.6) scaleX(-1); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translate(-30px, 10px) scale(0.9) scaleX(-1); opacity: 0; } }
      .sw-l { transform-origin: 50% 100%; animation: swayL 4.5s ease-in-out infinite; }
      .sw-r { transform-origin: 50% 100%; animation: swayR 5.5s ease-in-out infinite; }
      .bub-a { animation: floatUp 3s linear infinite; }
      .bub-b { animation: floatUp 4s linear infinite 1.5s; opacity: 0; }
      .bub-c { animation: floatUp 3.5s linear infinite 0.7s; opacity: 0; }
      .fish-1 { animation: fishSwim1 10s linear infinite; }
      .fish-2 { animation: fishSwim2 12s linear infinite 3s; opacity: 0; }
    `}</style>
    <defs>
      <linearGradient id="grad-seaweed-1" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#064e3b" /> {/* emerald-900 */}
        <stop offset="100%" stopColor="#10b981" /> {/* emerald-500 */}
      </linearGradient>
      <linearGradient id="grad-seaweed-2" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#3f6212" /> {/* lime-800 */}
        <stop offset="100%" stopColor="#84cc16" /> {/* lime-500 */}
      </linearGradient>
      <linearGradient id="grad-seaweed-3" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#0f766e" /> {/* emerald-700 */}
        <stop offset="100%" stopColor="#34d399" /> {/* emerald-400 */}
      </linearGradient>
      <linearGradient id="grad-coral-tube" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#9f1239" /> {/* rose-800 */}
        <stop offset="100%" stopColor="#fb7185" /> {/* rose-400 */}
      </linearGradient>
      <linearGradient id="grad-coral-branch" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#7e22ce" /> {/* indigo-700 */}
        <stop offset="100%" stopColor="#c084fc" /> {/* purple-400 */}
      </linearGradient>
      <linearGradient id="grad-fish" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f97316" /> {/* orange-500 */}
        <stop offset="100%" stopColor="#fef08a" /> {/* yellow-200 */}
      </linearGradient>
    </defs>
    
    {/* 海底礁石 (增加底部層次感) */}
    <path d="M -10 100 Q 15 85 40 100 Z" fill="#0f172a" opacity="0.3" />
    <path d="M 60 100 Q 85 90 110 100 Z" fill="#0f172a" opacity="0.2" />

    {/* 魚群 2 (遠景小魚，從右到左游動) */}
    <g className="fish-2">
       <path d="M 15 50 Q 25 40, 35 50 Q 25 60, 15 50 Z" fill="url(#grad-fish)" />
       <path d="M 15 50 L 5 42 L 8 50 L 5 58 Z" fill="#ea580c" />
       <circle cx="30" cy="48" r="1" fill="#fff" />
    </g>

    {/* 翠綠色粗海帶 (背景層 - 左搖) */}
    <g className="sw-l">
      <path d="M 20 100 Q 0 60, 25 30 T 10 -10" stroke="url(#grad-seaweed-1)" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M 35 100 Q 20 70, 40 40 T 30 10" stroke="url(#grad-seaweed-3)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
    </g>

    {/* 紫色樹枝狀珊瑚 (右搖) */}
    <g className="sw-r" style={{ animationDuration: '7s' }}>
      <path d="M 75 100 C 75 75, 55 60, 50 35 M 68 80 C 85 70, 95 50, 90 40 M 60 60 C 45 50, 35 45, 30 35 M 82 60 C 95 60, 100 50, 105 45" stroke="url(#grad-coral-branch)" strokeWidth="6" strokeLinecap="round" fill="none" />
    </g>

    {/* 青檸色寬葉海草 (前景層 - 慢速右搖) */}
    <g className="sw-r">
      <path d="M 85 100 Q 105 70, 80 40 T 95 0" stroke="url(#grad-seaweed-2)" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M 70 100 Q 85 80, 65 50 T 80 20" stroke="url(#grad-seaweed-1)" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
    </g>

    {/* 粉紅管狀海綿珊瑚 (左搖) */}
    <g className="sw-l" style={{ animationDuration: '6s' }}>
      <path d="M 45 100 Q 40 80, 50 60" stroke="url(#grad-coral-tube)" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M 55 100 Q 60 75, 55 50" stroke="url(#grad-coral-tube)" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 35 100 Q 30 85, 38 75" stroke="url(#grad-coral-tube)" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* 管口陰影增加立體感 */}
      <ellipse cx="50" cy="60" rx="4" ry="2" fill="#4c0519" opacity="0.5" />
      <ellipse cx="55" cy="50" rx="3" ry="1.5" fill="#4c0519" opacity="0.5" />
      <ellipse cx="38" cy="75" rx="2.5" ry="1" fill="#4c0519" opacity="0.5" />
    </g>

    {/* 魚群 1 (近景大魚，從左到右游動) */}
    <g className="fish-1">
       <path d="M 15 50 Q 30 35, 45 50 Q 30 65, 15 50 Z" fill="url(#grad-fish)" />
       <path d="M 15 50 L 2 40 L 8 50 L 2 60 Z" fill="#ea580c" />
       <circle cx="38" cy="47" r="1.5" fill="#fff" />
       {/* 伴游的小魚 */}
       <g transform="translate(-15, 15) scale(0.6)">
         <path d="M 15 50 Q 30 35, 45 50 Q 30 65, 15 50 Z" fill="url(#grad-fish)" />
         <path d="M 15 50 L 2 40 L 8 50 L 2 60 Z" fill="#ea580c" />
         <circle cx="38" cy="47" r="1.5" fill="#fff" />
       </g>
    </g>

    {/* 源源不絕的上升氣泡 */}
    <circle cx="45" cy="45" r="3.5" fill="#a7f3d0" className="bub-a" />
    <circle cx="75" cy="55" r="5" fill="#fecdd3" className="bub-b" />
    <circle cx="30" cy="35" r="2.5" fill="#e9d5ff" className="bub-c" />
    <circle cx="60" cy="70" r="2" fill="#bae6fd" className="bub-a" style={{ animationDelay: '2s', animationDuration: '4.5s' }} />
  </svg>
);

const SingleTankBg = () => (
  <svg className="w-56 h-56 overflow-visible opacity-[0.75] group-hover:opacity-100 transition-all duration-700 transform group-hover:translate-y-[-10px] group-hover:scale-105" viewBox="-10 -20 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes bubbleWobble {
        0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
        20% { opacity: 0.9; }
        50% { transform: translate(-6px, -20px) scale(1.1); }
        80% { opacity: 0.6; }
        100% { transform: translate(4px, -45px) scale(1.5); opacity: 0; }
      }
      @keyframes tankHover {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-6px) rotate(1.5deg); }
      }
      @keyframes hoseDrift {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(6deg); }
      }
      .bub-1 { animation: bubbleWobble 2.6s infinite ease-in; }
      .bub-2 { animation: bubbleWobble 3.2s infinite ease-in 0.5s; opacity: 0; }
      .bub-3 { animation: bubbleWobble 2.8s infinite ease-in 1.2s; opacity: 0; }
      .bub-4 { animation: bubbleWobble 3.5s infinite ease-in 1.8s; opacity: 0; }
      .tank-body { transform-origin: center; animation: tankHover 4.5s ease-in-out infinite; }
      .hose { transform-origin: 50px 14px; animation: hoseDrift 3.5s ease-in-out infinite; }
    `}</style>
    <defs>
      <linearGradient id="grad-tank-neon" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="25%" stopColor="#fde047" />
        <stop offset="60%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="grad-valve" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    
    {/* 曲折上升的真實氣泡效果 */}
    <circle cx="48" cy="20" r="4.5" fill="#22d3ee" className="bub-1" />
    <circle cx="56" cy="22" r="3" fill="#67e8f9" className="bub-2" />
    <circle cx="40" cy="18" r="5" fill="#a5f3fc" className="bub-3" />
    <circle cx="52" cy="15" r="2.5" fill="#cffafe" className="bub-4" />
    
    {/* 將氣瓶本體群組化加上懸浮動畫 */}
    <g className="tank-body">
      {/* 深黑/亮藍 固定帶 */}
      <path d="M 30 45 H 70" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
      <path d="M 30 75 H 70" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
      <path d="M 30 45 H 70" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 3" />
      <path d="M 30 75 H 70" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 3" />
      
      {/* 單氣瓶主體 */}
      <rect x="35" y="28" width="30" height="65" rx="15" fill="url(#grad-tank-neon)" />
      <rect x="40" y="32" width="5" height="55" rx="2.5" fill="#ffffff" opacity="0.65" />
      
      {/* 閥門一級頭 */}
      <rect x="42" y="20" width="16" height="10" rx="3" fill="url(#grad-valve)" />
      <path d="M 50 20 V 14" stroke="url(#grad-valve)" strokeWidth="8" strokeLinecap="round" />
      <path d="M 44 16 H 56" stroke="url(#grad-valve)" strokeWidth="4" strokeLinecap="round" />
      
      {/* 螢光綠色軟管，加入水流中的獨立漂動動畫 */}
      <g className="hose">
        <path d="M 50 14 Q 75 0, 80 25 Q 85 45, 70 55" fill="none" stroke="#4ade80" strokeWidth="4.5" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

const AnchorBg = () => (
  <svg className="w-56 h-56 overflow-visible opacity-[0.7] group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-105" viewBox="-10 -20 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes anchorBob {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(-3deg); }
      }
      @keyframes ropeTension {
        0%, 100% { transform: scaleY(1) translateY(0); }
        50% { transform: scaleY(1.04) translateY(-3px); }
      }
      @keyframes waterRing {
        0% { r: 10; stroke-width: 6; opacity: 0.6; }
        100% { r: 35; stroke-width: 1; opacity: 0; }
      }
      .anchor-main { transform-origin: 50% 50%; animation: anchorBob 5s ease-in-out infinite; }
      .rope-main { transform-origin: top center; animation: ropeTension 5s ease-in-out infinite; }
      .ring-pulse { transform-origin: center; animation: waterRing 3s cubic-bezier(0.21, 0.53, 0.56, 0.8) infinite; }
    `}</style>
    <defs>
      <linearGradient id="grad-anchor-vibrant" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
      <linearGradient id="grad-rope" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
    </defs>
    
    {/* 船錨浮動主群組 */}
    <g className="anchor-main">
      {/* 擴散的水波紋 / 聲納訊號感 */}
      <circle cx="50" cy="22" r="10" stroke="#60a5fa" fill="none" className="ring-pulse" />
      
      <circle cx="50" cy="22" r="10" stroke="url(#grad-anchor-vibrant)" strokeWidth="6" fill="#eff6ff" />
      
      <line x1="20" y1="42" x2="80" y2="42" stroke="url(#grad-anchor-vibrant)" strokeWidth="8" strokeLinecap="round" />
      <circle cx="20" cy="42" r="4.5" fill="#60a5fa" />
      <circle cx="80" cy="42" r="4.5" fill="#60a5fa" />
      
      <line x1="50" y1="32" x2="50" y2="85" stroke="url(#grad-anchor-vibrant)" strokeWidth="8" strokeLinecap="round" />
      
      <path d="M 15 65 C 25 100, 75 100, 85 65" stroke="url(#grad-anchor-vibrant)" strokeWidth="8" strokeLinecap="round" />
      <path d="M 10 60 L 20 70 L 25 55 Z" fill="#60a5fa" />
      <path d="M 90 60 L 80 70 L 75 55 Z" fill="#60a5fa" />
    </g>

    {/* 模擬拉扯張力的繩索群組 */}
    <g className="rope-main">
      <path d="M 50 22 Q 35 15, 30 5 Q 40 -5, 55 5 Q 70 15, 50 30 Q 30 45, 50 55 Q 70 65, 50 75 Q 30 85, 40 95" fill="none" stroke="url(#grad-rope)" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

function QuickCard({ icon, title, desc, onClick, colorTheme = "cyan", bgIcon }) {
  const themeMap = {
    teal: {
      wrapper: "border-teal-100 hover:border-teal-300 hover:shadow-[0_15px_30px_rgba(20,184,166,0.15)]",
      iconBg: "bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 group-hover:from-teal-400 group-hover:to-teal-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]",
      titleHover: "group-hover:text-teal-700",
      watermark: "text-teal-400",
      glow: "bg-teal-400/10"
    },
    cyan: {
      wrapper: "border-cyan-100 hover:border-cyan-300 hover:shadow-[0_15px_30px_rgba(6,182,212,0.15)]",
      iconBg: "bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-600 group-hover:from-cyan-400 group-hover:to-cyan-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
      titleHover: "group-hover:text-cyan-700",
      watermark: "text-cyan-400",
      glow: "bg-cyan-400/10"
    },
    indigo: {
      wrapper: "border-indigo-100 hover:border-indigo-300 hover:shadow-[0_15px_30px_rgba(99,102,241,0.15)]",
      iconBg: "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 group-hover:from-indigo-400 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]",
      titleHover: "group-hover:text-indigo-700",
      watermark: "text-indigo-400",
      glow: "bg-indigo-400/10"
    }
  };
  
  const theme = themeMap[colorTheme] || themeMap.cyan;
  
  return (
    <div onClick={onClick} className={`bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer group hover:-translate-y-2 relative overflow-hidden ${theme.wrapper}`}>
      {/* 調整圖標容器定位與大小，配合放大的 viewBox 與 SVG 尺寸以防止截斷 */}
      {bgIcon && <div className="absolute -right-8 -bottom-8 pointer-events-none z-0 transform-gpu">{bgIcon}</div>}
      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] relative z-10 ${theme.iconBg}`}>
        {icon}
      </div>
      
      <div className="relative z-10">
         <h3 className={`text-xl font-black text-slate-800 mb-2 transition-colors ${theme.titleHover}`}>{String(title)}</h3>
         <p className="text-slate-500 text-sm font-bold leading-relaxed">{String(desc)}</p>
      </div>
    </div>
  );
}

function AdminTabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center w-full p-4 border-b border-slate-100 transition-all group ${active ? 'bg-blue-50 text-blue-700 font-bold border-l-[4px] border-l-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
      <span className={`mr-3 ${active ? 'text-blue-600' : 'text-slate-400'}`}>{icon}</span> 
      <span className="font-bold">{String(label)}</span>
    </button>
  );
}

function SubTabBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${active ? 'bg-white shadow-sm text-blue-700 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-200/50'}`}>
      {String(label)}
    </button>
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
        setYear(parts[0]);
        setMonth(String(parseInt(parts[1], 10)));
        setDay(String(parseInt(parts[2], 10)));
      }
    }
  }, [value]);

  const getDaysInMonth = (y, m) => {
    if (!y || !m) return 31;
    return new Date(y, m, 0).getDate();
  };

  const handleUpdate = (y, m, d) => {
    const maxDays = getDaysInMonth(y, m);
    let newD = d;
    // 如果切換大小月導致天數超出該月上限，自動修正
    if (d && parseInt(d, 10) > maxDays) {
       newD = String(maxDays);
    }
    setYear(y); setMonth(m); setDay(newD);
    
    if (y && m && newD) {
      onChange(`${y}-${String(m).padStart(2, '0')}-${String(newD).padStart(2, '0')}`);
    } else {
      onChange('');
    }
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
        <div className="relative flex-[4]">
           <select value={year} onChange={e => handleUpdate(e.target.value, month, day)} className={selectClass}>
             <option value="" disabled>年份</option>
             {years.map(y => <option key={y} value={y}>{y}</option>)}
           </select>
           <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative flex-[3]">
           <select value={month} onChange={e => handleUpdate(year, e.target.value, day)} className={selectClass}>
             <option value="" disabled>月</option>
             {months.map(m => <option key={m} value={m}>{m}</option>)}
           </select>
           <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative flex-[3]">
           <select value={day} onChange={e => handleUpdate(year, month, e.target.value)} className={selectClass}>
             <option value="" disabled>日</option>
             {days.map(d => <option key={d} value={d}>{d}</option>)}
           </select>
           <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

// --- 專屬設計的背景鯨鯊 SVG 動畫 (根據照片特徵還原) ---
const ContactWhaleSharkBg = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-3xl">
    <style>{`
      @keyframes bgWhaleSharkSwimRight {
        0% { transform: translateX(-60%) translateY(50px) rotate(-3deg); opacity: 0; }
        15% { opacity: 0.15; }
        50% { transform: translateX(10%) translateY(-20px) rotate(1deg); opacity: 0.15; }
        85% { opacity: 0.15; }
        100% { transform: translateX(100%) translateY(30px) rotate(-2deg); opacity: 0; }
      }
      @keyframes pilotFishHover1 {
        0%, 100% { transform: translate(450px, 80px) scale(0.65) rotate(0deg); }
        50% { transform: translate(440px, 70px) scale(0.65) rotate(5deg); }
      }
      @keyframes pilotFishHover2 {
        0%, 100% { transform: translate(520px, 120px) scale(0.5) rotate(0deg); }
        50% { transform: translate(530px, 110px) scale(0.5) rotate(-3deg); }
      }
      .ws-bg-anim {
        animation: bgWhaleSharkSwimRight 40s ease-in-out infinite;
        width: 180%;
        position: absolute;
        top: 10%;
        left: -30%;
      }
      @media (min-width: 1024px) {
        .ws-bg-anim {
          width: 120%;
          top: 0%;
          left: -10%;
        }
      }
      .pf-anim-1 { animation: pilotFishHover1 3.5s ease-in-out infinite; }
      .pf-anim-2 { animation: pilotFishHover2 4.2s ease-in-out infinite 0.5s; }
    `}</style>
    <svg className="ws-bg-anim" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
         <linearGradient id="wsBgGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="30%" stopColor="#0f172a" />
            <stop offset="70%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0284c7" />
         </linearGradient>
      </defs>

      {/* Upper Caudal Fin (照片中極修長的上尾葉) */}
      <path d="M 250 320 Q 100 120 0 20 Q 80 150 220 340 Z" fill="url(#wsBgGrad)" />
      {/* Lower Caudal Fin (下尾葉) */}
      <path d="M 220 340 Q 150 480 100 550 Q 180 450 260 370 Z" fill="url(#wsBgGrad)" />

      {/* First Dorsal Fin (第一背鰭) */}
      <path d="M 520 220 Q 450 100 380 80 Q 420 180 440 230 Z" fill="url(#wsBgGrad)" />
      {/* Second Dorsal Fin (第二背鰭) */}
      <path d="M 320 270 Q 280 200 250 200 Q 270 250 290 280 Z" fill="url(#wsBgGrad)" />

      {/* Pectoral Fin (寬大的胸鰭) */}
      <path d="M 750 400 C 700 550 550 650 500 650 C 600 550 680 450 700 380 Z" fill="url(#wsBgGrad)" />
      {/* Pelvic Fin (腹鰭) */}
      <path d="M 400 400 Q 350 480 320 500 Q 360 430 380 400 Z" fill="url(#wsBgGrad)" />

      {/* Main Body (龐大的主身軀與扁平頭部) */}
      <path d="M 250 320 C 400 220 600 180 800 200 C 1000 220 1150 280 1180 320 C 1180 350 1150 380 1000 400 C 800 430 500 430 260 370 Z" fill="url(#wsBgGrad)" />

      {/* Gill Slits (5道明顯的垂直鰓裂) */}
      <g stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" opacity="0.7">
         <path d="M 850 280 Q 830 320 840 370" />
         <path d="M 820 285 Q 800 325 810 375" />
         <path d="M 790 290 Q 770 330 780 380" />
         <path d="M 760 295 Q 740 335 750 385" />
         <path d="M 730 300 Q 710 340 720 390" />
      </g>

      {/* Distinct Checkerboard/Maze Grid (側面的網格白線特徵) */}
      <g stroke="#f8fafc" strokeWidth="2.5" fill="none" opacity="0.45">
         <path d="M 680 200 Q 650 280 680 410" />
         <path d="M 630 200 Q 600 280 630 415" />
         <path d="M 580 205 Q 550 280 580 420" />
         <path d="M 530 215 Q 500 280 530 415" />
         <path d="M 480 220 Q 450 280 480 405" />
         <path d="M 430 230 Q 400 280 430 395" />
         <path d="M 380 240 Q 350 290 380 385" />
         <path d="M 330 255 Q 310 290 330 370" />
         <path d="M 300 290 Q 500 260 700 250" />
         <path d="M 280 320 Q 500 300 700 290" />
         <path d="M 270 350 Q 500 340 680 330" />
         <path d="M 320 380 Q 450 380 650 370" />
      </g>

      {/* White Spots (散落與網格內的白斑) */}
      <g fill="#f8fafc" opacity="0.8">
         <circle cx="880" cy="300" r="4"/><circle cx="900" cy="280" r="3.5"/><circle cx="920" cy="310" r="5"/>
         <circle cx="870" cy="330" r="4.5"/><circle cx="910" cy="340" r="4"/><circle cx="930" cy="290" r="3"/>
         <circle cx="950" cy="320" r="4.5"/><circle cx="940" cy="350" r="3.5"/><circle cx="970" cy="310" r="4"/>
         <circle cx="655" cy="230" r="5"/><circle cx="655" cy="270" r="4"/><circle cx="655" cy="310" r="4.5"/><circle cx="655" cy="350" r="4"/>
         <circle cx="605" cy="235" r="4"/><circle cx="605" cy="275" r="4.5"/><circle cx="605" cy="315" r="5"/><circle cx="605" cy="355" r="4"/>
         <circle cx="555" cy="240" r="5"/><circle cx="555" cy="280" r="4"/><circle cx="555" cy="320" r="4.5"/><circle cx="555" cy="360" r="4"/>
         <circle cx="505" cy="245" r="4.5"/><circle cx="505" cy="285" r="5"/><circle cx="505" cy="325" r="4"/><circle cx="505" cy="365" r="4"/>
         <circle cx="455" cy="250" r="4"/><circle cx="455" cy="290" r="4.5"/><circle cx="455" cy="330" r="4"/><circle cx="455" cy="370" r="3.5"/>
         <circle cx="405" cy="255" r="4"/><circle cx="405" cy="295" r="4"/><circle cx="405" cy="335" r="3.5"/><circle cx="405" cy="375" r="4"/>
         <circle cx="355" cy="265" r="3.5"/><circle cx="355" cy="305" r="4"/><circle cx="355" cy="345" r="3.5"/>
         <circle cx="305" cy="280" r="3"/><circle cx="305" cy="320" r="3.5"/><circle cx="305" cy="355" r="3"/>
         <circle cx="630" cy="220" r="2.5"/><circle cx="580" cy="260" r="3"/><circle cx="530" cy="300" r="2.5"/>
         <circle cx="480" cy="340" r="3"/><circle cx="430" cy="270" r="2.5"/><circle cx="380" cy="310" r="3"/>
      </g>

      {/* Pilot Fish 1 (上方隨行的黑白條紋嚮導魚 1) */}
      <g className="pf-anim-1">
         <path d="M 0 20 Q 30 -5 60 20 Q 30 45 0 20 Z" fill="#f8fafc" />
         <path d="M 0 20 L -15 5 L -10 20 L -15 35 Z" fill="#f8fafc" />
         <path d="M 15 10 L 10 30 M 25 5 L 20 35 M 35 3 L 30 37 M 45 6 L 40 34" stroke="#0f172a" strokeWidth="4" />
         <circle cx="50" cy="18" r="2" fill="#0f172a" />
      </g>

      {/* Pilot Fish 2 (上方隨行的黑白條紋嚮導魚 2) */}
      <g className="pf-anim-2">
         <path d="M 0 20 Q 30 -5 60 20 Q 30 45 0 20 Z" fill="#f8fafc" />
         <path d="M 0 20 L -15 5 L -10 20 L -15 35 Z" fill="#f8fafc" />
         <path d="M 15 10 L 10 30 M 25 5 L 20 35 M 35 3 L 30 37 M 45 6 L 40 34" stroke="#0f172a" strokeWidth="4" />
         <circle cx="50" cy="18" r="2" fill="#0f172a" />
      </g>
    </svg>
  </div>
);

// --- 聯絡資料卡片專屬：微型鮮豔海洋元素 ---
const MiniOceanDecor = ({ highlight, animal = 'fish' }) => {
  const isLine = highlight === 'line';
  const isBlue = highlight === true || highlight === 'blue';

  const coralColor1 = isLine ? "#059669" : isBlue ? "#0284c7" : "#6366f1";
  const coralColor2 = isLine ? "#34d399" : isBlue ? "#38bdf8" : "#a78bfa";
  const bubbleColor = isLine ? "#6ee7b7" : isBlue ? "#7dd3fc" : "#c4b5fd";
  const fishColor = isLine ? "#fde047" : isBlue ? "#fca5a5" : "#fcd34d";
  const uid = Math.random().toString(36).substring(7);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[2rem]">
       <style>{`
         @keyframes miniFloat { 0% { transform: translateY(10px) scale(0.8); opacity: 0; } 20% { opacity: 0.8; } 80% { opacity: 0.4; } 100% { transform: translateY(-50px) scale(1.2); opacity: 0; } }
         
         /* 魟魚：左下向右上優雅滑翔，帶有起伏傾斜 */
         @keyframes mantaGlide {
           0% { transform: translate(-100px, 100px) scale(1.1) rotate(-15deg); opacity: 0; }
           15% { opacity: 0.95; }
           50% { transform: translate(120px, -10px) scale(1.4) rotate(5deg); }
           85% { opacity: 0.95; }
           100% { transform: translate(350px, -60px) scale(1.2) rotate(15deg); opacity: 0; }
         }

         /* 刺龍蝦：向後彈跳 (Tail-flip escape)，龍蝦受驚時會用力收縮尾巴向後快速游動 */
         @keyframes lobsterJumpBack {
           0% { transform: translate(380px, 15px) scale(1.2); opacity: 0; }
           10% { opacity: 1; transform: translate(300px, 15px) scale(1.2); }
           15% { transform: translate(300px, 15px) scale(1.2) rotate(0deg); }
           20% { transform: translate(220px, -15px) scale(1.2) rotate(20deg); } /* 彈跳 1 */
           28% { transform: translate(180px, 15px) scale(1.2) rotate(0deg); }
           38% { transform: translate(180px, 15px) scale(1.2); }
           43% { transform: translate(100px, -15px) scale(1.2) rotate(20deg); } /* 彈跳 2 */
           51% { transform: translate(60px, 15px) scale(1.2) rotate(0deg); }
           61% { transform: translate(60px, 15px) scale(1.2); }
           66% { transform: translate(-20px, -15px) scale(1.2) rotate(20deg); } /* 彈跳 3 */
           74% { transform: translate(-60px, 15px) scale(1.2) rotate(0deg); }
           85% { opacity: 1; transform: translate(-60px, 15px) scale(1.2); }
           100% { transform: translate(-150px, 15px) scale(1.2); opacity: 0; }
         }

         /* 鯨鯊：修改為從右向左游動 (面向左側，從右往左移動) */
         @keyframes whaleSharkSwim {
           0% { transform: translate(350px, 10px) scale(-1.5, 1.5); opacity: 0; }
           15% { opacity: 0.95; }
           50% { transform: translate(-50px, -5px) scale(-1.5, 1.5); }
           85% { opacity: 0.95; }
           100% { transform: translate(-450px, 15px) scale(-1.5, 1.5); opacity: 0; }
         }

         /* 深海巨怪 (Kraken) 沉重呼吸與色相微調 */
         @keyframes krakenBreathe {
           0%, 100% { transform: scale(1) translateY(0px); filter: hue-rotate(0deg); opacity: 0.9; }
           50% { transform: scale(1.03) translateY(-4px); filter: hue-rotate(10deg); opacity: 1; }
         }

         /* 巨怪觸手各種層次的蠕動 */
         @keyframes krakenArmL {
           0%, 100% { transform: rotate(0deg) scale(1); }
           50% { transform: rotate(5deg) scale(1.02); }
         }
         @keyframes krakenArmR {
           0%, 100% { transform: rotate(0deg) scale(1); }
           50% { transform: rotate(-5deg) scale(1.02); }
         }
         @keyframes krakenArmFrontL {
           0%, 100% { transform: rotate(0deg) scale(1); }
           50% { transform: rotate(7deg) scale(1.04) translateX(5px); }
         }
         @keyframes krakenArmFrontR {
           0%, 100% { transform: rotate(0deg) scale(1); }
           50% { transform: rotate(-7deg) scale(1.04) translateX(-5px); }
         }

         @keyframes miniFish {
           0% { transform: translate(-40px, 10px) scale(0.8); opacity: 0; }
           15% { opacity: 1; }
           85% { opacity: 1; }
           100% { transform: translate(350px, -20px) scale(1.1); opacity: 0; }
         }
         
         .mini-bub { animation: miniFloat 3s linear infinite; }
         .anim-manta { animation: mantaGlide 15s ease-in-out infinite; }
         .anim-lobster { animation: lobsterJumpBack 14s linear infinite; }
         .anim-whale-shark { animation: whaleSharkSwim 24s linear infinite; }
         
         /* 巨怪動畫綁定 */
         .anim-kraken-fixed { animation: krakenBreathe 8s ease-in-out infinite; transform-origin: center; }
         .kraken-arm-l { animation: krakenArmL 7s ease-in-out infinite; transform-origin: 150px 130px; }
         .kraken-arm-r { animation: krakenArmR 8s ease-in-out infinite; transform-origin: 150px 130px; }
         .kraken-arm-fl { animation: krakenArmFrontL 6s ease-in-out infinite; transform-origin: 150px 130px; }
         .kraken-arm-fr { animation: krakenArmFrontR 6.5s ease-in-out infinite; transform-origin: 150px 130px; }
         
         .mini-fish { animation: miniFish 8s linear infinite; }
       `}</style>
       
       <svg className="absolute -bottom-2 -right-4 w-28 h-28 opacity-[0.35] group-hover:opacity-[0.75] transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-6 origin-bottom-right" viewBox="0 0 100 100" fill="none">
         <defs>
           <linearGradient id={`grad-mini-${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
             <stop offset="0%" stopColor={coralColor1} />
             <stop offset="100%" stopColor={coralColor2} />
           </linearGradient>
         </defs>
         <path d="M 40 100 Q 50 70, 35 40 T 45 0 Q 25 30, 30 60 T 30 100 Z" fill={`url(#grad-mini-${uid})`} />
         <path d="M 70 100 Q 85 75, 75 50 T 90 10 Q 65 40, 70 70 T 60 100 Z" fill={`url(#grad-mini-${uid})`} opacity="0.8" />
         <path d="M 10 100 Q 5 80, 15 60 T 0 30 Q 20 50, 10 70 T 25 100 Z" fill={`url(#grad-mini-${uid})`} opacity="0.6" />
       </svg>
       
       <div className="absolute w-2 h-2 rounded-full mix-blend-multiply mini-bub" style={{ backgroundColor: bubbleColor, opacity: 0.6, right: '15%', bottom: '-10px' }} />
       <div className="absolute w-3.5 h-3.5 rounded-full mix-blend-multiply mini-bub" style={{ backgroundColor: bubbleColor, opacity: 0.4, right: '25%', bottom: '-20px', animationDelay: '1.2s', animationDuration: '4s' }} />
       <div className="absolute w-1.5 h-1.5 rounded-full mix-blend-multiply mini-bub" style={{ backgroundColor: bubbleColor, opacity: 0.7, right: '8%', bottom: '-5px', animationDelay: '0.5s', animationDuration: '2.5s' }} />
       
       {animal === 'manta' && (
         <svg className="absolute top-[25%] -left-20 w-44 h-44 opacity-0 group-hover:opacity-100 transition-opacity duration-300 anim-manta" style={{ animationDelay: '0.1s' }} viewBox="0 0 200 200" fill="none">
           <defs>
             <linearGradient id={`grad-manta-dark-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#020617" />
               <stop offset="50%" stopColor="#0f172a" />
               <stop offset="100%" stopColor="#1e3a8a" />
             </linearGradient>
             <linearGradient id={`grad-manta-light-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#f8fafc" />
               <stop offset="100%" stopColor="#e2e8f0" />
             </linearGradient>
           </defs>
           
           {/* 將整個圖形旋轉 90 度，使其面向右方，配合游動動畫方向 */}
           <g transform="translate(100, 100) rotate(90) translate(-100, -100)">
             
             {/* 細長尾巴 */}
             <path d="M 100 135 C 100 180, 90 200, 90 220" stroke={`url(#grad-manta-dark-${uid})`} strokeWidth="3" strokeLinecap="round" />
             <path d="M 100 135 C 100 180, 110 200, 110 220" stroke="#0f172a" strokeWidth="1" opacity="0.4"/>

             {/* 黑色主體剪影 (露出於邊緣的背部) */}
             <path d="M 100 150 C 130 140, 190 100, 195 80 C 170 60, 140 45, 125 42 C 115 40, 85 40, 75 42 C 60 45, 30 60, 5 80 C 10 100, 70 140, 100 150 Z" fill={`url(#grad-manta-dark-${uid})`} />

             {/* 白色腹部 (Ventral area) */}
             <path d="M 100 135 C 120 120, 175 90, 185 80 C 160 65, 135 50, 120 48 L 80 48 C 65 50, 40 65, 15 80 C 25 90, 80 120, 100 135 Z" fill={`url(#grad-manta-light-${uid})`} />

             {/* 腹部特有的大面積黑色斑紋 (參考照片中的黑色區塊) */}
             <path d="M 100 145 C 110 135, 135 115, 145 105 C 125 102, 110 115, 100 120 C 90 115, 75 102, 55 105 C 65 115, 90 135, 100 145 Z" fill={`url(#grad-manta-dark-${uid})`} opacity="0.9" />
             <path d="M 100 95 C 120 95, 135 85, 145 80 C 125 78, 110 85, 100 88 C 90 85, 75 78, 55 80 C 65 85, 80 95, 100 95 Z" fill={`url(#grad-manta-dark-${uid})`} opacity="0.85" />
             <path d="M 20 85 C 30 95, 45 105, 55 110 C 45 100, 30 90, 20 85 Z" fill="#0f172a" opacity="0.6" />
             <path d="M 180 85 C 170 95, 155 105, 145 110 C 155 100, 170 90, 180 85 Z" fill="#0f172a" opacity="0.6" />

             {/* 5 對清晰的鰓裂 (Gills) */}
             <g stroke="#0f172a" strokeWidth="2" strokeLinecap="round">
               <line x1="85" y1="58" x2="73" y2="62" />
               <line x1="86" y1="63" x2="74" y2="67" />
               <line x1="87" y1="68" x2="75" y2="72" />
               <line x1="88" y1="73" x2="76" y2="77" />
               <line x1="89" y1="78" x2="77" y2="82" />

               <line x1="115" y1="58" x2="127" y2="62" />
               <line x1="114" y1="63" x2="126" y2="67" />
               <line x1="113" y1="68" x2="125" y2="72" />
               <line x1="112" y1="73" x2="124" y2="77" />
               <line x1="111" y1="78" x2="123" y2="82" />
             </g>

             {/* 寬大的端位口 (Mouth) */}
             <path d="M 75 42 Q 100 30 125 42 Q 100 52 75 42 Z" fill="#020617" />
             <path d="M 78 44 Q 100 48 122 44" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.9" />

             {/* 頭鰭/角 (Cephalic lobes) - 向內彎曲 */}
             {/* 左頭鰭 */}
             <path d="M 72 41 C 60 25, 45 15, 50 15 C 55 20, 65 30, 78 40 Z" fill={`url(#grad-manta-dark-${uid})`} />
             <path d="M 73 42 C 62 28, 50 20, 52 20 C 58 25, 68 34, 76 41 Z" fill="#f8fafc" />

             {/* 右頭鰭 */}
             <path d="M 128 41 C 140 25, 155 15, 150 15 C 145 20, 135 30, 122 40 Z" fill={`url(#grad-manta-dark-${uid})`} />
             <path d="M 127 42 C 138 28, 150 20, 148 20 C 142 25, 132 34, 124 41 Z" fill="#f8fafc" />
           </g>
         </svg>
       )}

       {animal === 'shark' && (
         <svg className="absolute top-[10%] right-[-50px] w-[280px] h-[160px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 anim-whale-shark" style={{ animationDelay: '0.2s' }} viewBox="0 0 240 120" fill="none">
           <defs>
             <linearGradient id={`grad-shark-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" stopColor="#1e293b" />
               <stop offset="40%" stopColor="#334155" />
               <stop offset="80%" stopColor="#64748b" />
               <stop offset="100%" stopColor="#94a3b8" />
             </linearGradient>
           </defs>
           
           {/* 俯視角度的尾鰭 (Crescent tail sweeping side to side) */}
           <path d="M 40 60 C 25 40, 5 25, 0 35 C 10 45, 20 55, 20 60 C 20 65, 10 75, 0 85 C 5 95, 25 80, 40 60 Z" fill={`url(#grad-shark-${uid})`} />
           
           {/* 腹鰭 (Pelvic fins) */}
           <path d="M 75 50 C 65 40, 60 40, 65 50 Z" fill="#334155" />
           <path d="M 75 70 C 65 80, 60 80, 65 70 Z" fill="#334155" />

           {/* 寬扁頭部與龐大身軀 (Broad flat head, tapering body) */}
           <path d="M 185 50 C 190 40, 185 35, 175 35 C 130 30, 80 40, 40 50 C 40 60, 40 60, 40 70 C 80 80, 130 90, 175 85 C 185 85, 190 80, 185 70 C 195 65, 195 55, 185 50 Z" fill={`url(#grad-shark-${uid})`} />
           
           {/* 巨大的胸鰭 (Pectoral fins) */}
           <path d="M 140 36 C 135 15, 110 5, 105 20 C 115 30, 125 35, 130 38 Z" fill="#1e293b" />
           <path d="M 140 84 C 135 105, 110 115, 105 100 C 115 90, 125 85, 130 82 Z" fill="#1e293b" />
           
           {/* 背鰭 (從正上方看是一個微突的脊) */}
           <path d="M 100 55 C 110 55, 120 60, 110 60 C 100 60, 95 55, 100 55 Z" fill="#0f172a" opacity="0.6" />

           {/* 體側隆脊 (Ridges) */}
           <path d="M 60 42 C 100 38, 140 40, 170 42" stroke="#475569" strokeWidth="1.5" fill="none" />
           <path d="M 60 78 C 100 82, 140 80, 170 78" stroke="#475569" strokeWidth="1.5" fill="none" />
           
           {/* 明顯的五道鰓裂 (5 Gill slits visible on sides) */}
           <g stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
             <path d="M 145 35 L 140 38" /><path d="M 150 35 L 145 38" /><path d="M 155 36 L 150 39" /><path d="M 160 36 L 155 39" /><path d="M 165 37 L 160 40" />
             <path d="M 145 85 L 140 82" /><path d="M 150 85 L 145 82" /><path d="M 155 84 L 150 81" /><path d="M 160 84 L 155 81" /><path d="M 165 83 L 160 80" />
           </g>

           {/* 寫實棋盤式斑點與直紋 (Checkerboard pattern) */}
           <g stroke="#f8fafc" strokeWidth="0.8" opacity="0.2" fill="none">
             <path d="M 160 45 C 120 40, 80 45, 50 52" />
             <path d="M 160 75 C 120 80, 80 75, 50 68" />
             <path d="M 150 38 Q 148 60 150 82" />
             <path d="M 130 35 Q 128 60 130 85" />
             <path d="M 110 34 Q 108 60 110 86" />
             <path d="M 90 35 Q 88 60 90 85" />
             <path d="M 70 40 Q 68 60 70 80" />
           </g>
           
           <g fill="#f8fafc" opacity="0.85">
             {/* 散落的斑點 (Whale Shark Spots) */}
             <circle cx="165" cy="45" r="1.5" /><circle cx="155" cy="40" r="2" /><circle cx="145" cy="45" r="2.5" />
             <circle cx="135" cy="42" r="1.5" /><circle cx="125" cy="46" r="2.5" /><circle cx="115" cy="40" r="2" />
             <circle cx="105" cy="45" r="3" /><circle cx="95" cy="42" r="2" /><circle cx="85" cy="46" r="2.5" />
             <circle cx="75" cy="43" r="1.5" /><circle cx="65" cy="48" r="2" /><circle cx="55" cy="45" r="1.5" />
             
             <circle cx="165" cy="75" r="1.5" /><circle cx="155" cy="80" r="2" /><circle cx="145" cy="75" r="2.5" />
             <circle cx="135" cy="78" r="1.5" /><circle cx="125" cy="74" r="2.5" /><circle cx="115" cy="80" r="2" />
             <circle cx="105" cy="75" r="3" /><circle cx="95" cy="78" r="2" /><circle cx="85" cy="74" r="2.5" />
             <circle cx="75" cy="77" r="1.5" /><circle cx="65" cy="72" r="2" /><circle cx="55" cy="75" r="1.5" />
             
             <circle cx="150" cy="60" r="2" /><circle cx="130" cy="55" r="2.5" /><circle cx="110" cy="65" r="2" />
             <circle cx="90" cy="55" r="2.5" /><circle cx="70" cy="62" r="2" /><circle cx="50" cy="58" r="1.5" />
           </g>

           {/* 位於頭部兩側的小眼睛 */}
           <circle cx="180" cy="38" r="1.5" fill="#0f172a" />
           <circle cx="180" cy="82" r="1.5" fill="#0f172a" />
           {/* 最前端寬扁的嘴巴 */}
           <path d="M 187 45 Q 192 60 187 75" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
         </svg>
       )}

       {animal === 'lobster' && (
         <svg className="absolute bottom-4 -right-10 w-[180px] h-[180px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 anim-lobster" style={{ animationDelay: '0.1s' }} viewBox="0 0 160 120" fill="none">
           <defs>
             <linearGradient id={`grad-lobster-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#9f1239" />
               <stop offset="100%" stopColor="#ea580c" />
             </linearGradient>
           </defs>
           
           <g transform="translate(10, 0)">
             <path d="M 105 55 C 130 30, 160 10, 150 -10" stroke="#fdba74" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />
             <path d="M 105 55 C 130 80, 160 100, 150 120" stroke="#f97316" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.9" />
             <path d="M 105 55 L 115 48 L 112 52 Z M 105 55 L 115 62 L 112 58 Z" fill="#7f1d1d" />

             <g stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
               <path d="M 85 45 L 95 30 L 85 20" /><path d="M 80 48 L 90 28 L 80 15" />
               <path d="M 75 50 L 85 25 L 75 10" /><path d="M 70 52 L 80 22 L 70 5" />
               
               <path d="M 85 65 L 95 80 L 85 90" /><path d="M 80 62 L 90 82 L 80 95" />
               <path d="M 75 60 L 85 85 L 75 100" /><path d="M 70 58 L 80 88 L 70 105" />
             </g>

             <path d="M 102 55 C 95 40, 65 40, 60 55 C 65 70, 95 70, 102 55 Z" fill={`url(#grad-lobster-${uid})`} />
             <path d="M 95 48 L 98 45 M 85 45 L 88 42 M 75 46 L 78 43 M 95 62 L 98 65 M 85 65 L 88 68 M 75 64 L 78 67" stroke="#fbd38d" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
             
             <path d="M 62 55 C 60 42, 50 45, 48 55 C 50 65, 60 68, 62 55 Z" fill="#9f1239" />
             <path d="M 50 55 C 48 44, 38 46, 36 55 C 38 64, 48 66, 50 55 Z" fill="#be123c" />
             <path d="M 38 55 C 36 46, 26 48, 24 55 C 26 62, 36 64, 38 55 Z" fill="#e11d48" />
             <path d="M 26 55 C 24 48, 16 49, 14 55 C 16 61, 24 62, 26 55 Z" fill="#f97316" />
             
             <path d="M 16 55 L 2 40 L -5 50 L -8 55 L -5 60 L 2 70 L 16 55 Z" fill={`url(#grad-lobster-${uid})`} />
             <path d="M 10 55 L 0 45 M 8 55 L -2 55 M 10 55 L 0 65" stroke="#7f1d1d" strokeWidth="1.5" />
             <path d="M 100 50 L 105 48 M 100 60 L 105 62" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
             
             <circle cx="106" cy="47" r="2.5" fill="#000" />
             <circle cx="106" cy="63" r="2.5" fill="#000" />
             <circle cx="107" cy="46" r="1" fill="#fff" />
             <circle cx="107" cy="62" r="1" fill="#fff" />
           </g>
         </svg>
       )}

       {animal === 'octopus' && (
         <div className="absolute bottom-0 right-0 w-[240px] h-[240px] opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out anim-kraken-fixed pointer-events-none">
           {/* 極大化 viewBox 防護區 (-50 -50 400 400)，確保巨怪觸手與陰影絕對不被裁切 */}
           <svg viewBox="-50 -50 400 400" fill="none" className="w-full h-full drop-shadow-[0_15px_35px_rgba(30,27,75,0.6)] overflow-visible" style={{ transform: 'scaleX(-1)' }}>
             <defs>
               {/* 深淵巨怪主漸層 (血紅 -> 焦糖橘 -> 深紫黑) */}
               <linearGradient id={`grad-kraken-body-${uid}`} x1="20%" y1="0%" x2="80%" y2="100%">
                 <stop offset="0%" stopColor="#581c0c" />
                 <stop offset="50%" stopColor="#c2410c" />
                 <stop offset="100%" stopColor="#1e1b4b" />
               </linearGradient>
               {/* 巨怪惡魔之眼漸層 */}
               <linearGradient id={`grad-kraken-eye-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#fef08a" />
                 <stop offset="50%" stopColor="#f59e0b" />
                 <stop offset="100%" stopColor="#b45309" />
               </linearGradient>
               {/* 吸盤發光濾鏡 */}
               <filter id={`glow-cyan-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                 <feGaussianBlur stdDeviation="3" result="blur" />
                 <feMerge>
                   <feMergeNode in="blur" />
                   <feMergeNode in="blur" />
                   <feMergeNode in="SourceGraphic" />
                 </feMerge>
               </filter>
               <filter id={`glow-cyan-strong-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                 <feGaussianBlur stdDeviation="5" result="blur" />
                 <feMerge>
                   <feMergeNode in="blur" />
                   <feMergeNode in="blur" />
                   <feMergeNode in="SourceGraphic" />
                 </feMerge>
               </filter>
             </defs>

             {/* 背後散發微弱的神祕青色光暈 */}
             <circle cx="150" cy="150" r="100" fill="#06b6d4" opacity="0.15" filter={`url(#glow-cyan-strong-${uid})`} />

             {/* 將怪物置於畫布正中 */}
             <g transform="translate(150, 150) rotate(-5) translate(-150, -150)">
               
               {/* --- 背部巨大觸手 (Top Left & Right) --- */}
               <g className="kraken-arm-l" style={{ animationDelay: '0.3s' }}>
                 <path d="M 100 140 C 40 120, -20 60, 20 10 C 60 -30, 120 10, 90 60 C 60 110, 10 70, 30 30" stroke={`url(#grad-kraken-body-${uid})`} strokeWidth="18" strokeLinecap="round" fill="none" />
                 {/* 發光青綠色邊緣與吸盤 */}
                 <path d="M 100 145 C 40 125, -15 65, 25 15 C 65 -25, 125 15, 95 65" stroke="#22d3ee" strokeWidth="4" fill="none" filter={`url(#glow-cyan-${uid})`} strokeDasharray="2 6" strokeLinecap="round" />
               </g>

               <g className="kraken-arm-r" style={{ animationDelay: '0.8s' }}>
                 <path d="M 200 140 C 260 120, 320 60, 280 10 C 240 -30, 180 10, 210 60 C 240 110, 290 70, 270 30" stroke={`url(#grad-kraken-body-${uid})`} strokeWidth="18" strokeLinecap="round" fill="none" />
                 <path d="M 200 145 C 260 125, 315 65, 275 15 C 235 -25, 175 15, 205 65" stroke="#22d3ee" strokeWidth="4" fill="none" filter={`url(#glow-cyan-${uid})`} strokeDasharray="2 6" strokeLinecap="round" />
               </g>

               {/* --- 中間向外捲曲的主觸手 (Mid Left & Right) --- */}
               <g className="kraken-arm-fl" style={{ animationDelay: '0.1s' }}>
                 <path d="M 110 160 C 30 180, -30 220, 10 290 C 50 360, 130 340, 110 270 C 90 210, 20 230, 40 280" stroke={`url(#grad-kraken-body-${uid})`} strokeWidth="22" strokeLinecap="round" fill="none" />
                 <path d="M 110 170 C 30 190, -20 230, 20 300 C 60 370, 140 350, 120 280" stroke="#67e8f9" strokeWidth="8" fill="none" filter={`url(#glow-cyan-${uid})`} strokeDasharray="1 14" strokeLinecap="round" />
                 <path d="M 110 170 C 30 190, -20 230, 20 300 C 60 370, 140 350, 120 280" stroke="#fff" strokeWidth="4" fill="none" strokeDasharray="1 14" strokeLinecap="round" />
               </g>

               <g className="kraken-arm-fr" style={{ animationDelay: '0.6s' }}>
                 <path d="M 190 160 C 270 180, 330 220, 290 290 C 250 360, 170 340, 190 270 C 210 210, 280 230, 260 280" stroke={`url(#grad-kraken-body-${uid})`} strokeWidth="22" strokeLinecap="round" fill="none" />
                 <path d="M 190 170 C 270 190, 320 230, 280 300 C 240 370, 160 350, 180 280" stroke="#67e8f9" strokeWidth="8" fill="none" filter={`url(#glow-cyan-${uid})`} strokeDasharray="1 14" strokeLinecap="round" />
                 <path d="M 190 170 C 270 190, 320 230, 280 300 C 240 370, 160 350, 180 280" stroke="#fff" strokeWidth="4" fill="none" strokeDasharray="1 14" strokeLinecap="round" />
               </g>

               {/* --- 前方極度粗壯的攻擊觸手 (Front Left & Right) --- */}
               <g className="kraken-arm-l" style={{ animationDelay: '0.4s' }}>
                 <path d="M 120 180 C 100 260, 50 370, 130 380 C 180 390, 200 330, 150 290 C 110 250, 80 310, 120 340" stroke={`url(#grad-kraken-body-${uid})`} strokeWidth="26" strokeLinecap="round" fill="none" />
                 <path d="M 110 180 C 90 260, 40 370, 120 380 C 170 390, 190 330, 140 290 C 100 250, 70 310, 110 340" stroke="#22d3ee" strokeWidth="10" fill="none" filter={`url(#glow-cyan-${uid})`} strokeDasharray="1 18" strokeLinecap="round" />
                 <path d="M 110 180 C 90 260, 40 370, 120 380 C 170 390, 190 330, 140 290 C 100 250, 70 310, 110 340" stroke="#fff" strokeWidth="5" fill="none" strokeDasharray="1 18" strokeLinecap="round" />
               </g>

               <g className="kraken-arm-r" style={{ animationDelay: '0.9s' }}>
                 <path d="M 180 180 C 200 260, 250 370, 170 380 C 120 390, 100 330, 150 290 C 190 250, 220 310, 180 340" stroke={`url(#grad-kraken-body-${uid})`} strokeWidth="26" strokeLinecap="round" fill="none" />
                 <path d="M 190 180 C 210 260, 260 370, 180 380 C 130 390, 110 330, 160 290 C 200 250, 230 310, 190 340" stroke="#22d3ee" strokeWidth="10" fill="none" filter={`url(#glow-cyan-${uid})`} strokeDasharray="1 18" strokeLinecap="round" />
                 <path d="M 190 180 C 210 260, 260 370, 180 380 C 130 390, 110 330, 160 290 C 200 250, 230 310, 190 340" stroke="#fff" strokeWidth="5" fill="none" strokeDasharray="1 18" strokeLinecap="round" />
               </g>

               {/* --- 巨怪頭部外套膜 (Monster Mantle) --- */}
               <path d="M 100 130 C 50 0, 250 0, 200 130 C 195 170, 105 170, 100 130 Z" fill={`url(#grad-kraken-body-${uid})`} />
               
               {/* 網狀/鱗片般的表皮肌理 */}
               <g stroke="#2e1065" strokeWidth="2" fill="none" opacity="0.6">
                 <path d="M 110 60 Q 150 40 190 60 M 105 80 Q 150 70 195 80 M 102 100 Q 150 100 198 100 M 100 120 Q 150 130 200 120 M 120 40 Q 110 90 120 140 M 150 35 Q 150 90 150 145 M 180 40 Q 190 90 180 140" />
                 <path d="M 135 45 Q 120 90 135 140 M 165 45 Q 180 90 165 140" />
                 <path d="M 90 100 Q 110 110 150 110 Q 190 110 210 100" />
               </g>
               
               {/* 頭頂閃爍的生物發光斑點 */}
               <g fill="#a5f3fc" opacity="0.8">
                 <circle cx="150" cy="50" r="3" filter={`url(#glow-cyan-${uid})`}/>
                 <circle cx="120" cy="70" r="2.5" filter={`url(#glow-cyan-${uid})`}/>
                 <circle cx="180" cy="70" r="2.5" filter={`url(#glow-cyan-${uid})`}/>
                 <circle cx="105" cy="100" r="2" />
                 <circle cx="195" cy="100" r="2" />
                 <circle cx="140" cy="90" r="1.5" />
                 <circle cx="160" cy="90" r="1.5" />
               </g>

               {/* --- 懾人的邪惡發光巨眼 (Demon Eyes) --- */}
               <g>
                 {/* 左眼窩與眼球 */}
                 <ellipse cx="110" cy="135" rx="14" ry="10" fill="#020617" transform="rotate(-15 110 135)" />
                 <ellipse cx="110" cy="135" rx="10" ry="6" fill={`url(#grad-kraken-eye-${uid})`} transform="rotate(-15 110 135)" filter={`url(#glow-cyan-${uid})`} />
                 <path d="M 103 135 Q 110 142 117 135 Q 110 128 103 135 Z" fill="#000" transform="rotate(-15 110 135)" />
                 <circle cx="108" cy="133" r="1.5" fill="#fff" />
                 {/* 左眼框邊緣發光 */}
                 <path d="M 95 145 Q 110 155 125 145" stroke="#22d3ee" strokeWidth="2" fill="none" filter={`url(#glow-cyan-${uid})`} strokeLinecap="round" />

                 {/* 右眼窩與眼球 */}
                 <ellipse cx="190" cy="135" rx="14" ry="10" fill="#020617" transform="rotate(15 190 135)" />
                 <ellipse cx="190" cy="135" rx="10" ry="6" fill={`url(#grad-kraken-eye-${uid})`} transform="rotate(15 190 135)" filter={`url(#glow-cyan-${uid})`} />
                 <path d="M 183 135 Q 190 142 197 135 Q 190 128 183 135 Z" fill="#000" transform="rotate(15 190 135)" />
                 <circle cx="188" cy="133" r="1.5" fill="#fff" />
                 {/* 右眼框邊緣發光 */}
                 <path d="M 175 145 Q 190 155 205 145" stroke="#22d3ee" strokeWidth="2" fill="none" filter={`url(#glow-cyan-${uid})`} strokeLinecap="round" />
               </g>
               
               {/* 嘴部/觸手交界處的黑暗深淵 */}
               <path d="M 140 165 Q 150 180 160 165 Q 150 170 140 165 Z" fill="#020617" />

             </g>
           </svg>
         </div>
       )}
       
       {(!animal || animal === 'fish') && (
         <svg className="absolute top-[35%] -left-10 w-8 h-8 opacity-0 group-hover:opacity-90 transition-opacity duration-300 mini-fish" style={{ animationDelay: '0.1s' }} viewBox="0 0 50 50" fill={fishColor}>
            <path d="M 15 25 Q 25 15, 40 25 Q 25 35, 15 25 Z" />
            <path d="M 15 25 L 5 18 L 10 25 L 5 32 Z" fillOpacity="0.8" />
            <circle cx="32" cy="23" r="1.5" fill="#fff" />
         </svg>
       )}
    </div>
  );
};

function ContactItem({ label, value, subValue, icon, href, highlight = false, animal = 'fish' }) {
  const isLine = highlight === 'line';
  const isBlue = highlight === true || highlight === 'blue';

  // 清新明亮海洋風格 (Clear Ocean Theme) 的卡片配置
  const bgClasses = isLine
    ? 'bg-gradient-to-br from-[#F4FFF4] to-[#E6FFE6] border border-[#00C300]/30 hover:border-[#00C300]/60 hover:shadow-[0_10px_30px_rgba(0,195,0,0.15)]'
    : isBlue
    ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 hover:border-cyan-400 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
    : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-200/50';

  return (
    <div className={`flex items-start gap-4 p-5 sm:p-6 rounded-[2rem] transition-all duration-500 group relative overflow-hidden hover:-translate-y-1.5 ${bgClasses}`}>
      
      {/* 嵌入卡片微型海洋裝飾 */}
      <MiniOceanDecor highlight={highlight} animal={animal} />

      <div className={`shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm relative z-10 ${isLine ? 'bg-white text-[#00C300] border border-[#00C300]/20 group-hover:bg-[#00C300] group-hover:text-white' : isBlue ? 'bg-white text-cyan-600 border border-cyan-200 group-hover:bg-cyan-500 group-hover:text-white' : 'bg-slate-50 text-slate-500 border border-slate-100 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500'}`}>
        {icon}
      </div>
      
      <div className="flex-1 min-w-0 pt-0.5 z-10 relative">
        <h4 className={`text-[11px] sm:text-xs font-black mb-1.5 tracking-wider uppercase transition-colors ${isLine ? 'text-[#009E00]' : isBlue ? 'text-cyan-700' : 'text-slate-500 group-hover:text-indigo-600'}`}>{String(label || '')}</h4>
        
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className={`text-lg sm:text-xl font-black block break-words transition-colors flex items-center flex-wrap gap-2.5 text-slate-900 group-hover:${isLine ? 'text-[#009E00]' : 'text-cyan-700'}`}>
            <span>{String(value || '')}</span>
            {isLine && <span className="text-[10px] bg-white text-[#00A000] border border-[#00A000]/30 px-2.5 py-1 rounded-full font-black shadow-sm shrink-0 leading-none flex items-center gap-1 group-hover:bg-[#00A000] group-hover:text-white transition-colors"><Plus className="w-3 h-3" /> 加入好友</span>}
          </a>
        ) : (
          <p className="text-lg sm:text-xl font-black break-words text-slate-900">{String(value || '')}</p>
        )}
        
        {subValue && (
          <div className="mt-3 flex flex-wrap gap-2 items-start relative z-10">
            {String(subValue).split('\n').map((line, i) => (
              line.trim() ? (
                <div key={i} className={`text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg inline-flex text-left leading-relaxed shadow-sm bg-white/70 backdrop-blur-sm text-slate-600 border border-slate-200/60 group-hover:bg-white group-hover:border-slate-200 transition-colors`}>
                  {line.trim()}
                </div>
              ) : null
            ))}
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
// 前台/後台：全域安全渲染組件
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
               {type === 'activity' && (
                  (b.isCourse === true || (b.certSystem && b.certSystem !== '')) ? (
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1"><BookOpen className="w-3 h-3"/> 課程</span>
                  ) : (
                    <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1"><Fish className="w-3 h-3"/> Fun Dive</span>
                  )
               )}
               {b.isReturningCustomer && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-black">回客優惠</span>}
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
            <div className="flex bg-slate-100 rounded-lg p-1" onClick={e => e.stopPropagation()}>
               <button onClick={() => updateStatus('pending')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${b.status === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>待審</button>
               <button onClick={() => updateStatus('confirmed')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${b.status === 'confirmed' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>確認</button>
               <button onClick={() => updateStatus('cancelled')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${b.status === 'cancelled' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>取消</button>
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
                   <p className="font-bold text-slate-700 border-b pb-1">潛水資歷</p>
                   <p><span className="text-slate-400 w-24 inline-block">等級/系統</span> {String(b.diveCertSystem || '未填寫')} / {String(b.diveLevel || '未填寫')}</p>
                   <p><span className="text-slate-400 w-24 inline-block">累計支數</span> {String(b.totalDives || 0)} 支</p>
                </div>
                <div className="space-y-2">
                   <p className="font-bold text-slate-700 border-b pb-1">預約配置與選修</p>
                   <p><span className="text-slate-400 w-24 inline-block">住宿</span> {b.accOption === 'trip' ? '依潛旅安排' : b.accOption === 'included' ? '內附背包床' : b.accOption === 'upgrade' ? `升級房型` : b.accOption === 'release' ? '釋出床位' : '自理'}</p>
                   {b.selectedElectives?.length > 0 && (
                      <p className="flex items-start mt-1"><span className="text-slate-400 w-24 inline-block shrink-0">選修加購</span> <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">{b.selectedElectives.map(e=>e.name).join('、')}</span></p>
                   )}
                   {b.certFee > 0 && (
                      <p className="mt-1"><span className="text-slate-400 w-24 inline-block">簽證費用</span> <span className="font-bold">+{b.certFee} ({b.certSystem})</span></p>
                   )}
                   <p className="mt-1"><span className="text-slate-400 w-24 inline-block">裝備租借</span> {b.rentals?.length > 0 ? b.rentals.map(r => typeof r === 'string' ? String(r) : `${String(r?.name || '未知')}(${String(r?.size || 'F')})`).join(', ') : '無/自備'}</p>
                   {b.useLocalShopEq && <p className="text-indigo-600 font-bold">※ 使用潛旅當地潛店裝備</p>}
                </div>
                <div className="col-span-1 md:col-span-2 mt-2">
                   <p className="font-bold text-slate-700 border-b pb-1 mb-2">健康聲明與風險評估</p>
                   {b.hasMedicalIssue ? (
                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                         <p className="font-bold text-rose-800 mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> 需注意之健康狀況：</p>
                         <ul className="text-rose-700 text-sm space-y-1 pl-6 list-disc font-medium">
                           {(b.medicalIssues || []).map((issue, idx) => (
                              <li key={idx} className={issue.startsWith('↳') ? 'list-none -ml-4 text-rose-600 text-xs mt-1 mb-2' : ''}>{issue}</li>
                           ))}
                         </ul>
                      </div>
                   ) : b.medicalAnswers ? (
                      <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-green-700 text-sm font-bold flex items-center gap-2">
                         <CheckCircle className="w-5 h-5"/> 評估皆為正常 (無勾選「是」之項目)
                      </div>
                   ) : (
                      <p className="text-slate-400 text-sm font-bold">無紀錄資料</p>
                   )}
                </div>
              </>
            )}
            {type === 'accommodation' && (
               <div className="col-span-2 space-y-2">
                  <p className="font-bold text-slate-700 border-b border-slate-100 pb-1">入住預約明細</p>
                  <p><span className="text-slate-400 w-24 inline-block">入住日期</span> <span className="font-black text-blue-600">{String(b.details?.checkIn || '')}</span></p>
                  <p><span className="text-slate-400 w-24 inline-block">預訂明細</span> <span className="font-black">{String(b.details?.nights || 1)} 晚 / {String(b.details?.roomCount || 1)} 間 / 共 {String(b.details?.guests || 1)} 人</span></p>
                  {b.details?.courseDeductTotal > 0 && (
                     <p className="mt-2 pt-2 border-t border-slate-50 flex items-start">
                        <span className="text-amber-500 w-24 inline-block font-bold shrink-0 mt-0.5">課程折抵</span> 
                        <span className="font-black text-amber-600 bg-amber-50 px-2 py-1 rounded shadow-sm">
                           申請 {b.details.courseStudents} 位同行學員升級，共可折抵 NT$ {b.details.courseDeductTotal}
                        </span>
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
  const [activityFilter, setActivityFilter] = useState('all');
  const typeBookings = bookings.filter(b => b.type === type).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
  
  const filteredBookings = useMemo(() => {
    return typeBookings.filter(b => {
      if (type !== 'activity' || activityFilter === 'all') return true;
      const isC = b.isCourse === true || (b.certSystem && b.certSystem !== '');
      return activityFilter === 'course' ? isC : !isC;
    });
  }, [typeBookings, type, activityFilter]);

  const handleExport = () => {
    let headers = []; let rows = [];
    if (type === 'activity') {
      headers = ['訂單狀態', '報名時間', '活動/課程名稱', '參加者姓名', '聯絡電話', '證照等級', '系統', '總支數', '專長證照', '資歷備註', '身高(cm)', '體重(kg)', '總配重(kg)', '預估金額(NT$)', '住宿配套', '選修加購', '裝備需求', '使用當地裝備'];
      rows = filteredBookings.map(b => {
        const weight = ((b.weights?.w1||0)*1 + (b.weights?.w2||0)*2 + (b.weights?.w25||0)*2.5 + (b.weights?.w3||0)*3);
        const eqStr = b.rentals?.length > 0 ? b.rentals.map(r => `${r.name}(${r.size||'F'})`).join('、 ') : '無/自備';
        const specStr = b.specialties?.join('、 ') || '無';
        const accStr = b.accOption === 'trip' ? '依潛旅安排' : b.accOption === 'included' ? '維持背包房床位' : b.accOption === 'upgrade' ? '升級獨立房型' : b.accOption === 'release' ? '釋出床位' : '住宿自理';
        const electivesStr = b.selectedElectives?.length > 0 ? b.selectedElectives.map(e=>e.name).join('、 ') : '無';
        return [b.status === 'confirmed' ? '已確認' : b.status === 'cancelled' ? '已取消' : '待審', formatTs(b.timestamp), b.itemName || '', b.name || '', b.phone || '', b.diveLevel || '', b.diveCertSystem || '', b.totalDives || 0, specStr, b.expNotes || '', b.height || '', b.weight || '', weight, b.price || 0, accStr, electivesStr, eqStr, b.useLocalShopEq ? '是' : '否'];
      });
    } else if (type === 'accommodation') {
      headers = ['訂單狀態', '提交時間', '預訂房型', '預訂人姓名', '聯絡電話', '入住日期', '預訂晚數', '預訂房間數', '入住人數', '課程升級折抵'];
      rows = filteredBookings.map(b => {
        const statusStr = b.status === 'confirmed' ? '已確認' : b.status === 'cancelled' ? '已取消' : '待審核';
        const deductStr = b.details?.courseDeductTotal > 0 ? `${b.details.courseStudents}人, 折$${b.details.courseDeductTotal}` : '無';
        return [statusStr, formatTs(b.timestamp), b.itemName || '', b.details?.name || '', b.details?.phone || '', b.details?.checkIn || '', b.details?.nights || 1, b.details?.roomCount || 1, b.details?.guests || 1, deductStr];
      });
    } else if (type === 'equipment') {
      headers = ['訂單狀態', '提交時間', '租借人姓名', '聯絡電話', '取件日期', '租借天數', '總計金額(NT$)', '租借項目清單'];
      rows = filteredBookings.map(b => {
        const eqStr = b.rentals?.length > 0 ? b.rentals.map(r => `${r.name}(${r.size||'F'})`).join('、 ') : '';
        const statusStr = b.status === 'confirmed' ? '已確認' : b.status === 'cancelled' ? '已取消' : '待審核';
        return [statusStr, formatTs(b.timestamp), b.name || '', b.phone || '', b.details?.date || '', b.details?.days || 1, b.price || 0, eqStr];
      });
    }
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); exportToCSV(`${title}_${dateStr}.csv`, [headers, ...rows]);
  };
  return ( 
    <div className="h-full flex flex-col animate-in fade-in">
      <div className="p-6 border-b bg-slate-50 shrink-0 rounded-t-2xl flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{String(title)}</h3>
          <p className="text-slate-500 text-sm mt-1">處理顧客提交之預約單</p>
        </div>
        {filteredBookings.length > 0 && ( 
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-green-700 transition-colors"><Download className="w-4 h-4" /> 匯出 EXCEL</button> 
        )}
      </div>
      {type === 'activity' && (
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex gap-2 shrink-0">
           <button onClick={() => setActivityFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activityFilter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>全部清單</button>
           <button onClick={() => setActivityFilter('course')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${activityFilter === 'course' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><BookOpen className="w-4 h-4"/> 課程報名</button>
           <button onClick={() => setActivityFilter('fundive')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${activityFilter === 'fundive' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Fish className="w-4 h-4"/> Fun Dive</button>
        </div>
      )}
      <div className="p-6 flex-1 overflow-y-auto bg-slate-50/20">
        {filteredBookings.length === 0 ? <div className="text-center py-16 text-slate-400 border-2 border-dashed rounded-2xl font-bold">目前無相關紀錄</div> : filteredBookings.map(b => <BookingCard key={b.id} booking={b} type={type} db={db} appId={appId} />)}
      </div>
    </div> 
  );
}

function CourseTemplateModal({ editingCourse, db, appId, onClose, sysConfig }) {
  const isEdit = !!editingCourse;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultSrvs = sysConfig?.defaultServices || DEFAULT_SERVICES;

  // 初始化與舊資料相容處理
  const initData = useMemo(() => {
    const base = editingCourse ? { ...editingCourse } : {
      courseName: '', price: 0, days: 3, materialSystem: 'PADI',
      certSystem: 'PADI', certFee: 0,
      compulsories: [],
      electives: [],
      services: [...defaultSrvs],
      courseNotes: '請自備泳衣、毛巾。',
      schedule: ['', '', '']
    };
    
    // 嚴格確保陣列屬性存在，避免讀取舊資料時報錯
    if (!base.compulsories) base.compulsories = [];
    if (typeof base.compulsories === 'string') base.compulsories = base.compulsories.split('\n').filter(Boolean);
    // 相容舊有字串陣列結構，轉換為帶有費用的物件
    base.compulsories = base.compulsories.map(c => {
       if (typeof c === 'string') return { id: Date.now() + Math.random(), name: c, price: 0 };
       return c;
    });
    
    if (!base.services) base.services = [];
    if (typeof base.services === 'string') base.services = base.services.split('\n').filter(Boolean);
    
    if (!base.electives) base.electives = [];
    if (!base.certSystem) base.certSystem = base.materialSystem || 'PADI';
    if (base.certFee === undefined) base.certFee = 0;
    if (!base.courseNotes) base.courseNotes = '';

    if (!base.schedule) {
      base.schedule = Array.from({ length: parseInt(base.days) || 1 }, (_, i) => ({
        day: i + 1,
        slots: [{ period: '09:00-12:00', content: '' }, { period: '13:30-17:00', content: '' }]
      }));
    } else if (base.schedule.length > 0 && typeof base.schedule[0] === 'string') {
      // 兼容舊版單一字串，自動轉換為時段格式
      base.schedule = base.schedule.map((desc, i) => {
         const lines = desc.split('\n');
         return {
           day: i + 1,
           slots: [
             { period: '09:00', content: lines[0] || '' },
             { period: '13:30', content: lines[1] || '' },
             { period: '19:00', content: lines.slice(2).join(' ') || '' }
           ]
         };
      });
    }
    
    return base;
  }, [editingCourse]);

  const [f, setF] = useState(initData);
  
  // 確保外部資料變更時同步更新狀態
  useEffect(() => {
    setF(initData);
  }, [initData]);
  
  // 供新增項目使用的暫存狀態
  const [newCompulsoryName, setNewCompulsoryName] = useState('');
  const [newCompulsoryPrice, setNewCompulsoryPrice] = useState('');
  const [newElectiveName, setNewElectiveName] = useState('');
  const [newElectivePrice, setNewElectivePrice] = useState('');
  const [newService, setNewService] = useState('');

  const handleServiceToggle = (srv) => {
    const currentServices = f.services || [];
    if (currentServices.includes(srv)) {
      setF({ ...f, services: currentServices.filter(s => s !== srv) });
    } else {
      setF({ ...f, services: [...currentServices, srv] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isSubmitting) return;
    setIsSubmitting(true);
    try {
      const data = {
        ...f,
        price: parseInt(f.price) || 0,
        days: parseInt(f.days) || 1,
        certFee: parseInt(f.certFee) || 0
      };
      if (isEdit) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courseTemplates', editingCourse.id), data);
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'courseTemplates'), data);
      onClose();
    } catch (err) { 
      alert("儲存失敗"); 
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold mb-6">{isEdit ? '編輯課程公版' : '新增課程公版'}</h2>
        <form id="courseForm" onSubmit={handleSubmit} className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar pb-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="課程名稱 *" required value={f.courseName} onChange={v => setF({ ...f, courseName: v })} />
            <FormInput label="課程天數" type="number" required value={f.days} onChange={v => {
               if (v === '') { setF({ ...f, days: '' }); return; }
               const d = Math.max(1, parseInt(v));
               let newSch = [...(f.schedule || [])];
               if(newSch.length < d) {
                   while(newSch.length < d) {
                       newSch.push({ day: newSch.length + 1, slots: [{ period: '09:00-12:00', content: '' }, { period: '13:30-17:00', content: '' }] });
                   }
               } else if (newSch.length > d) {
                   newSch = newSch.slice(0, d);
               }
               setF({ ...f, days: d, schedule: newSch });
            }} />
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">教材系統</label>
               <select value={f.materialSystem} onChange={e=>setF({...f, materialSystem: e.target.value})} className="w-full p-3.5 border border-slate-300 rounded-xl font-bold outline-none focus:border-blue-500">
                  <option value="PADI">PADI</option>
                  <option value="SSI">SSI</option>
                  <option value="SDI">SDI</option>
                  <option value="TDI">TDI</option>
                  <option value="AIDA">AIDA</option>
                  <option value="Molchanovs">Molchanovs</option>
                  <option value="CMAS">CMAS</option>
                  <option value="NAUI">NAUI</option>
                  <option value="其他">其他</option>
               </select>
            </div>
            <FormInput label="預設售價 NT$ *" type="number" required value={f.price} onChange={v => setF({ ...f, price: v === '' ? '' : Math.max(0, parseInt(v)) })} />
          </div>

          {/* 課程日程安排 */}
          <div className="space-y-3 pt-2">
             <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                課程日程安排 (可自訂具體時段與內容，將展示於報名頁面)
             </label>
             <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
               {(f.schedule || []).map((dayPlan, dIdx) => (
                 <div key={dIdx} className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="font-black text-blue-800 text-sm border-b border-slate-100 pb-2 flex justify-between items-center">
                       <span>Day {dayPlan.day || dIdx + 1}</span>
                       <button type="button" onClick={() => {
                           const newSch = [...f.schedule];
                           newSch[dIdx].slots.push({ period: '自訂時段', content: '' });
                           setF({...f, schedule: newSch});
                       }} className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded transition-colors">+ 新增時段</button>
                    </div>
                    {(dayPlan.slots || []).map((slot, sIdx) => (
                       <div key={sIdx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={slot.period}
                            onChange={e => {
                               const newSch = [...f.schedule];
                               newSch[dIdx].slots[sIdx].period = e.target.value;
                               setF({...f, schedule: newSch});
                            }}
                            onBlur={() => {
                               // 當輸入框失去焦點時，自動依照時段文字進行排序
                               const newSch = f.schedule.map(d => ({...d, slots: [...d.slots]}));
                               newSch[dIdx].slots.sort((a, b) => a.period.localeCompare(b.period, 'zh-TW'));
                               setF({...f, schedule: newSch});
                            }}
                            placeholder="時段 (例: 09:00)"
                            className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-2.5 rounded-lg shrink-0 w-24 text-center shadow-sm outline-none focus:border-blue-500 transition-colors"
                          />
                          <input
                            type="text"
                            value={slot.content}
                            onChange={e => {
                               const newSch = [...f.schedule];
                               newSch[dIdx].slots[sIdx].content = e.target.value;
                               setF({...f, schedule: newSch});
                            }}
                            placeholder="請輸入課程內容..."
                            className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-colors"
                          />
                          <button type="button" onClick={() => {
                               const newSch = [...f.schedule];
                               newSch[dIdx].slots = newSch[dIdx].slots.filter((_, i) => i !== sIdx);
                               setF({...f, schedule: newSch});
                          }} className="text-slate-300 hover:text-red-500 p-1 transition-colors"><X className="w-4 h-4"/></button>
                       </div>
                    ))}
                    {(!dayPlan.slots || dayPlan.slots.length === 0) && <p className="text-xs text-slate-400 py-2 text-center border border-dashed rounded-lg border-slate-200">該天尚無時段安排</p>}
                 </div>
               ))}
               {(!f.schedule || f.schedule.length === 0) && <p className="text-xs text-slate-400 text-center py-4">請先設定課程天數以編輯日程。</p>}
             </div>
          </div>

          {/* 簽證費用 */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h4 className="font-bold text-blue-900 text-sm">額外簽證費用設定</h4>
               <p className="text-xs text-blue-600 mt-0.5">若需額外收取簽證費請選擇系統並填寫金額</p>
             </div>
             <div className="flex items-center gap-2">
               <select value={f.certSystem} onChange={e=>setF({...f, certSystem: e.target.value})} className="w-full sm:w-32 p-2 border border-blue-200 rounded-lg outline-none font-bold focus:border-blue-500 bg-white text-sm shadow-sm">
                  <option value="PADI">PADI</option>
                  <option value="SSI">SSI</option>
                  <option value="AIDA">AIDA</option>
                  <option value="Molchanovs">Molchanovs</option>
                  <option value="SDI">SDI</option>
                  <option value="TDI">TDI</option>
                  <option value="CMAS">CMAS</option>
                  <option value="NAUI">NAUI</option>
                  <option value="其他">其他</option>
               </select>
               <span className="font-bold text-blue-800 text-sm ml-2">NT$</span>
               <input type="number" value={f.certFee} onChange={e => setF({...f, certFee: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value))})} className="w-24 p-2 border border-blue-200 rounded-lg outline-none text-right font-bold focus:border-blue-500 shadow-sm" />
             </div>
          </div>

          {/* 必修項目 (分塊顯示 -> 改為名稱+費用) */}
          <div className="space-y-2">
             <label className="text-sm font-bold text-slate-700">必修項目 (達成條件與強制收費)</label>
             <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[60px]">
               {(f.compulsories || []).map((comp) => (
                 <div key={comp.id} className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-blue-300">
                   <span className="font-bold text-slate-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500"/> {comp.name}</span>
                   <div className="flex items-center gap-4">
                     <span className={`font-black text-sm px-2 py-0.5 rounded border ${comp.price > 0 ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>{comp.price > 0 ? `+NT$ ${comp.price}` : '免費/內含'}</span>
                     <button type="button" onClick={()=>setF({...f, compulsories: f.compulsories.filter(x=>x.id!==comp.id)})} className="text-slate-400 hover:text-red-500 bg-slate-50 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4"/></button>
                   </div>
                 </div>
               ))}
               {(f.compulsories || []).length === 0 && <span className="text-slate-400 text-sm font-medium py-1 w-full text-center block">尚未新增必修項目...</span>}
             </div>
             <div className="flex gap-2">
               <input type="text" value={newCompulsoryName} onChange={e=>setNewCompulsoryName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter' && !e.nativeEvent.isComposing && newCompulsoryName.trim()){e.preventDefault(); setF({...f, compulsories: [...(f.compulsories || []), {id: Date.now(), name: newCompulsoryName.trim(), price: parseInt(newCompulsoryPrice)||0}]}); setNewCompulsoryName(''); setNewCompulsoryPrice('');}}} placeholder="必修項目名稱" className="flex-[2] p-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500" />
               <input type="number" value={newCompulsoryPrice} onChange={e=>setNewCompulsoryPrice(e.target.value)} onKeyDown={e=>{if(e.key==='Enter' && !e.nativeEvent.isComposing && newCompulsoryName.trim()){e.preventDefault(); setF({...f, compulsories: [...(f.compulsories || []), {id: Date.now(), name: newCompulsoryName.trim(), price: parseInt(newCompulsoryPrice)||0}]}); setNewCompulsoryName(''); setNewCompulsoryPrice('');}}} placeholder="費用 $" className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500" />
               <button type="button" onClick={()=>{if(newCompulsoryName.trim()){setF({...f, compulsories: [...(f.compulsories || []), {id: Date.now(), name: newCompulsoryName.trim(), price: parseInt(newCompulsoryPrice)||0}]}); setNewCompulsoryName(''); setNewCompulsoryPrice('');}}} className="px-5 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm">新增</button>
             </div>
          </div>

          {/* 選修項目 (名稱 + 費用) */}
          <div className="space-y-2">
             <label className="text-sm font-bold text-slate-700">選修加購項目 (潛客報名時可選)</label>
             <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[60px]">
               {(f.electives || []).map((el) => (
                 <div key={el.id} className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-purple-300">
                   <span className="font-bold text-slate-700 text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-purple-500"/> {el.name}</span>
                   <div className="flex items-center gap-4">
                     <span className="font-black text-purple-600 text-sm bg-purple-50 px-2 py-0.5 rounded border border-purple-100">+NT$ {el.price}</span>
                     <button type="button" onClick={()=>setF({...f, electives: f.electives.filter(x=>x.id!==el.id)})} className="text-slate-400 hover:text-red-500 bg-slate-50 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4"/></button>
                   </div>
                 </div>
               ))}
               {(f.electives || []).length === 0 && <span className="text-slate-400 text-sm font-medium py-1 w-full text-center block">尚未新增任何選修項目...</span>}
             </div>
             <div className="flex gap-2">
               <input type="text" value={newElectiveName} onChange={e=>setNewElectiveName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter' && !e.nativeEvent.isComposing && newElectiveName.trim()){e.preventDefault(); setF({...f, electives: [...(f.electives || []), {id: Date.now(), name: newElectiveName.trim(), price: parseInt(newElectivePrice)||0}]}); setNewElectiveName(''); setNewElectivePrice('');}}} placeholder="加購項目名稱" className="flex-[2] p-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500" />
               <input type="number" value={newElectivePrice} onChange={e=>setNewElectivePrice(e.target.value)} onKeyDown={e=>{if(e.key==='Enter' && !e.nativeEvent.isComposing && newElectiveName.trim()){e.preventDefault(); setF({...f, electives: [...(f.electives || []), {id: Date.now(), name: newElectiveName.trim(), price: parseInt(newElectivePrice)||0}]}); setNewElectiveName(''); setNewElectivePrice('');}}} placeholder="費用 $" className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500" />
               <button type="button" onClick={()=>{if(newElectiveName.trim()){setF({...f, electives: [...(f.electives || []), {id: Date.now(), name: newElectiveName.trim(), price: parseInt(newElectivePrice)||0}]}); setNewElectiveName(''); setNewElectivePrice('');}}} className="px-5 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm">新增</button>
             </div>
          </div>

          {/* 服務項目 (預設勾選 + 自訂) */}
          <div className="space-y-3">
             <label className="text-sm font-bold text-slate-700">服務項目 (勾選預設或自訂新增)</label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 border border-slate-200 rounded-xl">
               {defaultSrvs.map(srv => (
                 <label key={srv} className="flex items-start gap-2.5 cursor-pointer">
                   <input type="checkbox" checked={(f.services || []).includes(srv)} onChange={() => handleServiceToggle(srv)} className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300" />
                   <span className={`text-sm font-bold leading-snug ${(f.services || []).includes(srv) ? 'text-blue-800' : 'text-slate-600'}`}>{srv}</span>
                 </label>
               ))}
               {/* 顯示已自訂新增的項目 */}
               {(f.services || []).filter(s => !defaultSrvs.includes(s)).map((srv, i) => (
                 <label key={`custom-${i}`} className="flex items-start gap-2.5 cursor-pointer bg-blue-50/50 p-1 -m-1 rounded">
                   <input type="checkbox" checked={true} onChange={() => handleServiceToggle(srv)} className="mt-0.5 w-4 h-4 text-blue-600 rounded border-blue-300" />
                   <span className="text-sm font-bold text-blue-800 leading-snug break-all">{srv}</span>
                 </label>
               ))}
             </div>
             <div className="flex gap-2">
               <input type="text" value={newService} onChange={e=>setNewService(e.target.value)} onKeyDown={e=>{if(e.key==='Enter' && !e.nativeEvent.isComposing){e.preventDefault(); if(newService.trim() && !(f.services || []).includes(newService.trim())){setF({...f, services: [...(f.services || []), newService.trim()]}); setNewService('');}}}} placeholder="自訂服務項目後按 Enter" className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500" />
               <button type="button" onClick={()=>{if(newService.trim() && !(f.services || []).includes(newService.trim())){setF({...f, services: [...(f.services || []), newService.trim()]}); setNewService('');}}} className="px-5 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm">新增</button>
             </div>
          </div>

          <div className="space-y-2 pt-2">
             <label className="text-sm font-bold text-slate-700">注意事項備註</label>
             <textarea value={f.courseNotes} onChange={e => setF({...f, courseNotes: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl h-20 font-medium outline-none focus:border-blue-500 shadow-sm" />
          </div>
        </form>
        <div className="flex gap-3 pt-5 border-t border-slate-100 shrink-0">
           <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3.5 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50">取消返回</button>
           <button type="submit" form="courseForm" disabled={isSubmitting} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-black shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
             {isSubmitting ? '處理中...' : '儲存公版設定'}
           </button>
        </div>
      </div>
    </div>
  );
}

function ActivityManageModal({ editingActivity, courseTemplates, sysConfig, db, appId, onClose }) {
  const isEdit = !!editingActivity;
  const [publishType, setPublishType] = useState(isEdit ? (editingActivity.isCourse ? 'course' : 'fundive') : 'fundive');
  const [isSubmitting, setIsSubmitting] = useState(false);

  let initData = { name: '', price: 0, date: '', diveCategory: '岸潛', capacity: 4, courseTemplateId: '', isCourse: false, airTanks: 2, nitroxTanks: 0, tanksShoreAir: 0, tanksShoreNitrox: 0, tanksBoatAir: 0, tanksBoatNitrox: 0, notes: '', coach: '', electives: [], services: [], certFee: 0, certSystem: '', schedule: [], airTankPrice: sysConfig.airTankPrice || 800, nitroxTankPrice: sysConfig.nitroxTankPrice || 1200 };
  if (editingActivity) {
    initData = { ...initData, ...editingActivity };
    if (editingActivity.airTanks === undefined && editingActivity.tanks !== undefined) {
      initData.airTanks = editingActivity.tanks;
    }
    if (initData.airTankPrice === undefined) initData.airTankPrice = sysConfig.airTankPrice || 800;
    if (initData.nitroxTankPrice === undefined) initData.nitroxTankPrice = sysConfig.nitroxTankPrice || 1200;
  }
  const [formData, setFormData] = useState(initData);

  const handleShoreTankChange = (field, value) => {
     const parsed = value === '' ? '' : Math.max(0, parseInt(value));
     const newForm = { ...formData, [field]: parsed };
     if (newForm.diveCategory === '岸潛' && !newForm.isCourse) {
        const aTanks = parseInt(newForm.airTanks) || 0;
        const nTanks = parseInt(newForm.nitroxTanks) || 0;
        const aPrice = parseInt(newForm.airTankPrice) || 0;
        const nPrice = parseInt(newForm.nitroxTankPrice) || 0;
        newForm.price = (aTanks * aPrice) + (nTanks * nPrice);
     }
     setFormData(newForm);
  };

  const handleTemplateChange = (e) => {
    const tId = e.target.value;
    const tmpl = courseTemplates.find(c => c.id === tId);
    if (tmpl) {
      setFormData({ 
        ...formData, 
        courseTemplateId: tId, 
        price: tmpl.price, 
        diveCategory: '課程', 
        isCourse: true,
        compulsories: tmpl.compulsories || [],
        electives: tmpl.electives || [], // 自動帶入選修項目
        services: tmpl.services || [], // 自動帶入服務項目
        certSystem: tmpl.certSystem || tmpl.materialSystem || '', // 自動帶入簽證系統
        certFee: tmpl.certFee || 0, // 自動帶入簽證費
        notes: tmpl.courseNotes || '',
        schedule: tmpl.schedule || [] // 自動帶入課程日程
      });
    } else {
      setFormData({ ...formData, courseTemplateId: '', price: 0, diveCategory: '課程', isCourse: true, electives: [], certFee: 0, certSystem: '', schedule: [] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isSubmitting) return;
    setIsSubmitting(true);
    try {
      const data = { 
        ...formData, 
        price: parseInt(formData.price) || 0,
        capacity: parseInt(formData.capacity) || 1,
        tanksShoreAir: parseInt(formData.tanksShoreAir) || 0,
        tanksShoreNitrox: parseInt(formData.tanksShoreNitrox) || 0,
        tanksBoatAir: parseInt(formData.tanksBoatAir) || 0,
        tanksBoatNitrox: parseInt(formData.tanksBoatNitrox) || 0,
        airTanks: parseInt(formData.airTanks) || 0,
        nitroxTanks: parseInt(formData.nitroxTanks) || 0,
        airTankPrice: parseInt(formData.airTankPrice) || 0,
        nitroxTankPrice: parseInt(formData.nitroxTankPrice) || 0,
        isCourse: publishType === 'course', 
        timestamp: serverTimestamp() 
      };
      if (isEdit) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activities', editingActivity.id), data);
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'activities'), data);
      onClose();
    } catch (err) { 
      alert("儲存失敗"); 
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        <h2 className="text-xl font-bold mb-6">{isEdit ? '活動編輯' : '新增活動上架'}</h2>
        <form id="activityForm" onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {!isEdit && (
            <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
              <button type="button" onClick={() => setPublishType('fundive')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${publishType==='fundive'?'bg-white shadow-sm text-blue-600':'text-slate-500'}`}><Fish className="w-4 h-4"/> Fun Dive 上架</button>
              <button type="button" onClick={() => setPublishType('course')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${publishType==='course'?'bg-white shadow-sm text-blue-600':'text-slate-500'}`}><BookOpen className="w-4 h-4"/> 選用課程公版</button>
            </div>
          )}
          {publishType === 'course' && !isEdit && (
             <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
               <label className="block text-sm font-bold text-blue-800 mb-2">選取已建立的課程公版</label>
               <select required onChange={handleTemplateChange} value={formData.courseTemplateId} className="w-full p-3 border border-blue-200 rounded-xl font-bold outline-none focus:border-blue-500">
                 <option value="">-- 請選擇課程 --</option>
                 {courseTemplates.map(c => <option key={c.id} value={c.id}>{String(c.courseName)} (NT$ {c.price})</option>)}
               </select>
               {formData.courseTemplateId && formData.electives?.length > 0 && (
                 <p className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> 已自動載入課程簽證費及 {formData.electives.length} 項加購選修設定</p>
               )}
             </div>
          )}
          
          <FormInput label="活動標題 (梯次名稱) *" placeholder="例如: OWD 週末班" required value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormInput label="活動日期 *" type="date" required value={formData.date} onChange={v => setFormData({ ...formData, date: v })} />
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700 ml-1 block">負責教練</label>
               <select value={formData.coach || ''} onChange={e=>setFormData({...formData, coach: e.target.value})} className="w-full p-3.5 border border-slate-300 rounded-xl font-bold outline-none focus:border-blue-500 bg-white shadow-sm">
                 <option value="">-- 不指定 --</option>
                 {(sysConfig.coaches || []).map(c => <option key={c.id} value={c.name}>{String(c.name)}</option>)}
               </select>
            </div>
            <FormInput label={formData.diveCategory === '岸潛' && publishType === 'fundive' ? "總計售價 NT$ (氣瓶自動計算) *" : "售價 NT$ *"} type="number" required value={formData.price} onChange={v => setFormData({ ...formData, price: v === '' ? '' : Math.max(0, parseInt(v)) })} />
            <FormInput label="限額人數 *" type="number" required value={formData.capacity} onChange={v => setFormData({ ...formData, capacity: v === '' ? '' : Math.max(1, parseInt(v)) })} />
          </div>
          
          {publishType === 'fundive' && (
            <>
              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2 mt-2">潛水類型</label>
                <div className="flex gap-2">
                   {['岸潛','船潛','潛旅'].map(v => (
                     <button key={v} type="button" onClick={()=>{
                         const newForm = {...formData, diveCategory: v, isCourse: false};
                         if (v === '岸潛') {
                             const aTanks = parseInt(newForm.airTanks) || 0;
                             const nTanks = parseInt(newForm.nitroxTanks) || 0;
                             const aPrice = parseInt(newForm.airTankPrice) || 0;
                             const nPrice = parseInt(newForm.nitroxTankPrice) || 0;
                             newForm.price = (aTanks * aPrice) + (nTanks * nPrice);
                         }
                         setFormData(newForm);
                     }} className={`flex-1 py-2 rounded-lg font-bold border ${formData.diveCategory===v?'bg-blue-600 text-white':'bg-white text-slate-500 hover:bg-slate-50 transition-colors'}`}>{v}</button>
                   ))}
                </div>
              </div>
              {formData.diveCategory === '潛旅' ? (
                <div className="mt-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-5">
                   <div>
                      <p className="text-sm font-black text-blue-800 mb-3 border-b border-blue-200/50 pb-1">岸潛規劃</p>
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput label="一般氣瓶 (支)" type="number" value={formData.tanksShoreAir ?? 0} onChange={v => setFormData({ ...formData, tanksShoreAir: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                        <FormInput label="高氧氣瓶 (支)" type="number" value={formData.tanksShoreNitrox ?? 0} onChange={v => setFormData({ ...formData, tanksShoreNitrox: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                      </div>
                   </div>
                   <div>
                      <p className="text-sm font-black text-blue-800 mb-3 border-b border-blue-200/50 pb-1">船潛規劃</p>
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput label="一般氣瓶 (支)" type="number" value={formData.tanksBoatAir ?? 0} onChange={v => setFormData({ ...formData, tanksBoatAir: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                        <FormInput label="高氧氣瓶 (支)" type="number" value={formData.tanksBoatNitrox ?? 0} onChange={v => setFormData({ ...formData, tanksBoatNitrox: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                      </div>
                   </div>
                   <div className="pt-3 border-t border-blue-200 flex justify-between items-center">
                      <span className="font-bold text-blue-900">該趟潛旅總氣瓶數</span>
                      <span className="text-xl font-black text-blue-700">{(formData.tanksShoreAir || 0) + (formData.tanksShoreNitrox || 0) + (formData.tanksBoatAir || 0) + (formData.tanksBoatNitrox || 0)} 支</span>
                   </div>
                </div>
              ) : formData.diveCategory === '岸潛' ? (
                <div className="grid grid-cols-2 gap-4 mt-3 p-5 bg-blue-50/60 rounded-2xl border border-blue-200/60 shadow-sm">
                   <div className="col-span-2 pb-2 border-b border-blue-200/50 mb-1">
                      <h4 className="text-sm font-black text-blue-900 flex items-center gap-2"><Waves className="w-4 h-4 text-blue-600"/>岸潛氣瓶配置與計價</h4>
                      <p className="text-xs font-bold text-blue-600 mt-1">系統將依據此處單價與數量，自動為您結算本梯次活動總售價</p>
                   </div>
                   <FormInput label="一般氣瓶單價" type="number" value={formData.airTankPrice ?? 800} onChange={v => handleShoreTankChange('airTankPrice', v)} />
                   <FormInput label="高氧氣瓶單價" type="number" value={formData.nitroxTankPrice ?? 1200} onChange={v => handleShoreTankChange('nitroxTankPrice', v)} />
                   <FormInput label="一般氣瓶 (支)" type="number" value={formData.airTanks ?? 2} onChange={v => handleShoreTankChange('airTanks', v)} />
                   <FormInput label="高氧氣瓶 (支)" type="number" value={formData.nitroxTanks ?? 0} onChange={v => handleShoreTankChange('nitroxTanks', v)} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <FormInput label="預計一般氣瓶 (支)" type="number" value={formData.airTanks ?? 2} onChange={v => setFormData({ ...formData, airTanks: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                  <FormInput label="預計高氧氣瓶 (支)" type="number" value={formData.nitroxTanks ?? 0} onChange={v => setFormData({ ...formData, nitroxTanks: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                </div>
              )}
              <div className="mt-3 space-y-2">
                <label className="text-sm font-bold text-slate-700">注意事項備註</label>
                <textarea value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full p-3 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-500 min-h-[80px]" placeholder="請填寫活動注意事項、集合地點、裝備需求等資訊..."></textarea>
              </div>
            </>
          )}
        </form>
        <div className="flex gap-3 pt-4 border-t mt-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50">取消</button>
          <button type="submit" form="activityForm" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? '處理中...' : '確認儲存'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityAdminPanel({ db, appId, activities, courseTemplates, sysConfig, saveSysConfig, subTab, setSubTab }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [medicalForm, setMedicalForm] = useState(sysConfig.medicalForm && sysConfig.medicalForm.length > 0 ? sysConfig.medicalForm : DEFAULT_MEDICAL_FORM);
  const [newCoach, setNewCoach] = useState('');
  const [isSubmittingMedical, setIsSubmittingMedical] = useState(false);

  const [localServices, setLocalServices] = useState(sysConfig.defaultServices || DEFAULT_SERVICES);
  const [isSubmittingServices, setIsSubmittingServices] = useState(false);

  const [tankPrices, setTankPrices] = useState({ air: sysConfig.airTankPrice || 800, nitrox: sysConfig.nitroxTankPrice || 1200 });
  const [isSubmittingTankPrices, setIsSubmittingTankPrices] = useState(false);

  useEffect(() => { setMedicalForm(sysConfig.medicalForm && sysConfig.medicalForm.length > 0 ? sysConfig.medicalForm : DEFAULT_MEDICAL_FORM); }, [sysConfig.medicalForm]);
  useEffect(() => { if (sysConfig.defaultServices) setLocalServices(sysConfig.defaultServices); }, [sysConfig.defaultServices]);
  useEffect(() => { setTankPrices({ air: sysConfig.airTankPrice || 800, nitrox: sysConfig.nitroxTankPrice || 1200 }); }, [sysConfig.airTankPrice, sysConfig.nitroxTankPrice]);

  const handleSaveMedical = async () => {
    if(isSubmittingMedical) return;
    setIsSubmittingMedical(true);
    await saveSysConfig({ ...sysConfig, medicalForm });
    setIsSubmittingMedical(false);
  };

  const handleSaveServices = async () => {
    if(isSubmittingServices) return;
    setIsSubmittingServices(true);
    await saveSysConfig({ ...sysConfig, defaultServices: localServices });
    setIsSubmittingServices(false);
  };

  const handleSaveTankPrices = async () => {
    if(isSubmittingTankPrices) return;
    setIsSubmittingTankPrices(true);
    await saveSysConfig({ ...sysConfig, airTankPrice: tankPrices.air, nitroxTankPrice: tankPrices.nitrox });
    setIsSubmittingTankPrices(false);
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-2">
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex gap-2 overflow-x-auto rounded-t-2xl">
        <SubTabBtn active={subTab === 'list'} onClick={() => setSubTab('list')} label="活動上架" />
        <SubTabBtn active={subTab === 'courses'} onClick={() => setSubTab('courses')} label="課程及活動管理" />
        <SubTabBtn active={subTab === 'medical'} onClick={() => setSubTab('medical')} label="醫療聲明編輯" />
      </div>
      <div className="p-6 overflow-y-auto flex-1">
        {subTab === 'list' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">活動上架設定</h3>
              <button onClick={() => { setEditingActivity(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" /> 新增上架</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activities.map(act => {
                const tmpl = act.isCourse ? courseTemplates.find(t => t.id === act.courseTemplateId) : null;
                return (
                  <div key={act.id} className="bg-white border border-slate-200 p-5 rounded-2xl relative group shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingActivity(act); setIsModalOpen(true); }} className="p-1.5 bg-slate-100 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activities', act.id))} className="p-1.5 bg-slate-100 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    
                    {/* 第一排：分類標籤與價格 */}
                    <div className="flex justify-between items-start mb-3 pr-10">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md inline-flex items-center gap-1.5 shadow-sm border ${act.isCourse ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-teal-50 border-teal-200 text-teal-700'}`}>
                        {act.isCourse ? <BookOpen className="w-3 h-3" /> : <Fish className="w-3 h-3" />}
                        {act.isCourse ? '系統課程' : String(act.diveCategory || '')}
                      </span>
                      <span className="text-blue-600 font-black text-base">NT$ {Number(act.price || 0)}</span>
                    </div>

                    {/* 明顯的課程名稱徽章 (僅顯示課程名稱) */}
                    {act.isCourse && tmpl && (
                      <div className="mb-2 animate-in fade-in slide-in-from-top-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-100 font-black text-xs">
                           <CheckCircle className="w-3.5 h-3.5 text-blue-200" />
                           {String(tmpl.courseName || '')}
                        </span>
                      </div>
                    )}

                    <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-tighter">梯次標題名稱</div>
                    <h4 className="font-black text-slate-900 text-lg mb-3 truncate pr-10 leading-tight">{String(act.name || '')}</h4>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-blue-500" /> {String(act.date || '')}</p>
                      <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-blue-500" /> {String(act.coach || '未指定')}</p>
                      <p className="flex items-center gap-1.5">剩餘 {Number(act.capacity || 0)} 名</p>
                    </div>
                    
                    {!act.isCourse && act.diveCategory === '潛旅' ? (
                       <div className="mt-3 text-[11px] font-bold text-slate-500 flex items-center gap-3">
                         <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">總氣瓶：{(act.tanksShoreAir || 0) + (act.tanksShoreNitrox || 0) + (act.tanksBoatAir || 0) + (act.tanksBoatNitrox || 0)} 支</span>
                         <span className="text-slate-300">|</span>
                         <span>岸潛 {((act.tanksShoreAir || 0) + (act.tanksShoreNitrox || 0))} / 船潛 {((act.tanksBoatAir || 0) + (act.tanksBoatNitrox || 0))}</span>
                       </div>
                    ) : !act.isCourse ? (
                       <div className="mt-3 text-[11px] font-bold text-slate-500 bg-slate-50/50 p-1.5 rounded-lg border border-dashed border-slate-200">
                         🤿 氣瓶：一般 {act.airTanks || act.tanks || 0} 支 | 高氧 {act.nitroxTanks || 0} 支
                       </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {subTab === 'courses' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            {/* 上半部：課程公版庫 (全寬展延，內部卡片採網格排列) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 sm:px-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5"/></div>
                   <h3 className="text-lg font-black text-slate-800">課程公版庫</h3>
                </div>
                <button onClick={() => { setEditingCourse(null); setIsCourseModalOpen(true); }} className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-slate-700 transition-colors"><Plus className="w-4 h-4" /> 建立公版</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {courseTemplates.map(c => (
                  <div key={c.id} className="p-5 border border-slate-200 rounded-2xl flex flex-col justify-between gap-4 bg-white hover:border-blue-300 hover:shadow-md transition-all group shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h5 className="font-black text-slate-900 text-lg leading-tight mb-1.5">{String(c.courseName)}</h5>
                        <p className="text-sm text-slate-600 font-medium"><span className="font-black text-slate-800">{String(c.certSystem || c.materialSystem)}</span> • {Number(c.days)} 天安排 • NT$ {Number(c.price)}</p>
                        {(c.certFee > 0 || c.electives?.length > 0) && (
                           <div className="flex flex-wrap gap-2 mt-3">
                             {c.certFee > 0 && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold shadow-sm">+ 簽證費 ${c.certFee}</span>}
                             {c.electives?.length > 0 && <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-bold shadow-sm">{c.electives.length} 項加購選修</span>}
                           </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-100 justify-end">
                      <button onClick={()=>{setEditingCourse(c); setIsCourseModalOpen(true);}} className="p-2 bg-slate-50 hover:bg-blue-500 hover:text-white text-blue-600 rounded-lg transition-all border border-slate-200 shadow-sm"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={()=>deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courseTemplates', c.id))} className="p-2 bg-slate-50 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-all border border-slate-200 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                {courseTemplates.length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold bg-white">尚未建立任何課程公版</div>
                )}
              </div>
            </div>
            
            {/* 下半部：教練團隊與預設服務並排 (50% / 50%) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 教練團隊管理區塊 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                <h4 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2"><div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> 教練團隊管理</h4>
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" placeholder="教練名稱 (例: 王教練)" value={newCoach} onChange={e=>setNewCoach(e.target.value)} onKeyDown={e=>{if(e.key==='Enter' && !e.nativeEvent.isComposing && newCoach.trim()){ saveSysConfig({...sysConfig, coaches: [...(sysConfig.coaches || []), { id: Date.now(), name: newCoach.trim() }]}); setNewCoach('');}}} className="flex-1 p-3 border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                    <button onClick={() => {
                      if(newCoach.trim()) {
                        saveSysConfig({...sysConfig, coaches: [...(sysConfig.coaches || []), { id: Date.now(), name: newCoach.trim() }]});
                        setNewCoach('');
                      }
                    }} className="px-6 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-sm shrink-0 whitespace-nowrap">新增</button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-5 border-t border-slate-100 mt-2 flex-1 content-start">
                    {(sysConfig.coaches || []).map(c => (
                      <div key={c.id} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-100 shadow-sm">
                        {String(c.name)}
                        <button onClick={() => saveSysConfig({...sysConfig, coaches: sysConfig.coaches.filter(x => x.id !== c.id)})} className="text-blue-400 hover:text-red-500 transition-colors"><X className="w-4 h-4"/></button>
                      </div>
                    ))}
                    {(!sysConfig.coaches || sysConfig.coaches.length === 0) && <p className="text-xs text-slate-400 w-full text-center py-4">尚未設定教練</p>}
                  </div>
                </div>
              </div>

              {/* 預設服務項目區塊 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-base font-black text-slate-800 flex items-center gap-2"><div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> 預設服務項目</h4>
                  <button disabled={isSubmittingServices} onClick={handleSaveServices} className="text-xs bg-green-600 text-white px-3.5 py-2 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmittingServices ? '儲存中...' : '儲存變更'}
                  </button>
                </div>
                <div className="space-y-4 flex-1 flex flex-col">
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">管理課程公版中預設可勾選的服務項目，讓您之後新建課程時能快速套用。</p>
                  <div className="flex-1 max-h-[300px] overflow-y-auto space-y-2.5 pr-2 custom-scrollbar content-start">
                    {localServices.map((srv, idx) => (
                       <div key={idx} className="flex items-center gap-2 group">
                         <input type="text" value={srv} onChange={e => {
                            const newSrvs = [...localServices];
                            newSrvs[idx] = e.target.value;
                            setLocalServices(newSrvs);
                         }} className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500 focus:bg-white bg-slate-50 transition-colors" />
                         <button onClick={() => {
                            const newSrvs = localServices.filter((_, i) => i !== idx);
                            setLocalServices(newSrvs);
                         }} className="text-slate-300 hover:text-red-500 p-2 shrink-0 transition-colors bg-white rounded-lg"><Trash2 className="w-4 h-4"/></button>
                       </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                     <button onClick={() => setLocalServices([...localServices, '新服務項目'])} className="text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl hover:bg-blue-100 transition-colors w-full shadow-sm">+ 新增一列預設項目</button>
                  </div>
                </div>
              </div>

              {/* 氣瓶預設定價基準 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-base font-black text-slate-800 flex items-center gap-2"><div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> 岸潛氣瓶預設定價基準</h4>
                  <button disabled={isSubmittingTankPrices} onClick={handleSaveTankPrices} className="text-xs bg-green-600 text-white px-3.5 py-2 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmittingTankPrices ? '儲存中...' : '儲存變更'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700 ml-1">預設一般氣瓶單價 (NT$)</label>
                     <input type="number" value={tankPrices.air} onChange={e => setTankPrices({...tankPrices, air: parseInt(e.target.value) || 0})} className="w-full p-3.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 font-bold" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700 ml-1">預設高氧氣瓶單價 (NT$)</label>
                     <input type="number" value={tankPrices.nitrox} onChange={e => setTankPrices({...tankPrices, nitrox: parseInt(e.target.value) || 0})} className="w-full p-3.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 font-bold" />
                   </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 font-bold">※ 此處設定將作為後台上架「Fun Dive (岸潛)」活動時，自動計算總價的預設基準。</p>
              </div>

            </div>
          </div>
        )}
        {subTab === 'medical' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h3 className="text-xl font-bold text-slate-800">醫療健康聲明問卷編輯</h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => { if(window.confirm('確定要載入國際標準問卷嗎？這將覆蓋您目前的設定。')) setMedicalForm(DEFAULT_MEDICAL_FORM); }} className="flex-1 sm:flex-none text-xs bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors shadow-sm whitespace-nowrap">
                  載入國際標準問卷
                </button>
                <button disabled={isSubmittingMedical} onClick={handleSaveMedical} className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                  <Save className="w-4 h-4" /> {isSubmittingMedical ? '儲存中...' : '儲存變更'}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {medicalForm.map((q, idx) => (
                <div key={q.id} className="bg-slate-50 border p-4 rounded-2xl space-y-3">
                   <div className="flex items-start gap-3">
                     <span className="bg-slate-200 text-slate-500 font-bold px-2 py-1 rounded text-xs mt-2">{idx + 1}</span>
                     <textarea value={q.text} onChange={e => { const f = [...medicalForm]; f[idx].text = e.target.value; setMedicalForm(f); }} className="flex-1 p-3 rounded-xl text-sm font-bold border border-slate-200 min-h-[60px] outline-none focus:border-blue-400" />
                     <button onClick={() => setMedicalForm(medicalForm.filter(item => item.id !== q.id))} className="text-red-400 p-2 mt-1 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5"/></button>
                   </div>
                   {q.subItems && q.subItems.length > 0 && (
                      <div className="ml-10 space-y-2 border-l-2 border-slate-200 pl-4">
                          {q.subItems.map((sub, sIdx) => (
                              <div key={sub.id} className="flex items-start gap-2">
                                  <span className="text-slate-400 mt-3">↳</span>
                                  <textarea value={sub.text} onChange={e => { const f = [...medicalForm]; f[idx].subItems[sIdx].text = e.target.value; setMedicalForm(f); }} className="flex-1 p-2.5 rounded-xl text-xs font-bold border border-slate-200 min-h-[40px] outline-none focus:border-blue-400" />
                                  <button onClick={() => { const f = [...medicalForm]; f[idx].subItems = f[idx].subItems.filter(item => item.id !== sub.id); setMedicalForm(f); }} className="text-red-400 p-2 mt-1 hover:text-red-600"><X className="w-4 h-4"/></button>
                              </div>
                          ))}
                      </div>
                   )}
                   <div className="ml-10 pt-2">
                      <button onClick={() => { const f = [...medicalForm]; if(!f[idx].subItems) f[idx].subItems = []; f[idx].subItems.push({id: Date.now(), text: ''}); setMedicalForm(f); }} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">+ 新增延伸子題目</button>
                   </div>
                </div>
              ))}
              <button onClick={() => setMedicalForm([...medicalForm, { id: Date.now(), text: '', subItems: [] }])} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all">+ 新增母題目</button>
            </div>
          </div>
        )}
      </div>
      {isModalOpen && <ActivityManageModal editingActivity={editingActivity} courseTemplates={courseTemplates} sysConfig={sysConfig} db={db} appId={appId} onClose={() => setIsModalOpen(false)} />}
      {isCourseModalOpen && <CourseTemplateModal editingCourse={editingCourse} db={db} appId={appId} sysConfig={sysConfig} onClose={() => setIsCourseModalOpen(false)} />}
    </div>
  );
}

function RoomManageModal({ db, appId, room, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [f, setF] = useState(room || { 
    name: '', quantity: 1, bedCount: 1, 
    priceLowWeekday: 1000, priceLowWeekend: 1200, 
    pricePeakWeekday: 1500, pricePeakWeekend: 1800, 
    priceHoliday: 2200,
    priceExtraBed: 600
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isSubmitting) return;
    setIsSubmitting(true);
    try {
      const dataToSave = {
         ...f,
         quantity: parseInt(f.quantity) || 1,
         bedCount: parseInt(f.bedCount) || 1,
         priceLowWeekday: parseInt(f.priceLowWeekday) || 0,
         priceLowWeekend: parseInt(f.priceLowWeekend) || 0,
         pricePeakWeekday: parseInt(f.pricePeakWeekday) || 0,
         pricePeakWeekend: parseInt(f.pricePeakWeekend) || 0,
         priceHoliday: parseInt(f.priceHoliday) || 0,
         priceExtraBed: parseInt(f.priceExtraBed) || 0
      };
      if (room) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accommodations', room.id), dataToSave);
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'accommodations'), dataToSave);
      onClose();
    } catch (err) { 
      alert("儲存失敗"); 
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-xl p-8 shadow-xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-black mb-6 text-slate-800">房型及階梯價格設定</h2>
        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4">
             <FormInput label="房型/床位名稱" required value={f.name} onChange={v => setF({ ...f, name: v })} placeholder="例如：背包客房 或 豪華雙人房" />
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <FormInput label="實體房間數 (間)" required type="number" value={f.quantity} onChange={v => setF({ ...f, quantity: v === '' ? '' : Math.max(1, parseInt(v)) })} />
               <FormInput label="每間容納人數/床位" required type="number" value={f.bedCount} onChange={v => setF({ ...f, bedCount: v === '' ? '' : Math.max(1, parseInt(v)) })} />
               <FormInput label="加床費用 (人/晚)" required type="number" value={f.priceExtraBed} onChange={v => setF({ ...f, priceExtraBed: v === '' ? '' : Math.max(0, parseInt(v)) })} />
             </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
             <h4 className="font-black text-blue-800 text-sm flex items-center gap-2 border-b border-blue-100 pb-2"><CalendarDays className="w-4 h-4"/> 淡季價格設定 (Low Season)</h4>
             <div className="grid grid-cols-2 gap-4">
               <FormInput label="淡季平日價" required type="number" value={f.priceLowWeekday} onChange={v => setF({ ...f, priceLowWeekday: v === '' ? '' : Math.max(0, parseInt(v)) })} />
               <FormInput label="淡季假日價" required type="number" value={f.priceLowWeekend} onChange={v => setF({ ...f, priceLowWeekend: v === '' ? '' : Math.max(0, parseInt(v)) })} />
             </div>
          </div>

          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-4">
             <h4 className="font-black text-amber-800 text-sm flex items-center gap-2 border-b border-amber-100 pb-2"><Waves className="w-4 h-4"/> 旺季價格設定 (Peak Season)</h4>
             <div className="grid grid-cols-2 gap-4">
               <FormInput label="旺季平日價" required type="number" value={f.pricePeakWeekday} onChange={v => setF({ ...f, pricePeakWeekday: v === '' ? '' : Math.max(0, parseInt(v)) })} />
               <FormInput label="旺季假日價" required type="number" value={f.pricePeakWeekend} onChange={v => setF({ ...f, pricePeakWeekend: v === '' ? '' : Math.max(0, parseInt(v)) })} />
             </div>
          </div>

          <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 space-y-4">
             <h4 className="font-black text-rose-800 text-sm flex items-center gap-2 border-b border-rose-100 pb-2"><Info className="w-4 h-4"/> 特殊連假設定 (Holidays)</h4>
             <div className="grid grid-cols-1 gap-4">
               <FormInput label="連假每晚收費 (最後一晚將自動設為 $0)" required type="number" value={f.priceHoliday} onChange={v => setF({ ...f, priceHoliday: v === '' ? '' : Math.max(0, parseInt(v)) })} />
             </div>
          </div>
        </form>
        <div className="flex gap-4 pt-6 border-t mt-6">
           <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3.5 bg-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50">取消</button>
           <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-black shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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

  useEffect(() => {
    setLocalHolidays(sysConfig.holidayRanges || []);
  }, [sysConfig.holidayRanges]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button onClick={() => { setEditingRoom(null); setIsRoomModalOpen(true); }} className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black hover:border-blue-400 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-3">
                <Plus className="w-8 h-8" /> 新增房型與價格
             </button>
             {accommodations.map(room => (
               <div key={room.id} className="bg-white border border-slate-200 p-6 rounded-3xl group relative shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingRoom(room); setIsRoomModalOpen(true); }} className="p-2 bg-slate-100 rounded-xl hover:bg-blue-600 hover:text-white transition-colors shadow-sm"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteRoom(room.id)} className="p-2 bg-slate-100 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <h4 className="font-black text-slate-900 text-xl mb-4">{String(room.name)}</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                     <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <p className="text-slate-400 mb-1">淡季 (平/假)</p>
                        <p className="text-slate-700">${room.priceLowWeekday} / ${room.priceLowWeekend}</p>
                     </div>
                     <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                        <p className="text-amber-600 mb-1">旺季 (平/假)</p>
                        <p className="text-amber-800">${room.pricePeakWeekday} / ${room.pricePeakWeekend}</p>
                     </div>
                     <div className="bg-rose-50 p-2 rounded-lg border border-rose-100 col-span-2">
                        <p className="text-rose-600 mb-1">連假定價 (最後一晚免費)</p>
                        <p className="text-rose-800">${room.priceHoliday}</p>
                     </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm font-bold gap-2">
                     <span className="text-slate-500">實體房間：{room.quantity} 間</span>
                     <div className="flex flex-wrap gap-2">
                       <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">加床 ${room.priceExtraBed || 0} / 晚</span>
                       <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">每間容納：{room.bedCount || 1} 人(床)</span>
                     </div>
                  </div>
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
                        <button disabled={isSubmittingHolidays} onClick={handleSaveHolidays} className="flex-1 sm:flex-none text-xs bg-green-600 text-white px-3 py-2 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap">
                          {isSubmittingHolidays ? '儲存中...' : '儲存變更'}
                        </button>
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

  // 初始化與舊資料相容處理：確保 specDetails 永遠是陣列
  const initData = useMemo(() => {
    if (editingItem) {
      return { ...editingItem, specDetails: editingItem.specDetails || [] };
    }
    return { name: '', category: '重裝備', hasSpecs: false, price: 0, readyQuantity: 1, repairQuantity: 0, specDetails: [] };
  }, [editingItem]);

  const [f, setF] = useState(initData);

  // 確保點選不同裝備時同步更新
  useEffect(() => {
    setF(initData);
  }, [initData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isSubmitting) return;
    setIsSubmitting(true);
    try {
      const dataToSave = { 
         ...f,
         price: parseInt(f.price) || 0,
         readyQuantity: parseInt(f.readyQuantity) || 0,
      };
      // 如果關閉了分規格選項，清除規格陣列避免殘留
      if (dataToSave.hasSpecs && dataToSave.specDetails) {
         dataToSave.specDetails = dataToSave.specDetails.map(s => ({ ...s, ready: parseInt(s.ready) || 0 }));
      } else {
         dataToSave.specDetails = []; 
      }
      if (isEdit) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'equipments', editingItem.id), dataToSave);
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'equipments'), dataToSave);
      onClose();
    } catch (err) { 
      alert("儲存失敗"); 
      setIsSubmitting(false);
    }
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
                      <input placeholder="規格名稱(如: S, M)" required value={spec.name} onChange={e => { 
                          const ns = [...(f.specDetails || [])]; 
                          ns[idx] = { ...ns[idx], name: e.target.value }; 
                          setF({...f, specDetails: ns}); 
                      }} className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500" />
                      <input type="number" placeholder="庫存" required value={spec.ready} onChange={e => { 
                          const ns = [...(f.specDetails || [])]; 
                          ns[idx] = { ...ns[idx], ready: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)) }; 
                          setF({...f, specDetails: ns}); 
                      }} className="w-24 p-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-blue-500" />
                      <button type="button" onClick={() => {
                          setF({
                            ...f, 
                            specDetails: (f.specDetails || []).filter((_, i) => i !== idx)
                          });
                      }} className="text-slate-400 hover:text-red-500 p-2 transition-colors"><Trash2 className="w-5 h-5"/></button>
                   </div>
                ))}
                <button type="button" onClick={() => setF({...f, specDetails: [...(f.specDetails||[]), {id: Date.now() + Math.random(), name: '', ready: 1, repair: 0}]})} className="text-blue-600 text-sm font-bold hover:text-blue-800 transition-colors">+ 新增規格</button>
             </div>
          )}
          <div className="flex gap-4 pt-4 mt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3.5 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50">取消</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? '處理中...' : '儲存'}
            </button>
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
         heavy: parseInt(packages.heavy) || 0,
         light: parseInt(packages.light) || 0,
         full: parseInt(packages.full) || 0,
         studentDiscount: parseInt(packages.studentDiscount) || 0,
         returnCustomerDiscount: parseInt(packages.returnCustomerDiscount) || 0
      };
      await saveSysConfig({ ...sysConfig, equipmentPackages: sanitizedPackages });
      const updates = equipments.map(e => eqPrices[e.id] !== undefined ? updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'equipments', e.id), { price: parseInt(eqPrices[e.id]) || 0 }) : null).filter(Boolean);
      await Promise.all(updates);
      alert("儲存成功");
    } catch(e) { 
      alert("儲存失敗"); 
    } finally {
      setIsSubmittingPricing(false);
    }
  };

  const updateEqStock = async (item, specId, readyDelta, repairDelta, isRepairDone = false) => {
     try {
        let newData = { ...item };
        if (item.hasSpecs) {
           newData.specDetails = item.specDetails.map(s => {
              if (s.id === specId) {
                 let newReady = (s.ready || 0) + readyDelta;
                 let newRepair = (s.repair || 0) + repairDelta;
                 if (isRepairDone && newRepair > 0) {
                    newRepair -= 1;
                    newReady += 1;
                 }
                 return { ...s, ready: Math.max(0, newReady), repair: Math.max(0, newRepair) };
              }
              return s;
           });
        } else {
           let newReady = (item.readyQuantity || 0) + readyDelta;
           let newRepair = (item.repairQuantity || 0) + repairDelta;
           if (isRepairDone && newRepair > 0) {
              newRepair -= 1;
              newReady += 1;
           }
           newData.readyQuantity = Math.max(0, newReady);
           newData.repairQuantity = Math.max(0, newRepair);
        }
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'equipments', item.id), newData);
     } catch(e) {
        alert('更新庫存失敗');
     }
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
                                <button type="button" onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold">
                                  <Settings className="w-3.5 h-3.5" /> <span className="hidden sm:inline">屬性設定</span>
                                </button>
                                <button type="button" onClick={async () => {
                                  if (window.confirm(`確定要刪除「${item.name}」這個裝備嗎？刪除後無法復原。`)) {
                                    try {
                                      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'equipments', item.id));
                                    } catch (e) {
                                      alert("刪除失敗，請檢查權限");
                                    }
                                  }
                                }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                           </div>
                           
                           <div className="flex flex-col gap-2">
                             {/* 桌面版專用標題 */}
                             <div className="hidden sm:flex items-center text-[10px] font-black text-slate-400 px-3 mt-1">
                                <span className="w-24">尺寸 / 規格</span>
                                <span className="flex-1 text-center">可用數量</span>
                                <span className="flex-1 text-center">維修數量</span>
                                <span className="w-16 text-center">操作</span>
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
              <button disabled={isSubmittingPricing} onClick={handleSavePricing} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmittingPricing ? '儲存中...' : '儲存定價'}
              </button>
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
      
      {/* --- 此處補回了被遺漏的 Modal 掛載點 --- */}
      {isModalOpen && <EquipmentManageModal editingItem={editingItem} db={db} appId={appId} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function SystemAdminPanel({ config, onSave }) {
  const [f, setF] = useState(config);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (config) setF(config);
  }, [config]);

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await onSave(f);
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div><h3 className="text-xl font-bold text-slate-800">系統基礎設定</h3><p className="text-slate-500 text-sm mt-1">維護官網文案與聯絡資訊</p></div>
        <button disabled={isSubmitting} onClick={handleSave} className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Save className="w-4 h-4" /> {isSubmitting ? '儲存中...' : '儲存變更'}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ControlPanelCard title="首頁視覺文案">
          <div className="space-y-4">
            <FormInput label="主標題" value={f.title} onChange={v => setF({ ...f, title: v })} />
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">副標題描述</label>
               <textarea value={f.subtitle || ''} onChange={e => setF({ ...f, subtitle: e.target.value })} className="w-full p-3 border border-slate-300 bg-white rounded-xl h-24 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
          </div>
        </ControlPanelCard>

        <ControlPanelCard title="聯絡資訊">
          <div className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="官方 LINE" value={f.line} onChange={v => setF({...f, line: v})} />
                <FormInput label="門市地址" value={f.address} onChange={v => setF({...f, address: v})} />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 block">交通方式引導 (換行即為條列顯示)</label>
                <textarea value={f.transport || ''} onChange={e => setF({...f, transport: e.target.value})} className="w-full p-3.5 border border-slate-300 bg-white rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:border-blue-500 transition-all min-h-[80px]" />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="潛水專線" value={f.phoneDiving} onChange={v => setF({...f, phoneDiving: v})} />
                <FormInput label="潛水服務時間" value={f.serviceHoursDiving} onChange={v => setF({...f, serviceHoursDiving: v})} />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="住宿專線" value={f.phoneAcc} onChange={v => setF({...f, phoneAcc: v})} />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="進房時間" value={f.checkInAcc} onChange={v => setF({...f, checkInAcc: v})} />
                <FormInput label="退房時間" value={f.checkOutAcc} onChange={v => setF({...f, checkOutAcc: v})} />
             </div>
             <div className="mt-4 pt-4 border-t border-slate-100">
                <FormInput label="管理員存取密碼" type="password" value={f.adminCode || '0000'} onChange={v => setF({...f, adminCode: v})} placeholder="預設為 0000" />
                <p className="text-[10px] text-slate-400 mt-1">※ 此密碼用於進入營運管理中心</p>
             </div>
          </div>
        </ControlPanelCard>
      </div>
    </div>
  );
}

// --------------------------------------------------------
// 前台：顧客服務與預約表單組件 (補齊缺失功能)
// --------------------------------------------------------

function ServiceSection({ title, items, type, onBook, sysConfig }) {
  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-2xl font-black mb-6 text-slate-800 border-b border-slate-200 pb-4">{title}</h2>
      {items.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border-2 border-dashed rounded-2xl font-bold bg-white">
          目前暫無可預約的項目
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
              {/* 活動屬性標籤 */}
              {type === 'activity' && (
                <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-xs font-black px-3 py-1.5 rounded-bl-xl shadow-sm">
                  {item.isCourse ? '證照課程' : 'FUN DIVE'}
                </div>
              )}
              
              <div className="flex-1 mt-2">
                <h3 className="font-bold text-xl text-slate-900 mb-2 pr-16">{String(item.name || item.courseName || '未命名項目')}</h3>
                
                {type === 'activity' && (
                  <div className="space-y-1.5 mb-4 mt-3">
                    <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-blue-500" /> 日期：{String(item.date || '常態開放')}
                    </p>
                    <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Waves className="w-4 h-4 text-teal-500" /> 類型：{item.isCourse ? (item.courseName || '潛水課程') : String(item.diveCategory || '岸潛')}
                    </p>
                    <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-500" /> 教練：{String(item.coach || '依店內安排')}
                    </p>
                    <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-500" /> 名額：{Number(item.capacity || 0)} 人
                    </p>
                  </div>
                )}

                {type === 'accommodation' && (
                  <div className="flex flex-wrap gap-2 mb-2 mt-3">
                    <span className="text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg flex items-center gap-1.5">
                      <Home className="w-4 h-4" /> 房間數: {Number(item.quantity || 1)} 間
                    </span>
                    <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1.5">
                      <User className="w-4 h-4" /> 每間容納: {Number(item.bedCount || 1)} 人/床
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-blue-600 font-black text-lg">NT$ {Number(item.price || item.priceLowWeekday || 0)}</span>
                <button 
                  onClick={() => onBook(item)} 
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {type === 'activity' ? '立即報名' : '立即預約'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RegistrationForm({ activity, equipments, onClose, onSubmit, sysConfig, onSuccess }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isTrip = activity.diveCategory === '潛旅';
  const isCourse = activity.isCourse;

  // 決定流程步驟
  const stepTitles = isCourse ? [
    { num: 1, title: '行前簡報', sub: '課程資訊總覽' },
    { num: 2, title: '水面整備', sub: '基本與保險資料' },
    { num: 3, title: '海底探索', sub: '裝備配置與加購' },
    { num: 4, title: '資歷驗收', sub: '個人潛水資歷' },
    { num: 5, title: '5米停留', sub: '住宿房型選擇' },
    { num: 6, title: '平安升水', sub: '醫療健康聲明' }
  ] : [
    { num: 1, title: '水面整備', sub: '基本與保險資料' },
    { num: 2, title: '海底探索', sub: '裝備需求配置' },
    { num: 3, title: '資歷驗收', sub: '個人潛水資歷' },
    { num: 4, title: '平安升水', sub: '醫療健康聲明' }
  ];
  const totalSteps = stepTitles.length;
  
  const isStepOverview = isCourse && step === 1;
  const isStepBasic = (isCourse && step === 2) || (!isCourse && step === 1);
  const isStepEq = (isCourse && step === 3) || (!isCourse && step === 2);
  const isStepExperience = (isCourse && step === 4) || (!isCourse && step === 3);
  const isStepAcc = isCourse && step === 5;
  const isStepMedical = (isCourse && step === 6) || (!isCourse && step === 4);

  // Step 1 / 2: 基礎與保險
  const [f, setF] = useState({ 
    name: '', nickname: '', phone: '', idNumber: '', birthday: '', height: '', weight: '', shoeSize: '',
    diveCertSystem: '無證照 (新手)', diveLevel: '', totalDives: '0', expNotes: '', specialties: [] 
  });
  const [weights, setWeights] = useState({ w1: 0, w2: 0, w25: 0, w3: 0 });
  const totalWeight = (weights.w1*1) + (weights.w2*2) + (weights.w25*2.5) + (weights.w3*3);

  const SPECIALTY_OPTIONS = ["高氧 (Nitrox)", "深潛 (Deep)", "夜潛 (Night)", "水底導航 (Navigation)", "沉船 (Wreck)", "側掛 (Sidemount)", "乾衣 (Drysuit)", "水底攝影 (Photography)", "裝備專家", "頂尖中性浮力", "放流 (Drift)"];

  // Step 2: 裝備租借 與 選修加購
  const [useLocalShopEq, setUseLocalShopEq] = useState(false);
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [rentals, setRentals] = useState([]); // { eqId, name, size, category, price }
  const [selectedElectives, setSelectedElectives] = useState([]); // 儲存已勾選的選修項目 ID
  
  // 潛旅當地租借裝備清單與完整選項
  const LOCAL_SHOP_GEARS = [
    { name: 'BCD', category: '重裝備', options: ['XS', 'S', 'M', 'L', 'XL'] },
    { name: '調節器 (含備用及儀表)', category: '重裝備', options: ['標準 (YOKE)', 'DIN'] },
    { name: '防寒衣 (Wetsuit)', category: '輕裝備', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { name: '面鏡 (Mask)', category: '輕裝備', options: ['無度數', '近視 -150', '近視 -200', '近視 -250', '近視 -300', '近視 -350', '近視 -400', '近視 -450', '近視 -500', '近視 -550', '近視 -600', '近視 -650', '近視 -700', '近視 -800'] },
    { name: '套鞋 (Boots)', category: '輕裝備', options: ['22', '23', '24', '25', '26', '27', '28', '29', '30'] },
    { name: '蛙鞋 (Fins)', category: '輕裝備', options: ['XS', 'S', 'M', 'L', 'XL'] },
    { name: '潛水電腦錶 (Computer)', category: '其他配件', options: ['單一規格'] },
    { name: '手電筒 (Torch)', category: '其他配件', options: ['單一規格'] },
    { name: '頭套 (Hood)', category: '其他配件', options: ['S', 'M', 'L'] },
    { name: '手套 (Gloves)', category: '其他配件', options: ['S', 'M', 'L'] },
    { name: 'SMB 與 線輪', category: '其他配件', options: ['單一規格'] },
    { name: '流掛 (Reef Hook)', category: '其他配件', options: ['單一規格'] },
  ];

  // 計算裝備費用 (自動套用套裝與回客折扣)
  const calculateEqPrice = () => {
    if (isCourse) return 0; 
    if (isTrip && useLocalShopEq) return 0; 

    let heavyCount = rentals.filter(r => r.category === '重裝備').length;
    let lightCount = rentals.filter(r => r.category === '輕裝備').length;
    let rawTotal = rentals.reduce((sum, r) => sum + r.price, 0);
    
    const packs = sysConfig.equipmentPackages || {};
    
    // 套裝計算
    if (heavyCount >= 2 && lightCount >= 3 && packs.full) rawTotal = packs.full;
    else if (heavyCount >= 2 && packs.heavy) rawTotal = packs.heavy + rentals.filter(r => r.category !== '重裝備').reduce((sum, r) => sum + r.price, 0);
    else if (lightCount >= 3 && packs.light) rawTotal = packs.light + rentals.filter(r => r.category !== '輕裝備').reduce((sum, r) => sum + r.price, 0);
    
    // 回客折扣疊加計算
    if (isReturningCustomer) {
      const discountRate = packs.returnCustomerDiscount > 0 ? packs.returnCustomerDiscount : 100;
      rawTotal = Math.round(rawTotal * (discountRate / 100));
    }
    
    return rawTotal;
  };

  // 總計金額計算 (活動基底 + 裝備 + 簽證 + 選修 + 強制必修)
  const calculateTotal = () => {
    let total = activity.price + calculateEqPrice();
    if (isCourse && activity.certFee) total += activity.certFee;
    if (isCourse && activity.compulsories?.length > 0) {
       activity.compulsories.forEach(comp => {
          if (typeof comp === 'object' && comp.price > 0) total += comp.price;
       });
    }
    if (isCourse && activity.electives?.length > 0) {
       activity.electives.forEach(el => {
          if (selectedElectives.includes(el.id)) total += el.price;
       });
    }
    return total;
  };

  // Step 3: 住宿 (僅課程)
  const [accOption, setAccOption] = useState('included'); 

  // Step 4: 醫療聲明
  const [medicalAnswers, setMedicalAnswers] = useState({});
  const hasMedicalIssue = Object.values(medicalAnswers).some(val => val === true);

  // 驗證醫療問卷是否填寫完畢 (母題勾是才需檢查子題)
  const isMedicalComplete = sysConfig.medicalForm.every(q => {
    if (medicalAnswers[q.id] === undefined) return false;
    if (medicalAnswers[q.id] === true && q.subItems && q.subItems.length > 0) {
      return q.subItems.every(sub => medicalAnswers[sub.id] !== undefined);
    }
    return true;
  });

  const handleSubmit = async () => {
    if (step < totalSteps) { setStep(step + 1); return; }
    if(isSubmitting) return; setIsSubmitting(true);
    try {
      const finalElectives = isCourse && activity.electives ? activity.electives.filter(e => selectedElectives.includes(e.id)) : [];
      const medicalIssues = [];
      sysConfig.medicalForm.forEach(q => { if (medicalAnswers[q.id] === true) { medicalIssues.push(q.text); if (q.subItems) q.subItems.forEach(sub => { if (medicalAnswers[sub.id] === true) medicalIssues.push("↳ " + sub.text); }); } });
      const submitData = { type: 'activity', itemName: activity.name || activity.courseName, price: calculateTotal(), ...f, weights, rentals, selectedElectives: finalElectives, certFee: activity.certFee || 0, certSystem: activity.certSystem || '', useLocalShopEq, isReturningCustomer, accOption: isTrip ? 'trip' : accOption, medicalAnswers, medicalIssues, hasMedicalIssue: medicalIssues.length > 0, activityId: activity.id, isCourse: isCourse };
      await onSubmit(submitData);
      let gotoAcc = false; let accContext = null;
      if (isCourse && accOption === 'upgrade') { gotoAcc = true; accContext = { type: 'course_upgrade', date: activity.date, days: activity.days || 3, baseDeduct: 800 }; }
      else if (!isCourse && !isTrip && accOption !== 'self') { gotoAcc = true; accContext = { type: 'activity_discount', date: activity.date, discountType: sysConfig.accDiscountType, discountVal: sysConfig.accDiscountValue }; }
      onSuccess({ gotoAcc, accContext });
    } catch (error) { console.error(error); setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/85 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 overflow-hidden">
        
        {/* Header & Progress */}
        <div className="bg-slate-900 text-white p-6 shrink-0 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
              <span className="bg-blue-600 text-xs font-black px-2 py-1 rounded-md mb-2 inline-block">線上報名單</span>
              <h2 className="text-2xl font-black">{String(activity.name || activity.courseName)}</h2>
            </div>
            <button onClick={onClose} disabled={isSubmitting} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="relative z-10 flex justify-between items-center px-2">
            {stepTitles.map((s, idx) => (
              <div key={s.num} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${step >= s.num ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-[10px] font-bold mt-2 tracking-widest ${step >= s.num ? 'text-blue-200' : 'text-slate-500'}`}>{s.title}</span>
              </div>
            ))}
            {/* Progress Line */}
            <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-800 z-0">
               <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
            </div>
          </div>
        </div>
        
        {/* Form Body */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
               <div className="w-2 h-6 bg-blue-600 rounded-full"></div> 
               {stepTitles[step-1].sub}
            </h3>

            {/* 新增: 課程專屬 Step 1 (總覽) */}
            {isStepOverview && (
              <div className="space-y-6">
                {/* 課程日程安排與詳細資訊提示塊 */}
                {activity.schedule && activity.schedule.some(s => {
                   if (typeof s === 'string') return s.trim() !== '';
                   return s.slots && s.slots.some(slot => slot.content.trim() !== '');
                }) && (
                   <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl shadow-sm">
                      <h4 className="text-sm font-black text-indigo-900 mb-4 flex items-center gap-2">
                         <BookOpen className="w-5 h-5"/> 課程日程與內容安排
                      </h4>
                      <div className="space-y-4">
                         {activity.schedule.map((dayPlan, idx) => {
                            if (typeof dayPlan === 'string') {
                               return dayPlan.trim() ? (
                                  <div key={idx} className="flex gap-3">
                                     <span className="text-indigo-700 font-black text-xs bg-indigo-100 px-2 py-1 rounded shrink-0 mt-0.5 shadow-sm">Day {idx+1}</span>
                                     <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{dayPlan}</p>
                                  </div>
                               ) : null;
                            } else {
                               const hasContent = dayPlan.slots?.some(s => s.content.trim());
                               if (!hasContent) return null;
                               return (
                                  <div key={idx} className="flex flex-col gap-2 mb-2 last:mb-0">
                                     <span className="text-indigo-700 font-black text-xs bg-indigo-100 px-3 py-1.5 rounded w-fit shadow-sm">Day {dayPlan.day || idx+1}</span>
                                     <div className="pl-3 space-y-2 mt-1 border-l-2 border-indigo-200 ml-1.5">
                                        {dayPlan.slots.map((slot, sIdx) => slot.content.trim() ? (
                                           <div key={sIdx} className="text-sm font-bold text-slate-700 flex gap-3 items-start">
                                              <span className="text-slate-500 text-[11px] font-black shrink-0 mt-0.5 min-w-[3.5rem] px-1.5 bg-white border border-slate-200 text-center rounded py-0.5 shadow-sm whitespace-nowrap">{slot.period}</span>
                                              <span className="leading-relaxed flex-1 mt-0.5">{slot.content}</span>
                                           </div>
                                        ) : null)}
                                     </div>
                                  </div>
                               );
                            }
                         })}
                      </div>
                   </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* 服務項目區塊 */}
                   <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-full">
                      <h4 className="font-black text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                         <CheckCircle className="w-5 h-5 text-teal-500"/> 課程提供服務
                      </h4>
                      <ul className="space-y-3">
                         {(activity.services && activity.services.length > 0) ? activity.services.map((srv, idx) => (
                            <li key={idx} className="text-sm font-bold text-slate-600 flex items-start gap-2.5">
                               <span className="text-teal-500 mt-0.5"><Check className="w-4 h-4" /></span> <span className="leading-relaxed">{srv}</span>
                            </li>
                         )) : null}
                      </ul>
                   </div>

                   {/* 必修與選修區塊 */}
                   <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-full">
                      <h4 className="font-black text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                         <Plus className="w-5 h-5 text-purple-500"/> 必修、選修與加購資訊
                      </h4>
                      <div className="space-y-4">
                         <div>
                            <h5 className="text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">強制/必修項目</h5>
                            {activity.certFee > 0 && (
                               <div className="text-sm font-bold text-slate-700 flex justify-between items-center mb-2 bg-slate-50 p-2 rounded-lg">
                                  <span>{activity.certSystem} 簽證費</span>
                                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">+NT$ {activity.certFee}</span>
                               </div>
                            )}
                            {(activity.compulsories || []).map((c, i) => {
                               const name = typeof c === 'string' ? c : c.name;
                               const price = typeof c === 'object' && c.price > 0 ? c.price : 0;
                               return (
                                  <div key={i} className="text-sm font-bold text-slate-700 flex justify-between items-center mb-2 bg-slate-50 p-2 rounded-lg">
                                     <span>{name}</span>
                                     <span className={price > 0 ? 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100' : 'text-slate-400'}>{price > 0 ? `+NT$ ${price}` : '免費/內含'}</span>
                                  </div>
                               );
                            })}
                         </div>
                         {activity.electives && activity.electives.length > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                               <h5 className="text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest mt-2">可自由加購選修 (稍後可選)</h5>
                               {activity.electives.map((el, i) => (
                                  <div key={i} className="text-sm font-bold text-slate-700 flex justify-between items-center mb-2 bg-slate-50 p-2 rounded-lg">
                                     <span>{el.name}</span>
                                     <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">+NT$ {el.price}</span>
                                  </div>
                               ))}
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* 備註及注意事項 */}
                {activity.notes && (
                   <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-sm">
                      <h4 className="font-black text-amber-900 mb-3 flex items-center gap-2">
                         <AlertTriangle className="w-5 h-5 text-amber-500"/> 備註與注意事項
                      </h4>
                      <p className="text-sm font-bold text-amber-800 whitespace-pre-wrap leading-relaxed">
                         {activity.notes}
                      </p>
                   </div>
                )}
              </div>
            )}

            {/* STEP: Basic Data */}
            {isStepBasic && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="真實姓名 *" required value={f.name} onChange={v => setF({...f, name: v})} placeholder="保險與證照使用" />
                  <FormInput label="常用暱稱" value={f.nickname} onChange={v => setF({...f, nickname: v})} placeholder="教練稱呼您的方式" />
                  <FormInput label="聯絡手機 *" required type="tel" value={f.phone} onChange={v => setF({...f, phone: formatPhoneNumber(v)})} placeholder="09xx-xxx-xxx" />
                  <FormInput label="身分證/護照號碼 *" required value={f.idNumber} onChange={v => setF({...f, idNumber: v})} placeholder="辦理潛水平安險使用" />
                  <BirthdaySelect label="出生年月日 *" required value={f.birthday} onChange={v => setF({...f, birthday: v})} />
                  <div className="grid grid-cols-3 gap-3">
                    <FormInput label="身高 (cm) *" required type="number" value={f.height} onChange={v => setF({...f, height: v})} />
                    <FormInput label="體重 (kg) *" required type="number" value={f.weight} onChange={v => setF({...f, weight: v})} />
                    <FormInput label="鞋碼 (cm) *" required type="number" value={f.shoeSize} onChange={v => setF({...f, shoeSize: v})} placeholder="22-30" />
                  </div>
                </div>
                
                {!isCourse && !isTrip && (
                  <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100 mt-4">
                     <label className="text-sm font-black text-teal-800 block mb-3">需要我們為您安排住宿嗎？</label>
                     <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border border-teal-200">
                           <input type="radio" checked={accOption === 'upgrade'} onChange={() => setAccOption('upgrade')} className="w-4 h-4 text-teal-600" />
                           <span className="font-bold text-sm text-teal-900">需要，請幫我預訂</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border border-teal-200">
                           <input type="radio" checked={accOption === 'self'} onChange={() => setAccOption('self')} className="w-4 h-4 text-teal-600" />
                           <span className="font-bold text-sm text-teal-900">不需要，我已自理</span>
                        </label>
                     </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP: Equipment Rental & Add-ons */}
            {isStepEq && (
              <div className="space-y-6">

                 {/* AI 體型與配重分析嵌入 & 配重選擇 (移至此處) */}
                 <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4">
                   <h3 className="font-black text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                     <Scale className="w-5 h-5 text-blue-500" /> 配重需求與體型分析
                   </h3>

                   {f.height && f.weight ? (
                     <div className="mb-6">
                       <AISizeAdvisor height={f.height} weight={f.weight} shoeSize={f.shoeSize} showWeight={true} />
                     </div>
                   ) : (
                     <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 text-center">
                       請回上一步填寫身高與體重，以啟用 AI 體型分析與裝備尺寸建議。
                     </div>
                   )}

                   <label className="text-sm font-black text-slate-800 block mb-4 border-b pb-2">配重需求選擇 (供教練準備參考)</label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <WeightControl label="1 公斤" value={weights.w1} onAdd={() => setWeights({...weights, w1: weights.w1+1})} onSub={() => setWeights({...weights, w1: Math.max(0, weights.w1-1)})} />
                      <WeightControl label="2 公斤" value={weights.w2} onAdd={() => setWeights({...weights, w2: weights.w2+1})} onSub={() => setWeights({...weights, w2: Math.max(0, weights.w2-1)})} />
                      <WeightControl label="2.5 公斤" value={weights.w25} onAdd={() => setWeights({...weights, w25: weights.w25+1})} onSub={() => setWeights({...weights, w25: Math.max(0, weights.w25-1)})} />
                      <WeightControl label="3 公斤" value={weights.w3} onAdd={() => setWeights({...weights, w3: weights.w3+1})} onSub={() => setWeights({...weights, w3: Math.max(0, weights.w3-1)})} />
                   </div>
                   <div className="mt-4 flex justify-end items-center">
                      <div>
                         <span className="text-sm font-bold text-slate-500 mr-3">總需配重：</span>
                         <span className="text-xl font-black text-blue-600">{totalWeight} kg</span>
                      </div>
                   </div>
                 </div>

                 {/* 課程專屬加購與簽證費 */}
                 {isCourse && (
                    <div className="space-y-4 mb-8">
                       <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm">
                         <Info className="w-5 h-5 shrink-0" /> 課程費用已包含裝備租借，請安心選擇下方的裝備尺寸。
                       </div>

                       {(activity.certFee > 0 || activity.electives?.length > 0 || activity.compulsories?.some(c => typeof c === 'object' && c.price > 0)) && (
                         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                           <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                             <h4 className="font-black text-slate-800 flex items-center gap-2"><Plus className="w-5 h-5 text-purple-500"/> 課程選修加購與強制費用</h4>
                             <span className="text-xl font-black text-blue-600">小計: NT$ {calculateTotal() - activity.price - calculateEqPrice()}</span>
                           </div>
                           
                           <div className="space-y-3">
                              {activity.compulsories?.filter(c => typeof c === 'object' && c.price > 0).map(comp => (
                                <div key={comp.id} className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-xl">
                                  <span className="font-bold text-blue-900 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500"/> {comp.name} (必修費用)</span>
                                  <span className="font-black text-blue-700 text-sm">+NT$ {comp.price}</span>
                                </div>
                              ))}

                              {activity.certFee > 0 && (
                                <div className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-xl">
                                  <span className="font-bold text-amber-900 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-amber-500"/> {activity.certSystem || '系統'} 簽證費 (必收)</span>
                                  <span className="font-black text-amber-700 text-sm">+NT$ {activity.certFee}</span>
                                </div>
                              )}
                              
                              {activity.electives?.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                  {activity.electives.map(el => (
                                    <label key={el.id} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all shadow-sm ${selectedElectives.includes(el.id) ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}>
                                      <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={selectedElectives.includes(el.id)} onChange={(e) => {
                                          if (e.target.checked) setSelectedElectives([...selectedElectives, el.id]);
                                          else setSelectedElectives(selectedElectives.filter(id => id !== el.id));
                                        }} className="w-4 h-4 text-purple-600 rounded" />
                                        <span className="font-bold text-slate-700 text-sm">{el.name}</span>
                                      </div>
                                      <span className="font-black text-purple-700 text-sm">+NT$ {el.price}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                           </div>
                         </div>
                       )}
                    </div>
                 )}
                 
                 {/* 潛旅專屬勾選 */}
                 {isTrip && (
                   <label className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl cursor-pointer shadow-sm mb-6 transition-all hover:bg-indigo-100">
                     <input type="checkbox" checked={useLocalShopEq} onChange={e => {setUseLocalShopEq(e.target.checked); setRentals([]);}} className="w-5 h-5 text-indigo-600 rounded" />
                     <div>
                       <span className="font-black text-indigo-900 block">使用潛旅當地潛店裝備</span>
                       <span className="text-xs font-bold text-indigo-600 mt-1">勾選後將展開完整規格供您填寫，費用依當地報價為準，不扣除本店庫存。</span>
                     </div>
                   </label>
                 )}

                 {/* FUN DIVE 一般裝備收費 */}
                 {!isCourse && !useLocalShopEq && (
                   <label className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl cursor-pointer shadow-sm mb-6 transition-all hover:bg-orange-100">
                     <input type="checkbox" checked={isReturningCustomer} onChange={e => setIsReturningCustomer(e.target.checked)} className="w-5 h-5 text-orange-600 rounded" />
                     <div>
                       <span className="font-black text-orange-900 block">我是回客 (曾參加過本店活動/課程)</span>
                       <span className="text-xs font-bold text-orange-600 mt-1">勾選後將自動為您套用回客專屬裝備折扣！</span>
                     </div>
                   </label>
                 )}

                 {/* 裝備選擇區 (依分類顯示) */}
                 <div className="space-y-8">
                   {['重裝備', '輕裝備', '其他配件'].map(cat => {
                      const localCatItems = LOCAL_SHOP_GEARS.filter(g => g.category === cat);
                      const shopCatItems = equipments.filter(eq => eq.category === cat && (eq.hasSpecs ? eq.specDetails?.some(s => s.ready > 0) : eq.readyQuantity > 0));

                      // 如果該分類沒有任何項目，則不顯示該區塊
                      if (useLocalShopEq && localCatItems.length === 0) return null;
                      if (!useLocalShopEq && shopCatItems.length === 0) return null;

                      const recSize = calculateRecommendedSize(f.height, f.weight);
                      const recBoot = calculateBootSize(f.shoeSize);
                      const recFin = calculateFinSize(f.shoeSize);

                      return (
                        <div key={cat} className="space-y-4">
                          <h4 className="text-sm font-black text-slate-600 border-l-4 border-blue-500 pl-3">{cat}</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {useLocalShopEq ? (
                               // 潛旅當地裝備：分類渲染
                               localCatItems.map(gear => {
                                  const isApparel = gear.name.toUpperCase().includes('BCD') || gear.name.includes('防寒衣') || gear.name.toUpperCase().includes('WETSUIT');
                                  const isChecked = rentals.some(r => r.name === gear.name);
                                  return (
                                  <div key={gear.name} className={`p-3.5 sm:p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 transition-all duration-300 ${isChecked ? 'bg-blue-50/40 border-blue-400' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                                     <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                                       <input type="checkbox" checked={isChecked} onChange={e => {
                                         if (e.target.checked) {
                                           const isBoot = gear.name.includes('套鞋') || gear.name.toUpperCase().includes('BOOTS');
                                           const isFin = gear.name.includes('蛙鞋') || gear.name.toUpperCase().includes('FINS');
                                           let initialSize = gear.options[0];
                                           if (isApparel && recSize) initialSize = recSize;
                                           else if (isBoot && recBoot) initialSize = recBoot;
                                           else if (isFin && recFin) initialSize = recFin;

                                           setRentals([...rentals, { eqId: 'local-'+gear.name, name: gear.name, size: initialSize, category: gear.category, price: 0 }]);
                                         } else {
                                           setRentals(rentals.filter(r => r.name !== gear.name));
                                         }
                                       }} className="w-5 h-5 text-blue-600 rounded shrink-0" />
                                       <span className="font-bold text-slate-800 text-sm leading-snug">{gear.name}</span>
                                     </label>
                                     
                                     {isChecked && gear.options.length > 0 && (
                                       <div className="pl-8 sm:pl-0 w-full sm:w-auto shrink-0 animate-in fade-in zoom-in-95 duration-200">
                                         <select value={rentals.find(r=>r.name===gear.name)?.size || gear.options[0]} onChange={e => {
                                           const newR = [...rentals];
                                           const idx = newR.findIndex(r=>r.name===gear.name);
                                           if(idx>=0) newR[idx].size = e.target.value;
                                           setRentals(newR);
                                         }} className="w-full sm:w-56 p-2.5 border border-blue-300 rounded-xl text-sm font-bold outline-none focus:border-blue-600 bg-white shadow-sm text-blue-900 cursor-pointer">
                                            {gear.options.map(opt => {
                                              const isBoot = gear.name.includes('套鞋') || gear.name.toUpperCase().includes('BOOTS');
                                              const isFin = gear.name.includes('蛙鞋') || gear.name.toUpperCase().includes('FINS');
                                              const showRec = (isApparel && opt === recSize) || (isBoot && opt === String(recBoot)) || (isFin && opt === recFin);
                                              return <option key={opt} value={opt}>{opt} {showRec ? '💡(AI建議)' : ''}</option>
                                            })}
                                         </select>
                                       </div>
                                     )}
                                  </div>
                               )
                               })
                            ) : (
                               // 本店庫存模式：分類渲染
                               shopCatItems.map(eq => {
                                   const isApparel = eq.name.toUpperCase().includes('BCD') || eq.name.includes('防寒衣') || eq.name.toUpperCase().includes('WETSUIT');
                                   const isChecked = rentals.some(r => r.eqId === eq.id);
                                   return (
                                   <div key={eq.id} className={`p-3.5 sm:p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 transition-all duration-300 ${isChecked ? 'bg-blue-50/40 border-blue-400' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                                        <input type="checkbox" checked={isChecked} onChange={(e) => {
                                          if (e.target.checked) {
                                            let defaultSize = 'F';
                                            const isBoot = eq.name.includes('套鞋') || eq.name.toUpperCase().includes('BOOTS');
                                            const isFin = eq.name.includes('蛙鞋') || eq.name.toUpperCase().includes('FINS');

                                            if (eq.hasSpecs && eq.specDetails?.length > 0) {
                                                if (isBoot && recBoot) {
                                                    const hasRec = eq.specDetails.some(s => s.name === String(recBoot) && s.ready > 0);
                                                    defaultSize = hasRec ? String(recBoot) : (eq.specDetails.filter(s=>s.ready>0)[0]?.name || 'F');
                                                } else if (isFin && recFin) {
                                                    const hasRec = eq.specDetails.some(s => s.name === recFin && s.ready > 0);
                                                    defaultSize = hasRec ? recFin : (eq.specDetails.filter(s=>s.ready>0)[0]?.name || 'F');
                                                } else {
                                                    const hasRecStock = eq.specDetails.some(s => s.name === recSize && s.ready > 0);
                                                    defaultSize = (isApparel && hasRecStock) ? recSize : (eq.specDetails.filter(s=>s.ready>0)[0]?.name || 'F');
                                                }
                                            }
                                            setRentals([...rentals, { eqId: eq.id, name: eq.name, size: defaultSize, category: eq.category, price: eq.price || 0 }]);
                                          } else {
                                            setRentals(rentals.filter(r => r.eqId !== eq.id));
                                          }
                                        }} className="w-5 h-5 text-blue-600 rounded shrink-0" />
                                        <div className="flex flex-wrap items-center gap-2 flex-1">
                                           <span className="font-bold text-slate-800 text-sm leading-snug">{String(eq.name)}</span>
                                           {!isCourse && <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">NT$ {eq.price} / 晚</span>}
                                        </div>
                                      </label>
                                      
                                      {isChecked && eq.hasSpecs && (
                                         <div className="pl-8 sm:pl-0 w-full sm:w-auto shrink-0 animate-in fade-in zoom-in-95 duration-200">
                                           <select value={rentals.find(r=>r.eqId===eq.id)?.size || ''} onChange={e => {
                                              const newR = [...rentals];
                                              const idx = newR.findIndex(r=>r.eqId===eq.id);
                                              if(idx>=0) newR[idx].size = e.target.value;
                                              setRentals(newR);
                                           }} className="w-full sm:w-56 p-2.5 border border-blue-300 rounded-xl text-sm font-bold outline-none focus:border-blue-600 bg-white shadow-sm text-blue-900 cursor-pointer">
                                              {eq.specDetails.filter(s => s.ready > 0).map(spec => {
                                                 const isBoot = eq.name.includes('套鞋') || eq.name.toUpperCase().includes('BOOTS');
                                                 const isFin = eq.name.includes('蛙鞋') || eq.name.toUpperCase().includes('FINS');
                                                 const showRec = (isApparel && spec.name === recSize) || (isBoot && spec.name === String(recBoot)) || (isFin && spec.name === recFin);
                                                 return <option key={spec.id} value={spec.name}>{spec.name} {showRec ? '💡(AI建議)' : ''} (可用:{spec.ready})</option>
                                              })}
                                           </select>
                                         </div>
                                      )}
                                   </div>
                               )
                               })
                            )}
                          </div>
                        </div>
                      );
                   })}
                 </div>

                 {/* 瘦身後的 FUN DIVE 一般裝備收費總計 (懸浮在最下方) */}
                 {!isCourse && !useLocalShopEq && (
                   <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-t-xl flex justify-between items-center mt-6 border border-slate-200 shadow-[0_-5px_15px_rgba(0,0,0,0.08)] sticky bottom-0 z-30 border-t-4 border-t-blue-500">
                     <span className="font-black text-slate-700 text-sm sm:text-base">預估裝備總額</span>
                     <div className="flex items-center gap-2 sm:gap-3">
                       <div className="flex flex-col items-end gap-1">
                         {rentals.length > 0 && <span className="text-[9px] sm:text-[10px] text-blue-700 font-bold bg-blue-100 px-1.5 py-0.5 rounded shadow-sm leading-none">✓ 最優惠組合</span>}
                         {isReturningCustomer && rentals.length > 0 && <span className="text-[9px] sm:text-[10px] text-orange-700 font-bold bg-orange-100 px-1.5 py-0.5 rounded shadow-sm leading-none">✓ 回客折扣</span>}
                       </div>
                       <span className="text-xl sm:text-2xl font-black text-blue-600 leading-none">NT$ {calculateEqPrice()}</span>
                     </div>
                   </div>
                 )}

              </div>
            )}

            {/* STEP: Personal Diving Experience */}
            {isStepExperience && (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-xl text-blue-600 shrink-0"><Award className="w-6 h-6"/></div>
                  <div>
                    <h4 className="font-black text-blue-900 text-sm">為什麼需要填寫資歷？</h4>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">了解您的潛水背景能協助教練安排最適合您的配重、分組與導潛節奏，確保活動安全且愉快。</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">潛水證照系統</label>
                    <select value={f.diveCertSystem} onChange={e => setF({...f, diveCertSystem: e.target.value})} className="w-full p-3.5 bg-white border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all">
                      <option value="無證照 (新手)">無證照 (新手 / 體驗中)</option>
                      <option value="PADI">PADI</option>
                      <option value="SSI">SSI</option>
                      <option value="NAUI">NAUI</option>
                      <option value="SDI/TDI">SDI / TDI</option>
                      <option value="CMAS">CMAS</option>
                      <option value="AIDA">AIDA (自由潛水)</option>
                      <option value="其他">其他系統</option>
                    </select>
                  </div>
                  <FormInput label="證照等級 (如: OWD, AOWD)" value={f.diveLevel} onChange={v => setF({...f, diveLevel: v})} placeholder="例如: 高階開放水域潛水員" />
                  <FormInput label="累計總潛水支數 (Log Dives)" type="number" value={f.totalDives} onChange={v => setF({...f, totalDives: v})} placeholder="請填寫數字" />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-700 ml-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" /> 已取得之專長證照 (可複選)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SPECIALTY_OPTIONS.map(opt => (
                      <label key={opt} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${f.specialties.includes(opt) ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                        <input type="checkbox" checked={f.specialties.includes(opt)} onChange={(e) => {
                          if (e.target.checked) setF({...f, specialties: [...f.specialties, opt]});
                          else setF({...f, specialties: f.specialties.filter(s => s !== opt)});
                        }} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-xs font-bold text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 block">特別註明事項 / 潛水偏好</label>
                  <textarea value={f.expNotes} onChange={e => setF({...f, expNotes: e.target.value})} placeholder="例如：耳壓平衡較慢、容易暈船、想看微距生物..." className="w-full p-4 border border-slate-300 bg-white rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-24" />
                </div>
              </div>
            )}

            {/* STEP: Accommodation (Course Only) */}
            {isStepAcc && (
              <div className="space-y-5">
                 <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl font-bold text-sm mb-6">
                    🎁 您的潛水課程已免費包含【背包房床位】。您可以選擇維持原狀、升級獨立房型，或是將床位釋出。
                 </div>
                 
                 <label className={`flex gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${accOption === 'included' ? 'border-blue-500 bg-white shadow-md' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}>
                   <input type="radio" checked={accOption === 'included'} onChange={() => setAccOption('included')} className="mt-1 w-5 h-5 text-blue-600" />
                   <div>
                     <span className="font-black text-lg text-slate-800 block">維持背包房床位</span>
                     <span className="text-sm font-bold text-slate-500 mt-1 block">由店裡為您安排乾淨舒適的背包床位 (免加價)</span>
                   </div>
                 </label>

                 <label className={`flex gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${accOption === 'upgrade' ? 'border-amber-500 bg-white shadow-md' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}>
                   <input type="radio" checked={accOption === 'upgrade'} onChange={() => setAccOption('upgrade')} className="mt-1 w-5 h-5 text-amber-600" />
                   <div>
                     <span className="font-black text-lg text-amber-700 block">升級獨立房型</span>
                     <span className="text-sm font-bold text-slate-500 mt-1 block">補差額升級雙人/四人房。報名完成後將導向訂房頁面，並自動為您扣除床位費用！</span>
                   </div>
                 </label>

                 <label className={`flex gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${accOption === 'release' ? 'border-slate-400 bg-white shadow-md' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}>
                   <input type="radio" checked={accOption === 'release'} onChange={() => setAccOption('release')} className="mt-1 w-5 h-5 text-slate-600" />
                   <div>
                     <span className="font-black text-lg text-slate-700 block">釋出床位 (與同行友人同住)</span>
                     <span className="text-sm font-bold text-slate-500 mt-1 block">朋友已升級房型，我不需要額外的背包床位了。</span>
                   </div>
                 </label>
              </div>
            )}

            {/* STEP: Medical Form */}
            {isStepMedical && (
              <div className="space-y-6 pb-20">
                 <div className="space-y-4">
                   {sysConfig.medicalForm.map((q, idx) => (
                     <div key={q.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                        <div className="mb-2">
                           <p className="font-bold text-slate-800 mb-3">{String(q.text)}</p>
                           <div className="flex gap-4">
                              <label className={`flex-1 py-2.5 rounded-xl border-2 flex justify-center items-center gap-2 cursor-pointer transition-colors ${medicalAnswers[q.id] === false ? 'bg-green-50 border-green-500 text-green-700 font-black' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                <input type="radio" name={`med_${q.id}`} className="hidden" checked={medicalAnswers[q.id] === false} onChange={() => setMedicalAnswers({...medicalAnswers, [q.id]: false})} />
                                否 / 無此狀況
                              </label>
                              <label className={`flex-1 py-2.5 rounded-xl border-2 flex justify-center items-center gap-2 cursor-pointer transition-colors ${medicalAnswers[q.id] === true ? 'bg-rose-50 border-rose-500 text-rose-700 font-black' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                <input type="radio" name={`med_${q.id}`} className="hidden" checked={medicalAnswers[q.id] === true} onChange={() => setMedicalAnswers({...medicalAnswers, [q.id]: true})} />
                                是 / 有此狀況
                              </label>
                           </div>
                        </div>
                        
                        {/* 只有在母題目勾選「是」時，才展開子題目 */}
                        {q.subItems && q.subItems.length > 0 && medicalAnswers[q.id] === true && (
                          <div className="pl-4 pt-4 mt-4 border-t border-rose-100 space-y-3 animate-in slide-in-from-top-2">
                             <div className="text-xs font-black text-rose-600 mb-2 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> 請進一步確認以下延伸狀況：</div>
                             {q.subItems.map(sub => (
                                <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                                   <p className="text-sm text-slate-700 font-bold flex-1">{String(sub.text)}</p>
                                   <div className="flex gap-2 shrink-0">
                                      <label className={`px-4 py-2 rounded-lg border-2 flex justify-center items-center cursor-pointer transition-colors ${medicalAnswers[sub.id] === false ? 'bg-green-50 border-green-500 text-green-700 font-black' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                        <input type="radio" name={`med_${sub.id}`} className="hidden" checked={medicalAnswers[sub.id] === false} onChange={() => setMedicalAnswers({...medicalAnswers, [sub.id]: false})} />
                                        否
                                      </label>
                                      <label className={`px-4 py-2 rounded-lg border-2 flex justify-center items-center cursor-pointer transition-colors ${medicalAnswers[sub.id] === true ? 'bg-rose-50 border-rose-500 text-rose-700 font-black' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                        <input type="radio" name={`med_${sub.id}`} className="hidden" checked={medicalAnswers[sub.id] === true} onChange={() => setMedicalAnswers({...medicalAnswers, [sub.id]: true})} />
                                        是
                                      </label>
                                   </div>
                                </div>
                             ))}
                          </div>
                        )}
                     </div>
                   ))}
                 </div>

                 {hasMedicalIssue && (
                   <div className="bg-rose-50 border-2 border-rose-400 p-5 rounded-2xl text-rose-800 flex items-start gap-3 shadow-sm animate-in slide-in-from-bottom-4">
                     <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                     <div>
                       <h4 className="font-black text-lg mb-1">健康聲明提醒</h4>
                       <p className="text-sm font-bold opacity-90 leading-relaxed">
                         根據您的勾選，您可能有潛在的健康風險。為了您的安全，參加潛水活動前，<span className="bg-rose-200 px-1 rounded text-rose-900">必須攜帶醫生開立的「適宜潛水」診斷證明書</span>。如無法提供，我們將有權拒絕您下水。
                       </p>
                     </div>
                   </div>
                 )}
              </div>
            )}
            
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-white p-6 border-t border-slate-100 shrink-0 flex gap-4">
          {step > 1 ? (
             <button type="button" disabled={isSubmitting} onClick={() => setStep(step - 1)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
               <ChevronLeft className="w-5 h-5" /> 上一步
             </button>
          ) : (
             <button type="button" disabled={isSubmitting} onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50">取消</button>
          )}
          
          <button 
             type="button" 
             disabled={isSubmitting || (isStepBasic && (!f.name || !f.phone || !f.idNumber || !f.birthday || !f.height || !f.weight))}
             onClick={handleSubmit} 
             className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? '處理中...' : step < totalSteps ? '下一步，繼續填寫' : '確認無誤，送出報名單'}
            {step < totalSteps && !isSubmitting && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function AccommodationBookingForm({ room, onClose, onSubmit, sysConfig, context }) {
  const [f, setF] = useState({ 
    name: '', 
    phone: '', 
    checkIn: context?.date || '', 
    nights: context?.days ? context.days - 1 : 1, 
    roomCount: 1,
    guests: 1 
  });
  const [courseStudents, setCourseStudents] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 動態計算最大可折抵人數：預訂房間數 × 每間容納床位數
  const maxStudents = (parseInt(f.roomCount) || 1) * (room.bedCount || 1);

  // 當更改房間數導致上限降低時，自動修正已選的折抵人數
  useEffect(() => {
     if (courseStudents > maxStudents) {
         setCourseStudents(maxStudents);
     }
  }, [maxStudents, courseStudents]);

  const getDiscountInfo = () => {
    if (!context) return null;
    if (context.type === 'activity_discount') return `享專屬活動住宿優惠：${context.discountType === 'percent' ? `打 ${context.discountVal/10} 折` : `折抵 NT$ ${context.discountVal}`}`;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isSubmitting) return;
    setIsSubmitting(true);
    try {
      const finalDetails = {
          ...f,
          nights: parseInt(f.nights) || 1,
          roomCount: parseInt(f.roomCount) || 1,
          guests: parseInt(f.guests) || 1
      };

      if (context?.type === 'course_upgrade') {
          finalDetails.courseStudents = courseStudents;
          // 計算折抵晚數，最高不超過課程涵蓋的總晚數
          finalDetails.discountNights = Math.min(finalDetails.nights, Math.max(1, context.days - 1));
          finalDetails.courseDeductTotal = courseStudents * context.baseDeduct * finalDetails.discountNights;
      }

      await onSubmit({ 
        type: 'accommodation', 
        itemName: room.name, 
        details: finalDetails,
        appliedContext: context || null
      });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col shadow-2xl relative animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-800">預訂房型：{String(room.name)}</h2>
            {context && <span className="inline-block mt-2 bg-amber-100 text-amber-700 text-xs font-black px-2 py-1 rounded shadow-sm">專屬配套訂房</span>}
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"><X className="w-5 h-5" /></button>
        </div>
        
        <form id="accForm" onSubmit={handleSubmit} className="p-6 space-y-5">
          {context?.type === 'activity_discount' && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 mb-2">
               <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-sm font-bold text-amber-800">{getDiscountInfo()}<br/><span className="text-xs opacity-75">實際金額將由店家依照入住日平假日為您人工計算確認。</span></p>
            </div>
          )}

          {context?.type === 'course_upgrade' && (
             <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-4 mb-2 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-1.5 rounded-lg shrink-0 mt-0.5"><Info className="w-5 h-5 text-amber-700" /></div>
                  <div>
                    <p className="text-sm font-black text-amber-900">
                      課程專屬配套：升級房型折抵
                    </p>
                    <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">
                      每位同行報名課程的學員，可折抵原有背包床位費 NT$ {context.baseDeduct} / 晚 (您的課程涵蓋 {Math.max(1, context.days - 1)} 晚)。
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                  <span className="text-sm font-bold text-amber-900">同行上課人數 (最多限 {maxStudents} 人)</span>
                  <select 
                    value={courseStudents} 
                    onChange={e => setCourseStudents(Number(e.target.value))}
                    className="p-1.5 border border-amber-200 rounded-md text-amber-900 font-bold outline-none bg-amber-50 focus:border-amber-400 focus:bg-white transition-colors cursor-pointer"
                  >
                    {Array.from({ length: maxStudents }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} 位學員</option>
                    ))}
                  </select>
                </div>
                <div className="text-right pt-1 border-t border-amber-100">
                  <span className="text-xs text-amber-800 font-bold mr-2">
                    系統試算折抵：
                  </span>
                  <span className="text-xl font-black text-rose-600">
                    -NT$ {courseStudents * context.baseDeduct * Math.min(f.nights || 1, Math.max(1, context.days - 1))}
                  </span>
                  <p className="text-[10px] text-amber-600 mt-0.5">※ 總折抵金額將於最後結帳時由店家依平假日房價扣除</p>
                </div>
             </div>
          )}

          <FormInput label="預訂人姓名" required value={f.name} onChange={v => setF({...f, name: v})} />
          <FormInput label="聯絡電話" required type="tel" value={f.phone} onChange={v => setF({...f, phone: formatPhoneNumber(v)})} placeholder="09xx-xxx-xxx" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput label="入住日期" required type="date" value={f.checkIn} onChange={v => setF({...f, checkIn: v})} />
            <FormInput label="預計晚數" required type="number" value={f.nights} onChange={v => setF({...f, nights: v === '' ? '' : Math.max(1, parseInt(v))})} />
            <FormInput label="預訂房間數" required type="number" value={f.roomCount} onChange={v => setF({...f, roomCount: v === '' ? '' : Math.max(1, parseInt(v))})} />
          </div>
          <FormInput label="入住總人數" required type="number" value={f.guests} onChange={v => setF({...f, guests: v === '' ? '' : Math.max(1, parseInt(v))})} placeholder="計算房型差額使用" />
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl shrink-0 flex gap-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors disabled:opacity-50">取消</button>
          <button type="submit" form="accForm" disabled={isSubmitting} className="flex-1 py-3.5 bg-teal-600 text-white rounded-xl font-black shadow-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isSubmitting ? '處理中...' : '確認提交預訂'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AccPromptModal({ onClose, onGoActivities, onGoAccommodations }) {
  return (
    <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden text-center border border-white">
        <div className="relative z-10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner border border-white transform rotate-3 hover:rotate-0 transition-transform">
            <LifeBuoy className="w-10 h-10 -rotate-3" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-4">專屬配套優惠提示</h2>
          
          <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl mb-8 shadow-sm">
             <p className="text-slate-600 text-sm font-bold leading-relaxed">
               若您有報名 <span className="text-blue-700 font-black">潛水活動</span> 或 <span className="text-blue-700 font-black">課程</span>，系統已內建專屬的住宿配套優惠，<br className="hidden sm:block"/>您不需要在此單獨預訂房間哦！
             </p>
          </div>
          
          <div className="space-y-3">
            <button onClick={onGoActivities} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              前往查看活動與課程 <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={onGoAccommodations} className="w-full py-4 bg-white text-slate-600 rounded-2xl font-bold hover:bg-slate-50 border-2 border-slate-100 hover:border-blue-200 hover:text-blue-600 transition-colors">
              我只想單獨預訂住宿
            </button>
            <button onClick={onClose} className="w-full py-2 mt-2 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">
              取消返回
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDashboard({ bookings }) {
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const filteredResults = useMemo(() => {
    if (!hasSearched) return [];
    const name = searchName.trim();
    const phone = searchPhone.trim();
    return bookings.filter(b => (b.name === name || b.details?.name === name) && (b.phone === phone || b.details?.phone === phone))
                   .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
  }, [bookings, searchName, searchPhone, hasSearched]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchName.trim() || !searchPhone.trim()) return;
    setIsSearching(true);
    setTimeout(() => { setHasSearched(true); setIsSearching(false); }, 500);
  };

  return (
    <div className="relative animate-in fade-in duration-500 max-w-5xl mx-auto pb-20 pt-4 px-4">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-10 pt-4">
          <div className="mx-auto w-20 h-20 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl border border-white transform -rotate-3 hover:rotate-0 transition-transform"><Search className="w-10 h-10" /></div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 drop-shadow-sm mb-3">我的預約與報名查詢</h2>
          <div className="text-slate-500 font-bold">請輸入您報名時填寫的姓名與手機號碼 / Please enter your name and phone.</div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 shadow-sm p-8 mb-10">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-5 gap-5">
            <div className="sm:col-span-2"><FormInput label="真實姓名 / Name" value={searchName} onChange={setSearchName} placeholder="王小明" required /></div>
            <div className="sm:col-span-2"><FormInput label="聯絡手機 / Phone" value={searchPhone} onChange={v => setSearchPhone(formatPhoneNumber(v))} placeholder="09xx-xxx-xxx" required /></div>
            <div className="sm:col-span-1 flex items-end">
              <button type="submit" disabled={isSearching} className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-2">
                {isSearching ? '...' : <Search className="w-5 h-5"/>}
              </button>
            </div>
          </form>
        </div>

        {hasSearched && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4">
              {filteredResults.length > 0 ? filteredResults.map(b => (
                  <div key={b.id} className="bg-white rounded-[2rem] border-2 border-slate-50 p-8 shadow-lg group relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 border-b-2 border-slate-50 pb-6 mb-6">
                      <div>
                        <div className="flex gap-2 items-center mb-2">
                          <span className="px-3 py-1 text-[10px] font-black rounded-full bg-blue-50 border border-blue-100 text-blue-700">
                            {b.type === 'activity' ? '活動報名 / Activity' : '住宿預約 / Accommodation'}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">{formatTs(b.timestamp)}</span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900">{String(b.itemName || '未命名項目')}</h4>
                      </div>
                      <div className={`px-6 py-2 rounded-2xl text-base font-black border-2 ${b.status === 'confirmed' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-amber-50 border-amber-500 text-amber-800'}`}>
                        {b.status === 'confirmed' ? '已確認 / Confirmed' : '處理中 / Pending'}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-base">
                      <div className="flex flex-col gap-1"><span className="text-xs font-black text-slate-400 uppercase">登記姓名 / Name</span><span className="font-black text-slate-800 text-xl">{b.name || b.details?.name}</span></div>
                      <div className="flex flex-col gap-1"><span className="text-xs font-black text-slate-400 uppercase">預約金額 / Total</span><span className="font-black text-blue-600 text-2xl">NT$ {b.price}</span></div>
                    </div>
                  </div>
              )) : <div className="bg-white rounded-[2rem] p-20 text-center shadow-inner font-black text-slate-300">查無相關預約紀錄 / No records found</div>}
           </div>
        )}
      </div>
    </div>
  );
}

const DivingTankIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 12V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v7" />
    <path d="M5 12v7a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-7H5z" />
    <path d="M12 3v-1" />
    <path d="M10 2h4" />
  </svg>
);

function EquipmentRentalPage({ equipments, sysConfig, onBook, onBack }) {
  const [f, setF] = useState({ name: '', phone: '', date: '', days: 1, height: '', weight: '', shoeSize: '' });
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [prepList, setPrepList] = useState([]); // 器材準備區 (取代購物車)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});

  const recSize = useMemo(() => calculateRecommendedSize(f.height, f.weight), [f.height, f.weight]);
  const recBoot = useMemo(() => calculateBootSize(f.shoeSize), [f.shoeSize]);
  const recFin = useMemo(() => calculateFinSize(f.shoeSize), [f.shoeSize]);

  const calculateEqPrice = () => {
    let heavyCount = prepList.filter(r => r.category === '重裝備').length;
    let lightCount = prepList.filter(r => r.category === '輕裝備').length;
    let rawTotal = prepList.reduce((sum, r) => sum + r.price, 0);

    const packs = sysConfig.equipmentPackages || {};

    if (heavyCount >= 2 && lightCount >= 3 && packs.full) rawTotal = packs.full;
    else if (heavyCount >= 2 && packs.heavy) rawTotal = packs.heavy + prepList.filter(r => r.category !== '重裝備').reduce((sum, r) => sum + r.price, 0);
    else if (lightCount >= 3 && packs.light) rawTotal = packs.light + prepList.filter(r => r.category !== '輕裝備').reduce((sum, r) => sum + r.price, 0);

    if (isReturningCustomer) {
      const discountRate = packs.returnCustomerDiscount > 0 ? packs.returnCustomerDiscount : 100;
      rawTotal = Math.round(rawTotal * (discountRate / 100));
    }

    return rawTotal * (f.days || 1);
  };

  const handleAddToPrep = (eq) => {
    let sizeToAdd = 'F';
    const isApparel = eq.name.toUpperCase().includes('BCD') || eq.name.includes('防寒衣') || eq.name.toUpperCase().includes('WETSUIT');
    const isBoot = eq.name.includes('套鞋') || eq.name.toUpperCase().includes('BOOTS');
    const isFin = eq.name.includes('蛙鞋') || eq.name.toUpperCase().includes('FINS');

    if (eq.hasSpecs && eq.specDetails?.length > 0) {
        sizeToAdd = selectedSizes[eq.id];
        if (!sizeToAdd) {
            // 若尚未手動選擇，嘗試自動帶入 AI 推薦尺寸或第一個有庫存的尺寸
            if (isBoot && recBoot) {
                const hasRecStock = eq.specDetails.some(s => s.name === String(recBoot) && s.ready > 0);
                sizeToAdd = hasRecStock ? String(recBoot) : (eq.specDetails.filter(s=>s.ready>0)[0]?.name || 'F');
            } else if (isFin && recFin) {
                const hasRecStock = eq.specDetails.some(s => s.name === recFin && s.ready > 0);
                sizeToAdd = hasRecStock ? recFin : (eq.specDetails.filter(s=>s.ready>0)[0]?.name || 'F');
            } else {
                const hasRecStock = eq.specDetails.some(s => s.name === recSize && s.ready > 0);
                sizeToAdd = (isApparel && hasRecStock) ? recSize : (eq.specDetails.filter(s=>s.ready>0)[0]?.name || 'F');
            }
        }
    }
    
    setPrepList([...prepList, { 
      id: Date.now() + Math.random(), 
      eqId: eq.id, 
      name: eq.name, 
      size: sizeToAdd, 
      category: eq.category, 
      price: eq.price || 0 
    }]);
  };

  const handleRemoveFromPrep = (id) => {
    setPrepList(prepList.filter(item => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prepList.length === 0) {
      alert('請先將需要的裝備加入預留清單 / Please add gear to prep list first');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onBook({
        type: 'equipment',
        itemName: '單品裝備租借',
        price: calculateEqPrice(),
        name: f.name,
        phone: f.phone,
        isReturningCustomer,
        details: {
          date: f.date,
          days: parseInt(f.days) || 1,
          height: f.height,
          weight: f.weight
        },
        rentals: prepList
      });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative animate-in fade-in duration-500 min-h-[calc(100vh-80px)] pb-24 lg:pb-12">
      <div className="relative z-10 max-w-7xl mx-auto space-y-6 pt-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 border-b border-cyan-200/50 pb-5 mb-8 px-2">
           <button onClick={onBack} className="p-2.5 bg-white/60 backdrop-blur-sm text-cyan-700 rounded-full hover:bg-white hover:shadow-md hover:text-cyan-600 transition-all border border-slate-200"><ChevronLeft className="w-6 h-6"/></button>
           <div>
             <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700 drop-shadow-sm">專業裝備預留 / Equipment Prep</h2>
             <div className="text-xs md:text-sm font-bold text-cyan-800/60 mt-1.5 flex items-center gap-2">線上選取裝備並預約，到店即可快速取件下水</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左側：AI分析與型錄區 */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
             <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white shadow-[0_15px_40px_rgba(6,182,212,0.1)] relative overflow-hidden">
               <h3 className="font-black text-xl text-slate-800 border-b border-cyan-100/50 pb-3 mb-5 flex items-center gap-3">
                  <div className="bg-cyan-100 p-2 rounded-xl text-cyan-600"><Scale className="w-5 h-5"/></div>
                  1. 填寫體型資訊 
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6 relative z-10">
                 <FormInput label="身高 (cm)" type="number" value={f.height} onChange={v=>setF({...f, height: v})} placeholder="例: 170" />
                 <FormInput label="體重 (kg)" type="number" value={f.weight} onChange={v=>setF({...f, weight: v})} placeholder="例: 65" />
                 <FormInput label="鞋碼 (cm)" type="number" value={f.shoeSize} onChange={v=>setF({...f, shoeSize: v})} placeholder="例: 26" />
               </div>
               {f.height && f.weight && (
                 <div className="relative z-10 animate-in slide-in-from-bottom-2">
                   <AISizeAdvisor height={f.height} weight={f.weight} shoeSize={f.shoeSize} showWeight={false} />
                 </div>
               )}
             </div>

             <div className="space-y-6">
               <h3 className="font-black text-2xl text-slate-800 flex items-center gap-3">
                  <DivingTankIcon className="w-7 h-7 text-cyan-500 drop-shadow-sm"/> 2. 挑選器材準備下潛
               </h3>
               {['重裝備', '輕裝備', '其他配件'].map(cat => {
                  const catItems = equipments.filter(eq => eq.category === cat);
                  if (catItems.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-4">
                      <h4 className="text-sm font-black text-cyan-700 border-l-4 border-cyan-400 pl-3">{cat}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {catItems.map(eq => {
                          const availableSpecs = eq.hasSpecs ? eq.specDetails?.filter(s => s.ready > 0) : [];
                          const isOutOfStock = eq.hasSpecs ? availableSpecs.length === 0 : eq.readyQuantity <= 0;

                          return (
                          <div key={eq.id} className="p-5 rounded-[1.5rem] border border-white/60 hover:border-cyan-300 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col gap-4 bg-white/90 backdrop-blur-sm group">
                             <div className="flex justify-between items-start">
                               <span className="font-black text-slate-800 text-lg leading-snug pr-2 group-hover:text-cyan-700 transition-colors">{String(eq.name)}</span>
                               <span className="text-[11px] font-black text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-2.5 py-1 rounded-lg shrink-0 shadow-sm">NT$ {eq.price}/晚</span>
                             </div>
                             <div className="mt-auto">
                               {eq.hasSpecs ? (
                                  <div className="relative">
                                    <select 
                                      value={selectedSizes[eq.id] || (availableSpecs[0]?.name || '')} 
                                      onChange={e => setSelectedSizes({...selectedSizes, [eq.id]: e.target.value})} 
                                      disabled={isOutOfStock}
                                      className="w-full p-3 pl-4 pr-10 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 bg-slate-50/80 shadow-inner text-slate-800 disabled:opacity-50 disabled:bg-slate-100 appearance-none cursor-pointer transition-all"
                                    >
                                       {availableSpecs.map(spec => (
                                            <option key={spec.id} value={spec.name}>{spec.name} (庫存: {spec.ready})</option>
                                       ))}
                                       {isOutOfStock && <option value="">尺寸皆已租借一空</option>}
                                    </select>
                                    {!isOutOfStock && <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600 pointer-events-none" />}
                                  </div>
                               ) : (
                                  <div className="text-sm text-slate-500 font-bold p-3 bg-slate-50/80 rounded-xl text-center border border-slate-200 shadow-inner">
                                     單一規格 (F) {isOutOfStock ? <span className="text-red-500 ml-1">- 已租借一空</span> : <span className="text-cyan-600 ml-1"> (庫存: {eq.readyQuantity})</span>}
                                  </div>
                               )}
                             </div>
                             <button 
                               type="button" disabled={isOutOfStock} onClick={() => handleAddToPrep(eq)} 
                               className="w-full py-3.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-md hover:shadow-[0_5px_15px_rgba(6,182,212,0.4)]"
                             >
                                <Plus className="w-4 h-4"/> 預留此器材
                             </button>
                          </div>
                        )})}
                      </div>
                    </div>
                  );
               })}
             </div>
          </div>

          {/* 右側：準備清單與結帳表單 */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
             <form id="checkout-form" onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(8,145,178,0.1)] lg:sticky lg:top-24 scroll-mt-24">
               <h3 className="font-black text-xl text-slate-800 border-b border-cyan-100/50 pb-4 mb-6 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><DivingTankIcon className="w-5 h-5"/></div> 
                  3. 器材準備區與結帳
               </h3>
               
               <div className="mb-6">
                 <div className="text-[11px] font-black text-cyan-600 uppercase tracking-widest mb-3 flex items-center justify-between">
                   <span>預留清單 (Prep List)</span>
                   <span className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-md">{prepList.length} 件</span>
                 </div>
                 
                 {prepList.length === 0 ? (
                   <div className="text-center py-10 bg-white/50 rounded-2xl border border-dashed border-cyan-200">
                     <DivingTankIcon className="w-10 h-10 text-cyan-200 mx-auto mb-3" />
                     <div className="text-sm font-bold text-cyan-700/50">準備區尚無裝備</div>
                   </div>
                 ) : (
                   <div className="space-y-3 max-h-[35vh] overflow-y-auto custom-scrollbar pr-2">
                     {prepList.map((item) => (
                       <div key={item.id} className="flex items-center justify-between bg-white/60 p-3.5 rounded-[1.25rem] border border-slate-100 shadow-sm group hover:border-cyan-300 hover:shadow-md hover:bg-white transition-all">
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="font-bold text-slate-800 text-sm truncate">{item.name}</div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 border border-slate-200/50">規格: {item.size}</span>
                              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">NT$ {item.price}</span>
                            </div>
                          </div>
                          <button type="button" onClick={() => handleRemoveFromPrep(item.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               <div className="space-y-5 border-t border-cyan-100/50 pt-6">
                 <div className="text-[11px] font-black text-cyan-600 uppercase tracking-widest mb-1">租借人與取件資訊</div>
                 <div className="grid grid-cols-2 gap-4">
                   <FormInput label="取件日 / Date *" required type="date" value={f.date} onChange={v=>setF({...f, date: v})} />
                   <FormInput label="天數 / Days *" required type="number" value={f.days} onChange={v=>setF({...f, days: v === '' ? '' : Math.max(1, parseInt(v))})} />
                 </div>
                 <FormInput label="真實姓名 / Full Name *" required value={f.name} onChange={v=>setF({...f, name: v})} placeholder="請填寫姓名" />
                 <FormInput label="手機號碼 / Mobile Phone *" required type="tel" value={f.phone} onChange={v=>setF({...f, phone: formatPhoneNumber(v)})} placeholder="09xx-xxx-xxx" />
                 
                 <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-xl cursor-pointer shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 mt-2 group">
                     <input type="checkbox" checked={isReturningCustomer} onChange={e => setIsReturningCustomer(e.target.checked)} className="w-5 h-5 text-orange-500 rounded border-orange-300 shrink-0" />
                     <div>
                       <span className="font-black text-orange-800 text-sm block group-hover:text-orange-900 transition-colors">我是回客 / Returning Customer</span>
                       <span className="text-[10px] font-bold text-orange-600/80 mt-0.5 block">勾選享專屬裝備折扣！</span>
                     </div>
                 </label>
               </div>

               <div className="pt-6 mt-6 border-t-2 border-cyan-100/50">
                  <div className="flex justify-between items-end mb-5">
                    <span className="text-sm font-bold text-slate-500">預估總額 / Total</span>
                    <div className="text-right">
                      <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">NT$ {calculateEqPrice()}</span>
                      {(f.days > 1) && <div className="text-[10px] text-cyan-600 font-bold mt-1 bg-cyan-50 inline-block px-2 py-0.5 rounded-full">已乘上天數 / Multiplied by {f.days} days</div>}
                    </div>
                  </div>
                  <button 
                    type="submit" form="checkout-form" disabled={isSubmitting || prepList.length === 0} 
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-black shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_15px_30px_rgba(6,182,212,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                     {isSubmitting ? '處理中... Processing' : prepList.length === 0 ? '準備區尚無裝備' : <><CheckCircle className="w-5 h-5"/>確認送出預約 / Submit</>}
                  </button>
               </div>
             </form>
          </div>
        </div>
      </div>
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
    title: "鯊墾丁 SHARKENTING", subtitle: "整合課程、住宿與裝備租借，提供您最專業、便利的潛水體驗。", phoneDiving: "0980-175-777", serviceHoursDiving: "08:00-20:00", phoneAcc: "0987-367-550", line: "@tbj1448p", address: "946屏東縣恆春鎮恆西路33巷123弄5號", transport: "🚄 高鐵左營站搭乘台灣好行至恆春轉運站\n🚗 自行開車前往", peakSeasonStart: '05', peakSeasonEnd: '10', equipmentPackages: { studentDiscount: 80, returnCustomerDiscount: 80 }, coaches: [{id: 1, name: '阿龍教練'}], checkInAcc: '15:00', checkOutAcc: '11:00', adminCode: '0000', accDiscountType: 'fixed', accDiscountValue: 200, defaultServices: DEFAULT_SERVICES, airTankPrice: 800, nitroxTankPrice: 1200
  });

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const hasSeeded = useRef(false);

  const [showAccPromptModal, setShowAccPromptModal] = useState(false);
  const [pendingAccAction, setPendingAccAction] = useState(null); // 用於儲存帶有折扣 Context 的跳轉狀態
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const initAuth = async (retryCount = 0) => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { 
        console.error(`Auth error (attempt ${retryCount + 1}):`, err); 
        if (retryCount < 5) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => initAuth(retryCount + 1), delay);
        } else {
          setIsLoading(false);
        }
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setIsLoading(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubB = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'bookings'), (s) => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => console.error(e));
    const unsubA = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'activities'), (s) => setActivities(s.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => console.error(e));
    const unsubC = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courseTemplates'), (s) => setCourseTemplates(s.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => console.error(e));
    const unsubAc = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'accommodations'), (s) => setAccommodations(s.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => console.error(e));
    const unsubE = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'equipments'), (s) => setEquipmentsList(s.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => console.error(e));
    const unsubS = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'systemConfig'), (d) => {
       if (d.exists()) {
           const data = d.data();
           if (!data.medicalForm || data.medicalForm.length === 0) data.medicalForm = DEFAULT_MEDICAL_FORM;
           // 自動將舊資料轉換為帶有換行的條列式
           if (data.transport === "高鐵左營站搭乘台灣好行至恆春轉運站、自行開車前往") {
               data.transport = "🚄 高鐵左營站搭乘台灣好行至恆春轉運站\n🚗 自行開車前往";
           }
           if (!data.defaultServices || data.defaultServices.length === 0) data.defaultServices = DEFAULT_SERVICES;
           setSysConfig(prev => ({ ...prev, ...data }));
       }
    });
    return () => { unsubB(); unsubA(); unsubC(); unsubAc(); unsubE(); unsubS(); };
  }, [user]);

  // 自動清理因 React StrictMode 導致的重複初始資料
  useEffect(() => {
    const cleanDuplicates = (list, collectionName, keyFn) => {
      const seen = new Set();
      const duplicates = [];
      list.forEach(item => {
        const key = keyFn(item);
        if (seen.has(key)) duplicates.push(item.id);
        else seen.add(key);
      });
      duplicates.forEach(id => {
        deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id)).catch(() => {});
      });
    };

    if (equipmentsList.length > 0) cleanDuplicates(equipmentsList, 'equipments', eq => `${eq.name}-${eq.category}`);
    if (accommodations.length > 0) cleanDuplicates(accommodations, 'accommodations', acc => acc.name);
    if (courseTemplates.length > 0) cleanDuplicates(courseTemplates, 'courseTemplates', c => c.courseName);
  }, [equipmentsList, accommodations, courseTemplates]);

  useEffect(() => {
    const seed = async () => {
      if (!user || hasSeeded.current || sysConfig.isSeeded) return;
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
        // 【新增】救援潛水員 預設公版資料
        await addDoc(cRef, { 
            courseName: '救援潛水員 (Rescue Diver)', price: 12000, days: 3, materialSystem: 'PADI', certFee: 0, 
            compulsories: ['救援技巧練習', '無意識潛水員救援', '失蹤潛水員搜尋'], electives: [], courseNotes: '需具備 AOWD 與 EFR (第一時間急救) 證照。',
            schedule: [
               { day: 1, slots: [{ period: '09:00-12:00', content: '學科知識發展與影片教學' }, { period: '13:30-17:00', content: 'EFR 複習與緊急氧氣供應訓練' }] },
               { day: 2, slots: [{ period: '09:00-12:00', content: '救援技巧示範與練習' }, { period: '13:30-17:00', content: '疲憊、恐慌潛水員救援演練' }] },
               { day: 3, slots: [{ period: '09:00-12:00', content: '綜合救援情境演練' }, { period: '13:30-17:00', content: '水面與水下無意識潛水員救援' }] }
            ]
        });

        const rRef = collection(db, 'artifacts', appId, 'public', 'data', 'accommodations');
        await addDoc(rRef, { name: '背包客房', quantity: 1, bedCount: 12, priceLowWeekday: 800, priceLowWeekend: 1000, pricePeakWeekday: 1200, pricePeakWeekend: 1500, priceHoliday: 1800, priceExtraBed: 600 });
        
        const eqRef = collection(db, 'artifacts', appId, 'public', 'data', 'equipments');
        
        // 完整潛水裝備初始化
        await addDoc(eqRef, { name: 'BCD', category: '重裝備', hasSpecs: true, specDetails: [{id: 1, name: 'XS', ready: 3}, {id: 2, name: 'S', ready: 5}, {id: 3, name: 'M', ready: 10}, {id: 4, name: 'L', ready: 8}, {id: 5, name: 'XL', ready: 3}], readyQuantity: 29, price: 350 });
        await addDoc(eqRef, { name: '調節器 (含備用二級頭及儀錶)', category: '重裝備', hasSpecs: true, specDetails: [{id:1, name:'標準 (YOKE)', ready:15}, {id:2, name:'DIN', ready:5}], readyQuantity: 20, price: 350 });
        await addDoc(eqRef, { name: '防寒衣 (Wetsuit)', category: '輕裝備', hasSpecs: true, specDetails: [{id: 1, name: 'XS', ready: 3}, {id: 2, name: 'S', ready: 5}, {id: 3, name: 'M', ready: 10}, {id: 4, name: 'L', ready: 8}, {id: 5, name: 'XL', ready: 3}], readyQuantity: 29, price: 150 });
        await addDoc(eqRef, { name: '面鏡 (Mask)', category: '輕裝備', hasSpecs: true, specDetails: [{id:1, name:'無度數', ready:20}, {id:2, name:'近視 -150', ready:2}, {id:3, name:'近視 -200', ready:2}, {id:4, name:'近視 -250', ready:2}, {id:5, name:'近視 -300', ready:2}, {id:6, name:'近視 -400', ready:2}, {id:7, name:'近視 -500', ready:2}], readyQuantity: 32, price: 100 });
        await addDoc(eqRef, { name: '蛙鞋 (Fins)', category: '輕裝備', hasSpecs: true, specDetails: [{id: 1, name: 'S', ready: 5}, {id: 2, name: 'M', ready: 10}, {id: 3, name: 'L', ready: 5}], readyQuantity: 20, price: 100 });
        await addDoc(eqRef, { name: '套鞋 (Boots)', category: '輕裝備', hasSpecs: true, specDetails: [{id:1, name:'22', ready:3}, {id:2, name:'23', ready:5}, {id:3, name:'24', ready:8}, {id:4, name:'25', ready:8}, {id:5, name:'26', ready:8}, {id:6, name:'27', ready:5}, {id:7, name:'28', ready:3}], readyQuantity: 40, price: 50 });
        await addDoc(eqRef, { name: '潛水電腦錶', category: '其他配件', hasSpecs: false, readyQuantity: 10, price: 300 });
        await addDoc(eqRef, { name: '潛水手電筒', category: '其他配件', hasSpecs: false, readyQuantity: 10, price: 150 });
        await addDoc(eqRef, { name: '頭套 (Hood)', category: '其他配件', hasSpecs: true, specDetails: [{id: 1, name: 'S', ready: 5}, {id: 2, name: 'M', ready: 5}, {id: 3, name: 'L', ready: 5}], readyQuantity: 15, price: 50 });
        await addDoc(eqRef, { name: 'SMB 與 線輪', category: '其他配件', hasSpecs: false, readyQuantity: 15, price: 100 });
        
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
    else setIsAdminMode(false); 
  };

  const verifyAdmin = (code, callback) => {
    if (code === (sysConfig.adminCode || '0000')) {
      setIsAdminMode(true);
      setShowLoginModal(false);
      setCurrentView('dashboard');
      callback(true);
    } else {
      callback(false);
    }
  };

  const submitRegistration = async (data) => {
    if (!user) throw new Error("尚未登入系統");
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'bookings'), { userId: user.uid, ...data, status: 'pending', timestamp: serverTimestamp() });
  };

  const saveSysConfig = async (cfg) => { 
    try { 
      // 自動清理物件中可能造成 Firebase 報錯的 undefined 值
      const cleanCfg = JSON.parse(JSON.stringify(cfg));
      // 加上 merge: true，確保只更新有異動的欄位，不破壞既有資料
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'systemConfig'), cleanCfg, { merge: true }); 
      alert("已儲存設定"); 
    } catch (e) { 
      console.error("儲存設定失敗:", e);
      alert("儲存失敗"); 
    } 
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
          <button onClick={handleAdminToggle} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${isAdminMode ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <Settings className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">營運管理中心</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAdminMode ? (
          <>
            {currentView === 'home' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-800 text-white p-10 md:p-20 shadow-[0_20px_50px_rgba(8,145,178,0.25)] relative group">
                  {/* 陽光灑落海面漸層光暈 */}
                  <div className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-200/50 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
                  <div className="absolute top-0 left-[20%] w-[150%] h-full bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_50%)] pointer-events-none transform -translate-x-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-indigo-900/30 rounded-full blur-[100px] pointer-events-none"></div>

                  {/* 漂動的波浪圖示與氣泡 */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                     {/* 透過不同的時長與延遲，營造自然的漂浮感 */}
                     <Waves className="absolute top-12 right-[15%] w-24 h-24 text-white/20 animate-[bounce_6s_infinite_ease-in-out]" />
                     <Waves className="absolute bottom-16 right-[30%] w-16 h-16 text-white/10 animate-[bounce_5s_infinite_1s_ease-in-out]" />
                     <Waves className="absolute top-1/3 left-2/3 w-32 h-32 text-cyan-200/10 animate-[pulse_7s_infinite]" />
                     <Waves className="absolute bottom-[-20px] left-[10%] w-40 h-40 text-blue-300/10 animate-[bounce_8s_infinite_2s_ease-in-out]" />
                     
                     {/* 點綴氣泡 */}
                     <div className="absolute bottom-[20%] left-[20%] w-4 h-4 bg-white/30 rounded-full animate-[ping_4s_infinite]"></div>
                     <div className="absolute top-[30%] right-[40%] w-6 h-6 bg-white/20 rounded-full animate-[bounce_4s_infinite]"></div>
                     <div className="absolute bottom-[40%] left-[40%] w-3 h-3 bg-white/20 rounded-full animate-[ping_5s_infinite_2s]"></div>
                  </div>

                  <div className="max-w-2xl relative z-10 backdrop-blur-[2px]">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-50">
                      {String(sysConfig.title || '')}
                    </h1>
                    <p className="text-lg md:text-xl text-blue-50/90 mb-10 leading-relaxed drop-shadow-md font-medium">
                      {String(sysConfig.subtitle || '')}
                    </p>
                    <button onClick={() => setCurrentView('activities')} className="bg-white text-blue-800 px-10 py-4 rounded-2xl font-black shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3">
                      活動及課程報名 <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                  <QuickCard icon={<Home />} colorTheme="teal" title="住宿預訂" desc="預約舒適房間，享活動專屬配套折抵優惠" onClick={() => handleNavClick('accommodations')} bgIcon={<SeaweedBg />} />
                  <QuickCard icon={<LifeBuoy />} colorTheme="cyan" title="專業裝備租借" desc="依據 AI 身型預測，為您準備最合適的潛水裝備" onClick={() => setCurrentView('equipments')} bgIcon={<SingleTankBg />} />
                  <QuickCard icon={<Search />} colorTheme="indigo" title="我的預約查詢" desc="追蹤報名審核進度，即時掌握所有訂單狀態" onClick={() => setCurrentView('dashboard')} bgIcon={<AnchorBg />} />
                </div>
                
                <div className="mt-24 mb-12 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-14 relative z-0 overflow-hidden">
                   {/* 注入專屬繪製的鯨鯊背景動畫 */}
                   <ContactWhaleSharkBg />
                   
                   <div className="text-center max-w-2xl mx-auto mb-12 relative z-10">
                      <h3 className="text-3xl md:text-5xl font-black text-slate-800 flex items-center justify-center gap-4 tracking-tight drop-shadow-sm">
                         聯絡與門市資訊
                      </h3>
                      <p className="text-slate-600 font-bold mt-5 leading-relaxed text-sm md:text-base">
                         無論是課程諮詢、裝備預留，還是想了解最新的潛水行程，<br className="hidden sm:block"/>歡迎透過以下方式與我們聯繫！
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-stretch relative z-10">
                      <div className="xl:col-span-5 flex flex-col gap-5">
                         <ContactItem 
                           highlight="line"
                           label="官方 LINE 客服 (快速預約/諮詢)" 
                           value={sysConfig.line} 
                           icon={<MessageCircle className="w-7 h-7"/>} 
                           href={sysConfig.line ? (String(sysConfig.line).startsWith('@') ? `https://line.me/R/ti/p/${sysConfig.line}` : `https://line.me/ti/p/~${sysConfig.line}`) : '#'} 
                           animal="octopus"
                         />
                         <ContactItem 
                           label="實體門市位置" 
                           value={sysConfig.address} 
                           subValue={sysConfig.transport} 
                           icon={<MapPin className="w-6 h-6"/>} 
                           animal="lobster"
                         />
                         <ContactItem 
                           highlight="blue"
                           label="潛水服務專線" 
                           value={sysConfig.phoneDiving} 
                           subValue={`服務時間: ${sysConfig.serviceHoursDiving || '08:00 - 18:00'}`} 
                           href={`tel:${sysConfig.phoneDiving}`} 
                           icon={<Waves className="w-6 h-6"/>} 
                           animal="manta"
                         />
                         <ContactItem 
                           label="住宿管家專線" 
                           value={sysConfig.phoneAcc} 
                           subValue={`進房: ${sysConfig.checkInAcc || '15:00'}\n退房: ${sysConfig.checkOutAcc || '11:00'}`} 
                           href={`tel:${sysConfig.phoneAcc}`} 
                           icon={<Home className="w-6 h-6"/>} 
                           animal="shark"
                         />
                      </div>
                      
                      <div className="xl:col-span-7 relative min-h-[400px] lg:min-h-[500px] h-full bg-slate-50 p-3 md:p-4 rounded-3xl border border-slate-200">
                         <iframe 
                           title="門市位置地圖" 
                           className="w-full h-full rounded-2xl bg-slate-100" 
                           style={{ border: 0, minHeight: '400px' }} 
                           loading="lazy" 
                           src={`https://maps.google.com/maps?q=${encodeURIComponent(sysConfig.address || '屏東縣恆春鎮')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}>
                         </iframe>
                      </div>
                   </div>
                </div>
              </div>
            )}
            {currentView === 'activities' && <ServiceSection title="潛水課程與活動" items={activities} type="activity" onBook={(item) => { setSelectedActivity(item); setIsRegModalOpen(true); }} sysConfig={sysConfig} />}
            {currentView === 'accommodations' && <ServiceSection title="住宿房型預訂" items={accommodations} type="accommodation" onBook={(item) => { setSelectedAcc(item); setIsAccModalOpen(true); }} pendingAction={pendingAccAction} sysConfig={sysConfig} />}
            {currentView === 'equipments' && <EquipmentRentalPage equipments={equipmentsList} sysConfig={sysConfig} onBook={async (data) => {
                try {
                   await submitRegistration(data);
                   setCurrentView('dashboard');
                   window.scrollTo(0,0);
                } catch(e) { alert("送出失敗"); }
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
                {adminSection === 'activities' && <ActivityAdminPanel db={db} appId={appId} activities={activities} courseTemplates={courseTemplates} sysConfig={sysConfig} saveSysConfig={saveSysConfig} subTab={adminSubTab} setSubTab={setAdminSubTab} />}
                {adminSection === 'accommodations' && <AccommodationAdminPanel db={db} appId={appId} accommodations={accommodations} sysConfig={sysConfig} saveSysConfig={saveSysConfig} subTab={adminSubTab} setSubTab={setAdminSubTab} />}
                {adminSection === 'equipments' && <EquipmentAdminPanel db={db} appId={appId} equipments={equipmentsList} sysConfig={sysConfig} saveSysConfig={saveSysConfig} subTab={adminSubTab} setSubTab={setAdminSubTab} />}
                {adminSection === 'system' && <SystemAdminPanel config={sysConfig} onSave={saveSysConfig} />}
            </div>
          </div>
        )}
      </main>

      {/* --- 全域視窗 Modals --- */}
      {showLoginModal && <AdminLoginModal onVerify={verifyAdmin} onClose={() => setShowLoginModal(false)} />}
      
      {isRegModalOpen && selectedActivity && (
         <RegistrationForm 
            activity={selectedActivity} 
            equipments={equipmentsList} 
            onClose={() => setIsRegModalOpen(false)} 
            onSubmit={submitRegistration} 
            sysConfig={sysConfig} 
            onSuccess={(result) => {
               setIsRegModalOpen(false);
               if (result?.gotoAcc) {
                 setPendingAccAction(result.accContext); // 儲存折扣與預填資料上下文
                 setCurrentView('accommodations');
               } else {
                 setCurrentView('dashboard');
               }
               window.scrollTo(0,0);
            }}
         />
      )}

      {isAccModalOpen && selectedAcc && (
         <AccommodationBookingForm 
            room={selectedAcc} 
            onClose={() => setIsAccModalOpen(false)} 
            context={pendingAccAction}
            onSubmit={async (data) => {
               try {
                  await submitRegistration(data);
                  setIsAccModalOpen(false);
                  setPendingAccAction(null); // 清除 Context
                  setCurrentView('dashboard');
                  window.scrollTo(0,0);
               } catch(e) { alert("送出失敗"); }
            }} 
            sysConfig={sysConfig} 
         />
      )}

      {showAccPromptModal && <AccPromptModal sysConfig={sysConfig} onClose={() => setShowAccPromptModal(false)} onGoActivities={()=>{setShowAccPromptModal(false); setCurrentView('activities'); window.scrollTo(0,0);}} onGoAccommodations={()=>{setShowAccPromptModal(false); setCurrentView('accommodations'); window.scrollTo(0,0);}} />}
    </div>
  );
}

export default App;