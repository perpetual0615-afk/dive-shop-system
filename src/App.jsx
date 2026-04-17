import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Waves, Home, LifeBuoy, CalendarDays, User, Settings, ClipboardList, CheckCircle, Clock, X, Menu, ChevronRight, ChevronLeft, ChevronDown, Plus, Trash2, Edit3, Save, AlertTriangle, PenTool, Phone, MessageCircle, MapPin, Scale, Info, Check, ArrowRight, ShoppingCart, Search, BookOpen, Fish, Lock, KeyRound, Download } from 'lucide-react';
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
      {/* 沉浸式光暈 */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform duration-700 group-hover:scale-150 ${theme.glow}`}></div>
      
      {/* 水下波紋/海洋生物 浮水印裝飾 */}
      <div className={`absolute -bottom-6 -right-6 opacity-[0.04] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-700 pointer-events-none [&>svg]:w-32 [&>svg]:h-32 rotate-12 ${theme.watermark}`}>
         {bgIcon || icon}
      </div>
      
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

function ContactItem({ label, value, subValue, icon, href, highlight = false }) {
  const isLine = highlight === 'line';
  const isBlue = highlight === true || highlight === 'blue';

  // 清新明亮海洋風格 (Clear Ocean Theme) 的卡片配置
  const bgClasses = isLine
    ? 'bg-gradient-to-br from-[#F4FFF4] to-[#E6FFE6] border border-[#00C300]/30 hover:border-[#00C300]/60 hover:shadow-[0_10px_30px_rgba(0,195,0,0.15)]'
    : isBlue
    ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 hover:border-cyan-400 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
    : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/50';

  return (
    <div className={`flex items-start gap-4 p-5 sm:p-6 rounded-[2rem] transition-all duration-500 group relative overflow-hidden hover:-translate-y-1.5 ${bgClasses}`}>
      {/* 微光暈 */}
      {(isLine || isBlue) && <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 ${isLine ? 'bg-[#00C300]/10' : 'bg-cyan-400/10'}`}></div>}
      
      {/* 背景裝飾浮水印 */}
      <div className={`absolute -bottom-4 -right-4 opacity-[0.04] group-hover:scale-125 transition-transform duration-700 pointer-events-none [&>svg]:w-32 [&>svg]:h-32 rotate-12 ${isLine ? 'text-[#00C300]' : isBlue ? 'text-blue-500' : 'text-slate-400'}`}>
        {icon}
      </div>
      
      <div className={`shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm relative z-10 ${isLine ? 'bg-white text-[#00C300] border border-[#00C300]/20 group-hover:bg-[#00C300] group-hover:text-white' : isBlue ? 'bg-white text-cyan-600 border border-cyan-200 group-hover:bg-cyan-500 group-hover:text-white' : 'bg-slate-50 text-slate-500 border border-slate-100 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500'}`}>
        {icon}
      </div>
      
      <div className="flex-1 min-w-0 pt-0.5 z-10 relative">
        <h4 className={`text-[11px] sm:text-xs font-black mb-1.5 tracking-wider uppercase transition-colors ${isLine ? 'text-[#009E00]' : isBlue ? 'text-cyan-700' : 'text-slate-400 group-hover:text-blue-400'}`}>{String(label || '')}</h4>
        
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className={`text-lg sm:text-xl font-black block break-words transition-colors flex items-center flex-wrap gap-2.5 text-slate-900 group-hover:${isLine ? 'text-[#009E00]' : 'text-cyan-700'}`}>
            <span>{String(value || '')}</span>
            {isLine && <span className="text-[10px] bg-white text-[#00A000] border border-[#00A000]/30 px-2.5 py-1 rounded-full font-black shadow-sm shrink-0 leading-none flex items-center gap-1 group-hover:bg-[#00A000] group-hover:text-white transition-colors"><Plus className="w-3 h-3" /> 加入好友</span>}
          </a>
        ) : (
          <p className="text-lg sm:text-xl font-black break-words text-slate-900">{String(value || '')}</p>
        )}
        
        {subValue && (
          <div className="mt-3 flex flex-wrap gap-2 items-start">
            {String(subValue).split('\n').map((line, i) => (
              line.trim() ? (
                <div key={i} className={`text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg inline-flex text-left leading-relaxed shadow-sm bg-white/60 text-slate-600 border border-slate-200/60 group-hover:bg-white group-hover:border-slate-200 transition-colors`}>
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
               
               {/* 在所有預約表（潛水、住宿、裝備）中皆顯示刪除按鈕 */}
               <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="永久刪除此紀錄">
                  <Trash2 className="w-4 h-4" />
               </button>
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
                   <p className="font-bold text-slate-700 border-b pb-1 mb-2">個人潛水經驗</p>
                   {b.divingExperience ? (
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <p><span className="text-slate-400 w-24 inline-block">證照級別</span> {b.divingExperience.certSystem} / {b.divingExperience.certLevel}</p>
                        <p><span className="text-slate-400 w-24 inline-block">總潛水支數</span> {b.divingExperience.loggedDives ? `${b.divingExperience.loggedDives} 支` : '未填寫'}</p>
                        <p className="md:col-span-2"><span className="text-slate-400 w-24 inline-block">特殊專長</span> {b.divingExperience.specialties?.length > 0 ? b.divingExperience.specialties.join('、') : '無'}</p>
                        {b.divingExperience.personalNotes && <p className="md:col-span-2 mt-2 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm"><span className="font-bold text-slate-400 block mb-1">備註提醒：</span>{b.divingExperience.personalNotes}</p>}
                     </div>
                   ) : (
                     <p className="text-slate-400 text-sm font-bold">無紀錄資料</p>
                   )}
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
// 前台：顧客服務顯示卡片 (含名額計算與體驗潛水標籤)
// --------------------------------------------------------
function ServiceSection({ title, items, type, onBook, sysConfig, bookings = [] }) {
  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-2xl font-black mb-6 text-slate-800 border-b border-slate-200 pb-4">{title}</h2>
      {items.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border-2 border-dashed rounded-2xl font-bold bg-white">目前暫無可預約的項目</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            let totalSlots = 0;
            let bookedCount = 0;
            let remainingSlots = 0;
            let isFull = false;

            if (type === 'activity') {
              totalSlots = parseInt(item.capacity) || 0;
              bookedCount = bookings.filter(b => b.type === 'activity' && b.activityId === item.id && b.status !== 'cancelled').length;
              remainingSlots = Math.max(0, totalSlots - bookedCount);
              isFull = remainingSlots === 0;
            }

            return (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">
                {type === 'activity' && <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-xs font-black px-3 py-1.5 rounded-bl-xl shadow-sm">{item.isCourse ? '證照課程' : (item.diveCategory === '體驗潛水' ? '體驗潛水' : 'FUN DIVE')}</div>}
                
                <div className="flex-1 mt-2">
                  <h3 className="font-bold text-xl text-slate-900 mb-2 pr-16 group-hover:text-blue-700 transition-colors">{String(item.name || item.courseName || '未命名項目')}</h3>
                  
                  {type === 'activity' && (
                    <div className="space-y-1.5 mb-4 mt-3">
                      <p className="text-sm font-bold text-slate-600 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-blue-500" /> 日期：{String(item.date || '常態開放')}</p>
                      <p className="text-sm font-bold text-slate-600 flex items-center gap-2"><Waves className="w-4 h-4 text-teal-500" /> 類型：{item.isCourse ? (item.courseName || '潛水課程') : String(item.diveCategory || '岸潛')}</p>
                      <p className="text-sm font-bold text-slate-600 flex items-center gap-2"><User className="w-4 h-4 text-indigo-500" /> 教練：{String(item.coach || '依店內安排')}</p>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                         <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md">總額: {totalSlots} 人</span>
                         <span className={`text-[11px] font-black px-2 py-1 rounded-md ${remainingSlots > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                           剩餘: {remainingSlots} 人
                         </span>
                      </div>
                    </div>
                  )}

                  {type === 'accommodation' && (
                    <div className="flex flex-wrap gap-2 mb-2 mt-3">
                      <span className="text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg flex items-center gap-1.5"><Home className="w-4 h-4" /> 房間數: {Number(item.quantity || 1)} 間</span>
                      <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1.5"><User className="w-4 h-4" /> 每間容納: {Number(item.bedCount || 1)} 人/床</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                     {type === 'accommodation' && <span className="text-[10px] font-black text-slate-400 block mb-0.5 tracking-widest uppercase">淡季平日起 (Starting from)</span>}
                     <span className={`${type === 'accommodation' ? 'text-teal-600' : 'text-blue-600'} font-black text-lg md:text-xl`}>NT$ {Number(item.price || item.priceLowWeekday || 0)}</span>
                  </div>
                  <button 
                    onClick={() => onBook(item)} 
                    disabled={type === 'activity' ? isFull : false}
                    className={`px-5 py-2.5 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 ${(type === 'activity' && isFull) ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none' : type === 'accommodation' ? 'bg-teal-600 hover:bg-teal-700 hover:shadow-teal-500/30' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
                  >
                    {type === 'activity' ? (isFull ? '已額滿' : '立即報名') : <><CalendarDays className="w-4 h-4"/> 選擇日期</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------
// 報名表單實作
// --------------------------------------------------------
function RegistrationForm({ activity, onClose, onSubmit, sysConfig, onSuccess, equipments = [] }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isTrip = activity.diveCategory === '潛旅';
  const isDSD = activity.diveCategory === '體驗潛水';
  const isCourse = activity.isCourse;

  // 決定流程步驟
  const stepTitles = isCourse ? [
    { num: 1, title: '行前簡報', sub: '課程資訊總覽' },
    { num: 2, title: '水面整備', sub: '基本與保險資料' },
    { num: 3, title: '海底探索', sub: '裝備配置與加購' },
    { num: 4, title: '5米停留', sub: '住宿房型選擇' },
    { num: 5, title: '潛水日誌', sub: '個人潛水經驗' },
    { num: 6, title: '平安升水', sub: '醫療健康聲明' }
  ] : [
    { num: 1, title: '水面整備', sub: '基本與保險資料' },
    { num: 2, title: '5米停留', sub: '裝備需求配置' },
    { num: 3, title: '潛水日誌', sub: '個人潛水經驗' },
    { num: 4, title: '平安升水', sub: '醫療健康聲明' }
  ];
  const totalSteps = stepTitles.length;
  
  const isStepOverview = isCourse && step === 1;
  const isStepBasic = (isCourse && step === 2) || (!isCourse && step === 1);
  const isStepEq = (isCourse && step === 3) || (!isCourse && step === 2);
  const isStepAcc = isCourse && step === 4;
  const isStepExp = (isCourse && step === 5) || (!isCourse && step === 3);
  const isStepMedical = (isCourse && step === 6) || (!isCourse && step === 4);

  // Step 1 / 2: 基礎與保險
  const [f, setF] = useState({ name: '', nickname: '', phone: '', idNumber: '', birthday: '', height: '', weight: '', shoeSize: '' });
  const [weights, setWeights] = useState({ w1: 0, w2: 0, w25: 0, w3: 0 });
  const totalWeight = (weights.w1*1) + (weights.w2*2) + (weights.w25*2.5) + (weights.w3*3);

  // 潛水經驗
  const [exp, setExp] = useState({ certSystem: '無/不適用', certLevel: '無/不適用', loggedDives: '', specialties: [], personalNotes: '' });

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
    if (isCourse || isDSD) return 0; 
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
    
    if (!isMedicalComplete) {
      alert("請完成所有展開的醫療聲明選項 (包含各項子題目)"); return;
    }

    if(isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // 提取被選中的選修項目詳細資料
      const finalElectives = isCourse && activity.electives ? activity.electives.filter(e => selectedElectives.includes(e.id)) : [];

      // 整理出勾選為「是」的異常項目清單 (儲存為文字，避免未來改題目導致 ID 對不上)
      const medicalIssues = [];
      sysConfig.medicalForm.forEach(q => {
        if (medicalAnswers[q.id] === true) {
           medicalIssues.push(q.text);
           if (q.subItems && q.subItems.length > 0) {
              q.subItems.forEach(sub => {
                 if (medicalAnswers[sub.id] === true) {
                    medicalIssues.push("↳ " + sub.text);
                 }
              });
           }
        }
      });

      const submitData = {
        type: 'activity', 
        itemName: activity.name || activity.courseName, 
        price: calculateTotal(), 
        ...f,
        weights,
        rentals,
        selectedElectives: finalElectives,
        certFee: activity.certFee || 0,
        certSystem: activity.certSystem || '',
        useLocalShopEq,
        isReturningCustomer,
        accOption: isTrip ? 'trip' : accOption,
        divingExperience: exp,
        medicalAnswers,
        medicalIssues,
        hasMedicalIssue: medicalIssues.length > 0,
        activityId: activity.id
      };
      await onSubmit(submitData);
      
      let gotoAcc = false;
      let accContext = null;

      if (isCourse && accOption === 'upgrade') {
        gotoAcc = true;
        accContext = { type: 'course_upgrade', date: activity.date, days: activity.days || 3, baseDeduct: 800 }; 
      } else if (!isCourse && !isTrip && accOption !== 'self') {
        gotoAcc = true;
        accContext = { type: 'activity_discount', date: activity.date, discountType: sysConfig.accDiscountType, discountVal: sysConfig.accDiscountValue };
      }

      onSuccess({ gotoAcc, accContext });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/85 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 overflow-hidden">
        
        {/* Header & Progress */}
        <div className="bg-slate-900 text-white p-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Waves className="w-32 h-32" /></div>
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
                 {(isCourse || isDSD) && (
                    <div className="space-y-4 mb-8">
                       <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm">
                         <Info className="w-5 h-5 shrink-0" /> {isCourse ? '課程費用' : '體驗潛水費用'}已包含裝備租借，請安心選擇下方的裝備尺寸。
                       </div>

                       {isCourse && (activity.certFee > 0 || activity.electives?.length > 0 || activity.compulsories?.some(c => typeof c === 'object' && c.price > 0)) && (
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
                 {!isCourse && !isDSD && !useLocalShopEq && (
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
                                           {!isCourse && !isDSD && <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">NT$ {eq.price} / 晚</span>}
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
                 {!isCourse && !isDSD && !useLocalShopEq && (
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

            {/* STEP: Diving Experience */}
            {isStepExp && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                 <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                       <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><ClipboardList className="w-5 h-5"/></div>
                       <div>
                          <h4 className="font-black text-lg text-slate-800">潛水經驗調查</h4>
                          <p className="text-xs font-bold text-slate-500 mt-1">幫助教練更了解您的潛水狀況，以便安排合適的行程與配對。</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-700 ml-1">持有證照系統</label>
                         <select value={exp.certSystem} onChange={e => setExp({...exp, certSystem: e.target.value})} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                            <option value="無/不適用">無 / 不適用 (初學或體驗)</option>
                            <option value="PADI">PADI</option>
                            <option value="SSI">SSI</option>
                            <option value="AIDA">AIDA</option>
                            <option value="Molchanovs">Molchanovs</option>
                            <option value="SDI">SDI</option>
                            <option value="TDI">TDI</option>
                            <option value="CMAS">CMAS</option>
                            <option value="NAUI">NAUI</option>
                            <option value="其他">其他系統</option>
                         </select>
                       </div>
                       <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-700 ml-1">證照等級</label>
                         <select value={exp.certLevel} onChange={e => setExp({...exp, certLevel: e.target.value})} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                            <option value="無/不適用">無 / 不適用</option>
                            <option value="OWD (初階)">OWD (初階)</option>
                            <option value="AOWD (進階)">AOWD (進階)</option>
                            <option value="Rescue (救援)">Rescue (救援)</option>
                            <option value="Divemaster (潛水長)">Divemaster (潛水長)</option>
                            <option value="Instructor (教練)">Instructor (教練)</option>
                            <option value="其他">其他等級</option>
                         </select>
                       </div>
                    </div>
                    
                    <div className="w-full md:w-1/2 pr-2">
                       <FormInput label="大約總潛水支數 (Log)" type="number" value={exp.loggedDives} onChange={v => setExp({...exp, loggedDives: v})} placeholder="例：25" />
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                       <label className="text-sm font-bold text-slate-700 ml-1">擁有特殊潛水專長 (可複選)</label>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         {['高氧 Nitrox', '深潛 Deep', '船潛 Boat', '夜潛 Night', '頂尖中性浮力 PPB', '水下攝影', '乾衣 Dry Suit', '洞穴/沉船'].map(spec => (
                            <label key={spec} className="flex items-center gap-2 cursor-pointer p-1">
                              <input type="checkbox" checked={exp.specialties.includes(spec)} onChange={(e) => {
                                  if(e.target.checked) setExp({...exp, specialties: [...exp.specialties, spec]});
                                  else setExp({...exp, specialties: exp.specialties.filter(s => s !== spec)});
                              }} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                              <span className="text-sm font-bold text-slate-700">{spec}</span>
                            </label>
                         ))}
                       </div>
                    </div>

                    <div className="space-y-2 pt-2">
                       <label className="text-sm font-bold text-slate-700 ml-1">個人備註提醒事項 (選填)</label>
                       <textarea value={exp.personalNotes} onChange={e => setExp({...exp, personalNotes: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl h-28 text-sm font-medium outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors" placeholder="例如：容易暈船、特別怕冷、曾有一段時間未下水...等，讓教練能更了解您的狀況。" />
                    </div>
                 </div>
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
    title: "鯊墾丁 SHARKENTING", subtitle: "整合課程、住宿與裝備租借", line: "@tbj1448p", address: "屏東縣恆春鎮", adminCode: '0000', defaultServices: DEFAULT_SERVICES
  });

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const hasSeeded = useRef(false);

  const [showAccPromptModal, setShowAccPromptModal] = useState(false);
  const [pendingAccAction, setPendingAccAction] = useState(null); // 用於儲存帶有折扣 Context 的跳轉狀態
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth error:", err); }
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
                <div className="rounded-3xl overflow-hidden bg-gradient-to-b from-sky-400 to-blue-900 text-white p-10 md:p-20 relative shadow-xl border border-blue-800/30">
                  <div className="absolute top-0 right-0 p-10 opacity-20 text-sky-100"><Waves className="w-80 h-80" /></div>
                  <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight drop-shadow-md">{String(sysConfig.title || '')}</h1>
                    <p className="text-lg md:text-xl text-blue-50 mb-10 leading-relaxed drop-shadow-sm">{String(sysConfig.subtitle || '')}</p>
                    <button onClick={() => setCurrentView('activities')} className="bg-white text-blue-800 px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2">活動及課程報名 <ArrowRight className="w-5 h-5" /></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20 mt-2">
                  <QuickCard icon={<Home />} colorTheme="teal" title="住宿預訂" desc="預約舒適房間，享活動專屬配套折抵優惠" onClick={() => handleNavClick('accommodations')} bgIcon={<Home />} />
                  <QuickCard icon={<LifeBuoy />} colorTheme="cyan" title="專業裝備租借" desc="依據 AI 身型預測，為您準備最合適的潛水裝備" onClick={() => setCurrentView('equipments')} bgIcon={<Waves />} />
                  <QuickCard icon={<Search />} colorTheme="indigo" title="我的預約查詢" desc="追蹤報名審核進度，即時掌握所有訂單狀態" onClick={() => setCurrentView('dashboard')} bgIcon={<Fish />} />
                </div>
                
                <div className="relative mt-24 mb-12 rounded-[4rem] p-1 shadow-[0_20px_50px_rgba(8,145,178,0.08)] bg-gradient-to-b from-cyan-100 to-white z-0">
                   {/* 沉浸式清透海洋背景裝飾 (Clear Ocean Immersion) */}
                   <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-blue-50 rounded-[4rem] -z-10 overflow-hidden border border-white">
                       {/* 海底光影 (Sunrays) */}
                       <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-cyan-100/30 via-white/10 to-transparent blur-3xl transform skew-x-12 pointer-events-none"></div>
                       <div className="absolute top-0 right-1/4 w-1/3 h-full bg-gradient-to-b from-blue-100/30 via-white/10 to-transparent blur-3xl transform -skew-x-12 pointer-events-none"></div>
                       
                       {/* 潛水主題點綴元素 (清透魚群與波浪) */}
                       <div className="absolute top-10 left-10 text-cyan-500/10 transform -rotate-12 pointer-events-none animate-[pulse_6s_ease-in-out_infinite]"><Fish className="w-64 h-64" /></div>
                       <div className="absolute bottom-0 right-0 text-blue-500/10 pointer-events-none transform rotate-6 translate-x-1/4 translate-y-1/4"><Waves className="w-96 h-96" /></div>
                       
                       {/* 清透浮游氣泡 */}
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
                         <h3 className="text-3xl md:text-5xl font-black text-slate-800 flex items-center justify-center gap-4 tracking-tight drop-shadow-sm">
                            聯絡與門市資訊
                         </h3>
                         <p className="text-slate-600 font-bold mt-5 leading-relaxed text-sm md:text-base">
                            無論是課程諮詢、裝備預留，還是想了解最新的潛水行程，<br className="hidden sm:block"/>歡迎透過以下方式與我們聯繫！
                         </p>
                      </div>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                         {/* 左側資訊區 */}
                         <div className="xl:col-span-5 flex flex-col gap-5">
                            <ContactItem 
                              highlight="line"
                              label="官方 LINE 客服 (快速預約/諮詢)" 
                              value={sysConfig.line} 
                              icon={<MessageCircle className="w-7 h-7"/>} 
                              href={sysConfig.line ? (String(sysConfig.line).startsWith('@') ? `https://line.me/R/ti/p/${sysConfig.line}` : `https://line.me/ti/p/~${sysConfig.line}`) : '#'} 
                            />
                            <ContactItem 
                              label="實體門市位置" 
                              value={sysConfig.address} 
                              subValue={sysConfig.transport} 
                              icon={<MapPin className="w-6 h-6"/>} 
                            />
                            <ContactItem 
                              highlight="blue"
                              label="潛水服務專線" 
                              value={sysConfig.phoneDiving} 
                              subValue={`服務時間: ${sysConfig.serviceHoursDiving || '08:00 - 18:00'}`} 
                              href={`tel:${sysConfig.phoneDiving}`} 
                              icon={<Waves className="w-6 h-6"/>} 
                            />
                            <ContactItem 
                              label="住宿管家專線" 
                              value={sysConfig.phoneAcc} 
                              subValue={`進房: ${sysConfig.checkInAcc || '15:00'}\n退房: ${sysConfig.checkOutAcc || '11:00'}`} 
                              href={`tel:${sysConfig.phoneAcc}`} 
                              icon={<Home className="w-6 h-6"/>} 
                            />
                         </div>
                         
                         {/* 右側地圖區 (清透風格) */}
                         <div className="xl:col-span-7 relative min-h-[400px] lg:min-h-[500px] h-full bg-white/60 p-3 md:p-4 rounded-[3rem] shadow-[0_15px_40px_rgba(6,182,212,0.1)] border border-white group">
                            {/* 移除濾鏡，恢復 Google Map 原色 */}
                            <iframe 
                              title="門市位置地圖" 
                              className="w-full h-full rounded-[2.5rem] bg-slate-50 transition-all duration-700 opacity-90 group-hover:opacity-100 shadow-inner" 
                              style={{ border: 0, minHeight: '400px' }} 
                              loading="lazy" 
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(sysConfig.address || '屏東縣恆春鎮')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}>
                            </iframe>
                            
                            {/* 定位 UI 標示 */}
                            <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center gap-3 pointer-events-none group-hover:border-cyan-200 transition-colors duration-500 z-20">
                               <div className="relative flex items-center justify-center">
                                  <div className="absolute w-6 h-6 bg-cyan-400/30 rounded-full animate-ping"></div>
                                  <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)]"></div>
                               </div>
                               <span className="text-xs font-black text-slate-700 tracking-widest uppercase">實體門市位置</span>
                            </div>

                            {/* Google Maps 開啟按鈕 (懸浮) */}
                            <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                               <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sysConfig.address || '屏東縣恆春鎮')}`} target="_blank" rel="noreferrer" className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:bg-cyan-600 transition-all flex items-center gap-2 hover:scale-105 border border-white/10">
                                  <MapPin className="w-5 h-5"/> 在 Google Maps 中開啟
                               </a>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* 頁尾版權宣告 */}
                <footer className="text-center text-slate-400 text-[11px] font-bold mt-16 pb-4 tracking-wider uppercase">
                   {sysConfig.footerText || "© 2026 鯊墾丁 SHARKENTING . HUANG."}
                </footer>

              </div>
            )}
            {currentView === 'activities' && <ServiceSection title="潛水課程與活動" items={activities} type="activity" onBook={(item) => { setSelectedActivity(item); setIsRegModalOpen(true); }} sysConfig={sysConfig} bookings={bookings} />}
            {currentView === 'accommodations' && <AccommodationBookingPage accommodations={accommodations} sysConfig={sysConfig} context={pendingAccAction} onBook={async (data) => {
                try {
                   await submitRegistration(data);
                   setPendingAccAction(null);
                   setCurrentView('dashboard');
                   window.scrollTo(0,0);
                } catch(e) { alert("送出失敗"); }
            }} onBack={() => { setPendingAccAction(null); setCurrentView('home'); }} />}
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

      {showAccPromptModal && <AccPromptModal sysConfig={sysConfig} onClose={() => setShowAccPromptModal(false)} onGoActivities={()=>{setShowAccPromptModal(false); setCurrentView('activities'); window.scrollTo(0,0);}} onGoAccommodations={()=>{setShowAccPromptModal(false); setCurrentView('accommodations'); window.scrollTo(0,0);}} />}
    </div>
  );
}

export default App;