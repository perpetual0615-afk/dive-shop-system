import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Waves, Home, LifeBuoy, CalendarDays, User, Settings, ClipboardList, CheckCircle, Clock, X, Menu, ChevronRight, ChevronLeft, ChevronDown, Plus, Trash2, Edit3, Save, AlertTriangle, PenTool, Phone, MessageCircle, MapPin, Scale, Info, Check, ArrowRight, ShoppingCart, Search, BookOpen, Fish, Lock, KeyRound, Download, CircleDollarSign } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, serverTimestamp, deleteDoc, setDoc, getDoc } from 'firebase/firestore';

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
// 卡片專屬圖示與全新背景浮水印 (豐富細節與專屬動態)
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
    
    {/* 背景層：海扇珊瑚 (Sea Fan Webbing) */}
    <g style={{ transformOrigin: '60px 120px' }} stroke="#FDA4AF" strokeLinecap="round" opacity="0.4">
      <animateTransform attributeName="transform" type="rotate" values="-4; 4; -4" dur="7s" repeatCount="indefinite" ease="ease-in-out" />
      <path d="M60 120 Q 35 90 10 50 M60 120 Q 45 70 25 15 M60 120 Q 75 70 95 15 M60 120 Q 85 90 110 50" strokeWidth="3" />
      {/* 橫向連接網紋 */}
      <path d="M22 80 Q 60 65 98 80 M13 55 Q 60 30 107 55 M27 30 Q 60 10 93 30" strokeWidth="2" strokeDasharray="3 5" />
    </g>

    {/* 中層：鹿角主幹 (Main Branches) */}
    <g style={{ transformOrigin: '60px 110px' }} strokeLinecap="round" strokeLinejoin="round">
      <animateTransform attributeName="transform" type="rotate" values="2; -2; 2" dur="5s" repeatCount="indefinite" ease="ease-in-out" />
      
      {/* 光暈外層 (增加層次厚度) */}
      <path d="M60 120 C 50 80 20 60 15 25 M60 120 C 70 80 100 60 105 25 M60 120 C 55 70 35 40 45 10 M60 120 C 65 70 85 40 75 10 M60 120 V 30 M35 70 Q 20 50 5 45 M85 70 Q 100 50 115 45" stroke="#FFF" strokeWidth="12" opacity="0.25" filter="blur(2px)" />
      
      {/* 實體主幹 */}
      <path d="M60 120 C 50 80 20 60 15 25" stroke="url(#coralGrad)" strokeWidth="8" opacity="0.95" />
      <path d="M60 120 C 70 80 100 60 105 25" stroke="url(#coralGrad)" strokeWidth="8" opacity="0.95" />
      <path d="M60 120 C 55 70 35 40 45 10" stroke="url(#coralAccent)" strokeWidth="7" opacity="0.9" />
      <path d="M60 120 C 65 70 85 40 75 10" stroke="url(#coralAccent)" strokeWidth="7" opacity="0.9" />
      <path d="M60 120 V 30" stroke="url(#coralGrad)" strokeWidth="9" opacity="0.95" />
      
      {/* 側分支 */}
      <path d="M35 70 Q 20 50 5 45" stroke="url(#coralGrad)" strokeWidth="5.5" />
      <path d="M85 70 Q 100 50 115 45" stroke="url(#coralGrad)" strokeWidth="5.5" />
      <path d="M50 50 Q 30 30 25 15" stroke="url(#coralAccent)" strokeWidth="4.5" />
      <path d="M70 50 Q 90 30 95 15" stroke="url(#coralAccent)" strokeWidth="4.5" />

      {/* 內部珊瑚紋理 (虛線) */}
      <g stroke="#FFF" strokeWidth="2.5" strokeDasharray="2 6" opacity="0.5">
        <path d="M60 115 C 50 80 20 60 15 25 M60 115 C 70 80 100 60 105 25 M60 115 V 30" />
      </g>

      {/* 端點水螅體 (Polyps) */}
      <g fill="#FFF" opacity="0.9">
         <circle cx="15" cy="25" r="4.5" />
         <circle cx="105" cy="25" r="4.5" />
         <circle cx="45" cy="10" r="4" />
         <circle cx="75" cy="10" r="4" />
         <circle cx="60" cy="30" r="4.5" />
         <circle cx="5" cy="45" r="3.5" />
         <circle cx="115" cy="45" r="3.5" />
         <circle cx="25" cy="15" r="3" />
         <circle cx="95" cy="15" r="3" />
      </g>

      {/* 螢光點綴 (Bioluminescent Dots) */}
      <g fill="#FFF">
         <circle cx="35" cy="50" r="2.5"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></circle>
         <circle cx="85" cy="50" r="2.5"><animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/></circle>
         <circle cx="60" cy="65" r="2.5"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/></circle>
         <circle cx="20" cy="75" r="2"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/></circle>
         <circle cx="100" cy="75" r="2"><animate attributeName="opacity" values="0.3;1;0.3" dur="3.5s" repeatCount="indefinite"/></circle>
         <circle cx="50" cy="35" r="2"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.8s" repeatCount="indefinite"/></circle>
         <circle cx="70" cy="35" r="2"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite"/></circle>
      </g>
    </g>

    {/* 動態氣泡 */}
    <circle cx="45" cy="50" r="4" fill="#FDA4AF" opacity="0.8">
      <animate attributeName="cy" values="50; -10" dur="4s" repeatCount="indefinite" />
      <animate attributeName="cx" values="45; 35; 55; 45" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0; 0.8; 0" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="80" cy="80" r="3" fill="#FBCFE8" opacity="0.7">
      <animate attributeName="cy" values="80; 0" dur="5s" repeatCount="indefinite" begin="1s" />
      <animate attributeName="cx" values="80; 90; 70; 80" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0; 0.7; 0" dur="5s" repeatCount="indefinite" begin="1s" />
    </circle>
  </svg>
);

const DivingGearWatermark = ({ className }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="tankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0891B2" />
        <stop offset="50%" stopColor="#22D3EE" />
        <stop offset="100%" stopColor="#164E63" />
      </linearGradient>
      <linearGradient id="bcdGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="bcdHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    <g>
      {/* 裝備微幅上下漂浮動態 */}
      <animateTransform attributeName="transform" type="translate" values="0,3; 0,-3; 0,3" dur="5s" repeatCount="indefinite" ease="ease-in-out" />
      
      {/* 後方氣瓶 */}
      <rect x="50" y="10" width="28" height="90" rx="14" fill="url(#tankGrad)" opacity="0.95" />
      <path d="M58 4 H 70 V 10 H 58 Z" fill="#94A3B8" opacity="0.9" />
      <rect x="61" y="0" width="6" height="4" rx="1" fill="#475569" />
      <rect x="50" y="80" width="28" height="15" fill="#000000" opacity="0.5" />
      
      {/* 全新繪製的夾克式 BCD 背心 */}
      <g opacity="0.95">
        {/* 左肩帶 */}
        <path d="M35 30 C 35 15, 50 15, 55 30 C 60 50, 40 60, 35 80" fill="none" stroke="url(#bcdGrad)" strokeWidth="12" strokeLinecap="round" />
        {/* 右肩帶 */}
        <path d="M93 30 C 93 15, 78 15, 73 30 C 68 50, 88 60, 93 80" fill="none" stroke="url(#bcdGrad)" strokeWidth="12" strokeLinecap="round" />
        
        {/* 腹部包覆與口袋區 */}
        <path d="M25 70 C 25 60, 103 60, 103 70 V 95 C 103 105, 25 105, 25 95 Z" fill="url(#bcdGrad)" />
        
        {/* BCD 邊緣藍色裝飾線條 */}
        <path d="M32 75 V 90 M 96 75 V 90" stroke="url(#bcdHighlight)" strokeWidth="3" strokeLinecap="round" />
        <path d="M45 70 V 95 M 83 70 V 95" stroke="#000" strokeWidth="2" opacity="0.3" />
        
        {/* 胸前扣帶 */}
        <line x1="45" y1="45" x2="83" y2="45" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
        
        {/* 充氣波紋管 (左肩延伸) */}
        <path d="M45 20 Q 30 35, 35 60" fill="none" stroke="#475569" strokeWidth="5" strokeDasharray="3 2" />
        <circle cx="35" cy="62" r="4" fill="#0EA5E9" />
        
        {/* 備用二級頭 (掛載於右側) */}
        <circle cx="85" cy="40" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <path d="M85 33 Q 95 20, 70 10" fill="none" stroke="#64748B" strokeWidth="3" />
      </g>
    </g>

    {/* 主二級頭呼吸產生的氣泡 */}
    <circle cx="85" cy="30" r="4" fill="#BAE6FD" opacity="0.7">
      <animate attributeName="cy" values="30; -10" dur="2s" repeatCount="indefinite" />
      <animate attributeName="cx" values="85; 80; 90; 85" dur="1.2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0; 0.7; 0" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

// 3. 全新重繪：探測深淵 (海洋科技感聲納與無人潛水艇)
const AbyssExplorerWatermark = ({ className }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="abyssBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4338CA" />
        <stop offset="100%" stopColor="#312E81" />
      </linearGradient>
      <radialGradient id="sonarGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#3730A3" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="scanBeam" x1="50%" y1="50%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Tech Target / Sonar Rings */}
    <g style={{ transformOrigin: '60px 60px' }}>
      <circle cx="60" cy="60" r="50" stroke="#4F46E5" strokeWidth="1" strokeDasharray="2 4" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="20s" repeatCount="indefinite" linear="true" />
      </circle>
      <circle cx="60" cy="60" r="35" stroke="#6366F1" strokeWidth="1" opacity="0.6" />
      <circle cx="60" cy="60" r="20" stroke="#818CF8" strokeWidth="1" strokeDasharray="1 3" opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="15s" repeatCount="indefinite" linear="true" />
      </circle>
    </g>

    {/* Axis Lines */}
    <line x1="60" y1="5" x2="60" y2="115" stroke="#4F46E5" strokeWidth="1" opacity="0.4" />
    <line x1="5" y1="60" x2="115" y2="60" stroke="#4F46E5" strokeWidth="1" opacity="0.4" />
    <circle cx="60" cy="60" r="2" fill="#818CF8" />

    {/* Sonar Scan Beam */}
    <g style={{ transformOrigin: '60px 60px' }}>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
      <path d="M 60 60 L 60 10 A 50 50 0 0 1 103.3 35 Z" fill="url(#scanBeam)" opacity="0.3" />
      <line x1="60" y1="60" x2="60" y2="10" stroke="#818CF8" strokeWidth="2" opacity="0.8">
        <animate attributeName="opacity" values="0.8; 0.3; 0.8" dur="2s" repeatCount="indefinite" />
      </line>
    </g>

    {/* ROV Submersible (Floating in the abyss) */}
    <g opacity="0.9">
      <animateTransform attributeName="transform" type="translate" values="0,-3; 0,3; 0,-3" dur="4s" repeatCount="indefinite" ease="ease-in-out" />
      {/* Main Body */}
      <rect x="42" y="52" width="24" height="14" rx="4" fill="#1E1B4B" stroke="#A5B4FC" strokeWidth="1.5" />
      {/* Dome / Viewport */}
      <path d="M 44 52 Q 54 42 64 52" fill="none" stroke="#818CF8" strokeWidth="1.5" />
      <circle cx="54" cy="48" r="1.5" fill="#6366F1" />
      {/* Thrusters / Propellers */}
      <rect x="38" y="56" width="4" height="6" rx="1" fill="#4F46E5" />
      <rect x="66" y="56" width="4" height="6" rx="1" fill="#4F46E5" />
      <path d="M 36 57 Q 34 59 36 61" stroke="#818CF8" strokeWidth="1" fill="none" />
      <path d="M 68 57 Q 70 59 68 61" stroke="#818CF8" strokeWidth="1" fill="none" />
      
      {/* Headlights illuminating the deep */}
      <path d="M 54 66 L 30 100 L 78 100 Z" fill="url(#sonarGlow)" opacity="0.5" />
      <circle cx="54" cy="66" r="2.5" fill="#C7D2FE">
         <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>

    {/* Digital Signals / Detected Objects */}
    <g fill="#38BDF8">
      <circle cx="25" cy="30" r="2">
        <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="1;3;1" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="85" cy="20" r="1.5">
        <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1s" />
      </circle>
      <circle cx="95" cy="85" r="2.5" fill="#818CF8">
        <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.5s" />
      </circle>
      <circle cx="20" cy="80" r="1">
        <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
      </circle>
    </g>

    {/* Tech Interface Brackets */}
    <path d="M 10 20 L 10 10 L 20 10 M 100 10 L 110 10 L 110 20 M 110 100 L 110 110 L 100 110 M 20 110 L 10 110 L 10 100" stroke="#6366F1" strokeWidth="2" fill="none" opacity="0.7" />
  </svg>
);

// 4. 俯視鯨鯊 (Top-Down Whale Shark) - HERO 區塊陽光海面動態背景專用 (全彩細節版)
const WhaleSharkTopDownIcon = ({ className }) => (
  <svg viewBox="0 0 150 250" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      {/* 鯨鯊體色漸層 */}
      <linearGradient id="wsBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0F172A" />
        <stop offset="40%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#172554" />
      </linearGradient>
      {/* 胸鰭漸層 */}
      <linearGradient id="wsFin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
    </defs>
    
    {/* 寬大的胸鰭 (左/右) */}
    <path d="M 35 60 C 10 70, -5 100, 5 110 C 20 95, 35 90, 45 85 Z" fill="url(#wsFin)" />
    <path d="M 115 60 C 140 70, 155 100, 145 110 C 130 95, 115 90, 105 85 Z" fill="url(#wsFin)" />
    
    {/* 腹鰭 (Pelvic fins) */}
    <path d="M 55 160 C 40 170, 35 185, 45 190 C 50 180, 55 175, 60 175 Z" fill="url(#wsFin)" />
    <path d="M 95 160 C 110 170, 115 185, 105 190 C 100 180, 95 175, 90 175 Z" fill="url(#wsFin)" />

    {/* 尾鰭 */}
    <path d="M 75 220 C 50 230, 40 250, 45 245 C 60 235, 90 235, 105 245 C 110 250, 100 230, 75 220 Z" fill="url(#wsFin)" />

    {/* 鯨鯊主軀幹 */}
    <path d="M 40 20 C 30 30, 20 60, 45 140 C 60 200, 70 230, 75 240 C 80 230, 90 200, 105 140 C 130 60, 120 30, 110 20 C 95 5, 55 5, 40 20 Z" fill="url(#wsBody)" />

    {/* 側邊立體高光 (反光) */}
    <path d="M 40 20 C 30 30, 20 60, 45 140" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.3" fill="none" />
    <path d="M 110 20 C 120 30, 130 60, 105 140" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.3" fill="none" />

    {/* 鰓裂 (Gills) */}
    <g stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none">
      <path d="M 28 40 Q 32 45 27 50" /><path d="M 26 43 Q 30 48 25 53" />
      <path d="M 24 46 Q 28 51 23 56" /><path d="M 22 49 Q 26 54 21 59" />
      <path d="M 122 40 Q 118 45 123 50" /><path d="M 124 43 Q 120 48 125 53" />
      <path d="M 126 46 Q 122 51 127 56" /><path d="M 128 49 Q 124 54 129 59" />
    </g>

    {/* 標誌性棋盤格橫紋 (Stripes) */}
    <g stroke="#7DD3FC" strokeWidth="1" opacity="0.25" fill="none">
      <path d="M 40 45 Q 75 55 110 45" /><path d="M 35 65 Q 75 75 115 65" />
      <path d="M 35 85 Q 75 95 115 85" /><path d="M 40 105 Q 75 115 110 105" />
      <path d="M 45 125 Q 75 135 105 125" /><path d="M 50 145 Q 75 155 100 145" />
      <path d="M 55 165 Q 75 175 95 165" /><path d="M 60 185 Q 75 195 90 185" />
      <path d="M 65 205 Q 75 210 85 205" />
    </g>
    
    {/* 標誌性棋盤格直紋 */}
    <g stroke="#7DD3FC" strokeWidth="1" opacity="0.2" fill="none">
      <path d="M 50 30 Q 60 120 65 220" />
      <path d="M 75 25 Q 75 120 75 230" />
      <path d="M 100 30 Q 90 120 85 220" />
    </g>

    {/* 標誌性白斑 (Spots) - 混合大小 */}
    <g fill="#FFFFFF" opacity="0.7">
       <circle cx="75" cy="35" r="2.5" /><circle cx="60" cy="40" r="1.5" /><circle cx="90" cy="40" r="1.5" />
       <circle cx="50" cy="50" r="2" /><circle cx="100" cy="50" r="2" /><circle cx="75" cy="55" r="3" />
       <circle cx="60" cy="65" r="2" /><circle cx="90" cy="65" r="2" /><circle cx="45" cy="80" r="2.5" />
       <circle cx="105" cy="80" r="2.5" /><circle cx="75" cy="85" r="2.5" /><circle cx="60" cy="95" r="1.5" />
       <circle cx="90" cy="95" r="1.5" /><circle cx="75" cy="115" r="2.5" /><circle cx="55" cy="110" r="1.5" />
       <circle cx="95" cy="110" r="1.5" /><circle cx="65" cy="135" r="2" /><circle cx="85" cy="135" r="2" />
       <circle cx="75" cy="155" r="2" /><circle cx="68" cy="170" r="1.5" /><circle cx="82" cy="170" r="1.5" />
       <circle cx="75" cy="185" r="1.5" /><circle cx="75" cy="210" r="1" />
    </g>
    
    {/* 水藍色小斑 (層次感) */}
    <g fill="#7DD3FC" opacity="0.5">
       <circle cx="68" cy="30" r="1" /><circle cx="82" cy="30" r="1" /><circle cx="45" cy="40" r="1" />
       <circle cx="105" cy="40" r="1" /><circle cx="85" cy="50" r="1.5" /><circle cx="65" cy="50" r="1.5" />
       <circle cx="50" cy="65" r="1" /><circle cx="100" cy="65" r="1" /><circle cx="82" cy="75" r="1.5" />
       <circle cx="68" cy="75" r="1.5" /><circle cx="50" cy="95" r="1" /><circle cx="100" cy="95" r="1" />
       <circle cx="68" cy="105" r="1.5" /><circle cx="82" cy="105" r="1.5" /><circle cx="60" cy="125" r="1" />
       <circle cx="90" cy="125" r="1" /><circle cx="75" cy="140" r="1" />
    </g>

    {/* 背鰭 (Dorsal fin) */}
    <path d="M 75 115 C 65 130, 85 130, 75 155 C 75 155, 78 135, 75 115 Z" fill="#0EA5E9" opacity="0.3" />
  </svg>
);

const AbyssRadarIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20" opacity="0.3" />
    <path d="M2 12h20" opacity="0.3" />
    <circle cx="12" cy="12" r="6" strokeDasharray="2 2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 12L18.5 5.5" strokeDasharray="1 2" />
  </svg>
);

const CoralIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22v-7" />
    <path d="M12 17c-2.5-1-3-3-3-5a3 3 0 0 1 2-2" />
    <path d="M12 18c3-1 4.5-2 4.5-5 0-1.5-1-2.5-2-3" />
    <path d="M7 22v-4" />
    <path d="M7 19c-2-1-3-2-3-4" />
    <path d="M17 22v-5" />
    <path d="M17 19c2-.5 3-2 3-4" />
  </svg>
);

const AnchorIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="8" x2="12" y2="22" />
    <line x1="5" y1="12" x2="19" y2="12" />
    <path d="M9 10H5l-1 1c0 5 3.5 9 8 9s8-4 8-9l-1-1h-4" />
  </svg>
);

const LighthouseIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 9h8" />
    <path d="M7 13h10" />
    <path d="M6 17h12" />
    <path d="M10 22V5l-2-2h8l-2 2v17" />
    <path d="M12 2v1" />
    <path d="M12 5h.01" />
  </svg>
);

const CardDivingMaskIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 11c0-3.87 3.13-7 7-7h4c3.87 0 7 3.13 7 7v3c0 2.21-1.79 4-4 4h-1.5l-1.5 2h-4l-1.5-2H7c-2.21 0-4-1.79-4-4v-3z" />
    <path d="M12 11v6" />
  </svg>
);

const CardDivingTankIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 閥門與開關手輪 (Valve & Knob) */}
    <path d="M11 2h2v3h-2z" />
    <path d="M13 3h1.5a1 1 0 0 1 0 2H13" />
    {/* 氣瓶主體 (Tank body with smooth shoulders) */}
    <path d="M7 10.5C7 7.46 9.24 5 12 5c2.76 0 5 2.46 5 5.5V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9.5Z" />
    {/* BCD綁帶 (Strap) */}
    <path d="M7 13h10" />
    {/* 防撞底座 (Tank Boot) */}
    <path d="M7 19h10" />
  </svg>
);

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

// 確保房型資料相容新版階梯定價的轉換函式 (已加上內部方案人數排序)
function migrateRoomTiers(room) {
  let tiers = [];
  if (room.pricingTiers && room.pricingTiers.length > 0) {
     tiers = [...room.pricingTiers];
  } else if (!room.isDorm) {
     // 若為舊版單一定價資料，自動轉換為預設入住方案
     tiers = [{
         id: Date.now().toString(),
         name: '基本入住方案',
         guests: room.bedCount || 2,
         extraBeds: 0,
         priceLowWeekday: room.priceLowWeekday || '',
         priceLowWeekend: room.priceLowWeekend || '',
         pricePeakWeekday: room.pricePeakWeekday || '',
         pricePeakWeekend: room.pricePeakWeekend || '',
         priceHoliday: room.priceHoliday || ''
     }];
  }
  // 保證方案選單內部依入住人數由少到多排列
  return tiers.sort((a, b) => (parseInt(a.guests) || 0) - (parseInt(b.guests) || 0));
}

// 👉 旗艦版：全域統一的房型排序邏輯 (關鍵字權重 + 容納人數 + 名稱)
function sortAccommodations(accommodations) {
  return [...(accommodations || [])].sort((a, b) => {
    // 1. 絕對優先：背包房 / 青旅
    if (a.isDorm && !b.isDorm) return -1;
    if (!a.isDorm && b.isDorm) return 1;
    
    // 2. 關鍵字智慧權重 (確保「1張床/雙人房」絕對優先於「2張床/四人房」)
    const getKeywordWeight = (name) => {
      if (!name) return 99;
      const n = name.toLowerCase();
      if (n.includes('背包') || n.includes('青旅') || n.includes('dorm')) return 1;
      if (n.includes('單人') || n.includes('1人')) return 2;
      if (n.includes('1張') || n.includes('一張') || n.includes('雙人')) return 3;
      if (n.includes('2張') || n.includes('兩張') || n.includes('四人')) return 4;
      if (n.includes('3張') || n.includes('三張') || n.includes('六人')) return 5;
      if (n.includes('4張') || n.includes('四張') || n.includes('八人')) return 6;
      if (n.includes('包棟') || n.includes('包層')) return 90;
      return 50; // 一般名稱則依循人數排序
    };
    
    const weightA = getKeywordWeight(a.name);
    const weightB = getKeywordWeight(b.name);
    
    // 若名稱含有明確的房型/床位關鍵字，強制優先以此排序
    if (weightA !== weightB && (weightA < 50 || weightB < 50)) {
       return weightA - weightB;
    }

    // 3. 若關鍵字權重相同(或皆無)，依最少容納人數由少到多排序
    const getCap = (r) => {
      if (r.isDorm) return 1;
      const tiers = migrateRoomTiers(r);
      if (tiers && tiers.length > 0) {
         // 掃描方案，抓出該房型的最少入住基準人數
         return Math.min(...tiers.map(t => parseInt(t.guests) || 99));
      }
      return parseInt(r.bedCount) || 99;
    };
    
    const capA = getCap(a);
    const capB = getCap(b);
    if (capA !== capB) return capA - capB;
    
    // 4. 最後依名稱字母自然排序
    return (a.name || '').localeCompare(b.name || '');
  });
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  useEffect(() => {
    let timer;
    if (lockoutTime > 0) timer = setInterval(() => setLockoutTime(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || lockoutTime > 0) return;
    setIsSubmitting(true); setError('');

    try {
      // 1. 真實登入 Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. 檢查名單 (遵循 Rule 1 路徑)
      const adminDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admins', user.uid));
      
      if (adminDoc.exists()) {
        onVerify(true);
      } else {
        await signOut(auth); // 雖然帳密對，但不在管理員白名單，強制登出
        throw new Error('此帳號未獲授權進入管理後台。');
      }
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      if (newAttempts >= 3) {
        setLockoutTime(60); setFailedAttempts(0);
      } else {
        setFailedAttempts(newAttempts);
        setError(err.message === '此帳號未獲授權進入管理後台。' ? err.message : '帳號或密碼錯誤');
      }
      setPassword('');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative animate-in zoom-in-95 border border-white">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Lock className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 text-center mb-2">營運管理登入</h2>
        <p className="text-slate-500 text-sm text-center mb-8 font-medium">請使用已授權的帳號密碼</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {lockoutTime > 0 ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-center space-y-2 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto" />
              <p className="text-red-700 font-bold text-sm">嘗試錯誤次數過多</p>
              <p className="text-red-500 font-black text-xl">{lockoutTime} 秒後解鎖</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <input 
                  autoFocus
                  type="email" 
                  value={email} 
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="管理員 Email" 
                  className={`w-full p-4 bg-slate-50 border-2 rounded-2xl text-center font-bold outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-500 focus:bg-white'}`}
                />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="密碼" 
                  className={`w-full p-4 bg-slate-50 border-2 rounded-2xl text-center font-black tracking-widest outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-500 focus:bg-white'}`}
                />
              </div>
              {error && <p className="text-red-500 text-xs font-bold text-center mt-2 animate-bounce">{error} (剩餘 {3 - failedAttempts} 次機會)</p>}
            </>
          )}
          <button type="submit" disabled={isSubmitting || lockoutTime > 0} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
            {isSubmitting ? '驗證中...' : <><KeyRound className="w-5 h-5" /> 登入並解鎖權限</>}
          </button>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="w-full py-2 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors disabled:opacity-50">
            取消返回
          </button>
        </form>
      </div>
    </div>
  );
}

function QuickCard({ icon, title, desc, onClick, colorTheme = "cyan", variant, bgIcon }) {
  const themeMap = {
    teal: {
      wrapper: "border-teal-100 hover:border-teal-300 hover:shadow-[0_15px_30px_rgba(20,184,166,0.15)]",
      iconBg: "bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 group-hover:from-teal-400 group-hover:to-teal-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]",
      titleHover: "group-hover:text-teal-700",
      watermark: "text-teal-400",
      glow: "bg-teal-400/10"
    },
    rose: {
      wrapper: "border-rose-100 hover:border-rose-300 hover:shadow-[0_15px_30px_rgba(244,63,94,0.15)]",
      iconBg: "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 group-hover:from-rose-400 group-hover:to-rose-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]",
      titleHover: "group-hover:text-rose-700",
      watermark: "text-rose-400",
      glow: "bg-rose-400/10"
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
    <div onClick={onClick} className={`bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer group hover:-translate-y-2 relative overflow-hidden ${theme.wrapper} h-full flex flex-col`}>
      {/* 沉浸式光暈 */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform duration-700 group-hover:scale-150 ${theme.glow}`}></div>
      
      {/* 重新設計的右下角背景浮水印 (完全顯示、細節豐富、原生動態) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem] z-0">
        {variant === 'accommodations' && (
          <StaghornCoralWatermark className={`absolute bottom-0 right-2 w-44 h-44 opacity-[0.2] transition-all duration-700 group-hover:scale-105 group-hover:opacity-[0.35] ${theme.watermark}`} />
        )}
        {variant === 'equipments' && (
          <DivingGearWatermark className={`absolute bottom-2 right-4 w-36 h-36 opacity-[0.2] transition-all duration-700 group-hover:-translate-y-2 group-hover:opacity-[0.35] ${theme.watermark}`} />
        )}
        {variant === 'dashboard' && (
          /* 探測深淵海洋科技感專屬佈局 */
          <AbyssExplorerWatermark className={`absolute bottom-0 right-0 w-48 h-48 opacity-[0.25] transition-all duration-700 group-hover:scale-110 group-hover:opacity-[0.45] ${theme.watermark} translate-x-4 translate-y-4`} />
        )}
        {variant === 'activities' && (
          <Waves className={`absolute bottom-0 right-0 w-44 h-44 opacity-[0.15] transition-all duration-700 group-hover:scale-110 group-hover:opacity-[0.25] ${theme.watermark}`} />
        )}
        {!['accommodations', 'equipments', 'dashboard', 'activities'].includes(variant) && (
          <div className={`absolute bottom-0 right-0 opacity-[0.15] group-hover:scale-110 group-hover:opacity-[0.25] transition-all duration-700 pointer-events-none [&>svg]:w-44 [&>svg]:h-44 ${theme.watermark}`}>
             {bgIcon || icon}
          </div>
        )}
      </div>
      
      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] relative z-10 ${theme.iconBg}`}>
        {icon}
      </div>
      
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
               {/* 💡 修正：當教材系統改變時，同步連動更新簽證系統 (certSystem) */}
               <select value={f.materialSystem} onChange={e=>setF({...f, materialSystem: e.target.value, certSystem: e.target.value})} className="w-full p-3.5 border border-slate-300 rounded-xl font-bold outline-none focus:border-blue-500">
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
  const [publishType, setPublishType] = useState(isEdit ? (editingActivity.isCourse ? 'course' : (editingActivity.diveCategory === '體驗潛水' ? 'dsd' : 'fundive')) : 'fundive');
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
              <button type="button" onClick={() => { setPublishType('fundive'); setFormData({...formData, diveCategory: '岸潛', isCourse: false}) }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${publishType==='fundive'?'bg-white shadow-sm text-blue-600':'text-slate-500 hover:bg-slate-200/50'}`}><Fish className="w-4 h-4"/> Fun Dive</button>
              <button type="button" onClick={() => { setPublishType('dsd'); setFormData({...formData, diveCategory: '體驗潛水', isCourse: false}) }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${publishType==='dsd'?'bg-white shadow-sm text-blue-600':'text-slate-500 hover:bg-slate-200/50'}`}><LifeBuoy className="w-4 h-4"/> 體驗潛水</button>
              <button type="button" onClick={() => { setPublishType('course'); setFormData({...formData, diveCategory: '課程', isCourse: true}) }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${publishType==='course'?'bg-white shadow-sm text-blue-600':'text-slate-500 hover:bg-slate-200/50'}`}><BookOpen className="w-4 h-4"/> 證照課程</button>
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
          ) : publishType === 'dsd' || formData.diveCategory === '體驗潛水' ? (
            <div className="mt-3 p-4 bg-cyan-50 rounded-xl border border-cyan-200 shadow-sm">
               <p className="text-sm font-bold text-cyan-800 flex items-center gap-2"><Info className="w-5 h-5"/> 體驗潛水項目：顧客報名時將免費包含全套裝備。</p>
            </div>
          ) : publishType === 'fundive' ? (
            <div className="grid grid-cols-2 gap-4 mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <FormInput label="預計一般氣瓶 (支)" type="number" value={formData.airTanks ?? 2} onChange={v => setFormData({ ...formData, airTanks: v === '' ? '' : Math.max(0, parseInt(v)) })} />
              <FormInput label="預計高氧氣瓶 (支)" type="number" value={formData.nitroxTanks ?? 0} onChange={v => setFormData({ ...formData, nitroxTanks: v === '' ? '' : Math.max(0, parseInt(v)) })} />
            </div>
          ) : null}
          
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

function ActivityAdminPanel({ db, appId, activities, courseTemplates, sysConfig, saveSysConfig, subTab, setSubTab, bookings = [] }) {
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
                
                // 動態計算活動剩餘名額
                const totalSlots = parseInt(act.capacity) || 0;
                const bookedCount = bookings.filter(b => b.type === 'activity' && b.activityId === act.id && b.status !== 'cancelled').length;
                const remainingSlots = Math.max(0, totalSlots - bookedCount);

                return (
                  <div key={act.id} className="bg-white border border-slate-200 p-5 rounded-2xl relative group shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => { setEditingActivity(act); setIsModalOpen(true); }} className="p-1.5 bg-slate-100 rounded-lg hover:bg-blue-600 hover:text-white"><Edit3 className="w-4 h-4"/></button>
                     <button onClick={() => { if (window.confirm('確定要刪除這筆活動嗎？')) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activities', act.id)); }} className="p-1.5 bg-slate-100 rounded-lg hover:bg-red-600 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  
                  <div className="flex justify-between items-start mb-3 pr-10">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md inline-flex items-center gap-1.5 shadow-sm border ${act.isCourse ? 'bg-indigo-600 border-indigo-700 text-white' : (act.diveCategory === '體驗潛水' ? 'bg-cyan-100 border-cyan-300 text-cyan-800' : 'bg-teal-50 border-teal-200 text-teal-700')}`}>
                      {act.isCourse ? <BookOpen className="w-3 h-3" /> : (act.diveCategory === '體驗潛水' ? <LifeBuoy className="w-3 h-3" /> : <Fish className="w-3 h-3" />)}
                      {act.isCourse ? '系統課程' : String(act.diveCategory || '')}
                    </span>
                    <span className="text-blue-600 font-black text-base">NT$ {Number(act.price || 0)}</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg mb-3">{String(act.name || '')}</h4>

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
                      <p className={`flex items-center gap-1.5 ${remainingSlots <= 0 ? 'text-red-500 font-black' : ''}`}>
                         剩餘 {remainingSlots} / {totalSlots} 名
                      </p>
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
                        {/* 💡 修正：卡片優先顯示教材系統 materialSystem */}
                        <p className="text-sm text-slate-600 font-medium"><span className="font-black text-slate-800">{String(c.materialSystem || c.certSystem)}</span> • {Number(c.days)} 天安排 • NT$ {Number(c.price)}</p>
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
  const [f, setF] = useState(() => {
    if (room) {
      return {
        ...room,
        pricingTiers: migrateRoomTiers(room)
      };
    }
    return {
      name: '', quantity: 1, isDorm: false, bedCount: 1,
      priceLowWeekday: '', priceLowWeekend: '', 
      pricePeakWeekday: '', pricePeakWeekend: '', 
      priceHoliday: '',
      pricingTiers: []
    };
  });

  const applyTemplate = (type) => {
     if (type === '1bed') {
       setF({
         ...f, isDorm: false,
         pricingTiers: [
           { id: Date.now() + '1', name: '1人入住價位', guests: 1, extraBeds: 0, priceLowWeekday: '', priceLowWeekend: '', pricePeakWeekday: '', pricePeakWeekend: '', priceHoliday: '' },
           { id: Date.now() + '2', name: '2人入住價位', guests: 2, extraBeds: 0, priceLowWeekday: '', priceLowWeekend: '', pricePeakWeekday: '', pricePeakWeekend: '', priceHoliday: '' },
           { id: Date.now() + '3', name: '加床後3人入住價位', guests: 3, extraBeds: 1, priceLowWeekday: '', priceLowWeekend: '', pricePeakWeekday: '', pricePeakWeekend: '', priceHoliday: '' }
         ]
       });
     } else if (type === '2bed') {
       setF({
         ...f, isDorm: false,
         pricingTiers: [
           { id: Date.now() + '1', name: '2人入住價位', guests: 2, extraBeds: 0, priceLowWeekday: '', priceLowWeekend: '', pricePeakWeekday: '', pricePeakWeekend: '', priceHoliday: '' },
           { id: Date.now() + '2', name: '3人入住價位', guests: 3, extraBeds: 0, priceLowWeekday: '', priceLowWeekend: '', pricePeakWeekday: '', pricePeakWeekend: '', priceHoliday: '' },
           { id: Date.now() + '3', name: '加床後3人入住價位', guests: 3, extraBeds: 1, priceLowWeekday: '', priceLowWeekend: '', pricePeakWeekday: '', pricePeakWeekend: '', priceHoliday: '' },
           { id: Date.now() + '4', name: '4人入住價位', guests: 4, extraBeds: 0, priceLowWeekday: '', priceLowWeekend: '', pricePeakWeekday: '', pricePeakWeekend: '', priceHoliday: '' },
           { id: Date.now() + '5', name: '加床後5人入住價位', guests: 5, extraBeds: 1, priceLowWeekday: '', priceLowWeekend: '', pricePeakWeekday: '', pricePeakWeekend: '', priceHoliday: '' }
         ]
       });
     }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isSubmitting) return;
    setIsSubmitting(true);
    try {
      const dataToSave = {
         name: f.name,
         isDorm: f.isDorm,
         quantity: parseInt(f.quantity) || 1,
      };

      if (f.isDorm) {
         // 背包房維持傳統定價 (單一床位)
         dataToSave.priceLowWeekday = parseInt(f.priceLowWeekday) || 0;
         dataToSave.priceLowWeekend = parseInt(f.priceLowWeekend) || 0;
         dataToSave.pricePeakWeekday = parseInt(f.pricePeakWeekday) || 0;
         dataToSave.pricePeakWeekend = parseInt(f.pricePeakWeekend) || 0;
         dataToSave.priceHoliday = parseInt(f.priceHoliday) || 0;
         dataToSave.pricingTiers = []; // 清空階梯方案
         dataToSave.bedCount = parseInt(f.bedCount) || 1; // 總床位數乘數
      } else {
         // 獨立套房使用方案定價
         dataToSave.pricingTiers = f.pricingTiers.map(t => ({
            ...t,
            guests: parseInt(t.guests) || 1,
            extraBeds: parseInt(t.extraBeds) || 0,
            priceLowWeekday: parseInt(t.priceLowWeekday) || 0,
            priceLowWeekend: parseInt(t.priceLowWeekend) || 0,
            pricePeakWeekday: parseInt(t.pricePeakWeekday) || 0,
            pricePeakWeekend: parseInt(t.pricePeakWeekend) || 0,
            priceHoliday: parseInt(t.priceHoliday) || 0,
         }));
         // 將最低基底方案人數作為容量預設參考，以防萬一
         dataToSave.bedCount = f.pricingTiers.length > 0 ? f.pricingTiers[0].guests : 2;
      }

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
      <div className="bg-white rounded-3xl w-full max-w-4xl p-8 shadow-xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-black mb-6 text-slate-800">房型及階梯價格設定</h2>
        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
          <div className="grid grid-cols-1 gap-4">
             <FormInput label="房型/床位名稱" required value={f.name} onChange={v => setF({ ...f, name: v })} placeholder="例如：1張雙人床房型 或 背包客房" />
             
             <label className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl cursor-pointer shadow-sm hover:bg-indigo-100 transition-colors">
                <input type="checkbox" checked={f.isDorm || false} onChange={e => setF({...f, isDorm: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
                <div>
                  <span className="font-black text-indigo-900 block text-sm">此為背包房 / 青旅模式 (以「單一床位」計價)</span>
                  <span className="text-xs font-bold text-indigo-600 mt-1 block">啟用後，顧客預訂將以「單一床位」為單位計算金額，無人數方案選項。</span>
                </div>
             </label>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormInput label="實體房間數 (間)" required type="number" value={f.quantity} onChange={v => setF({ ...f, quantity: v === '' ? '' : Math.max(1, parseInt(v)) })} />
               {f.isDorm && (
                 <FormInput label="每間床位數量" required type="number" value={f.bedCount || 1} onChange={v => setF({ ...f, bedCount: v === '' ? '' : Math.max(1, parseInt(v)) })} />
               )}
             </div>
          </div>

          {f.isDorm ? (
            // 背包房維持舊有簡單定價
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                 <h4 className="font-black text-blue-800 text-sm flex items-center gap-2 border-b border-blue-100 pb-2"><CalendarDays className="w-4 h-4"/> 淡季單一床位設定 (Low Season)</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <FormInput label="淡季平日價" required type="number" value={f.priceLowWeekday} onChange={v => setF({ ...f, priceLowWeekday: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                   <FormInput label="淡季假日價" required type="number" value={f.priceLowWeekend} onChange={v => setF({ ...f, priceLowWeekend: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                 </div>
              </div>
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-4">
                 <h4 className="font-black text-amber-800 text-sm flex items-center gap-2 border-b border-amber-100 pb-2"><Waves className="w-4 h-4"/> 旺季單一床位設定 (Peak Season)</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <FormInput label="旺季平日價" required type="number" value={f.pricePeakWeekday} onChange={v => setF({ ...f, pricePeakWeekday: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                   <FormInput label="旺季假日價" required type="number" value={f.pricePeakWeekend} onChange={v => setF({ ...f, pricePeakWeekend: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                 </div>
              </div>
              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 space-y-4">
                 <h4 className="font-black text-rose-800 text-sm flex items-center gap-2 border-b border-rose-100 pb-2"><Info className="w-4 h-4"/> 特殊連假單一床位設定 (Holidays)</h4>
                 <div className="grid grid-cols-1 gap-4">
                   <FormInput label="連假每晚收費" required type="number" value={f.priceHoliday} onChange={v => setF({ ...f, priceHoliday: v === '' ? '' : Math.max(0, parseInt(v)) })} />
                 </div>
              </div>
            </div>
          ) : (
            // 獨立套房：全新的方案定價模組
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
               <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-200 pb-3 mb-2 gap-4">
                  <div>
                    <h4 className="font-black text-blue-800 text-base">依入住組合獨立設定各別房價 (無固定加床費)</h4>
                    <p className="text-xs font-bold text-slate-500 mt-1">例如：1張雙人床可分別設定1人、2人、加床後3人。每一種人數皆為獨立填寫的完整房價。</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     <button type="button" onClick={() => applyTemplate('1bed')} className="text-xs bg-white text-indigo-700 px-3 py-2 rounded-lg font-bold hover:bg-indigo-50 border border-indigo-200 shadow-sm flex items-center gap-1 transition-colors"><Plus className="w-3.5 h-3.5"/> 1張雙人床 範本</button>
                     <button type="button" onClick={() => applyTemplate('2bed')} className="text-xs bg-white text-teal-700 px-3 py-2 rounded-lg font-bold hover:bg-teal-50 border border-teal-200 shadow-sm flex items-center gap-1 transition-colors"><Plus className="w-3.5 h-3.5"/> 2張雙人床 範本</button>
                     <button type="button" onClick={() => {
                        setF({...f, pricingTiers: [...f.pricingTiers, {
                          id: Date.now().toString(), name: '自訂方案', guests: 2, extraBeds: 0,
                          priceLowWeekday: '', priceLowWeekend: '', pricePeakWeekday: '', pricePeakWeekend: '', priceHoliday: ''
                        }]})
                     }} className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-1 shadow-sm transition-colors"><Plus className="w-3.5 h-3.5"/> 手動新增</button>
                  </div>
               </div>
               
               {f.pricingTiers.length === 0 && <p className="text-center text-sm font-bold text-slate-400 py-8 border-2 border-dashed rounded-xl">請點選上方「範本」按鈕，快速帶入收費方案</p>}

               {f.pricingTiers.map((tier, idx) => (
                  <div key={tier.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 relative group hover:border-blue-300 transition-colors">
                     <button type="button" onClick={() => {
                        setF({...f, pricingTiers: f.pricingTiers.filter(t => t.id !== tier.id)});
                     }} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 bg-slate-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-10">
                        <FormInput label="方案名稱 (顯示給顧客看)" required value={tier.name} onChange={v => {
                           const nt = [...f.pricingTiers]; nt[idx].name = v; setF({...f, pricingTiers: nt});
                        }} placeholder="例: 加床後3人入住價位" />
                        <FormInput label="本方案可住總人數" type="number" required value={tier.guests} onChange={v => {
                           const nt = [...f.pricingTiers]; nt[idx].guests = v; setF({...f, pricingTiers: nt});
                        }} />
                        <FormInput label="此方案內含幾床沙發/加床" type="number" required value={tier.extraBeds} onChange={v => {
                           const nt = [...f.pricingTiers]; nt[idx].extraBeds = v; setF({...f, pricingTiers: nt});
                        }} />
                     </div>
                     <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 bg-slate-50/50 p-3 rounded-xl">
                        <FormInput label="淡季平日" type="number" required value={tier.priceLowWeekday} onChange={v => { const nt = [...f.pricingTiers]; nt[idx].priceLowWeekday = v; setF({...f, pricingTiers: nt}); }} />
                        <FormInput label="淡季假日" type="number" required value={tier.priceLowWeekend} onChange={v => { const nt = [...f.pricingTiers]; nt[idx].priceLowWeekend = v; setF({...f, pricingTiers: nt}); }} />
                        <FormInput label="旺季平日" type="number" required value={tier.pricePeakWeekday} onChange={v => { const nt = [...f.pricingTiers]; nt[idx].pricePeakWeekday = v; setF({...f, pricingTiers: nt}); }} />
                        <FormInput label="旺季假日" type="number" required value={tier.pricePeakWeekend} onChange={v => { const nt = [...f.pricingTiers]; nt[idx].pricePeakWeekend = v; setF({...f, pricingTiers: nt}); }} />
                        <FormInput label="連假定價" type="number" required value={tier.priceHoliday} onChange={v => { const nt = [...f.pricingTiers]; nt[idx].priceHoliday = v; setF({...f, pricingTiers: nt}); }} />
                     </div>
                  </div>
               ))}
            </div>
          )}
        </form>
        <div className="flex gap-4 pt-6 border-t mt-6 shrink-0">
           <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3.5 bg-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50">取消</button>
           <button onClick={handleSubmit} disabled={isSubmitting || (!f.isDorm && f.pricingTiers.length === 0)} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-black shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
                  <div className="absolute top-5 right-5 flex gap-2 z-10 transition-opacity">
                    <button onClick={() => { setEditingRoom(room); setIsRoomModalOpen(true); }} className="p-2 bg-slate-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors shadow-sm" title="編輯房型"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteRoom(room.id)} className="p-2 bg-slate-100 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm" title="刪除房型"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <h4 className="font-black text-slate-900 text-xl mb-4 pr-20">
                    {String(room.name)}
                    {room.isDorm && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg ml-2 align-middle shadow-sm">背包床位計價</span>}
                  </h4>
                  
                  {room.isDorm ? (
                    <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                       <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-slate-400 mb-1">淡季 (平/假)</p>
                          <p className="text-slate-700">${Number(room.priceLowWeekday).toLocaleString()} / ${Number(room.priceLowWeekend).toLocaleString()}</p>
                       </div>
                       <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <p className="text-amber-600 mb-1">旺季 (平/假)</p>
                          <p className="text-amber-800">${Number(room.pricePeakWeekday).toLocaleString()} / ${Number(room.pricePeakWeekend).toLocaleString()}</p>
                       </div>
                       <div className="bg-rose-50 p-2 rounded-lg border border-rose-100 col-span-2">
                          <p className="text-rose-600 mb-1">連假定價</p>
                          <p className="text-rose-800">${Number(room.priceHoliday).toLocaleString()}</p>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                       {migrateRoomTiers(room).map((tier, idx) => (
                         <div key={tier.id || idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                           <div className="flex justify-between items-center mb-2 border-b border-slate-200/60 pb-2">
                             <span className="font-black text-blue-800 text-sm">{tier.name}</span>
                             <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold shadow-sm">
                               {tier.guests} 人入住 {tier.extraBeds > 0 ? `(含 ${tier.extraBeds} 加床)` : ''}
                             </span>
                           </div>
                           <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                              <div><p className="text-slate-400 mb-0.5">淡季(平/假)</p><p className="text-slate-700">${Number(tier.priceLowWeekday).toLocaleString()} / ${Number(tier.priceLowWeekend).toLocaleString()}</p></div>
                              <div><p className="text-amber-500 mb-0.5">旺季(平/假)</p><p className="text-amber-700">${Number(tier.pricePeakWeekday).toLocaleString()} / ${Number(tier.pricePeakWeekend).toLocaleString()}</p></div>
                              <div><p className="text-rose-500 mb-0.5">連假定價</p><p className="text-rose-700">${Number(tier.priceHoliday).toLocaleString()}</p></div>
                           </div>
                         </div>
                       ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm font-bold gap-2">
                     <span className="text-slate-500">實體房間：{room.quantity} 間</span>
                     <div className="flex flex-wrap gap-2">
                       {room.maxExtraBeds > 0 ? (
                         <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">加床 ${room.priceExtraBed || 0} / 晚 (上限 {room.maxExtraBeds} 床)</span>
                       ) : (
                         <span className="text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">不可加床</span>
                       )}
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
            <FormInput label="HERO區動態標籤文字" value={f.heroBadgeText} onChange={v => setF({ ...f, heroBadgeText: v })} placeholder="例如: Top-Down Ocean View & Whale Sharks" />
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
          </div>
        </ControlPanelCard>

        {/* 新增: 潛水活動收費表管理 */}
        <div className="lg:col-span-2">
          <ControlPanelCard title="潛水活動收費表管理">
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-2">
                 <p className="text-xs font-bold text-slate-500">顯示於前台大廳的收費一覽表</p>
                 <button type="button" onClick={() => setF({...f, priceList: [...(f.priceList || []), { id: Date.now(), name: '', price: '', desc: '' }]})} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm border border-blue-100">+ 新增收費項目</button>
               </div>
               <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {(f.priceList || []).map((item, idx) => (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-all hover:border-blue-300">
                      <div className="flex-1 space-y-3 w-full">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           <input type="text" value={item.name} onChange={e => {
                              const newList = [...f.priceList]; newList[idx].name = e.target.value; setF({...f, priceList: newList});
                           }} placeholder="項目名稱 (例：體驗潛水)" className="w-full p-2.5 rounded-lg border border-slate-300 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                           <input type="text" value={item.price} onChange={e => {
                              const newList = [...f.priceList]; newList[idx].price = e.target.value; setF({...f, priceList: newList});
                           }} placeholder="價格 (例：NT$ 2,500)" className="w-full p-2.5 rounded-lg border border-slate-300 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                         </div>
                         <input type="text" value={item.desc} onChange={e => {
                              const newList = [...f.priceList]; newList[idx].desc = e.target.value; setF({...f, priceList: newList});
                           }} placeholder="項目說明 (例：含全套裝備、教練1對1)" className="w-full p-2.5 rounded-lg border border-slate-300 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                      </div>
                      <button type="button" onClick={() => {
                          setF({...f, priceList: f.priceList.filter(x => x.id !== item.id)});
                      }} className="p-2.5 bg-white text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg hover:border-red-200 transition-colors shrink-0 self-end sm:self-auto shadow-sm"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {(!f.priceList || f.priceList.length === 0) && (
                     <div className="text-center py-8 text-sm font-bold text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">尚無收費項目，請點擊上方新增</div>
                  )}
               </div>
            </div>
          </ControlPanelCard>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------
// 前台：顧客服務與預約表單組件 (補齊缺失功能)
// --------------------------------------------------------

const ServiceSection = React.memo(function ServiceSection({ title, items, type, onBook, sysConfig, bookings = [] }) {
  const [viewMode, setViewMode] = useState('card');
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const calendarCells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const activitiesByDate = useMemo(() => {
    const map = {};
    if (type === 'activity') {
      items.forEach(act => {
        if (act.date) {
          if (!map[act.date]) map[act.date] = [];
          map[act.date].push(act);
        }
      });
    }
    return map;
  }, [items, type]);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 border-b border-slate-200 pb-4 gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800">{title}</h2>
        
        {type === 'activity' && items.length > 0 && (
          <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto shadow-inner">
            <button onClick={() => setViewMode('card')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${viewMode === 'card' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <ClipboardList className="w-4 h-4"/> 卡片列表
            </button>
            <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <CalendarDays className="w-4 h-4"/> 月曆總覽
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border-2 border-dashed rounded-2xl font-bold bg-white">
          目前暫無可預約的項目
        </div>
      ) : (
        <>
          {type === 'activity' && viewMode === 'calendar' ? (
            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2.5 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-600"/></button>
                <h3 className="font-black text-xl sm:text-2xl text-slate-800 tracking-wider">{year} 年 {month + 1} 月</h3>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2.5 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm"><ChevronRight className="w-5 h-5 text-slate-600"/></button>
              </div>
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/80">
                 {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="py-3 text-center text-xs sm:text-sm font-black text-slate-500 uppercase">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 bg-slate-200 gap-px">
                 {calendarCells.map((day, i) => {
                   if (!day) return <div key={i} className="bg-slate-50/30 min-h-[100px] md:min-h-[140px]"></div>;
                   const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                   const dayActivities = activitiesByDate[dateStr] || [];
                   const isToday = new Date().toISOString().slice(0, 10) === dateStr;

                   return (
                     <div key={i} className={`bg-white min-h-[100px] md:min-h-[140px] p-1.5 md:p-2.5 flex flex-col gap-1.5 transition-colors hover:bg-blue-50/30 ${isToday ? 'ring-2 ring-inset ring-blue-400 bg-blue-50/10' : ''}`}>
                       <div className="flex justify-between items-center px-1 mb-1">
                          <span className={`text-xs sm:text-sm font-black ${isToday ? 'text-white bg-blue-500 px-2 py-0.5 rounded-full' : (dayActivities.length > 0 ? 'text-blue-800' : 'text-slate-400')}`}>{day}</span>
                          {dayActivities.length > 0 && <span className="text-[10px] font-bold text-slate-400 hidden lg:block bg-slate-100 px-1.5 py-0.5 rounded">{dayActivities.length} 場</span>}
                       </div>
                       <div className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar pr-0.5">
                         {dayActivities.map(act => {
                            const totalSlots = parseInt(act.capacity) || 0;
                            const bookedCount = bookings.filter(b => b.type === 'activity' && b.activityId === act.id && b.status !== 'cancelled').length;
                            const remaining = Math.max(0, totalSlots - bookedCount);
                            const isFull = remaining === 0;

                            return (
                              <button key={act.id} onClick={() => onBook(act)} className={`text-left p-2 rounded-xl border flex flex-col gap-1 transition-all hover:-translate-y-px hover:shadow-md group ${act.isCourse ? 'bg-indigo-50/80 border-indigo-100 hover:border-indigo-300' : 'bg-cyan-50/80 border-cyan-100 hover:border-cyan-300'} ${isFull ? 'opacity-60 bg-slate-50 border-slate-200 hover:border-slate-300' : ''}`}>
                                 <span className={`text-[10px] sm:text-xs font-black truncate w-full ${isFull ? 'text-slate-600' : (act.isCourse ? 'text-indigo-800 group-hover:text-indigo-600' : 'text-cyan-800 group-hover:text-cyan-600')}`} title={act.name}>{act.name}</span>
                                 <div className="flex justify-between items-center w-full">
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 hidden 2xl:flex ${act.isCourse ? 'bg-indigo-100 text-indigo-600' : 'bg-cyan-100 text-cyan-600'}`}>
                                       {act.isCourse ? <BookOpen className="w-2.5 h-2.5"/> : <Waves className="w-2.5 h-2.5"/>}
                                       {act.isCourse ? '課程' : '潛水'}
                                    </span>
                                    <span className={`text-[10px] font-bold text-right w-full 2xl:w-auto ${isFull ? 'text-red-500 font-black' : 'text-slate-500'}`}>{isFull ? '額滿' : `剩 ${remaining} 名`}</span>
                                 </div>
                              </button>
                            )
                         })}
                       </div>
                     </div>
                   )
                 })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
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
                  {type === 'activity' && (
                    <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-xs font-black px-3 py-1.5 rounded-bl-xl shadow-sm">
                      {item.isCourse ? '證照課程' : 'FUN DIVE'}
                    </div>
                  )}
                  
                  <div className="flex-1 mt-2">
                    <h3 className="font-bold text-xl text-slate-900 mb-2 pr-16 group-hover:text-blue-700 transition-colors">{String(item.name || item.courseName || '未命名項目')}</h3>
                    
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

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                   <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md">總額: {totalSlots} 人</span>
                   <span className={`text-[11px] font-black px-2 py-1 rounded-md ${remainingSlots > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>剩餘: {remainingSlots} 人</span>
                </div>
                {item.notes && (
                   <div className="mt-4 bg-amber-50/80 rounded-xl border border-amber-200/60 overflow-hidden transition-all duration-300">
                      <button onClick={(e) => { e.stopPropagation(); setIsNotesExpanded(!isNotesExpanded); }} className="w-full flex items-center justify-between p-3.5 hover:bg-amber-100/50 transition-colors group/note outline-none">
                         <span className="text-xs font-black text-amber-700 flex items-center gap-2"><Info className="w-4 h-4 text-amber-500 group-hover/note:scale-110 transition-transform"/> 行前須知與注意事項</span>
                         <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${isNotesExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isNotesExpanded && (
                         <div className="p-4 pt-1 border-t border-amber-200/50 bg-amber-50/50 animate-in slide-in-from-top-2 duration-200">
                            <p className="text-xs font-bold text-amber-800/80 whitespace-pre-wrap leading-relaxed mt-2">{item.notes}</p>
                         </div>
                      )}
                   </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                       {type === 'accommodation' && <span className="text-[10px] font-black text-slate-400 block mb-0.5 tracking-widest uppercase">淡季平日起 (Starting from)</span>}
                       <span className={`${type === 'accommodation' ? 'text-rose-600' : 'text-blue-600'} font-black text-lg md:text-xl`}>
                          NT$ {Number(item.price || item.priceLowWeekday || 0).toLocaleString()}
                       </span>
                    </div>
                    <button 
                      onClick={() => onBook(item)} 
                      disabled={type === 'activity' ? isFull : false}
                      className={`px-5 py-2.5 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 ${(type === 'activity' && isFull) ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none' : type === 'accommodation' ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-500/30' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
                    >
                      {type === 'activity' ? (isFull ? '已額滿' : '立即報名') : <><CalendarDays className="w-4 h-4"/> 選擇日期</>}
                    </button>
                  </div>
                </div>
              )})}
            </div>
          )}
        </>
      )}
    </div>
  );
});

// 專屬客製化：潛水面鏡圖示
const DivingMaskIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 11c0-3.87 3.13-7 7-7h4c3.87 0 7 3.13 7 7v3c0 2.21-1.79 4-4 4h-1.5l-1.5 2h-4l-1.5-2H7c-2.21 0-4-1.79-4-4v-3z" />
    <path d="M12 11v6" />
  </svg>
);

function RegistrationForm({ activity, equipments, onClose, onSubmit, sysConfig, onSuccess }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isTrip = activity.diveCategory === '潛旅';
  const isCourse = activity.isCourse;
  const isDSD = activity.diveCategory === '體驗潛水'; // 判定是否為體驗潛水

  // 動態決定流程步驟：加入潛水圖示，並為體驗潛水略過經驗步驟
  const stepTitles = useMemo(() => {
    if (isCourse) {
      return [
        { num: 1, icon: BookOpen, title: '行前簡報', sub: '課程資訊總覽' },
        { num: 2, icon: DivingMaskIcon, title: '準備下潛', sub: '基本與保險資料' },
        { num: 3, icon: LifeBuoy, title: '海底探索', sub: '裝備配置與加購' },
        { num: 4, icon: CoralIcon, title: '5米停留', sub: '住宿房型選擇' },
        { num: 5, icon: Waves, title: '平安升水', sub: '個人潛水經驗' },
        { num: 6, icon: CheckCircle, title: '潛水日誌', sub: '醫療健康聲明' }
      ];
    }
    if (isDSD) {
      return [
        { num: 1, icon: DivingMaskIcon, title: '準備下潛', sub: '基本與保險資料' },
        { num: 2, icon: LifeBuoy, title: '5米停留', sub: '裝備需求配置' },
        { num: 3, icon: CheckCircle, title: '潛水日誌', sub: '醫療健康聲明' } // DSD 只有 3 步，略過經驗填寫
      ];
    }
    return [
      { num: 1, icon: DivingMaskIcon, title: '準備下潛', sub: '基本與保險資料' },
      { num: 2, icon: LifeBuoy, title: '5米停留', sub: '裝備需求配置' },
      { num: 3, icon: Waves, title: '平安升水', sub: '個人潛水經驗' },
      { num: 4, icon: CheckCircle, title: '潛水日誌', sub: '醫療健康聲明' }
    ];
  }, [isCourse, isDSD]);

  const totalSteps = stepTitles.length;
  
  const isStepOverview = isCourse && step === 1;
  const isStepBasic = (isCourse && step === 2) || (!isCourse && step === 1);
  const isStepEq = (isCourse && step === 3) || (!isCourse && step === 2);
  const isStepAcc = isCourse && step === 4;
  const isStepExp = (isCourse && step === 5) || (!isCourse && !isDSD && step === 3);
  const isStepMedical = (isCourse && step === 6) || (isDSD && step === 3) || (!isCourse && !isDSD && step === 4);

  // Step 1 / 2: 基礎與保險
  const [f, setF] = useState({ name: '', nickname: '', phone: '', idNumber: '', birthday: '', height: '', weight: '', shoeSize: '' });
  const [weights, setWeights] = useState({ w1: 0, w2: 0, w25: 0, w3: 0 });
  const totalWeight = (weights.w1*1) + (weights.w2*2) + (weights.w25*2.5) + (weights.w3*3);

  // 新增: 潛水經驗
  const [exp, setExp] = useState({ certSystem: '無/不適用', certLevel: '無/不適用', loggedDives: '', specialties: [], personalNotes: '' });

  // Step 2: 裝備租借 與 選修加購
  const [useLocalShopEq, setUseLocalShopEq] = useState(false);
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [rentals, setRentals] = useState([]); // { eqId, name, size, category, price }
  const [selectedElectives, setSelectedElectives] = useState([]); // 儲存已勾選的選修項目 ID
  
  // 👉 新增：管理簽證費與收費必修項目的勾選狀態 (預設為勾選，讓顧客自行取消)
  const [requireCert, setRequireCert] = useState(activity.certFee > 0); 
  const [selectedCompulsories, setSelectedCompulsories] = useState(
      (activity.compulsories || []).filter(c => typeof c === 'object' && c.price > 0).map(c => c.id)
  );
  
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
    let rawTotal = 0;
    
    const packs = sysConfig.equipmentPackages || {};
    
    // 👉 新增：計算配件總價 (配件不包含在全套優惠內，須額外計價)
    const accessoryPrice = rentals.filter(r => r.category !== '重裝備' && r.category !== '輕裝備').reduce((sum, r) => sum + r.price, 0);
    
    // 套裝計算
    if (heavyCount >= 2 && lightCount >= 3 && packs.full) {
       rawTotal = packs.full + accessoryPrice;
    } else if (heavyCount >= 2 && packs.heavy) {
       rawTotal = packs.heavy + rentals.filter(r => r.category !== '重裝備').reduce((sum, r) => sum + r.price, 0);
    } else if (lightCount >= 3 && packs.light) {
       rawTotal = packs.light + rentals.filter(r => r.category !== '輕裝備').reduce((sum, r) => sum + r.price, 0);
    } else {
       rawTotal = rentals.reduce((sum, r) => sum + r.price, 0);
    }
    
    // 回客折扣疊加計算
    if (isReturningCustomer) {
      const discountRate = packs.returnCustomerDiscount > 0 ? packs.returnCustomerDiscount : 100;
      rawTotal = Math.round(rawTotal * (discountRate / 100));
    }
    
    return rawTotal;
  };

  // 👉 修改總計金額計算：根據是否勾選來計算簽證與必修費用
  const calculateTotal = () => {
    let total = activity.price + calculateEqPrice();
    if (isCourse && requireCert && activity.certFee) total += activity.certFee;
    if (isCourse && activity.compulsories?.length > 0) {
       activity.compulsories.forEach(comp => {
          if (typeof comp === 'object' && comp.price > 0 && selectedCompulsories.includes(comp.id)) {
              total += comp.price;
          }
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
      // 提取被選中的選修與加購項目詳細資料
      const finalElectives = isCourse && activity.electives ? activity.electives.filter(e => selectedElectives.includes(e.id)) : [];
      const finalCompulsories = isCourse && activity.compulsories ? activity.compulsories.filter(c => typeof c === 'object' && c.price > 0 && selectedCompulsories.includes(c.id)) : [];

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
        // 👉 將勾選的必修與選修合併紀錄至 selectedElectives，供後台一併顯示
        selectedElectives: [...finalCompulsories, ...finalElectives],
        certFee: requireCert ? (activity.certFee || 0) : 0,
        certSystem: requireCert ? (activity.certSystem || '') : '',
        useLocalShopEq,
        isReturningCustomer,
        accOption: isTrip ? 'trip' : accOption,
        divingExperience: isDSD ? null : exp, // 若為體驗潛水，則不傳送潛水經驗資料
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
      } else if (isDSD && accOption === 'upgrade') {
        // 👉 新增：判斷為體驗潛水且需要預訂住宿時，觸發 DSD 專屬優惠 Context
        gotoAcc = true;
        accContext = { type: 'dsd_discount', date: activity.date };
      } else if (!isCourse && !isTrip && accOption === 'upgrade') {
        // 👉 修正：確保一般活動也有點選「需要住宿(upgrade)」才導引至訂房
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
            {stepTitles.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${step >= s.num ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 tracking-widest text-center ${step >= s.num ? 'text-blue-200' : 'text-slate-500'}`}>{s.title}</span>
                </div>
              );
            })}
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

                   {/* 必修與選修區塊 (改為可互動勾選) */}
                   <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 gap-2">
                         <h4 className="font-black text-slate-800 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-purple-500 shrink-0"/> 簽證與額外加購選項
                         </h4>
                         <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg whitespace-nowrap shrink-0">
                            小計: NT$ {(calculateTotal() - activity.price - calculateEqPrice()).toLocaleString()}
                         </span>
                      </div>
                      
                      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
                         {/* 費用大於0的必修項目 */}
                         {activity.compulsories?.filter(c => typeof c === 'object' && c.price > 0).map(comp => (
                           <label key={comp.id} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all shadow-sm ${selectedCompulsories.includes(comp.id) ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}>
                             <div className="flex items-center gap-3">
                               <input type="checkbox" checked={selectedCompulsories.includes(comp.id)} onChange={e => {
                                 if (e.target.checked) setSelectedCompulsories([...selectedCompulsories, comp.id]);
                                 else setSelectedCompulsories(selectedCompulsories.filter(id => id !== comp.id));
                               }} className="w-4 h-4 text-blue-600 rounded" />
                               <span className="font-bold text-slate-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500"/> {comp.name}</span>
                             </div>
                             <span className="font-black text-blue-700 text-sm">+NT$ {Number(comp.price).toLocaleString()}</span>
                           </label>
                         ))}

                         {/* 免費的必修項目 (純展示) */}
                         {activity.compulsories?.filter(c => typeof c === 'string' || (typeof c === 'object' && c.price <= 0)).map((comp, i) => (
                            <div key={`free-${i}`} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-xl opacity-70">
                               <span className="font-bold text-slate-600 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-slate-400"/> {typeof comp === 'string' ? comp : comp.name}</span>
                               <span className="font-black text-slate-500 text-sm">免費/內含</span>
                            </div>
                         ))}

                         {/* 簽證費 */}
                         {activity.certFee > 0 && (
                           <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all shadow-sm ${requireCert ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}>
                             <div className="flex items-center gap-3">
                               <input type="checkbox" checked={requireCert} onChange={e => setRequireCert(e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
                               <span className="font-bold text-slate-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-amber-500"/> {activity.certSystem || '系統'} 簽證費</span>
                             </div>
                             <span className="font-black text-amber-700 text-sm">+NT$ {Number(activity.certFee).toLocaleString()}</span>
                           </label>
                         )}
                         
                         {/* 選修項目 */}
                         {activity.electives?.length > 0 && (
                           <div className="pt-2 border-t border-slate-100 mt-2">
                             <h5 className="text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">可自由加購選修</h5>
                             <div className="grid grid-cols-1 gap-2">
                               {activity.electives.map(el => (
                                 <label key={el.id} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all shadow-sm ${selectedElectives.includes(el.id) ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}>
                                   <div className="flex items-center gap-3">
                                     <input type="checkbox" checked={selectedElectives.includes(el.id)} onChange={(e) => {
                                       if (e.target.checked) setSelectedElectives([...selectedElectives, el.id]);
                                       else setSelectedElectives(selectedElectives.filter(id => id !== el.id));
                                     }} className="w-4 h-4 text-purple-600 rounded" />
                                     <span className="font-bold text-slate-700 text-sm">{el.name}</span>
                                   </div>
                                   <span className="font-black text-purple-700 text-sm">+NT$ {Number(el.price).toLocaleString()}</span>
                                 </label>
                               ))}
                             </div>
                           </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* 備註及注意事項 */}
                {activity.notes && (
                   <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200/60 shadow-sm mt-6">
                      <h4 className="font-black text-amber-900 mb-3 flex items-center gap-2">
                         <Info className="w-5 h-5 text-amber-500"/> 行前須知與注意事項
                      </h4>
                      <p className="text-sm font-bold text-amber-800/90 whitespace-pre-wrap leading-relaxed">
                         {activity.notes}
                      </p>
                   </div>
                )}
              </div>
            )}

            {/* STEP: Basic Data */}
            {isStepBasic && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                
                {/* 👉 新增：非課程活動的備註與注意事項顯示區塊 */}
                {!isCourse && activity.notes && (
                   <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200/60 shadow-sm mb-6">
                      <h4 className="font-black text-amber-900 mb-3 flex items-center gap-2">
                         <Info className="w-5 h-5 text-amber-500"/> 行前須知與注意事項
                      </h4>
                      <p className="text-sm font-bold text-amber-800/90 whitespace-pre-wrap leading-relaxed">
                         {activity.notes}
                      </p>
                   </div>
                )}

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
                  <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 mt-4">
                     <label className="text-sm font-black text-rose-800 block mb-3">需要我們為您安排住宿嗎？</label>
                     <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border border-rose-200">
                           <input type="radio" checked={accOption === 'upgrade'} onChange={() => setAccOption('upgrade')} className="w-4 h-4 text-rose-600" />
                           <span className="font-bold text-sm text-rose-900">需要，請幫我預訂</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border border-rose-200">
                           <input type="radio" checked={accOption === 'self'} onChange={() => setAccOption('self')} className="w-4 h-4 text-rose-600" />
                           <span className="font-bold text-sm text-rose-900">不需要，我已自理</span>
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

                 {/* 課程裝備提示 */}
                 {isCourse && (
                    <div className="space-y-4 mb-8">
                       <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm">
                         <Info className="w-5 h-5 shrink-0" /> 課程費用已包含裝備租借，請安心選擇下方的裝備尺寸。
                       </div>
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
                       <span className="text-xl sm:text-2xl font-black text-blue-600 leading-none">NT$ {calculateEqPrice().toLocaleString()}</span>
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
            {isStepExp && !isDSD && (
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
             className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center justify-between px-6"
          >
            {isSubmitting ? <span className="mx-auto">處理中...</span> : step < totalSteps ? (
               <>
                  <div className="flex flex-col text-left">
                     <span className="text-[10px] text-blue-200 uppercase tracking-widest leading-none mb-1">預估總計 Total</span>
                     <span className="leading-none text-xl">NT$ {calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">下一步 <ChevronRight className="w-5 h-5" /></div>
               </>
            ) : (
               <>
                  <div className="flex flex-col text-left">
                     <span className="text-[10px] text-blue-200 uppercase tracking-widest leading-none mb-1">應繳總計 Total</span>
                     <span className="leading-none text-xl">NT$ {calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1"><CheckCircle className="w-5 h-5"/>確認送出</div>
               </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AccommodationBookingPage({ accommodations, sysConfig, onBook, onBack, context }) {
  const [checkIn, setCheckIn] = useState(context?.date || '');
  const [checkOut, setCheckOut] = useState(() => {
    if (context?.date && context?.days) {
      const d = new Date(context.date);
      d.setDate(d.getDate() + Math.max(1, context.days - 1));
      return d.toLocaleDateString('sv-SE');
    }
    return '';
  });

  const [searchGuests, setSearchGuests] = useState(1); 
  const [f, setF] = useState({ name: '', phone: '' });
  const [cart, setCart] = useState([]); 
  const [courseStudents, setCourseStudents] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendModalData, setRecommendModalData] = useState(null);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diff = Math.round((end - start) / 86400000);
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const fullDaysInRange = useMemo(() => {
    if (!checkIn || nights <= 0) return [];
    const fullDays = [];
    const startDate = new Date(checkIn);
    for (let i = 0; i < nights; i++) {
       const currentDate = new Date(startDate);
       currentDate.setDate(startDate.getDate() + i);
       const y = currentDate.getFullYear();
       const m = currentDate.getMonth() + 1;
       const d = currentDate.getDate();
       const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
       if ((sysConfig.fullDates || []).includes(dateStr)) {
          fullDays.push(dateStr);
       }
    }
    return fullDays;
  }, [checkIn, nights, sysConfig.fullDates]);
  const hasFullDays = fullDaysInRange.length > 0;

  const maxStudents = useMemo(() => cart.reduce((sum, item) => sum + item.guests, 0), [cart]);
  useEffect(() => {
     if (courseStudents > maxStudents) setCourseStudents(Math.max(1, maxStudents));
  }, [maxStudents, courseStudents]);

  const getDiscountInfo = () => {
    if (!context) return null;
    if (context.type === 'activity_discount') return `享活動住宿優惠：${context.discountType === 'percent' ? `打 ${context.discountVal/10} 折` : `折抵 NT$ ${context.discountVal}`}`;
    return null;
  };

  const handleAddToCart = (item) => setCart([...cart, item]);
  const handleRemoveFromCart = (id) => setCart(cart.filter(c => c.id !== id));

  // 升級版：智慧最佳配房演算 (最高 CP 值優先)
  const handleAutoRecommend = () => {
    if (!checkIn || !checkOut || nights <= 0) {
      alert("請先選擇入住與退房日期"); return;
    }
    if (hasFullDays) {
      alert("選擇的日期區間包含滿房日，請重新選擇"); return;
    }
    let remaining = parseInt(searchGuests);
    if (isNaN(remaining) || remaining <= 0) {
      alert("請輸入有效的入住人數"); return;
    }

    // 內部函式：計算指定區間內的實際花費
    const calculateRoomCost = (room, tier, isDorm) => {
        let total = 0;
        const startDate = new Date(checkIn);
        for (let i = 0; i < nights; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const y = currentDate.getFullYear();
            const m = currentDate.getMonth() + 1;
            const d = currentDate.getDate();
            const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayOfWeek = currentDate.getDay();

            const pS = parseInt(sysConfig.peakSeasonStart || '05');
            const pE = parseInt(sysConfig.peakSeasonEnd || '10');
            const isPeak = pS <= pE ? (m >= pS && m <= pE) : (m >= pS || m <= pE);

            let isHoliday = (sysConfig.specialHolidays || []).includes(dateStr);
            if (!isHoliday && sysConfig.holidayRanges) {
              for (const r of sysConfig.holidayRanges) {
                if (dateStr >= r.start && dateStr <= r.end) { isHoliday = true; break; }
              }
            }

            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
            const pricingSource = isDorm ? room : tier;

            if (isHoliday) total += (pricingSource.priceHoliday || 0);
            else if (isPeak) total += (isWeekend ? (pricingSource.pricePeakWeekend || 0) : (pricingSource.pricePeakWeekday || 0));
            else total += (isWeekend ? (pricingSource.priceLowWeekend || 0) : (pricingSource.priceLowWeekday || 0));
        }
        return total;
    };

    // 1. 扁平化所有可選方案並計算其實際成本
    const options = [];
    accommodations.forEach(r => {
        if (r.isDorm) {
            const cost = calculateRoomCost(r, null, true);
            options.push({ type: 'dorm', room: r, guests: 1, cost, available: r.quantity * (r.bedCount || 1) });
        } else {
            const tiers = migrateRoomTiers(r);
            tiers.forEach(t => {
                const cost = calculateRoomCost(r, t, false);
                options.push({ type: 'private', room: r, tier: t, guests: t.guests, cost, available: r.quantity });
            });
        }
    });

    // 依據平均每人成本排序 (優先考慮高 CP 值)
    options.sort((a, b) => (a.cost / a.guests) - (b.cost / b.guests));

    let results = [];
    let iterations = 0;
    const targetGuests = parseInt(searchGuests);

    // 2. 深度優先搜尋 (DFS) 尋找所有組合
    const dfs = (idx, currentGuests, currentCost, currentCombo, roomUsage) => {
        iterations++;
        if (iterations > 5000) return; // 安全機制：防止計算過久
        
        if (currentGuests >= targetGuests) {
            results.push({ combo: [...currentCombo], totalGuests: currentGuests, totalCost: currentCost });
            return;
        }
        if (idx >= options.length) return;

        const opt = options[idx];
        const maxCanPick = opt.available - (roomUsage[opt.room.id] || 0);

        for (let count = 0; count <= maxCanPick; count++) {
            if (count > 0) {
                currentCombo.push({ opt, count });
                roomUsage[opt.room.id] = (roomUsage[opt.room.id] || 0) + count;
            }

            dfs(idx + 1, currentGuests + (opt.guests * count), currentCost + (opt.cost * count), currentCombo, roomUsage);

            if (count > 0) {
                currentCombo.pop();
                roomUsage[opt.room.id] -= count;
            }
        }
    };

    dfs(0, 0, 0, [], {});

    if (results.length === 0) {
        alert("目前的空房不足以容納您設定的人數，請分批預訂或減少人數。");
        return;
    }

    // 3. 排序結果：總價最低優先，若總價相同則取人數剛好的
    results.sort((a, b) => {
        if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
        return a.totalGuests - b.totalGuests;
    });

    // 4. 去除重複的房型組合
    const uniqueResults = [];
    const seenCombos = new Set();
    for (const r of results) {
        const sig = r.combo.map(c => `${c.opt.type}-${c.opt.room.id}-${c.opt.tier ? c.opt.tier.id : 'none'}-${c.count}`).sort().join('|');
        if (!seenCombos.has(sig)) {
            seenCombos.add(sig);
            uniqueResults.push(r);
        }
    }

    // 將最優的前 4 種組合顯示給用戶選擇
    setRecommendModalData(uniqueResults.slice(0, 4));
  };

  // 套用選定的推薦方案
  const applyRecommendation = (combo) => {
      const newCart = [];
      combo.forEach(c => {
          const opt = c.opt;
          if (opt.type === 'dorm') {
              newCart.push({
                  id: Date.now() + Math.random(),
                  room: opt.room,
                  roomCount: c.count,
                  isDorm: true,
                  guests: c.count,
                  extraBeds: 0,
                  planId: null,
                  planName: null,
                  selectedTier: null
              });
          } else {
              newCart.push({
                  id: Date.now() + Math.random(),
                  room: opt.room,
                  roomCount: c.count,
                  isDorm: false,
                  guests: opt.tier.guests * c.count,
                  extraBeds: opt.tier.extraBeds * c.count,
                  planId: opt.tier.id,
                  planName: opt.tier.name,
                  selectedTier: opt.tier
              });
          }
      });
      setCart(newCart);
      setRecommendModalData(null);
  };

  const priceInfo = useMemo(() => {
     if (!checkIn || nights <= 0 || cart.length === 0) return { total: 0, breakdown: [], discountTotal: 0, discountLabel: '', totalRoomCount: 0 };

     let total = 0;
     const dailyAggregated = {};
     let totalRoomCount = 0;
     let dsdDiscountAccumulator = 0; 

     cart.forEach(item => {
         totalRoomCount += item.roomCount;
         const startDate = new Date(checkIn);
         for (let i = 0; i < nights; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const y = currentDate.getFullYear();
            const m = currentDate.getMonth() + 1;
            const d = currentDate.getDate();
            const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayOfWeek = currentDate.getDay();

            const pS = parseInt(sysConfig.peakSeasonStart || '05');
            const pE = parseInt(sysConfig.peakSeasonEnd || '10');
            const isPeak = pS <= pE ? (m >= pS && m <= pE) : (m >= pS || m <= pE);

            let isHoliday = (sysConfig.specialHolidays || []).includes(dateStr);
            if (!isHoliday && sysConfig.holidayRanges) {
              for (const r of sysConfig.holidayRanges) {
                if (dateStr >= r.start && dateStr <= r.end) { isHoliday = true; break; }
              }
            }

            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
            let dailyPrice = 0;
            let priceLabel = '';

            const pricingSource = item.isDorm ? item.room : (item.selectedTier || item.room);

            if (isHoliday) {
               dailyPrice = pricingSource.priceHoliday || 0;
               priceLabel = '連假定價';
            } else if (isPeak) {
               dailyPrice = isWeekend ? (pricingSource.pricePeakWeekend || 0) : (pricingSource.pricePeakWeekday || 0);
               priceLabel = isWeekend ? '旺季假日' : '旺季平日';
            } else {
               dailyPrice = isWeekend ? (pricingSource.priceLowWeekend || 0) : (pricingSource.priceLowWeekday || 0);
               priceLabel = isWeekend ? '淡季假日' : '淡季平日';
            }

            if (context?.type === 'dsd_discount' && item.room.name.includes('背包')) {
               if (dailyPrice > 500) {
                   dsdDiscountAccumulator += (dailyPrice - 500) * item.roomCount;
                   dailyPrice = 500;
                   priceLabel += ' (體驗潛水特惠)';
               }
            }

            const dailyBaseTotal = dailyPrice * item.roomCount;
            const extraBedCost = 0; 
            const subtotal = dailyBaseTotal + extraBedCost;

            total += subtotal;

            if (!dailyAggregated[dateStr]) {
                dailyAggregated[dateStr] = { date: dateStr, label: priceLabel, baseSum: 0, extraBed: 0, subtotal: 0 };
            }
            dailyAggregated[dateStr].baseSum += dailyBaseTotal;
            dailyAggregated[dateStr].extraBed += extraBedCost;
            dailyAggregated[dateStr].subtotal += subtotal;
         }
     });

     const breakdown = Object.values(dailyAggregated).sort((a,b) => a.date.localeCompare(b.date)).map(day => ({
         date: day.date,
         label: day.label,
         base: Math.round(day.baseSum / (totalRoomCount || 1)), 
         extraBed: day.extraBed,
         subtotal: day.subtotal
     }));

     let discountTotal = 0;
     let discountLabel = '';

     if (context?.type === 'course_upgrade') {
         const discountNights = Math.min(nights, Math.max(1, context.days - 1));
         discountTotal = courseStudents * context.baseDeduct * discountNights;
         discountLabel = `學員房型升級折抵 (${courseStudents}人 × ${discountNights}晚)`;
         total -= discountTotal;
     } else if (context?.type === 'activity_discount') {
         if (sysConfig.accDiscountType === 'percent') {
            const ratio = (100 - (sysConfig.accDiscountValue || 100)) / 100;
            discountTotal = total * ratio;
            discountLabel = `活動專屬折扣 (${sysConfig.accDiscountValue}折)`;
            total -= discountTotal;
         } else if (sysConfig.accDiscountType === 'fixed') {
            discountTotal = (sysConfig.accDiscountValue || 0) * nights;
            discountLabel = `活動專屬折扣 (每晚折抵 $${sysConfig.accDiscountValue})`;
            total -= discountTotal;
         }
     } else if (context?.type === 'dsd_discount') {
         discountTotal = dsdDiscountAccumulator;
         discountLabel = `體驗潛水專屬優惠 (背包房床位 $500/晚)`;
     }

     total = Math.max(0, Math.round(total));

     return { total, breakdown, discountTotal: Math.round(discountTotal), discountLabel, totalRoomCount };
  }, [checkIn, nights, cart, sysConfig, context, courseStudents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isSubmitting || hasFullDays || cart.length === 0 || !f.name || !f.phone) return;
    setIsSubmitting(true);
    try {
      const finalDetails = {
          name: f.name,
          phone: f.phone,
          checkIn: checkIn,
          nights: nights,
          roomCount: priceInfo.totalRoomCount,
          guests: cart.reduce((sum, c) => sum + c.guests, 0),
          extraBeds: cart.reduce((sum, c) => sum + c.extraBeds, 0),
          breakdown: priceInfo.breakdown,
          discountTotal: priceInfo.discountTotal,
          discountLabel: priceInfo.discountLabel,
          cart: cart
      };

      if (context?.type === 'course_upgrade') {
          finalDetails.courseStudents = courseStudents;
          finalDetails.courseDeductTotal = priceInfo.discountTotal;
      }

      await onBook({ 
        type: 'accommodation', 
        itemName: cart.map(c => `${c.room.name}${c.planName ? ` (${c.planName})` : ''} × ${c.roomCount}`).join(' + '), 
        price: priceInfo.total,
        name: f.name,
        phone: f.phone,
        details: finalDetails,
        appliedContext: context || null
      });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const currentCartGuests = cart.reduce((sum, c) => sum + c.guests, 0);
  const perPersonPrice = currentCartGuests > 0 ? Math.round(priceInfo.total / currentCartGuests) : 0;

  const todayStr = new Date().toLocaleDateString('en-CA'); 

  return (
    <div className="relative animate-in fade-in duration-500 min-h-[calc(100vh-80px)] pb-24 lg:pb-12">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[3rem]">
         <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-rose-100/50 via-pink-50/30 to-transparent"></div>
         <div className="absolute -top-20 right-[10%] w-[40%] h-[80vh] bg-gradient-to-b from-white/60 to-transparent transform -rotate-[15deg] blur-3xl opacity-80"></div>
         <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] opacity-[0.15] pointer-events-none text-rose-400">
            <StaghornCoralWatermark className="w-full h-full" />
         </div>
         <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] opacity-[0.1] pointer-events-none transform -rotate-45 text-pink-500">
            <StaghornCoralWatermark className="w-full h-full" />
         </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 pt-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 border-b border-rose-200/50 pb-5 mb-6 px-2">
           <button onClick={onBack} className="p-2.5 bg-white/60 backdrop-blur-sm text-rose-700 rounded-full hover:bg-white hover:shadow-md transition-all border border-white shadow-sm"><ChevronLeft className="w-6 h-6"/></button>
           <div>
             <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-pink-700 drop-shadow-sm">住宿預訂 / Accommodation</h2>
             <div className="text-xs md:text-sm font-bold text-rose-800/60 mt-1.5 flex flex-wrap items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                挑選理想房型，系統為您自動試算
                <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md shadow-sm border border-rose-200/50">指定區間：週末、旺季、連假</span>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-8 space-y-8">
             <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white shadow-[0_15px_40px_rgba(244,63,94,0.1)] relative overflow-hidden">
                <h3 className="font-black text-xl text-slate-800 border-b border-rose-100/50 pb-3 mb-5 flex items-center gap-3">
                  <div className="bg-rose-100 p-2 rounded-xl text-rose-600"><CalendarDays className="w-5 h-5"/></div>
                  1. 選擇入住日期與人數
                </h3>
                
                {/* 極簡流線型膠囊搜尋列 (Modern Pill Search Bar) - 解決空間不足與遮擋問題 */}
                <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-2 md:p-3 shadow-[0_8px_30px_rgba(244,63,94,0.08)] border border-rose-50 flex flex-col lg:flex-row gap-2 lg:gap-3 items-stretch relative z-10 transition-all hover:shadow-[0_12px_40px_rgba(244,63,94,0.12)]">
                   <div className="flex-1 grid grid-cols-2 lg:flex lg:flex-row items-stretch bg-slate-50/80 hover:bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100/80 transition-colors relative">
                       
                       <div className="col-span-1 lg:flex-1 px-4 sm:px-6 py-4 relative group cursor-pointer hover:bg-white transition-colors border-r border-b lg:border-b-0 border-slate-200/60 rounded-tl-2xl lg:rounded-l-[2rem]">
                           <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5 block group-hover:text-rose-600 transition-colors">入住 Check-in</label>
                           <input type="date" min={todayStr} required value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full bg-transparent font-black text-slate-800 text-sm sm:text-base outline-none cursor-pointer m-0 p-0" />
                       </div>

                       <div className="col-span-1 lg:flex-1 px-4 sm:px-6 py-4 relative group cursor-pointer hover:bg-white transition-colors border-b lg:border-b-0 lg:border-r border-slate-200/60 rounded-tr-2xl lg:rounded-tr-none flex flex-col justify-center">
                           {/* 浮動 N晚 標籤 (完美跨越中央分隔線) */}
                           <div className="absolute top-1/2 -left-[24px] sm:-left-[28px] -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center">
                               <div className="text-[10px] font-black text-white bg-rose-500 px-3 py-1 rounded-full shadow-md whitespace-nowrap border-[3px] border-white">{nights} 晚</div>
                           </div>
                           <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5 block sm:text-right group-hover:text-rose-600 transition-colors">退房 Check-out</label>
                           <input type="date" min={checkIn || todayStr} required value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full bg-transparent font-black text-slate-800 text-sm sm:text-base outline-none cursor-pointer m-0 p-0 sm:text-right" />
                       </div>
                       
                       <div className="col-span-2 lg:w-40 shrink-0 px-4 sm:px-6 py-4 relative group cursor-pointer hover:bg-white transition-colors rounded-b-2xl lg:rounded-b-none lg:rounded-r-[2rem] flex flex-col justify-center">
                           <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5 block group-hover:text-rose-600 transition-colors">人數 Guests</label>
                           <div className="flex items-center">
                              <input type="number" required min="1" value={searchGuests} onChange={e => setSearchGuests(e.target.value)} className="w-full bg-transparent font-black text-slate-800 text-sm sm:text-base outline-none m-0 p-0" placeholder="例如: 1" />
                           </div>
                       </div>
                   </div>
                   <button onClick={handleAutoRecommend} disabled={hasFullDays || nights <= 0} className="w-full lg:w-auto px-6 py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:from-rose-500 hover:to-rose-400 rounded-2xl md:rounded-[2rem] font-black transition-all shadow-md disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 shrink-0 hover:scale-[1.02]">
                      ✨ 智慧最佳配房
                   </button>
                </div>

                {hasFullDays && (
                  <div className="mt-5 bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2 relative z-10">
                     <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                     <div>
                       <p className="text-sm font-black text-rose-800">區間包含已滿房日期</p>
                       <p className="text-[10px] font-bold text-rose-600 mt-1 leading-relaxed">客滿日期：{fullDaysInRange.join(', ')}<br/>請調整入住/退房日期才能預訂。</p>
                     </div>
                  </div>
                )}
             </div>

             <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-200/50 pb-4">
                   <div className="bg-rose-100 p-2.5 rounded-xl text-rose-600"><Home className="w-6 h-6"/></div>
                   <div>
                      <h3 className="font-black text-xl text-slate-800 leading-tight">2. 選擇您的理想房型</h3>
                      <p className="text-xs font-bold text-slate-500 mt-1">下方顯示各房型資訊，價格會隨選擇的「方案」即時變動</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {accommodations.map(room => {
                     const inCartCount = cart.filter(c => c.room.id === room.id).reduce((sum, c) => sum + c.roomCount, 0);
                     // 傳遞 sysConfig 與 checkIn 屬性，確保卡片能計算動態定價
                     return <AccRoomCard key={room.id} room={room} onAdd={handleAddToCart} hasFullDays={hasFullDays} nights={nights} inCartCount={inCartCount} checkIn={checkIn} sysConfig={sysConfig} />;
                  })}
                </div>
             </div>
          </div>

          <div className="xl:col-span-4 xl:sticky xl:top-24 space-y-6 scroll-mt-24">
             <div className="bg-white/95 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(244,63,94,0.12)] flex flex-col">
               <h3 className="font-black text-xl text-slate-800 border-b border-rose-100/50 pb-4 mb-6 flex items-center gap-3">
                  <div className="bg-pink-100 p-2 rounded-xl text-pink-600"><ClipboardList className="w-5 h-5"/></div> 
                  3. 預訂明細與結帳
               </h3>
               
               <div className="mb-8">
                 <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                   <span>已選房型清單</span>
                   <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-black">{cart.length} 筆</span>
                 </div>
                 
                 {cart.length === 0 ? (
                   <div className="text-center py-12 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-rose-100">
                     <div className="w-14 h-14 bg-white rounded-full shadow-sm text-rose-200 mx-auto mb-4 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6" />
                     </div>
                     <div className="text-sm font-black text-slate-400">尚未選擇任何房型</div>
                     <p className="text-xs font-bold text-slate-400/70 mt-1">請從左側挑選或使用智慧配房</p>
                   </div>
                 ) : (
                   <div className="space-y-3 max-h-[35vh] overflow-y-auto custom-scrollbar pr-2">
                     {cart.map((item) => (
                       <div key={item.id} className="flex items-stretch justify-between bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-rose-300 hover:shadow-md transition-all relative overflow-hidden">
                          <div className="w-1.5 bg-gradient-to-b from-rose-400 to-pink-500 shrink-0"></div>
                          <div className="flex-1 min-w-0 p-4 pr-2 flex items-start gap-3">
                            <div className="bg-rose-50 p-2 rounded-xl text-rose-500 shrink-0 shadow-inner"><Home className="w-4 h-4"/></div>
                            <div>
                               <div className="font-black text-slate-800 text-sm leading-tight mb-1 truncate">{item.room.name}</div>
                               {item.planName && <div className="text-[10px] font-bold text-slate-500 mb-2 truncate">方案: {item.planName}</div>}
                               <div className="flex items-center flex-wrap gap-1.5 mt-1">
                                 <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 shadow-sm">{item.roomCount} 間</span>
                                 <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 shadow-sm">{item.guests} 人</span>
                                 {item.extraBeds > 0 && <span className="text-[10px] font-black bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 text-orange-600 shadow-sm">加 {item.extraBeds} 床</span>}
                               </div>
                            </div>
                          </div>
                          <button type="button" onClick={() => handleRemoveFromCart(item.id)} className="px-4 text-slate-300 hover:text-white hover:bg-red-500 transition-colors shrink-0 flex items-center justify-center">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               {(context && cart.length > 0) && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-5 rounded-2xl space-y-4 shadow-sm mb-8 animate-in slide-in-from-top-2">
                     <div className="flex items-center gap-2">
                       <div className="bg-amber-100 p-1.5 rounded-lg shrink-0"><BookOpen className="w-4 h-4 text-amber-700" /></div>
                       <p className="text-sm font-black text-amber-900">{context.type === 'course_upgrade' ? '課程學員專屬折抵' : context.type === 'dsd_discount' ? '體驗潛水專屬優惠' : '活動專屬優惠'}</p>
                     </div>
                     {context.type === 'course_upgrade' ? (
                       <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                         <span className="text-xs font-bold text-amber-800 pl-1">套用折抵學員數</span>
                         <select value={courseStudents} onChange={e => setCourseStudents(Number(e.target.value))} className="p-2 border border-amber-200 rounded-lg text-sm font-black outline-none bg-amber-50 focus:bg-white cursor-pointer text-amber-900">
                           {Array.from({ length: maxStudents || 1 }, (_, i) => i + 1).map(num => (
                             <option key={num} value={num}>{num} 位</option>
                           ))}
                         </select>
                       </div>
                     ) : context.type === 'dsd_discount' ? (
                       <p className="text-xs font-bold text-amber-800 bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                          享體驗潛水專屬優惠：背包房床位每晚以 NT$ 500 計算
                       </p>
                     ) : (
                       <p className="text-xs font-bold text-amber-800 bg-white p-3 rounded-xl border border-amber-100 shadow-sm">{getDiscountInfo()}</p>
                     )}
                  </div>
               )}

               <div className="space-y-4 mb-8">
                 <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">聯絡資料</h4>
                 <div className="space-y-4">
                   <input type="text" required value={f.name} onChange={v=>setF({...f, name: v.target.value})} placeholder="真實姓名 *" className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:font-medium" />
                   <input type="tel" required value={f.phone} onChange={v=>setF({...f, phone: formatPhoneNumber(v.target.value)})} placeholder="聯絡手機 (09xx-xxx-xxx) *" className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:font-medium" />
                 </div>
               </div>

               <div className="mt-auto border-t-2 border-slate-100 pt-6">
                  <div className="flex justify-between items-end mb-5">
                    <div>
                       <span className="text-sm font-bold text-slate-500 block mb-1">總金額 Total</span>
                       {currentCartGuests > 0 && <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">平均每人 NT$ {perPersonPrice.toLocaleString()}</span>}
                    </div>
                    <div className="text-right">
                      {priceInfo.discountTotal > 0 && <div className="text-[11px] text-rose-600 font-bold mb-1">已扣除優惠 NT$ {priceInfo.discountTotal.toLocaleString()}</div>}
                      <span className="text-3xl font-black text-slate-900 tracking-tight">NT$ {priceInfo.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || hasFullDays || cart.length === 0 || !f.name || !f.phone} 
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-rose-600 hover:shadow-[0_15px_40px_rgba(244,63,94,0.3)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-slate-900"
                  >
                     {isSubmitting ? '預訂處理中... Processing' : cart.length === 0 ? '購物車為空' : (!f.name || !f.phone) ? '請填寫基本資料' : <><CheckCircle className="w-5 h-5"/>確認送出訂單</>}
                  </button>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 智慧配房推薦視窗 */}
      {recommendModalData && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-white max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <span className="text-2xl">✨</span> 智慧配房建議
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-1">系統已為您算出最划算的入住組合方案！</p>
              </div>
              <button onClick={() => setRecommendModalData(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {recommendModalData.map((res, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border-2 transition-all relative ${idx === 0 ? 'bg-rose-50/50 border-rose-400 shadow-[0_5px_20px_rgba(244,63,94,0.15)]' : 'bg-white border-slate-200 hover:border-rose-300'}`}>
                  {idx === 0 && (
                    <div className="absolute -top-3 -right-2 bg-gradient-to-r from-rose-600 to-pink-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md shadow-rose-500/30 animate-bounce">
                      🏆 最高 CP 值
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-black text-2xl text-slate-800 tracking-tight">NT$ {res.totalCost.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">總花費</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        {res.combo.map((c, i) => (
                           <div key={i} className="flex items-start gap-2 text-sm font-bold text-slate-700">
                              <span className="text-rose-500 mt-0.5"><CheckCircle className="w-4 h-4"/></span>
                              <span>
                                {c.opt.room.name} {c.opt.tier ? `(${c.opt.tier.name})` : ''} 
                                <span className="text-rose-600 ml-1">× {c.count} {c.opt.type === 'dorm' ? '床' : '間'}</span>
                              </span>
                           </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-end items-end gap-3 sm:border-l sm:border-slate-100 sm:pl-5 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-500 block mb-0.5">總容納人數</span>
                        <span className={`text-base font-black ${res.totalGuests > parseInt(searchGuests) ? 'text-amber-600' : 'text-teal-600'}`}>
                          {res.totalGuests} 人 {res.totalGuests > parseInt(searchGuests) ? <span className="text-[10px] ml-1 opacity-70">(多 {res.totalGuests - parseInt(searchGuests)} 位)</span> : ''}
                        </span>
                      </div>
                      <button onClick={() => applyRecommendation(res.combo)} className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 hover:shadow-rose-500/30 hover:-translate-y-0.5">
                        套用此組合 <ArrowRight className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccRoomCard({ room, onAdd, hasFullDays, nights, inCartCount = 0, checkIn, sysConfig }) {
  const isDorm = room.isDorm === true;
  const tiers = useMemo(() => migrateRoomTiers(room), [room]);
  const [selectedTierId, setSelectedTierId] = useState(tiers.length > 0 ? tiers[0].id : null);
  const [rc, setRc] = useState(1); // 預訂房數/床數

  const maxUnits = isDorm ? (room.quantity * (room.bedCount || 1)) : room.quantity;
  const availableUnits = Math.max(0, maxUnits - inCartCount);
  const isOutOfStock = availableUnits <= 0;

  const selectedTier = useMemo(() => tiers.find(t => t.id === selectedTierId) || tiers[0], [tiers, selectedTierId]);

  useEffect(() => {
    if (rc > availableUnits && availableUnits > 0) setRc(availableUnits);
    else if (availableUnits <= 0) setRc(0);
    else if (rc <= 0 && availableUnits > 0) setRc(1);
  }, [availableUnits, rc]);

  // 動態計算指定日期區間的平均每晚價格
  const dynamicPrice = useMemo(() => {
      const pricingSource = isDorm ? room : (selectedTier || room);
      if (!checkIn || nights <= 0 || !sysConfig) return pricingSource.priceLowWeekday || 0;

      let total = 0;
      const startDate = new Date(checkIn);
      for (let i = 0; i < nights; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          const y = currentDate.getFullYear();
          const m = currentDate.getMonth() + 1;
          const d = currentDate.getDate();
          const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayOfWeek = currentDate.getDay();

          const pS = parseInt(sysConfig?.peakSeasonStart || '05');
          const pE = parseInt(sysConfig?.peakSeasonEnd || '10');
          const isPeak = pS <= pE ? (m >= pS && m <= pE) : (m >= pS || m <= pE);

          let isHoliday = (sysConfig?.specialHolidays || []).includes(dateStr);
          if (!isHoliday && sysConfig?.holidayRanges) {
              for (const r of sysConfig.holidayRanges) {
                  if (dateStr >= r.start && dateStr <= r.end) { isHoliday = true; break; }
              }
          }

          const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

          if (isHoliday) total += (pricingSource.priceHoliday || 0);
          else if (isPeak) total += (isWeekend ? (pricingSource.pricePeakWeekend || 0) : (pricingSource.pricePeakWeekday || 0));
          else total += (isWeekend ? (pricingSource.priceLowWeekend || 0) : (pricingSource.priceLowWeekday || 0));
      }
      return Math.round(total / nights);
  }, [checkIn, nights, isDorm, room, selectedTier, sysConfig]);

  const hasDates = checkIn && nights > 0;
  const priceLabel = hasDates ? '指定區間均價' : '淡季平日起';
  const priceSubLabel = hasDates ? 'Avg / Night' : 'Starting from';

  // 優化：極簡高質感步進器 (Stepper)
  const Stepper = ({ value, min, max, onChange, label, disabled }) => (
    <div className={`flex items-center justify-between bg-white border ${disabled ? 'border-slate-100 opacity-50' : 'border-slate-200 hover:border-rose-200'} rounded-2xl p-2 pl-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors`}>
       <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-1.5 bg-slate-50/80 rounded-xl p-1 border border-slate-100">
           <button type="button" disabled={disabled || value <= min} onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-lg bg-white text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center font-black transition-all shadow-sm disabled:opacity-30 disabled:shadow-none">-</button>
           <span className="w-6 text-center font-black text-slate-800 text-sm">{value}</span>
           <button type="button" disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 rounded-lg bg-white text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center font-black transition-all shadow-sm disabled:opacity-30 disabled:shadow-none">+</button>
       </div>
    </div>
  );

  return (
      <div className={`bg-white p-2.5 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border transition-all duration-400 flex flex-col h-full relative group overflow-hidden ${isOutOfStock ? 'border-slate-200/50 grayscale-[0.4] opacity-90' : 'border-slate-200/80 hover:border-rose-300 hover:shadow-[0_20px_50px_rgba(244,63,94,0.12)]'}`}>
          
          {/* SOLD OUT 滿房遮罩 */}
          {isOutOfStock && (
              <div className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-[2px] rounded-[2.5rem] bg-white/30">
                  <div className="bg-slate-900/90 backdrop-blur-md text-white font-black px-8 py-3 rounded-2xl transform -rotate-12 text-xl shadow-2xl tracking-[0.2em] border border-slate-700/50 shadow-slate-900/20">SOLD OUT</div>
              </div>
          )}

          {/* 內層容器 */}
          <div className="bg-slate-50/40 rounded-[2rem] p-5 h-full flex flex-col relative overflow-hidden border border-slate-100/50">
              <div className="absolute -bottom-8 -right-8 w-48 h-48 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-700 pointer-events-none transform -rotate-12">
                  <StaghornCoralWatermark className="w-full h-full text-rose-600" />
              </div>

              {/* 標題與標籤區 */}
              <div className="flex justify-between items-start mb-5 relative z-10 gap-4">
                  <div className="flex gap-3 items-start flex-1 min-w-0">
                     <div className="w-11 h-11 bg-white border border-rose-100/80 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm shrink-0 mt-0.5"><Home className="w-5 h-5"/></div>
                     <div className="flex-1 min-w-0">
                         <h3 className="font-black text-xl text-slate-900 group-hover:text-rose-700 transition-colors leading-tight truncate">
                            {room.name}
                         </h3>
                         <div className="flex flex-wrap gap-1.5 mt-2.5">
                             <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shadow-sm flex items-center gap-1 ${availableUnits <= 2 && availableUnits > 0 ? 'bg-orange-50 text-orange-600 border-orange-200/60' : 'bg-white text-slate-600 border-slate-200/60'}`}>
                               {availableUnits <= 2 && availableUnits > 0 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>}
                               {isDorm ? `剩 ${availableUnits} 床` : `剩 ${availableUnits} 間`}
                             </span>
                             <span className="text-[10px] font-black text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200/60 shadow-sm">
                               {isDorm ? '1 人 / 床' : (selectedTier ? `${selectedTier.guests} 人` : `容納 ${room.bedCount} 人`)}
                             </span>
                             {!isDorm && selectedTier?.extraBeds > 0 && (
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60 shadow-sm flex items-center gap-1">
                                   <Plus className="w-3 h-3" /> 含 {selectedTier.extraBeds} 加床
                                </span>
                             )}
                         </div>
                     </div>
                  </div>
              </div>

              {/* 價格標籤 (獨立橫幅) */}
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-rose-100/50 shadow-sm mb-5 relative z-10 group-hover:border-rose-200 transition-colors">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{priceLabel}<br/><span className="text-[8px] text-slate-400">{priceSubLabel}</span></span>
                  <div className="flex items-baseline justify-end gap-0.5">
                      <span className="text-xs font-bold text-rose-500">NT$</span>
                      <span className="text-rose-600 font-black text-2xl leading-none tracking-tight">{Number(dynamicPrice).toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-rose-400 ml-0.5">{isDorm ? '/床' : '/晚'}</span>
                  </div>
              </div>

              {/* 方案選擇選單 */}
              {!isDorm && tiers.length > 0 && (
                  <div className="mb-5 relative z-10">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" /> 選擇入住方案
                      </label>
                      <div className="relative group/select">
                          <select 
                              value={selectedTierId || ''} 
                              onChange={e => setSelectedTierId(e.target.value)}
                              disabled={isOutOfStock}
                              className="w-full p-3.5 pl-4 pr-10 border border-slate-200 group-hover/select:border-rose-300 rounded-xl text-sm font-black outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 bg-white text-slate-800 appearance-none cursor-pointer transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
                          >
                              {tiers.map(t => (
                                  <option key={t.id} value={t.id}>{t.name} (共 {t.guests} 人入住)</option>
                              ))}
                          </select>
                          <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover/select:text-rose-400 pointer-events-none transition-colors" />
                      </div>
                  </div>
              )}

              {/* 數量選擇與按鈕 */}
              <div className="mt-auto relative z-10 pt-2">
                  <Stepper value={rc} min={1} max={availableUnits} onChange={setRc} label={isDorm ? '預訂床位數' : '預訂間數'} disabled={isOutOfStock} />
              </div>
              
              <button 
                  onClick={() => {
                      onAdd({ 
                          id: Date.now() + Math.random(), 
                          room, 
                          roomCount: parseInt(rc)||1, 
                          guests: isDorm ? (parseInt(rc)||1) : (selectedTier ? selectedTier.guests * (parseInt(rc)||1) : 1), 
                          extraBeds: isDorm ? 0 : (selectedTier ? selectedTier.extraBeds * (parseInt(rc)||1) : 0), 
                          isDorm,
                          planId: isDorm ? null : selectedTier?.id,
                          planName: isDorm ? null : selectedTier?.name,
                          selectedTier: isDorm ? null : selectedTier
                      });
                      setRc(1);
                  }} 
                  disabled={hasFullDays || isOutOfStock || availableUnits <= 0 || nights <= 0}
                  className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:bg-rose-600 hover:shadow-[0_10px_25px_rgba(244,63,94,0.3)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-2 relative z-10"
              >
                  <ShoppingCart className="w-5 h-5"/> {isOutOfStock ? '已客滿 Sold Out' : nights <= 0 ? '請先選擇上方日期' : '加入預訂清單'}
              </button>
          </div>
      </div>
  );
}

function AccPromptModal({ onClose, onGoActivities, onGoAccommodations }) {
  return (
    <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden text-center border border-white">
        
        {/* 珊瑚主題背景裝飾 */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-rose-50 to-transparent pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-56 h-56 opacity-[0.12] pointer-events-none transform rotate-12">
           <StaghornCoralWatermark className="w-full h-full text-rose-400" />
        </div>
        <div className="absolute bottom-[-10%] -left-10 w-48 h-48 opacity-[0.08] pointer-events-none transform -rotate-45">
           <StaghornCoralWatermark className="w-full h-full text-pink-500" />
        </div>

        {/* 動態氣泡 (暖色調) */}
        <div className="absolute top-12 left-10 w-6 h-6 bg-rose-200/40 rounded-full blur-[1px] animate-[bounce_3s_infinite]"></div>
        <div className="absolute top-24 right-16 w-3 h-3 bg-pink-200/50 rounded-full animate-[bounce_4s_infinite_0.5s]"></div>

        <div className="relative z-10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner border border-white transform rotate-3 hover:rotate-0 transition-transform">
            <CoralIcon className="w-10 h-10 -rotate-3" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-4">專屬配套優惠提示</h2>
          
          <div className="bg-rose-50/70 border border-rose-100 p-5 rounded-2xl mb-8 shadow-sm">
             <p className="text-slate-600 text-sm font-bold leading-relaxed">
               若您有報名 <span className="text-rose-700 font-black">潛水活動</span> 或 <span className="text-rose-700 font-black">課程</span>，系統已內建專屬的住宿配套優惠，<br className="hidden sm:block"/>您不需要在此單獨預訂房間哦！
             </p>
          </div>
          
          <div className="space-y-3">
            <button onClick={onGoActivities} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              前往查看活動與課程 <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={onGoAccommodations} className="w-full py-4 bg-white text-rose-600 rounded-2xl font-bold hover:bg-rose-50 border-2 border-rose-100 hover:border-rose-300 transition-colors flex items-center justify-center gap-2">
              <CoralIcon className="w-5 h-5" /> 我只想單獨預訂住宿
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
  const [expandedDocs, setExpandedDocs] = useState({});

  const filteredResults = useMemo(() => {
    if (!hasSearched) return [];
    const name = searchName.trim();
    const phoneQuery = searchPhone.replace(/[^\d]/g, ''); // 移除非數字字符，進行高容錯精準備對
    return bookings.filter(b => {
        const matchName = b.name === name || b.details?.name === name;
        const bPhone = String(b.phone || b.details?.phone || '').replace(/[^\d]/g, '');
        const matchPhone = bPhone === phoneQuery;
        return matchName && matchPhone;
    }).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
  }, [bookings, searchName, searchPhone, hasSearched]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchName.trim() || !searchPhone.trim()) return;
    setIsSearching(true);
    setTimeout(() => { setHasSearched(true); setIsSearching(false); }, 500);
  };

  const toggleExpand = (id) => {
    setExpandedDocs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative animate-in fade-in duration-500 max-w-5xl mx-auto pb-20 pt-4">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[4rem]">
         <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-indigo-100/40 via-slate-50/20 to-transparent"></div>
         <div className="absolute top-10 right-[5%] text-indigo-500/10 transform rotate-12"><AbyssRadarIcon className="w-80 h-80" /></div>
         <div className="absolute top-40 left-[5%] text-indigo-500/10 transform -rotate-6"><AbyssExplorerWatermark className="w-64 h-64 opacity-30" /></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <div className="text-center mb-10 pt-4">
          <div className="mx-auto w-20 h-20 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl border border-white transform -rotate-3 hover:rotate-0 transition-transform"><AbyssRadarIcon className="w-10 h-10" /></div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 drop-shadow-sm mb-3">我的預約與報名查詢</h2>
          <div className="text-slate-500 font-bold">請輸入您預約活動、住宿或裝備時填寫的姓名與手機號碼。</div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl p-8 mb-10">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-5 gap-5">
            <div className="sm:col-span-2"><FormInput label="真實姓名 / Name" value={searchName} onChange={setSearchName} placeholder="王小明" required /></div>
            <div className="sm:col-span-2"><FormInput label="聯絡手機 / Phone" type="tel" value={searchPhone} onChange={v => setSearchPhone(formatPhoneNumber(v))} placeholder="09xx-xxx-xxx" required /></div>
            <div className="sm:col-span-1 flex items-end">
              <button type="submit" disabled={isSearching} className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-2">
                {isSearching ? '...' : <Search className="w-5 h-5"/>}
              </button>
            </div>
          </form>
        </div>

        {hasSearched && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4">
              {filteredResults.length > 0 ? filteredResults.map(b => {
                const isExpanded = !!expandedDocs[b.id];
                return (
                  <div key={b.id} className="bg-white rounded-[2rem] border-2 border-slate-50 p-6 md:p-8 shadow-lg group relative overflow-hidden transition-all">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 border-b-2 border-slate-50 pb-6 mb-6">
                      <div>
                        <div className="flex gap-2 items-center mb-2">
                          <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${b.type === 'activity' ? 'bg-blue-50 border-blue-100 text-blue-700' : b.type === 'accommodation' ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-cyan-50 border-cyan-100 text-cyan-700'}`}>
                            {b.type === 'activity' ? '活動課程 / Activity' : b.type === 'accommodation' ? '住宿預約 / Accommodation' : '裝備租借 / Equipment'}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">{formatTs(b.timestamp)}</span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900">{String(b.itemName || '未命名項目')}</h4>
                        
                        <div className="mt-2 text-sm font-bold text-slate-500 flex flex-wrap items-center gap-3">
                           {b.type === 'activity' && b.date && <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-blue-400"/> 活動日期: {b.date}</span>}
                           {b.type === 'accommodation' && b.details?.checkIn && <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-teal-400"/> 入住日期: {b.details.checkIn} ({b.details.nights}晚)</span>}
                           {b.type === 'equipment' && b.details?.date && <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-cyan-400"/> 取件日期: {b.details.date} ({b.details.days}天)</span>}
                        </div>
                      </div>
                      <div className={`px-6 py-2 rounded-2xl text-base font-black border-2 flex items-center justify-center text-center whitespace-nowrap ${b.status === 'confirmed' ? 'bg-green-50 border-green-500 text-green-700' : b.status === 'cancelled' ? 'bg-slate-100 border-slate-400 text-slate-600' : 'bg-amber-50 border-amber-500 text-amber-800'}`}>
                        {b.status === 'confirmed' ? '已確認 / Confirmed' : b.status === 'cancelled' ? '已取消 / Cancelled' : '處理中 / Pending'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-base">
                      <div className="flex flex-col gap-1"><span className="text-xs font-black text-slate-400 uppercase">登記姓名 / Name</span><span className="font-black text-slate-800 text-xl">{b.name || b.details?.name} {b.nickname ? `(${b.nickname})` : ''}</span></div>
                      <div className="flex flex-col gap-1"><span className="text-xs font-black text-slate-400 uppercase">預約金額 / Total</span><span className="font-black text-blue-600 text-2xl">NT$ {b.price}</span></div>
                    </div>

                    <button 
                       onClick={() => toggleExpand(b.id)} 
                       className="mt-6 w-full py-3 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200 hover:border-blue-200"
                    >
                       {isExpanded ? <><ChevronDown className="w-5 h-5 rotate-180 transition-transform" /> 收起詳細資訊</> : <><ClipboardList className="w-5 h-5" /> 查看完整報名與預約資訊</>}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                         {b.type === 'activity' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                               <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  <p className="font-black text-blue-800 border-b border-blue-100 pb-2 mb-3 flex items-center gap-2"><User className="w-4 h-4"/> 報名者詳細資料</p>
                                  <div className="grid grid-cols-2 gap-2">
                                     <p className="text-slate-500 font-bold">證件號碼</p><p className="font-black text-slate-800">{b.idNumber || '未提供'}</p>
                                     <p className="text-slate-500 font-bold">出生日期</p><p className="font-black text-slate-800">{b.birthday || '未提供'}</p>
                                     <p className="text-slate-500 font-bold">身高 / 體重</p><p className="font-black text-slate-800">{b.height} cm / {b.weight} kg</p>
                                     <p className="text-slate-500 font-bold">鞋碼</p><p className="font-black text-slate-800">{b.shoeSize || '未提供'} cm</p>
                                     <p className="text-slate-500 font-bold">配重需求</p><p className="font-black text-slate-800">{((b.weights?.w1||0)*1 + (b.weights?.w2||0)*2 + (b.weights?.w25||0)*2.5 + (b.weights?.w3||0)*3)} kg</p>
                                  </div>
                               </div>
                               <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  <p className="font-black text-blue-800 border-b border-blue-100 pb-2 mb-3 flex items-center gap-2"><ShoppingCart className="w-4 h-4"/> 預約配置與選修</p>
                                  <p className="flex justify-between border-b border-slate-200/50 pb-2"><span className="text-slate-500 font-bold">住宿安排</span> <span className="font-black text-slate-800">{b.accOption === 'trip' ? '依潛旅安排' : b.accOption === 'included' ? '內附背包床' : b.accOption === 'upgrade' ? `升級房型` : b.accOption === 'release' ? '釋出床位' : '住宿自理'}</span></p>
                                  <p className="flex justify-between border-b border-slate-200/50 pb-2"><span className="text-slate-500 font-bold">使用當地裝備</span> <span className="font-black text-slate-800">{b.useLocalShopEq ? '是' : '否'}</span></p>
                                  <div className="pt-1 space-y-1.5">
                                     <p className="text-slate-500 font-bold">選修加購：</p>
                                     <div className="flex flex-wrap gap-1">
                                        {b.selectedElectives?.length > 0 ? b.selectedElectives.map((e, i)=><span key={i} className="text-[11px] bg-purple-100 text-purple-700 font-black px-2 py-0.5 rounded">{e.name}</span>) : <span className="text-sm font-bold text-slate-800">無</span>}
                                     </div>
                                  </div>
                                  <div className="pt-1 space-y-1.5">
                                     <p className="text-slate-500 font-bold">裝備租借：</p>
                                     <div className="flex flex-wrap gap-1">
                                        {b.rentals?.length > 0 ? b.rentals.map((r, i)=><span key={i} className="text-[11px] bg-cyan-100 text-cyan-800 font-black px-2 py-0.5 rounded">{typeof r === 'string' ? r : `${r.name}(${r.size||'F'})`}</span>) : <span className="text-sm font-bold text-slate-800">無 / 自備</span>}
                                     </div>
                                  </div>
                               </div>

                               <div className="md:col-span-2 space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  <p className="font-black text-blue-800 border-b border-blue-100 pb-2 mb-3 flex items-center gap-2"><Waves className="w-4 h-4"/> 潛水經驗與健康聲明</p>
                                  {b.divingExperience ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                                       <div><p className="text-xs text-slate-500 font-bold">證照系統</p><p className="font-black text-slate-800">{b.divingExperience.certSystem}</p></div>
                                       <div><p className="text-xs text-slate-500 font-bold">證照等級</p><p className="font-black text-slate-800">{b.divingExperience.certLevel}</p></div>
                                       <div><p className="text-xs text-slate-500 font-bold">總潛水支數</p><p className="font-black text-slate-800">{b.divingExperience.loggedDives ? `${b.divingExperience.loggedDives} 支` : '未填寫'}</p></div>
                                       <div className="col-span-2 md:col-span-4">
                                          <p className="text-xs text-slate-500 font-bold mb-1">特殊專長</p>
                                          <div className="flex flex-wrap gap-1">
                                             {b.divingExperience.specialties?.length > 0 ? b.divingExperience.specialties.map(s => <span key={s} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-black">{s}</span>) : <span className="font-black text-slate-800 text-sm">無</span>}
                                          </div>
                                       </div>
                                       {b.divingExperience.personalNotes && (
                                         <div className="col-span-2 md:col-span-4 bg-white p-3 rounded-xl border border-slate-200 mt-1">
                                            <p className="text-xs text-slate-500 font-bold mb-1">備註提醒事項</p>
                                            <p className="text-sm font-bold text-slate-800">{b.divingExperience.personalNotes}</p>
                                         </div>
                                       )}
                                    </div>
                                  ) : (
                                    <p className="text-sm font-bold text-slate-400 mb-4">無潛水經驗紀錄</p>
                                  )}
                                  
                                  {b.hasMedicalIssue ? (
                                     <div className="bg-rose-100/50 p-4 rounded-xl border border-rose-200">
                                        <p className="font-black text-rose-800 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> 醫療聲明異常項目 (需醫生證明)：</p>
                                        <ul className="text-rose-700 text-xs space-y-1.5 pl-6 list-disc font-bold">
                                          {(b.medicalIssues || []).map((issue, idx) => (
                                             <li key={idx} className={issue.startsWith('↳') ? 'list-none -ml-4 text-rose-600 mt-1 mb-2' : ''}>{issue}</li>
                                          ))}
                                        </ul>
                                     </div>
                                  ) : b.medicalAnswers ? (
                                     <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-green-700 text-sm font-black flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5"/> 醫療健康聲明評估皆為正常
                                     </div>
                                  ) : (
                                     <p className="text-sm font-bold text-slate-400">無健康聲明紀錄</p>
                                  )}
                               </div>
                            </div>
                         )}

                         {b.type === 'accommodation' && (
                            <div className="space-y-4">
                               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                  <p className="font-black text-teal-800 border-b border-teal-100 pb-2 mb-4 flex items-center gap-2"><Home className="w-4 h-4"/> 住宿預約明細</p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                     <div><p className="text-xs text-slate-500 font-bold mb-1">入住總晚數</p><p className="font-black text-slate-800 text-lg">{b.details?.nights || 1} 晚</p></div>
                                     <div><p className="text-xs text-slate-500 font-bold mb-1">預訂房間數</p><p className="font-black text-slate-800 text-lg">{b.details?.roomCount || 1} 間</p></div>
                                     <div><p className="text-xs text-slate-500 font-bold mb-1">總入住人數</p><p className="font-black text-slate-800 text-lg">{b.details?.guests || 1} 人</p></div>
                                     <div><p className="text-xs text-slate-500 font-bold mb-1">總加床數</p><p className="font-black text-slate-800 text-lg">{b.details?.extraBeds || 0} 床</p></div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                     <p className="text-xs text-slate-500 font-bold">預訂房型清單：</p>
                                     {(b.details?.cart || []).map((cartItem, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                                           <span className="font-black text-slate-800">{cartItem.room?.name || '未知房型'}</span>
                                           <div className="flex gap-2">
                                              <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-black">{cartItem.roomCount} 間</span>
                                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-black">{cartItem.guests} 人</span>
                                              {cartItem.extraBeds > 0 && <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-xs font-black">加 {cartItem.extraBeds} 床</span>}
                                           </div>
                                        </div>
                                     ))}
                                  </div>

                                  {b.details?.discountTotal > 0 && (
                                     <div className="mt-4 bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center">
                                        <span className="font-black text-amber-800 flex items-center gap-2"><BookOpen className="w-4 h-4"/> {b.details.discountLabel}</span>
                                        <span className="font-black text-amber-600">-NT$ {b.details.discountTotal}</span>
                                     </div>
                                  )}
                               </div>
                            </div>
                         )}

                         {b.type === 'equipment' && (
                            <div className="space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                     <p className="font-black text-cyan-800 border-b border-cyan-100 pb-2 mb-3 flex items-center gap-2"><User className="w-4 h-4"/> 租借人體型資訊</p>
                                     <div className="grid grid-cols-2 gap-3">
                                        <div><p className="text-xs text-slate-500 font-bold">身高</p><p className="font-black text-slate-800 text-base">{b.details?.height || '-'} cm</p></div>
                                        <div><p className="text-xs text-slate-500 font-bold">體重</p><p className="font-black text-slate-800 text-base">{b.details?.weight || '-'} kg</p></div>
                                        <div className="col-span-2"><p className="text-xs text-slate-500 font-bold">租借天數</p><p className="font-black text-blue-600 text-base">{b.details?.days || 1} 天</p></div>
                                     </div>
                                  </div>
                                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                     <p className="font-black text-cyan-800 border-b border-cyan-100 pb-2 mb-3 flex items-center gap-2"><LifeBuoy className="w-4 h-4"/> 預留裝備清單</p>
                                     <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                                        {(b.rentals || []).map((r, idx) => (
                                           <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
                                              <span className="font-black text-sm text-slate-800 truncate pr-2">{r.name}</span>
                                              <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded text-xs font-black shrink-0">{r.size || 'F'}</span>
                                           </div>
                                        ))}
                                        {(b.rentals || []).length === 0 && <p className="text-sm font-bold text-slate-400">無裝備資訊</p>}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         )}
                      </div>
                    )}
                  </div>
                );
              }) : <div className="bg-white rounded-[2rem] p-20 text-center shadow-inner font-black text-slate-300">查無相關預約紀錄 / No records found</div>}
           </div>
        )}
      </div>
    </div>
  );
}

const DivingTankIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 閥門與開關手輪 (Valve & Knob) */}
    <path d="M11 2h2v3h-2z" />
    <path d="M13 3h1.5a1 1 0 0 1 0 2H13" />
    {/* 氣瓶主體 (Tank body with smooth shoulders) */}
    <path d="M7 10.5C7 7.46 9.24 5 12 5c2.76 0 5 2.46 5 5.5V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9.5Z" />
    {/* BCD綁帶 (Strap) */}
    <path d="M7 13h10" />
    {/* 防撞底座 (Tank Boot) */}
    <path d="M7 19h10" />
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
    let rawTotal = 0;

    const packs = sysConfig.equipmentPackages || {};
    
    // 👉 新增：計算配件總價 (配件不包含在全套優惠內，須額外計價)
    const accessoryPrice = prepList.filter(r => r.category !== '重裝備' && r.category !== '輕裝備').reduce((sum, r) => sum + r.price, 0);

    // 套裝計算
    if (heavyCount >= 2 && lightCount >= 3 && packs.full) {
       rawTotal = packs.full + accessoryPrice;
    } else if (heavyCount >= 2 && packs.heavy) {
       rawTotal = packs.heavy + prepList.filter(r => r.category !== '重裝備').reduce((sum, r) => sum + r.price, 0);
    } else if (lightCount >= 3 && packs.light) {
       rawTotal = packs.light + prepList.filter(r => r.category !== '輕裝備').reduce((sum, r) => sum + r.price, 0);
    } else {
       rawTotal = prepList.reduce((sum, r) => sum + r.price, 0);
    }

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
    <div className="relative animate-in fade-in duration-500 min-h-screen pb-24 lg:pb-12 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 px-4 sm:px-6 lg:px-8 pt-8 bg-slate-950 text-slate-200 overflow-hidden">
      {/* 深海環境背景 (Dark Ocean Background) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950"></div>
         <div className="absolute -top-20 left-[10%] w-[40%] h-[80vh] bg-gradient-to-b from-cyan-900/20 to-transparent transform rotate-[15deg] blur-3xl opacity-80"></div>
         <div className="absolute top-10 right-[5%] text-cyan-500/10 transform rotate-12"><Waves className="w-80 h-80" /></div>
         <div className="absolute top-40 left-[5%] text-blue-500/10 transform -rotate-6"><Fish className="w-48 h-48" /></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 pt-4 px-2 sm:px-4">
        <div className="flex items-center gap-4 border-b border-cyan-900/50 pb-5 mb-8">
           <button onClick={onBack} className="p-2.5 bg-slate-800/80 backdrop-blur-sm text-cyan-400 rounded-full hover:bg-slate-700 hover:shadow-md transition-all border border-slate-700"><ChevronLeft className="w-6 h-6"/></button>
           <div>
             <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-sm">專業裝備預留 / Equipment Prep</h2>
             <div className="text-xs md:text-sm font-bold text-cyan-400/60 mt-1.5 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>線上選取裝備並預約，到店即可快速取件下水</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左側：AI分析與型錄區 */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
             <div className="bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-slate-700/50 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
               <h3 className="font-black text-xl text-slate-100 border-b border-slate-700/50 pb-3 mb-5 flex items-center gap-3">
                  <div className="bg-slate-800 p-2 rounded-xl text-cyan-400"><Scale className="w-5 h-5"/></div>
                  1. 填寫體型資訊 
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6 relative z-10">
                 <FormInput dark={true} label="身高 (cm)" type="number" value={f.height} onChange={v=>setF({...f, height: v})} placeholder="例: 170" />
                 <FormInput dark={true} label="體重 (kg)" type="number" value={f.weight} onChange={v=>setF({...f, weight: v})} placeholder="例: 65" />
                 <FormInput dark={true} label="鞋碼 (cm)" type="number" value={f.shoeSize} onChange={v=>setF({...f, shoeSize: v})} placeholder="例: 26" />
               </div>
               {f.height && f.weight && (
                 <div className="relative z-10 animate-in slide-in-from-bottom-2">
                   <AISizeAdvisor height={f.height} weight={f.weight} shoeSize={f.shoeSize} showWeight={false} dark={true} />
                 </div>
               )}
             </div>

             <div className="space-y-6">
               <h3 className="font-black text-2xl text-slate-100 flex items-center gap-3">
                  <DivingTankIcon className="w-7 h-7 text-cyan-400 drop-shadow-sm"/> 2. 挑選器材準備下潛
               </h3>
               {['重裝備', '輕裝備', '其他配件'].map(cat => {
                  const catItems = equipments.filter(eq => eq.category === cat);
                  if (catItems.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-4">
                      <h4 className="text-sm font-black text-cyan-400 border-l-4 border-cyan-500 pl-3">{cat}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {catItems.map(eq => {
                          const availableSpecs = eq.hasSpecs ? eq.specDetails?.filter(s => s.ready > 0) : [];
                          const isOutOfStock = eq.hasSpecs ? availableSpecs.length === 0 : eq.readyQuantity <= 0;

                          return (
                          <div key={eq.id} className="p-5 rounded-[1.5rem] border border-slate-700/80 hover:border-cyan-500/50 hover:shadow-[0_10px_30px_rgba(6,182,212,0.1)] transition-all duration-300 flex flex-col gap-4 bg-slate-800/40 backdrop-blur-md group">
                             <div className="flex justify-between items-start">
                               <span className="font-black text-slate-200 text-lg leading-snug pr-2 group-hover:text-cyan-300 transition-colors">{String(eq.name)}</span>
                               <span className="text-[11px] font-black text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-400 px-2.5 py-1 rounded-lg shrink-0 shadow-sm">NT$ {eq.price}/晚</span>
                             </div>
                             <div className="mt-auto">
                               {eq.hasSpecs ? (
                                  <div className="relative">
                                    <select 
                                      value={selectedSizes[eq.id] || (availableSpecs[0]?.name || '')} 
                                      onChange={e => setSelectedSizes({...selectedSizes, [eq.id]: e.target.value})} 
                                      disabled={isOutOfStock}
                                      className="w-full p-3 pl-4 pr-10 border border-slate-600 rounded-xl text-sm font-bold outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 bg-slate-900/80 shadow-inner text-slate-200 disabled:opacity-50 disabled:bg-slate-800 appearance-none cursor-pointer transition-all"
                                    >
                                       {availableSpecs.map(spec => (
                                            <option key={spec.id} value={spec.name}>{spec.name} (庫存: {spec.ready})</option>
                                       ))}
                                       {isOutOfStock && <option value="">尺寸皆已租借一空</option>}
                                    </select>
                                    {!isOutOfStock && <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none" />}
                                  </div>
                               ) : (
                                  <div className="text-sm text-slate-400 font-bold p-3 bg-slate-900/80 rounded-xl text-center border border-slate-700 shadow-inner">
                                     單一規格 (F) {isOutOfStock ? <span className="text-red-400 ml-1">- 已租借一空</span> : <span className="text-cyan-400 ml-1"> (庫存: {eq.readyQuantity})</span>}
                                  </div>
                               )}
                             </div>
                             <button 
                               type="button" disabled={isOutOfStock} onClick={() => handleAddToPrep(eq)} 
                               className="w-full py-3.5 bg-slate-700 hover:bg-cyan-600 text-slate-200 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-[0_5px_15px_rgba(6,182,212,0.3)] border border-slate-600 hover:border-transparent"
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
             <form id="checkout-form" onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] lg:sticky lg:top-24 scroll-mt-24">
               <h3 className="font-black text-xl text-slate-100 border-b border-slate-700 pb-4 mb-6 flex items-center gap-3">
                  <div className="bg-slate-800 p-2 rounded-xl text-cyan-400"><DivingTankIcon className="w-5 h-5"/></div> 
                  3. 器材準備區與結帳
               </h3>
               
               <div className="mb-6">
                 <div className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                   <span>預留清單 (Prep List)</span>
                   <span className="bg-slate-800 text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-900">{prepList.length} 件</span>
                 </div>
                 
                 {prepList.length === 0 ? (
                   <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                     <DivingTankIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                     <div className="text-sm font-bold text-slate-500">準備區尚無裝備</div>
                   </div>
                 ) : (
                   <div className="space-y-3 max-h-[35vh] overflow-y-auto custom-scrollbar pr-2">
                     {prepList.map((item) => (
                       <div key={item.id} className="flex items-center justify-between bg-slate-800/80 p-3.5 rounded-[1.25rem] border border-slate-700 shadow-sm group hover:border-cyan-500/50 hover:bg-slate-800 transition-all">
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="font-bold text-slate-200 text-sm truncate">{item.name}</div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-black bg-slate-900 px-2 py-0.5 rounded-md text-slate-400 border border-slate-700">規格: {item.size}</span>
                              <span className="text-[10px] font-black text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded-md">NT$ {item.price}</span>
                            </div>
                          </div>
                          <button type="button" onClick={() => handleRemoveFromPrep(item.id)} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-xl transition-colors shrink-0">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               <div className="space-y-5 border-t border-slate-700 pt-6">
                 <div className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-1">租借人與取件資訊</div>
                 <div className="grid grid-cols-2 gap-4">
                   <FormInput dark={true} label="取件日 / Date *" required type="date" value={f.date} onChange={v=>setF({...f, date: v})} />
                   <FormInput dark={true} label="天數 / Days *" required type="number" value={f.days} onChange={v=>setF({...f, days: v === '' ? '' : Math.max(1, parseInt(v))})} />
                 </div>
                 <FormInput dark={true} label="真實姓名 / Full Name *" required value={f.name} onChange={v=>setF({...f, name: v})} placeholder="請填寫姓名" />
                 <FormInput dark={true} label="手機號碼 / Mobile Phone *" required type="tel" value={f.phone} onChange={v=>setF({...f, phone: formatPhoneNumber(v)})} placeholder="09xx-xxx-xxx" />
                 
                 <label className="flex items-center gap-3 p-4 bg-slate-800 border border-orange-900/50 rounded-xl cursor-pointer shadow-sm transition-all hover:bg-slate-700 hover:-translate-y-0.5 mt-2 group">
                     <input type="checkbox" checked={isReturningCustomer} onChange={e => setIsReturningCustomer(e.target.checked)} className="w-5 h-5 text-orange-500 rounded border-slate-600 bg-slate-900 shrink-0" />
                     <div>
                       <span className="font-black text-orange-400 text-sm block group-hover:text-orange-300 transition-colors">我是回客 / Returning Customer</span>
                       <span className="text-[10px] font-bold text-orange-500/70 mt-0.5 block">勾選享專屬裝備折扣！</span>
                     </div>
                 </label>
               </div>

               <div className="pt-6 mt-6 border-t-2 border-slate-700">
                  <div className="flex justify-between items-end mb-5">
                    <span className="text-sm font-bold text-slate-400">預估總額 / Total</span>
                    <div className="text-right">
                      <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">NT$ {calculateEqPrice()}</span>
                      {(f.days > 1) && <div className="text-[10px] text-cyan-500 font-bold mt-1 bg-cyan-900/30 inline-block px-2 py-0.5 rounded-full border border-cyan-900/50">已乘上天數 / Multiplied by {f.days} days</div>}
                    </div>
                  </div>
                  <button 
                    type="submit" form="checkout-form" disabled={isSubmitting || prepList.length === 0} 
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-black shadow-[0_10px_20px_rgba(6,182,212,0.2)] hover:shadow-[0_15px_30px_rgba(6,182,212,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false); // 新增狀態：記錄是否已經驗證過管理員身分
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
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const hasSeeded = useRef(false);

  const [showAccPromptModal, setShowAccPromptModal] = useState(false);
  const [pendingAccAction, setPendingAccAction] = useState(null); // 用於儲存帶有折扣 Context 的跳轉狀態
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
        // 權限判定：檢查 /artifacts/{appId}/public/data/admins/ 是否有對應 UID
        if (u && !u.isAnonymous) {
          const adminDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admins', u.uid));
          setIsVerifiedAdmin(adminDoc.exists());
          // 註解掉直接切換 isAdminMode 的行為，確保畫面一律先顯示前台
        } else { 
          setIsVerifiedAdmin(false);
          setIsAdminMode(false); 
        }
    });
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
    // 💡 新增：只有管理員才執行清理動作，避免觸發 Firebase 權限報錯
    if (!isAdminMode) return; 

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
  }, [equipmentsList, accommodations, courseTemplates, isAdminMode]);

  // 閒置自動登出 (15分鐘)
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
    setIsAdminMode(false); setIsVerifiedAdmin(false); setCurrentView('home'); window.scrollTo(0,0);
  };

  useEffect(() => {
    const seed = async () => {
      // 💡 新增 isAdminMode 判斷：只有管理員登入後，才允許執行預設資料的建立 (Seed)
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
        await addDoc(rRef, { name: '背包客房', quantity: 1, bedCount: 6, isDorm: true, priceLowWeekday: 500, priceLowWeekend: 600, pricePeakWeekday: 700, pricePeakWeekend: 800, priceHoliday: 1000, priceExtraBed: 0 });
        
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
    if (!isAdminMode) {
      // 已經登入過管理員則免密碼直接切換
      if (isVerifiedAdmin) {
        setIsAdminMode(true);
        setLastActivity(Date.now());
      } else {
        setShowLoginModal(true);
      }
    } else {
      handleLogout();
    }
  };

  const verifyAdmin = (success) => {
    if (success) {
      setIsVerifiedAdmin(true);
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
                {/* 1. 陽光海面與鯨鯊 HERO 區塊 (俯視海面全新設計) */}
                <div className="rounded-[3rem] overflow-hidden text-white p-8 md:p-12 lg:p-16 relative shadow-[0_30px_60px_rgba(6,182,212,0.3)] bg-cyan-500 min-h-[450px] flex items-center group border border-cyan-300/50">
                  
                  {/* 俯視陽光海面漸層 (Top-down Sunlight Ocean) */}
                  <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,#a5f3fc_0%,#06b6d4_40%,#0284c7_70%,#082f49_100%)] opacity-95"></div>
                  
                  {/* 陽光直射中心高光 */}
                  <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6)_0%,transparent_50%)] pointer-events-none mix-blend-overlay animate-[pulse_5s_ease-in-out_infinite]"></div>

                  {/* 水面波紋動態 (Surface Ripples) */}
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                     <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -ml-[400px] -mt-[400px] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(255,255,255,0.2)_45%,transparent_50%)] rounded-full animate-[ripple_8s_ease-out_infinite]"></div>
                     <div className="absolute top-1/3 left-2/3 w-[600px] h-[600px] -ml-[300px] -mt-[300px] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(255,255,255,0.15)_45%,transparent_50%)] rounded-full animate-[ripple_6s_ease-out_infinite_2s]"></div>
                     <div className="absolute top-2/3 left-1/4 w-[1000px] h-[1000px] -ml-[500px] -mt-[500px] bg-[radial-gradient(circle_at_center,transparent_45%,rgba(255,255,255,0.1)_50%,transparent_55%)] rounded-full animate-[ripple_10s_ease-out_infinite_4s]"></div>
                  </div>

                  {/* 俯視鯨鯊群 (Top-down Whale Sharks) */}
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                     {/* 鯨鯊 1 (深水層，較小較模糊) */}
                     <div className="absolute top-[10%] opacity-30 animate-[swim-diagonal-1_28s_linear_infinite]">
                        <WhaleSharkTopDownIcon className="w-[180px] h-[300px] transform rotate-[135deg] blur-[2px]" />
                     </div>
                     {/* 鯨鯊 2 (淺水層，較大較清晰) */}
                     <div className="absolute top-[50%] opacity-60 animate-[swim-diagonal-1_22s_linear_infinite_5s]">
                        <WhaleSharkTopDownIcon className="w-[300px] h-[500px] transform rotate-[120deg] blur-[0.5px]" />
                     </div>
                     {/* 鯨鯊 3 (另一方向) */}
                     <div className="absolute bottom-[20%] opacity-20 animate-[swim-diagonal-2_35s_linear_infinite_2s]">
                        <WhaleSharkTopDownIcon className="w-[240px] h-[400px] transform -rotate-[45deg] blur-[1px]" />
                     </div>
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

                    {/* 保證顯示：懸浮於 HERO 區塊的精緻收費小面板 (加寬優化版) */}
                    <div className="w-full lg:w-[420px] xl:w-[460px] bg-slate-900/60 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 shadow-2xl relative z-30 transform transition-all duration-500 hover:scale-[1.02] mt-6 lg:mt-0 shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-[2rem] pointer-events-none"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                           <div className="flex items-center gap-2.5">
                             <div className="bg-cyan-500/30 p-2 rounded-lg text-cyan-300"><CircleDollarSign className="w-5 h-5"/></div>
                             <h3 className="font-black text-white text-lg tracking-wide">活動與收費</h3>
                           </div>
                        </div>
                        
                        {/* 新增預約流程提示 */}
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
                            <div className="text-center py-8 text-slate-400 text-sm font-bold border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/30">
                              目前尚無收費項目
                            </div>
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
              
              {/* 💡 修正：將 bookings 屬性傳遞給 ActivityAdminPanel，讓它可以計算剩餘名額 */}
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
      
      {/* 補充全域背景動態 (支援 HERO 俯視海面動畫) */}
      <style>{`
        @keyframes wave { 0% { transform: translateX(0); } 50% { transform: translateX(-3%) scaleY(1.05); } 100% { transform: translateX(0); } }
        @keyframes float-up {
          0% { transform: translateY(50px) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-400px) scale(1.5); opacity: 0; }
        }
        @keyframes swim-across {
          0% { left: -30%; opacity: 0; transform: translateY(10%) scale(0.8); }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { left: 120%; opacity: 0; transform: translateY(-10%) scale(1.2); }
        }
        @keyframes ripple {
          0% { transform: scale(0.2); opacity: 0; }
          20% { opacity: 0.3; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes swim-diagonal-1 {
          0% { top: -20%; left: -20%; opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { top: 120%; left: 120%; opacity: 0; }
        }
        @keyframes swim-diagonal-2 {
          0% { top: 120%; right: -20%; opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { top: -20%; right: 120%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default App;