// Responsible AI & evidence — content for the /trust page.
// All figures marked `sample: true` are illustrative only.

/* ── 1 · Risk classification (standard across all hazards) ───────────── */
export const riskLevels = [
  {
    code: "GREEN",
    label: "Normal",
    swatch: "bg-leaf",
    ring: "border-leaf",
    tint: "from-leaf/15 to-paper",
    text: "text-[#2e7d3c]",
    meaning:
      "Conditions are within expected range. Standard seasonal health guidance applies.",
    action: "Seasonal advisory to schools and parents"
  },
  {
    code: "YELLOW",
    label: "Watch",
    swatch: "bg-sun",
    ring: "border-sun",
    tint: "from-sun/20 to-paper",
    text: "text-[#8a6100]",
    meaning:
      "Conditions are approaching risk thresholds. Preparedness actions recommended.",
    action: "Preparedness checklist to school and CHW"
  },
  {
    code: "ORANGE",
    label: "Prepare",
    swatch: "bg-heat",
    ring: "border-heat",
    tint: "from-heat/15 to-paper",
    text: "text-heat",
    meaning:
      "Risk threshold breached. Immediate preparedness actions required.",
    action: "Action alert to school, CHW, and health facility"
  },
  {
    code: "RED",
    label: "Act",
    swatch: "bg-[#c62828]",
    ring: "border-[#c62828]",
    tint: "from-[#c62828]/15 to-paper",
    text: "text-[#c62828]",
    meaning:
      "Critical risk. Immediate action required. Human review mandatory before distribution.",
    action: "Critical alert with human review gate"
  }
];

/* ── 2 · Alert confidence & evidence display ─────────────────────────── */
export const exampleAlert = {
  sample: true,
  fields: [
    { key: "Risk level", value: "RED — HIGH" },
    { key: "Confidence", value: "84%" },
    {
      key: "Evidence",
      value:
        "forecast temperature 39.4°C | humidity 31% | three consecutive hot days | poor classroom ventilation | water availability below threshold | two previous heat incidents"
    },
    { key: "Verification status", value: "Pending human review" },
    { key: "Source", value: "Climate model | School infrastructure data | CHW report" }
  ]
};

export const alertFraming = {
  never: "There is an outbreak.",
  always:
    "Climate and available indicators suggest elevated risk. Public-health verification recommended."
};

/* ── 3 · AI Safety Gate ──────────────────────────────────────────────── */
export const safetyGates = [
  {
    gate: "AI generates alert",
    fn: "Risk engine produces draft alert with confidence score and evidence"
  },
  {
    gate: "Safety rules check",
    fn: "Automated rules screen for clinical accuracy, appropriate language, and scope boundaries"
  },
  {
    gate: "Human review",
    fn: "For ORANGE and RED alerts, an authorised team member reviews before distribution"
  },
  {
    gate: "Approved message",
    fn: "Reviewed alert distributed with Verified by label and timestamp"
  },
  {
    gate: "Distribution",
    fn: "Sent simultaneously to school, parent, CHW, health facility, and institutional observer"
  }
];

/* ── 4 · Alert lifecycle ─────────────────────────────────────────────── */
export const alertLifecycle = [
  {
    stage: "Created",
    what: "Risk engine generates alert with evidence and confidence score"
  },
  {
    stage: "Reviewed",
    what: "Authorised team member reviews ORANGE and RED alerts before issue"
  },
  { stage: "Issued", what: "Alert distributed to all relevant actors simultaneously" },
  { stage: "Acknowledged", what: "School, CHW, and health facility confirm receipt" },
  { stage: "Action started", what: "Actor confirms preparedness action has begun" },
  {
    stage: "Action completed",
    what: "Actor confirms action is done and records outcome"
  },
  { stage: "Closed", what: "Alert closed with outcome data feeding back into model" }
];

/* ── 5 · Three alert types ───────────────────────────────────────────── */
export const alertTypes = [
  {
    type: "ADVISORY",
    level: "YELLOW",
    swatch: "bg-sun",
    ring: "border-sun",
    text: "text-[#8a6100]",
    meaning:
      "General awareness. Conditions approaching risk thresholds. Standard seasonal guidance plus preparedness reminder.",
    process: "Automated distribution"
  },
  {
    type: "ACTION ALERT",
    level: "ORANGE",
    swatch: "bg-heat",
    ring: "border-heat",
    text: "text-heat",
    meaning:
      "Specific action recommended. Risk threshold breached. Human review before distribution.",
    process: "Human-reviewed distribution"
  },
  {
    type: "CRITICAL ALERT",
    level: "RED",
    swatch: "bg-[#c62828]",
    ring: "border-[#c62828]",
    text: "text-[#c62828]",
    meaning:
      "Immediate action required. Mandatory human review and institutional notification.",
    process: "Human-gated mandatory review"
  }
];

/* ── 6 · Model Lab + Model Cards ─────────────────────────────────────── */
export const modelLab = [
  {
    fn: "Train",
    desc: "Build models using historical Ghana Health Service and Ghana Meteorological Agency data for each hazard and disease"
  },
  {
    fn: "Validate",
    desc: "Compare model predictions against actual observed outcomes across pilot sites"
  },
  {
    fn: "Compare",
    desc: "Evaluate competing models on accuracy, false alert rate, missed event rate, and lead time"
  },
  {
    fn: "Deploy",
    desc: "Activate the best-performing model for each district and season"
  },
  {
    fn: "Monitor",
    desc: "Continuously compare prediction vs observation and retrain as new pilot data arrives"
  }
];

export const modelCardItems = [
  "Purpose",
  "Data sources",
  "Target population and context",
  "Known limitations",
  "Validation method",
  "Appropriate use",
  "Inappropriate use",
  "Human oversight requirements",
  "Model performance metrics"
];

/* ── 7 · Responsible AI framework ────────────────────────────────────── */
export const raiPrinciples = [
  {
    principle: "Child safety first",
    implementation:
      "No individual child data stored or profiled. Risk assessments at school and community level only."
  },
  {
    principle: "Human in the loop",
    implementation:
      "All ORANGE and RED alerts require human review before distribution. Clinical and safeguarding decisions remain with trained professionals."
  },
  {
    principle: "Explainability",
    implementation:
      "Every alert shows the specific data inputs, confidence level, and verification status that generated it."
  },
  {
    principle: "Data minimisation",
    implementation:
      "Only data essential for risk assessment collected. No biometric or personally identifiable child data."
  },
  {
    principle: "Bias monitoring",
    implementation:
      "Model performance monitored across regions, school types, and seasons to detect and correct bias."
  },
  {
    principle: "Language validation",
    implementation:
      "All AI-generated messages validated by native-speaker community members before deployment."
  },
  {
    principle: "Privacy by design",
    implementation:
      "Data governance framework published openly. No data shared with third parties without institutional consent."
  },
  {
    principle: "Model transparency",
    implementation:
      "Model Cards published for every AI model. Training data, performance metrics, and limitations documented openly."
  },
  {
    principle: "AI incident reporting",
    implementation:
      "Any alert resulting in incorrect or harmful action is logged, reviewed, and used to improve the model."
  },
  {
    principle: "Child participation",
    implementation:
      "Young Climate Health Councils co-design the platform's community-facing features and review messages for clarity and appropriateness."
  }
];

/* ── 8 · Impact measurement ──────────────────────────────────────────── */
export const childOutcomeMetrics = [
  {
    metric: "Climate-related absenteeism",
    how: "Change in illness-related school absence vs prior-year baseline, disaggregated by hazard type and season"
  },
  {
    metric: "Heat-related incidents",
    how: "Heat exhaustion and fainting incidents at pilot schools vs baseline"
  },
  {
    metric: "Referral time",
    how: "Average time from CHW symptom report to health facility attendance"
  },
  {
    metric: "ORS availability",
    how: "Percentage of schools with adequate ORS stock at seasonal risk onset"
  },
  {
    metric: "WASH readiness improvement",
    how: "Change in School Climate Resilience Score from baseline to end of pilot"
  },
  {
    metric: "Parent response rate",
    how: "Percentage of parents who took the recommended action within 24 hours of receiving an alert"
  }
];

export const systemMetrics = [
  {
    metric: "Alert accuracy",
    how: "Percentage of high-risk alerts validated by subsequent GHS district disease reports"
  },
  {
    metric: "Warning lead time",
    how: "Average hours of advance notice before a climate-health event"
  },
  {
    metric: "Action completion rate",
    how: "Percentage of schools that completed the recommended action protocol following an alert"
  },
  {
    metric: "CHW response time",
    how: "Average time from platform task assignment to CHW home visit completion"
  },
  {
    metric: "Minutes of Protection",
    how: "Number of children who received protective action before climate exposure, and average advance time of that protection"
  }
];

export const minutesOfProtection = {
  name: "Minutes of Protection",
  definition:
    "ClimaSchool AI reports the number of children protected before climate exposure, and the average advance time that protection was delivered.",
  sample: true,
  example: {
    children: "3,840",
    childrenLabel: "children received heat protection actions",
    lead: "4.2 hours",
    leadLabel: "average advance time before peak temperature"
  },
  why: "This translates climate data into a human outcome partners can communicate."
};

/* ── 9 · Digital Public Good readiness ───────────────────────────────── */
export const dpgCommitments = [
  { component: "Open-source code", commitment: "Full platform on GitHub under MIT licence" },
  { component: "Open content", commitment: "All seasonal health advisory content under CC-BY 4.0" },
  {
    component: "Open standards",
    commitment: "API documentation, data schemas, and integration guides published"
  },
  {
    component: "Transparent AI",
    commitment: "Model Cards, training data sources, and performance metrics published openly"
  },
  {
    component: "Privacy architecture",
    commitment: "Data governance framework and privacy impact assessment published"
  },
  {
    component: "Country Adapter",
    commitment:
      "Configuration framework enabling deployment in any ECOWAS country with equivalent data infrastructure — built in Ghana, designed for Africa"
  },
  {
    component: "Responsible AI documentation",
    commitment:
      "AI ethics and safeguarding documentation aligned with UNICEF Policy Guidance on AI for Children"
  },
  {
    component: "Contribution guide",
    commitment:
      "Open contribution guidelines enabling the global health technology community to improve and localise the platform"
  }
];
