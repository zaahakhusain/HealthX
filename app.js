/* =========================================================================
   1. SECURITY SANITIZER & CORE UTILITIES
========================================================================= */
function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* Text cleaner: strips control chars / zero-width chars, collapses whitespace, caps length */
function cleanText(str, max = 100) {
  if (typeof str !== "string") return "";
  return str
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2066-\u2069\uFEFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/* Phone numbers inside tel: links keep only digits and + */
function safeTel(num) {
  return String(num == null ? "" : num).replace(/[^\d+]/g, "");
}

/* localStorage can throw (Safari private mode, blocked storage, full quota) - never let it crash the app */
function safeGet(key) {
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, value) {
  try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
}
function safeRemove(key) {
  try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
}
function safeParse(raw, fallback) {
  if (typeof raw !== "string" || raw.length > 400000) return fallback;
  try { return JSON.parse(raw); } catch (e) { return fallback; }
}
function isGoodCoord(c) {
  return !!c && typeof c.lat === "number" && typeof c.lng === "number" &&
    isFinite(c.lat) && isFinite(c.lng) &&
    Math.abs(c.lat) <= 90 && Math.abs(c.lng) <= 180;
}
const BLOOD_GROUP_RE = /^(A|B|AB|O)[+-]$/;

function formatINR(num) {
  return "₹" + Math.round(num).toLocaleString("en-IN");
}

function showToast(msg) {
  const t = document.getElementById("toastBox");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3500);
}

function closeModal() {
  const m = document.getElementById("appModal");
  if (m) m.classList.remove("open");
  const c = document.getElementById("appModalContent");
  if (c) c.innerHTML = "";
}

/* =========================================================================
   2. HYDERABAD ZONES & REAL PROVIDERS + BLOOD BANKS
========================================================================= */
const HYDERABAD_ZONES = {
  "Himayath Sagar (Lords College)": { lat: 17.3457, lng: 78.3746 },
  "Bandlaguda Jagir / Kismatpur":   { lat: 17.3524, lng: 78.3935 },
  "Sun City / Kalimandir":          { lat: 17.3621, lng: 78.4048 },
  "Attapur":                        { lat: 17.3688, lng: 78.4275 },
  "Mehdipatnam":                    { lat: 17.3958, lng: 78.4312 },
  "Tolichowki":                     { lat: 17.3992, lng: 78.4150 },
  "Gandipet / Narsingi":            { lat: 17.3814, lng: 78.3264 },
  "Gachibowli":                     { lat: 17.4401, lng: 78.3489 },
  "Banjara Hills":                  { lat: 17.4156, lng: 78.4347 },
  "Jubilee Hills":                  { lat: 17.4319, lng: 78.4071 },
  "Masab Tank":                     { lat: 17.4025, lng: 78.4512 },
  "Lakdikapul / Nampally":          { lat: 17.4045, lng: 78.4632 },
  "Charminar / Old City":           { lat: 17.3616, lng: 78.4747 },
  "Santosh Nagar / DRDO":           { lat: 17.3456, lng: 78.5022 },
  "LB Nagar":                       { lat: 17.3457, lng: 78.5522 },
  "HITEC City / Madhapur":          { lat: 17.4435, lng: 78.3772 },
  "Secunderabad":                   { lat: 17.4399, lng: 78.4983 }
};

const PROVIDERS = [
  { id: "h40", type: "Hospital", name: "Cura Multi-Specialty Hospital", zone: "Himayath Sagar / Kismatpur", address: "Near TSPA Junction & ORR Exit 17, Himayath Sagar Rd", lat: 17.3495, lng: 78.3842, rating: 4.7, beds: 120, icuBeds: 25, phone: "040-29880108", specialties: ["General Medicine", "Orthopedics", "Cardiology", "Gastroenterology", "Gynecology", "Emergency & Trauma"], diseases: ["Viral / Dengue Fever", "Bone Fracture & Joint Pain", "Chest Pain & Heart", "Stomach Pain & Gallstones", "Pregnancy & Maternity"], priceMultiplier: 0.78, bloodBank: { "A+": 14, "A-": 3, "B+": 19, "B-": 2, "O+": 24, "O-": 4, "AB+": 8, "AB-": 2 } },
  { id: "h41", type: "Hospital", name: "Rishitha Hospitals", zone: "Bandlaguda Jagir / Kismatpur", address: "Chevella Rd, Near Kalimandir & Kismatpur X Rd", lat: 17.3542, lng: 78.3948, rating: 4.7, beds: 150, icuBeds: 30, phone: "040-29551108", specialties: ["General Medicine", "Gynecology", "Orthopedics", "Gastroenterology", "Cardiology"], diseases: ["Viral / Dengue Fever", "Pregnancy & Maternity", "Bone Fracture & Joint Pain", "Stomach Pain & Gallstones"], priceMultiplier: 0.76, bloodBank: { "A+": 11, "A-": 2, "B+": 16, "B-": 3, "O+": 21, "O-": 2, "AB+": 6, "AB-": 1 } },
  { id: "h42", type: "Hospital", name: "Lifecare Multi-Specialty Hospital", zone: "Sun City / Bandlaguda", address: "Sun City Main Road, Bandlaguda Jagir", lat: 17.3612, lng: 78.4018, rating: 4.6, beds: 160, icuBeds: 32, phone: "040-29704455", specialties: ["Neurology", "General Medicine", "Orthopedics", "Gastroenterology", "Cardiology"], diseases: ["Headache, Stroke & Spine", "Viral / Dengue Fever", "Stomach Pain & Gallstones", "Kidney Stones & Urology"], priceMultiplier: 0.79, bloodBank: { "A+": 9, "A-": 1, "B+": 14, "B-": 2, "O+": 18, "O-": 3, "AB+": 5, "AB-": 1 } },
  { id: "h15", type: "Hospital", name: "Germanten Hospital", zone: "Attapur", address: "Pillar No. 150, PVNR Expressway, Attapur", lat: 17.3675, lng: 78.4288, rating: 4.8, beds: 220, icuBeds: 45, phone: "040-24015000", specialties: ["Orthopedics", "Cardiology", "Neurology", "General Medicine", "Gastroenterology"], diseases: ["Bone Fracture & Joint Pain", "Headache, Stroke & Spine", "Chest Pain & Heart", "Viral / Dengue Fever"], priceMultiplier: 0.88, bloodBank: { "A+": 22, "A-": 5, "B+": 28, "B-": 4, "O+": 34, "O-": 6, "AB+": 12, "AB-": 3 } },
  { id: "h13", type: "Hospital", name: "Olive Hospitals", zone: "Mehdipatnam / Tolichowki", address: "Nanal Nagar X Road, Mehdipatnam", lat: 17.3962, lng: 78.4238, rating: 4.7, beds: 250, icuBeds: 55, phone: "040-30499999", specialties: ["Cardiology", "General Medicine", "Orthopedics", "Neurology", "Gastroenterology", "Gynecology"], diseases: ["Chest Pain & Heart", "Viral / Dengue Fever", "Kidney Stones & Urology", "Pregnancy & Maternity", "Headache, Stroke & Spine"], priceMultiplier: 0.86, bloodBank: { "A+": 26, "A-": 6, "B+": 31, "B-": 5, "O+": 40, "O-": 7, "AB+": 15, "AB-": 4 } },
  { id: "h14", type: "Hospital", name: "Premier Hospital", zone: "Mehdipatnam", address: "Ring Road, Nanal Nagar, Mehdipatnam", lat: 17.3951, lng: 78.4265, rating: 4.6, beds: 200, icuBeds: 40, phone: "040-23511111", specialties: ["General Medicine", "Cardiology", "Orthopedics", "Gastroenterology", "Gynecology"], diseases: ["Viral / Dengue Fever", "Stomach Pain & Gallstones", "Pregnancy & Maternity", "Chest Pain & Heart"], priceMultiplier: 0.80, bloodBank: { "A+": 15, "A-": 3, "B+": 18, "B-": 2, "O+": 22, "O-": 4, "AB+": 9, "AB-": 2 } },
  { id: "h6", type: "Hospital", name: "Continental Hospitals", zone: "Gachibowli / Nanakramguda", address: "Plot No. 3, Financial District, Gachibowli", lat: 17.4175, lng: 78.3422, rating: 4.8, beds: 750, icuBeds: 110, phone: "040-67000000", specialties: ["Cardiology", "Orthopedics", "Gastroenterology", "Neurology", "Gynecology", "General Medicine"], diseases: ["Chest Pain & Heart", "Stomach Pain & Gallstones", "Headache, Stroke & Spine", "Bone Fracture & Joint Pain"], priceMultiplier: 1.05, bloodBank: { "A+": 42, "A-": 9, "B+": 48, "B-": 8, "O+": 55, "O-": 11, "AB+": 20, "AB-": 6 } },
  { id: "h2", type: "Hospital", name: "AIG Hospitals", zone: "Gachibowli", address: "Mindspace Road, Gachibowli", lat: 17.4436, lng: 78.3658, rating: 4.9, beds: 800, icuBeds: 140, phone: "040-42444222", specialties: ["Gastroenterology", "Cardiology", "Neurology", "Orthopedics", "General Medicine"], diseases: ["Stomach Pain & Gallstones", "Kidney Stones & Urology", "Chest Pain & Heart", "Viral / Dengue Fever"], priceMultiplier: 1.08, bloodBank: { "A+": 50, "A-": 12, "B+": 64, "B-": 10, "O+": 70, "O-": 14, "AB+": 25, "AB-": 7 } },
  { id: "h1", type: "Hospital", name: "Apollo Health City", zone: "Jubilee Hills", address: "Road No. 72, Jubilee Hills", lat: 17.4204, lng: 78.4116, rating: 4.9, beds: 550, icuBeds: 95, phone: "040-23607777", specialties: ["Cardiology", "Neurology", "Orthopedics", "Gastroenterology", "Ophthalmology", "General Medicine"], diseases: ["Chest Pain & Heart", "Headache, Stroke & Spine", "Bone Fracture & Joint Pain", "Eye Blur & Cataract"], priceMultiplier: 1.12, bloodBank: { "A+": 48, "A-": 11, "B+": 52, "B-": 9, "O+": 65, "O-": 15, "AB+": 22, "AB-": 8 } },
  { id: "h9", type: "Hospital", name: "L V Prasad Eye Institute", zone: "Banjara Hills", address: "Road No. 2, Banjara Hills", lat: 17.4258, lng: 78.4267, rating: 4.9, beds: 180, icuBeds: 15, phone: "040-68102020", specialties: ["Ophthalmology"], diseases: ["Eye Blur & Cataract"], priceMultiplier: 0.85, bloodBank: null },
  { id: "dc1", type: "Diagnostic", name: "Vijaya Diagnostic Centre", zone: "Bandlaguda Jagir / Attapur", address: "Sun City Bandlaguda Jagir & Attapur Pillar 143", lat: 17.3635, lng: 78.4065, rating: 4.9, beds: "85+ Labs", icuBeds: "3T MRI / CT", phone: "040-23420420", specialties: ["Radiology & Diagnostics"], diseases: ["Viral / Dengue Fever", "Full Body Checkup & MRI"], priceMultiplier: 0.70, bloodBank: null },
  { id: "dc2", type: "Diagnostic", name: "Lucid Medical Diagnostics", zone: "Attapur / Mehdipatnam", address: "Attapur Pillar 125 & Mehdipatnam", lat: 17.3765, lng: 78.4312, rating: 4.8, beds: "24 Labs", icuBeds: "3T Silent MRI", phone: "040-44194444", specialties: ["Radiology & Diagnostics"], diseases: ["Full Body Checkup & MRI"], priceMultiplier: 0.68, bloodBank: null }
];

const DOCTORS = [
  { id: "d1", name: "Dr. Abdul Baseer", spec: "Cardiology", role: "Senior Interventional Cardiologist", exp: "20 Yrs", hospId: "h13", fee: 750, slots: ["10:30 AM", "03:00 PM", "06:00 PM"], treats: "Chest pain, BP, palpitations, heart blockages" },
  { id: "d2", name: "Dr. Mir Jawad Zar Khan", spec: "Orthopedics", role: "Senior Joint & Trauma Surgeon", exp: "24 Yrs", hospId: "h15", fee: 800, slots: ["10:00 AM", "01:00 PM", "05:00 PM"], treats: "Knee pain, bone fractures, ligament tears, back pain" },
  { id: "d3", name: "Dr. P. Vamsi Krishna", spec: "Gastroenterology", role: "Laparoscopic GI & Stone Specialist", exp: "22 Yrs", hospId: "h42", fee: 500, slots: ["10:00 AM", "01:30 PM", "05:30 PM"], treats: "Stomach pain, acidity, gallbladder & kidney stones" },
  { id: "d4", name: "Dr. B. Chandrasekhar Reddy", spec: "Neurology", role: "Brain, Stroke & Spine Specialist", exp: "23 Yrs", hospId: "h42", fee: 600, slots: ["11:00 AM", "04:00 PM"], treats: "Migraine, severe headache, dizziness, nerve/spine pain" },
  { id: "d5", name: "Dr. Nagesh S. & Panel", spec: "General Medicine", role: "Senior Consultant Physician (MD)", exp: "25 Yrs", hospId: "h40", fee: 450, slots: ["09:30 AM", "01:00 PM", "06:30 PM"], treats: "Viral fever, dengue, typhoid, diabetes, weakness, cough" },
  { id: "d6", name: "Dr. Ayesha Farheen", spec: "Gynecology", role: "Senior Obstetrician & Gynecologist", exp: "19 Yrs", hospId: "h41", fee: 450, slots: ["10:00 AM", "12:30 PM", "05:30 PM"], treats: "Pregnancy care, C-section, maternity, PCOD" },
  { id: "d7", name: "Dr. Alla Gopala Krishna Gokhale", spec: "Cardiology", role: "Chief Cardiothoracic Surgeon", exp: "32 Yrs", hospId: "h1", fee: 1200, slots: ["11:00 AM", "03:00 PM"], treats: "Bypass surgery, complex heart valve & chest pain" },
  { id: "d8", name: "Dr. D. Nageshwar Reddy", spec: "Gastroenterology", role: "Chairman & Chief Gastroenterologist", exp: "38 Yrs", hospId: "h2", fee: 1500, slots: ["11:00 AM", "03:00 PM"], treats: "Liver disease, severe stomach ulcers, endoscopy, pancreas" },
  { id: "d9", name: "Dr. S. Padmaja", spec: "Ophthalmology", role: "Senior Cataract & Retina Surgeon", exp: "21 Yrs", hospId: "h9", fee: 600, slots: ["09:30 AM", "02:30 PM"], treats: "Blurry vision, cataract, eye pain, diabetic retinopathy" }
];

const SYMPTOM_RULES = [
  { id: "ALL", label: "All Symptoms / General Checkup", keywords: [], spec: "General Medicine", diseaseTag: "Viral / Dengue Fever", advice: "Select or type your symptom above to see the exact specialist doctor and nearest equipped hospital." },
  { id: "FEVER", label: "High Fever / Dengue / Cough / Weakness", keywords: ["fever", "cold", "cough", "dengue", "typhoid", "weakness", "flu", "infection", "body pain", "malaria"], spec: "General Medicine", diseaseTag: "Viral / Dengue Fever", advice: "Recommended Specialist: General Physician (MD). If fever lasts >3 days, get a CBC & Dengue NS1 blood panel." },
  { id: "HEART", label: "Chest Pain / Breathlessness / High BP", keywords: ["chest", "heart", "bp", "breath", "palpitation", "sweating", "left arm", "angina"], spec: "Cardiology", diseaseTag: "Chest Pain & Heart", advice: "Recommended Specialist: Cardiologist (24x7 Cath Lab & ECG required). For sudden severe chest pain, use the red Ambulance button immediately." },
  { id: "ORTHO", label: "Knee Pain / Bone Fracture / Joint Swelling", keywords: ["knee", "bone", "fracture", "joint", "back pain", "ligament", "acl", "shoulder", "arthritis"], spec: "Orthopedics", diseaseTag: "Bone Fracture & Joint Pain", advice: "Recommended Specialist: Orthopedic & Joint Surgeon with digital X-Ray / MRI support." },
  { id: "GASTRO", label: "Stomach Pain / Acidity / Gallstones / Kidney Stones", keywords: ["stomach", "abdomen", "acidity", "vomit", "gallbladder", "stone", "kidney", "liver", "appendix", "digestion"], spec: "Gastroenterology", diseaseTag: "Stomach Pain & Gallstones", advice: "Recommended Specialist: Gastroenterologist / Laparoscopic Surgeon (Ultrasound Abdomen recommended)." },
  { id: "NEURO", label: "Severe Headache / Migraine / Vertigo / Slip Disc", keywords: ["headache", "migraine", "dizzy", "stroke", "paralysis", "seizure", "nerve", "spine", "neck pain"], spec: "Neurology", diseaseTag: "Headache, Stroke & Spine", advice: "Recommended Specialist: Neurologist (DM). Persistent numbness or slurred speech requires immediate CT/MRI." },
  { id: "GYNEC", label: "Pregnancy / Maternity / Women's Health", keywords: ["pregnancy", "maternity", "delivery", "period", "pcod", "gynec", "baby", "labour"], spec: "Gynecology", diseaseTag: "Pregnancy & Maternity", advice: "Recommended Specialist: Obstetrician & Gynecologist with 24x7 Maternity & NICU support." },
  { id: "EYE", label: "Blurry Vision / Cataract / Eye Redness", keywords: ["eye", "vision", "blur", "cataract", "glasses", "retina"], spec: "Ophthalmology", diseaseTag: "Eye Blur & Cataract", advice: "Recommended Specialist: Ophthalmologist (Eye Specialist)." }
];

const PROCEDURES = [
  { id: "p1", name: "Total Knee Replacement (Unilateral)", category: "Surgery", specialty: "Orthopedics", basePrice: 165000, stay: "4 Days" },
  { id: "p2", name: "Coronary Angioplasty (1 Stent)", category: "Surgery", specialty: "Cardiology", basePrice: 148000, stay: "3 Days" },
  { id: "p3", name: "Laparoscopic Gallbladder Stone Removal", category: "Surgery", specialty: "Gastroenterology", basePrice: 68000, stay: "2 Days" },
  { id: "p4", name: "C-Section Maternity Delivery Package", category: "Surgery", specialty: "Gynecology", basePrice: 78000, stay: "3 Days" },
  { id: "p5", name: "Cataract Phaco Surgery (Foldable Lens)", category: "Surgery", specialty: "Ophthalmology", basePrice: 28000, stay: "Day Care" },
  { id: "c1", name: "Full Body Master Health Checkup (82 Tests)", category: "Checkup", specialty: "Radiology & Diagnostics", basePrice: 4400, stay: "2.5 Hours" },
  { id: "c2", name: "3 Tesla MRI Brain / Spine Scan", category: "Checkup", specialty: "Radiology & Diagnostics", basePrice: 7200, stay: "45 Mins" }
];

/* =========================================================================
   3. STATE: LOCATION, GPS AUTO-DETECT & USER AUTH PROFILE
========================================================================= */
const DEFAULT_ZONE = "Himayath Sagar (Lords College)";
let currentZone = (() => {
  const z = safeGet("hx_zone");
  return z && Object.prototype.hasOwnProperty.call(HYDERABAD_ZONES, z) ? z : DEFAULT_ZONE;
})();
let customCoords = (() => {
  const c = safeParse(safeGet("hx_coords"), null);
  return isGoodCoord(c) ? { lat: c.lat, lng: c.lng } : null;
})();
let gpsConnected = safeGet("hx_gps_connected") === "true";

const GUEST_USER = { mode: "guest", name: "Guest User", aadhaarMasked: null, role: "Patient" };
let currentUser = (() => {
  const u = safeParse(safeGet("hx_user"), null);
  if (!u || typeof u !== "object") return { ...GUEST_USER };
  const mode = ["guest", "aadhaar", "member"].includes(u.mode) ? u.mode : "guest";
  const name = cleanText(u.name, 60) || "Guest User";
  const masked = typeof u.aadhaarMasked === "string" && /^(XXXX-XXXX-\d{4}|ABHA-Linked)$/.test(u.aadhaarMasked) ? u.aadhaarMasked : null;
  return { mode, name, aadhaarMasked: masked, role: "Patient" };
})();

function getOriginCoords() {
  if (isGoodCoord(customCoords)) return customCoords;
  return HYDERABAD_ZONES[currentZone] || HYDERABAD_ZONES["Himayath Sagar (Lords College)"];
}

function calcDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.max(0.4, +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.28).toFixed(1));
}

function getProvidersSorted() {
  const origin = getOriginCoords();
  return PROVIDERS.map(p => {
    const dist = calcDistanceKm(origin.lat, origin.lng, p.lat, p.lng);
    return { ...p, distanceKm: dist, driveMins: Math.max(3, Math.round(dist * 2.8)) };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

/* AUTO-GPS DETECTION & LOCATION AUTOCORRECT */
function connectLiveGPS(silent = false) {
  const bannerText = document.getElementById("gpsBannerText");
  const bannerBtn = document.getElementById("gpsConnectBtn");
  if (!navigator.geolocation) {
    if (!silent) showToast("Browser GPS unavailable. Type your area in the location box.");
    return;
  }
  if (bannerText) bannerText.textContent = "Acquiring live satellite GPS coordinates...";

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      customCoords = { lat: latitude, lng: longitude };
      safeSet("hx_coords", JSON.stringify(customCoords));
      gpsConnected = true;
      safeSet("hx_gps_connected", "true");

      // Snap to nearest known Hyderabad zone name
      let nearestName = currentZone;
      let minD = 9999;
      Object.entries(HYDERABAD_ZONES).forEach(([zName, c]) => {
        const d = calcDistanceKm(latitude, longitude, c.lat, c.lng);
        if (d < minD) { minD = d; nearestName = zName; }
      });
      currentZone = nearestName;
      safeSet("hx_zone", currentZone);

      updateLocationUI();
      refreshAllPageViews();
      if (!silent) showToast(`Live GPS Connected: Near ${currentZone}`);
    },
    () => {
      gpsConnected = false;
      safeSet("hx_gps_connected", "false");
      updateLocationUI();
      if (!silent) showToast("GPS permission blocked. Using selected Hyderabad area pin.");
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

function updateLocationUI() {
  const locInput = document.getElementById("headerLocationInput");
  if (locInput) locInput.value = currentZone;

  document.querySelectorAll(".active-zone-label").forEach(el => {
    el.textContent = currentZone;
  });

  const bannerText = document.getElementById("gpsBannerText");
  const bannerBtn = document.getElementById("gpsConnectBtn");
  if (bannerText && bannerBtn) {
    if (gpsConnected && customCoords) {
      bannerText.innerHTML = `<span class="gps-status-dot"></span><strong>Live GPS Connected:</strong> ${escapeHTML(currentZone)} (${customCoords.lat.toFixed(4)}°N, ${customCoords.lng.toFixed(4)}°E)`;
      bannerBtn.textContent = "Refresh GPS";
    } else {
      bannerText.innerHTML = `<span class="gps-status-dot"></span><strong>GPS Not Connected:</strong> Connect Live GPS so HealthX can auto-detect hospitals & doctors closest to you. Current Pin: <strong>${escapeHTML(currentZone)}</strong>`;
      bannerBtn.textContent = "📡 Connect Live GPS Now";
    }
  }
}

function handleLocationTyping(val) {
  const box = document.getElementById("locSuggestionsBox");
  if (!box) return;
  const q = cleanText(String(val || ""), 60).toLowerCase();
  const zones = Object.keys(HYDERABAD_ZONES);

  // Auto-correct fuzzy match
  const matches = zones.filter(z => z.toLowerCase().includes(q));
  if (matches.length === 0 && q.length >= 2) {
    // Fallback levenshtein prefix match
    const fallback = zones.filter(z => z.toLowerCase().startsWith(q.slice(0, 2)));
    matches.push(...fallback);
  }

  box.innerHTML = (matches.length ? matches : zones).slice(0, 7).map(z =>
    `<div class="loc-item" role="option" data-zone="${escapeHTML(z)}" onclick="selectZoneFromAutocomplete(this.dataset.zone)">📍 ${escapeHTML(z)}</div>`
  ).join("");
  box.classList.add("open");
}

function selectZoneFromAutocomplete(zoneName) {
  if (!Object.prototype.hasOwnProperty.call(HYDERABAD_ZONES, zoneName)) return;
  currentZone = zoneName;
  customCoords = null;
  gpsConnected = false;
  safeSet("hx_zone", currentZone);
  safeRemove("hx_coords");
  safeSet("hx_gps_connected", "false");
  const box = document.getElementById("locSuggestionsBox");
  if (box) box.classList.remove("open");
  updateLocationUI();
  refreshAllPageViews();
  showToast(`Location updated to ${currentZone}`);
}

/* =========================================================================
   4. TOP-RIGHT LOGIN / GUEST / AADHAAR PROFILE SYSTEM
========================================================================= */
function toggleProfileDropdown() {
  const dd = document.getElementById("profileDropdown");
  if (dd) dd.classList.toggle("open");
}

function renderProfileHeader() {
  const btnLabel = document.getElementById("profileBtnLabel");
  const avatarMini = document.getElementById("profileAvatarMini");
  const dd = document.getElementById("profileDropdown");
  if (!btnLabel || !dd) return;

  const initials = currentUser.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  btnLabel.textContent = currentUser.name;
  if (avatarMini) avatarMini.textContent = initials;

  dd.innerHTML = `
    <div style="border-bottom:1px solid var(--bg-navy-tint);padding-bottom:10px;margin-bottom:12px;">
      <span class="badge-navy solid">${escapeHTML(currentUser.mode.toUpperCase())} PROFILE</span>
      <h4 style="margin-top:6px;">${escapeHTML(currentUser.name)}</h4>
      <p style="margin-bottom:0;">
        ${currentUser.aadhaarMasked ? `Aadhaar e-KYC: ${escapeHTML(currentUser.aadhaarMasked)}` : "Unverified Guest Session"}
      </p>
    </div>

    <button class="auth-option-btn" onclick="openAuthModal('login')">
      <span>🔑 Standard User Login</span><span>→</span>
    </button>
    <button class="auth-option-btn" onclick="openAuthModal('aadhaar')">
      <span>🪪 Continue with Aadhaar e-KYC</span><span>→</span>
    </button>
    <button class="auth-option-btn" onclick="continueAsGuest()">
      <span>👤 Continue as Guest</span><span>✓</span>
    </button>
  `;
}

function continueAsGuest() {
  currentUser = { mode: "guest", name: "Guest User", aadhaarMasked: null, role: "Patient" };
  safeSet("hx_user", JSON.stringify(currentUser));
  renderProfileHeader();
  toggleProfileDropdown();
  showToast("Continuing as Guest User.");
}

function openAuthModal(type) {
  const dd = document.getElementById("profileDropdown");
  if (dd) dd.classList.remove("open");

  const modal = document.getElementById("appModalContent");
  if (type === "aadhaar") {
    modal.innerHTML = `
      <span class="badge-navy solid">UIDAI / ABHA VERIFIED GATEWAY</span>
      <h3 style="font-size:20px;margin:8px 0 4px;">Continue with Aadhaar</h3>
      <p style="font-size:13px;color:var(--navy-muted);margin-bottom:16px;">Link your 12-digit Aadhaar number to auto-sync your ABHA Health ID and Family Locker.</p>
      <div style="display:grid;gap:12px;">
        <div>
          <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Full Name (as on Aadhaar)</label>
          <input id="aadhaarName" class="input-std" maxlength="60" autocomplete="name" value="Syed Zaahak Husain" />
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">12-Digit Aadhaar Number</label>
          <input id="aadhaarNum" class="input-std mono" maxlength="14" inputmode="numeric" autocomplete="off" placeholder="XXXX XXXX 4829" value="8492 7104 4829" />
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">6-Digit Aadhaar OTP (Demo: 123456)</label>
          <input id="aadhaarOtp" class="input-std mono" maxlength="6" inputmode="numeric" autocomplete="one-time-code" value="123456" />
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
          <button class="btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn-navy" onclick="submitAadhaarLogin()">Verify Aadhaar &amp; Login</button>
        </div>
      </div>
    `;
  } else {
    modal.innerHTML = `
      <span class="badge-navy solid">HEALTHX ACCOUNT LOGIN</span>
      <h3 style="font-size:20px;margin:8px 0 4px;">Sign In to Your Profile</h3>
      <p style="font-size:13px;color:var(--navy-muted);margin-bottom:16px;">Access your saved medical records, family profiles, and hospital bookings.</p>
      <div style="display:grid;gap:12px;">
        <div>
          <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Your Name</label>
          <input id="loginNameInput" class="input-std" maxlength="60" autocomplete="name" value="Syed Zaahak Husain" />
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Mobile / Email</label>
          <input id="loginContactInput" class="input-std" maxlength="60" autocomplete="off" value="+91 98490 XXXXX" />
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
          <button class="btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn-navy" onclick="submitStandardLogin()">Sign In</button>
        </div>
      </div>
    `;
  }
  document.getElementById("appModal").classList.add("open");
}

function submitAadhaarLogin() {
  const name = cleanText(document.getElementById("aadhaarName")?.value || "", 60) || "Verified Citizen";
  const rawNum = (document.getElementById("aadhaarNum")?.value || "").replace(/\D/g, "");
  const otp = (document.getElementById("aadhaarOtp")?.value || "").trim();
  if (rawNum.length !== 12) {
    showToast("Please enter a valid 12-digit Aadhaar number.");
    return;
  }
  if (!/^\d{6}$/.test(otp)) {
    showToast("Please enter the 6-digit OTP.");
    return;
  }
  const masked = "XXXX-XXXX-" + rawNum.slice(-4);
  currentUser = { mode: "aadhaar", name, aadhaarMasked: masked, role: "Patient" };
  safeSet("hx_user", JSON.stringify(currentUser));
  closeModal();
  renderProfileHeader();
  showToast(`Aadhaar Verified (${masked}). Welcome, ${name}!`);
}

function submitStandardLogin() {
  const name = cleanText(document.getElementById("loginNameInput")?.value || "", 60) || "HealthX User";
  currentUser = { mode: "member", name, aadhaarMasked: "ABHA-Linked", role: "Patient" };
  safeSet("hx_user", JSON.stringify(currentUser));
  closeModal();
  renderProfileHeader();
  showToast(`Signed in as ${name}`);
}

/* =========================================================================
   5. RED EMERGENCY AMBULANCE DISPATCH MODAL (THE ONLY RED FEATURE)
========================================================================= */
function openAmbulanceModal() {
  const nearestHospitals = getProvidersSorted().filter(p => p.type === "Hospital").slice(0, 3);
  const origin = getOriginCoords();

  document.getElementById("appModalContent").innerHTML = `
    <div style="border-bottom:2px solid #DC2626;padding-bottom:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <span style="background:#DC2626;color:#FFF;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:800;">24x7 EMERGENCY ALS / ICU AMBULANCE</span>
        <h3 style="font-size:21px;margin-top:6px;">Emergency Ambulance Dispatch</h3>
      </div>
      <a href="tel:108" class="btn-ambulance" style="text-decoration:none;">📞 Call 108 Now</a>
    </div>

    <p style="font-size:13px;color:var(--navy-slate);margin-bottom:14px;">
      <strong>Your Active Pickup Location:</strong> ${escapeHTML(currentZone)} (${origin.lat.toFixed(4)}°N, ${origin.lng.toFixed(4)}°E)
    </p>

    <div style="display:grid;gap:10px;margin-bottom:16px;">
      ${nearestHospitals.map(h => `
        <div style="border:1.5px solid var(--navy-border);border-radius:10px;padding:12px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div>
            <strong style="font-size:14.5px;display:block;">${escapeHTML(h.name)}</strong>
            <span style="font-size:12px;color:var(--navy-muted);">📍 ${h.distanceKm} km away (~${h.driveMins} mins ETA) •${h.icuBeds} ICU Beds</span>
          </div>
          <div style="display:flex;gap:8px;">
            <a href="tel:${safeTel(h.phone)}" class="btn-outline" style="padding:7px 12px;">📞 ${escapeHTML(h.phone)}</a>
            <button class="btn-ambulance" style="padding:7px 14px;font-size:12px;" data-hosp="${escapeHTML(h.name)}" data-eta="${Number(h.driveMins) || 0}" onclick="dispatchHospitalAmbulance(this.dataset.hosp, Number(this.dataset.eta))">
              🚑 Dispatch (${h.driveMins}m)
            </button>
          </div>
        </div>
      `).join("")}
    </div>

    <div style="display:flex;justify-content:flex-end;">
      <button class="btn-outline" onclick="closeModal()">Close</button>
    </div>
  `;
  document.getElementById("appModal").classList.add("open");
}

function dispatchHospitalAmbulance(hospName, etaMins) {
  closeModal();
  showToast(`🚑 Emergency Ambulance dispatched from ${hospName}! Live GPS shared. ETA: ~${etaMins} mins.`);
}

/* =========================================================================
   6. HOME PAGE: SYMPTOM DETECTOR -> DOCTORS & NEAREST HOSPITALS
========================================================================= */
let activeSymptomRuleId = "ALL";

function selectSymptomChip(ruleId) {
  activeSymptomRuleId = ruleId;
  const selectEl = document.getElementById("symptomCategorySelect");
  if (selectEl) selectEl.value = ruleId;
  renderSymptomMatches();
}

function renderSymptomMatches() {
  const docGrid = document.getElementById("homeSymptomDoctorsGrid");
  const hospGrid = document.getElementById("homeSymptomHospitalsGrid");
  const recBanner = document.getElementById("symptomRecommendationBanner");
  if (!docGrid || !hospGrid) return;

  const rawText = (document.getElementById("symptomInput")?.value || "").trim().toLowerCase();
  const dropdownVal = document.getElementById("symptomCategorySelect")?.value || activeSymptomRuleId;

  // Determine matched rule from typed symptom or dropdown
  let matchedRule = SYMPTOM_RULES.find(r => r.id === dropdownVal) || SYMPTOM_RULES[0];
  if (rawText.length >= 2) {
    const foundByKeyword = SYMPTOM_RULES.find(r =>
      r.keywords.some(k => rawText.includes(k)) || r.label.toLowerCase().includes(rawText)
    );
    if (foundByKeyword) matchedRule = foundByKeyword;
  }

  document.querySelectorAll(".sym-chip").forEach(c => {
    c.classList.toggle("active", c.dataset.sym === matchedRule.id);
  });

  if (recBanner) {
    recBanner.innerHTML = `
      <div>
        <span class="badge-navy" style="margin-bottom:6px;">SYMPTOM &amp; DISEASE MATCH</span>
        <h3>Recommended Specialist: ${escapeHTML(matchedRule.spec)}</h3>
        <p>${escapeHTML(matchedRule.advice)}</p>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px;color:#CBD5E1;">Searching Near</div>
        <strong style="font-size:15px;color:#FFFFFF;">📍 ${escapeHTML(currentZone)}</strong>
      </div>
    `;
  }

  const providersByDist = getProvidersSorted();
  const providerMap = Object.fromEntries(providersByDist.map(p => [p.id, p]));

  // Filter Doctors & sort by nearest hospital
  const matchedDoctors = DOCTORS.filter(d => {
    if (matchedRule.id === "ALL" && !rawText) return true;
    const specMatch = d.spec === matchedRule.spec;
    const textMatch = rawText && (d.treats.toLowerCase().includes(rawText) || d.name.toLowerCase().includes(rawText) || d.spec.toLowerCase().includes(rawText));
    return specMatch || textMatch;
  }).sort((a, b) => (providerMap[a.hospId]?.distanceKm || 99) - (providerMap[b.hospId]?.distanceKm || 99));

  docGrid.innerHTML = matchedDoctors.map(d => {
    const hosp = providerMap[d.hospId] || providersByDist[0];
    return `
      <article class="card">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <span class="badge-navy solid">${escapeHTML(d.spec)}</span>
            <span class="mono" style="font-weight:800;font-size:14px;">₹${d.fee} Consult</span>
          </div>
          <h3 style="font-size:17.5px;margin:10px 0 2px;">${escapeHTML(d.name)}</h3>
          <div style="font-size:12.5px;color:var(--navy-muted);margin-bottom:8px;">${escapeHTML(d.role)} • ${escapeHTML(d.exp)} Exp</div>
          <div style="font-size:12.5px;background:var(--bg-soft);padding:8px 10px;border-radius:8px;margin-bottom:10px;border:1px solid var(--navy-border);">
            <strong>Hospital:</strong> ${escapeHTML(hosp.name)} (${escapeHTML(hosp.zone)})<br/>
            <strong>Distance:</strong> 📍 ${hosp.distanceKm} km away (~${hosp.driveMins} mins)
          </div>
          <div style="font-size:12px;color:var(--navy-slate);margin-bottom:12px;">
            <strong>Treats:</strong> ${escapeHTML(d.treats)}
          </div>
        </div>
        <button class="btn-navy" style="width:100%;" data-doc="${escapeHTML(d.name)}" data-hosp="${escapeHTML(hosp.name)}" data-fee="${Number(d.fee) || 0}" onclick="bookAppointmentQuick(this.dataset.doc, this.dataset.hosp, Number(this.dataset.fee))">
          Book Consultation (₹${d.fee})
        </button>
      </article>
    `;
  }).join("");

  // Filter Nearest Hospitals that have this department
  const matchedHospitals = providersByDist.filter(p => {
    if (p.type !== "Hospital") return false;
    if (matchedRule.id === "ALL" && !rawText) return true;
    return p.specialties.includes(matchedRule.spec) ||
           p.name.toLowerCase().includes(rawText) ||
           p.diseases.some(dis => dis.toLowerCase().includes(rawText));
  });

  const origin = getOriginCoords();
  hospGrid.innerHTML = matchedHospitals.slice(0, 6).map((h, idx) => `
    <article class="card ${idx === 0 ? 'active-card' : ''}">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
          <span class="badge-navy ${idx === 0 ? 'solid' : ''}">#${idx + 1} Nearest Equipped Hospital</span>
          <span class="mono" style="font-size:12px;font-weight:800;">${h.distanceKm} km (~${h.driveMins}m)</span>
        </div>
        <h3 style="font-size:18px;margin:10px 0 4px;">${escapeHTML(h.name)}</h3>
        <div style="font-size:12.5px;color:var(--navy-muted);margin-bottom:10px;">📍 ${escapeHTML(h.address)}</div>
        <div style="font-size:12.5px;margin-bottom:12px;">
          <strong>Available Specialties:</strong> ${escapeHTML(h.specialties.join(", "))}<br/>
          <strong>Capacity:</strong> ${h.beds} Beds (${h.icuBeds} ICU) • ★ ${h.rating}
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <a class="btn-navy" style="flex:1;" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${h.lat},${h.lng}">
          Directions ↗
        </a>
        <a href="tel:${safeTel(h.phone)}" class="btn-outline">📞 Call</a>
      </div>
    </article>
  `).join("");
}

function bookAppointmentQuick(docName, hospName, fee) {
  showToast(`Confirmed slot request with ${docName} at ${hospName} (₹${fee}).`);
}

/* =========================================================================
   7. CATEGORIES PAGE: DISEASE-TO-HOSPITAL DETECTOR (categories.html)
========================================================================= */
let activeDiseaseFilter = "ALL";

function filterByDiseaseCategory(diseaseName, btnEl) {
  activeDiseaseFilter = diseaseName;
  document.querySelectorAll(".disease-cat-btn").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  renderCategoryHospitals();
}

function renderCategoryHospitals() {
  const grid = document.getElementById("categoryHospitalsGrid");
  if (!grid) return;

  const q = (document.getElementById("catSearchInput")?.value || "").trim().toLowerCase();
  const origin = getOriginCoords();

  const list = getProvidersSorted().filter(p => {
    const matchDis = activeDiseaseFilter === "ALL" || p.diseases.includes(activeDiseaseFilter) || p.specialties.includes(activeDiseaseFilter);
    const matchText = !q || p.name.toLowerCase().includes(q) || p.zone.toLowerCase().includes(q) || p.diseases.some(d => d.toLowerCase().includes(q));
    return matchDis && matchText;
  });

  grid.innerHTML = list.map(p => `
    <article class="card">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="badge-navy solid">${escapeHTML(p.type)} • ${escapeHTML(p.zone)}</span>
          <span class="mono" style="font-size:12px;font-weight:800;">📍 ${p.distanceKm} km</span>
        </div>
        <h3 style="font-size:18px;margin:10px 0 4px;">${escapeHTML(p.name)}</h3>
        <div style="font-size:12.5px;color:var(--navy-muted);margin-bottom:10px;">${escapeHTML(p.address)}</div>
        <div style="font-size:12.5px;background:var(--bg-soft);padding:10px;border-radius:8px;margin-bottom:12px;">
          <strong>Diseases Treated:</strong> ${escapeHTML(p.diseases.join(" • "))}<br/>
          <strong>Departments:</strong> ${escapeHTML(p.specialties.join(", "))}
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <a class="btn-navy" style="flex:1;" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${p.lat},${p.lng}">
          Directions (${p.driveMins} mins) ↗
        </a>
        <a href="tel:${safeTel(p.phone)}" class="btn-outline">📞 Call</a>
      </div>
    </article>
  `).join("");
}

/* =========================================================================
   8. BLOOD BANK & TRANSFUSION FINDER PAGE (bloodbank.html)
========================================================================= */
let selectedBloodGroup = "ALL";

function selectBloodGroupFilter(bg, btnEl) {
  selectedBloodGroup = bg;
  document.querySelectorAll(".bg-chip").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  renderBloodBanks();
}

function renderBloodBanks() {
  const container = document.getElementById("bloodBankGrid");
  if (!container) return;

  const origin = getOriginCoords();
  const hospitalsWithBlood = getProvidersSorted().filter(p => p.bloodBank);

  container.innerHTML = hospitalsWithBlood.map(h => {
    const groups = Object.entries(h.bloodBank).filter(([bg]) => selectedBloodGroup === "ALL" || bg === selectedBloodGroup);
    return `
      <article class="card">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="badge-navy solid">24x7 Licensed Blood Bank</span>
            <span class="mono" style="font-size:12.5px;font-weight:800;">📍 ${h.distanceKm} km (~${h.driveMins}m)</span>
          </div>
          <h3 style="font-size:18px;margin:10px 0 4px;">${escapeHTML(h.name)}</h3>
          <div style="font-size:12.5px;color:var(--navy-muted);margin-bottom:12px;">${escapeHTML(h.address)}</div>

          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:6px;margin-bottom:14px;">
            ${groups.map(([bg, units]) => `
              <div style="background:var(--bg-soft);border:1.5px solid var(--navy-deep);border-radius:8px;padding:6px;text-align:center;">
                <div style="font-size:13px;font-weight:800;color:var(--navy-deep);">${escapeHTML(bg)}</div>
                <div class="mono" style="font-size:11px;color:var(--navy-slate);">${units} Units</div>
              </div>
            `).join("")}
          </div>
          <div style="font-size:11.5px;color:var(--navy-muted);margin-bottom:12px;">
            Components: Packed RBC • Fresh Frozen Plasma • Single Donor Platelets (Dengue)
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn-navy" style="flex:1;" data-hosp="${escapeHTML(h.name)}" onclick="reserveBloodUnits(this.dataset.hosp)">
            Reserve Transfusion Unit
          </button>
          <a class="btn-outline" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${h.lat},${h.lng}">
            Map ↗
          </a>
        </div>
      </article>
    `;
  }).join("");
}

function reserveBloodUnits(hospName) {
  showToast(`Blood unit reservation request sent to ${hospName} Blood Bank desk.`);
}

/* =========================================================================
   9. UNIFIED HEALTH LOCKER + FAMILY GRAPH (locker.html)
      (Combines Family Members + Lab Reports + Certificates + Meds in 1 place)
========================================================================= */
let activeFamilyId = "fm1";

const DEFAULT_LOCKER = [
  {
    id: "fm1",
    name: "Syed Zaahak Husain (Self)",
    relation: "Primary Account • 18 Yrs",
    blood: "O+",
    reports: [
      { title: "Master Health Checkup (82 Parameters)", source: "Vijaya Diagnostic Centre (Bandlaguda)", date: "11 Oct 2026", type: "Lab Report" },
      { title: "3 Tesla MRI Right Knee", source: "Lucid Medical Diagnostics (Attapur)", date: "28 Sep 2026", type: "Radiology Scan" }
    ],
    certificates: [
      { title: "Birth Certificate & Official ID", issuer: "GHMC Hyderabad", date: "Verified" },
      { title: "Blood Group & Vaccination Certificate", issuer: "Olive Hospitals", date: "Verified" }
    ],
    medications: [
      { name: "Vitamin D3 60k IU", schedule: "Sunday Morning", condition: "Preventive Wellness" }
    ]
  },
  {
    id: "fm2",
    name: "Grandfather (Senior Relative)",
    relation: "Elderly Care • 72 Yrs",
    blood: "B+",
    reports: [
      { title: "2D Echocardiogram & Cardiology Summary", source: "Olive Hospitals (Mehdipatnam)", date: "02 Oct 2026", type: "Cardiology Report" },
      { title: "HbA1c & Kidney Function Panel", source: "Vijaya Diagnostic Centre", date: "19 Sep 2026", type: "Blood Report" }
    ],
    certificates: [
      { title: "Senior Citizen Aarogyasri / Health Card", issuer: "Telangana Health Dept", date: "Active" }
    ],
    medications: [
      { name: "Telmisartan 40mg", schedule: "08:30 AM Daily", condition: "Blood Pressure" },
      { name: "Atorvastatin 10mg", schedule: "09:00 PM Daily", condition: "Cholesterol" }
    ]
  },
  {
    id: "fm3",
    name: "Mother (Parent Profile)",
    relation: "Parent • 46 Yrs",
    blood: "O+",
    reports: [
      { title: "Digital X-Ray Bilateral Knee", source: "Germanten Hospital (Attapur)", date: "28 Sep 2026", type: "Radiology Scan" },
      { title: "Complete Thyroid Profile (TSH, T3, T4)", source: "Lucid Diagnostics", date: "10 Sep 2026", type: "Lab Report" }
    ],
    certificates: [
      { title: "Star Health Family Floater E-Card", issuer: "Star Health TPA", date: "Active" }
    ],
    medications: [
      { name: "Calcium + Vitamin D3", schedule: "01:30 PM After Lunch", condition: "Bone Strength" }
    ]
  },
  {
    id: "fm4",
    name: "Father (Parent Profile)",
    relation: "Parent • 52 Yrs",
    blood: "B+",
    reports: [
      { title: "Comprehensive Executive Heart Checkup", source: "Cura Hospital (Himayath Sagar)", date: "05 Oct 2026", type: "Heart Checkup" }
    ],
    certificates: [
      { title: "Medical Fitness & Immunization Record", issuer: "Apollo Health City", date: "Verified" }
    ],
    medications: [
      { name: "Multivitamin & Omega-3", schedule: "09:00 AM Daily", condition: "General Wellness" }
    ]
  }
];

function cleanLockerList(list, fields, limit = 60) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, limit).map(it => {
    const o = {};
    fields.forEach(f => { o[f] = cleanText(it && it[f], 120); });
    return o;
  }).filter(o => o[fields[0]]);
}

function loadLocker() {
  const saved = safeParse(safeGet("hx_unified_locker"), null);
  if (!Array.isArray(saved) || !saved.length) return JSON.parse(JSON.stringify(DEFAULT_LOCKER));
  const seen = new Set();
  const out = [];
  saved.slice(0, 12).forEach(m => {
    if (!m || typeof m !== "object") return;
    const id = typeof m.id === "string" && /^[A-Za-z0-9_-]{1,30}$/.test(m.id) ? m.id : null;
    const name = cleanText(m.name, 60);
    if (!id || !name || seen.has(id)) return;
    seen.add(id);
    out.push({
      id, name,
      relation: cleanText(m.relation, 60) || "Family Member",
      blood: BLOOD_GROUP_RE.test(String(m.blood)) ? m.blood : "—",
      reports: cleanLockerList(m.reports, ["title", "source", "date", "type"]),
      certificates: cleanLockerList(m.certificates, ["title", "issuer", "date"]),
      medications: cleanLockerList(m.medications, ["name", "schedule", "condition"])
    });
  });
  return out.length ? out : JSON.parse(JSON.stringify(DEFAULT_LOCKER));
}

let UNIFIED_FAMILY_LOCKER = loadLocker();

function renderUnifiedLocker() {
  const famBar = document.getElementById("unifiedFamilySelector");
  const lockerBody = document.getElementById("unifiedLockerContent");
  if (!famBar || !lockerBody) return;

  famBar.innerHTML = UNIFIED_FAMILY_LOCKER.map(m => `
    <div class="card ${m.id === activeFamilyId ? 'active-card' : ''}" style="cursor:pointer;padding:16px;" data-fid="${escapeHTML(m.id)}" role="button" tabindex="0" onclick="selectLockerMember(this.dataset.fid)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectLockerMember(this.dataset.fid);}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span class="badge-navy ${m.id === activeFamilyId ? 'solid' : ''}">${escapeHTML(m.relation)}</span>
        <strong class="mono" style="font-size:12px;">Blood: ${escapeHTML(m.blood)}</strong>
      </div>
      <h3 style="font-size:16px;">${escapeHTML(m.name)}</h3>
      <div style="font-size:12px;color:var(--navy-muted);margin-top:4px;">
        ${m.reports.length} Reports • ${m.certificates.length} Certificates • ${m.medications.length} Meds
      </div>
    </div>
  `).join("");

  const active = UNIFIED_FAMILY_LOCKER.find(m => m.id === activeFamilyId) || UNIFIED_FAMILY_LOCKER[0];

  lockerBody.innerHTML = `
    <div class="recommendation-banner" style="margin-top:18px;">
      <div>
        <span class="badge-navy">UNIFIED FAMILY &amp; PERSONAL LOCKER</span>
        <h3>${escapeHTML(active.name)} — All Medical Records in One Place</h3>
        <p>Blood Group: ${escapeHTML(active.blood)} • Managed under your single HealthX Family Locker</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn-outline" style="background:#FFF;" onclick="openAddLockerItemModal()">+ Add Report / Certificate / Med</button>
        <button class="btn-outline" style="background:#FFF;" onclick="openAddFamilyModal()">+ Add Family Member</button>
      </div>
    </div>

    <div class="grid-3">
      <!-- COLUMN 1: HOSPITAL & LAB REPORTS -->
      <div class="card">
        <div>
          <span class="badge-navy solid">1. HOSPITAL &amp; LAB REPORTS</span>
          <h3 style="font-size:17px;margin:10px 0 12px;">Diagnostic Scans &amp; Prescriptions</h3>
          ${active.reports.map(r => `
            <div style="border:1px solid var(--navy-border);border-radius:8px;padding:10px;margin-bottom:8px;background:var(--bg-soft);">
              <strong style="font-size:13.5px;display:block;">${escapeHTML(r.title)}</strong>
              <span style="font-size:12px;color:var(--navy-muted);">${escapeHTML(r.source)} •${escapeHTML(r.date)}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- COLUMN 2: OFFICIAL CERTIFICATES -->
      <div class="card">
        <div>
          <span class="badge-navy solid">2. PERSONAL CERTIFICATES</span>
          <h3 style="font-size:17px;margin:10px 0 12px;">Birth, Vaccination &amp; Insurance Cards</h3>
          ${active.certificates.map(c => `
            <div style="border:1px solid var(--navy-border);border-radius:8px;padding:10px;margin-bottom:8px;background:var(--bg-soft);">
              <strong style="font-size:13.5px;display:block;">${escapeHTML(c.title)}</strong>
              <span style="font-size:12px;color:var(--navy-muted);">Issued by: ${escapeHTML(c.issuer)} (${escapeHTML(c.date)})</span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- COLUMN 3: MEDICATIONS & CONDITIONS -->
      <div class="card">
        <div>
          <span class="badge-navy solid">3. ACTIVE MEDICATIONS &amp; CARE</span>
          <h3 style="font-size:17px;margin:10px 0 12px;">Prescribed Schedule &amp; History</h3>
          ${active.medications.map(med => `
            <div style="border:1px solid var(--navy-border);border-radius:8px;padding:10px;margin-bottom:8px;background:var(--bg-soft);">
              <strong style="font-size:13.5px;display:block;">💊 ${escapeHTML(med.name)}</strong>
              <span style="font-size:12px;color:var(--navy-muted);">⏰ ${escapeHTML(med.schedule)} • For: ${escapeHTML(med.condition)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function selectLockerMember(id) {
  if (!UNIFIED_FAMILY_LOCKER.some(m => m.id === id)) return;
  activeFamilyId = id;
  renderUnifiedLocker();
}

function openAddLockerItemModal() {
  const active = UNIFIED_FAMILY_LOCKER.find(m => m.id === activeFamilyId) || UNIFIED_FAMILY_LOCKER[0];
  document.getElementById("appModalContent").innerHTML = `
    <span class="badge-navy solid">ADD TO ${escapeHTML(active.name.toUpperCase())}</span>
    <h3 style="font-size:19px;margin:8px 0 12px;">Add Record to Unified Locker</h3>
    <div style="display:grid;gap:12px;">
      <div>
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Category</label>
        <select id="newLockerCat" class="select-std">
          <option value="report">Hospital / Diagnostic Lab Report</option>
          <option value="cert">Personal / Insurance Certificate</option>
          <option value="med">Prescribed Medication</option>
        </select>
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Title / Medicine Name</label>
        <input id="newLockerTitle" class="input-std" maxlength="100" placeholder="e.g. Complete Blood Picture (CBP) or Birth Certificate" />
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Hospital / Issuer / Schedule</label>
        <input id="newLockerSub" class="input-std" maxlength="100" placeholder="e.g. Vijaya Diagnostics or 09:00 AM Daily" />
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
        <button class="btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn-navy" onclick="saveNewLockerItem()">Save to Locker</button>
      </div>
    </div>
  `;
  document.getElementById("appModal").classList.add("open");
}

function saveNewLockerItem() {
  const cat = document.getElementById("newLockerCat").value;
  const title = cleanText(document.getElementById("newLockerTitle").value || "", 100);
  const sub = cleanText(document.getElementById("newLockerSub").value || "", 100) || "Verified";
  if (!["report", "cert", "med"].includes(cat)) return;
  if (!title) {
    showToast("Please enter a title.");
    return;
  }
  const active = UNIFIED_FAMILY_LOCKER.find(m => m.id === activeFamilyId) || UNIFIED_FAMILY_LOCKER[0];
  const list = cat === "report" ? active.reports : cat === "cert" ? active.certificates : active.medications;
  if (list.length >= 60) {
    showToast("This section is full. Please remove older items first.");
    return;
  }
  if (cat === "report") active.reports.unshift({ title, source: sub, date: "15 Oct 2026", type: "Report" });
  if (cat === "cert") active.certificates.unshift({ title, issuer: sub, date: "Verified" });
  if (cat === "med") active.medications.unshift({ name: title, schedule: sub, condition: "Prescribed" });

  const savedOk = safeSet("hx_unified_locker", JSON.stringify(UNIFIED_FAMILY_LOCKER));
  closeModal();
  renderUnifiedLocker();
  showToast(savedOk ? "Saved to Unified Family Locker." : "Saved for this session only (browser storage is unavailable).");
}

function openAddFamilyModal() {
  document.getElementById("appModalContent").innerHTML = `
    <span class="badge-navy solid">FAMILY HEALTH GRAPH</span>
    <h3 style="font-size:19px;margin:8px 0 12px;">Add Family Member to Locker</h3>
    <div style="display:grid;gap:12px;">
      <div>
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Full Name</label>
        <input id="newFamName" class="input-std" maxlength="60" placeholder="e.g. Grandmother / Younger Sibling" />
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Relation &amp; Age</label>
        <input id="newFamRel" class="input-std" maxlength="60" value="Family Member • 65 Yrs" />
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Blood Group</label>
        <input id="newFamBlood" class="input-std" maxlength="3" autocapitalize="characters" value="O+" />
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
        <button class="btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn-navy" onclick="saveNewFamilyProfile()">Add Member</button>
      </div>
    </div>
  `;
  document.getElementById("appModal").classList.add("open");
}

function saveNewFamilyProfile() {
  const name = cleanText(document.getElementById("newFamName").value || "", 60) || "Family Member";
  const relation = cleanText(document.getElementById("newFamRel").value || "", 60) || "Relative";
  const blood = cleanText(document.getElementById("newFamBlood").value || "O+", 4).toUpperCase();
  if (!BLOOD_GROUP_RE.test(blood)) {
    showToast("Enter a valid blood group such as O+, A-, B+ or AB+.");
    return;
  }
  if (UNIFIED_FAMILY_LOCKER.length >= 12) {
    showToast("Family limit reached (12 members).");
    return;
  }
  const id = "fm" + Date.now();
  UNIFIED_FAMILY_LOCKER.push({
    id, name, relation, blood,
    reports: [{ title: "Baseline Health File Created", source: "HealthX", date: "15 Oct 2026", type: "Record" }],
    certificates: [],
    medications: []
  });
  safeSet("hx_unified_locker", JSON.stringify(UNIFIED_FAMILY_LOCKER));
  activeFamilyId = id;
  closeModal();
  renderUnifiedLocker();
  showToast(`Added ${name} to Unified Locker.`);
}

/* =========================================================================
   10. COST ESTIMATOR MATRIX PAGE (costs.html)
========================================================================= */
function renderCostEstimatorPage() {
  const sel = document.getElementById("costProcSelect");
  const tbody = document.getElementById("costTableBody");
  if (!sel || !tbody) return;

  if (!sel.innerHTML.trim()) {
    sel.innerHTML = PROCEDURES.map(p =>
      `<option value="${p.id}">[${escapeHTML(p.category.toUpperCase())}] ${escapeHTML(p.name)} — Base ${formatINR(p.basePrice)}</option>`
    ).join("");
  }

  const proc = PROCEDURES.find(p => p.id === sel.value) || PROCEDURES[0];
  const providers = getProvidersSorted().filter(p => {
    if (proc.category === "Surgery" && p.type === "Diagnostic") return false;
    return true;
  });

  tbody.innerHTML = providers.map(p => {
    const total = Math.round(proc.basePrice * p.priceMultiplier);
    return `
      <tr>
        <td data-label="Hospital / Center">
          <strong>${escapeHTML(p.name)}</strong>
          <div style="font-size:12px;color:var(--navy-muted);">${escapeHTML(p.zone)} • ★ ${p.rating}</div>
        </td>
        <td class="mono" data-label="Distance">📍 ${p.distanceKm} km (~${p.driveMins}m)</td>
        <td class="mono" data-label="Procedure / Scan">${formatINR(total * 0.55)}</td>
        <td class="mono" data-label="Anesthesia / Reporting">${formatINR(total * 0.25)}</td>
        <td class="mono" data-label="Room &amp; Consumables">${formatINR(total * 0.20)}</td>
        <td class="mono" data-label="Total Estimate" style="font-weight:800;font-size:15px;">${formatINR(total)}</td>
        <td data-label="Action">
          <button class="btn-navy" style="padding:7px 14px;font-size:12px;" data-msg="${escapeHTML('Locked estimate of ' + formatINR(total) + ' at ' + p.name)}" onclick="showToast(this.dataset.msg)">
            Lock Estimate
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

/* =========================================================================
   11. FEEDBACK PAGE (feedback.html)
========================================================================= */
const DEFAULT_FEEDBACK = [
  { name: "Mohammed Tariq (Attendant)", hosp: "Olive Hospitals, Mehdipatnam", role: "Patient Family", rating: "5 / 5", text: "Comparing MRI costs at Vijaya Diagnostics vs hospital OPD saved our family ₹2,800 immediately.", date: "14 Oct 2026" },
  { name: "Dr. B. Chandrasekhar", hosp: "Lifecare Hospital, Sun City", role: "Consultant Doctor", rating: "5 / 5", text: "Having the patient's past blood reports and active medications in one unified locker saves 5+ minutes per consultation.", date: "14 Oct 2026" }
];

const FEEDBACK_ROLES = ["Patient / Family", "Consultant Doctor", "Patient Family"];
const FEEDBACK_RATINGS = ["5 / 5", "4 / 5", "3 / 5"];

function loadFeedback() {
  const saved = safeParse(safeGet("hx_feedbacks"), null);
  if (!Array.isArray(saved) || !saved.length) return DEFAULT_FEEDBACK.slice();
  const out = saved.slice(0, 50).map(f => ({
    name: cleanText(f && f.name, 60),
    hosp: cleanText(f && f.hosp, 80),
    role: cleanText(f && f.role, 40),
    rating: FEEDBACK_RATINGS.includes(f && f.rating) ? f.rating : "5 / 5",
    text: cleanText(f && f.text, 500),
    date: cleanText(f && f.date, 20)
  })).filter(f => f.name && f.text);
  return out.length ? out : DEFAULT_FEEDBACK.slice();
}

let FEEDBACK_LIST = loadFeedback();
let lastFeedbackAt = 0;

function renderFeedbackPage() {
  const listEl = document.getElementById("feedbackEntriesList");
  if (!listEl) return;

  listEl.innerHTML = FEEDBACK_LIST.map(f => `
    <article class="card">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span class="badge-navy solid">${escapeHTML(f.role)} • ★ ${escapeHTML(f.rating)}</span>
          <span style="font-size:12px;color:var(--navy-muted);">${escapeHTML(f.date)}</span>
        </div>
        <h3 style="font-size:16.5px;">${escapeHTML(f.name)}</h3>
        <div style="font-size:12.5px;color:var(--navy-muted);margin-bottom:10px;">Visited: ${escapeHTML(f.hosp)}</div>
        <p style="font-size:13.5px;color:var(--navy-deep);">"${escapeHTML(f.text)}"</p>
      </div>
    </article>
  `).join("");
}

function submitFeedbackForm(ev) {
  ev.preventDefault();
  const name = cleanText(document.getElementById("fbName")?.value || "", 60) || "Anonymous";
  const roleRaw = document.getElementById("fbRole")?.value || "";
  const role = ["Patient / Family", "Consultant Doctor"].includes(roleRaw) ? roleRaw : "Patient / Family";
  const hosp = cleanText(document.getElementById("fbHosp")?.value || "", 80) || "Hyderabad Hospital";
  const ratingRaw = document.getElementById("fbRating")?.value || "";
  const rating = FEEDBACK_RATINGS.includes(ratingRaw) ? ratingRaw : "5 / 5";
  const text = cleanText(document.getElementById("fbText")?.value || "", 500);

  if (Date.now() - lastFeedbackAt < 8000) {
    showToast("Please wait a few seconds before posting again.");
    return;
  }

  if (text.length < 5) {
    showToast("Please write a short feedback message.");
    return;
  }

  lastFeedbackAt = Date.now();
  FEEDBACK_LIST.unshift({ name, role, hosp, rating, text, date: "15 Oct 2026" });
  FEEDBACK_LIST = FEEDBACK_LIST.slice(0, 50);
  safeSet("hx_feedbacks", JSON.stringify(FEEDBACK_LIST));
  document.getElementById("fbText").value = "";
  renderFeedbackPage();
  showToast("Thank you! Your feedback has been published.");
}

/* =========================================================================
   11b. MOBILE / TABLET ENHANCEMENTS (no visual changes on desktop)
========================================================================= */
function initMobileEnhancements() {
  // Centre the active tab inside the horizontally scrolling nav bar
  const nav = document.querySelector(".nav-links");
  const active = nav && nav.querySelector(".nav-link.active");
  if (nav && active && nav.scrollWidth > nav.clientWidth) {
    nav.scrollLeft = Math.max(0, active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2);
  }

  // Modal: dialog semantics, Escape to close, lock page scroll behind it
  const modal = document.getElementById("appModal");
  const box = document.getElementById("appModalContent");
  if (box) {
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
  }
  if (modal && "MutationObserver" in window) {
    new MutationObserver(() => {
      document.body.classList.toggle("hx-modal-open", modal.classList.contains("open"));
    }).observe(modal, { attributes: true, attributeFilter: ["class"] });
  }
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal();
      document.getElementById("profileDropdown")?.classList.remove("open");
      document.getElementById("locSuggestionsBox")?.classList.remove("open");
    }
  });
}

/* =========================================================================
   12. INITIALIZATION ACROSS ALL PAGES
========================================================================= */
function refreshAllPageViews() {
  renderSymptomMatches();
  renderCategoryHospitals();
  renderBloodBanks();
  renderUnifiedLocker();
  renderCostEstimatorPage();
  renderFeedbackPage();
}

window.addEventListener("DOMContentLoaded", () => {

//

// Fitness Tracker Form Logic
  const fitnessForm = document.getElementById("homepageFitnessForm");
  if (fitnessForm) {
    fitnessForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const steps = document.getElementById("inputSteps").value;
      const minutes = document.getElementById("inputMinutes").value;
      const calories = document.getElementById("inputCalories").value;

      document.getElementById("displaySteps").textContent = Number(steps).toLocaleString();
      document.getElementById("displayMinutes").textContent = minutes;
      document.getElementById("displayCalories").textContent = calories;
    });
  }

  const dateField = document.getElementById("inputDate");
  if (dateField) {
    dateField.value = new Date().toISOString().split("T")[0];
  }

//








  updateLocationUI();
  renderProfileHeader();
  refreshAllPageViews();
  initMobileEnhancements();

  // Auto-attempt GPS connection on first visit
  if (!safeGet("hx_gps_prompted")) {
    safeSet("hx_gps_prompted", "true");
    connectLiveGPS(true);
  }

  document.addEventListener("click", e => {
    const locWrap = document.querySelector(".location-box");
    const sugBox = document.getElementById("locSuggestionsBox");
    if (locWrap && sugBox && !locWrap.contains(e.target)) {
      sugBox.classList.remove("open");
    }
    const profWrap = document.querySelector(".profile-menu-wrap");
    const profDD = document.getElementById("profileDropdown");
    if (profWrap && profDD && !profWrap.contains(e.target)) {
      profDD.classList.remove("open");
    }
  });
});