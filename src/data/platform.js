import {
  Radar, ClipboardList, Zap, ShieldCheck, GraduationCap,
  Cpu, School, Users, Stethoscope, Building2, BarChart3,
  CloudSun, Layers, Thermometer, Waves,
  Globe, Handshake, FileText, Gauge, Lock,
  MessageSquare, Phone, Smartphone, Volume2, WifiOff, Monitor,
  Ear, Type, Eye, Contrast, Accessibility, Sparkles,
  Utensils, Wallet, Bell, ShoppingBasket, Send, Link2,
  Baby, HeartPulse, Activity, Map
} from "lucide-react";

/* ───────────────────────── 1 · Core definition & positioning ───────────────────────── */

export const coreDefinition = [
  "ClimaSchool AI is an open-source, child-centred digital platform that converts climate, environmental, school, community and health-related information into predictive risk insights, early warnings and role-specific actions to protect children from climate-sensitive health risks.",
  "The platform connects the full ecosystem around the child — schools, families, community health workers, health facilities and authorised institutional stakeholders — without requiring direct integration into government information systems.",
  "ClimaSchool operates as an independent, interoperable decision-support layer. Rather than replacing existing health or education systems, it complements them by providing climate-health intelligence, early warning, preparedness coordination, early action support and impact monitoring."
];

export const positioning = {
  isNot: [
    "A government health information system",
    "A clinical diagnostic tool",
    "A replacement for DHIS2 or Ghana Health Service systems",
    "A platform that claims to diagnose disease or outbreak status"
  ],
  is: "The intelligence and early-action layer around the child — connecting climate and environmental signals to the people and institutions responsible for protecting children, before climate hazards translate into avoidable harm."
};

export const principleChain = [
  {
    step: "Predict",
    Icon: Radar,
    body: "Weather, satellite, surveillance, school and community signals combine into a forward-looking child climate risk score for each school catchment."
  },
  {
    step: "Prepare",
    Icon: ClipboardList,
    body: "Schools, health facilities and community health workers receive preparedness protocols and readiness scores before a hazard arrives."
  },
  {
    step: "Act",
    Icon: Zap,
    body: "Every actor gets role-specific guidance they can carry out — never raw meteorological output."
  },
  {
    step: "Protect",
    Icon: ShieldCheck,
    body: "Families, classrooms and health services shield children while the hazard is live, with escalation into Emergency and Surge modes."
  },
  {
    step: "Learn",
    Icon: GraduationCap,
    body: "Field reports and outcomes feed back into risk thresholds, advisory content and the evidence base for planning."
  }
];

/* ───────────────────────── 2 · Six products ───────────────────────── */

export const products = [
  {
    name: "ClimaSchool Intelligence",
    Icon: Cpu,
    role: "The core",
    fn: "The AI, data and multi-hazard risk engine. Combines weather, satellite, disease surveillance, school, community and health facility data to generate dynamic child climate risk scores and early warnings.",
    core: true
  },
  {
    name: "ClimaSchool for Schools",
    Icon: School,
    role: "Head teachers · nurses · caterers",
    fn: "Dashboard, School Climate Resilience Score, preparedness protocols, Emergency Mode, daily action checklists, and climate-smart school feeding intelligence."
  },
  {
    name: "ClimaSchool for Families",
    Icon: Users,
    role: "Parents · caregivers",
    fn: "SMS, USSD, WhatsApp and voice guidance for parents and caregivers in four local languages. No smartphone or internet required."
  },
  {
    name: "ClimaSchool for CHWs",
    Icon: Stethoscope,
    role: "Community health workers",
    fn: "Prioritised task lists, structured visit checklists, referral coordination and community health reporting."
  },
  {
    name: "ClimaSchool for Health Facilities",
    Icon: Building2,
    role: "Clinics · health centres",
    fn: "Facility climate-health dashboard, Facility Climate Resilience Score, demand forecasting, surge mode and inter-facility referral coordination."
  },
  {
    name: "ClimaSchool Institutional Observatory",
    Icon: BarChart3,
    role: "Authorised institutions",
    fn: "Read-only monitoring and decision-support dashboard for authorised government officers, district health directorates, education authorities, development partners and researchers."
  }
];

export const openCore = {
  title: "One Open Core underneath all six",
  body: "Every product sits on a single open-source intelligence core providing responsible AI, APIs, data architecture, security and interoperability.",
  pillars: ["Responsible AI", "Open APIs", "Data architecture", "Security", "Interoperability"]
};

/* ───────────────────────── 3 · Best-practice foundations ───────────────────────── */

export const foundationsIntro =
  "ClimaSchool AI explicitly builds on principles from four established international systems rather than duplicating or competing with them. The platform adapts these principles to a child-centred, school–community–health-facility context.";

export const foundations = [
  {
    source: "WHO EWARS-csd",
    Icon: Activity,
    principle: "Climate-sensitive disease early warning: climate and weather inputs used to identify elevated disease risk and support anticipatory action. ClimaSchool adapts this for school and community settings with child-specific risk thresholds."
  },
  {
    source: "DHIS2 Climate and Health",
    Icon: Layers,
    principle: "Multi-source climate-health data integration, geospatial intelligence, predictive modelling, threshold-based risk classification and health logistics readiness. ClimaSchool applies these as an independent, interoperable layer rather than replacing national DHIS2 deployments."
  },
  {
    source: "WHO Climate-Resilient Health Facilities",
    Icon: Building2,
    principle: "Facility climate vulnerability assessment, the Anticipate–Prepare–Respond–Recover–Adapt framework, and health-service continuity planning. The ClimaSchool Health Facility module is directly grounded in this guidance."
  },
  {
    source: "WMO Early Warnings for All",
    Icon: Bell,
    principle: "Climate information must be translated into decision-relevant action for specific actors. ClimaSchool converts climate data into role-specific guidance rather than displaying raw meteorological information."
  }
];

/* ───────────────────────── 4 · Data sources framework ───────────────────────── */

export const dataFrameworkNote =
  "Interoperability by design. Integration where authorised and feasible.";

export const dataCategories = [
  {
    num: "01",
    name: "Public data",
    Icon: Globe,
    detail: "Weather forecasts, satellite observations, rainfall, temperature, air quality indices, flood information, publicly available health surveillance data, NDVI and land cover from earth observation platforms."
  },
  {
    num: "02",
    name: "Partner-provided data",
    Icon: Handshake,
    detail: "Information voluntarily provided by health facilities, schools, NGOs, research institutions, community organisations and development partners under formal data-sharing agreements."
  },
  {
    num: "03",
    name: "Structured field reports",
    Icon: FileText,
    detail: "Collected through community health workers, teachers, school administrators and trained community volunteers using SMS keyword codes and structured digital forms."
  },
  {
    num: "04",
    name: "Environmental sensors",
    Icon: Gauge,
    detail: "Where deployed at pilot sites: temperature, humidity, air quality, classroom conditions and flood or water-level indicators, providing ground-truth data to validate weather station forecasts."
  },
  {
    num: "05",
    name: "Authorised institutional data",
    Icon: Lock,
    detail: "Where a formal agreement exists, selected datasets may be exchanged through secure data exchange, uploaded datasets, APIs where permitted, or periodic data feeds."
  }
];

export const geoLayers = [
  {
    layer: "Schools",
    Icon: School,
    held: "Location, enrolment, building type, flood zone proximity, distance to health facility"
  },
  {
    layer: "Health facilities",
    Icon: HeartPulse,
    held: "Location, capacity, service type, catchment population, flood and heat exposure"
  },
  {
    layer: "Communities",
    Icon: Waves,
    held: "Flood-prone areas, water bodies, road access routes, population density"
  },
  {
    layer: "Climate exposure",
    Icon: Thermometer,
    held: "Temperature anomalies, rainfall anomalies, NDVI, land cover, elevation, air quality"
  }
];

/* ───────────────────────── 5 · Reaching everyone ───────────────────────── */

export const communityInterfaces = [
  {
    name: "Parent Copilot",
    Icon: Baby,
    body: "Parents see one question: How is my child today? The platform responds with the current climate risk level, today's three most important protective actions in plain language, and a seasonal food and hydration recommendation grounded in affordable, locally available foods.",
    extra: "Two-way SMS lets parents report illness by keyword — FEVER, RASH, STOMACH, FLOOD — triggering an automatic CHW visit request and targeted sub-guidance."
  },
  {
    name: "CHW Mobile Interface",
    Icon: Stethoscope,
    body: "Community health workers receive a prioritised daily task list generated by the risk engine. Each task carries a structured visit checklist covering child health status, household water safety, bednet availability and referral need.",
    extra: "CHWs report by SMS keyword code, feeding real community health data back into the district risk model."
  }
];

export const channelsIntro =
  "ClimaSchool AI is designed to remain useful when internet is unavailable, electricity is unreliable, smartphones are limited, and users are in remote areas.";

export const channels = [
  { channel: "SMS", Icon: MessageSquare, how: "Works on all basic feature phones. Two-way keyword system for reporting and guidance." },
  { channel: "USSD", Icon: Phone, how: "No internet or data required. Structured menus accessible from any phone." },
  { channel: "WhatsApp", Icon: Smartphone, how: "For users with smartphones and data. Includes an audio message option." },
  { channel: "Voice alerts", Icon: Volume2, how: "Audio guidance in Twi, Hausa, Ga and English. Critical for low-literacy caregivers." },
  { channel: "Offline progressive web app", Icon: WifiOff, how: "School dashboard functions offline and syncs when connectivity returns." },
  { channel: "Web dashboard", Icon: Monitor, how: "Full interface for schools and institutions with reliable connectivity." }
];

export const inclusion = [
  { feature: "Audio alerts", Icon: Ear, how: "All guidance available in audio format via WhatsApp." },
  { feature: "Simple language", Icon: Type, how: "All messages written at primary education reading level." },
  { feature: "Visual icons", Icon: Eye, how: "Risk levels shown as colour and icon — not text alone." },
  { feature: "High contrast", Icon: Contrast, how: "Dashboard readable in direct sunlight." },
  { feature: "Screen reader", Icon: Accessibility, how: "Web dashboard compatible with assistive technology." },
  { feature: "Child participation", Icon: Sparkles, how: "Young Climate Health Councils at pilot schools co-design messages, identify local risk factors and review language accessibility." }
];

/* ───────────────────────── 6 · School feeding intelligence ───────────────────────── */

export const feedingIntro =
  "A School Feeding Intelligence module connects seasonal climate and disease data directly to school menu planning and Ghana School Feeding Programme coordination.";

export const feeding = [
  {
    feature: "Monthly menu intelligence",
    Icon: Utensils,
    how: "Identifies the most nutritionally critical foods for the current season, cross-referenced with local market availability, the harvest calendar and active disease risk profiles."
  },
  {
    feature: "Menu optimiser",
    Icon: Wallet,
    how: "Given a per-child daily allowance in Ghana cedis, generates the most nutritionally optimal seasonal menu using locally available foods."
  },
  {
    feature: "Nutrition priority alerts",
    Icon: Bell,
    how: "When disease risk rises, menu recommendations adjust: iron-rich foods for malaria season, vitamin C for harmattan, electrolytes and hydration for heat season."
  },
  {
    feature: "Harvest sourcing guide",
    Icon: ShoppingBasket,
    how: "During the second rainy season, notifies feeding coordinators of peak harvest availability and lowest-cost local sourcing at district markets."
  },
  {
    feature: "Caterer SMS",
    Icon: Send,
    how: "A weekly one-action menu adjustment SMS to school caterers in plain language: one ingredient change, one cooking adjustment."
  },
  {
    feature: "School Feeding Programme link",
    Icon: Link2,
    how: "Formal integration MOU with the Ghana School Feeding Programme secretariat planned for months 8 to 10 of the pilot."
  }
];

/* ───────────────────────── 7 · Risk map & Observatory ───────────────────────── */

export const observatoryIntro =
  "A national child climate risk map, visible to institutional observers and as a public aggregated data layer. The map integrates school locations with Climate Resilience Scores, health facility access, real-time hazard alerts, disease risk overlays, nutrition vulnerability and absenteeism data — allowing users to zoom from national to region to district to school level.";

export const observatoryLevels = [
  {
    level: "Child environment",
    Icon: School,
    shown: "School conditions, classroom exposure, WASH readiness, absenteeism, school feeding quality"
  },
  {
    level: "Community",
    Icon: Users,
    shown: "CHW signals, WASH status, local hazard events, community health reports, household vulnerability"
  },
  {
    level: "Health system",
    Icon: HeartPulse,
    shown: "Facility readiness scores, health-service demand signals, referral patterns, supply adequacy"
  },
  {
    level: "Climate and environment",
    Icon: CloudSun,
    shown: "Real-time weather, temperature and rainfall anomalies, air quality, NDVI, flood extent, seasonal forecasts"
  }
];

export const observatoryCommitment = {
  Icon: Map,
  title: "Aggregated and anonymised, always",
  body: "All Observatory data is aggregated and anonymised. No individual child data is displayed. The Observatory exists to generate evidence for government planning, partner decision-making and research — not to profile individual children or communities."
};

/* ───────────────────────── Pilot footprint ───────────────────────── */

export const pilotFacts = [
  ["Lead", "Eco-lution Consults", "Ghana"],
  ["Pilot schools", "2 confirmed", "across 2 zones"],
  ["Zones", "Agbogbloshie / Korle Gonno", "Tamale Metropolis"],
  ["Languages", "EN · TW · HA · GA", "set per caregiver"]
];
