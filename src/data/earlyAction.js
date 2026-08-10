// Early action content — powers the /early-action page.
// Every worked example on this page is illustrative of a live deployment,
// not a report of observed results. Items carrying `sample: true` are labelled
// as such in the interface.

import {
  School,
  Users,
  Stethoscope,
  Building2,
  Eye,
  Droplets,
  Thermometer,
  Activity,
  Wind,
  FlaskConical,
  Telescope,
  ClipboardCheck,
  Siren,
  RotateCcw,
  Sprout,
  HeartPulse,
  GraduationCap,
  Leaf,
  CloudSun,
  LifeBuoy,
  Globe2
} from "lucide-react";

/* ── 1 · The Early Action Chain ──────────────────────────────────────── */

export const chainIntro = {
  claim:
    "The most important innovation of ClimaSchool AI is not the alert. It is the coordinated, role-specific action that follows the alert — connecting every actor in the child's protective ecosystem simultaneously.",
  note: "One alert. Five actors. Five different jobs, all starting at the same moment."
};

export const chainAlert = {
  sample: true,
  hazard: "Flood warning",
  risk: "Risk: high",
  level: "Orange alert",
  levelMeaning: "Prepare — risk threshold breached, immediate preparedness actions required",
  timing: "Issued simultaneously to all five actors"
};

export const earlyActionChain = [
  {
    actor: "School",
    Icon: School,
    who: "Head teacher and school health coordinator",
    accent: "heat",
    actions: [
      "Check drainage",
      "Move learning materials to upper floors",
      "Confirm safe entrance",
      "Activate alternative flood routes",
      "Inspect latrines for flood risk",
      "Check drinking water safety",
      "Notify parents via platform SMS"
    ]
  },
  {
    actor: "Parent",
    Icon: Users,
    who: "Parent or guardian, in their registered language",
    accent: "sky",
    sms:
      "Heavy rainfall may affect routes to school tomorrow. Do not allow your child to cross floodwater. Use the safe route. Give your child boiled or sachet water only.",
    smsMeta: "ClimaSchool · SMS · flood advisory"
  },
  {
    actor: "Community health worker",
    Icon: Stethoscope,
    who: "CHW covering the school catchment community",
    accent: "leaf",
    actions: [
      "Visit vulnerable households",
      "Prioritise children with disabilities",
      "Check for diarrhoea cases",
      "Confirm household water safety",
      "Report any medical emergencies via SMS keyword"
    ]
  },
  {
    actor: "Health facility",
    Icon: Building2,
    who: "Health post or clinic serving the catchment area",
    accent: "coral",
    actions: [
      "Check ORS supply",
      "Review referral contacts",
      "Activate flood-related diarrhoea preparedness",
      "Notify district health directorate"
    ]
  },
  {
    actor: "Institutional observer",
    Icon: Eye,
    who: "Authorised district officer, read-only view",
    accent: "plum",
    actions: [
      "View affected school and facility map",
      "Review access and transport issues",
      "Coordinate district emergency response",
      "Note outstanding actions"
    ]
  }
];

/* ── 2 · School Climate Resilience Score ─────────────────────────────── */

export const schoolScoreIntro =
  "Every participating school receives a dynamic School Climate Resilience Score, updated as conditions change and as new infrastructure data is submitted. Eight dimensions are scored and combined.";

export const schoolDimensions = [
  {
    dimension: "Heat exposure",
    Icon: Thermometer,
    indicators: [
      "Classroom temperature",
      "Shade",
      "Building orientation",
      "Ventilation quality"
    ]
  },
  {
    dimension: "Flood exposure",
    Icon: Droplets,
    indicators: [
      "School elevation",
      "Drainage",
      "Distance to flood-prone areas",
      "Past flood history"
    ]
  },
  {
    dimension: "WASH readiness",
    Icon: LifeBuoy,
    indicators: [
      "Handwashing stations",
      "Water source",
      "Latrine condition",
      "ORS stock level"
    ]
  },
  {
    dimension: "Nutrition resilience",
    Icon: Sprout,
    indicators: [
      "School feeding programme coverage",
      "Seasonal menu quality",
      "Food storage condition"
    ]
  },
  {
    dimension: "Health service access",
    Icon: HeartPulse,
    indicators: [
      "Distance to health facility",
      "CHW coverage",
      "School nurse availability"
    ]
  },
  {
    dimension: "Air quality exposure",
    Icon: Wind,
    indicators: [
      "Proximity to pollution sources",
      "Classroom dust levels",
      "Harmattan exposure risk"
    ]
  },
  {
    dimension: "Early warning readiness",
    Icon: Siren,
    indicators: [
      "Platform connectivity",
      "Alert acknowledgement rate",
      "Past action completion rate"
    ]
  },
  {
    dimension: "Infrastructure resilience",
    Icon: Building2,
    indicators: [
      "Building condition",
      "Roof quality",
      "Flood barriers",
      "Water storage capacity"
    ]
  }
];

export const schoolScoreExample = {
  sample: true,
  school: "Kanda Primary School, Tamale",
  score: 64,
  outOf: 100,
  band: "Moderate vulnerability",
  biggestGap: {
    dimension: "WASH readiness",
    score: 38,
    outOf: 100
  },
  priorityAction: "Improve water storage and drainage",
  expectedGain: "Estimated 14-point score improvement",
  costingLabel: "School-level costing for the priority action",
  costingNote:
    "An operational output of the score — what this one school would need to close its largest gap.",
  costing: [
    { item: "Water storage", cost: "GH₵8,000" },
    { item: "Shade", cost: "GH₵4,500" },
    { item: "Drainage", cost: "GH₵7,000" }
  ],
  costingTotal: "GH₵19,500",
  riskReduction: "Estimated 21% risk reduction for 612 children"
};

/* ── 3 · Emergency Mode ──────────────────────────────────────────────── */

export const emergencyModeIntro = {
  headline: "One button activates Emergency Mode.",
  body:
    "The head teacher selects the hazard type and ClimaSchool AI generates a full response workflow — no forms to design, no protocol to remember under pressure.",
  button: "Activate emergency mode"
};

export const emergencyHazards = [
  {
    hazard: "Flood",
    Icon: Droplets,
    accent: "sky",
    summary: "8-step workflow",
    steps: [
      "Child safety",
      "Materials protection",
      "Safe entrance confirmation",
      "Parent notification",
      "Water safety check",
      "Latrine inspection",
      "District reporting",
      "Unresolved needs tracking"
    ]
  },
  {
    hazard: "Extreme heat",
    Icon: Thermometer,
    accent: "heat",
    summary: "6-step workflow",
    steps: [
      "Schedule modification",
      "Shade activation",
      "ORS distribution",
      "Assembly cancellation",
      "Water station activation",
      "Parent advisory SMS"
    ]
  },
  {
    hazard: "Disease outbreak",
    Icon: Activity,
    accent: "coral",
    summary: "5-step workflow",
    steps: [
      "WASH protocol activation",
      "Isolation procedure",
      "CHW alert",
      "Ghana Health Service notification",
      "Classroom disinfection checklist"
    ]
  },
  {
    hazard: "Air pollution",
    Icon: Wind,
    accent: "sun",
    summary: "4-step workflow",
    steps: [
      "Window management",
      "Indoor activity protocol",
      "Dust protection advisory",
      "Scheduled water breaks"
    ]
  },
  {
    hazard: "Water contamination",
    Icon: FlaskConical,
    accent: "leaf",
    summary: "4-step workflow",
    steps: [
      "Safe water source activation",
      "District sachet water request",
      "Parent boiling advisory",
      "ORS pre-positioning"
    ]
  }
];

/* ── 4 · School → CHW → facility signal chain ────────────────────────── */

export const signalChainIntro =
  "One of ClimaSchool AI's most powerful features is the ability to detect community health signals early and route them to the right actor. This worked example follows a single absence pattern from a classroom register to a district health officer's desk.";

export const signalChain = [
  {
    stage: "School reports",
    actor: "Teacher",
    what:
      "Eight children absent with similar symptoms in the same week — teacher submits a SICK report via SMS."
  },
  {
    stage: "Platform detects",
    actor: "ClimaSchool AI",
    what:
      "Potential local health signal — school absence pattern outside the seasonal baseline."
  },
  {
    stage: "CHW receives",
    actor: "Community health worker",
    what:
      "Priority visit task: investigate household health status in the school catchment community."
  },
  {
    stage: "CHW reports",
    actor: "Community health worker",
    what:
      "Three households report fever and diarrhoea — submits a FEVER DIARRHOEA report via SMS keyword."
  },
  {
    stage: "Platform generates",
    actor: "ClimaSchool AI",
    what: "Elevated diarrhoeal disease signal — public-health verification recommended."
  },
  {
    stage: "Health facility receives",
    actor: "Health post",
    what:
      "Advisory: review recommended for a potential diarrhoeal cluster in the catchment area."
  },
  {
    stage: "Health officer reviews",
    actor: "District health officer",
    what:
      "Reviews available evidence and initiates the appropriate public-health response."
  }
];

export const signalChainSample = true;

/* ── 5 · ClimaSchool AI for health facilities ────────────────────────── */

export const facilityIntro = {
  headline: "Health facilities are a full pillar of ClimaSchool AI, not an afterthought.",
  body:
    "The facility module helps participating health posts and clinics serving school catchment areas anticipate, prepare, respond, recover and adapt to climate-sensitive health risks — directly grounded in the World Health Organization's Operational Framework for Climate-Resilient Health Systems.",
  framework: "WHO Operational Framework for Climate-Resilient Health Systems"
};

export const facilityDimensions = [
  {
    dimension: "Infrastructure resilience",
    Icon: Building2,
    indicators: [
      "Water supply",
      "Sanitation",
      "Energy backup",
      "Cooling",
      "Building condition",
      "Drainage",
      "Flood exposure"
    ]
  },
  {
    dimension: "Health service continuity",
    Icon: HeartPulse,
    indicators: [
      "Staffing",
      "Essential medicines",
      "ORS",
      "Emergency supplies",
      "Referral readiness",
      "Communications"
    ]
  },
  {
    dimension: "Climate hazard exposure",
    Icon: CloudSun,
    indicators: [
      "Heat exposure",
      "Flood exposure",
      "Drought exposure",
      "Air pollution exposure",
      "Harmattan exposure"
    ]
  },
  {
    dimension: "Supply readiness",
    Icon: ClipboardCheck,
    indicators: [
      "ORS stock level",
      "Malaria commodities",
      "Essential medicines",
      "Water",
      "Power"
    ]
  },
  {
    dimension: "Preparedness",
    Icon: Siren,
    indicators: [
      "Emergency response plan",
      "Staff training",
      "Surge capacity",
      "Community communication"
    ]
  }
];

export const facilityExample = {
  sample: true,
  facility: "Tamale District Health Post",
  score: 68,
  outOf: 100,
  risks: [
    { name: "Heat", level: "High" },
    { name: "Malaria", level: "Moderate" },
    { name: "Diarrhoeal disease", level: "Moderate" },
    { name: "Flood", level: "High" }
  ],
  supplies: [
    { name: "ORS", pct: 91, status: "Adequate" },
    { name: "Malaria commodities", pct: 77, status: "Adequate" },
    { name: "Essential medicines", pct: 74, status: "Adequate" },
    { name: "Water supply", pct: 62, status: "Below threshold" },
    { name: "Power backup", pct: 71, status: "Adequate" }
  ],
  actionsLabel: "Recommended actions — next 24 hours",
  actions: [
    "Check and replenish ORS to full capacity",
    "Confirm referral contacts for heat emergencies",
    "Review water supply and identify backup source",
    "Activate heat response procedures for inpatients"
  ]
};

export const aprraCycle = [
  {
    phase: "Anticipate",
    Icon: Telescope,
    fn:
      "Risk forecast dashboard showing 24-hour, 48-hour and 7-day climate-health risk outlook for the facility catchment area."
  },
  {
    phase: "Prepare",
    Icon: ClipboardCheck,
    fn:
      "Readiness checklist for essential supplies, staffing and infrastructure, linked to the current risk level."
  },
  {
    phase: "Respond — Surge Mode",
    Icon: Siren,
    fn:
      "One-button activation of a hazard-specific response workflow with step-by-step guidance for facility staff."
  },
  {
    phase: "Recover",
    Icon: RotateCcw,
    fn:
      "Post-event assessment capturing cases seen, supplies used and gaps experienced — feeding back into the facility resilience score."
  },
  {
    phase: "Adapt",
    Icon: Sprout,
    fn:
      "Prioritised infrastructure and supply investment recommendations derived from readiness score gaps."
  }
];

export const demandForecast = {
  sample: true,
  intro:
    "Where sufficient data are available, ClimaSchool AI provides health facility demand estimates.",
  rows: [
    {
      key: "Expected heat-related consultations",
      value: "40 to 55 over the next 72 hours",
      note: "Based on forecast temperature, historical incidence and school catchment population"
    },
    { key: "Current daily capacity", value: "25 consultations", note: "Facility-reported" },
    {
      key: "Potential gap",
      value: "Moderate",
      note: "Prepare additional triage capacity and coordinate with the nearest referral facility"
    }
  ],
  caveat:
    "All demand forecasts are decision-support estimates, not clinical guarantees. Human professional judgement governs all facility decisions."
};

/* ── 6 · Institutional Observer ──────────────────────────────────────── */

export const observerIntro = {
  headline: "Read-only. No system integration required.",
  body:
    "The Institutional Observer provides authorised public-sector stakeholders with a read-only monitoring and decision-support interface. Government officers do not need to connect ClimaSchool AI to their systems — it becomes an additional intelligence dashboard they can consult alongside the systems they already run."
};

export const institutionalUsers = [
  {
    user: "Ghana Health Service — District",
    Icon: HeartPulse,
    accent: "coral",
    sees: [
      "Current climate-health risks",
      "Schools at elevated risk",
      "Health facility readiness",
      "CHW signals",
      "Potential disease clusters",
      "Outstanding actions"
    ]
  },
  {
    user: "Ghana Education Service — District",
    Icon: GraduationCap,
    accent: "sky",
    sees: [
      "School resilience scores",
      "Absenteeism patterns",
      "Emergency mode activations",
      "WASH readiness gaps",
      "Investment priorities"
    ]
  },
  {
    user: "Environmental Protection Agency",
    Icon: Leaf,
    accent: "leaf",
    sees: [
      "Air quality alerts",
      "Pollution hotspots near schools",
      "Seasonal AQI trends",
      "Recommended school-level responses"
    ]
  },
  {
    user: "Ghana Meteorological Agency",
    Icon: CloudSun,
    accent: "sun",
    sees: [
      "Verification that ClimaSchool AI alerts are consistent with official forecast data",
      "Feedback on alert accuracy"
    ]
  },
  {
    user: "NADMO",
    Icon: LifeBuoy,
    accent: "heat",
    sees: [
      "Flood-risk schools and facilities",
      "Safe route status",
      "Emergency preparedness completion rates",
      "Outstanding community needs"
    ]
  },
  {
    user: "Development partners and researchers",
    Icon: Globe2,
    accent: "plum",
    sees: [
      "Aggregated, anonymised climate-health intelligence",
      "School resilience data",
      "Pilot evidence",
      "Open API access under the data governance framework"
    ]
  }
];

export const reviewDeskIntro =
  "Authorised officers can take the following actions within the observer interface without requiring technical integration into their own systems.";

export const reviewDeskActions = [
  {
    action: "Review",
    desc: "Read the current risk dashboard and affected school or facility list"
  },
  {
    action: "Acknowledge",
    desc: "Confirm that the alert has been seen by an authorised officer"
  },
  { action: "Comment", desc: "Add a professional note visible to the project technical team" },
  { action: "Escalate", desc: "Flag an alert for urgent attention by a senior officer" },
  {
    action: "Mark completed",
    desc: "Confirm that an institutional response action has been taken"
  }
];

/* ── Shared ──────────────────────────────────────────────────────────── */

export const sampleNote = "★ Sample figures shown — illustrative of a live deployment.";

export const pilotFooter = {
  lead: "Eco-lution Consults",
  country: "Ghana",
  scale: "2 confirmed pilot schools across 2 zones"
};
