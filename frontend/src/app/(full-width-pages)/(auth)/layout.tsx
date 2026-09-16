import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full min-h-screen justify-center flex-col">
          {children}

          {/* Ultra-Clean Light Mode Enterprise Showcase Right Panel */}
          <div className="lg:w-7/12 w-full min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/60 to-purple-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/90 lg:flex flex-col justify-between hidden p-8 lg:p-12 text-slate-900 dark:text-white relative overflow-hidden border-l border-slate-200 dark:border-slate-800">
            {/* Background Ambient Glow Effects */}
            <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[110px] pointer-events-none"></div>

            {/* Top Brand Bar */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center font-black text-xl text-white shadow-md shadow-indigo-500/20 ring-2 ring-white">
                  ⚡
                </div>
                <div>
                  <h2 className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                    Smart Campus <span className="text-indigo-600 dark:text-indigo-400">IoT & AI</span>
                  </h2>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold block">
                    Enterprise Operations System
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Command Hub Online
              </div>
            </div>

            {/* Middle Section: Clean Dashboard Graphic Mockup */}
            <div className="relative z-10 my-auto py-4 space-y-5 max-w-3xl">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 backdrop-blur-md mb-2">
                  🏢 Real-Time Institutional Operations Platform
                </span>
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Unified Campus Intelligence &{" "}
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 dark:from-indigo-400 dark:via-purple-300 dark:to-emerald-400 bg-clip-text text-transparent">
                    Real-Time Fleet & Security Engine
                  </span>
                </h1>
              </div>

              {/* Light Mode Browser Window Mockup */}
              <div className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-indigo-900/10 space-y-0 transform hover:scale-[1.01] transition-transform duration-300">
                {/* Browser Header Bar */}
                <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
                  </div>

                  <div className="bg-white dark:bg-slate-950 px-4 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span className="text-emerald-500">🔒</span>
                    <span>https://command.smartcampus.io/dashboard</span>
                  </div>

                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 font-bold">
                    Live Stream
                  </span>
                </div>

                {/* Dashboard Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <img
                    src="/images/smart_campus_light_hero.jpg"
                    alt="Smart Campus Command Center Light Mode Dashboard"
                    className="w-full h-full object-cover"
                  />

                  {/* Visual Badges */}
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-900 dark:text-white font-bold flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    GPS FLEET TELEMETRY: 18 BUSES LIVE
                  </div>

                  <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    AI CCTV SPATIAL DETECTION: NORMAL
                  </div>
                </div>
              </div>

              {/* Feature Metrics Bar */}
              <div className="grid grid-cols-4 gap-3 text-center text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Students</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">2,450 Live</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">GPS Fleet</span>
                  <span className="font-black text-purple-600 dark:text-purple-400 text-sm">18 Buses</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">IoT Telemetry</span>
                  <span className="font-black text-cyan-600 dark:text-cyan-400 text-sm">42 Sensors</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">AI Engine</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">Gemini 1.5</span>
                </div>
              </div>
            </div>

            {/* Bottom Compliance & System Health Bar */}
            <div className="relative z-10 p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  SOC2 Type II & ISO 27001 Certified Architecture
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span>Multi-Tenant TLS 1.3</span>
                <span>•</span>
                <span>Socket.IO Engine</span>
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
