// Organisation, pilot and partnership data for ClimaSchool AI.
// Lead organisation: Eco-lution Consults, Ghana.
// Figures here are the confirmed pilot footprint — 2 schools across 2 zones.

export const leadOrg = {
  name: "Eco-lution Consults",
  country: "Ghana",
  platform: "www.climaschoolai.com"
};

/* ── What ClimaSchool AI is not, and what it is ───────────────────────── */

export const positioningNot = [
  "A government health information system",
  "A clinical diagnostic tool",
  "A replacement for DHIS2 or Ghana Health Service systems",
  "A platform that claims to diagnose disease or outbreak status"
];

export const positioningIs = [
  "The intelligence and early-action layer around the child",
  "A connector between climate and environmental signals and the people responsible for protecting children",
  "An independent, interoperable decision-support layer that complements existing systems",
  "A way to act before climate hazards translate into avoidable harm"
];

export const principle = ["Predict", "Prepare", "Act", "Protect", "Learn"];

/* ── Pilot ecosystem: two climate-vulnerable zones ────────────────────── */

export const pilotZones = [
  {
    id: "zone-1",
    label: "Pilot Zone 1",
    name: "Agbogbloshie / Korle Gonno",
    region: "Greater Accra Region",
    hazards: ["Flooding", "Cholera", "Waterborne disease", "Urban heat", "Air pollution"],
    schools: "1 primary school confirmed",
    tests:
      "Tests the platform's waterborne disease, diarrhoea and heat alert systems at maximum urban density and WASH pressure.",
    accent: "sky"
  },
  {
    id: "zone-2",
    label: "Pilot Zone 2",
    name: "Tamale Metropolis",
    region: "Northern Region",
    hazards: ["Extreme heat", "Harmattan", "Cerebrospinal meningitis", "Malaria", "Water scarcity"],
    schools: "1 primary school confirmed",
    tests:
      "Tests the heat, respiratory and vector disease alert systems in Ghana's most heat-stressed urban zone.",
    accent: "heat"
  }
];

export const pilotActors = [
  {
    actor: "Schools",
    scope:
      "2 confirmed pilot schools — 1 per zone. Head teacher, school nurse and school feeding caterer enrolled."
  },
  {
    actor: "Families",
    scope: "Minimum 200 parents per zone receiving SMS and WhatsApp guidance in local language."
  },
  {
    actor: "CHWs",
    scope: "2 community health workers per zone integrated into the platform task and reporting system."
  },
  {
    actor: "Health facilities",
    scope:
      "1 participating health post per zone for facility dashboard, readiness scoring and referral coordination."
  },
  {
    actor: "Environmental sensors",
    scope:
      "Low-cost temperature, humidity and air quality sensors at both schools, validating weather station data against actual classroom conditions."
  },
  {
    actor: "Institutional observers",
    scope:
      "District Health Directorate and District Education Office in both Greater Accra and Northern Region given observer dashboard access."
  }
];

/* ── Team ─────────────────────────────────────────────────────────────── */

export const team = [
  {
    name: "Noah Badolyin Bugre",
    role: "Founder, Eco-lution Consults",
    profile:
      "Environmental engineer with an MSc from UENR and over seven years of experience in climate impact assessment, green economy policy and climate governance across Ghana and internationally."
  },
  {
    name: "Dr. Ewuradwoa Sarpong Opoku",
    role: "Medical Advisor",
    profile:
      "Medical doctor trained at KNUST with clinical rotations across paediatrics, surgery, obstetrics and internal medicine. Provides clinical oversight of all health advisory content and seasonal protocols."
  },
  {
    name: "Monalisa Kayper Tackie",
    role: "Data and Climate-Health Analyst",
    profile:
      "Statistician and climate change specialist at the University of Ghana whose MSc thesis on predicting malaria incidence using climate variables directly informs the platform's risk classification engine."
  },
  {
    name: "Romeo Tweneboah Koduah",
    role: "Technical and Policy Lead",
    profile:
      "Environmental engineer and UNEP project coordinator at RCEES-UENR with expertise in climate modelling, GIS, machine learning and multi-stakeholder policy engagement across Ghana and West Africa."
  },
  {
    name: "Sheila Abankwe",
    role: "Partnerships and Community Engagement",
    profile:
      "Social worker and climate advocate with WASH, child welfare and community programme experience, leading parent engagement and school community mobilisation across both pilot zones."
  }
];

/* ── Partners ─────────────────────────────────────────────────────────── */

export const partners = [
  {
    name: "RCEES-UENR",
    detail: "Regional Centre for Energy and Environmental Sustainability, University of Energy and Natural Resources",
    role:
      "Academic research validation and technical review of climate data methodology and the AI model."
  },
  {
    name: "Centre for Climate Change and Sustainability",
    detail: "University of Ghana",
    role:
      "Scientific oversight of seasonal risk models, climate-health data integration and evidence generation during the pilot period."
  },
  {
    name: "UNIYIA",
    detail: "United Youth Initiative for Africa",
    role:
      "YOUNGO-accredited and UNFCCC observer organisation. Green Youth Club school network as pilot pipeline and youth health mobilisation capacity."
  },
  {
    name: "Medical Advisory Group",
    detail: "Practising Ghanaian doctors",
    role:
      "Community and paediatric health experience reviewing all clinical guidance and health protocols before platform deployment."
  },
  {
    name: "Ghana Health Service",
    detail: "District level",
    role:
      "Operational coordination for CHW integration and disease surveillance data access in Greater Accra and Northern Region. Formal MOU in progress."
  }
];

/* ── Open by default ──────────────────────────────────────────────────── */

export const openness = [
  ["Software", "MIT licence", "Full platform published on GitHub under a permissive open-source licence."],
  ["Content", "CC-BY 4.0", "Every seasonal health advisory is shareable and adaptable with attribution."],
  ["Standards", "Published API docs", "API documentation, data schemas and integration guides in the open."],
  ["Transparency", "Model cards", "Training data sources and performance metrics published openly."],
  ["Portability", "Country Adapter", "Configuration framework for deployment in any ECOWAS country with equivalent data infrastructure."],
  ["Community", "Contribution guide", "Open contribution guidelines so others can improve and localise the platform."]
];
