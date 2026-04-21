import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Waves, Home, LifeBuoy, CalendarDays, User, Settings, ClipboardList, CheckCircle, Clock, X, Menu, ChevronRight, ChevronLeft, ChevronDown, Plus, Trash2, Edit3, Save, AlertTriangle, PenTool, Phone, MessageCircle, MapPin, Scale, Info, Check, ArrowRight, ShoppingCart, Search, BookOpen, Fish, Lock, KeyRound, Download } from 'lucide-react';
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
