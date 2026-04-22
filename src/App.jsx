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

const DEFAULT_SERVICES = [
  '🛏️ 背包房床位',
  '🥪 提供早午餐',
  '📃 潛水意外責任險',
  '🚗 提供潛店到潛點的接駁',
  '👤 教練１對４人以下指導'
];

// --------------------------------------------------------
// 卡片專屬圖示與全新背景浮水印
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
      <g stroke="#FFF" strokeWidth="2.5" strokeDasharray="2 6" opacity="0.5">
        <path d="M60 115 C 50 80 20 60 15 25 M60 115 C 70 80 100 60 105 25 M60 115 V 30" />
      </g>
      <g fill="#FFF" opacity="0.9">
         <circle cx="15" cy="25" r="4.5" /><circle cx="105" cy="25" r="4.5" /><circle cx="45" cy="10" r="4" /><circle cx="75" cy="10" r="4" /><circle cx="60" cy="30" r="4.5" /><circle cx="5" cy="45" r="3.5" /><circle cx="115" cy="45" r="3.5" /><circle cx="25" cy="15" r="3" /><circle cx="95" cy="15" r="3" />
      </g>
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
);

const DivingGearWatermark = ({ className }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="tankGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#0891B2" /><stop offset="50%" stopColor="#22D3EE" /><stop offset="100%" stopColor="#164E63" /></linearGradient>
      <linearGradient id="bcdGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#334155" /><stop offset="50%" stopColor="#1E293B" /><stop offset="100%" stopColor="#0F172A" /></linearGradient>
      <linearGradient id="bcdHighlight" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38BDF8" /><stop offset="100%" stopColor="#0284C7" /></linearGradient>
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
);

const AbyssExplorerWatermark = ({ className }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="abyssBase" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4338CA" /><stop offset="100%" stopColor="#312E81" /></linearGradient>
      <radialGradient id="sonarGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" /><stop offset="100%" stopColor="#3730A3" stopOpacity="0" /></radialGradient>
      <linearGradient id="scanBeam" x1="50%" y1="50%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" /><stop offset="100%" stopColor="#6366F1" stopOpacity="0" /></linearGradient>
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
    <path d="M 10 20 L 10 10 L 20 10 M 100 10 L 110 10 L 110 20 M 110 100 L 110 110 L 100 110 M 20 110 L 10 110 L 10 100" stroke="#6366F1" strokeWidth="2" fill="none" opacity="0.7" />
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
    <path d="M 40 20 C 30 30, 20 60, 45 140" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.3" fill="none" />
    <path d="M 110 20 C 120 30, 130 60, 105 140" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.3" fill="none" />
    <g stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none">
      <path d="M 28 40 Q 32 45 27 50" /><path d="M 26 43 Q 30 48 25 53" />
      <path d="M 24 46 Q 28 51 23 56" /><path d="M 22 49 Q 26 54 21 59" />
      <path d="M 122 40 Q 118 45 123 50" /><path d="M 124 43 Q 120 48 125 53" />
      <path d="M 126 46 Q 122 51 127 56" /><path d="M 128 49 Q 124 54 129 59" />
    </g>
    <g stroke="#7DD3FC" strokeWidth="1" opacity="0.25" fill="none">
      <path d="M 40 45 Q 75 55 110 45" /><path d="M 35 65 Q 75 75 115 65" />
      <path d="M 35 85 Q 75 95 115 85" /><path d="M 40 105 Q 75 115 110 105" />
      <path d="M 45 125 Q 75 135 105 125" /><path d="M 50 145 Q 75 155 100 145" />
      <path d="M 55 165 Q 75 175 95 165" /><path d="M 60 185 Q 75 195 90 185" />
      <path d="M 65 205 Q 75 210 85 205" />
    </g>
    <g stroke="#7DD3FC" strokeWidth="1" opacity="0.2" fill="none">
      <path d="M 50 30 Q 60 120 65 220" />
      <path d="M 75 25 Q 75 120 75 230" />
      <path d="M 100 30 Q 90 120 85 220" />
    </g>
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
    <g fill="#7DD3FC" opacity="0.5">
       <circle cx="68" cy="30" r="1" /><circle cx="82" cy="30" r="1" /><circle cx="45" cy="40" r="1" />
       <circle cx="105" cy="40" r="1" /><circle cx="85" cy="50" r="1.5" /><circle cx="65" cy="50" r="1.5" />
       <circle cx="50" cy="65" r="1" /><circle cx="100" cy="65" r="1" /><circle cx="82" cy="75" r="1.5" />
       <circle cx="68" cy="75" r="1.5" /><circle cx="50" cy="95" r="1" /><circle cx="100" cy="95" r="1" />
       <circle cx="68" cy="105" r="1.5" /><circle cx="82" cy="105" r="1.5" /><circle cx="60" cy="125" r="1" />
       <circle cx="90" cy="125" r="1" /><circle cx="75" cy="140" r="1" />
    </g>
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
    <path d="M11 2h2v3h-2z" />
    <path d="M13 3h1.5a1 1 0 0 1 0 2H13" />
    <path d="M7 10.5C7 7.46 9.24 5 12 5c2.76 0 5 2.46 5 5.5V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9.5Z" />
    <path d="M7 13h10" />
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

// 手機號碼自動格式化輔助函數
function formatPhoneNumber(value) {
  if (!value) return '';
  const numbers = value.replace(/[^\d]/g, '');
  if (numbers.length <= 4) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
  return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 10)}`;
}

// 匯出 CSV 輔助函數
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

function AISizeAdvisor({ height, weight, shoeSize, showWeight = false, dark = false }) {
  const h = parseFloat(height);
  const w = parseFloat(weight);
  if (!h || !w) return null;

  const bmi = w / ((h / 100) ** 2);
  const scaleY = Math.max(0.85, Math.min(1.15, h / 170));
  const scaleX = Math.max(0.75, Math.min(1.4, bmi / 22));
  
  const recSize = calculateRecommendedSize(h, w);
  const recWeight = Math.max(1, Math.round(w * 0.08));
  const recBoot = calculateBootSize(shoeSize);
  const recFin = calculateFinSize(shoeSize);

  return (
    <div className={`border rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-6 overflow-hidden relative ${dark ? 'bg-slate-800/50 border-slate-700/50 text-slate-200' : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200/60'}`}>
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
                      <div className="w-2 h-2 bg-slate-300 rounded-[1px]"></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-[1px]"></div>
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
                        <span>套鞋 {recBoot}</span>
                        <span>蛙鞋 {recFin}</span>
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
          <p className={`text-xs font-bold leading-relaxed ${dark ? 'text-slate-400' : 'text-indigo-800/80'}`}>
            系統掃描您的身高 (<span className={dark ? 'text-cyan-300' : 'text-indigo-900'}>{h}cm</span>) 與體重 (<span className={dark ? 'text-cyan-300' : 'text-indigo-900'}>{w}kg</span>) 完成模擬身型。已同步推薦合適的裝備尺寸與配重於圖示中。
          </p>
          <div className="flex flex-wrap gap-3 pt-1.5">
             <div className={`px-3.5 py-2.5 rounded-xl border shadow-sm flex items-center gap-3 ${dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-indigo-100'}`}>
               <div className={`p-2 rounded-lg ${dark ? 'bg-slate-700' : 'bg-indigo-50'}`}><LifeBuoy className={`w-4 h-4 ${dark ? 'text-cyan-400' : 'text-indigo-600'}`}/></div>
               <div>
                  <span className={`text-[10px] block font-bold mb-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>推薦 BCD/防寒衣</span>
                  <span className={`text-xl font-black leading-none ${dark ? 'text-cyan-300' : 'text-indigo-700'}`}>{recSize} <span className="text-xs opacity-60">SIZE</span></span>
               </div>
             </div>
             {shoeSize && (
                <div className={`px-3.5 py-2.5 rounded-xl border shadow-sm flex items-center gap-3 ${dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-teal-100'}`}>
                  <div className={`p-2 rounded-lg text-lg ${dark ? 'bg-slate-700' : 'bg-teal-50'}`}>👣</div>
                  <div>
                     <span className={`text-[10px] block font-bold mb-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>建議 蛙鞋 / 套鞋</span>
                     <span className={`text-xl font-black leading-none ${dark ? 'text-teal-300' : 'text-teal-700'}`}>{recFin} <span className="text-xs font-bold opacity-60">/ {recBoot}</span></span>
                  </div>
                </div>
             )}
             {showWeight && (
                <div className={`px-3.5 py-2.5 rounded-xl border shadow-sm flex items-center gap-3 ${dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-indigo-100'}`}>
                  <div className={`p-2 rounded-lg ${dark ? 'bg-slate-700' : 'bg-blue-50'}`}><Scale className={`w-4 h-4 ${dark ? 'text-blue-400' : 'text-blue-600'}`}/></div>
                  <div>
                     <span className={`text-[10px] block font-bold mb-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>教練參考配重</span>
                     <span className={`text-xl font-black leading-none ${dark ? 'text-blue-300' : 'text-blue-700'}`}>{recWeight} <span className="text-xs font-bold opacity-60">KG</span></span>
                  </div>
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
    if (d && parseInt(d, 10) > maxDays) {
       newD = String(maxDays);
    }
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

  const bgClasses = isLine
    ? 'bg-gradient-to-br from-[#F4FFF4] to-[#E6FFE6] border border-[#00C300]/30 hover:border-[#00C300]/60 hover:shadow-[0_10px_30px_rgba(0,195,0,0.15)]'
    : isBlue
    ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 hover:border-cyan-400 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
    : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/50';

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
        ) : (
          <p className="text-lg sm:text-xl font-black break-words text-slate-900">{String(value || '')}</p>
        )}
        {subValue && (
          <div className="mt-3 flex flex-wrap gap-2 items-start">
            {String(subValue).split('\n').map((line, i) => (
              line.trim() ? <div key={i} className="text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg inline-flex text-left leading-relaxed shadow-sm bg-white/60 text-slate-600 border border-slate-200/60 group-hover:bg-white group-hover:border-slate-200 transition-colors">{line.trim()}</div> : null
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
                  <div className="mt-2 space-y-2 pt-2 border-t border-slate-100">
                     <p className="text-xs text-slate-500 font-bold">預訂房型清單：</p>
                     {(b.details?.cart || []).map((cartItem, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                           <div>
                             <span className="font-black text-slate-800 block mb-1">{cartItem.room?.name || '未知房型'} {cartItem.plan?.name && <span className="text-rose-600 text-xs ml-1">({cartItem.plan.name})</span>}</span>
                             <div className="flex gap-2">
                                <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-black">{cartItem.roomCount} 間</span>
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-black">{cartItem.guests} 人</span>
                                {cartItem.extraBeds > 0 && <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-xs font-black">加 {cartItem.extraBeds} 床</span>}
                             </div>
                           </div>
                        </div>
                     ))}
                  </div>
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

// --------------------------------------------------------
// 房型與定價管理 (Room & Dynamic Pricing)
// --------------------------------------------------------
function RoomManageModal({ db, appId, room, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [f, setF] = useState(() => {
    if (room) {
       let initialPlans = room.pricingPlans || [];
       if (initialPlans.length === 0) {
           if (room.isDorm && room.priceLowWeekday) {
               initialPlans.push({
                   id: Date.now(), name: '單人床位', guests: 1, extraBeds: 0,
                   priceLowWeekday: room.priceLowWeekday, priceLowWeekend: room.priceLowWeekend,
                   pricePeakWeekday: room.pricePeakWeekday, pricePeakWeekend: room.pricePeakWeekend, priceHoliday: room.priceHoliday || room.pricePeakWeekend || 0
               });
           } else if (!room.isDorm && room.priceLowWeekday) {
               initialPlans.push({
                   id: Date.now(), name: `標準入住`, guests: room.bedCount||2, extraBeds: 0,
                   priceLowWeekday: room.priceLowWeekday, priceLowWeekend: room.priceLowWeekend,
                   pricePeakWeekday: room.pricePeakWeekday, pricePeakWeekend: room.pricePeakWeekend, priceHoliday: room.priceHoliday || room.pricePeakWeekend || 0
               });
           }
       }
       return { ...room, pricingPlans: initialPlans };
    }
    return { name: '', quantity: 1, isDorm: false, pricingPlans: [] };
  });

  // 🚀 一鍵帶入公版 (Quick Fill)
  const fillDoubleRoom = () => {
      setF({
         ...f, isDorm: false, quantity: f.quantity || 1, name: f.name || '精緻雙人房',
         pricingPlans: [
            { id: Date.now()+1, name: '1人入住', guests: 1, extraBeds: 0, priceLowWeekday: 1500, priceLowWeekend: 2000, pricePeakWeekday: 2200, pricePeakWeekend: 2600, priceHoliday: 3000 },
            { id: Date.now()+2, name: '2人入住', guests: 2, extraBeds: 0, priceLowWeekday: 2000, priceLowWeekend: 2600, pricePeakWeekday: 2800, pricePeakWeekend: 3200, priceHoliday: 3800 },
            { id: Date.now()+3, name: '3人入住 (含加床)', guests: 3, extraBeds: 1, priceLowWeekday: 2800, priceLowWeekend: 3400, pricePeakWeekday: 3600, pricePeakWeekend: 4000, priceHoliday: 4600 }
         ]
      });
  };

  const fillQuadRoom = () => {
      setF({
         ...f, isDorm: false, quantity: f.quantity || 1, name: f.name || '豪華四人房',
         pricingPlans: [
            { id: Date.now()+1, name: '2人入住', guests: 2, extraBeds: 0, priceLowWeekday: 2800, priceLowWeekend: 3400, pricePeakWeekday: 3600, pricePeakWeekend: 4000, priceHoliday: 4800 },
            { id: Date.now()+2, name: '3人入住', guests: 3, extraBeds: 0, priceLowWeekday: 3300, priceLowWeekend: 3900, pricePeakWeekday: 4100, pricePeakWeekend: 4500, priceHoliday: 5300 },
            { id: Date.now()+3, name: '3人入住 (含加床)', guests: 3, extraBeds: 1, priceLowWeekday: 3800, priceLowWeekend: 4400, pricePeakWeekday: 4600, pricePeakWeekend: 5000, priceHoliday: 5800 },
            { id: Date.now()+4, name: '4人入住', guests: 4, extraBeds: 0, priceLowWeekday: 3800, priceLowWeekend: 4400, pricePeakWeekday: 4600, pricePeakWeekend: 5000, priceHoliday: 5800 },
            { id: Date.now()+5, name: '5人入住 (含加床)', guests: 5, extraBeds: 1, priceLowWeekday: 4600, priceLowWeekend: 5200, pricePeakWeekday: 5400, pricePeakWeekend: 5800, priceHoliday: 6600 }
         ]
      });
  };

  const addPlan = () => {
      setF({
          ...f, 
          pricingPlans: [...(f.pricingPlans||[]), {
              id: Date.now(), name: '新計價方案', guests: 2, extraBeds: 0,
              priceLowWeekday: 0, priceLowWeekend: 0, pricePeakWeekday: 0, pricePeakWeekend: 0, priceHoliday: 0
          }]
      });
  };

  const updatePlan = (idx, field, value) => {
      const newPlans = [...f.pricingPlans];
      newPlans[idx][field] = field === 'name' ? value : (parseInt(value) || 0);
      setF({ ...f, pricingPlans: newPlans });
  };

  const removePlan = (idx) => {
      const newPlans = [...f.pricingPlans];
      newPlans.splice(idx, 1);
      setF({ ...f, pricingPlans: newPlans });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if((f.pricingPlans||[]).length === 0) { alert('請至少設定一個計價方案'); return; }
    if(isSubmitting) return;
    setIsSubmitting(true);
    try {
      const dataToSave = {
         name: f.name,
         quantity: parseInt(f.quantity) || 1,
         isDorm: !!f.isDorm,
         pricingPlans: f.pricingPlans
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
      <div className="bg-white rounded-3xl w-full max-w-4xl p-8 shadow-xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
           <h2 className="text-2xl font-black text-slate-800">房型及動態計價方案設定</h2>
           <div className="flex gap-2">
              <button type="button" onClick={fillDoubleRoom} className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 transition-colors shadow-sm flex items-center gap-1"><Plus className="w-3 h-3"/>帶入: 雙人房 (1~3人)</button>
              <button type="button" onClick={fillQuadRoom} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors shadow-sm flex items-center gap-1"><Plus className="w-3 h-3"/>帶入: 四人房 (2~5人)</button>
           </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <FormInput label="房型/床位名稱" required value={f.name} onChange={v => setF({ ...f, name: v })} placeholder="例如：背包客房 或 豪華雙人房" />
             <FormInput label="實體房間/數量 (間/床)" required type="number" value={f.quantity} onChange={v => setF({ ...f, quantity: v === '' ? '' : Math.max(1, parseInt(v)) })} />
          </div>
          
          <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer shadow-sm hover:bg-slate-100 transition-colors w-fit">
             <input type="checkbox" checked={f.isDorm || false} onChange={e => setF({...f, isDorm: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
             <div><span className="font-black text-slate-800 block text-sm">此為背包房 / 青旅模式 (以「單一床位」計價)</span></div>
          </label>

          <div className="space-y-4 pt-4 border-t border-slate-200">
             <div className="flex justify-between items-center">
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-rose-500"/> 動態計價方案 (Pricing Plans)</h3>
                <button type="button" onClick={addPlan} className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-slate-700 shadow-sm flex items-center gap-1"><Plus className="w-4 h-4"/> 新增方案</button>
             </div>
             <p className="text-xs text-slate-500 font-bold mb-4">設定不同的入住人數與對應價格。前台訂房時，系統將自動匹配最適合的方案供顧客選擇。</p>

             {(f.pricingPlans||[]).length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">請點擊右上方「新增方案」或使用快速「帶入」按鈕</div>
             ) : (
                (f.pricingPlans||[]).map((plan, idx) => (
                  <div key={plan.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-blue-300 transition-all">
                     <button type="button" onClick={()=>removePlan(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-10 mb-4">
                        <FormInput label="方案名稱" value={plan.name} onChange={v=>updatePlan(idx, 'name', v)} placeholder="例: 2人入住" required />
                        <FormInput label="設定入住總人數" type="number" value={plan.guests} onChange={v=>updatePlan(idx, 'guests', v)} required />
                        <FormInput label="內含加床數量" type="number" value={plan.extraBeds} onChange={v=>updatePlan(idx, 'extraBeds', v)} required />
                     </div>
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">五維度總計價設定</p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                           <FormInput label="淡季平日" type="number" value={plan.priceLowWeekday} onChange={v=>updatePlan(idx, 'priceLowWeekday', v)} required />
                           <FormInput label="淡季假日" type="number" value={plan.priceLowWeekend} onChange={v=>updatePlan(idx, 'priceLowWeekend', v)} required />
                           <FormInput label="旺季平日" type="number" value={plan.pricePeakWeekday} onChange={v=>updatePlan(idx, 'pricePeakWeekday', v)} required />
                           <FormInput label="旺季假日" type="number" value={plan.pricePeakWeekend} onChange={v=>updatePlan(idx, 'pricePeakWeekend', v)} required />
                           <FormInput label="連續假期" type="number" value={plan.priceHoliday} onChange={v=>updatePlan(idx, 'priceHoliday', v)} required />
                        </div>
                     </div>
                  </div>
                ))
             )}
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
          <div className="grid grid-cols-1 gap-6">
             <button onClick={() => { setEditingRoom(null); setIsRoomModalOpen(true); }} className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black hover:border-blue-400 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-blue-50/30">
                <Plus className="w-8 h-8" /> 新增房型與動態價格
             </button>
             {accommodations.map(room => (
               <div key={room.id} className="bg-white border border-slate-200 p-6 rounded-3xl group relative shadow-sm hover:shadow-md transition-all">
                  <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingRoom(room); setIsRoomModalOpen(true); }} className="p-2 bg-slate-100 rounded-xl hover:bg-blue-600 hover:text-white transition-colors shadow-sm"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteRoom(room.id)} className="p-2 bg-slate-100 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <h4 className="font-black text-slate-900 text-xl mb-2 flex items-center gap-3">
                    {String(room.name)}
                    {room.isDorm && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg align-middle shadow-sm">背包床位模式</span>}
                  </h4>
                  <p className="text-sm font-bold text-slate-500">實體房間/數量：{room.quantity} {room.isDorm ? '床' : '間'}</p>

                  <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">動態計價方案</p>
                     {(room.pricingPlans||[]).length === 0 && <p className="text-sm text-slate-400 font-bold border-2 border-dashed border-slate-200 p-4 rounded-xl text-center">尚未設定方案，請點擊編輯設定</p>}
                     {(room.pricingPlans||[]).map(p => (
                         <div key={p.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                            <div className="flex justify-between items-center mb-2">
                               <span className="font-bold text-slate-800 text-sm">{p.name} <span className="text-slate-400 ml-1 text-xs">({p.guests}人 {p.extraBeds > 0 ? `加${p.extraBeds}床` : ''})</span></span>
                            </div>
                            <div className="grid grid-cols-5 gap-1 text-center font-bold">
                               <div className="bg-white py-1 rounded shadow-sm"><span className="text-[9px] text-slate-400 block mb-0.5">淡平</span>${p.priceLowWeekday}</div>
                               <div className="bg-white py-1 rounded shadow-sm"><span className="text-[9px] text-slate-400 block mb-0.5">淡假</span>${p.priceLowWeekend}</div>
                               <div className="bg-white py-1 rounded shadow-sm"><span className="text-[9px] text-amber-500 block mb-0.5">旺平</span><span className="text-amber-700">${p.pricePeakWeekday}</span></div>
                               <div className="bg-white py-1 rounded shadow-sm"><span className="text-[9px] text-amber-500 block mb-0.5">旺假</span><span className="text-amber-700">${p.pricePeakWeekend}</span></div>
                               <div className="bg-rose-50 py-1 rounded shadow-sm border border-rose-100"><span className="text-[9px] text-rose-500 block mb-0.5">連假</span><span className="text-rose-700">${p.priceHoliday}</span></div>
                            </div>
                         </div>
                     ))}
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

function AccRoomCard({ room, onAdd, hasFullDays, nights, inCartCount = 0 }) {
  const isDorm = room.isDorm === true;
  const [rc, setRc] = useState(1);
  
  const safePlans = room.pricingPlans?.length > 0 ? room.pricingPlans : [{
      id: 'default', name: isDorm ? '單人床位' : `標準入住`, 
      guests: isDorm ? 1 : 2, extraBeds: 0,
      priceLowWeekday: 0, priceLowWeekend: 0, pricePeakWeekday: 0, pricePeakWeekend: 0, priceHoliday: 0
  }];
  
  const [selectedPlanId, setSelectedPlanId] = useState(String(safePlans[0].id));
  const selectedPlan = safePlans.find(p => String(p.id) === String(selectedPlanId)) || safePlans[0];

  const maxUnits = room.quantity;
  const availableUnits = Math.max(0, maxUnits - inCartCount);
  const isOverUnits = (parseInt(rc) || 0) > availableUnits;

  return (
      <div className="bg-white/90 backdrop-blur-sm p-5 md:p-6 rounded-[1.5rem] shadow-sm border border-slate-200 hover:border-rose-300 hover:shadow-[0_10px_30px_rgba(244,63,94,0.15)] transition-all duration-300 flex flex-col h-full relative group overflow-hidden">
          
          <div className="absolute -bottom-6 -right-6 w-36 h-36 opacity-[0.05] group-hover:scale-110 group-hover:opacity-[0.12] transition-all duration-500 pointer-events-none transform -rotate-6">
              <StaghornCoralWatermark className="w-full h-full text-rose-600" />
          </div>

          <div className="flex justify-between items-start mb-2 relative z-10">
              <h3 className="font-black text-xl text-slate-900 group-hover:text-rose-700 transition-colors pr-2">
                 {room.name}
                 {isDorm && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded ml-2 align-middle border border-slate-200">背包床位</span>}
              </h3>
              <div className="text-right shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">目前方案 (淡平)</span>
                  <span className="text-rose-600 font-black text-lg">NT$ {selectedPlan.priceLowWeekday} {isDorm ? <span className="text-xs text-rose-400">/床</span> : <span className="text-xs text-rose-400">/間</span>}</span>
              </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4 mt-1 relative z-10">
              <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-slate-200">
                <CoralIcon className="w-3.5 h-3.5" /> {isDorm ? `共 ${maxUnits} 個床位` : `實體 ${maxUnits} 間`}
              </span>
              <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-rose-100">
                <User className="w-3.5 h-3.5" /> {isDorm ? '單人入住 / 床' : `${selectedPlan.guests} 人入住方案`}
              </span>
              {!isDorm && selectedPlan.extraBeds > 0 && (
                 <span className="text-[11px] font-bold text-orange-600 flex items-center gap-1.5 bg-orange-50 w-fit px-2 py-1 rounded-md border border-orange-100">
                    <Plus className="w-3 h-3" /> 含加 {selectedPlan.extraBeds} 床
                 </span>
              )}
          </div>

          <div className="mt-auto bg-slate-50/80 p-3 rounded-xl border border-slate-100 shadow-inner relative z-10 flex flex-col gap-3">
             {!isDorm && (
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">選擇計價方案 (入住人數)</label>
                   <div className="relative">
                       <select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)} className="w-full p-2.5 pl-3 pr-8 rounded-lg border border-slate-300 font-bold text-sm text-slate-700 outline-none focus:border-rose-400 appearance-none cursor-pointer bg-white">
                          {safePlans.map(p => (
                             <option key={p.id} value={p.id}>{p.name} (淡平 NT$ {p.priceLowWeekday})</option>
                          ))}
                       </select>
                       <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   </div>
                </div>
             )}
             <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isDorm ? '預訂床位數' : '預訂房間數'}</label>
                <div className="flex items-center bg-white rounded-lg border border-slate-200">
                    <button onClick={() => setRc(Math.max(1, rc - 1))} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-l-lg">-</button>
                    <span className="text-sm font-bold w-10 text-center text-slate-700">{rc}</span>
                    <button onClick={() => setRc(Math.min(availableUnits, rc + 1))} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-r-lg">+</button>
                </div>
             </div>
          </div>
          
          {isOverUnits && <p className="text-[10px] font-bold text-red-500 mt-2 text-center animate-pulse relative z-10"><AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5"/>數量超過剩餘可選數 ({availableUnits})</p>}

          <button 
              onClick={() => {
                  const roomCount = parseInt(rc)||1;
                  onAdd({ 
                      id: Date.now() + Math.random(), 
                      room, 
                      plan: selectedPlan,
                      roomCount: roomCount, 
                      guests: roomCount * selectedPlan.guests, 
                      extraBeds: roomCount * selectedPlan.extraBeds, 
                      isDorm 
                  });
                  setRc(1); 
              }} 
              disabled={hasFullDays || isOverUnits || availableUnits <= 0 || nights <= 0}
              className="w-full mt-4 py-3 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-xl font-bold shadow-sm hover:from-rose-500 hover:to-rose-400 hover:shadow-rose-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-2 relative z-10"
          >
              <Plus className="w-4 h-4"/> {availableUnits <= 0 ? '已達預訂上限' : nights <= 0 ? '請先於上方選擇日期' : '加入至預訂清單'}
          </button>
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
  
  const [searchGuests, setSearchGuests] = useState(2);
  const [showPlans, setShowPlans] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState([]);

  const [f, setF] = useState({ name: '', phone: '' });
  const [cart, setCart] = useState([]); 
  const [courseStudents, setCourseStudents] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // --- 更新：完全使用 Pricing Plans 計算金額的購物車引擎 ---
  const calculateCartPrice = React.useCallback((targetCart) => {
     if (!checkIn || nights <= 0 || targetCart.length === 0) return { total: 0, breakdown: [], discountTotal: 0, discountLabel: '', totalRoomCount: 0 };

     let total = 0;
     const dailyAggregated = {};
     let totalRoomCount = 0;
     let dsdDiscountAccumulator = 0; 

     targetCart.forEach(item => {
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

            let basePrice = 0;
            let priceLabel = '';
            
            const plan = item.plan;
            if (!plan) continue;

            if (isHoliday) {
               basePrice = plan.priceHoliday || 0;
               priceLabel = '連假定價';
            } else if (isPeak) {
               basePrice = isWeekend ? (plan.pricePeakWeekend || 0) : (plan.pricePeakWeekday || 0);
               priceLabel = isWeekend ? '旺季假日' : '旺季平日';
            } else {
               basePrice = isWeekend ? (plan.priceLowWeekend || 0) : (plan.priceLowWeekday || 0);
               priceLabel = isWeekend ? '淡季假日' : '淡季平日';
            }

            let dailyPrice = basePrice * item.roomCount;

            if (item.isDorm && context?.type === 'dsd_discount' && item.room.name.includes('背包')) {
               let perBedPrice = basePrice;
               if (perBedPrice > 500) {
                   dsdDiscountAccumulator += (perBedPrice - 500) * item.roomCount;
                   dailyPrice = 500 * item.roomCount;
                   priceLabel += ' (體驗潛水特惠)';
               }
            }

            total += dailyPrice;

            if (!dailyAggregated[dateStr]) {
                dailyAggregated[dateStr] = { date: dateStr, label: priceLabel, baseSum: 0, extraBed: 0, subtotal: 0 };
            }
            dailyAggregated[dateStr].baseSum += dailyPrice;
            dailyAggregated[dateStr].subtotal += dailyPrice;
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
  }, [checkIn, nights, sysConfig, context, courseStudents]);

  const priceInfo = useMemo(() => calculateCartPrice(cart), [cart, calculateCartPrice]);

  // --- 產生智能搭配方案 (Smart Planner) 基於 Pricing Plans ---
  const handleSearchPlans = () => {
     if (!checkIn || !checkOut || searchGuests < 1 || nights <= 0 || hasFullDays) {
         alert(hasFullDays ? '選擇的區間包含已滿房日期，無法預訂' : '請填寫正確的日期與人數'); return;
     }

     const availRooms = accommodations.map(r => {
         const maxU = r.quantity;
         return { ...r, availQty: maxU };
     }).filter(r => r.availQty > 0 && (r.pricingPlans || []).length > 0);

     const plans = [];

     const formatCart = (cartArr) => {
         const grouped = [];
         cartArr.forEach(c => {
             const ex = grouped.find(x => x.room.id === c.room.id && x.plan.id === c.plan.id);
             if (ex) {
                 ex.roomCount += c.roomCount;
                 ex.guests += c.guests;
                 ex.extraBeds += c.extraBeds;
             } else {
                 grouped.push({ ...c });
             }
         });
         return grouped;
     };

     // 策略 1: 背包客精省 (Dorms)
     const dorms = availRooms.filter(r => r.isDorm);
     if (dorms.length > 0) {
         let g = searchGuests;
         let c = [];
         for (let r of dorms) {
             if (g <= 0) break;
             let take = Math.min(r.availQty, g);
             let plan = r.pricingPlans[0];
             c.push({ id: Date.now() + Math.random(), room: r, plan: plan, roomCount: take, guestsPerRoom: plan.guests, extraBedsPerRoom: plan.extraBeds, guests: take * plan.guests, extraBeds: take * plan.extraBeds, isDorm: true });
             g -= take;
         }
         if (g <= 0) {
             const grouped = formatCart(c);
             plans.push({ id: 'dorm', name: '背包客精省方案', desc: '全數安排背包床位，極致性價比。', cart: grouped, sig: 'dorm' });
         }
     }

     // 策略 2: 親友同樂方案 (單間包辦)
     const privates = availRooms.filter(r => !r.isDorm);
     for (let r of privates) {
         const exactPlan = r.pricingPlans.find(p => p.guests === searchGuests);
         if (exactPlan && r.availQty >= 1) {
             const c = [{ id: Date.now() + Math.random(), room: r, plan: exactPlan, roomCount: 1, guestsPerRoom: exactPlan.guests, extraBedsPerRoom: exactPlan.extraBeds, guests: exactPlan.guests, extraBeds: exactPlan.extraBeds, isDorm: false }];
             plans.push({ id: `exact_${r.id}`, name: '親友同樂方案 (單間包辦)', desc: '安排在一間房內，適合親朋好友徹夜長談。', cart: c, sig: `exact_${r.id}` });
             break; 
         }
     }

     // 策略 3: 寬敞舒適方案 (多間組合 - 貪婪配對)
     if (searchGuests > 1) {
         let g = searchGuests;
         let c = [];
         const sortedPrivates = [...privates].sort((a,b) => {
             const maxA = Math.max(...a.pricingPlans.map(p => p.guests));
             const maxB = Math.max(...b.pricingPlans.map(p => p.guests));
             return maxB - maxA;
         });

         for (let r of sortedPrivates) {
             if (g <= 0) break;
             const validPlans = r.pricingPlans.filter(p => p.guests <= g).sort((a,b) => b.guests - a.guests);
             if (validPlans.length > 0) {
                 const plan = validPlans[0];
                 const takeRooms = Math.min(r.availQty, Math.floor(g / plan.guests));
                 if (takeRooms > 0) {
                     c.push({ id: Date.now() + Math.random(), room: r, plan: plan, roomCount: takeRooms, guestsPerRoom: plan.guests, extraBedsPerRoom: plan.extraBeds, guests: takeRooms * plan.guests, extraBeds: takeRooms * plan.extraBeds, isDorm: false });
                     g -= takeRooms * plan.guests;
                 }
             }
         }
         
         if (g > 0) {
             for (let r of privates) {
                 if (g <= 0) break;
                 const exactPlan = r.pricingPlans.find(p => p.guests === g);
                 const usedQty = c.filter(item => item.room.id === r.id).reduce((sum, item) => sum + item.roomCount, 0);
                 if (exactPlan && (r.availQty - usedQty) >= 1) {
                     c.push({ id: Date.now() + Math.random(), room: r, plan: exactPlan, roomCount: 1, guestsPerRoom: exactPlan.guests, extraBedsPerRoom: exactPlan.extraBeds, guests: exactPlan.guests, extraBeds: exactPlan.extraBeds, isDorm: false });
                     g -= exactPlan.guests;
                 }
             }
         }

         if (g === 0) {
             const grouped = formatCart(c);
             const sig = grouped.map(x => `${x.room.id}_${x.plan.id}_${x.roomCount}`).sort().join('|');
             if (!plans.some(p => p.sig === sig)) {
                 plans.push({ id: 'combo', name: '寬敞舒適方案 (多間組合)', desc: '系統為您智能搭配多間合適房型，空間更充裕。', cart: grouped, sig: sig });
             }
         }
     }

     setGeneratedPlans(plans);
     setShowPlans(true);
     setCart([]); 
  };

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
        itemName: cart.map(c => `${c.room.name} × ${c.roomCount}`).join(' + '), 
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

  return (
    <div className="relative animate-in fade-in duration-500 min-h-[calc(100vh-80px)] pb-24 lg:pb-12">
      {/* 珊瑚礁度假背景 (Coral Reef Resort Background) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[3rem]">
         <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-rose-100/50 via-pink-50/30 to-transparent"></div>
         <div className="absolute -top-20 right-[10%] w-[40%] h-[80vh] bg-gradient-to-b from-white/60 to-transparent transform -rotate-[15deg] blur-3xl opacity-80"></div>
         <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] opacity-[0.15] pointer-events-none text-rose-400"><StaghornCoralWatermark className="w-full h-full" /></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-6 pt-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 border-b border-rose-200/50 pb-5 mb-8 px-2">
           <button onClick={onBack} className="p-2.5 bg-white/60 backdrop-blur-sm text-rose-700 rounded-full hover:bg-white hover:shadow-md hover:text-rose-600 transition-all border border-white"><ChevronLeft className="w-6 h-6"/></button>
           <div>
             <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-pink-700 drop-shadow-sm">線上訂房 / Accommodation</h2>
             <div className="text-xs md:text-sm font-bold text-rose-800/60 mt-1.5 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>智能試算方案，為您推薦最佳房型</div>
           </div>
        </div>

        <div className="space-y-6 lg:space-y-8">
          
          {/* STEP 1: 選擇日期與人數 */}
          <div className="bg-white/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white shadow-[0_15px_40px_rgba(244,63,94,0.1)]">
             <h3 className="font-black text-xl text-slate-800 border-b border-rose-100/50 pb-3 mb-6 flex items-center gap-3">
                <div className="bg-rose-100 p-2 rounded-xl text-rose-600"><CalendarDays className="w-5 h-5"/></div>
                1. 選擇入住日期與人數
             </h3>

             {/* 滿房警告 */}
             {hasFullDays && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 mb-6 shadow-sm animate-in slide-in-from-top-2">
                   <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                   <div>
                     <p className="text-sm font-black text-rose-800">區間包含已滿房日期</p>
                     <p className="text-xs font-bold text-rose-600 mt-1">客滿日期：{fullDaysInRange.join(', ')}</p>
                   </div>
                </div>
             )}

             <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                 <div className="sm:col-span-3">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Check-in 入住日</span>
                     <input type="date" required value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full bg-white p-3.5 rounded-xl font-bold text-slate-700 text-sm outline-none cursor-pointer border border-slate-200 focus:border-rose-400 shadow-sm" />
                 </div>
                 <div className="sm:col-span-3">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Check-out 退房日</span>
                     <input type="date" required value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full bg-white p-3.5 rounded-xl font-bold text-slate-700 text-sm outline-none cursor-pointer border border-slate-200 focus:border-rose-400 shadow-sm" />
                 </div>
                 <div className="sm:col-span-3">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Guests 總入住人數</span>
                     <input type="number" min="1" required value={searchGuests} onChange={e => setSearchGuests(Math.max(1, parseInt(e.target.value)||1))} className="w-full bg-white p-3.5 rounded-xl font-black text-rose-600 text-sm outline-none cursor-pointer border border-slate-200 focus:border-rose-400 shadow-sm text-center" />
                 </div>
                 <div className="sm:col-span-3 flex items-end">
                     <button onClick={handleSearchPlans} className="w-full py-3.5 bg-slate-900 hover:bg-rose-600 text-white rounded-xl font-black shadow-lg transition-all">搜尋住宿方案</button>
                 </div>
             </div>
          </div>

          {/* STEP 2: 方案選擇與自訂 */}
          {showPlans && (
             <div className="bg-white/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white shadow-[0_15px_40px_rgba(244,63,94,0.1)] animate-in slide-in-from-bottom-4">
                <h3 className="font-black text-xl text-slate-800 border-b border-rose-100/50 pb-3 mb-6 flex items-center gap-3">
                   <div className="bg-rose-100 p-2 rounded-xl text-rose-600"><CoralIcon className="w-5 h-5"/></div>
                   2. 選擇系統推薦方案
                </h3>
                
                {generatedPlans.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                     {generatedPlans.map(p => {
                        const pPriceInfo = calculateCartPrice(p.cart);
                        const isSelected = p.sig === cart.map(c => `${c.room.id}_${c.plan.id}_${c.roomCount}`).sort().join('|');

                        return (
                        <div key={p.id} onClick={() => {setCart(p.cart); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });}} className={`bg-gradient-to-br from-white to-rose-50 border-2 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden group ${isSelected ? 'border-rose-500 shadow-[0_10px_20px_rgba(244,63,94,0.2)]' : 'border-rose-100 shadow-sm hover:shadow-md hover:border-rose-300'}`}>
                            {isSelected && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm">已選擇</div>}
                            <h4 className="font-black text-rose-800 mb-1 text-lg">{p.name}</h4>
                            <p className="text-xs font-bold text-rose-600/70 mb-4 h-8">{p.desc}</p>
                            
                            <div className="space-y-2 mb-5 min-h-[60px]">
                                {p.cart.map(c => (
                                    <div key={c.id} className="flex justify-between items-center text-sm font-bold text-slate-700 bg-white p-2 rounded-lg border border-rose-100 shadow-sm">
                                        <span className="truncate pr-2">{c.room.name} × {c.roomCount}</span>
                                        <span className="shrink-0 bg-slate-50 text-xs px-2 py-0.5 rounded">{c.plan.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 border-t border-rose-200/60 flex justify-between items-end relative z-10">
                                <span className="text-[11px] font-black text-slate-500 uppercase">預估總價 / Total</span>
                                <span className="text-2xl font-black text-rose-600 leading-none">NT$ {pPriceInfo.total}</span>
                            </div>
                        </div>
                     )})}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm font-bold text-slate-500 border-2 border-dashed border-rose-200 rounded-2xl mb-8 bg-rose-50/50">
                    目前沒有完全符合人數的完美方案，請使用下方「自訂組合」手動分配。
                  </div>
                )}

                <h3 className="font-black text-lg text-slate-800 border-b border-rose-100/50 pb-3 mb-6">或自行組合房型與入住方案</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   {accommodations.map(room => {
                      const inCartCount = cart.filter(c => c.room.id === room.id).reduce((sum, c) => sum + c.roomCount, 0);
                      return <AccRoomCard key={room.id} room={room} onAdd={handleAddToCart} hasFullDays={hasFullDays} nights={nights} inCartCount={inCartCount} />;
                   })}
                </div>
             </div>
          )}

          {/* STEP 3: 預訂清單與結帳 */}
          {(showPlans || cart.length > 0) && (
            <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(244,63,94,0.15)] flex flex-col lg:flex-row gap-8 animate-in slide-in-from-bottom-4">
               
               {/* 預訂清單區 */}
               <div className="lg:w-1/2 flex flex-col">
                 <h3 className="font-black text-xl text-slate-800 border-b border-rose-100/50 pb-4 mb-5 flex items-center gap-3">
                    <div className="bg-pink-100 p-2 rounded-xl text-pink-600"><ClipboardList className="w-5 h-5"/></div> 
                    3. 目前預訂清單確認
                 </h3>
                 
                 {cart.length === 0 ? (
                   <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-rose-200 flex-1 flex flex-col items-center justify-center">
                     <div className="w-8 h-8 text-rose-300 mx-auto mb-2 flex items-center justify-center"><CoralIcon className="w-full h-full" /></div>
                     <div className="text-xs font-bold text-rose-700/50">請先於上方選擇需要的房型方案</div>
                   </div>
                 ) : (
                   <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[150px]">
                     {cart.map((item) => (
                       <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group hover:border-rose-300 hover:shadow-md transition-all">
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="font-bold text-slate-800 text-base truncate mb-1.5">{item.room.name}</div>
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-md text-slate-600 border border-slate-200/50">{item.roomCount} {item.isDorm ? '床' : '間'}</span>
                              <span className="text-[10px] font-black bg-rose-50 px-2 py-1 rounded-md text-rose-600 border border-rose-100/50">{item.plan.name}</span>
                            </div>
                          </div>
                          <button type="button" onClick={() => handleRemoveFromCart(item.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                            <Trash2 className="w-5 h-5"/>
                          </button>
                       </div>
                     ))}
                   </div>
                 )}
                 
                 {/* 折扣資訊區 */}
                 {(context && cart.length > 0) && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-3 shadow-sm mt-6 animate-in slide-in-from-bottom-2">
                       <div className="flex items-center gap-2">
                         <div className="bg-amber-100 p-1.5 rounded-lg shrink-0"><BookOpen className="w-4 h-4 text-amber-700" /></div>
                         <p className="text-sm font-black text-amber-900">{context.type === 'course_upgrade' ? '課程學員專屬折抵' : context.type === 'dsd_discount' ? '體驗潛水專屬優惠' : '活動專屬優惠'}</p>
                       </div>
                       {context.type === 'course_upgrade' ? (
                         <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-100 shadow-sm">
                           <span className="text-xs font-bold text-amber-800 pl-2">套用折抵的同行學員</span>
                           <select value={courseStudents} onChange={e => setCourseStudents(Number(e.target.value))} className="p-1.5 border border-amber-200 rounded-lg text-sm font-black outline-none bg-amber-50 focus:bg-white cursor-pointer text-amber-900">
                             {Array.from({ length: maxStudents || 1 }, (_, i) => i + 1).map(num => (
                               <option key={num} value={num}>{num} 位</option>
                             ))}
                           </select>
                         </div>
                       ) : context.type === 'dsd_discount' ? (
                         <p className="text-[10px] font-bold text-amber-800 bg-white p-2 rounded-xl border border-amber-100 shadow-sm">
                            享體驗潛水專屬優惠：背包房床位每晚以 NT$ 500 計算 (限背包客房適用)
                         </p>
                       ) : (
                         <p className="text-[10px] font-bold text-amber-800 bg-white p-2 rounded-xl border border-amber-100 shadow-sm">{getDiscountInfo()}</p>
                       )}
                    </div>
                 )}
               </div>

               {/* 結帳資料區 */}
               <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-slate-200/60 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-end">
                  <div className="grid grid-cols-1 gap-4 mb-8">
                     <FormInput label="訂房人姓名 *" required value={f.name} onChange={v=>setF({...f, name: v})} placeholder="請填寫姓名" />
                     <FormInput label="聯絡手機 *" required type="tel" value={f.phone} onChange={v=>setF({...f, phone: formatPhoneNumber(v)})} placeholder="09xx-xxx-xxx" />
                  </div>
                  
                  <div className="flex justify-between items-end mb-5">
                    <span className="text-sm font-bold text-slate-500">預估總額 / Total Amount</span>
                    <div className="text-right">
                      {priceInfo.discountTotal > 0 && <div className="text-[10px] text-rose-600 font-bold mb-1">已扣除優惠 NT$ {priceInfo.discountTotal}</div>}
                      <span className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-rose-700 to-pink-500 tracking-tight">NT$ {priceInfo.total}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || hasFullDays || cart.length === 0 || !f.name || !f.phone} 
                    className="w-full py-4 lg:py-5 bg-gradient-to-r from-rose-600 to-pink-500 text-white rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_15px_30px_rgba(244,63,94,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                     {isSubmitting ? '預訂處理中... Processing' : cart.length === 0 ? '請先選擇房型' : (!f.name || !f.phone) ? '請填寫基本資料' : <><CheckCircle className="w-6 h-6"/> 確認送出訂單</>}
                  </button>
               </div>
            </div>
          )}
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
    title: "鯊墾丁 SHARKENTING", subtitle: "整合課程、住宿與裝備租借，提供您最專業、便利的潛水體驗。", heroBadgeText: "Top-Down Ocean View & Whale Sharks", phoneDiving: "0980-175-777", serviceHoursDiving: "08:00-20:00", phoneAcc: "0987-367-550", line: "@tbj1448p", address: "946屏東縣恆春鎮恆西路33巷123弄5號", transport: "🚄 高鐵左營站搭乘台灣好行至恆春轉運站\n🚗 自行開車前往", peakSeasonStart: '05', peakSeasonEnd: '10', equipmentPackages: { studentDiscount: 80, returnCustomerDiscount: 80 }, coaches: [{id: 1, name: '阿龍教練'}], checkInAcc: '15:00', checkOutAcc: '11:00', adminCode: '0000', accDiscountType: 'fixed', accDiscountValue: 200, defaultServices: DEFAULT_SERVICES, airTankPrice: 800, nitroxTankPrice: 1200
  });

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState(null);
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
           if (data.transport === "高鐵左營站搭乘台灣好行至恆春轉運站、自行開車前往") {
               data.transport = "🚄 高鐵左營站搭乘台灣好行至恆春轉運站\n🚗 自行開車前往";
           }
           if (!data.defaultServices || data.defaultServices.length === 0) data.defaultServices = DEFAULT_SERVICES;
           setSysConfig(prev => ({ ...prev, ...data }));
       }
    });
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
      duplicates.forEach(id => {
        deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id)).catch(() => {});
      });
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
        await addDoc(rRef, { 
           name: '背包客房', quantity: 1, isDorm: true, 
           pricingPlans: [
              { id: Date.now(), name: '單人床位', guests: 1, extraBeds: 0, priceLowWeekday: 500, priceLowWeekend: 600, pricePeakWeekday: 700, pricePeakWeekend: 800, priceHoliday: 1000 }
           ] 
        });
        
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
      const cleanCfg = JSON.parse(JSON.stringify(cfg));
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
                         <h3 className="text-3xl md:text-5xl font-black text-slate-800 flex items-center justify-center gap-4 tracking-tight drop-shadow-sm">
                            聯絡與門市資訊
                         </h3>
                         <p className="text-slate-600 font-bold mt-5 leading-relaxed text-sm md:text-base">
                            無論是課程諮詢、裝備預留，還是想了解最新的潛水行程，<br className="hidden sm:block"/>歡迎透過以下方式與我們聯繫！
                         </p>
                      </div>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-stretch">
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
                 setPendingAccAction(result.accContext);
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