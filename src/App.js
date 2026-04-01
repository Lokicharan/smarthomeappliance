import React, { useState, useEffect, useCallback } from "react";

const BLYNK_TOKEN = "jT4lEcgTcyFwVhmpOYT3RJoWO0giDz6t";
const BASE_URL = "https://blynk.cloud/external/api";

const STORAGE_KEY = "smarthome_timers";

function loadTimers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { lightStart: "", lightStop: "", fanStart: "", fanStop: "", lightAuto: false, fanAuto: false };
}

function saveTimers(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const ist = new Date(time.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 42, fontWeight: 700, letterSpacing: 6, color: "#e0f7fa", textShadow: "0 0 24px #00e5ff88" }}>
        {ist.toLocaleTimeString("en-US", { hour12: false })}
      </div>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, color: "#80deea", letterSpacing: 3, marginTop: 4 }}>
        {ist.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} • IST
      </div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 20,
      background: active ? "rgba(0,230,118,0.15)" : "rgba(255,255,255,0.07)",
      border: `1px solid ${active ? "#00e676" : "#ffffff22"}`,
      color: active ? "#00e676" : "#78909c",
      fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 2
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: active ? "#00e676" : "#546e7a",
        boxShadow: active ? "0 0 8px #00e676" : "none",
        animation: active ? "pulse 1.5s infinite" : "none"
      }} />
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

function DeviceCard({ icon, label, isOn, onToggle, start, stop, onStartChange, onStopChange, onSave, autoEnabled, accentColor }) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave();
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${isOn ? accentColor + "44" : "#ffffff11"}`,
      borderRadius: 20,
      padding: "28px 28px 24px",
      width: 300,
      boxShadow: isOn ? `0 0 40px ${accentColor}22, 0 8px 32px rgba(0,0,0,0.4)` : "0 8px 32px rgba(0,0,0,0.3)",
      transition: "all 0.4s ease",
      backdropFilter: "blur(20px)",
      position: "relative",
      overflow: "hidden"
    }}>
      {isOn && (
        <div style={{
          position: "absolute", top: -40, right: -40, width: 140, height: 140,
          borderRadius: "50%", background: accentColor + "22",
          filter: "blur(40px)", pointerEvents: "none"
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 28,
            filter: isOn ? `drop-shadow(0 0 10px ${accentColor})` : "grayscale(1) opacity(0.5)",
            transition: "filter 0.4s"
          }}>{icon}</span>
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: 2, color: "#e0f7fa" }}>
              {label}
            </div>
            <StatusBadge active={isOn} />
          </div>
        </div>

        <div
          onClick={onToggle}
          style={{
            width: 54, height: 28, borderRadius: 14,
            background: isOn ? `linear-gradient(135deg, ${accentColor}, ${accentColor}99)` : "rgba(255,255,255,0.1)",
            border: `1px solid ${isOn ? accentColor : "#ffffff22"}`,
            cursor: "pointer", position: "relative", transition: "all 0.35s ease",
            boxShadow: isOn ? `0 0 16px ${accentColor}66` : "none"
          }}
        >
          <div style={{
            position: "absolute", top: 3, left: isOn ? 29 : 3,
            width: 20, height: 20, borderRadius: "50%", background: "white",
            transition: "left 0.3s ease",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
          }} />
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 }} />

      <div style={{ marginBottom: 6 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 14,
          fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: 3,
          color: autoEnabled ? accentColor : "#546e7a", fontWeight: 700
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          SCHEDULE {autoEnabled ? "• ON" : "• OFF"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ display: "block", fontFamily: "'Rajdhani', sans-serif", fontSize: 10, color: "#78909c", letterSpacing: 2, marginBottom: 5 }}>
              START
            </label>
            <input
              type="time"
              value={start}
              onChange={(e) => onStartChange(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 10,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#e0f7fa", fontFamily: "'Orbitron', monospace", fontSize: 13,
                outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "'Rajdhani', sans-serif", fontSize: 10, color: "#78909c", letterSpacing: 2, marginBottom: 5 }}>
              STOP
            </label>
            <input
              type="time"
              value={stop}
              onChange={(e) => onStopChange(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 10,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#e0f7fa", fontFamily: "'Orbitron', monospace", fontSize: 13,
                outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        style={{
          width: "100%", marginTop: 14, padding: "11px",
          borderRadius: 12, border: `1px solid ${accentColor}55`,
          background: saving ? `${accentColor}33` : `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)`,
          color: accentColor, cursor: "pointer",
          fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 3,
          transition: "all 0.3s ease",
          boxShadow: saving ? `0 0 20px ${accentColor}44` : "none"
        }}
      >
        {saving ? "✓  SAVED" : "SAVE SCHEDULE"}
      </button>
    </div>
  );
}

export default function App() {
  const [light, setLight] = useState(false);
  const [fan, setFan] = useState(false);
  const [toast, setToast] = useState(null);

  const saved = loadTimers();
  const [lightStart, setLightStart] = useState(saved.lightStart);
  const [lightStop, setLightStop] = useState(saved.lightStop);
  const [fanStart, setFanStart] = useState(saved.fanStart);
  const [fanStop, setFanStop] = useState(saved.fanStop);
  const [lightAuto, setLightAuto] = useState(saved.lightAuto);
  const [fanAuto, setFanAuto] = useState(saved.fanAuto);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const playAlert = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      o.start(); o.stop(ctx.currentTime + 0.5);
    } catch {}
  }, []);

  // ✅ Fix 1: Wrapped in useCallback
  const fetchStatus = useCallback(async () => {
    try {
      const [lRes, fRes] = await Promise.all([
        fetch(`${BASE_URL}/get?token=${BLYNK_TOKEN}&V0`),
        fetch(`${BASE_URL}/get?token=${BLYNK_TOKEN}&V1`)
      ]);
      setLight((await lRes.text()) === "1");
      setFan((await fRes.text()) === "1");
    } catch {
      showToast("Could not connect to Blynk", "error");
    }
  }, [showToast]);

  // ✅ Fix 2: Wrapped in useCallback
  const updateLight = useCallback(async (value) => {
    try {
      await fetch(`${BASE_URL}/update?token=${BLYNK_TOKEN}&V0=${value}`);
      setLight(value === 1);
      if (value === 0) playAlert();
    } catch {}
  }, [playAlert]);

  // ✅ Fix 3: Wrapped in useCallback
  const updateFan = useCallback(async (value) => {
    try {
      await fetch(`${BASE_URL}/update?token=${BLYNK_TOKEN}&V1=${value}`);
      setFan(value === 1);
      if (value === 0) playAlert();
    } catch {}
  }, [playAlert]);

  const saveLightAutomation = () => {
    if (!lightStart || !lightStop) { showToast("Set both start and stop times for Light", "error"); return; }
    const data = { lightStart, lightStop, fanStart, fanStop, lightAuto: true, fanAuto };
    saveTimers(data);
    setLightAuto(true);
    showToast("💡 Light schedule saved & active");
  };

  const saveFanAutomation = () => {
    if (!fanStart || !fanStop) { showToast("Set both start and stop times for Fan", "error"); return; }
    const data = { lightStart, lightStop, fanStart, fanStop, lightAuto, fanAuto: true };
    saveTimers(data);
    setFanAuto(true);
    showToast("🌀 Fan schedule saved & active");
  };

  useEffect(() => {
    fetchStatus();

    const interval = setInterval(() => {
      const now = new Date();
      const ist = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      const current = `${ist.getHours().toString().padStart(2, "0")}:${ist.getMinutes().toString().padStart(2, "0")}`;

      if (lightAuto) {
        if (current === lightStart) updateLight(1);
        if (current === lightStop) updateLight(0);
      }

      if (fanAuto) {
        if (current === fanStart) updateFan(1);
        if (current === fanStop) updateFan(0);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [
    lightAuto, fanAuto,
    lightStart, lightStop,
    fanStart, fanStop,
    fetchStatus, updateLight, updateFan
  ]);

  return (
    <div style={{
      minHeight: "100vh", padding: "40px 20px",
      background: "radial-gradient(ellipse at 20% 20%, #0d2137 0%, #050d1a 60%, #0a0a12 100%)",
      fontFamily: "'Rajdhani', sans-serif",
      position: "relative", overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gridScroll { from{background-position:0 0} to{background-position:0 60px} }
        input[type='time']::-webkit-calendar-picker-indicator { filter: invert(0.7) sepia(1) hue-rotate(160deg); cursor: pointer; }
        input[type='time']:focus { border-color: rgba(255,255,255,0.3) !important; }
        button:hover { opacity: 0.85 !important; transform: translateY(-1px); }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        animation: "gridScroll 8s linear infinite"
      }} />

      <div style={{ position:"fixed", top:-100, left:-100, width:400, height:400, borderRadius:"50%", background:"rgba(0,150,255,0.04)", filter:"blur(80px)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:-100, right:-100, width:400, height:400, borderRadius:"50%", background:"rgba(0,255,180,0.04)", filter:"blur(80px)", pointerEvents:"none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", animation: "fadeSlide 0.6s ease" }}>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 30,
            background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)",
            color: "#00e5ff", fontSize: 11, letterSpacing: 4, fontWeight: 700, marginBottom: 16
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e5ff", boxShadow: "0 0 8px #00e5ff", animation: "pulse 2s infinite" }} />
            SMART HOME SYSTEM
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900,
            color: "#e0f7fa", letterSpacing: 4, margin: 0,
            textShadow: "0 0 30px rgba(0,229,255,0.3)"
          }}>IoT DASHBOARD</h1>
        </div>

        <Clock />

        <div style={{
          display: "flex", justifyContent: "center", gap: 20, marginBottom: 36,
          padding: "16px 24px", borderRadius: 14,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)"
        }}>
          {[
            { label: "LIGHT", isOn: light, color: "#ffeb3b" },
            { label: "FAN", isOn: fan, color: "#00e5ff" },
            { label: "LIGHT AUTO", isOn: lightAuto, color: "#00e676" },
            { label: "FAN AUTO", isOn: fanAuto, color: "#00e676" }
          ].map(({ label, isOn, color }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#546e7a", marginBottom: 4 }}>{label}</div>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", margin: "0 auto",
                background: isOn ? color : "#1e2a35",
                boxShadow: isOn ? `0 0 10px ${color}` : "none",
                transition: "all 0.3s"
              }} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
          <DeviceCard
            icon="💡" label="LIGHT" isOn={light}
            onToggle={() => updateLight(light ? 0 : 1)}
            start={lightStart} stop={lightStop}
            onStartChange={setLightStart} onStopChange={setLightStop}
            onSave={saveLightAutomation} autoEnabled={lightAuto}
            accentColor="#ffeb3b"
          />
          <DeviceCard
            icon="🌀" label="FAN" isOn={fan}
            onToggle={() => updateFan(fan ? 0 : 1)}
            start={fanStart} stop={fanStop}
            onStartChange={setFanStart} onStopChange={setFanStop}
            onSave={saveFanAutomation} autoEnabled={fanAuto}
            accentColor="#00e5ff"
          />
        </div>

        <div style={{
          textAlign: "center", marginTop: 40,
          fontFamily: "'Rajdhani', sans-serif", fontSize: 11,
          color: "#37474f", letterSpacing: 3
        }}>
          CONNECTED VIA BLYNK CLOUD • SCHEDULES PERSIST ACROSS SESSIONS
        </div>
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
          padding: "12px 24px", borderRadius: 12,
          background: toast.type === "error" ? "rgba(244,67,54,0.9)" : "rgba(0,230,118,0.9)",
          color: "white", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
          fontSize: 14, letterSpacing: 1, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          backdropFilter: "blur(10px)", animation: "fadeSlide 0.3s ease",
          whiteSpace: "nowrap", zIndex: 999
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}