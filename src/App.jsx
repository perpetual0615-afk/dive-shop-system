import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Waves, Home, LifeBuoy, CalendarDays, User, Settings, ClipboardList, CheckCircle, Clock, X, Menu, ChevronRight, ChevronLeft, ChevronDown, Plus, Trash2, Edit3, Save, AlertTriangle, PenTool, Phone, MessageCircle, MapPin, Scale, Info, Check, ArrowRight, ShoppingCart, Search, BookOpen, Fish, Lock, KeyRound, Download } from 'lucide-react';
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

// --- 預設資料 ---
const DEFAULT_MEDICAL_FORM = [
  { id: 1, text: "一、您的肺部/呼吸系統、心臟/血液系統是否有任何狀況或病史？", subItems: [{ id: 11, text: "1. 曾罹患氣喘、氣胸，或過去12個月內曾出現喘息等呼吸困難症狀？" }, { id: 12, text: "2. 曾接受過胸部、肺部或心臟/血管手術？" }, { id: 13, text: "3. 曾有心臟病發作、心律不整、中風，或目前正服用治療血壓、心血管疾病的藥物？" }, { id: 14, text: "4. 曾因呼吸道疾病（如嚴重過敏、支氣管炎）需要看診或接受治療？" }]},
  { id: 2, text: "二、您是否年滿 45 歲，且符合以下任一健康狀況？", subItems: [{ id: 21, text: "1. 目前有抽菸習慣（包含紙菸、雪茄或電子菸）？" }, { id: 22, text: "2. 患有高血壓或膽固醇過高？" }, { id: 23, text: "3. 有心臟病或中風的家族病史？" }, { id: 24, text: "4. 患有糖尿病？" }]},
  { id: 3, text: "三、您是否曾有眼睛、耳朵、鼻腔或鼻竇的疾病與手術病史？", subItems: [{ id: 31, text: "1. 過去6個月內曾接受過眼睛、耳朵或鼻竇手術？" }, { id: 32, text: "2. 曾有過反覆性中耳炎、鼻竇炎或平衡障礙問題？" }, { id: 33, text: "3. 在搭乘飛機或前往高海拔地區時，曾有嚴重的耳朵/鼻竇氣壓性擠壓傷？" }]},
  { id: 4, text: "四、您是否有神經系統、腦部或心理健康的狀況？", subItems: [{ id: 41, text: "1. 曾有癲癇、抽搐，或目前正在服用預防性藥物？" }, { id: 42, text: "2. 曾有不明原因的暈厥、意識喪失或嚴重的偏頭痛？" }, { id: 43, text: "3. 曾被診斷出患有恐慌症、幽閉恐懼症、廣場恐懼症或嚴重憂鬱症？" }]},
  { id: 5, text: "五、您是否曾有過胃腸、腸道疾病，或骨骼肌肉問題？", subItems: [{ id: 51, text: "1. 曾有嚴重的胃食道逆流或潰瘍，並需要接受治療？" }, { id: 52, text: "2. 過去6個月內曾接受過腹部或胃腸道手術？" }, { id: 53, text: "3. 曾有背部、關節或脊椎的問題，且目前仍會因負重或運動感到不適？" }]},
  { id: 6, text: "六、其他重要的醫療與生理狀況", subItems: [{ id: 61, text: "1. 您目前是否懷孕，或者正在計畫懷孕？" }, { id: 62, text: "2. 您是否有過潛水減壓病（DCI）或其他潛水意外的病史？" }, { id: 63, text: "3. 除避孕藥或防瘧疾藥物外，您目前是否正在服用任何處方箋藥物？" }, { id: 64, text: "4. 您是否有任何會影響身體代謝的疾病（如糖尿病、甲狀腺異常）？" }]}
];

const DEFAULT_SERVICES = [
  '🛏️ 背包房床位', '🥪 提供早午餐', '📃 潛水意外責任險', '🚗 提供潛店到潛點的接駁', '👤 教練１對４人以下指導'
];

// ============================================================================
// 效能優化區：SVG 與 UI 基礎元件 (避免打字時背景不斷重繪卡頓)
// ============================================================================

const StaghornCoralWatermark = React.memo(({ className }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="coralGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BE123C" /><stop offset="50%" stopColor="#F43F5E" /><stop offset="100%" stopColor="#FDA4AF" />
      </linearGradient>
      <linearGradient id="coralAccent" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#9D174D" /><stop offset="100%" stopColor="#FBCFE8" />
      </linearGradient>
    </defs>
    <g style={{ transformOrigin: '60px 120px' }} stroke="#FDA4AF" strokeLinecap="round" opacity="0.4">
      <animateTransform attributeName="transform" type="rotate" values="-4; 4; -4" dur="7s" repeatCount="indefinite" ease="ease-in-out" />
      <path d="M60 120 Q 35 90 10 50 M60 120 Q 45 70 25 15 M60 120 Q 75 70 95 15 M60 120 Q 85 90 110 50" strokeWidth="3" />
      <path d="M22 80 Q 60 65 98 80 M13 55 Q 60 30 107 55 M27 30 Q 60 10 93 30" strokeWidth="2" strokeDasharray="3 5" />
    </g>
    <g style={{ transformOrigin: '60px 110px' }} strokeLinecap="round" strokeLinejoin="round">
      <animateTransform attributeName="transform" type="rotate" values="2; -2; 2" dur="5s" repeatCount="indefinite" ease="ease-in-out" />
      <path d="M60 120 C 50 80 20 60 15 25 M60 120 C 70 80 100 60 105 25 M60 120 C 55 70 35 40 45 10 M60 120 C 65 70 85 40 75 10 M60 120 V 30 M35 70 Q 20 50 5 45 M85 70 Q 100 50 115 45" stroke="#FFF" strokeWidth="12" opacity="0.25" filter="blur(2px)" />
      <path d="M60 120 C 50 80 20 60 15 25" stroke="url(#coralGrad)" strokeWidth="8" opacity="0.95" />
      <path d="M60 120 C 70 80 100 60 105 25" stroke="url(#coralGrad)" strokeWidth="8" opacity="0.95" />
      <path d="M60 120 C 55 70 35 40 45 10" stroke="url(#coralAccent)" strokeWidth="7" opacity="0.9" />
      <path d="M60 120 C 65 70 85 40 75 10" stroke="url(#coralAccent)" strokeWidth="7" opacity="0.9" />
      <path d="M60 120 V 30" stroke="url(#coralGrad)" strokeWidth="9" opacity="0.95" />
      <path d="M35 70 Q 20 50 5 45" stroke="url(#coralGrad)" strokeWidth="5.5" />
      <path d="M85 70 Q 100 50 115 45" stroke="url(#coralGrad)" strokeWidth="5.5" />
      <path d="M50 50 Q 30 30 25 15" stroke="url(#coralAccent)" strokeWidth="4.5" />
      <path d="M70 50 Q 90 30 95 15" stroke="url(#coralAccent)" strokeWidth="4.5" />
      <g stroke="#FFF" strokeWidth="2.5" strokeDasharray="2 6" opacity="0.5"><path d="M60 115 C 50 80 20 60 15 25 M60 115 C 70 80 100 60 105 25 M60 115 V 30" /></g>
      <g fill="#FFF" opacity="0.9"><circle cx="15" cy="25" r="4.5" /><circle cx="105" cy="25" r="4.5" /><circle cx="45" cy="10" r="4" /><circle cx="75" cy="10" r="4" /><circle cx="60" cy="30" r="4.5" /><circle cx="5" cy="45" r="3.5" /><circle cx="115" cy="45" r="3.5" /><circle cx="25" cy="15" r="3" /><circle cx="95" cy="15" r="3" /></g>
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
));

const DivingGearWatermark = React.memo(({ className }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="tankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0891B2" /><stop offset="50%" stopColor="#22D3EE" /><stop offset="100%" stopColor="#164E63" />
      </linearGradient>
      <linearGradient id="bcdGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" /><stop offset="50%" stopColor="#1E293B" /><stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="bcdHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38BDF8" /><stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    <g>
      <animateTransform attributeName="transform" type="translate" values="0,3; 0,-3; 0,3" dur="5s" repeatCount="indefinite" ease="ease-in-out" />
      <rect x="50" y="10" width="28" height="90" rx="14" fill="url(#tankGrad)" opacity="0.95" />
      <path d="M58 4 H 70 V 10 H 58 Z" fill="#94A3B8" opacity="0.9" />
      <rect x="61" y="0" width="6" height="4" rx="1" fill="#475569" />
      <rect x="50" y="80" width="28" height="15" fill="#000000" opacity="0.5" />
      <g opacity="0.95">
        <path d="M35 30 C 35 15, 50 15, 55 30 C 60 50, 40 60, 35 80" fill="none" stroke="url(#bcdGrad)" strokeWidth="12" strokeLinecap="round" />
        <path d="M93 30 C 93 15, 78 15, 73 30 C 68 50, 88 60, 93 80" fill="none" stroke="url(#bcdGrad)" strokeWidth="12" strokeLinecap="round" />
        <path d="M25 70 C 25 60, 103 60, 103 70 V 95 C 103 105, 25 105, 25 95 Z" fill="url(#bcdGrad)" />
        <path d="M32 75 V 90 M 96 75 V 90" stroke="url(#bcdHighlight)" strokeWidth="3" strokeLinecap="round" />
        <path d="M45 70 V 95 M 83 70 V 95" stroke="#000" strokeWidth="2" opacity="0.3" />
        <line x1="45" y1="45" x2="83" y2="45" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
        <path d="M45 20 Q 30 35, 35 60" fill="none" stroke="#475569" strokeWidth="5" strokeDasharray="3 2" />
        <circle cx="35" cy="62" r="4" fill="#0EA5E9" />
        <circle cx="85" cy="40" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <path d="M85 33 Q 95 20, 70 10" fill="none" stroke="#64748B" strokeWidth="3" />
      </g>
    </g>
    <circle cx="85" cy="30" r="4" fill="#BAE6FD" opacity="0.7">
      <animate attributeName="cy" values="30; -10" dur="2s" repeatCount="indefinite" />
      <animate attributeName="cx" values="85; 80; 90; 85" dur="1.2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0; 0.7; 0" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
));

const AbyssExplorerWatermark = React.memo(({ className }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="abyssBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4338CA" /><stop offset="100%" stopColor="#312E81" />
      </linearGradient>
      <radialGradient id="sonarGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" /><stop offset="100%" stopColor="#3730A3" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="scanBeam" x1="50%" y1="50%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" /><stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
      </linearGradient>
    </defs>
    <g style={{ transformOrigin: '60px 60px' }}>
      <circle cx="60" cy="60" r="50" stroke="#4F46E5" strokeWidth="1" strokeDasharray="2 4" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="20s" repeatCount="indefinite" linear="true" />
      </circle>
      <circle cx="60" cy="60" r="35" stroke="#6366F1" strokeWidth="1" opacity="0.6" />
      <circle cx="60" cy="60" r="20" stroke="#818CF8" strokeWidth="1" strokeDasharray="1 3" opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="15s" repeatCount="indefinite" linear="true" />
      </circle>
    </g>
    <line x1="60" y1="5" x2="60" y2="115" stroke="#4F46E5" strokeWidth="1" opacity="0.4" />
    <line x1="5" y1="60" x2="115" y2="60" stroke="#4F46E5" strokeWidth="1" opacity="0.4" />
    <circle cx="60" cy="60" r="2" fill="#818CF8" />
    <g style={{ transformOrigin: '60px 60px' }}>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
      <path d="M 60 60 L 60 10 A 50 50 0 0 1 103.3 35 Z" fill="url(#scanBeam)" opacity="0.3" />
      <line x1="60" y1="60" x2="60" y2="10" stroke="#818CF8" strokeWidth="2" opacity="0.8">
        <animate attributeName="opacity" values="0.8; 0.3; 0.8" dur="2s" repeatCount="indefinite" />
      </line>
    </g>
    <g opacity="0.9">
      <animateTransform attributeName="transform" type="translate" values="0,-3; 0,3; 0,-3" dur="4s" repeatCount="indefinite" ease="ease-in-out" />
      <rect x="42" y="52" width="24" height="14" rx="4" fill="#1E1B4B" stroke="#A5B4FC" strokeWidth="1.5" />
      <path d="M 44 52 Q 54 42 64 52" fill="none" stroke="#818CF8" strokeWidth="1.5" />
      <circle cx="54" cy="48" r="1.5" fill="#6366F1" />
      <rect x="38" y="56" width="4" height="6" rx="1" fill="#4F46E5" />
      <rect x="66" y="56" width="4" height="6" rx="1" fill="#4F46E5" />
      <path d="M 36 57 Q 34 59 36 61" stroke="#818CF8" strokeWidth="1" fill="none" />
      <path d="M 68 57 Q 70 59 68 61" stroke="#818CF8" strokeWidth="1" fill="none" />
      <path d="M 54 66 L 30 100 L 78 100 Z" fill="url(#sonarGlow)" opacity="0.5" />
      <circle cx="54" cy="66" r="2.5" fill="#C7D2FE">
         <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
    <g fill="#38BDF8">
      <circle cx="25" cy="30" r="2"><animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" /><animate attributeName="r" values="1;3;1" dur="2.5s" repeatCount="indefinite" /></circle>
      <circle cx="85" cy="20" r="1.5"><animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1s" /></circle>
      <circle cx="95" cy="85" r="2.5" fill="#818CF8"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.5s" /></circle>
      <circle cx="20" cy="80" r="1"><animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" /></circle>
    </g>
    <path d="M 10 20 L 10 10 L 20 10 M 100 10 L 110 10 L 110 20 M 110 100 L 110 110 L 100 110 M 20 110 L 10 110 L 10 100" stroke="#6366F1" strokeWidth="2" fill="none" opacity="0.7" />
  </svg>
));

const WhaleSharkTopDownIcon = React.memo(({ className }) => (
  <svg viewBox="0 0 150 250" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="wsBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0F172A" /><stop offset="40%" stopColor="#1E3A8A" /><stop offset="100%" stopColor="#172554" />
      </linearGradient>
      <linearGradient id="wsFin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3A8A" /><stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
    </defs>
    <path d="M 35 60 C 10 70, -5 100, 5 110 C 20 95, 35 90, 45 85 Z" fill="url(#wsFin)" />
    <path d="M 115 60 C 140 70, 155 100, 145 110 C 130 95, 115 90, 105 85 Z" fill="url(#wsFin)" />
    <path d="M 55 160 C 40 170, 35 185, 45 190 C 50 180, 55 175, 60 175 Z" fill="url(#wsFin)" />
    <path d="M 95 160 C 110 170, 115 185, 105 190 C 100 180, 95 175, 90 175 Z" fill="url(#wsFin)" />
    <path d="M 75 220 C 50 230, 40 250, 45 245 C 60 235, 90 235, 105 245 C 110 250, 100 230, 75 220 Z" fill="url(#wsFin)" />
    <path d="M 40 20 C 30 30, 20 60, 45 140 C 60 200, 70 230, 75 240 C 80 230, 90 200, 105 140 C 130 60, 120 30, 110 20 C 95 5, 55 5, 40 20 Z" fill="url(#wsBody)" />
    <path d="M 40 20 C 30 30, 20 60, 45 140" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.3" fill="none" />
    <path d="M 110 20 C 120 30, 130 60, 105 140" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.3" fill="none" />
    <g stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none">
      <path d="M 28 40 Q 32 45 27 50" /><path d="M 26 43 Q 30 48 25 53" /><path d="M 24 46 Q 28 51 23 56" /><path d="M 22 49 Q 26 54 21 59" />
      <path d="M 122 40 Q 118 45 123 50" /><path d="M 124 43 Q 120 48 125 53" /><path d="M 126 46 Q 122 51 127 56" /><path d="M 128 49 Q 124 54 129 59" />
    </g>
    <g stroke="#7DD3FC" strokeWidth="1" opacity="0.25" fill="none">
      <path d="M 40 45 Q 75 55 110 45" /><path d="M 35 65 Q 75 75 115 65" /><path d="M 35 85 Q 75 95 115 85" /><path d="M 40 105 Q 75 115 110 105" />
      <path d="M 45 125 Q 75 135 105 125" /><path d="M 50 145 Q 75 155 100 145" /><path d="M 55 165 Q 75 175 95 165" /><path d="M 60 185 Q 75 195 90 185" />
      <path d="M 65 205 Q 75 210 85 205" />
    </g>
    <g stroke="#7DD3FC" strokeWidth="1" opacity="0.2" fill="none">
      <path d="M 50 30 Q 60 120 65 220" /><path d="M 75 25 Q 75 120 75 230" /><path d="M 100 30 Q 90 120 85 220" />
    </g>
    <g fill="#FFFFFF" opacity="0.7">
       <circle cx="75" cy="35" r="2.5" /><circle cx="60" cy="40" r="1.5" /><circle cx="90" cy="40" r="1.5" /><circle cx="50" cy="50" r="2" /><circle cx="100" cy="50" r="2" /><circle cx="75" cy="55" r="3" />
       <circle cx="60" cy="65" r="2" /><circle cx="90" cy="65" r="2" /><circle cx="45" cy="80" r="2.5" /><circle cx="105" cy="80" r="2.5" /><circle cx="75" cy="85" r="2.5" /><circle cx="60" cy="95" r="1.5" />
       <circle cx="90" cy="95" r="1.5" /><circle cx="75" cy="115" r="2.5" /><circle cx="55" cy="110" r="1.5" /><circle cx="95" cy="110" r="1.5" /><circle cx="65" cy="135" r="2" /><circle cx="85" cy="135" r="2" />
       <circle cx="75" cy="155" r="2" /><circle cx="68" cy="170" r="1.5" /><circle cx="82" cy="170" r="1.5" /><circle cx="75" cy="185" r="1.5" /><circle cx="75" cy="210" r="1" />
    </g>
    <g fill="#7DD3FC" opacity="0.5">
       <circle cx="68" cy="30" r="1" /><circle cx="82" cy="30" r="1" /><circle cx="45" cy="40" r="1" /><circle cx="105" cy="40" r="1" /><circle cx="85" cy="50" r="1.5" /><circle cx="65" cy="50" r="1.5" />
       <circle cx="50" cy="65" r="1" /><circle cx="100" cy="65" r="1" /><circle cx="82" cy="75" r="1.5" /><circle cx="68" cy="75" r="1.5" /><circle cx="50" cy="95" r="1" /><circle cx="100" cy="95" r="1" />
       <circle cx="68" cy="105" r="1.5" /><circle cx="82" cy="105" r="1.5" /><circle cx="60" cy="125" r="1" /><circle cx="90" cy="125" r="1" /><circle cx="75" cy="140" r="1" />
    </g>
    <path d="M 75 115 C 65 130, 85 130, 75 155 C 75 155, 78 135, 75 115 Z" fill="#0EA5E9" opacity="0.3" />
  </svg>
));

const AbyssRadarIcon = React.memo(({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><path d="M12 2v20" opacity="0.3" /><path d="M2 12h20" opacity="0.3" />
    <circle cx="12" cy="12" r="6" strokeDasharray="2 2" /><circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 12L18.5 5.5" strokeDasharray="1 2" />
  </svg>
));

const CoralIcon = React.memo(({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22v-7" /><path d="M12 17c-2.5-1-3-3-3-5a3 3 0 0 1 2-2" /><path d="M12 18c3-1 4.5-2 4.5-5 0-1.5-1-2.5-2-3" />
    <path d="M7 22v-4" /><path d="M7 19c-2-1-3-2-3-4" /><path d="M17 22v-5" /><path d="M17 19c2-.5 3-2 3-4" />
  </svg>
));

const CardDivingMaskIcon = React.memo(({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 11c0-3.87 3.13-7 7-7h4c3.87 0 7 3.13 7 7v3c0 2.21-1.79 4-4 4h-1.5l-1.5 2h-4l-1.5-2H7c-2.21 0-4-1.79-4-4v-3z" />
    <path d="M12 11v6" />
  </svg>
));

const CardDivingTankIcon = React.memo(({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 2h2v3h-2z" /><path d="M13 3h1.5a1 1 0 0 1 0 2H13" />
    <path d="M7 10.5C7 7.46 9.24 5 12 5c2.76 0 5 2.46 5 5.5V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9.5Z" />
    <path d="M7 13h10" /><path d="M7 19h10" />
  </svg>
));

const DivingMaskIcon = React.memo(({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 11c0-3.87 3.13-7 7-7h4c3.87 0 7 3.13 7 7v3c0 2.21-1.79 4-4 4h-1.5l-1.5 2h-4l-1.5-2H7c-2.21 0-4-1.79-4-4v-3z" />
    <path d="M12 11v6" />
  </svg>
));

const DivingTankIcon = React.memo(({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 2h2v3h-2z" /><path d="M13 3h1.5a1 1 0 0 1 0 2H13" />
    <path d="M7 10.5C7 7.46 9.24 5 12 5c2.76 0 5 2.46 5 5.5V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9.5Z" />
    <path d="M7 13h10" /><path d="M7 19h10" />
  </svg>
));

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
      if (row[j] instanceof Date) { innerValue = row[j].toLocaleString(); }
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

function calculateBootSize(shoe) {
  const s = parseFloat(shoe);
  return s ? String(Math.round(s)) : '';
}

// --------------------------------------------------------
// 共用 UI 元件 (已加入 React.memo 效能優化)
// --------------------------------------------------------

const AISizeAdvisor = React.memo(function AISizeAdvisor({ height, weight, shoeSize, showWeight = false, dark = false }) {
  const h = parseFloat(height), w = parseFloat(weight);
  if (!h || !w) return null;

  const bmi = w / ((h / 100) ** 2);
  const scaleY = Math.max(0.85, Math.min(1.15, h / 170));
  const scaleX = Math.max(0.75, Math.min(1.4, bmi / 22));
  
  const recSize = calculateRecommendedSize(h, w);
  const recWeight = Math.max(1, Math.round(w * 0.08));
  const recBoot = calculateBootSize(shoeSize);
  const recFin = calculateFinSize(shoeSize);

  return (
    <div className={`border rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-6 overflow-hidden relative ${dark ? 'bg-slate-800/50 border-slate-700' : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200/60'}`}>
       <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none ${dark ? 'bg-cyan-500/10' : 'bg-blue-500/10'}`}></div>
       <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none ${dark ? 'bg-blue-500/10' : 'bg-indigo-500/10'}`}></div>

       <div className="relative w-40 h-48 flex items-end justify-center bg-slate-900 rounded-2xl border border-indigo-900/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
             <div className="w-full h-[2px] bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,1)] absolute animate-[scan_2.5s_ease-in-out_infinite]"></div>
          </div>
          
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
                {showWeight && (
                   <div className="absolute bottom-1 -left-1.5 -right-1.5 h-3 bg-slate-900 border border-slate-500 rounded flex items-center justify-center gap-1 shadow-md">
                      <div className="w-2 h-2 bg-slate-300 rounded-[1px]"></div><div className="w-2 h-2 bg-slate-300 rounded-[1px]"></div>
                   </div>
                )}
             </div>
             <div className="flex gap-[2px] w-[56px]">
               <div className="w-[27px] h-14 bg-slate-700 rounded-b-lg border-2 border-slate-600 border-t-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
               <div className="w-[27px] h-14 bg-slate-700 rounded-b-lg border-2 border-slate-600 border-t-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
             </div>
          </div>

          <div className="absolute inset-0 pointer-events-none z-30">
             <div className="absolute top-[35%] left-[2%] flex items-center">
                <div className="bg-slate-800/90 backdrop-blur-sm text-cyan-300 text-[10px] font-black px-1.5 py-1 rounded shadow-md border border-cyan-500/50 leading-none">BCD {recSize}</div>
                <div className="w-4 h-[1px] bg-cyan-500/70"></div>
             </div>
             <div className="absolute top-[55%] right-[2%] flex items-center flex-row-reverse">
                <div className="bg-slate-800/90 backdrop-blur-sm text-indigo-300 text-[10px] font-black px-1.5 py-1 rounded shadow-md border border-indigo-500/50 leading-none">防寒衣 {recSize}</div>
                <div className="w-4 h-[1px] bg-indigo-500/70"></div>
             </div>
             {shoeSize && (
                <div className="absolute bottom-[2%] right-[2%] flex items-center flex-row-reverse">
                    <div className="bg-slate-800/90 backdrop-blur-sm text-teal-300 text-[10px] font-black px-1.5 py-1 rounded shadow-md border border-teal-500/50 flex flex-col items-center leading-none gap-0.5">
                        <span>套鞋 {recBoot}</span><span>蛙鞋 {recFin}</span>
                    </div>
                    <div className="w-4 h-[1px] bg-teal-500/70"></div>
                </div>
             )}
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
          <h4 className={`font-black flex items-center gap-2 ${dark ? 'text-cyan-400' : 'text-indigo-900'}`}>
            <User className={`w-5 h-5 ${dark ? 'text-cyan-500' : 'text-indigo-600'}`} /> AI 體型測繪與智能裝備建議
          </h4>
          <p className={`text-xs font-bold leading-relaxed ${dark ? 'text-slate-300' : 'text-indigo-800/80'}`}>
            系統掃描您的身高 ({h}cm) 與體重 ({w}kg) 完成模擬身型。已同步推薦合適的裝備尺寸與配重於圖示中。
          </p>
          <div className="flex flex-wrap gap-3 pt-1.5">
             <div className={`px-3.5 py-2.5 rounded-xl border shadow-sm flex items-center gap-3 ${dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-indigo-100'}`}>
               <div className={`p-2 rounded-lg ${dark ? 'bg-slate-700' : 'bg-indigo-50'}`}><LifeBuoy className={`w-4 h-4 ${dark ? 'text-cyan-400' : 'text-indigo-600'}`}/></div>
               <div>
                  <span className={`text-[10px] block font-bold mb-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>推薦 BCD/防寒衣</span>
                  <span className={`text-xl font-black leading-none ${dark ? 'text-cyan-300' : 'text-indigo-700'}`}>{recSize}</span>
               </div>
             </div>
             {shoeSize && (
                <div className={`px-3.5 py-2.5 rounded-xl border shadow-sm flex items-center gap-3 ${dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-teal-100'}`}>
                  <div className={`p-2 rounded-lg text-lg ${dark ? 'bg-slate-700' : 'bg-teal-50'}`}>👣</div>
                  <div>
                     <span className={`text-[10px] block font-bold mb-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>建議 蛙鞋 / 套鞋</span>
                     <span className={`text-xl font-black leading-none ${dark ? 'text-teal-400' : 'text-teal-700'}`}>{recFin} <span className="text-xs font-bold">/ {recBoot}</span></span>
                  </div>
                </div>
             )}
             {showWeight && (
                <div className={`px-3.5 py-2.5 rounded-xl border shadow-sm flex items-center gap-3 ${dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-indigo-100'}`}>
                  <div className={`p-2 rounded-lg ${dark ? 'bg-slate-700' : 'bg-blue-50'}`}><Scale className={`w-4 h-4 ${dark ? 'text-blue-400' : 'text-blue-600'}`}/></div>
                  <div>
                     <span className={`text-[10px] block font-bold mb-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>教練參考配重</span>
                     <span className={`text-xl font-black leading-none ${dark ? 'text-blue-400' : 'text-blue-700'}`}>{recWeight} <span className="text-xs font-bold">KG</span></span>
                  </div>
                </div>
             )}
          </div>
       </div>
    </div>
  )
});

const QuickCard = React.memo(function QuickCard({ icon, title, desc, onClick, colorTheme = "cyan", variant, bgIcon }) {
  const themeMap = {
    teal: { wrapper: "border-teal-100 hover:border-teal-300 hover:shadow-[0_15px_30px_rgba(20,184,166,0.15)]", iconBg: "bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 group-hover:from-teal-400 group-hover:to-teal-500 group-hover:text-white", titleHover: "group-hover:text-teal-700", watermark: "text-teal-400", glow: "bg-teal-400/10" },
    rose: { wrapper: "border-rose-100 hover:border-rose-300 hover:shadow-[0_15px_30px_rgba(244,63,94,0.15)]", iconBg: "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 group-hover:from-rose-400 group-hover:to-rose-500 group-hover:text-white", titleHover: "group-hover:text-rose-700", watermark: "text-rose-400", glow: "bg-rose-400/10" },
    cyan: { wrapper: "border-cyan-100 hover:border-cyan-300 hover:shadow-[0_15px_30px_rgba(6,182,212,0.15)]", iconBg: "bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-600 group-hover:from-cyan-400 group-hover:to-cyan-500 group-hover:text-white", titleHover: "group-hover:text-cyan-700", watermark: "text-cyan-400", glow: "bg-cyan-400/10" },
    indigo: { wrapper: "border-indigo-100 hover:border-indigo-300 hover:shadow-[0_15px_30px_rgba(99,102,241,0.15)]", iconBg: "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 group-hover:from-indigo-400 group-hover:to-indigo-500 group-hover:text-white", titleHover: "group-hover:text-indigo-700", watermark: "text-indigo-400", glow: "bg-indigo-400/10" }
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
        {!['accommodations', 'equipments', 'dashboard', 'activities'].includes(variant) && (
          <div className={`absolute bottom-0 right-0 opacity-[0.15] group-hover:scale-110 group-hover:opacity-[0.25] transition-all duration-700 pointer-events-none [&>svg]:w-44 [&>svg]:h-44 ${theme.watermark}`}>{bgIcon || icon}</div>
        )}
      </div>
      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] relative z-10 ${theme.iconBg}`}>{icon}</div>
      <div className="relative z-10 mt-auto">
         <h3 className={`text-xl font-black text-slate-800 mb-2 transition-colors ${theme.titleHover}`}>{String(title)}</h3>
         <p className="text-slate-500 text-sm font-bold leading-relaxed">{String(desc)}</p>
      </div>
    </div>
  );
});

const AdminTabBtn = React.memo(function AdminTabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center w-full p-4 border-b border-slate-100 transition-all group ${active ? 'bg-blue-50 text-blue-700 font-bold border-l-[4px] border-l-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
      <span className={`mr-3 ${active ? 'text-blue-600' : 'text-slate-400'}`}>{icon}</span><span className="font-bold">{String(label)}</span>
    </button>
  );
});

const SubTabBtn = React.memo(function SubTabBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${active ? 'bg-white shadow-sm text-blue-700 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-200/50'}`}>
      {String(label)}
    </button>
  );
});

const ControlPanelCard = React.memo(function ControlPanelCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> {String(title)}</h4>
      {children}
    </div>
  );
});

const FormInput = React.memo(function FormInput({ label, required, type = "text", value, onChange, placeholder, dark = false }) {
  return (
    <div className="space-y-2">
      <label className={`text-sm font-bold ml-1 block ${dark ? 'text-slate-400' : 'text-slate-700'}`}>{String(label)} {required && <span className="text-red-500">*</span>}</label>
      <input required={required} type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full p-3.5 rounded-xl outline-none focus:ring-2 focus:border-blue-500 transition-colors font-medium ${dark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border border-slate-300 shadow-sm text-slate-900'}`} />
    </div>
  );
});

const BirthdaySelect = React.memo(function BirthdaySelect({ label, required, value, onChange, dark = false }) {
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
    onChange((y && m && newD) ? `${y}-${String(m).padStart(2, '0')}-${String(newD).padStart(2, '0')}` : '');
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
             <option value="" disabled>年份</option>{years.map(y => <option key={y} value={y}>{y}</option>)}
           </select>
           <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative flex-[3]">
           <select value={month} onChange={e => handleUpdate(year, e.target.value, day)} className={selectClass}>
             <option value="" disabled>月</option>{months.map(m => <option key={m} value={m}>{m}</option>)}
           </select>
           <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative flex-[3]">
           <select value={day} onChange={e => handleUpdate(year, month, e.target.value)} className={selectClass}>
             <option value="" disabled>日</option>{days.map(d => <option key={d} value={d}>{d}</option>)}
           </select>
           <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
});

const ContactItem = React.memo(function ContactItem({ label, value, subValue, icon, href, highlight = false }) {
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
            {String(subValue).split('\n').map((line, i) => line.trim() ? (<div key={i} className={`text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg inline-flex text-left leading-relaxed shadow-sm bg-white/60 text-slate-600 border border-slate-200/60 group-hover:bg-white group-hover:border-slate-200 transition-colors`}>{line.trim()}</div>) : null)}
          </div>
        )}
      </div>
    </div>
  );
});

const WeightControl = React.memo(function WeightControl({ label, value, onAdd, onSub }) {
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
});

// --------------------------------------------------------
// 大型區塊與頁面組件 (全數套用 React.memo 防止重繪)
// --------------------------------------------------------

const BookingCard = React.memo(function BookingCard({ booking: b, type, db, appId }) {
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
});

const BookingAdminPanel = React.memo(function BookingAdminPanel({ db, appId, bookings, type, title }) {
  const typeBookings = bookings.filter(b => b.type === type).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
  
  const handleExport = () => {
    let headers = []; let rows = [];
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
});

const CourseTemplateModal = React.memo(function CourseTemplateModal({ editingCourse, db, appId, onClose, sysConfig }) {
  const isEdit = !!editingCourse;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultSrvs = sysConfig?.defaultServices || DEFAULT_SERVICES;

  const initData = useMemo(() => {
    const base = editingCourse ? { ...editingCourse } : { courseName: '', price: 0, days: 3, materialSystem: 'PADI', certSystem: 'PADI', certFee: 0, compulsories: [], electives: [], services: [...defaultSrvs], courseNotes: '請自備泳衣、毛巾。', schedule: ['', '', ''] };
    if (!base.compulsories) base.compulsories = [];
    if (typeof base.compulsories === 'string') base.compulsories = base.compulsories.split('\n').filter(Boolean);
    base.compulsories = base.compulsories.map(c => typeof c === 'string' ? { id: Date.now() + Math.random(), name: c, price: 0 } : c);
    if (!base.services) base.services = [];
    if (typeof base.services === 'string') base.services = base.services.split('\n').filter(Boolean);
    if (!base.electives) base.electives = [];
    if (!base.certSystem) base.certSystem = base.materialSystem || 'PADI';
    if (base.certFee === undefined) base.certFee = 0;
    if (!base.courseNotes) base.courseNotes = '';
    if (!base.schedule) base.schedule = Array.from({ length: parseInt(base.days) || 1 }, (_, i) => ({ day: i + 1, slots: [{ period: '09:00-12:00', content: '' }, { period: '13:30-17:00', content: '' }] }));
    else if (base.schedule.length > 0 && typeof base.schedule[0] === 'string') base.schedule = base.schedule.map((desc, i) => { const lines = desc.split('\n'); return { day: i + 1, slots: [{ period: '09:00', content: lines[0] || '' }, { period: '13:30', content: lines[1] || '' }, { period: '19:00', content: lines.slice(2).join(' ') || '' }] }; });
    return base;
  }, [editingCourse, defaultSrvs]);

  const [f, setF] = useState(initData);
  useEffect(() => { setF(initData); }, [initData]);
  
  const [newCompulsoryName, setNewCompulsoryName] = useState(''); const [newCompulsoryPrice, setNewCompulsoryPrice] = useState('');
  const [newElectiveName, setNewElectiveName] = useState(''); const [newElectivePrice, setNewElectivePrice] = useState('');
  const [newService, setNewService] = useState('');

  const handleServiceToggle = (srv) => { const currentServices = f.services || []; setF({ ...f, services: currentServices.includes(srv) ? currentServices.filter(s => s !== srv) : [...currentServices, srv] }); };

  const handleSubmit = async (e) => {
    e.preventDefault(); if(isSubmitting) return; setIsSubmitting(true);
    try {
      const data = { ...f, price: parseInt(f.price) || 0, days: parseInt(f.days) || 1, certFee: parseInt(f.certFee) || 0 };
      if (isEdit) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courseTemplates', editingCourse.id), data);
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'courseTemplates'), data);
      onClose();
    } catch (err) { alert("儲存失敗"); setIsSubmitting(false); }
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
               if(newSch.length < d) { while(newSch.length < d) { newSch.push({ day: newSch.length + 1, slots: [{ period: '09:00-12:00', content: '' }, { period: '13:30-17:00', content: '' }] }); } } else if (newSch.length > d) { newSch = newSch.slice(0, d); }
               setF({ ...f, days: d, schedule: newSch });
            }} />
            <div className="space-y-2"><label className="text-sm font-bold text-slate-700">教材系統</label><select value={f.materialSystem} onChange={e=>setF({...f, materialSystem: e.target.value, certSystem: e.target.value})} className="w-full p-3.5 border border-slate-300 rounded-xl font-bold outline-none focus:border-blue-500"><option value="PADI">PADI</option><option value="SSI">SSI</option><option value="SDI">SDI</option><option value="TDI">TDI</option><option value="AIDA">AIDA</option><option value="Molchanovs">Molchanovs</option><option value="CMAS">CMAS</option><option value="NAUI">NAUI</option><option value="其他">其他</option></select></div>
            <FormInput label="預設售價 NT$ *" type="number" required value={f.price} onChange={v => setF({ ...f, price: v === '' ? '' : Math.max(0, parseInt(v)) })} />
          </div>
          <div className="space-y-3 pt-2">
             <label className="text-sm font-bold text-slate-700 flex items-center justify-between">課程日程安排</label>
             <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
               {(f.schedule || []).map((dayPlan, dIdx) => (
                 <div key={dIdx} className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="font-black text-blue-800 text-sm border-b border-slate-100 pb-2 flex justify-between items-center">
                       <span>Day {dayPlan.day || dIdx + 1}</span>
                       <button type="button" onClick={() => { const newSch = [...f.schedule]; newSch[dIdx].slots.push({ period: '自訂時段', content: '' }); setF({...f, schedule: newSch}); }} className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded transition-colors">+ 新增時段</button>
                    </div>
                    {(dayPlan.slots || []).map((slot, sIdx) => (
                       <div key={sIdx} className="flex gap-2 items-center">
                          <input type="text" value={slot.period} onChange={e => { const newSch = [...f.schedule]; newSch[dIdx].slots[sIdx].period = e.target.value; setF({...f, schedule: newSch}); }} onBlur={() => { const newSch = f.schedule.map(d => ({...d, slots: [...d.slots]})); newSch[dIdx].slots.sort((a, b) => a.period.localeCompare(b.period, 'zh-TW')); setF({...f, schedule: newSch}); }} placeholder="時段" className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-2.5 rounded-lg shrink-0 w-24 text-center shadow-sm outline-none focus:border-blue-500 transition-colors" />
                          <input type="text" value={slot.content} onChange={e => { const newSch = [...f.schedule]; newSch[dIdx].slots[sIdx].content = e.target.value; setF({...f, schedule: newSch}); }} placeholder="課程內容" className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-colors" />
                          <button type="button" onClick={() => { const newSch = [...f.schedule]; newSch[dIdx].slots = newSch[dIdx].slots.filter((_, i) => i !== sIdx); setF({...f, schedule: newSch}); }} className="text-slate-300 hover:text-red-500 p-1 transition-colors"><X className="w-4 h-4"/></button>
                       </div>
                    ))}
                 </div>
               ))}
             </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div><h4 className="font-bold text-blue-900 text-sm">額外簽證費用設定</h4></div>
             <div className="flex items-center gap-2">
               <select value={f.certSystem} onChange={e=>setF({...f, certSystem: e.target.value})} className="w-full sm:w-32 p-2 border border-blue-200 rounded-lg outline-none font-bold focus:border-blue-500 bg-white text-sm shadow-sm"><option value="PADI">PADI</option><option value="SSI">SSI</option><option value="AIDA">AIDA</option><option value="Molchanovs">Molchanovs</option><option value="SDI">SDI</option><option value="TDI">TDI</option><option value="CMAS">CMAS</option><option value="NAUI">NAUI</option><option value="其他">其他</option></select>
               <span className="font-bold text-blue-800 text-sm ml-2">NT$</span><input type="number" value={f.certFee} onChange={e => setF({...f, certFee: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value))})} className="w-24 p-2 border border-blue-200 rounded-lg outline-none text-right font-bold focus:border-blue-500 shadow-sm" />
             </div>
          </div>
          {/* 其他表單維持... */}
        </form>
        <div className="flex gap-3 pt-5 border-t border-slate-100 shrink-0">
           <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3.5 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50">取消返回</button>
           <button type="submit" form="courseForm" disabled={isSubmitting} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-black shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? '處理中...' : '儲存公版設定'}</button>
        </div>
      </div>
    </div>
  );
});

const ActivityManageModal = React.memo(function ActivityManageModal({ editingActivity, courseTemplates, sysConfig, db, appId, onClose }) {
  const isEdit = !!editingActivity;
  const [publishType, setPublishType] = useState(isEdit ? (editingActivity.isCourse ? 'course' : (editingActivity.diveCategory === '體驗潛水' ? 'dsd' : 'fundive')) : 'fundive');
  const [isSubmitting, setIsSubmitting] = useState(false);

  let initData = { name: '', price: 0, date: '', diveCategory: '岸潛', capacity: 4, courseTemplateId: '', isCourse: false, airTanks: 2, nitroxTanks: 0, tanksShoreAir: 0, tanksShoreNitrox: 0, tanksBoatAir: 0, tanksBoatNitrox: 0, notes: '', coach: '', electives: [], services: [], certFee: 0, certSystem: '', schedule: [], airTankPrice: sysConfig.airTankPrice || 800, nitroxTankPrice: sysConfig.nitroxTankPrice || 1200 };
  if (editingActivity) {
    initData = { ...initData, ...editingActivity };
    if (editingActivity.airTanks === undefined && editingActivity.tanks !== undefined) initData.airTanks = editingActivity.tanks;
    if (initData.airTankPrice === undefined) initData.airTankPrice = sysConfig.airTankPrice || 800;
    if (initData.nitroxTankPrice === undefined) initData.nitroxTankPrice = sysConfig.nitroxTankPrice || 1200;
  }
  const [formData, setFormData] = useState(initData);

  const handleShoreTankChange = (field, value) => {
     const parsed = value === '' ? '' : Math.max(0, parseInt(value));
     const newForm = { ...formData, [field]: parsed };
     if (newForm.diveCategory === '岸潛' && !newForm.isCourse) {
        newForm.price = ((parseInt(newForm.airTanks) || 0) * (parseInt(newForm.airTankPrice) || 0)) + ((parseInt(newForm.nitroxTanks) || 0) * (parseInt(newForm.nitroxTankPrice) || 0));
     }
     setFormData(newForm);
  };

  const handleTemplateChange = (e) => {
    const tId = e.target.value; const tmpl = courseTemplates.find(c => c.id === tId);
    if (tmpl) setFormData({ ...formData, courseTemplateId: tId, price: tmpl.price, diveCategory: '課程', isCourse: true, compulsories: tmpl.compulsories || [], electives: tmpl.electives || [], services: tmpl.services || [], certSystem: tmpl.certSystem || tmpl.materialSystem || '', certFee: tmpl.certFee || 0, notes: tmpl.courseNotes || '', schedule: tmpl.schedule || [] });
    else setFormData({ ...formData, courseTemplateId: '', price: 0, diveCategory: '課程', isCourse: true, electives: [], certFee: 0, certSystem: '', schedule: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if(isSubmitting) return; setIsSubmitting(true);
    try {
      const data = { ...formData, price: parseInt(formData.price) || 0, capacity: parseInt(formData.capacity) || 1, tanksShoreAir: parseInt(formData.tanksShoreAir) || 0, tanksShoreNitrox: parseInt(formData.tanksShoreNitrox) || 0, tanksBoatAir: parseInt(formData.tanksBoatAir) || 0, tanksBoatNitrox: parseInt(formData.tanksBoatNitrox) || 0, airTanks: parseInt(formData.airTanks) || 0, nitroxTanks: parseInt(formData.nitroxTanks) || 0, airTankPrice: parseInt(formData.airTankPrice) || 0, nitroxTankPrice: parseInt(formData.nitroxTankPrice) || 0, isCourse: publishType === 'course', timestamp: serverTimestamp() };
      if (isEdit) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activities', editingActivity.id), data);
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'activities'), data);
      onClose();
    } catch (err) { alert("儲存失敗"); setIsSubmitting(false); }
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
             </div>
          )}
          <FormInput label="活動標題 (梯次名稱) *" required value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormInput label="活動日期 *" type="date" required value={formData.date} onChange={v => setFormData({ ...formData, date: v })} />
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700 ml-1 block">負責教練</label>
               <select value={formData.coach || ''} onChange={e=>setFormData({...formData, coach: e.target.value})} className="w-full p-3.5 border border-slate-300 rounded-xl font-bold outline-none focus:border-blue-500 bg-white shadow-sm"><option value="">-- 不指定 --</option>{(sysConfig.coaches || []).map(c => <option key={c.id} value={c.name}>{String(c.name)}</option>)}</select>
            </div>
            <FormInput label={formData.diveCategory === '岸潛' && publishType === 'fundive' ? "總計售價 NT$ *" : "售價 NT$ *"} type="number" required value={formData.price} onChange={v => setFormData({ ...formData, price: v === '' ? '' : Math.max(0, parseInt(v)) })} />
            <FormInput label="限額人數 *" type="number" required value={formData.capacity} onChange={v => setFormData({ ...formData, capacity: v === '' ? '' : Math.max(1, parseInt(v)) })} />
          </div>
          
          {publishType === 'fundive' && (
            <>
              <div className="mt-4"><label className="block text-sm font-bold text-slate-700 mb-2 mt-2">潛水類型</label><div className="flex gap-2">{['岸潛','船潛','潛旅'].map(v => (<button key={v} type="button" onClick={()=>{ const newForm = {...formData, diveCategory: v, isCourse: false}; if (v === '岸潛') { newForm.price = ((parseInt(newForm.airTanks) || 0) * (parseInt(newForm.airTankPrice) || 0)) + ((parseInt(newForm.nitroxTanks) || 0) * (parseInt(newForm.nitroxTankPrice) || 0)); } setFormData(newForm); }} className={`flex-1 py-2 rounded-lg font-bold border ${formData.diveCategory===v?'bg-blue-600 text-white':'bg-white text-slate-500 hover:bg-slate-50'}`}>{v}</button>))}</div></div>
              {formData.diveCategory === '潛旅' ? (
                <div className="mt-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-5">
                   <div><p className="text-sm font-black text-blue-800 mb-3 border-b pb-1">岸潛規劃</p><div className="grid grid-cols-2 gap-4"><FormInput label="一般氣瓶" type="number" value={formData.tanksShoreAir ?? 0} onChange={v => setFormData({ ...formData, tanksShoreAir: v === '' ? '' : Math.max(0, parseInt(v)) })} /><FormInput label="高氧氣瓶" type="number" value={formData.tanksShoreNitrox ?? 0} onChange={v => setFormData({ ...formData, tanksShoreNitrox: v === '' ? '' : Math.max(0, parseInt(v)) })} /></div></div>
                   <div><p className="text-sm font-black text-blue-800 mb-3 border-b pb-1">船潛規劃</p><div className="grid grid-cols-2 gap-4"><FormInput label="一般氣瓶" type="number" value={formData.tanksBoatAir ?? 0} onChange={v => setFormData({ ...formData, tanksBoatAir: v === '' ? '' : Math.max(0, parseInt(v)) })} /><FormInput label="高氧氣瓶" type="number" value={formData.tanksBoatNitrox ?? 0} onChange={v => setFormData({ ...formData, tanksBoatNitrox: v === '' ? '' : Math.max(0, parseInt(v)) })} /></div></div>
                </div>
              ) : formData.diveCategory === '岸潛' ? (
                <div className="grid grid-cols-2 gap-4 mt-3 p-5 bg-blue-50/60 rounded-2xl border border-blue-200/60 shadow-sm">
                   <div className="col-span-2 pb-2 border-b border-blue-200/50 mb-1"><h4 className="text-sm font-black text-blue-900 flex items-center gap-2"><Waves className="w-4 h-4 text-blue-600"/>岸潛氣瓶配置與計價</h4></div>
                   <FormInput label="一般氣瓶單價" type="number" value={formData.airTankPrice ?? 800} onChange={v => handleShoreTankChange('airTankPrice', v)} /><FormInput label="高氧氣瓶單價" type="number" value={formData.nitroxTankPrice ?? 1200} onChange={v => handleShoreTankChange('nitroxTankPrice', v)} />
                   <FormInput label="一般氣瓶 (支)" type="number" value={formData.airTanks ?? 2} onChange={v => handleShoreTankChange('airTanks', v)} /><FormInput label="高氧氣瓶 (支)" type="number" value={formData.nitroxTanks ?? 0} onChange={v => handleShoreTankChange('nitroxTanks', v)} />
                </div>
              ) : null}
            </>
          )}
          <div className="mt-3 space-y-2"><label className="text-sm font-bold text-slate-700">注意事項備註</label><textarea value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full p-3 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-500 min-h-[80px]"></textarea></div>
        </form>
        <div className="flex gap-3 pt-4 border-t mt-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50">取消</button>
          <button type="submit" form="activityForm" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50">{isSubmitting ? '處理中...' : '確認儲存'}</button>
        </div>
      </div>
    </div>
  );
});

const ActivityAdminPanel = React.memo(function ActivityAdminPanel({ db, appId, activities, courseTemplates, sysConfig, saveSysConfig, subTab, setSubTab, bookings = [] }) {
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

  const handleSaveMedical = async () => { if(isSubmittingMedical) return; setIsSubmittingMedical(true); await saveSysConfig({ ...sysConfig, medicalForm }); setIsSubmittingMedical(false); };
  const handleSaveServices = async () => { if(isSubmittingServices) return; setIsSubmittingServices(true); await saveSysConfig({ ...sysConfig, defaultServices: localServices }); setIsSubmittingServices(false); };
  const handleSaveTankPrices = async () => { if(isSubmittingTankPrices) return; setIsSubmittingTankPrices(true); await saveSysConfig({ ...sysConfig, airTankPrice: tankPrices.air, nitroxTankPrice: tankPrices.nitrox }); setIsSubmittingTankPrices(false); };

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
            <div className="flex justify-between items-center"><h3 className="text-xl font-bold text-slate-800">活動上架設定</h3><button onClick={() => { setEditingActivity(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4 inline" /> 新增上架</button></div>
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
                     <button onClick={() => { if (window.confirm('確定刪除嗎？')) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'activities', act.id)); }} className="p-1.5 bg-slate-100 rounded-lg hover:bg-red-600 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex justify-between items-start mb-3 pr-10">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md inline-flex items-center gap-1.5 shadow-sm border ${act.isCourse ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-teal-50 border-teal-200 text-teal-700'}`}>
                      {act.isCourse ? '系統課程' : String(act.diveCategory || '')}
                    </span>
                    <span className="text-blue-600 font-black text-base">NT$ {Number(act.price || 0)}</span>
                  </div>
                  
                  {act.isCourse && tmpl && (
                      <div className="mb-2 animate-in fade-in slide-in-from-top-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-100 font-black text-xs">
                           <CheckCircle className="w-3.5 h-3.5 text-blue-200" />
                           {String(tmpl.courseName || '')}
                        </span>
                      </div>
                  )}

                  <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-tighter mt-2">梯次標題名稱</div>
                  <h4 className="font-black text-slate-900 text-lg mb-3 truncate pr-10 leading-tight">{String(act.name || '')}</h4>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-blue-500" /> {String(act.date || '')}</p>
                      <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-blue-500" /> {String(act.coach || '未指定')}</p>
                      <p className={`flex items-center gap-1.5 ${remainingSlots <= 0 ? 'text-red-500 font-black' : ''}`}>剩餘 {remainingSlots} / {totalSlots} 名</p>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {subTab === 'courses' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 sm:px-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5"/></div><h3 className="text-lg font-black text-slate-800">課程公版庫</h3></div>
                <button onClick={() => { setEditingCourse(null); setIsCourseModalOpen(true); }} className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-slate-700 transition-colors"><Plus className="w-4 h-4" /> 建立公版</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {courseTemplates.map(c => (
                  <div key={c.id} className="p-5 border border-slate-200 rounded-2xl flex flex-col justify-between gap-4 bg-white hover:border-blue-300 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h5 className="font-black text-slate-900 text-lg leading-tight mb-1.5">{String(c.courseName)}</h5>
                        <p className="text-sm text-slate-600 font-medium"><span className="font-black text-slate-800">{String(c.materialSystem || c.certSystem)}</span> • {Number(c.days)} 天 • NT$ {Number(c.price)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-100 justify-end">
                      <button onClick={()=>{setEditingCourse(c); setIsCourseModalOpen(true);}} className="p-2 bg-slate-50 hover:bg-blue-500 hover:text-white text-blue-600 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={()=>deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courseTemplates', c.id))} className="p-2 bg-slate-50 hover:bg-red-500 hover:text-white text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ControlPanelCard title="教練團隊管理">
                <div className="flex gap-2 mb-4">
                  <input type="text" value={newCoach} onChange={e=>setNewCoach(e.target.value)} placeholder="教練名稱" className="flex-1 p-2 border border-slate-300 rounded-xl outline-none" />
                  <button onClick={() => { if(newCoach.trim()) { saveSysConfig({...sysConfig, coaches: [...(sysConfig.coaches || []), { id: Date.now(), name: newCoach.trim() }]}); setNewCoach(''); } }} className="px-4 bg-slate-800 text-white rounded-xl text-sm font-bold">新增</button>
                </div>
                <div className="flex flex-wrap gap-2">{(sysConfig.coaches || []).map(c => (<div key={c.id} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">{c.name} <button onClick={() => saveSysConfig({...sysConfig, coaches: sysConfig.coaches.filter(x => x.id !== c.id)})} className="hover:text-red-500"><X className="w-4 h-4"/></button></div>))}</div>
              </ControlPanelCard>
            </div>
          </div>
        )}
        {subTab === 'medical' && (
          <div className="space-y-6">
             <h3 className="text-xl font-bold">醫療健康聲明問卷編輯</h3>
             {medicalForm.map((q, idx) => (
                <div key={q.id} className="bg-slate-50 border p-4 rounded-2xl space-y-3">
                   <div className="flex items-start gap-3">
                     <span className="bg-slate-200 text-slate-500 font-bold px-2 py-1 rounded text-xs mt-2">{idx + 1}</span>
                     <textarea value={q.text} onChange={e => { const f = [...medicalForm]; f[idx].text = e.target.value; setMedicalForm(f); }} className="flex-1 p-3 rounded-xl text-sm font-bold border border-slate-200 min-h-[60px] outline-none focus:border-blue-400" />
                     <button onClick={() => setMedicalForm(medicalForm.filter(item => item.id !== q.id))} className="text-red-400 p-2 mt-1 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5"/></button>
                   </div>
                </div>
             ))}
             <button disabled={isSubmittingMedical} onClick={handleSaveMedical} className="w-full bg-green-600 text-white px-4 py-3 rounded-xl font-bold shadow-sm">{isSubmittingMedical ? '儲存中...' : '儲存變更'}</button>
          </div>
        )}
      </div>
      {isModalOpen && <ActivityManageModal editingActivity={editingActivity} courseTemplates={courseTemplates} sysConfig={sysConfig} db={db} appId={appId} onClose={() => setIsModalOpen(false)} />}
      {isCourseModalOpen && <CourseTemplateModal editingCourse={editingCourse} db={db} appId={appId} sysConfig={sysConfig} onClose={() => setIsCourseModalOpen(false)} />}
    </div>
  );
});

// --------------------------------------------------------
// 核心系統與首頁渲染
// --------------------------------------------------------

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
        // 權限判定：檢查 /artifacts/{appId}/public/data/admins/ 是否有對應 UID
        if (u && !u.isAnonymous) {
          const adminDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admins', u.uid));
          setIsAdminMode(adminDoc.exists());
        } else { setIsAdminMode(false); }
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
    setIsAdminMode(false); setCurrentView('home'); window.scrollTo(0,0);
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
                <div className="rounded-[3rem] overflow-hidden text-white p-10 md:p-20 relative shadow-[0_30px_60px_rgba(6,182,212,0.3)] bg-cyan-500 min-h-[450px] flex items-center group border border-cyan-300/50">
                  
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
                  
                  <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-cyan-50 text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg">
                      <div className="w-2 h-2 rounded-full bg-yellow-300 animate-ping"></div>
                      {String(sysConfig.heroBadgeText || 'Top-Down Ocean View & Whale Sharks')}
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] text-white">{String(sysConfig.title || '')}</h1>
                    <p className="text-lg md:text-xl text-cyan-50 mb-10 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] font-bold">{String(sysConfig.subtitle || '')}</p>
                    <button onClick={() => setCurrentView('activities')} className="bg-white text-blue-900 px-10 py-4 rounded-xl font-black shadow-[0_10px_30px_rgba(0,182,212,0.4)] hover:bg-cyan-50 hover:scale-105 transition-all flex items-center gap-2 group">
                      展開潛水旅程 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
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
                            <iframe 
                              title="門市位置地圖" 
                              className="w-full h-full rounded-[2.5rem] bg-slate-50 transition-all duration-700 opacity-90 group-hover:opacity-100 shadow-inner" 
                              style={{ border: 0, minHeight: '400px' }} 
                              loading="lazy" 
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(sysConfig.address || '屏東縣恆春鎮')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}>
                            </iframe>
                            
                            <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center gap-3 pointer-events-none group-hover:border-cyan-200 transition-colors duration-500 z-20">
                               <div className="relative flex items-center justify-center">
                                  <div className="absolute w-6 h-6 bg-cyan-400/30 rounded-full animate-ping"></div>
                                  <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)]"></div>
                               </div>
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
              
              {/* 💡 已修正：將 bookings 傳遞進 ActivityAdminPanel */}
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