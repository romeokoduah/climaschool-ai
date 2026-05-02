export function classify(input) {
  const { tempC, humidity, aqi, rainfallMm } = input;

  const heatScore   = clamp((tempC - 28) * 10);
  const dustScore   = clamp((aqi - 50) * 0.7);
  const floodScore  = clamp(rainfallMm * 1.6);
  const malariaScore = clamp(
    (rainfallMm > 5 ? 30 : 0) +
    (humidity > 70 ? 30 : humidity > 55 ? 15 : 0) +
    (tempC > 22 && tempC < 32 ? 25 : 0)
  );

  const candidates = [
    { key: "dryheat",     score: heatScore },
    { key: "harmattan",   score: dustScore },
    { key: "firstrains",  score: Math.max(floodScore, malariaScore - 10) },
    { key: "secondrains", score: Math.min(60, malariaScore * 0.6 + (humidity > 70 ? 20 : 0)) }
  ];
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0];

  const overall = Math.round(Math.max(heatScore * 0.95, dustScore, floodScore, malariaScore));

  let action = "NORMAL · monitor";
  let level  = "ok";
  if (overall >= 85)      { action = "EMERGENCY · escalate";          level = "danger"; }
  else if (overall >= 65) { action = "SCHEDULE MOD · activate";       level = "high"; }
  else if (overall >= 45) { action = "ELEVATED · advisory dispatched"; level = "warn"; }
  else if (overall >= 25) { action = "WATCH · pre-position";          level = "info"; }

  const fires = [];
  if (tempC >= 40)     fires.push(["🔥 Extreme heat", "Forecast > 40°C — closure recommendation to district education."]);
  else if (tempC >= 38) fires.push(["🔥 Heat alert", "Forecast > 38°C — schedule modification + assembly cancelled."]);
  if (aqi >= 150)      fires.push(["🌫 Air quality hazard", "AQI hazardous — indoor PE only, water break protocol."]);
  else if (aqi >= 100) fires.push(["🌫 Dust watch", "AQI elevated — partial window protocol."]);
  if (rainfallMm >= 50) fires.push(["🌧 Flood protocol", "Rainfall > 50 mm/24h — safe-route SMS, attendance flagged 48h."]);
  else if (rainfallMm >= 20) fires.push(["💧 Heavy rain", "Wet-season WASH stations refilled, drainage check."]);
  if (humidity >= 80 && tempC >= 22 && tempC <= 32) fires.push(["🦟 Malaria conditions", "Bednet reminder dispatched · ITN distribution coordinated."]);
  if (fires.length === 0) fires.push(["✅ All clear", "Normal operations — routine monitoring continues."]);

  return { season: top.key, overall, action, level, fires };
}

export const presets = {
  normal:      { tempC: 30, humidity: 55, aqi: 50,  rainfallMm: 0  },
  harmattan:   { tempC: 32, humidity: 28, aqi: 195, rainfallMm: 0  },
  dryheat:     { tempC: 41, humidity: 22, aqi: 85,  rainfallMm: 0  },
  firstrains:  { tempC: 27, humidity: 86, aqi: 60,  rainfallMm: 62 },
  secondrains: { tempC: 25, humidity: 82, aqi: 70,  rainfallMm: 18 }
};

function clamp(n) { return Math.max(0, Math.min(100, n)); }

export function parseUpload(filename, text) {
  const json = filename.toLowerCase().endsWith(".json") || /^[\[{]/.test(text.trim());
  let row;
  if (json) {
    const j = JSON.parse(text);
    row = Array.isArray(j) ? j[j.length - 1] : j;
  } else {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(",").map((s) => s.trim().toLowerCase());
    const last = lines[lines.length - 1].split(",").map((s) => s.trim());
    row = Object.fromEntries(headers.map((h, i) => [h, last[i]]));
  }
  return {
    tempC:      num(row.temp_c ?? row.tempc ?? row.temperature ?? row.temp),
    humidity:   num(row.humidity ?? row.rh),
    aqi:        num(row.aqi ?? row.air_quality),
    rainfallMm: num(row.rainfall_mm ?? row.rain ?? row.rainfall ?? row.precip)
  };
}

function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}
