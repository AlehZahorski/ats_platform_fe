/**
 * Master list of ~172 job categories ("specializations") grouped under
 * 26 high-level groups. The `code` is a stable machine identifier used in
 * DB and API; labels are localized via i18n (`jobs.categories.{code}`).
 *
 * Per-category overrides drive conditional UI in the Job Wizard:
 *   - work_modes      → which work-mode chips render
 *   - seniority_set   → which seniority chips render (or hide entirely)
 *   - shows_shift     → whether the shift-system selector appears
 *   - shows_tech_stack→ whether the "tech stack" field renders
 *   - qualifications  → checkboxes for required quals/certifications
 *
 * Adding a new locale = add a translation file. Adding a new specialization =
 * add a row here + i18n labels. No backend change needed for new categories.
 */
import type { GroupCode } from "./category-groups";

export type WorkMode = "office" | "hybrid" | "remote" | "mobile" | "field";
export type SeniorityKey =
  // IT / corporate ladder
  | "intern" | "junior" | "mid" | "senior" | "expert" | "lead"
  // Corporate/business
  | "specialist" | "senior_specialist" | "coordinator" | "manager" | "director" | "executive"
  // Production / trades
  | "operator" | "team_leader" | "foreman" | "production_manager"
  // Healthcare ranks
  | "resident" | "attending" | "consultant" | "head_of_department"
  // Education ranks (academic)
  | "assistant" | "lecturer" | "professor"
  // Polish school-teacher promotion grades (stopnie awansu zawodowego)
  | "teacher_trainee" | "teacher_appointed" | "teacher_chartered"
  // Generic physical labor (no rank)
  | "helper" | "worker";

export type QualificationCode =
  | "forklift_udt" | "sep_g1" | "sep_g2" | "sep_g3" | "health_card" | "haccp"
  | "driving_b" | "driving_c" | "driving_ce" | "driving_d" | "driving_motorcycle"
  | "construction_license" | "bhp" | "first_aid" | "security_license"
  | "medical_license" | "pharmacy_license" | "vet_license"
  | "teaching_credential" | "language_cert" | "aws_cert" | "azure_cert"
  | "gcp_cert" | "cissp" | "pmp" | "scrum_cert";

export interface CategoryDef {
  code: string;
  group: GroupCode;
  work_modes: WorkMode[];
  seniority_set: SeniorityKey[];      // empty array = hide seniority chips entirely
  seniority_label?: string;           // overrides the default "Poziom stanowiska" field label
  shows_shift: boolean;
  shows_tech_stack: boolean;
  qualifications: QualificationCode[];
}

const ALL_MODES: WorkMode[] = ["office", "hybrid", "remote"];
const ON_SITE_ONLY: WorkMode[] = ["office"];
const FIELD_MODES: WorkMode[] = ["mobile", "field", "office"];

const IT_LADDER: SeniorityKey[] = ["intern", "junior", "mid", "senior", "expert", "lead"];
const CORP_LADDER: SeniorityKey[] = ["specialist", "senior_specialist", "coordinator", "manager", "director"];
const PRODUCTION_LADDER: SeniorityKey[] = ["operator", "team_leader", "foreman", "production_manager"];
const PHYSICAL_LADDER: SeniorityKey[] = ["helper", "worker", "team_leader", "foreman"];
const HEALTHCARE_LADDER: SeniorityKey[] = ["resident", "attending", "consultant", "head_of_department"];
const EDU_LADDER: SeniorityKey[] = ["assistant", "lecturer", "professor"];
// School teachers in Poland advance through the official promotion ladder
// (stopnie awansu zawodowego), not a corporate junior→lead one.
const TEACHER_LADDER: SeniorityKey[] = ["teacher_trainee", "teacher_appointed", "teacher_chartered"];
const NO_LADDER: SeniorityKey[] = [];

// ────────────────────────────────────────────────────────────────────────
// IT (22)
// ────────────────────────────────────────────────────────────────────────
const tech: CategoryDef[] = [
  ["it_backend", IT_LADDER, true, "aws_cert"],
  ["it_frontend", IT_LADDER, true, null],
  ["it_fullstack", IT_LADDER, true, null],
  ["it_mobile", IT_LADDER, true, null],
  ["it_embedded", IT_LADDER, true, null],
  ["it_gamedev", IT_LADDER, true, null],
  ["it_devops", IT_LADDER, true, "aws_cert"],
  ["it_cloud_architect", IT_LADDER, true, "aws_cert"],
  ["it_cybersecurity", IT_LADDER, true, "cissp"],
  ["it_data_engineer", IT_LADDER, true, null],
  ["it_data_scientist", IT_LADDER, true, null],
  ["it_bi_analyst", IT_LADDER, true, null],
  ["it_qa_manual", IT_LADDER, true, null],
  ["it_qa_automation", IT_LADDER, true, null],
  ["it_helpdesk", IT_LADDER, false, null],
  ["it_sysadmin", IT_LADDER, false, null],
  ["it_network", IT_LADDER, false, null],
  ["it_dba", IT_LADDER, false, null],
  ["it_tech_pm", IT_LADDER, false, "pmp"],
  ["it_scrum_master", IT_LADDER, false, "scrum_cert"],
  ["it_technical_writer", IT_LADDER, false, null],
  ["it_solutions_architect", IT_LADDER, true, "aws_cert"],
].map(
  ([code, ladder, stack, qual]) =>
    ({
      code: code as string,
      group: "tech" as GroupCode,
      work_modes: ALL_MODES,
      seniority_set: ladder as SeniorityKey[],
      shows_shift: false,
      shows_tech_stack: stack as boolean,
      qualifications: qual ? [qual as QualificationCode] : [],
    }) satisfies CategoryDef,
);

// ────────────────────────────────────────────────────────────────────────
// Design (10)
// ────────────────────────────────────────────────────────────────────────
const design: CategoryDef[] = [
  "design_uxui", "design_product", "design_graphic", "design_industrial",
  "design_motion", "design_video_editing", "design_3d_vfx", "design_game",
  "design_brand", "design_illustration",
].map((code) => ({
  code, group: "design", work_modes: ALL_MODES, seniority_set: IT_LADDER,
  shows_shift: false, shows_tech_stack: false, qualifications: [],
}));

// ────────────────────────────────────────────────────────────────────────
// Marketing & PR (14)
// ────────────────────────────────────────────────────────────────────────
const marketing: CategoryDef[] = [
  "marketing_manager", "marketing_digital", "marketing_content", "marketing_seo_sem",
  "marketing_social_media", "marketing_performance", "marketing_ecommerce_mgr",
  "marketing_growth", "marketing_pr", "marketing_copywriting", "marketing_brand",
  "marketing_event", "marketing_email", "marketing_influencer",
].map((code) => ({
  code, group: "marketing", work_modes: ALL_MODES, seniority_set: CORP_LADDER,
  shows_shift: false, shows_tech_stack: false, qualifications: [],
}));

// ────────────────────────────────────────────────────────────────────────
// Sales & BizDev (12)
// ────────────────────────────────────────────────────────────────────────
const sales: CategoryDef[] = [
  "sales_manager", "sales_account_executive", "sales_account_manager", "sales_sdr",
  "sales_bizdev", "sales_inside", "sales_field", "sales_retail",
  "sales_engineer", "sales_channel", "sales_presales", "sales_telesales",
].map((code) => ({
  code, group: "sales",
  work_modes: code.includes("field") || code.includes("channel") ? FIELD_MODES : ALL_MODES,
  seniority_set: CORP_LADDER,
  shows_shift: false, shows_tech_stack: false,
  qualifications: code === "sales_field" ? ["driving_b"] : [],
}));

// ────────────────────────────────────────────────────────────────────────
// Customer Service (6)
// ────────────────────────────────────────────────────────────────────────
const customerService: CategoryDef[] = [
  "cs_rep", "cs_customer_success", "cs_call_center", "cs_tech_support",
  "cs_receptionist", "cs_concierge",
].map((code) => ({
  code, group: "customer_service",
  work_modes: code === "cs_receptionist" || code === "cs_concierge" ? ON_SITE_ONLY : ALL_MODES,
  seniority_set: CORP_LADDER,
  shows_shift: code !== "cs_customer_success",
  shows_tech_stack: false, qualifications: [],
}));

// ────────────────────────────────────────────────────────────────────────
// Finance & Accounting (16)
// ────────────────────────────────────────────────────────────────────────
const finance: CategoryDef[] = [
  "fin_accountant", "fin_analyst", "fin_controller", "fin_cfo",
  "fin_tax", "fin_audit", "fin_treasury",
  "fin_banking_retail", "fin_banking_investment", "fin_banking_corporate",
  "fin_insurance_agent", "fin_underwriter", "fin_actuary",
  "fin_risk", "fin_aml_compliance", "fin_debt_collection", "fin_payroll",
].map((code) => ({
  code, group: "finance", work_modes: ALL_MODES,
  seniority_set: code === "fin_cfo" ? ["director", "executive"] as SeniorityKey[] : CORP_LADDER,
  shows_shift: false, shows_tech_stack: false, qualifications: [],
}));

// ────────────────────────────────────────────────────────────────────────
// HR (8)
// ────────────────────────────────────────────────────────────────────────
const hr: CategoryDef[] = [
  "hr_generalist", "hr_recruiter", "hr_manager", "hr_compben",
  "hr_learning_dev", "hr_employer_branding", "hr_hris", "hr_payroll_admin",
].map((code) => ({
  code, group: "hr", work_modes: ALL_MODES, seniority_set: CORP_LADDER,
  shows_shift: false, shows_tech_stack: false, qualifications: [],
}));

// ────────────────────────────────────────────────────────────────────────
// Legal (8)
// ────────────────────────────────────────────────────────────────────────
const legal: CategoryDef[] = [
  "legal_lawyer", "legal_paralegal", "legal_in_house_counsel", "legal_contract",
  "legal_notary", "legal_compliance", "legal_ip_patent", "legal_tax_lawyer",
].map((code) => ({
  code, group: "legal", work_modes: ALL_MODES, seniority_set: CORP_LADDER,
  shows_shift: false, shows_tech_stack: false, qualifications: [],
}));

// ────────────────────────────────────────────────────────────────────────
// Operations & PM (10)
// ────────────────────────────────────────────────────────────────────────
const operations: CategoryDef[] = [
  "ops_manager", "ops_project_manager", "ops_program_manager", "ops_business_analyst",
  "ops_process_engineer", "ops_lean_sixsigma", "ops_procurement", "ops_buyer",
  "ops_category_manager", "ops_vendor_mgmt",
].map((code) => ({
  code, group: "operations", work_modes: ALL_MODES, seniority_set: CORP_LADDER,
  shows_shift: false, shows_tech_stack: false,
  qualifications: code === "ops_project_manager" ? ["pmp"] : [],
}));

// ────────────────────────────────────────────────────────────────────────
// Logistics & Transport (11)
// ────────────────────────────────────────────────────────────────────────
const logistics: CategoryDef[] = [
  { code: "log_coordinator", office: true, quals: [] },
  { code: "log_freight_forwarder", office: true, quals: [] },
  { code: "log_warehouse_manager", office: false, quals: ["forklift_udt"] },
  { code: "log_warehouse_op", office: false, quals: ["forklift_udt", "health_card"] },
  { code: "log_inventory", office: false, quals: [] },
  { code: "log_driver_heavy", office: false, quals: ["driving_ce", "driving_c"] },
  { code: "log_driver_light", office: false, quals: ["driving_b"] },
  { code: "log_driver_bus", office: false, quals: ["driving_d"] },
  { code: "log_courier", office: false, quals: ["driving_b"] },
  { code: "log_train_operator", office: false, quals: [] },
  { code: "log_customs", office: true, quals: [] },
].map(({ code, office, quals }) => ({
  code, group: "logistics" as GroupCode,
  work_modes: office ? ALL_MODES : ON_SITE_ONLY,
  seniority_set: code.includes("manager") || code === "log_coordinator" ? CORP_LADDER : PHYSICAL_LADDER,
  shows_shift: !office,
  shows_tech_stack: false,
  qualifications: quals as QualificationCode[],
}));

// ────────────────────────────────────────────────────────────────────────
// Manufacturing & Production (13)
// ────────────────────────────────────────────────────────────────────────
const manufacturing: CategoryDef[] = [
  "mfg_operator", "mfg_team_leader", "mfg_manager", "mfg_cnc_operator",
  "mfg_welder", "mfg_machine_operator", "mfg_assembly", "mfg_plant_manager",
  "mfg_maintenance", "mfg_industrial_mechanic", "mfg_industrial_electrician",
  "mfg_tool_mold_maker", "mfg_painter",
].map((code) => ({
  code, group: "manufacturing", work_modes: ON_SITE_ONLY,
  seniority_set: code === "mfg_plant_manager" || code === "mfg_manager"
    ? ["manager", "director"] as SeniorityKey[]
    : PRODUCTION_LADDER,
  shows_shift: true, shows_tech_stack: false,
  qualifications: code === "mfg_industrial_electrician"
    ? ["sep_g1", "sep_g2"]
    : code === "mfg_operator" || code === "mfg_machine_operator"
      ? ["forklift_udt", "health_card"]
      : code === "mfg_welder"
        ? ["bhp"]
        : [],
}));

// ────────────────────────────────────────────────────────────────────────
// Construction & Trades (14)
// ────────────────────────────────────────────────────────────────────────
const construction: CategoryDef[] = [
  "con_worker", "con_foreman", "con_manager", "con_carpenter",
  "con_electrician", "con_plumber", "con_hvac", "con_mason",
  "con_roofer", "con_tiler", "con_concrete", "con_glazier",
  "con_surveyor", "con_architect_assistant",
].map((code) => ({
  code, group: "construction", work_modes: ON_SITE_ONLY,
  seniority_set: code === "con_manager" ? ["manager", "director"] as SeniorityKey[] : PHYSICAL_LADDER,
  shows_shift: false, shows_tech_stack: false,
  qualifications: code === "con_electrician" ? ["sep_g1", "construction_license"]
    : code === "con_foreman" || code === "con_manager" ? ["construction_license", "bhp"]
    : ["bhp"],
}));

// ────────────────────────────────────────────────────────────────────────
// Engineering non-IT (13)
// ────────────────────────────────────────────────────────────────────────
const engineering: CategoryDef[] = [
  "eng_mechanical", "eng_electrical", "eng_civil", "eng_chemical",
  "eng_environmental", "eng_automation_robotics", "eng_industrial",
  "eng_aerospace", "eng_mining", "eng_telco", "eng_energy",
  "eng_marine", "eng_quality",
].map((code) => ({
  code, group: "engineering",
  work_modes: code === "eng_mining" || code === "eng_marine" ? ON_SITE_ONLY : ["office", "hybrid"],
  seniority_set: CORP_LADDER,
  shows_shift: false, shows_tech_stack: false, qualifications: [],
}));

// ────────────────────────────────────────────────────────────────────────
// Healthcare (24)
// ────────────────────────────────────────────────────────────────────────
const healthcare: CategoryDef[] = [
  "hc_physician_gp", "hc_physician_specialist", "hc_surgeon",
  "hc_nurse_registered", "hc_nurse_practical", "hc_paramedic",
  "hc_physiotherapist", "hc_occupational_therapist", "hc_speech_therapist",
  "hc_dentist", "hc_dental_hygienist", "hc_pharmacist", "hc_pharmacy_tech",
  "hc_psychologist", "hc_psychotherapist", "hc_psychiatrist",
  "hc_caregiver", "hc_veterinarian", "hc_vet_technician",
  "hc_dietitian", "hc_lab_technician", "hc_xray_technician",
  "hc_optometrist", "hc_midwife",
].map((code) => ({
  code, group: "healthcare", work_modes: ON_SITE_ONLY,
  seniority_set: code.startsWith("hc_physician") || code === "hc_surgeon" || code === "hc_psychiatrist"
    ? HEALTHCARE_LADDER
    : CORP_LADDER,
  shows_shift: true, shows_tech_stack: false,
  qualifications: code.startsWith("hc_physician") || code === "hc_surgeon" || code === "hc_psychiatrist"
    ? ["medical_license"]
    : code === "hc_pharmacist" ? ["pharmacy_license"]
    : code === "hc_veterinarian" ? ["vet_license"]
    : ["first_aid"],
}));

// ────────────────────────────────────────────────────────────────────────
// Education (14)
// ────────────────────────────────────────────────────────────────────────
// Three distinct experience ladders within Education:
//   • school teachers → Polish promotion grades (stopnie awansu zawodowego)
//   • academic staff  → academic ranks (asystent → wykładowca → profesor)
//   • everyone else (trainers, tutors, nanny, librarian) → generic experience
const SCHOOL_TEACHERS = new Set([
  "edu_preschool_teacher", "edu_primary_teacher", "edu_secondary_teacher",
  "edu_sped_teacher", "edu_music_teacher", "edu_school_counselor",
]);
const ACADEMIC_STAFF = new Set(["edu_university_lecturer", "edu_professor_researcher"]);

const education: CategoryDef[] = [
  "edu_preschool_teacher", "edu_primary_teacher", "edu_secondary_teacher",
  "edu_sped_teacher", "edu_university_lecturer", "edu_professor_researcher",
  "edu_vocational_trainer", "edu_language_tutor", "edu_music_teacher",
  "edu_sports_coach", "edu_private_tutor", "edu_school_counselor",
  "edu_childcare_nanny", "edu_librarian",
].map((code) => ({
  code, group: "education", work_modes: ON_SITE_ONLY,
  seniority_set: SCHOOL_TEACHERS.has(code) ? TEACHER_LADDER
    : ACADEMIC_STAFF.has(code) ? EDU_LADDER
    : NO_LADDER,
  seniority_label: SCHOOL_TEACHERS.has(code) ? "Stopień awansu zawodowego"
    : ACADEMIC_STAFF.has(code) ? "Stopień / tytuł naukowy"
    : undefined,
  shows_shift: false, shows_tech_stack: false,
  qualifications: code.includes("teacher") || code.includes("lecturer") || code.includes("professor")
    ? ["teaching_credential"]
    : code === "edu_language_tutor" ? ["language_cert"]
    : [],
}));

// ────────────────────────────────────────────────────────────────────────
// Hospitality, Food & Tourism (14)
// ────────────────────────────────────────────────────────────────────────
const hospitality: CategoryDef[] = [
  "hsp_chef", "hsp_cook", "hsp_sous_chef", "hsp_pastry_chef", "hsp_baker",
  "hsp_waiter", "hsp_bartender", "hsp_barista", "hsp_hotel_receptionist",
  "hsp_hotel_manager", "hsp_housekeeping", "hsp_tour_guide",
  "hsp_travel_agent", "hsp_restaurant_manager",
].map((code) => ({
  code, group: "hospitality", work_modes: ON_SITE_ONLY,
  seniority_set: code.includes("manager") || code === "hsp_chef" ? CORP_LADDER : NO_LADDER,
  shows_shift: true, shows_tech_stack: false,
  qualifications: code === "hsp_chef" || code === "hsp_cook" || code === "hsp_sous_chef" ||
                 code === "hsp_pastry_chef" || code === "hsp_baker" || code === "hsp_waiter" ||
                 code === "hsp_bartender" || code === "hsp_barista" || code === "hsp_housekeeping"
    ? ["health_card", "haccp"] : [],
}));

// ────────────────────────────────────────────────────────────────────────
// Retail (8)
// ────────────────────────────────────────────────────────────────────────
const retail: CategoryDef[] = [
  "ret_cashier", "ret_sales_associate", "ret_store_manager", "ret_visual_merchandiser",
  "ret_buyer_merchandiser", "ret_stockroom", "ret_florist", "ret_pharmacy_counter",
].map((code) => ({
  code, group: "retail", work_modes: ON_SITE_ONLY,
  seniority_set: code === "ret_store_manager" ? CORP_LADDER : NO_LADDER,
  shows_shift: true, shows_tech_stack: false,
  qualifications: code === "ret_pharmacy_counter" ? ["pharmacy_license"] : [],
}));

// ────────────────────────────────────────────────────────────────────────
// Beauty & Wellness (9)
// ────────────────────────────────────────────────────────────────────────
const beauty: CategoryDef[] = [
  "bty_hairdresser", "bty_beautician", "bty_nail_technician", "bty_makeup_artist",
  "bty_massage_therapist", "bty_tattoo_artist", "bty_spa_therapist",
  "bty_personal_trainer", "bty_yoga_instructor",
].map((code) => ({
  code, group: "beauty", work_modes: ON_SITE_ONLY,
  seniority_set: NO_LADDER, shows_shift: false, shows_tech_stack: false,
  qualifications: ["health_card"],
}));

// ────────────────────────────────────────────────────────────────────────
// Cleaning & Property (10)
// ────────────────────────────────────────────────────────────────────────
const cleaning: CategoryDef[] = [
  "cln_residential_cleaner", "cln_commercial_cleaner", "cln_janitor", "cln_window_cleaner",
  "cln_property_manager", "cln_building_super", "cln_gardener", "cln_landscaper",
  "cln_pest_control", "cln_real_estate_agent",
].map((code) => ({
  code, group: "cleaning",
  work_modes: code === "cln_real_estate_agent" || code === "cln_property_manager" ? FIELD_MODES : ON_SITE_ONLY,
  seniority_set: code === "cln_property_manager" || code === "cln_real_estate_agent" ? CORP_LADDER : NO_LADDER,
  shows_shift: false, shows_tech_stack: false,
  qualifications: code === "cln_real_estate_agent" ? ["driving_b"] : [],
}));

// ────────────────────────────────────────────────────────────────────────
// Security & Defense (8)
// ────────────────────────────────────────────────────────────────────────
const security: CategoryDef[] = [
  "sec_security_guard", "sec_bodyguard", "sec_cash_in_transit", "sec_private_investigator",
  "sec_police", "sec_firefighter", "sec_military", "sec_customs_officer",
].map((code) => ({
  code, group: "security", work_modes: ON_SITE_ONLY,
  seniority_set: NO_LADDER, shows_shift: true, shows_tech_stack: false,
  qualifications: ["security_license", "first_aid"],
}));

// ────────────────────────────────────────────────────────────────────────
// Media, Arts & Entertainment (17)
// ────────────────────────────────────────────────────────────────────────
const media: CategoryDef[] = [
  "med_journalist", "med_editor", "med_photographer", "med_videographer",
  "med_sound_engineer", "med_music_producer", "med_musician", "med_actor",
  "med_voice_actor", "med_radio_host", "med_film_production", "med_author",
  "med_translator", "med_interpreter", "med_localization",
  "med_curator", "med_art_director",
].map((code) => ({
  code, group: "media",
  work_modes: ["office", "hybrid", "remote"],
  seniority_set: code === "med_art_director" ? CORP_LADDER : NO_LADDER,
  shows_shift: false, shows_tech_stack: false,
  qualifications: code === "med_translator" || code === "med_interpreter" ? ["language_cert"] : [],
}));

// ────────────────────────────────────────────────────────────────────────
// Science & Research (9)
// ────────────────────────────────────────────────────────────────────────
const science: CategoryDef[] = [
  "sci_research_scientist", "sci_lab_technician", "sci_biologist", "sci_chemist",
  "sci_physicist", "sci_geologist", "sci_statistician", "sci_mathematician",
  "sci_social_scientist",
].map((code) => ({
  code, group: "science", work_modes: ["office", "hybrid"],
  seniority_set: EDU_LADDER, shows_shift: false, shows_tech_stack: false, qualifications: [],
}));

// ────────────────────────────────────────────────────────────────────────
// Agriculture, Forestry & Fishing (9)
// ────────────────────────────────────────────────────────────────────────
const agriculture: CategoryDef[] = [
  "agr_farm_worker", "agr_farm_manager", "agr_agronomist", "agr_beekeeper",
  "agr_forestry", "agr_lumberjack", "agr_fisherman", "agr_aquaculture",
  "agr_horticulturist",
].map((code) => ({
  code, group: "agriculture", work_modes: ON_SITE_ONLY,
  seniority_set: code === "agr_farm_manager" ? CORP_LADDER : NO_LADDER,
  shows_shift: false, shows_tech_stack: false,
  qualifications: code.includes("forestry") || code === "agr_lumberjack" ? ["driving_b", "bhp"] : [],
}));

// ────────────────────────────────────────────────────────────────────────
// Automotive (7)
// ────────────────────────────────────────────────────────────────────────
const automotive: CategoryDef[] = [
  "auto_mechanic", "auto_electrician", "auto_body_repair", "auto_painter",
  "auto_service_advisor", "auto_inspector", "auto_tire_tech",
].map((code) => ({
  code, group: "automotive", work_modes: ON_SITE_ONLY,
  seniority_set: PHYSICAL_LADDER, shows_shift: false, shows_tech_stack: false,
  qualifications: code === "auto_electrician" ? ["sep_g1"] : ["bhp"],
}));

// ────────────────────────────────────────────────────────────────────────
// Energy & Utilities (8)
// ────────────────────────────────────────────────────────────────────────
const energy: CategoryDef[] = [
  "enr_power_plant_op", "enr_linesman", "enr_gas_technician", "enr_water_treatment",
  "enr_solar_installer", "enr_wind_turbine_tech", "enr_mining_worker", "enr_oil_gas",
].map((code) => ({
  code, group: "energy", work_modes: ON_SITE_ONLY,
  seniority_set: PHYSICAL_LADDER, shows_shift: true, shows_tech_stack: false,
  qualifications: code === "enr_linesman" || code === "enr_power_plant_op"
    ? ["sep_g1", "sep_g2", "sep_g3"] : ["bhp"],
}));

// ────────────────────────────────────────────────────────────────────────
// Government & Public Service (6)
// ────────────────────────────────────────────────────────────────────────
const government: CategoryDef[] = [
  "gov_public_admin", "gov_municipal_worker", "gov_civil_servant",
  "gov_postal_worker", "gov_diplomat", "gov_tax_officer",
].map((code) => ({
  code, group: "government", work_modes: ALL_MODES,
  seniority_set: CORP_LADDER, shows_shift: false, shows_tech_stack: false, qualifications: [],
}));

// ────────────────────────────────────────────────────────────────────────
// Master list
// ────────────────────────────────────────────────────────────────────────
export const CATEGORIES: CategoryDef[] = [
  ...tech, ...design, ...marketing, ...sales, ...customerService,
  ...finance, ...hr, ...legal, ...operations, ...logistics, ...manufacturing,
  ...construction, ...engineering, ...healthcare, ...education,
  ...hospitality, ...retail, ...beauty, ...cleaning, ...security,
  ...media, ...science, ...agriculture, ...automotive, ...energy, ...government,
];

export const CATEGORY_MAP: Record<string, CategoryDef> = CATEGORIES.reduce(
  (acc, c) => { acc[c.code] = c; return acc; },
  {} as Record<string, CategoryDef>,
);

export function categoriesByGroup(group: GroupCode): CategoryDef[] {
  return CATEGORIES.filter((c) => c.group === group);
}

export function getCategoryConfig(code: string | null | undefined): CategoryDef | null {
  if (!code) return null;
  return CATEGORY_MAP[code] ?? null;
}
