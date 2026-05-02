export const seasons = {

  harmattan: {
    title: "Harmattan",
    months: "November — February",
    alert: "Sahara dust sharply reduces air quality across Ghana. Children face elevated risk of respiratory infections, meningitis (especially in northern Ghana), severe dehydration, eye and skin irritation, and anaemia. Peak season for cerebrospinal meningitis outbreaks.",
    hydroLevel: "VERY HIGH", hydroPct: 70,
    fluid: "1.5 — 2 L",
    schoolLevel: "DUST PROTOCOL",
    schoolLevelSub: "indoor PE · 45-min water breaks",
    drugStock: "Vit A · ORS · saline",
    drugStockSub: "available at every sick bay",
    risks: [
      ["Respiratory infections (ARI)", "Dusty air inflames airways. Sharp increases in coughing, asthma attacks, bronchitis, pneumonia in under-10s."],
      ["Cerebrospinal meningitis (CSM)", "Northern Ghana sits in the meningitis belt. Crowded classrooms + dry air spread CSM. Peaks Jan–Mar."],
      ["Severe dehydration", "Children lose moisture rapidly through skin and breathing in dusty air — without feeling thirsty."],
      ["Conjunctivitis / eye infections", "Dust particles cause irritation and secondary bacterial infection. Highly contagious in classrooms."],
      ["Anaemia exacerbation", "78% of Ghanaian under-fives are anaemic. Respiratory stress raises oxygen demand."],
      ["Skin infections (impetigo)", "Dry skin cracks let bacteria in. Shared towels and limited handwashing access spread impetigo."]
    ],
    foods: [
      ["Groundnut soup with rice or yam", "High protein and healthy fats strengthen respiratory mucosa. Iron from groundnuts combats anaemia.", "year-round · nationwide"],
      ["Oranges, tangerines, pineapple", "Vitamin C boosts immune response, aids iron absorption, protects respiratory lining from dust.", "peak Dec — Feb"],
      ["Kontomire / cocoyam leaves", "Iron-rich leafy greens address anaemia. Beta-carotene supports lung tissue.", "all regions · year-round"],
      ["Beans (cowpeas, red beans)", "Protein for immune cell production. Zinc aids recovery from skin infections.", "abundant & affordable"],
      ["Ginger & garlic in soups", "Anti-inflammatory and antimicrobial — reduce duration of respiratory infections.", "low cost · everywhere"],
      ["Fermented porridge (koko)", "Warm, hydrating, probiotic. Fortify with groundnut paste for protein.", "traditional staple"]
    ],
    avoid: [
      ["Ice-cold drinks", "Irritate inflamed dust-stressed airways, can trigger bronchospasm."],
      ["Deep-fried street food", "Excess fat increases airway inflammation and slows immune response."],
      ["Sugary carbonated drinks", "Suppress immunity and create false sense of hydration."]
    ],
    bestSources: ["Boiled or sachet water", "Sobolo (unsweetened)", "Diluted citrus juice", "Warm soups & broths"],
    ors: "ORS sachets at school clinics for any child with dehydration signs — dry lips, sunken eyes, dizziness. Prepare 1 sachet in 1 L of boiled water.",
    school: [
      ["Handwashing bowls — min 3/class", "At classroom entrances, toilets, canteen. Refill every 2 hours."],
      ["Ventilation management", "Partially close windows during peak dust hours (10am–3pm). Wet-mop floors daily."],
      ["Drinking water stations", "Sachet or boiled water in sealed containers. 5-min water breaks every 45 minutes."],
      ["Eye-wash stations", "Salt solution at school entrance. Train teachers on basic procedure."],
      ["Sick-bay readiness", "ORS, paracetamol, nasal saline drops, eye drops, blankets. Min 2 beds."],
      ["Towel & shared item ban", "No shared towels. Notify parents to send individual ones. Wash items weekly hot."],
      ["Physical activity timing", "Outdoor PE before 9am or after 4pm. Cancel when visibility is poor."]
    ],
    chw: [
      ["CSM surveillance", "Northern posts activate CSM reporting from November. Stiff neck + headache + fever → immediate referral."],
      ["Vitamin A supplementation", "GHS coordination so under-5s get Vit A before harmattan peak. Reduces ARI severity."],
      ["Door-to-door dehydration screening", "Bi-weekly visits to under-10 households. Check dry mouth, lethargy."],
      ["ARI case tracking", "Weekly ARI tally. Alert district if > 10% of school children."],
      ["Skin treatment outreach", "Free impetigo treatment at school-linked posts. Antiseptic soap to nurses."]
    ],
    parent: [
      ["Morning routine", "Warm breakfast and 2 cups of water. Petroleum jelly to lips and nostrils against dust."],
      ["School pack", "Personal water bottle (boiled or sachet). Individual face towel — no sharing."],
      ["Evening dinner", "Iron-rich foods: beans, groundnut soup, leafy greens. Citrus to aid iron absorption."],
      ["Warning signs", "Stiff neck + severe headache + fever (meningitis), sunken eyes, persistent cough > 5 days → health post."],
      ["Eye & skin care", "Wash face and hands at home. No rubbing dusty hands in eyes. Daily lotion."]
    ],
    sms: [
      { title: "Harmattan begins · day 1", body: "Akwaaba. Today: warm breakfast, 2 cups water, Vaseline on lips/nose. Pack a personal towel.", ts: "07:02 · ENG · TWI" },
      { title: "AQI alert · Accra", body: "Dust high near your school. Indoor PE only. Refill water at break. Wash face on return.", ts: "10:18 · ENG" },
      { title: "Citrus is in season", body: "Markets full of cheap oranges. Send 1 with your child — vitamin C protects from harmattan colds.", ts: "Sun · 18:40" },
      { title: "⚠ CSM watch · Tamale", body: "CSM case nearby. Watch: stiff neck + severe headache + fever. Health post immediately if seen.", ts: "Mon · 06:55" }
    ],
    triggers: [
      ["AQI forecast > WHO hazard threshold", "SMS to head teacher: indoor PE, window protocol, water break schedule. Parents: morning protection tips."],
      ["GHS · CSM case in catchment district", "Immediate alert to school nurse, district officer, parents. Disinfection + isolation checklist."],
      ["Night temp < 18°C + dust forecast", "School nurse alerted to ARI surge in 48h. ORS stock check prompt."],
      ["Pupil absent 3+ days", "Flag to school nurse + CHW for home visit. Parent receives wellness check SMS."],
      ["Weekly ARI > 10% of pupils", "District officer escalation. School receives outbreak response checklist."]
    ]
  },

  dryheat: {
    title: "Peak dry heat",
    months: "March — April",
    alert: "The most dangerous heat months in Ghana. Temperatures exceed 40°C in the north. Children face critical risk of heat stroke, heat exhaustion and severe dehydration. The window where ClimaSchool AI early-warning alerts are most life-saving.",
    hydroLevel: "CRITICAL", hydroPct: 96,
    fluid: "2 — 2.5 L",
    schoolLevel: "SCHEDULE MOD",
    schoolLevelSub: "cancel afternoon PE",
    drugStock: "ORS · 50+",
    drugStockSub: "at every sick bay",
    risks: [
      ["Heat stroke / heat exhaustion", "Children's thermoregulation is less efficient than adults. Outdoor PE, long walks, hot classrooms can trigger emergency."],
      ["Severe dehydration", "Children can lose up to 1 L per hour through sweat. Without electrolytes → confusion, fainting, organ stress."],
      ["Heat-triggered fainting", "Morning assemblies and gatherings in direct sun are high-risk and preventable."],
      ["Appetite suppression", "Extreme heat reduces appetite. Children skip meals — worsening underlying deficiencies."],
      ["Sleep deprivation", "Hot nights impair sleep. Sleep-deprived children show reduced concentration, immune suppression."],
      ["Heat-aggravated skin infections", "Sweat, dust, friction in hot classrooms spread prickly heat, ringworm, impetigo."]
    ],
    foods: [
      ["Coconut water", "Natural electrolyte solution — replaces sodium, potassium, magnesium. Prevents heat collapse.", "street vendors · affordable"],
      ["Watermelon & cucumbers", "92% water content. Lycopene is anti-inflammatory. Easy to eat with low appetite.", "peak Mar — May"],
      ["Light kenkey + grilled fish + pepper", "No heavy fat thermogenesis. Fish protein supports muscles in heat. Pepper soup raises fluid intake.", "coastal & central Ghana"],
      ["Sobolo (hibiscus)", "Naturally cooling. Vitamin C and anthocyanins reduce cardiovascular stress.", "low cost · widely sold"],
      ["Bananas & pawpaw", "Potassium prevents muscle cramps. Soft and palatable when appetite is low.", "year-round"],
      ["Light watery porridge (akamu)", "Hydration + energy. Lightly salt to replace sodium.", "very low cost"]
    ],
    avoid: [
      ["Heavy stews & oily foods", "Digesting fat raises body temperature — thermogenic effect during dangerous heat."],
      ["Sugary drinks (soda, juice)", "Rapid sugar spike + crash. Increase dehydration. Children mistake sweetness for hydration."],
      ["Large single meals", "Digesting large meals raises body heat and diverts blood from muscles to gut."],
      ["Salted/spiced snacks", "Increase thirst without hydration. Worsen electrolyte imbalance."]
    ],
    bestSources: ["Coconut water (natural electrolytes)", "Sobolo · diluted juice + pinch of salt", "ORS solution", "Plain boiled water sipped consistently"],
    ors: "Heat exhaustion symptoms (dizziness, confusion, rapid breathing, stopped sweating) → ORS immediately + move to shade. Medical emergency. Call for care if not improving in 15 min.",
    school: [
      ["Shading & cooling stations", "Tarpaulin / tree / shade cloth. ≥1 cool-down station per 100 pupils."],
      ["Water at morning assembly", "Cup of water (or coconut water) before school day. Non-negotiable when forecast > 35°C."],
      ["Cross-ventilation + wet-floor cooling", "Open windows + doors. Wet-mop classrooms — evaporative cooling reduces 2–4°C."],
      ["ORS at sick bay", "Min 50 sachets through Mar–Apr. Restock when below 20. Train nurse on heat exhaustion."],
      ["Handwashing for heat infection", "3 bowls/class refilled every 2h. Heat skin infections spread via sweat."],
      ["Modified school schedule", "Forecast > 38°C → 7am–12pm only. No PE 11am–4pm."],
      ["Assembly protocol", "Under 10 min, never in direct sun. Fainting → shade + wet cloth + ORS."]
    ],
    chw: [
      ["Heat exhaustion case protocol", "Body temp > 39°C, confusion, stopped sweating = emergency. Cool, ORS, refer to hospital."],
      ["Sleep & rest tracking", "Ask about sleep on home visits. Persistent night heat raises vulnerability."],
      ["Heat-suppressed appetite screening", "Weigh school-age children Mar–Apr. Weight loss → RUTF or feeding support."],
      ["Skin treatment outreach", "Free antifungal/antibacterial at school-linked posts. Antiseptic soap supplied."]
    ],
    parent: [
      ["Before school", "Full cup of water or coconut water. Sunscreen or shea butter on exposed skin. Light loose cotton."],
      ["School water bottle", "≥ 500 ml. Refill at school. Teach: drink before feeling thirsty."],
      ["After school", "Water and a light snack on return. Rest in shade 30 min before activity."],
      ["Evening meal", "Light — kenkey + fish, beans, kontomire. Not heavy fufu. Cup of water before bed."],
      ["URGENT signs", "Stops sweating, becomes confused, body temp > 39°C, faints, seizure → health post NOW."]
    ],
    sms: [
      { title: "⚠ Heat alert · 39°C today", body: "Morning assembly cancelled. Water bottle mandatory. No outdoor play 11am–4pm. Drink before thirsty.", ts: "06:48 · ENG · HA" },
      { title: "Coconut water at the gate", body: "Caterer serving coconut water at break. Encourage your child — replaces salts lost in sweat.", ts: "09:10 · ENG" },
      { title: "Tonight's meal", body: "Light dinner: kenkey + grilled tilapia + pepper. Cup of water before bed. Avoid fufu and oily stew.", ts: "Wed · 17:30" },
      { title: "🚨 Heat stroke signs", body: "If your child STOPS sweating, becomes confused, or faints — wet cloth, shade, ORS, health post NOW.", ts: "Thu · 13:02" }
    ],
    triggers: [
      ["Forecast > 38°C", "Schedule modification, assembly cancellation, water distribution. Parents: morning hydration + clothing."],
      ["Forecast > 40°C · extreme heat", "Closure recommendation to district education. Parents: emergency safety SMS. CHW alert for vulnerable children."],
      ["Heat exhaustion case at school", "District-wide school heat alert. Neighbouring schools receive immediate protocol."],
      ["3+ fainting incidents in 1 week", "Escalation to district health officer + GES. Compulsory schedule modification."],
      ["Night temp > 28°C for 3 nights", "Sleep deprivation advisory. Nurse alerted for fatigue + reduced concentration."]
    ]
  },

  firstrains: {
    title: "First rains",
    months: "May — July",
    alert: "Onset of rains brings the year's peak malaria transmission as mosquito breeding surges. Flooding in Accra and coastal cities sharply raises cholera, typhoid and diarrhoeal disease risk. The most critical season for nutritional immunity-building and WASH infrastructure.",
    hydroLevel: "MODERATE — HIGH", hydroPct: 60,
    fluid: "1.5 — 2 L",
    schoolLevel: "WASH CRITICAL",
    schoolLevelSub: "5+ handwashing stations",
    drugStock: "ORS · 100+",
    drugStockSub: "for cholera response",
    risks: [
      ["Malaria · peak transmission", "Rain creates ideal mosquito breeding. May–Jul is peak. Under-10s are majority of severe cases."],
      ["Cholera outbreaks", "Flooding contaminates water and overwhelms sanitation. Can kill within hours in young children."],
      ["Typhoid fever", "Contaminated water and food from flooded markets. Symptoms shared with malaria — diagnostic delays are dangerous."],
      ["Diarrhoeal disease", "Leading cause of child mortality after malaria. Children dehydrate fatally within 24h without ORS."],
      ["Leptospirosis", "Contact with floodwater contaminated by animal urine. Often misdiagnosed as malaria."],
      ["Flood injury & drowning", "Children crossing flooded gutters and roads. Primary concern in low-lying schools in Accra & Kumasi."]
    ],
    foods: [
      ["Sweet potatoes & carrots", "Beta-carotene reduces malaria severity. Vitamin A deficiency worsens malaria outcomes.", "stores well in rains"],
      ["Leafy greens (spinach, kontomire)", "Iron replaces haemoglobin lost to malaria. Vitamin C aids absorption.", "year-round"],
      ["Beans + fortified rice", "Zinc reduces malaria complications and supports gut repair.", "affordable staple"],
      ["Boiled eggs (NOT raw or fried)", "Complete protein for immune cells. Iron for malaria anaemia. Boil thoroughly.", "widely available"],
      ["Citrus juice in boiled water", "Vitamin C immunity + safe hydration with boiled water.", "limes very affordable"],
      ["Fermented porridge + groundnut", "Probiotics restore gut bacteria after diarrhoea. Groundnut adds protein and zinc.", "traditional staple"]
    ],
    avoid: [
      ["Raw veg from flood-area stalls", "May be contaminated with faecal matter. Cholera, typhoid, E. coli risk."],
      ["Street food from flood-prone vendors", "Prepared near contaminated water. Avoid unverified street food May–Jul."],
      ["Sugary drinks & processed snacks", "Suppress immune function and gut health, worsening diarrhoea + malaria recovery."],
      ["Unpeeled raw fruit from unknown sources", "Skins may be contaminated. Wash in boiled water or peel."]
    ],
    bestSources: ["Boiled water only · sealed sachet water", "Oral rehydration solution (ORS)", "Citrus juice in boiled water", "Sobolo with boiled water"],
    ors: "ORS is the single most important intervention for cholera and diarrhoea. Schools stock minimum 100 sachets. 3+ loose stools/day → ORS immediately + refer.",
    school: [
      ["Handwashing — CRITICAL · min 5 stations", "Single most important cholera prevention measure. Each entrance, toilet, canteen, gate. Change water every 2h."],
      ["Drinking water safety audit", "Before May 1 inspect all sources. Seal contaminated wells. Switch to sachet if needed."],
      ["Toilet & latrine sanitation", "Chlorinate weekly. If floodwater reaches latrine, close immediately + portable toilets."],
      ["ORS & diarrhoea response station", "100+ sachets, zinc tablets, clean jug. Train nurse + 1 teacher on ORS prep."],
      ["Flood-route mapping", "Map flooding hotspots on routes. Distribute safe-route SMS to parents."],
      ["Food storage inspection", "Monthly. Discard mouldy/damp food. Grain raised off floor."],
      ["Classroom drainage check", "Clear gutters before May. Schools that flood need temporary learning space plan."]
    ],
    chw: [
      ["Cholera outbreak protocol", "From May 1 all posts in catchment activate cholera surveillance. ≥3 cases in 24h = potential outbreak."],
      ["RDT for malaria deployment", "Adequate stock for school-age children. Any fever May–Jul → malaria test first."],
      ["Vitamin A & zinc supplementation", "Co-administer to under-10s during first rains. Both reduce malaria severity."],
      ["Bednet distribution coordination", "With NMCP — ITNs to school-age households before May. Schools as distribution points."],
      ["School malaria education", "30-min CHW or nurse session at each school in April: bednets, eliminate standing water, early symptoms."]
    ],
    parent: [
      ["Water at home", "Boil all drinking and cooking water May–Jul. Covered container. Purification tablets if no boil."],
      ["Malaria protection", "Insecticide-treated bednet every night from May. Remove standing water weekly."],
      ["Early malaria warning", "Fever + chills + headache + appetite loss → health post same day. Do not wait."],
      ["Diarrhoea response", "3+ loose stools/day → ORS immediately. Health post if not improving in 4h. No sugary drinks."],
      ["School route safety", "No wading through floods. Use safe routes school sends. Keep home if unsafe — attendance adjusted."],
      ["Food at home", "Cook all veg + proteins thoroughly. Wash fruit in boiled water before peeling. Iron-rich evenings."]
    ],
    sms: [
      { title: "Bednet check · tonight", body: "First rains start tomorrow. Hang the ITN bednet over every child's bed tonight. Tuck under mattress.", ts: "Sun · 19:10 · TW" },
      { title: "🚨 Cholera alert · 5 km", body: "Cholera case near your school. ALL water must be boiled or sachet. Wash hands at the gate.", ts: "Mon · 06:30" },
      { title: "Fever ≠ wait", body: "If your child has fever + headache + chills today — go to health post for malaria test. Don't wait.", ts: "Wed · 14:22" },
      { title: "Flood route update", body: "The Mamprobi gutter is overflowing. Use Adabraka route this morning. Reply FLOOD for updates.", ts: "Thu · 06:15" }
    ],
    triggers: [
      ["Cholera case within 5 km", "WASH alert: enhanced handwashing, water source check, ORS station activation. Parent SMS."],
      ["GHS · district malaria alert HIGH", "School: malaria checklist. Parents: bednet + symptom recognition. CHW: bednet check visits."],
      ["Rainfall > 50 mm in 24h", "School: flood safety protocol. Parents: safe route SMS. Attendance flagged 48h."],
      ["3+ diarrhoea cases in 48h", "District officer escalation. School: cholera outbreak response. Water tested."],
      ["Pupil absent 2+ days with fever", "CHW home visit. Parent: malaria test reminder. Second alert if no health visit in 24h."]
    ]
  },

  secondrains: {
    title: "Second rains & harvest",
    months: "August — October",
    alert: "Continued malaria transmission coincides with cooler, wetter conditions and respiratory infections. Waterborne disease persists from August flooding. Also Ghana's harvest season — a strategic window for school feeding to source nutritious local foods affordably.",
    hydroLevel: "MODERATE", hydroPct: 45,
    fluid: "1.5 L",
    schoolLevel: "RESPIRATORY + WASH",
    schoolLevelSub: "ARI tracking + handwashing",
    drugStock: "Antifungal · iron",
    drugStockSub: "post-malaria recovery",
    risks: [
      ["Continued malaria transmission", "Second rains extend malaria into October. Children who survived first rains may still have suppressed immunity."],
      ["Respiratory infections (return)", "Cooler, damper conditions bring back colds, flu, pneumonia. Absenteeism spikes Sep–Oct."],
      ["Waterborne disease persistence", "August flooding continues to contaminate water sources. Cholera + typhoid still elevated."],
      ["Post-flood malnutrition", "Families whose farms or stores were destroyed face food insecurity. Children at heightened risk."],
      ["Skin & wound infections", "Wet conditions promote ringworm, athlete's foot, infected wounds. Leptospirosis and tetanus risk."],
      ["Mental health & disruption", "Repeated flooding raises anxiety in children. Difficulty concentrating + aggression are early signs."]
    ],
    foods: [
      ["Groundnuts (fresh harvest)", "Niacin, folate, protein rebuild immunity after malaria. Zinc supports wound healing.", "Aug — Oct · cheapest"],
      ["Fresh maize / corn porridge", "Major harvest staple. Fortified with groundnut paste = high protein. Soothes respiratory.", "harvest season"],
      ["Tomatoes & garden eggs", "Lycopene + vitamins C/A boost post-malaria immunity. Locally abundant at lowest price.", "extremely affordable"],
      ["Smoked & dried fish", "Omega-3 reduces respiratory inflammation. Iron for malaria anaemia. Shelf-stable.", "year-round"],
      ["Fermented porridge (koko / ogi)", "Probiotics support gut compromised by waterborne illness and antibiotics.", "traditional staple"],
      ["Orange-fleshed sweet potato", "Beta-carotene addresses vitamin A depletion from malaria. School-garden ready.", "harvest season"]
    ],
    avoid: [
      ["Raw freshwater fish from flood rivers", "Cholera and parasite risk. Cook thoroughly."],
      ["Stored grain showing mould", "Aflatoxin is a serious liver toxin. Discard mould, smell, discolouration — do not wash and reuse."],
      ["Sugary commercial corn drinks", "High sugar replacing real harvest nutrition. Use plain boiled water + lemon, or sobolo."]
    ],
    bestSources: ["Boiled water", "Warm herbal teas (ginger, lemon)", "Soups & broths", "Citrus juice in boiled water · sobolo"],
    ors: "Maintain 50+ ORS sachets at sick bay. Same WASH protocols as first rains continue through October. Any child with diarrhoea → ORS immediately.",
    school: [
      ["Handwashing — maintain first-rains standard", "Do not reduce in August. Min 5 stations. August flooding requires same vigilance."],
      ["Respiratory infection control", "Adequate ventilation without cold draft. Lidded tissue bins. Cough into elbows."],
      ["Skin & wound station at sick bay", "Antifungal cream, antiseptic, bandages. Train nurse on ringworm + infected cuts. Free treatment."],
      ["Flood damage & safety check", "Inspect classrooms after each rainfall. Black mould triggers severe respiratory reactions."],
      ["Harvest school garden", "Partner with district agriculture extension — sweet potato, tomatoes, leafy greens for November."],
      ["Mental health check", "Weekly classroom check: feeling sad, scared, bad dreams. Refer ongoing distress to counsellor or CHW."]
    ],
    chw: [
      ["Post-malaria anaemia screening", "Hb screening for all school-age children treated in first rains. Hb < 8 g/dL → iron + counselling."],
      ["Respiratory illness tracking", "Weekly ARI tally from August. Alert district if > 15% of pupils at a school in one week."],
      ["Continued water source testing", "Monthly through October. Coliform positive → school notification + sachet water."],
      ["Post-flood food security assessment", "Identify households that lost crops/stores. Coordinate emergency food. Severe malnutrition → therapeutic feeding."],
      ["Immunisation catch-up", "Identify children who missed immunisations due to flooding. Catch-up day at school in September."]
    ],
    parent: [
      ["Water safety — through October", "Don't stop boiling in August. Contamination takes weeks to clear. Sachet or boiled until November."],
      ["Malaria — do not stop", "Bednets every night through October. Anaemia from previous malaria raises vulnerability."],
      ["Harvest nutrition", "Cheapest fresh-food season. Groundnuts, sweet potato, tomatoes, leafy greens at lowest annual prices."],
      ["Respiratory illness care", "Cough + fever + difficulty breathing → care within 24h. Pneumonia can develop in 48–72h."],
      ["Skin care", "Keep feet dry. Dry between toes after rain. Wound with redness, swelling, pus → health post."],
      ["Emotional wellbeing", "Talk to children about flooding. Reassure them. Nightmares, school refusal, aggression → teacher or nurse."]
    ],
    sms: [
      { title: "Harvest week · cheap nutrition", body: "Groundnuts, sweet potato, kontomire at peak harvest prices. Build dinner around them.", ts: "Mon · 17:50 · TW" },
      { title: "Bednet · do not stop", body: "Malaria still here. Hang the bednet every night through October — even if rains feel lighter.", ts: "Tue · 06:20" },
      { title: "Cough watch", body: "Schools seeing more coughs. Cough + fever + breathing trouble → health post within 24 hours.", ts: "Wed · 12:05" },
      { title: "After the flood", body: "Boiled water continues. Wash fruit in boiled water. Discard food that smells off or shows mould.", ts: "Fri · 18:00" }
    ],
    triggers: [
      ["Post-flood food insecurity report", "Feeding alert: emergency supplementary feeding activation. Parents: harvest nutrition + market links."],
      ["ARI > 15% of pupils in one week", "District officer alert. School: respiratory control checklist. Parents: home management."],
      ["Cholera or water contamination alert", "Same as first rains: WASH enhancement, ORS check, parent SMS, district escalation."],
      ["School garden trigger · Sep 1", "Feeding coordinator: planting reminder + agriculture extension contact. Parent garden committee."],
      ["Persistent sadness / school refusal flag", "CHW wellbeing visit. School counsellor alert. Parent: community mental health resource."]
    ]
  }
};

export const seasonOrder = ["harmattan", "dryheat", "firstrains", "secondrains"];
