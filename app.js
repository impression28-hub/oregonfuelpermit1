/* ============================================================
   Shared application state & helpers for the Oregon permit flow.
   Data is passed between pages via sessionStorage under 'permitData'.
   ============================================================ */

const STORAGE_KEY = "permitData";

function getPermitData() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function savePermitData(patch) {
  const current = getPermitData();
  const merged = Object.assign(current, patch);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

function goTo(page) {
  window.location.href = page;
}

/* ---------------- US States (for plate-issue dropdown) ---------------- */
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

/* ---------------- Canadian provinces & territories ---------------- */
const CANADA_PROVINCES = [
  "AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"
];

// Grouped for the plate-issue dropdown: United States / Canada.
const PLATE_STATE_GROUPS = [
  { state: "United States", points: US_STATES.map((s) => ({ value: s, label: s })) },
  { state: "Canada", points: CANADA_PROVINCES.map((p) => ({ value: p, label: p })) },
];

/* ---------------- Gross vehicle weight brackets & per-mile tax ----------------
   Source: the mileage tax table you provided. Brackets under 80,000 lbs
   have a single rate; brackets at 80,001 lbs and above vary by axle
   count, so those require an axle-count selection too. */
const WEIGHT_BRACKETS = [
  { value: "under-26000", label: "Under 26,000 lbs", rate: 0 },
  { value: "26001-28000", label: "26,001–28,000 lbs", rate: 0.0764 },
  { value: "28001-30000", label: "28,001–30,000 lbs", rate: 0.0809 },
  { value: "30001-32000", label: "30,001–32,000 lbs", rate: 0.0846 },
  { value: "32001-34000", label: "32,001–34,000 lbs", rate: 0.0884 },
  { value: "34001-36000", label: "34,001–36,000 lbs", rate: 0.0918 },
  { value: "36001-38000", label: "36,001–38,000 lbs", rate: 0.0966 },
  { value: "38001-40000", label: "38,001–40,000 lbs", rate: 0.1002 },
  { value: "40001-42000", label: "40,001–42,000 lbs", rate: 0.1038 },
  { value: "42001-44000", label: "42,001–44,000 lbs", rate: 0.1077 },
  { value: "44001-46000", label: "44,001–46,000 lbs", rate: 0.1113 },
  { value: "46001-48000", label: "46,001–48,000 lbs", rate: 0.1149 },
  { value: "48001-50000", label: "48,001–50,000 lbs", rate: 0.1187 },
  { value: "50001-52000", label: "50,001–52,000 lbs", rate: 0.1231 },
  { value: "52001-54000", label: "52,001–54,000 lbs", rate: 0.1277 },
  { value: "54001-56000", label: "54,001–56,000 lbs", rate: 0.1325 },
  { value: "56001-58000", label: "56,001–58,000 lbs", rate: 0.1380 },
  { value: "58001-60000", label: "58,001–60,000 lbs", rate: 0.1443 },
  { value: "60001-62000", label: "60,001–62,000 lbs", rate: 0.1517 },
  { value: "62001-64000", label: "62,001–64,000 lbs", rate: 0.1601 },
  { value: "64001-66000", label: "64,001–66,000 lbs", rate: 0.1693 },
  { value: "66001-68000", label: "66,001–68,000 lbs", rate: 0.1813 },
  { value: "68001-70000", label: "68,001–70,000 lbs", rate: 0.1941 },
  { value: "70001-72000", label: "70,001–72,000 lbs", rate: 0.2069 },
  { value: "72001-74000", label: "72,001–74,000 lbs", rate: 0.2187 },
  { value: "74001-76000", label: "74,001–76,000 lbs", rate: 0.2300 },
  { value: "76001-78000", label: "76,001–78,000 lbs", rate: 0.2411 },
  { value: "78001-80000", label: "78,001–80,000 lbs", rate: 0.2512 },
  {
    value: "80001-82000", label: "80,001–82,000 lbs", requiresAxles: true,
    rates: { "5": 0.2594, "6": 0.2373, "7": 0.2218, "8": 0.2107, "9": 0.1987 },
  },
  {
    value: "82001-84000", label: "82,001–84,000 lbs", requiresAxles: true,
    rates: { "5": 0.2678, "6": 0.2411, "7": 0.2254, "8": 0.2134, "9": 0.2014 },
  },
  {
    value: "84001-86000", label: "84,001–86,000 lbs", requiresAxles: true,
    rates: { "5": 0.2758, "6": 0.2466, "7": 0.2291, "8": 0.2161, "9": 0.2042 },
  },
  {
    value: "86001-88000", label: "86,001–88,000 lbs", requiresAxles: true,
    rates: { "5": 0.2852, "6": 0.2520, "7": 0.2327, "8": 0.2199, "9": 0.2069 },
  },
  {
    value: "88001-90000", label: "88,001–90,000 lbs", requiresAxles: true,
    rates: { "5": 0.2962, "6": 0.2584, "7": 0.2365, "8": 0.2235, "9": 0.2107 },
  },
  {
    value: "90001-92000", label: "90,001–92,000 lbs", requiresAxles: true,
    rates: { "5": 0.3090, "6": 0.2659, "7": 0.2399, "8": 0.2271, "9": 0.2144 },
  },
  {
    value: "92001-94000", label: "92,001–94,000 lbs", requiresAxles: true,
    rates: { "5": 0.3230, "6": 0.2731, "7": 0.2438, "8": 0.2308, "9": 0.2172 },
  },
  {
    value: "94001-96000", label: "94,001–96,000 lbs", requiresAxles: true,
    rates: { "5": 0.3377, "6": 0.2815, "7": 0.2483, "8": 0.2346, "9": 0.2207 },
  },
  {
    value: "96001-98000", label: "96,001–98,000 lbs", requiresAxles: true,
    rates: { "5": 0.3533, "6": 0.2917, "7": 0.2539, "8": 0.2384, "9": 0.2245 },
  },
  {
    value: "98001-100000", label: "98,001–100,000 lbs", requiresAxles: true,
    rates: { "5": null, "6": 0.3025, "7": 0.2594, "8": 0.2428, "9": 0.2281 },
  },
  {
    value: "100001-102000", label: "100,001–102,000 lbs", requiresAxles: true,
    rates: { "5": null, "6": null, "7": 0.2649, "8": 0.2483, "9": 0.2319 },
  },
  {
    value: "102001-104000", label: "102,001–104,000 lbs", requiresAxles: true,
    rates: { "5": null, "6": null, "7": 0.2705, "8": 0.2539, "9": 0.2365 },
  },
  {
    value: "104001-105500", label: "104,001–105,500 lbs", requiresAxles: true,
    rates: { "5": null, "6": null, "7": 0.2777, "8": 0.2594, "9": 0.2411 },
  },
];

function getWeightBracket(value) {
  return WEIGHT_BRACKETS.find((b) => b.value === value);
}

const AXLE_OPTIONS = [
  { value: "5", label: "5 axles" },
  { value: "6", label: "6 axles" },
  { value: "7", label: "7 axles" },
  { value: "8", label: "8 axles" },
  { value: "9", label: "9+ axles" },
];

/* ---------------- Oregon entrance / exit points ----------------
   Same set of border highways is used for both entrance and exit,
   grouped by the state they cross in from.

   IMPORTANT: lat/lon below are ESTIMATES based on general geography
   of where each highway crosses the state line — not surveyed GPS
   points. Verify/correct these against ODOT's records before using
   this for real permit pricing, since an off coordinate here will
   throw off every distance calculated through it. */
const BORDER_HIGHWAYS = {
  California: [
    { hwy: "395", lat: 42.0006, lon: -120.2812 },
    { hwy: "139", lat: 42.0006, lon: -120.8324 },
    { hwy: "5", lat: 41.9958, lon: -122.6231 },
    { hwy: "199", lat: 41.9958, lon: -123.6801 },
    { hwy: "101", lat: 42.0006, lon: -124.2126 },
    { hwy: "97", lat: 42.0006, lon: -121.9310 },
  ],
  Idaho: [
    { hwy: "84", lat: 44.0316, lon: -116.9631 },
    { hwy: "26", lat: 43.9800, lon: -117.0200 },
    { hwy: "95", lat: 43.6000, lon: -116.9400 },
  ],
  Nevada: [
    { hwy: "95", lat: 42.0000, lon: -117.7239 },
    { hwy: "140", lat: 42.0000, lon: -119.0000 },
  ],
  Washington: [
    { hwy: "101", lat: 46.1970, lon: -123.8313 },
    { hwy: "433", lat: 46.1073, lon: -122.9421 },
    { hwy: "5", lat: 45.6187, lon: -122.6690 },
    { hwy: "205", lat: 45.6009, lon: -122.5254 },
    { hwy: "97", lat: 45.6606, lon: -120.8331 },
    { hwy: "82", lat: 45.9000, lon: -119.3000 },
    { hwy: "730", lat: 45.9298, lon: -119.3164 },
    { hwy: "11", lat: 46.0034, lon: -118.5000 },
  ],
};

// Lookup used at calculation time: "CA-395" -> { lat, lon, label }
const BORDER_POINT_COORDS = {};
function buildBorderPointGroups() {
  return Object.entries(BORDER_HIGHWAYS).map(([state, points]) => ({
    state,
    points: points.map(({ hwy, lat, lon }) => {
      const value = `${state.slice(0, 2).toUpperCase()}-${hwy}`;
      const label = `${state} — Hwy ${hwy}`;
      BORDER_POINT_COORDS[value] = { lat, lon, label };
      return { value, label };
    }),
  }));
}

const ENTRANCE_POINTS = buildBorderPointGroups();
const EXIT_POINTS = buildBorderPointGroups();

function populateSelect(selectEl, list, placeholder) {
  selectEl.innerHTML = "";
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = placeholder;
  selectEl.appendChild(opt0);
  list.forEach((item) => {
    const opt = document.createElement("option");
    if (typeof item === "string") {
      opt.value = item;
      opt.textContent = item;
    } else {
      opt.value = item.value;
      opt.textContent = item.label;
    }
    selectEl.appendChild(opt);
  });
}

/* Populates a <select> with <optgroup> sections, one per border state. */
function populateGroupedSelect(selectEl, groups, placeholder) {
  selectEl.innerHTML = "";
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = placeholder;
  selectEl.appendChild(opt0);
  groups.forEach((group) => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = group.state;
    group.points.forEach((point) => {
      const opt = document.createElement("option");
      opt.value = point.value;
      opt.textContent = point.label;
      optgroup.appendChild(opt);
    });
    selectEl.appendChild(optgroup);
  });
}

/* ============================================================
   Route distance calculation via OpenRouteService.

   Border points already have coordinates (see BORDER_POINT_COORDS
   above). Stops the customer types in (a city name or ZIP) are
   geocoded through ORS's own search endpoint, biased toward Oregon.

   Note: this key is used directly from the browser. That's fine for
   a free-tier ORS key (it's just rate-limited to your account), but
   it is visible in your page source — don't reuse a paid/high-limit
   key this way.
   ============================================================ */
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijk1ZGZkZTI5ZmRhMzQxMTNiYWQ5NjVhY2IyOTNiZmVhIiwiaCI6Im11cm11cjY0In0=";
const ORS_GEOCODE_URL = "https://api.openrouteservice.org/geocode/search";
const ORS_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-hgv";

// Rough center of Oregon, used to bias geocoding toward the right places.
const OREGON_FOCUS = { lat: 43.9, lon: -120.6 };

async function geocodeStop(text) {
  const url = `${ORS_GEOCODE_URL}?api_key=${ORS_API_KEY}&text=${encodeURIComponent(text)}` +
    `&boundary.country=US&focus.point.lat=${OREGON_FOCUS.lat}&focus.point.lon=${OREGON_FOCUS.lon}&size=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Couldn't find a location for "${text}"`);
  const data = await res.json();
  const feature = data.features && data.features[0];
  if (!feature) throw new Error(`Couldn't find a location for "${text}"`);
  const [lon, lat] = feature.geometry.coordinates;
  return { lat, lon };
}

async function resolveWaypoint(point) {
  if (BORDER_POINT_COORDS[point]) {
    const { lat, lon } = BORDER_POINT_COORDS[point];
    return { lat, lon };
  }
  return geocodeStop(point);
}

async function calculateRouteMiles(waypoints) {
  const resolved = await Promise.all(waypoints.map(resolveWaypoint));
  const coordinates = resolved.map(({ lat, lon }) => [lon, lat]);
  // Snap radius: lets a coordinate that's slightly off still find the
  // nearest real road, instead of hard-failing like the 350m default.
  const radiuses = coordinates.map(() => 5000);

  const res = await fetch(ORS_DIRECTIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: ORS_API_KEY,
    },
    body: JSON.stringify({ coordinates, radiuses }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Routing service error: ${res.status} ${errText}`.trim());
  }

  const data = await res.json();
  const meters = data.routes && data.routes[0] && data.routes[0].summary && data.routes[0].summary.distance;
  if (typeof meters !== "number") throw new Error("Routing service returned no distance");

  return meters / 1609.34;
}

/* ============================================================
   Price calculation.
   Base fee: $69 flat on every route.
   Non-apportioned plates: +$50 flat.
   Mileage tax: per-mile rate from the weight bracket (and axle
   count, for brackets at 80,001 lbs and above), times route miles.
   ============================================================ */
const BASE_FEE = 69;
const NON_APPORTIONED_FEE = 50;

function calculatePrice(miles, data) {
  const bracket = getWeightBracket(data.weight);
  let ratePerMile = 0;

  if (bracket) {
    if (bracket.requiresAxles) {
      const rate = bracket.rates[data.axles];
      ratePerMile = typeof rate === "number" ? rate : 0;
    } else {
      ratePerMile = bracket.rate;
    }
  }

  const nonApportionedFee = data.plateType === "Non-apportioned" ? NON_APPORTIONED_FEE : 0;
  const total = BASE_FEE + nonApportionedFee + miles * ratePerMile;
  return Math.round(total * 100) / 100;
}
