import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   1. DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const C = {
  bg: "#F5F4F1", surface: "#FFFFFF", border: "#E4E0D8",
  text: "#18160F", muted: "#6E6A60", faint: "#ABA69B",
  accent: "#1C3F2F", accentL: "#D6F0E4", accentM: "#059669",
  warn: "#92400E", warnL: "#FEF3C7", warnM: "#D97706",
  danger: "#7F1D1D", dangerL: "#FEE2E2", dangerM: "#DC2626",
  info: "#1E3A5F", infoL: "#DBEAFE", infoM: "#3B82F6",
  gold: "#B45309", goldL: "#FDE68A",
};

/* ═══════════════════════════════════════════════════════════
   2. COUNTRY RISK MATRIX — GENIŞLETILMIŞ (40 ülke)
   Source: ILO NORMLEX, WorldBank WGI, ITUC GRI, GSI, TI CPI
   Scale: 0 = Highest Risk · 100 = Lowest Risk
═══════════════════════════════════════════════════════════ */
const COUNTRY_RISK = {
  // === WESTEUROPA (95-90) ===
  DE:{base:95,labor:96,env:94,land:97,security:96,name:"Deutschland"},
  CH:{base:94,labor:95,env:95,land:96,security:95,name:"Schweiz"},
  AT:{base:93,labor:94,env:93,land:95,security:94,name:"Österreich"},
  NL:{base:94,labor:94,env:93,land:96,security:95,name:"Niederlande"},
  SE:{base:95,labor:96,env:95,land:97,security:95,name:"Schweden"},
  DK:{base:95,labor:95,env:95,land:97,security:96,name:"Dänemark"},
  NO:{base:95,labor:95,env:96,land:97,security:96,name:"Norwegen"},
  FR:{base:88,labor:88,env:87,land:90,security:86,name:"Frankreich"},
  GB:{base:89,labor:89,env:88,land:91,security:87,name:"Vereinigtes Königreich"},
  IT:{base:83,labor:82,env:81,land:85,security:82,name:"Italien"},
  ES:{base:84,labor:83,env:82,land:86,security:83,name:"Spanien"},
  PT:{base:86,labor:85,env:84,land:88,security:86,name:"Portugal"},
  // === OSTEUROPA (85-75) ===
  PL:{base:81,labor:80,env:78,land:83,security:82,name:"Polen"},
  CZ:{base:83,labor:82,env:80,land:85,security:84,name:"Tschechien"},
  RO:{base:72,labor:70,env:68,land:74,security:72,name:"Rumänien"},
  HU:{base:74,labor:72,env:70,land:76,security:73,name:"Ungarn"},
  BG:{base:70,labor:68,env:66,land:72,security:70,name:"Bulgarien"},
  RS:{base:64,labor:61,env:60,land:66,security:63,name:"Serbien"},
  // === NORDAFRIKA / TÜRKEI / NAHOST ===
  MA:{base:61,labor:58,env:55,land:60,security:62,name:"Marokko"},
  TR:{base:51,labor:45,env:50,land:52,security:49,name:"Türkei"},
  EG:{base:44,labor:40,env:38,land:42,security:44,name:"Ägypten"},
  TN:{base:59,labor:55,env:53,land:58,security:58,name:"Tunesien"},
  JO:{base:57,labor:53,env:52,land:56,security:56,name:"Jordanien"},
  SA:{base:48,labor:36,env:45,land:50,security:46,name:"Saudi-Arabien"},
  AE:{base:62,labor:50,env:58,land:64,security:62,name:"Vereinigte Arabische Emirate"},
  // === SUBSAHARA-AFRIKA ===
  ZA:{base:55,labor:52,env:50,land:48,security:52,name:"Südafrika"},
  KE:{base:45,labor:42,env:40,land:38,security:44,name:"Kenia"},
  ET:{base:32,labor:28,env:30,land:25,security:30,name:"Äthiopien"},
  GH:{base:54,labor:50,env:48,land:46,security:52,name:"Ghana"},
  NG:{base:29,labor:26,env:25,land:22,security:28,name:"Nigeria"},
  // === LATEINAMERIKA ===
  BR:{base:54,labor:52,env:48,land:44,security:55,name:"Brasilien"},
  MX:{base:52,labor:48,env:46,land:50,security:50,name:"Mexiko"},
  CO:{base:48,labor:44,env:43,land:40,security:46,name:"Kolumbien"},
  PE:{base:47,labor:43,env:41,land:35,security:45,name:"Peru"},
  AR:{base:58,labor:56,env:54,land:56,security:57,name:"Argentinien"},
  CL:{base:68,labor:65,env:64,land:62,security:67,name:"Chile"},
  // === ASIEN ===
  IN:{base:43,labor:40,env:37,land:38,security:44,name:"Indien"},
  ID:{base:46,labor:44,env:40,land:42,security:47,name:"Indonesien"},
  CN:{base:37,labor:25,env:38,land:40,security:30,name:"China"},
  VN:{base:40,labor:28,env:42,land:44,security:38,name:"Vietnam"},
  TH:{base:52,labor:48,env:50,land:52,security:50,name:"Thailand"},
  MY:{base:58,labor:52,env:55,land:58,security:57,name:"Malaysia"},
  PH:{base:48,labor:45,env:43,land:40,security:46,name:"Philippinen"},
  BD:{base:23,labor:18,env:28,land:30,security:24,name:"Bangladesch"},
  PK:{base:27,labor:22,env:25,land:28,security:26,name:"Pakistan"},
  MM:{base:20,labor:14,env:22,land:18,security:19,name:"Myanmar"},
  KH:{base:33,labor:28,env:32,land:30,security:32,name:"Kambodscha"},
  LK:{base:38,labor:35,env:36,land:32,security:36,name:"Sri Lanka"},
  KR:{base:80,labor:78,env:76,land:82,security:81,name:"Südkorea"},
  JP:{base:90,labor:88,env:89,land:92,security:91,name:"Japan"},
  // === ZENTRALASIEN ===
  UZ:{base:30,labor:25,env:28,land:30,security:29,name:"Usbekistan"},
  KZ:{base:38,labor:33,env:35,land:36,security:36,name:"Kasachstan"},
};

/* ─── Sector Risk Multipliers ─── */
const SECTOR_MOD = {
  "Logistik":              {labor:0.97,env:0.92,land:0.98,security:0.97},
  "Maschinenbauteile":     {labor:0.93,env:0.90,land:0.96,security:0.94},
  "Metallverarbeitung":    {labor:0.91,env:0.88,land:0.95,security:0.92},
  "Stahl & Metall":        {labor:0.89,env:0.83,land:0.92,security:0.90},
  "Agrarrohstoffe":        {labor:0.82,env:0.74,land:0.70,security:0.85},
  "Elektronikkomponenten": {labor:0.80,env:0.84,land:0.93,security:0.88},
  "Elektronikfertigung":   {labor:0.75,env:0.80,land:0.92,security:0.85},
  "Textilherstellung":     {labor:0.68,env:0.76,land:0.90,security:0.82},
  "Bergbau / Rohstoffe":   {labor:0.72,env:0.65,land:0.60,security:0.78},
  "Chemie / Pharma":       {labor:0.85,env:0.70,land:0.92,security:0.86},
  "Kunststoff":            {labor:0.88,env:0.78,land:0.93,security:0.90},
  "Holz / Papier":         {labor:0.80,env:0.72,land:0.65,security:0.82},
  "Leder / Schuhe":        {labor:0.74,env:0.77,land:0.88,security:0.83},
  "Bau & Infrastruktur":   {labor:0.82,env:0.80,land:0.75,security:0.84},
  "IT-Dienstleistungen":   {labor:0.96,env:0.97,land:0.99,security:0.96},
};

/* ─── Certification Bonuses ─── */
const CERT_BONUS = {
  "SA8000":             {labor:9,env:0,land:3,security:2,general:4},
  "ISO 14001":          {labor:0,env:8,land:2,security:0,general:2},
  "ISO 45001":          {labor:8,env:0,land:0,security:2,general:3},
  "SMETA":              {labor:6,env:4,land:3,security:3,general:3},
  "Rainforest Alliance":{labor:3,env:7,land:5,security:0,general:2},
  "Fairtrade":          {labor:5,env:3,land:4,security:0,general:2},
  "ISO 9001":           {labor:1,env:1,land:1,security:1,general:2},
  "BSCI":               {labor:5,env:2,land:2,security:2,general:2},
  "RSPO":               {labor:2,env:8,land:7,security:0,general:2},
  "FSC":                {labor:2,env:7,land:6,security:0,general:2},
};

/* ═══════════════════════════════════════════════════════════
   3. 20 CATEGORIES × 53 SUB-INDICATORS
═══════════════════════════════════════════════════════════ */
const CATEGORIES = [
  {id:1,para:"§2 Abs.2 Nr.1",name:"Kinderarbeit (allgemein)",convention:"ILO C138",domain:"Menschenrechte",weight:9,riskDomain:"labor",subs:[
    {id:"1.1",name:"ILO C138 Mindestaltereinhaltung",source:"ILO NORMLEX Ratifizierungsdaten",type:"country",factor:1.0},
    {id:"1.2",name:"Schulbesuchsquote Herkunftsland (UNESCO)",source:"UNESCO Education Index",type:"country",factor:0.85},
    {id:"1.3",name:"Altersverifikationssystem Lieferant",source:"Fragebogen A.3",type:"questionnaire",key:"ageVerification"},
  ]},
  {id:2,para:"§2 Abs.2 Nr.1b",name:"Schlimmste Formen der Kinderarbeit",convention:"ILO C182",domain:"Menschenrechte",weight:10,riskDomain:"labor",subs:[
    {id:"2.1",name:"ILO C182 Ratifizierung & Umsetzungsgrad",source:"ILO NORMLEX",type:"country",factor:1.0},
    {id:"2.2",name:"Kinderarbeit in gefährl. Sektoren (ILO IPEC)",source:"ILO IPEC Sektordaten",type:"sector",factor:0.9},
    {id:"2.3",name:"Monitoring & Transparenzberichterstattung",source:"Fragebogen A.4",type:"questionnaire",key:"childLaborMonitoring"},
  ]},
  {id:3,para:"§2 Abs.2 Nr.3",name:"Zwangsarbeit",convention:"ILO C29 & C105",domain:"Menschenrechte",weight:10,riskDomain:"labor",subs:[
    {id:"3.1",name:"ILO C29/C105 Umsetzungsgrad",source:"ILO NORMLEX",type:"country",factor:1.0},
    {id:"3.2",name:"Global Slavery Index Score (GSI)",source:"Walk Free Foundation 2023",type:"country",factor:1.0},
    {id:"3.3",name:"Migrantenarbeit-Risikoprofil",source:"ILO Labour Migration",type:"sector",factor:0.85},
    {id:"3.4",name:"Supplier Selbstverpflichtung & Nachweise",source:"Fragebogen B.1",type:"questionnaire",key:"forcedLaborCommitment"},
  ]},
  {id:4,para:"§2 Abs.2 Nr.3b",name:"Sklaverei & sklavereiähnliche Praktiken",convention:"UN Slavery Convention",domain:"Menschenrechte",weight:10,riskDomain:"labor",subs:[
    {id:"4.1",name:"UN Slavery Convention Umsetzung",source:"UN Treaty Collection",type:"country",factor:1.0},
    {id:"4.2",name:"Menschenhandel-Risikoindex (TIP-Report)",source:"US State Dept. TIP Report 2023",type:"country",factor:1.0},
    {id:"4.3",name:"Internes Kontroll- & Meldesystem",source:"Fragebogen B.2",type:"questionnaire",key:"slaveryControl"},
  ]},
  {id:5,para:"§2 Abs.2 Nr.5",name:"Arbeitsschutz & Arbeitssicherheit",convention:"ILO C155",domain:"Menschenrechte",weight:8,riskDomain:"labor",subs:[
    {id:"5.1",name:"ILO C155 Umsetzungsgrad",source:"ILO NORMLEX",type:"country",factor:1.0},
    {id:"5.2",name:"Nationale Arbeitsunfallrate (ILO STAT)",source:"ILO STAT 2023",type:"country",factor:0.9},
    {id:"5.3",name:"ISO 45001 / Sicherheitszertifizierung",source:"Zertifikatsprüfung",type:"certification",certKey:"ISO 45001",domain:"labor"},
    {id:"5.4",name:"Unfallmelde- & Präventionssystem Supplier",source:"Fragebogen C.1",type:"questionnaire",key:"safetySystem"},
  ]},
  {id:6,para:"§2 Abs.2 Nr.6",name:"Vereinigungsfreiheit & Tarifrecht",convention:"ILO C87 & C98",domain:"Menschenrechte",weight:7,riskDomain:"labor",subs:[
    {id:"6.1",name:"ILO C87/C98 Ratifizierungsstatus",source:"ILO NORMLEX",type:"country",factor:1.0},
    {id:"6.2",name:"ITUC Global Rights Index",source:"ITUC GRI 2023",type:"country",factor:1.0},
    {id:"6.3",name:"Tarifverhandlungsrecht in der Praxis",source:"WorldBank Labour Indicators",type:"country",factor:0.85},
    {id:"6.4",name:"Gewerkschaftszugang & Betriebsrat Supplier",source:"Fragebogen C.2",type:"questionnaire",key:"unionAccess"},
  ]},
  {id:7,para:"§2 Abs.2 Nr.7",name:"Diskriminierung am Arbeitsplatz",convention:"ILO C100 & C111",domain:"Menschenrechte",weight:7,riskDomain:"labor",subs:[
    {id:"7.1",name:"ILO C100/C111 Umsetzungsgrad",source:"ILO NORMLEX",type:"country",factor:1.0},
    {id:"7.2",name:"Gender Pay Gap Index (WEF GGGI)",source:"WEF Global Gender Gap Report 2024",type:"country",factor:0.9},
    {id:"7.3",name:"Antidiskriminierungsrichtlinie Supplier",source:"Fragebogen C.3",type:"questionnaire",key:"antiDiscrimination"},
    {id:"7.4",name:"Interner Beschwerdekanal Supplier",source:"Fragebogen C.4",type:"questionnaire",key:"internalGrievance"},
  ]},
  {id:8,para:"§2 Abs.2 Nr.8",name:"Angemessene Entlohnung",convention:"ILO C131",domain:"Menschenrechte",weight:7,riskDomain:"labor",subs:[
    {id:"8.1",name:"Mindestlohn vs. Existenzminimum (WageIndicator)",source:"WageIndicator Foundation 2024",type:"country",factor:1.0},
    {id:"8.2",name:"Lohnrückstands- und Lohndiebstahlrisiko",source:"ILO Global Wage Report",type:"sector",factor:0.9},
    {id:"8.3",name:"Lohnabrechnungs- & Zahlungsdokumentation",source:"Fragebogen D.1",type:"questionnaire",key:"wageDocumentation"},
  ]},
  {id:9,para:"§2 Abs.2 Nr.9",name:"Umweltschäden → Menschenrechtsrisiken",convention:"UN ICESCR",domain:"Menschenrechte",weight:8,riskDomain:"env",subs:[
    {id:"9.1",name:"Luftqualitätsindex Standortland (WHO)",source:"WHO GHO Air Quality Data",type:"country",factor:1.0},
    {id:"9.2",name:"Wasserverschmutzungs- & Wasserknappheitsrisiko",source:"WWF Water Risk Filter",type:"sector",factor:0.9},
    {id:"9.3",name:"Gemeinschaftsbetroffenheit Supplier (HRDD)",source:"Fragebogen D.2",type:"questionnaire",key:"communityImpact"},
  ]},
  {id:10,para:"§2 Abs.2 Nr.10",name:"Zwangsvertreibung & Landrechte",convention:"ILO C169 & UN DRIP",domain:"Menschenrechte",weight:8,riskDomain:"land",subs:[
    {id:"10.1",name:"Landrechtsverletzungsindex (LAND-matrix)",source:"LAND Matrix Initiative 2023",type:"country",factor:1.0},
    {id:"10.2",name:"ILO C169 Indigene Völker — Ratifizierung",source:"ILO NORMLEX",type:"country",factor:0.9},
    {id:"10.3",name:"Supplier Flächennutzungsnachweis (FPIC)",source:"Fragebogen D.3",type:"questionnaire",key:"landRightsDoc"},
  ]},
  {id:11,para:"§2 Abs.2 Nr.11",name:"Unrechtm. Einsatz von Sicherheitskräften",convention:"UN Basic Principles on Use of Force",domain:"Menschenrechte",weight:6,riskDomain:"security",subs:[
    {id:"11.1",name:"Private Security Regulierungsrahmen Land",source:"WorldBank Rule of Law Index",type:"country",factor:1.0},
    {id:"11.2",name:"Supplier Sicherheitskonzept & VfP-Schulung",source:"Fragebogen E.1",type:"questionnaire",key:"securityConcept"},
  ]},
  {id:12,para:"§2 Abs.2 Nr.12",name:"Weitere schwere Menschenrechtsverletzungen",convention:"UN Guiding Principles (UNGP)",domain:"Menschenrechte",weight:7,riskDomain:"labor",subs:[
    {id:"12.1",name:"UN Human Rights Council Länderindex",source:"OHCHR Universal Periodic Review",type:"country",factor:1.0},
    {id:"12.2",name:"Pressefreiheit & Zivilgesellschaftsraum",source:"RSF Press Freedom Index 2024",type:"country",factor:0.85},
    {id:"12.3",name:"Supplier Grundsatzerklärung Menschenrechte",source:"Fragebogen E.2",type:"questionnaire",key:"humanRightsPolicy"},
  ]},
  {id:13,para:"§2 Abs.3 Nr.1",name:"Quecksilber — Produktherstellung",convention:"Minamata-Übereinkommen Art.4",domain:"Umwelt",weight:6,riskDomain:"env",subs:[
    {id:"13.1",name:"Minamata Ratifizierung & nationales Umsetzungsgesetz",source:"UNEP Minamata Ratification Status",type:"country",factor:1.0},
    {id:"13.2",name:"Quecksilberhaltige Produkte im Sortiment",source:"Fragebogen F.1",type:"questionnaire",key:"mercuryProducts"},
  ]},
  {id:14,para:"§2 Abs.3 Nr.2",name:"Quecksilber — Produktionsverfahren",convention:"Minamata-Übereinkommen Art.5",domain:"Umwelt",weight:6,riskDomain:"env",subs:[
    {id:"14.1",name:"Nachweis quecksilberfreier Produktionsverfahren",source:"Fragebogen F.2",type:"questionnaire",key:"mercuryFreeProcess"},
    {id:"14.2",name:"Alternatives & unabhängige Verifikation",source:"Fragebogen F.3",type:"questionnaire",key:"mercuryAudit"},
  ]},
  {id:15,para:"§2 Abs.3 Nr.3",name:"Quecksilber — Abfallentsorgung",convention:"Minamata-Übereinkommen Art.11",domain:"Umwelt",weight:6,riskDomain:"env",subs:[
    {id:"15.1",name:"Dokumentiertes Quecksilber-Abfallprotokoll",source:"Fragebogen F.4",type:"questionnaire",key:"mercuryWasteProtocol"},
    {id:"15.2",name:"Zertifizierter Entsorgungsdienstleister",source:"Fragebogen F.5",type:"questionnaire",key:"certifiedDisposal"},
  ]},
  {id:16,para:"§2 Abs.3 Nr.4",name:"POPs — Produktion & Verwendung",convention:"Stockholm-Übereinkommen Art.3",domain:"Umwelt",weight:7,riskDomain:"env",subs:[
    {id:"16.1",name:"Stockholm Convention Ratifizierungsstand",source:"UNEP Stockholm Ratification Status",type:"country",factor:1.0},
    {id:"16.2",name:"POPs-Exposition im Sektor (UNEP Chemicals)",source:"UNEP Chemicals Outlook",type:"sector",factor:0.9},
    {id:"16.3",name:"Nachweis POPs-freier Produktionsprozesse",source:"Fragebogen G.1",type:"questionnaire",key:"popsFreeProd"},
  ]},
  {id:17,para:"§2 Abs.3 Nr.5",name:"POPs — Abfallentsorgung",convention:"Stockholm-Übereinkommen Art.6",domain:"Umwelt",weight:7,riskDomain:"env",subs:[
    {id:"17.1",name:"POPs-Abfallentsorgungsprotokoll dokumentiert",source:"Fragebogen G.2",type:"questionnaire",key:"popsWasteDoc"},
    {id:"17.2",name:"Externe Audits & Verifikation vorhanden",source:"Fragebogen G.3",type:"questionnaire",key:"popsAudit"},
  ]},
  {id:18,para:"§2 Abs.3 Nr.6",name:"Gefährl. Abfälle — grenzüberschr. Export",convention:"Basler Übereinkommen Art.1",domain:"Umwelt",weight:8,riskDomain:"env",subs:[
    {id:"18.1",name:"Basler Übereinkommen Umsetzungsgrad",source:"UNEP Basel Ratification Status",type:"country",factor:1.0},
    {id:"18.2",name:"Exportkontrollsystem implementiert",source:"Fragebogen H.1",type:"questionnaire",key:"exportControl"},
    {id:"18.3",name:"Grenzüberschreitende Rückverfolgbarkeit",source:"Fragebogen H.2",type:"questionnaire",key:"wasteTraceability"},
  ]},
  {id:19,para:"§2 Abs.3 Nr.7",name:"Gefährl. Abfälle — Annex VII-Länder",convention:"Basler Übereinkommen Art.11",domain:"Umwelt",weight:7,riskDomain:"env",subs:[
    {id:"19.1",name:"Annex VII Compliance vollständig dokumentiert",source:"Fragebogen H.3",type:"questionnaire",key:"annexVIICompliance"},
    {id:"19.2",name:"Entsorgungsnachweise lückenlos archiviert",source:"Fragebogen H.4",type:"questionnaire",key:"disposalRecords"},
  ]},
  {id:20,para:"§2 Abs.3 Nr.8",name:"Gefährl. Abfälle — Import aus Drittstaaten",convention:"Basler Übereinkommen Art.4",domain:"Umwelt",weight:7,riskDomain:"env",subs:[
    {id:"20.1",name:"Importkontrolle & Herkunftszertifikate",source:"Fragebogen H.5",type:"questionnaire",key:"importControl"},
    {id:"20.2",name:"Zolldokumentation & behördliche Nachweise",source:"Fragebogen H.6",type:"questionnaire",key:"customsDocs"},
  ]},
];

/* ═══════════════════════════════════════════════════════════
   4. SUPPLIER DATA
═══════════════════════════════════════════════════════════ */
const SUPPLIERS = [
  {id:1,name:"Müller Metallwerk GmbH",country:"DE",flag:"🇩🇪",sector:"Metallverarbeitung",employees:340,revenue:"€12M",certs:["ISO 14001","ISO 9001"],questReturned:"2024-11-08",questSent:"2024-11-01",nextAudit:"2025-11-01",
    answers:{ageVerification:95,childLaborMonitoring:92,forcedLaborCommitment:96,slaveryControl:90,safetySystem:94,unionAccess:92,antiDiscrimination:93,internalGrievance:88,wageDocumentation:97,communityImpact:90,landRightsDoc:95,securityConcept:88,humanRightsPolicy:91,mercuryProducts:98,mercuryFreeProcess:97,mercuryAudit:90,mercuryWasteProtocol:95,certifiedDisposal:92,popsFreeProd:96,popsWasteDoc:93,popsAudit:88,exportControl:94,wasteTraceability:90,annexVIICompliance:92,disposalRecords:91,importControl:93,customsDocs:96}},
  {id:2,name:"Hanoi Industrial Co. Ltd.",country:"VN",flag:"🇻🇳",sector:"Elektronikfertigung",employees:1200,revenue:"€34M",certs:[],questReturned:null,questSent:"2024-08-01",nextAudit:"2025-02-01",
    answers:{ageVerification:30,childLaborMonitoring:20,forcedLaborCommitment:15,slaveryControl:18,safetySystem:28,unionAccess:12,antiDiscrimination:25,internalGrievance:20,wageDocumentation:22,communityImpact:35,landRightsDoc:55,securityConcept:40,humanRightsPolicy:18,mercuryProducts:45,mercuryFreeProcess:40,mercuryAudit:25,mercuryWasteProtocol:35,certifiedDisposal:28,popsFreeProd:38,popsWasteDoc:30,popsAudit:20,exportControl:42,wasteTraceability:35,annexVIICompliance:40,disposalRecords:32,importControl:45,customsDocs:50}},
  {id:3,name:"Santos Agro Brasil S.A.",country:"BR",flag:"🇧🇷",sector:"Agrarrohstoffe",employees:580,revenue:"€22M",certs:["Rainforest Alliance"],questReturned:"2024-10-18",questSent:"2024-10-01",nextAudit:"2025-04-01",
    answers:{ageVerification:58,childLaborMonitoring:52,forcedLaborCommitment:60,slaveryControl:55,safetySystem:62,unionAccess:58,antiDiscrimination:65,internalGrievance:60,wageDocumentation:55,communityImpact:48,landRightsDoc:40,securityConcept:62,humanRightsPolicy:58,mercuryProducts:80,mercuryFreeProcess:78,mercuryAudit:65,mercuryWasteProtocol:70,certifiedDisposal:68,popsFreeProd:72,popsWasteDoc:65,popsAudit:55,exportControl:68,wasteTraceability:60,annexVIICompliance:65,disposalRecords:62,importControl:70,customsDocs:72}},
  {id:4,name:"Apex Textiles Bangladesh",country:"BD",flag:"🇧🇩",sector:"Textilherstellung",employees:2100,revenue:"€8M",certs:[],questReturned:"2024-08-02",questSent:"2024-07-15",nextAudit:"2025-01-15",
    answers:{ageVerification:18,childLaborMonitoring:12,forcedLaborCommitment:10,slaveryControl:14,safetySystem:16,unionAccess:8,antiDiscrimination:20,internalGrievance:15,wageDocumentation:12,communityImpact:25,landRightsDoc:45,securityConcept:30,humanRightsPolicy:14,mercuryProducts:55,mercuryFreeProcess:50,mercuryAudit:20,mercuryWasteProtocol:28,certifiedDisposal:22,popsFreeProd:32,popsWasteDoc:25,popsAudit:15,exportControl:35,wasteTraceability:28,annexVIICompliance:30,disposalRecords:25,importControl:38,customsDocs:42}},
  {id:5,name:"Ober Logistics AG",country:"CH",flag:"🇨🇭",sector:"Logistik",employees:890,revenue:"€67M",certs:["ISO 14001","ISO 45001","SMETA"],questReturned:"2024-12-03",questSent:"2024-12-01",nextAudit:"2025-12-01",
    answers:{ageVerification:97,childLaborMonitoring:96,forcedLaborCommitment:98,slaveryControl:95,safetySystem:97,unionAccess:95,antiDiscrimination:96,internalGrievance:94,wageDocumentation:98,communityImpact:93,landRightsDoc:97,securityConcept:95,humanRightsPolicy:96,mercuryProducts:99,mercuryFreeProcess:98,mercuryAudit:96,mercuryWasteProtocol:97,certifiedDisposal:98,popsFreeProd:98,popsWasteDoc:97,popsAudit:95,exportControl:98,wasteTraceability:97,annexVIICompliance:96,disposalRecords:98,importControl:97,customsDocs:98}},
  {id:6,name:"MechParts Poland Sp. z o.o.",country:"PL",flag:"🇵🇱",sector:"Maschinenbauteile",employees:420,revenue:"€19M",certs:["ISO 9001"],questReturned:"2024-09-14",questSent:"2024-09-01",nextAudit:"2025-09-01",
    answers:{ageVerification:85,childLaborMonitoring:80,forcedLaborCommitment:88,slaveryControl:82,safetySystem:84,unionAccess:78,antiDiscrimination:82,internalGrievance:76,wageDocumentation:87,communityImpact:80,landRightsDoc:85,securityConcept:78,humanRightsPolicy:82,mercuryProducts:90,mercuryFreeProcess:88,mercuryAudit:80,mercuryWasteProtocol:85,certifiedDisposal:82,popsFreeProd:88,popsWasteDoc:84,popsAudit:78,exportControl:86,wasteTraceability:82,annexVIICompliance:84,disposalRecords:82,importControl:86,customsDocs:88}},
  {id:7,name:"Shenzhen ElecParts Ltd.",country:"CN",flag:"🇨🇳",sector:"Elektronikkomponenten",employees:3400,revenue:"€120M",certs:["ISO 14001"],questReturned:null,questSent:"2024-11-15",nextAudit:"2025-03-15",
    answers:{ageVerification:38,childLaborMonitoring:30,forcedLaborCommitment:22,slaveryControl:25,safetySystem:48,unionAccess:15,antiDiscrimination:42,internalGrievance:38,wageDocumentation:45,communityImpact:40,landRightsDoc:55,securityConcept:50,humanRightsPolicy:28,mercuryProducts:52,mercuryFreeProcess:50,mercuryAudit:45,mercuryWasteProtocol:55,certifiedDisposal:50,popsFreeProd:48,popsWasteDoc:45,popsAudit:38,exportControl:55,wasteTraceability:48,annexVIICompliance:52,disposalRecords:48,importControl:55,customsDocs:58}},
  {id:8,name:"Atlas Steel Morocco",country:"MA",flag:"🇲🇦",sector:"Stahl & Metall",employees:760,revenue:"€31M",certs:["ISO 9001"],questReturned:"2024-11-01",questSent:"2024-10-20",nextAudit:"2025-05-01",
    answers:{ageVerification:62,childLaborMonitoring:58,forcedLaborCommitment:65,slaveryControl:60,safetySystem:55,unionAccess:52,antiDiscrimination:60,internalGrievance:55,wageDocumentation:62,communityImpact:58,landRightsDoc:65,securityConcept:60,humanRightsPolicy:62,mercuryProducts:70,mercuryFreeProcess:65,mercuryAudit:58,mercuryWasteProtocol:62,certifiedDisposal:60,popsFreeProd:65,popsWasteDoc:60,popsAudit:52,exportControl:65,wasteTraceability:60,annexVIICompliance:62,disposalRecords:60,importControl:65,customsDocs:68}},
];

/* ═══════════════════════════════════════════════════════════
   5. SCORING ENGINE
═══════════════════════════════════════════════════════════ */
function calcSubScore(sub, supplier) {
  const cr = COUNTRY_RISK[supplier.country] || COUNTRY_RISK["DE"];
  const sm = SECTOR_MOD[supplier.sector] || {labor:0.85,env:0.85,land:0.90,security:0.88};
  if (sub.type === "country") {
    const envIds = ["9","13","14","15","16","17","18","19","20"];
    const domKey = envIds.some(p => sub.id.startsWith(p)) ? "env" : sub.id.startsWith("10") ? "land" : sub.id.startsWith("11") ? "security" : "labor";
    return Math.round(cr[domKey] * sub.factor);
  }
  if (sub.type === "sector") {
    const catObj = CATEGORIES.find(c => c.subs.some(s => s.id === sub.id));
    const dom = catObj?.riskDomain || "labor";
    return Math.round(cr[dom] * (sm[dom] || 0.85) * sub.factor);
  }
  if (sub.type === "certification") {
    const hasCert = supplier.certs.includes(sub.certKey);
    const baseScore = Math.round((cr[sub.domain] || cr.base) * 0.7);
    return hasCert ? Math.min(100, baseScore + (CERT_BONUS[sub.certKey]?.[sub.domain] || 0) * 3) : baseScore;
  }
  if (sub.type === "questionnaire") {
    if (!supplier.questReturned) return Math.round(cr.base * 0.4);
    return supplier.answers[sub.key] || 50;
  }
  return 50;
}

function calcCategoryScore(cat, supplier) {
  const subScores = cat.subs.map(s => calcSubScore(s, supplier));
  let base = Math.round(subScores.reduce((a, v) => a + v, 0) / subScores.length);
  let bonus = 0;
  supplier.certs.forEach(cert => {
    const cb = CERT_BONUS[cert]; if (!cb) return;
    if (cat.domain === "Menschenrechte") bonus += cb.labor;
    if (cat.domain === "Umwelt") bonus += cb.env;
    bonus += cb.general * 0.3;
  });
  return { score: Math.min(100, Math.round(base + bonus * 0.4)), subScores };
}

function calcTotalScore(supplier) {
  let weightedSum = 0, totalWeight = 0;
  CATEGORIES.forEach(cat => {
    const { score } = calcCategoryScore(cat, supplier);
    weightedSum += score * cat.weight; totalWeight += cat.weight;
  });
  return Math.round(weightedSum / totalWeight);
}

function getRisk(score) { return score >= 70 ? "low" : score >= 45 ? "medium" : "high"; }

/* ═══════════════════════════════════════════════════════════
   6. UI PRIMITIVES
═══════════════════════════════════════════════════════════ */
const Badge = ({ col, bg, children, sm }) => (
  <span style={{ display:"inline-flex",alignItems:"center",padding:sm?"2px 8px":"3px 11px",borderRadius:99,background:bg,color:col,fontSize:sm?10:11,fontWeight:700,letterSpacing:"0.04em",whiteSpace:"nowrap" }}>{children}</span>
);
const ScoreBar = ({ score, w=80 }) => {
  const col = score>=70?C.accentM:score>=45?C.warnM:C.dangerM;
  return (
    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
      <div style={{ width:w,height:5,background:C.border,borderRadius:3,overflow:"hidden" }}>
        <div style={{ width:`${score}%`,height:"100%",background:col,borderRadius:3,transition:"width 0.4s" }}/>
      </div>
      <span style={{ fontSize:11,fontWeight:700,color:col,fontFamily:"monospace",minWidth:24 }}>{score}</span>
    </div>
  );
};
const Ring = ({ score, size=64 }) => {
  const col = score>=70?C.accentM:score>=45?C.warnM:C.dangerM;
  const r=28,c=size/2,stroke=5,circ=2*Math.PI*r;
  return (
    <svg width={size} height={size}>
      <circle cx={c} cy={c} r={r} fill="none" stroke={C.border} strokeWidth={stroke}/>
      <circle cx={c} cy={c} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`} style={{ transition:"stroke-dashoffset 0.5s" }}/>
      <text x={c} y={c+1} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={700} fill={col} fontFamily="monospace">{score}</text>
    </svg>
  );
};
const Btn = ({ children, onClick, primary, sm, full, danger, style }) => (
  <button onClick={onClick} style={{ padding:sm?"5px 12px":"8px 16px",borderRadius:7,border:danger?`1px solid ${C.dangerM}40`:`1px solid ${primary?C.accent:C.border}`,background:primary?C.accent:danger?C.dangerL:"transparent",color:primary?"#fff":danger?C.dangerM:C.text,fontSize:sm?11:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:full?"100%":"auto",transition:"all 0.15s",...style }}>{children}</button>
);
const Pill = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{ padding:"4px 12px",borderRadius:99,border:`1px solid ${active?C.accent:C.border}`,background:active?C.accentL:"transparent",color:active?C.accent:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.1s",fontFamily:"'DM Sans',sans-serif" }}>{children}</button>
);
const Modal = ({ open, onClose, title, wide, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(26,23,20,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }} onClick={onClose}>
      <div style={{ background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,maxWidth:wide?900:580,width:"100%",maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:"18px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.surface,zIndex:1 }}>
          <div style={{ fontSize:16,fontWeight:700,color:C.text,fontFamily:"'DM Serif Display',serif" }}>{title}</div>
          <button onClick={onClose} style={{ background:"none",border:"none",color:C.faint,fontSize:22,cursor:"pointer",lineHeight:1,padding:"0 4px" }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
};
const Toast = ({ msg, onDone }) => {
  useState(() => { const t=setTimeout(onDone,3000); return ()=>clearTimeout(t); });
  return <div style={{ position:"fixed",bottom:24,right:24,background:C.accent,color:"#fff",padding:"12px 20px",borderRadius:10,fontSize:13,fontWeight:600,zIndex:2000,boxShadow:"0 8px 24px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",gap:8 }}>✓ {msg}</div>;
};

/* ═══════════════════════════════════════════════════════════
   7. LOGIN SCREEN
═══════════════════════════════════════════════════════════ */
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("demo@muster-ag.de");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("login"); // login | register

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email) { setError("Bitte E-Mail eingeben."); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); onLogin({ name:"Muster AG", email }); }, 1200);
  };

  const inputStyle = { width:"100%",padding:"10px 14px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:14,color:C.text,outline:"none",background:C.bg,fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box" };
  const labelStyle = { fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:6 };

  return (
    <div style={{ minHeight:"100vh",display:"flex",background:C.bg }}>
      {/* Left panel */}
      <div style={{ flex:1,background:C.accent,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:48 }}>
        <div>
          <div style={{ fontSize:22,fontFamily:"'DM Serif Display',serif",color:"#fff",marginBottom:4 }}>
            LkSG<span style={{ color:"#6CD49C" }}> Compass</span>
          </div>
          <div style={{ fontSize:11,color:"rgba(255,255,255,0.45)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" }}>Supply Chain Compliance</div>
        </div>

        <div>
          <div style={{ fontSize:32,fontFamily:"'DM Serif Display',serif",color:"#fff",lineHeight:1.2,marginBottom:20 }}>
            §2 LkSG. Endlich<br/>messbar und<br/>audit-fest.
          </div>
          <div style={{ fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.7,marginBottom:32 }}>
            20 gesetzliche Kategorien. 53 Unterindikatoren.<br/>
            Datenbasiert. Quellenreferenziert. BAFA-konform.
          </div>

          {[
            { icon:"◈", text:"53 Unterindikatoren nach ILO / WorldBank / ITUC" },
            { icon:"◎", text:"40+ Länder in der Risikomatrix" },
            { icon:"⬡", text:"Konservative Schätzung bei Datenlücken — BAFA-sicher" },
            { icon:"▣", text:"Automatischer Fragebogenversand & Tracking" },
          ].map((f,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
              <div style={{ width:28,height:28,borderRadius:7,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"#6CD49C",fontSize:12,flexShrink:0 }}>{f.icon}</div>
              <div style={{ fontSize:13,color:"rgba(255,255,255,0.75)" }}>{f.text}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize:11,color:"rgba(255,255,255,0.3)" }}>
          © 2025 LkSG Compass · Made in Germany · DSGVO-konform
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width:480,display:"flex",alignItems:"center",justifyContent:"center",padding:48,background:C.surface }}>
        <div style={{ width:"100%",maxWidth:380 }}>
          {/* Tabs */}
          <div style={{ display:"flex",gap:0,marginBottom:32,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}` }}>
            {["login","register"].map(t => (
              <button key={t} onClick={()=>{ setTab(t); setError(""); }}
                style={{ flex:1,padding:"10px 0",border:"none",background:tab===t?C.accent:"transparent",color:tab===t?"#fff":C.muted,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s" }}>
                {t==="login"?"Anmelden":"Registrieren"}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} style={{ display:"flex",flexDirection:"column",gap:20 }}>
              <div>
                <div style={{ fontSize:22,fontFamily:"'DM Serif Display',serif",color:C.text,marginBottom:6 }}>Willkommen zurück</div>
                <div style={{ fontSize:13,color:C.muted }}>Melden Sie sich mit Ihrem Account an.</div>
              </div>

              <div>
                <label style={labelStyle}>E-Mail-Adresse</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} placeholder="compliance@firma.de"/>
              </div>
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                  <label style={{...labelStyle,marginBottom:0}}>Passwort</label>
                  <a href="#" style={{ fontSize:11,color:C.accentM,textDecoration:"none" }}>Vergessen?</a>
                </div>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle} placeholder="••••••••"/>
              </div>

              {error && <div style={{ background:C.dangerL,color:C.dangerM,padding:"10px 14px",borderRadius:8,fontSize:12,fontWeight:600 }}>{error}</div>}

              <button type="submit" disabled={loading}
                style={{ width:"100%",padding:"13px",borderRadius:9,border:"none",background:loading?C.faint:C.accent,color:"#fff",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",transition:"background 0.2s" }}>
                {loading ? "Wird angemeldet …" : "Anmelden →"}
              </button>

              <div style={{ position:"relative",textAlign:"center" }}>
                <div style={{ position:"absolute",top:"50%",left:0,right:0,height:1,background:C.border }}/>
                <span style={{ position:"relative",background:C.surface,padding:"0 12px",fontSize:11,color:C.faint }}>oder</span>
              </div>

              <button type="button" onClick={handleLogin}
                style={{ width:"100%",padding:"13px",borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
                🚀 Demo-Zugang starten
              </button>

              <div style={{ textAlign:"center",fontSize:12,color:C.faint }}>
                Mit dem Anmelden stimmen Sie den <a href="#" style={{ color:C.accentM }}>AGB</a> und <a href="#" style={{ color:C.accentM }}>Datenschutzbestimmungen</a> zu.
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} style={{ display:"flex",flexDirection:"column",gap:16 }}>
              <div>
                <div style={{ fontSize:22,fontFamily:"'DM Serif Display',serif",color:C.text,marginBottom:6 }}>14 Tage kostenlos</div>
                <div style={{ fontSize:13,color:C.muted }}>Kein Kreditkarte. Keine Einrichtungsgebühr.</div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div><label style={labelStyle}>Vorname</label><input style={inputStyle} placeholder="Maria"/></div>
                <div><label style={labelStyle}>Nachname</label><input style={inputStyle} placeholder="Müller"/></div>
              </div>
              <div><label style={labelStyle}>Firmenname</label><input style={inputStyle} placeholder="Muster AG"/></div>
              <div><label style={labelStyle}>E-Mail</label><input type="email" style={inputStyle} placeholder="compliance@firma.de"/></div>
              <div><label style={labelStyle}>Passwort</label><input type="password" style={inputStyle} placeholder="Mind. 8 Zeichen"/></div>
              <div style={{ background:C.accentL,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.accent,lineHeight:1.6 }}>
                ✓ 14 Tage Vollzugang · ✓ 8 Demo-Lieferanten vorgeladen · ✓ BAFA-Bericht sofort generierbar
              </div>
              <button type="submit" style={{ width:"100%",padding:"13px",borderRadius:9,border:"none",background:C.accent,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
                Kostenlosen Test starten →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   8. DASHBOARD
═══════════════════════════════════════════════════════════ */
const Dashboard = ({ setPage, toast }) => {
  const scored = SUPPLIERS.map(s => ({ ...s, total: calcTotalScore(s) }));
  const avg = Math.round(scored.reduce((a,s)=>a+s.total,0)/scored.length);
  const crit = scored.filter(s=>getRisk(s.total)==="high").length;
  const pending = SUPPLIERS.filter(s=>!s.questReturned).length;
  const [showMethod, setShowMethod] = useState(false);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14 }}>
        {[
          { label:"Ø Konformitätsscore",value:`${avg}%`,sub:`${scored.filter(s=>getRisk(s.total)==="low").length} konform · ${crit} kritisch`,col:avg>=70?C.accentM:avg>=45?C.warnM:C.dangerM },
          { label:"Lieferanten gesamt",value:SUPPLIERS.length,sub:"8 aktiv bewertet",col:C.text },
          { label:"Ausstehende Fragebögen",value:pending,sub:"Antwort überfällig",col:pending>0?C.dangerM:C.accentM },
          { label:"Nächster Bericht",value:"14 Tage",sub:"Fällig 06. März 2025",col:C.warnM },
        ].map((k,i)=>(
          <div key={i} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px" }}>
            <div style={{ fontSize:10,color:C.faint,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8 }}>{k.label}</div>
            <div style={{ fontSize:30,fontWeight:800,color:k.col,fontFamily:"monospace",lineHeight:1,marginBottom:4 }}>{k.value}</div>
            <div style={{ fontSize:11,color:C.muted }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 310px",gap:20 }}>
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,color:C.text }}>Lieferanten Risikostatus</div>
            <Btn sm onClick={()=>setPage("suppliers")}>Alle anzeigen →</Btn>
          </div>
          {scored.map(s=>(
            <div key={s.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:8,cursor:"pointer",marginBottom:4 }} onClick={()=>setPage("suppliers")}>
              <span style={{ fontSize:18 }}>{s.flag}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:600,color:C.text }}>{s.name}</div>
                <div style={{ fontSize:11,color:C.faint }}>{s.sector}</div>
              </div>
              <Badge col={s.total>=70?C.accentM:s.total>=45?C.warnM:C.dangerM} bg={s.total>=70?C.accentL:s.total>=45?C.warnL:C.dangerL} sm>
                {s.total>=70?"Konform":s.total>=45?"In Prüfung":"Kritisch"}
              </Badge>
              <ScoreBar score={s.total} w={80}/>
            </div>
          ))}
        </div>
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20,display:"flex",flexDirection:"column",gap:8 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,color:C.text,marginBottom:8 }}>Offene Maßnahmen</div>
          {[
            { s:"Hanoi Industrial",t:"Fragebogen überfällig",c:C.dangerM },
            { s:"Shenzhen ElecParts",t:"Fragebogen überfällig",c:C.dangerM },
            { s:"Apex Textiles",t:"Korrekturmaßnahme offen",c:C.warnM },
            { s:"Santos Agro",t:"Nachweisdokument fehlt",c:C.warnM },
            { s:"Atlas Steel",t:"Folgeaudit fällig",c:C.gold },
            { s:"Alle Lieferanten",t:"CSDDD Gap-Analyse starten",c:C.infoM },
          ].map((a,i)=>(
            <div key={i} style={{ padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.bg }}>
              <div style={{ fontSize:12,fontWeight:600,color:C.text }}>{a.t}</div>
              <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{a.s}</div>
              <div style={{ marginTop:4,height:2,width:40,borderRadius:1,background:a.c }}/>
            </div>
          ))}
          <Btn full sm primary onClick={()=>toast("Aktionsplan als PDF exportiert")}>Aktionsplan exportieren</Btn>
        </div>
      </div>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ fontSize:13,color:C.text }}>
          <span style={{ fontWeight:700 }}>Bewertungsmethodik:</span>
          <span style={{ color:C.muted }}> 20 §2-Kategorien · 53 Unterindikatoren · ILO, WorldBank, ITUC, GSI, TI-CPI, UNEP — 40 Länder abgedeckt</span>
          <span style={{ marginLeft:8 }}><Badge col={C.accentM} bg={C.accentL} sm>Anwaltlich geprüft v2.1</Badge></span>
        </div>
        <Btn sm onClick={()=>setShowMethod(true)}>Methodik ansehen →</Btn>
      </div>
      <Modal open={showMethod} onClose={()=>setShowMethod(false)} title="Bewertungsmethodik — LkSG Compass v2.1" wide>
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <div style={{ background:C.accentL,border:`1px solid ${C.accentM}40`,borderRadius:8,padding:14,fontSize:13,color:C.accent,lineHeight:1.7 }}>
            Die Risikobewertung basiert auf §2 LkSG (20 gesetzliche Verbotskategorien) und 53 Unterindikatoren aus anerkannten internationalen Datenquellen. 40 Länder in der Risikomatrix. Methodik durch unabhängige Fachanwaltskanzlei geprüft.
          </div>
          {[
            ["Länderrisikoindex (Basis)","ILO NORMLEX, WorldBank WGI, ITUC GRI, TI CPI — 40 Länder","35%"],
            ["Sektorrisikomultiplikator","ILO IPEC, UNEP Chemicals Outlook, Branchenstatistiken — 15 Sektoren","20%"],
            ["Lieferantenfragebogen","53 Fragen zu allen 20 §2-Kategorien, automatisch angepasst","35%"],
            ["Zertifizierungsbonus","SA8000, ISO 14001/45001, SMETA, Rainforest Alliance, Fairtrade, BSCI, RSPO, FSC","10%"],
          ].map(([k,v,w])=>(
            <div key={k} style={{ display:"grid",gridTemplateColumns:"180px 1fr 60px",gap:12,padding:"10px 14px",borderRadius:8,background:C.bg,fontSize:12 }}>
              <div style={{ fontWeight:700,color:C.text }}>{k}</div>
              <div style={{ color:C.muted }}>{v}</div>
              <div style={{ fontWeight:800,color:C.accent,textAlign:"right",fontFamily:"monospace" }}>{w}</div>
            </div>
          ))}
          <div style={{ fontSize:11,color:C.faint,fontStyle:"italic" }}>Version 2.1.0 · Geprüft Januar 2025 · Nächste Überprüfung Juli 2025 · BAFA-konform · CSDDD-ready</div>
        </div>
      </Modal>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   9. SUPPLIERS
═══════════════════════════════════════════════════════════ */
const Suppliers = ({ toast }) => {
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [qOpen, setQOpen] = useState(false);
  const [newSup, setNewSup] = useState({ name:"",country:"VN",sector:"Textilherstellung",email:"",employees:"",revenue:"" });

  const scored = SUPPLIERS.map(s=>({ ...s, total:calcTotalScore(s), risk:getRisk(calcTotalScore(s)) }));
  const filtered = scored.filter(s => {
    if (filter!=="all" && s.risk!==filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.sector.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const sup = sel ? scored.find(x=>x.id===sel) : null;

  return (
    <div style={{ display:"flex",gap:20,height:"100%" }}>
      <div style={{ flex:1,display:"flex",flexDirection:"column",gap:12,minWidth:0 }}>
        <div style={{ display:"flex",gap:10 }}>
          <div style={{ flex:1,position:"relative" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Lieferant oder Sektor suchen…"
              style={{ width:"100%",padding:"8px 14px 8px 34px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,color:C.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif" }}/>
            <span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.faint }}>⌕</span>
          </div>
          <Btn primary onClick={()=>setAddOpen(true)}>+ Lieferant hinzufügen</Btn>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          {["all","low","medium","high"].map(f=>(
            <Pill key={f} active={filter===f} onClick={()=>setFilter(f)}>
              {f==="all"?"Alle":f==="low"?"Niedrig":f==="medium"?"Mittel":"Hoch"} {f!=="all"&&`(${scored.filter(s=>s.risk===f).length})`}
            </Pill>
          ))}
        </div>
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden" }}>
          <div style={{ display:"grid",gridTemplateColumns:"2.2fr 1.2fr 90px 110px 80px",padding:"9px 16px",background:C.bg,borderBottom:`1px solid ${C.border}` }}>
            {["Lieferant","Sektor","Score","Status","Fragebogen"].map((h,i)=>(
              <div key={i} style={{ fontSize:10,fontWeight:700,color:C.faint,textTransform:"uppercase",letterSpacing:"0.06em" }}>{h}</div>
            ))}
          </div>
          {filtered.map(s=>(
            <div key={s.id} onClick={()=>setSel(s.id===sel?null:s.id)}
              style={{ display:"grid",gridTemplateColumns:"2.2fr 1.2fr 90px 110px 80px",padding:"11px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:sel===s.id?C.accentL:"transparent",alignItems:"center",transition:"background 0.1s" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ fontSize:20 }}>{s.flag}</span>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:C.text }}>{s.name}</div>
                  <div style={{ fontSize:11,color:C.faint }}>{s.employees} MA · {s.revenue}</div>
                </div>
              </div>
              <div style={{ fontSize:12,color:C.muted }}>{s.sector}</div>
              <ScoreBar score={s.total} w={60}/>
              <Badge col={s.total>=70?C.accentM:s.total>=45?C.warnM:C.dangerM} bg={s.total>=70?C.accentL:s.total>=45?C.warnL:C.dangerL}>
                {s.total>=70?"Konform":s.total>=45?"In Prüfung":"Kritisch"}
              </Badge>
              <div style={{ fontSize:11,fontWeight:600,color:s.questReturned?C.accentM:C.dangerM }}>{s.questReturned?"✓ Eingeg.":"⚠ Ausst."}</div>
            </div>
          ))}
        </div>
      </div>
      {sup && (
        <div style={{ width:295,flexShrink:0,display:"flex",flexDirection:"column",gap:12 }}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:18 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
              <div>
                <div style={{ fontSize:22,marginBottom:2 }}>{sup.flag}</div>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:14,color:C.text }}>{sup.name}</div>
                <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{sup.sector} · {sup.country}</div>
              </div>
              <Ring score={sup.total} size={58}/>
            </div>
            {[["Mitarbeiter",sup.employees],["Umsatz",sup.revenue],["Fragebogen sent",sup.questSent],["Antwort erhalten",sup.questReturned||"⚠ Ausstehend"],["Nächstes Audit",sup.nextAudit]].map(([k,v])=>(
              <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:11,color:C.muted }}>{k}</span>
                <span style={{ fontSize:11,color:C.text,fontWeight:600 }}>{v}</span>
              </div>
            ))}
            {sup.certs.length>0 && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:10,color:C.faint,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6 }}>Zertifizierungen</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                  {sup.certs.map(c=><Badge key={c} col={C.accentM} bg={C.accentL} sm>{c}</Badge>)}
                </div>
              </div>
            )}
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            <Btn full primary onClick={()=>setQOpen(true)}>Fragebogen senden</Btn>
            <Btn full onClick={()=>toast(`Risikobericht für ${sup.name} erstellt`)}>Risikobericht erstellen</Btn>
            <Btn full onClick={()=>toast("Korrekturmaßnahme angelegt")}>Maßnahme anlegen</Btn>
          </div>
        </div>
      )}
      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Neuen Lieferanten hinzufügen">
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {[["Firmenname","z. B. Müller GmbH","name"],["Kontakt-E-Mail","compliance@lieferant.de","email"],["Mitarbeiteranzahl","z. B. 500","employees"],["Jahresumsatz","z. B. €5M","revenue"]].map(([l,p,k])=>(
            <div key={l}>
              <div style={{ fontSize:10,fontWeight:700,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em" }}>{l}</div>
              <input value={newSup[k]} onChange={e=>setNewSup(x=>({...x,[k]:e.target.value}))} placeholder={p} style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif" }}/>
            </div>
          ))}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <div style={{ fontSize:10,fontWeight:700,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em" }}>Herkunftsland</div>
              <select value={newSup.country} onChange={e=>setNewSup(x=>({...x,country:e.target.value}))} style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none",background:C.surface,fontFamily:"'DM Sans',sans-serif" }}>
                {Object.entries(COUNTRY_RISK).map(([code,cr])=><option key={code} value={code}>{cr.name} ({code})</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10,fontWeight:700,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em" }}>Sektor</div>
              <select value={newSup.sector} onChange={e=>setNewSup(x=>({...x,sector:e.target.value}))} style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none",background:C.surface,fontFamily:"'DM Sans',sans-serif" }}>
                {Object.keys(SECTOR_MOD).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {newSup.country && newSup.sector && (
            <div style={{ background:C.infoL,border:`1px solid ${C.infoM}40`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.info }}>
              Voraussichtlicher Basisrisiko-Score: <strong>{COUNTRY_RISK[newSup.country]?.base || "–"} / 100</strong> für {COUNTRY_RISK[newSup.country]?.name} im Sektor {newSup.sector}
            </div>
          )}
          <Btn full primary onClick={()=>{ setAddOpen(false); toast("Lieferant angelegt — Fragebogen automatisch versendet"); }}>Anlegen & Fragebogen versenden</Btn>
        </div>
      </Modal>
      <Modal open={qOpen} onClose={()=>setQOpen(false)} title={`Fragebogen versenden — ${sup?.name||""}`}>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ background:C.accentL,borderRadius:8,padding:12,fontSize:12,color:C.accent,lineHeight:1.7 }}>
            53 Unterindikatoren · 20 §2 LkSG Kategorien · Automatisch angepasst für {sup?.country} / {sup?.sector} · Anwaltlich geprüft
          </div>
          {[["Empfänger",sup?.name],["Frist","14 Tage"],["Erinnerung","Automatisch nach 7 Tagen"],["Sprache","Deutsch"]].map(([k,v])=>(
            <div key={k} style={{ display:"flex",justifyContent:"space-between" }}>
              <span style={{ fontSize:12,color:C.muted }}>{k}</span>
              <span style={{ fontSize:12,color:C.text,fontWeight:600 }}>{v}</span>
            </div>
          ))}
          <Btn full primary onClick={()=>{ setQOpen(false); toast(`Fragebogen an ${sup?.name} versendet`); }}>Jetzt versenden</Btn>
        </div>
      </Modal>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   10. RISK ANALYSIS
═══════════════════════════════════════════════════════════ */
const RiskAnalysis = ({ toast }) => {
  const [selSup, setSelSup] = useState(SUPPLIERS[0].id);
  const [domain, setDomain] = useState("all");
  const [expandedCat, setExpandedCat] = useState(null);

  const supplier = SUPPLIERS.find(s=>s.id===selSup);
  const cats = domain==="all"?CATEGORIES:CATEGORIES.filter(c=>c.domain===domain);
  const catResults = useMemo(()=>CATEGORIES.map(cat=>({ ...cat, ...calcCategoryScore(cat, supplier) })),[selSup]);
  const getResult = (catId) => catResults.find(r=>r.id===catId);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12 }}>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          {["all","Menschenrechte","Umwelt"].map(d=>(
            <Pill key={d} active={domain===d} onClick={()=>setDomain(d)}>{d==="all"?"Alle 20 Kategorien":d}</Pill>
          ))}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <span style={{ fontSize:12,color:C.muted }}>Analyse für:</span>
          <select value={selSup} onChange={e=>setSelSup(Number(e.target.value))}
            style={{ padding:"6px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:12,color:C.text,fontFamily:"'DM Sans',sans-serif",outline:"none" }}>
            {SUPPLIERS.map(s=><option key={s.id} value={s.id}>{s.flag} {s.name}</option>)}
          </select>
          <Badge col={calcTotalScore(supplier)>=70?C.accentM:calcTotalScore(supplier)>=45?C.warnM:C.dangerM} bg={calcTotalScore(supplier)>=70?C.accentL:calcTotalScore(supplier)>=45?C.warnL:C.dangerL}>
            Gesamtscore: {calcTotalScore(supplier)}
          </Badge>
        </div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {cats.map(cat=>{
          const res = getResult(cat.id);
          const isOpen = expandedCat===cat.id;
          return (
            <div key={cat.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden" }}>
              <div style={{ display:"flex",alignItems:"center",gap:14,padding:"13px 18px",cursor:"pointer",background:isOpen?C.bg:"transparent" }}
                onClick={()=>setExpandedCat(isOpen?null:cat.id)}>
                <div style={{ flex:"0 0 80px" }}>
                  <Badge col={cat.domain==="Menschenrechte"?C.infoM:C.accentM} bg={cat.domain==="Menschenrechte"?C.infoL:C.accentL} sm>{cat.para}</Badge>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:C.text }}>{cat.name}</div>
                  <div style={{ fontSize:10,color:C.faint,marginTop:1 }}>{cat.convention} · Gewichtung: {cat.weight}/10</div>
                </div>
                <div style={{ flex:"0 0 200px" }}><ScoreBar score={res.score} w={150}/></div>
                <div style={{ color:C.faint,fontSize:12,marginLeft:8 }}>{isOpen?"▲":"▼"}</div>
              </div>
              {isOpen && (
                <div style={{ borderTop:`1px solid ${C.border}`,background:C.bg }}>
                  <div style={{ display:"grid",gridTemplateColumns:"70px 1fr 140px 80px 80px",gap:0,padding:"8px 18px",borderBottom:`1px solid ${C.border}` }}>
                    {["ID","Unterindikator","Datenquelle","Score","Typ"].map((h,i)=>(
                      <div key={i} style={{ fontSize:9,fontWeight:700,color:C.faint,textTransform:"uppercase",letterSpacing:"0.07em" }}>{h}</div>
                    ))}
                  </div>
                  {cat.subs.map((sub,i)=>{
                    const sc = res.subScores[i];
                    return (
                      <div key={sub.id} style={{ display:"grid",gridTemplateColumns:"70px 1fr 140px 80px 80px",gap:0,padding:"10px 18px",borderBottom:`1px solid ${C.border}`,alignItems:"center" }}>
                        <div style={{ fontSize:11,fontWeight:700,color:C.accent,fontFamily:"monospace" }}>{sub.id}</div>
                        <div>
                          <div style={{ fontSize:12,fontWeight:600,color:C.text }}>{sub.name}</div>
                          <div style={{ fontSize:10,color:C.faint,marginTop:1 }}>{sub.source}</div>
                        </div>
                        <div style={{ fontSize:10,color:C.muted,lineHeight:1.4 }}>{sub.source}</div>
                        <ScoreBar score={sc} w={55}/>
                        <Badge col={sub.type==="country"?C.infoM:sub.type==="questionnaire"?C.warnM:sub.type==="certification"?C.accentM:C.gold}
                          bg={sub.type==="country"?C.infoL:sub.type==="questionnaire"?C.warnL:sub.type==="certification"?C.accentL:C.goldL} sm>
                          {sub.type==="country"?"Land":sub.type==="questionnaire"?"Fragen":sub.type==="certification"?"Zertif.":"Sektor"}
                        </Badge>
                      </div>
                    );
                  })}
                  {supplier.certs.length>0 && (
                    <div style={{ padding:"8px 18px",background:C.accentL,fontSize:11,color:C.accent }}>
                      ✓ Zertifizierungsbonus angewendet: {supplier.certs.join(", ")}
                    </div>
                  )}
                  {!supplier.questReturned && (
                    <div style={{ padding:"8px 18px",background:C.warnL,fontSize:11,color:C.warn }}>
                      ⚠ Fragebogen nicht eingegangen — konservative Schätzung nach §5 LkSG angewendet
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ fontSize:11,color:C.muted }}>
          Methodik v2.1 · 53 Unterindikatoren · ILO NORMLEX · WorldBank WGI · ITUC GRI 2023 · GSI 2023 · TI CPI 2024 · UNEP · 40 Länder · <strong style={{ color:C.text }}>Anwaltlich geprüft</strong>
        </div>
        <Btn sm onClick={()=>toast("Methodik-PDF heruntergeladen")}>Methodik-PDF</Btn>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   11. QUESTIONNAIRE
═══════════════════════════════════════════════════════════ */
const Questionnaire = ({ toast }) => {
  const [preview, setPreview] = useState(false);
  const stats = { sent:SUPPLIERS.length, returned:SUPPLIERS.filter(s=>s.questReturned).length, pending:SUPPLIERS.filter(s=>!s.questReturned).length };
  const questionGroups = [
    {sec:"A — Unternehmensangaben",ref:"",qs:["A.1 Offizielle Firmenbezeichnung und Rechtsform","A.2 Alle Produktionsstandorte (Land, Stadt, Adresse)","A.3 Altersverifikationssystem — Verfahren beschreiben (Ref: §2(1), ILO C138)","A.4 Monitoring für Kinderarbeit in gefährlichen Tätigkeiten (Ref: §2(1b), ILO C182)"]},
    {sec:"B — Zwangsarbeit & Sklaverei",ref:"§2 Abs.2 Nr.3 & 3b",qs:["B.1 Schriftliche Selbstverpflichtung gegen Zwangsarbeit (ILO C29/C105)","B.2 Internes Kontroll- und Meldesystem gegen Sklaverei","B.3 Verträge mit Migrantenarbeitern — Sprache, Verständnis, Freiwilligkeit","B.4 Kaution / Pfand-Systeme (Passport Retention) — vorhanden?"]},
    {sec:"C — Arbeitsrechte",ref:"§2 Abs.2 Nr.5, 6, 7, 8",qs:["C.1 Arbeitsschutzmanagement-System (ISO 45001) — Zertifikat vorhanden?","C.2 Gewerkschaftszugang und Betriebsratsrechte","C.3 Schriftliche Antidiskriminierungsrichtlinie","C.4 Interner Beschwerdekanal für Mitarbeiter","C.5 Lohnabrechnungs-Dokumentation","C.6 Überstundendokumentation und Freiwilligkeit"]},
    {sec:"D — Umwelt & Landrechte",ref:"§2 Abs.2 Nr.9, 10",qs:["D.1 Lohnabrechnungs- und Zahlungsdokumentation","D.2 Gemeinschaftsbetroffenheit und Umweltauswirkungen","D.3 Flächennutzungsnachweis (FPIC-Prozess)","D.4 Wassernutzung und Abwasserbehandlung"]},
    {sec:"E — Sicherheit & Governance",ref:"§2 Abs.2 Nr.11, 12",qs:["E.1 Sicherheitskonzept und Schulung für Sicherheitspersonal","E.2 Menschenrechtliche Grundsatzerklärung"]},
    {sec:"F — Quecksilber (Minamata)",ref:"§2 Abs.3 Nr.1, 2, 3",qs:["F.1 Quecksilberhaltige Produkte im Sortiment","F.2 Nachweis quecksilberfreier Produktionsverfahren","F.3 Unabhängige Verifikation","F.4 Quecksilber-Abfallentsorgungsprotokoll","F.5 Name und Zertifizierung des Entsorgungsdienstleisters"]},
    {sec:"G — POPs / Stockholm",ref:"§2 Abs.3 Nr.4, 5",qs:["G.1 POPs-freie Produktionsprozesse — Nachweis","G.2 POPs-Abfallentsorgungsprotokoll","G.3 Externe Audits zur POPs-Entsorgung"]},
    {sec:"H — Gefährliche Abfälle (Basel)",ref:"§2 Abs.3 Nr.6, 7, 8",qs:["H.1 Exportkontrollsystem für gefährliche Abfälle","H.2 Grenzüberschreitende Rückverfolgbarkeit","H.3 Annex VII Compliance vollständig dokumentiert","H.4 Entsorgungsnachweise lückenlos archiviert","H.5 Importkontrolle & Herkunftszertifikate","H.6 Zolldokumentation und behördliche Genehmigungen"]},
  ];
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14 }}>
        {[{l:"Versendet",v:stats.sent,c:C.text},{l:"Eingegangen",v:stats.returned,c:C.accentM},{l:"Ausstehend",v:stats.pending,c:C.dangerM}].map((k,i)=>(
          <div key={i} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 20px" }}>
            <div style={{ fontSize:10,color:C.faint,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6 }}>{k.l}</div>
            <div style={{ fontSize:30,fontWeight:800,color:k.c,fontFamily:"monospace" }}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden" }}>
        <div style={{ padding:"13px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,color:C.text }}>Fragebogen-Status</div>
          <div style={{ display:"flex",gap:8 }}>
            <Btn sm onClick={()=>setPreview(true)}>Vorlage ansehen</Btn>
            <Btn sm primary onClick={()=>toast("Erinnerung an alle ausstehenden Lieferanten gesendet")}>Alle erinnern</Btn>
          </div>
        </div>
        {SUPPLIERS.map(s=>(
          <div key={s.id} style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 90px 110px",gap:0,padding:"11px 20px",borderBottom:`1px solid ${C.border}`,alignItems:"center" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <span style={{ fontSize:18 }}>{s.flag}</span>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:C.text }}>{s.name}</div>
                <div style={{ fontSize:11,color:C.faint }}>{s.sector}</div>
              </div>
            </div>
            <div style={{ fontSize:11,color:C.muted }}>Versandt: {s.questSent}</div>
            <div style={{ fontSize:11,fontWeight:600,color:s.questReturned?C.accentM:C.dangerM }}>{s.questReturned?`✓ ${s.questReturned}`:"⚠ Ausstehend"}</div>
            <Badge col={calcTotalScore(s)>=70?C.accentM:calcTotalScore(s)>=45?C.warnM:C.dangerM} bg={calcTotalScore(s)>=70?C.accentL:calcTotalScore(s)>=45?C.warnL:C.dangerL} sm>
              {calcTotalScore(s)>=70?"Konform":calcTotalScore(s)>=45?"Prüfung":"Kritisch"}
            </Badge>
            <div style={{ display:"flex",gap:5 }}>
              {!s.questReturned&&<Btn sm danger onClick={()=>toast(`Erinnerung an ${s.name} gesendet`)}>Erinnern</Btn>}
              <Btn sm onClick={()=>toast("PDF heruntergeladen")}>PDF</Btn>
            </div>
          </div>
        ))}
      </div>
      <Modal open={preview} onClose={()=>setPreview(false)} title="Fragebogen-Vorlage — 53 Indikatoren · 20 §2 LkSG Kategorien" wide>
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <div style={{ background:C.accentL,borderRadius:8,padding:12,fontSize:12,color:C.accent }}>Diese Vorlage deckt alle 53 Unterindikatoren der 20 §2-Kategorien ab. Methodik v2.1, anwaltlich geprüft, BAFA-konform.</div>
          {questionGroups.map(g=>(
            <div key={g.sec}>
              <div style={{ fontSize:12,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,display:"flex",gap:8,alignItems:"center" }}>
                {g.sec} {g.ref&&<Badge col={C.infoM} bg={C.infoL} sm>{g.ref}</Badge>}
              </div>
              {g.qs.map((q,i)=><div key={i} style={{ padding:"9px 0",borderBottom:`1px solid ${C.border}`,fontSize:12,color:C.text }}>{q}</div>)}
            </div>
          ))}
          <div style={{ fontSize:11,color:C.faint,fontStyle:"italic" }}>53 Fragen · Ausfülldauer ca. 25–35 Minuten · Vertraulich</div>
        </div>
      </Modal>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   12. REPORTS
═══════════════════════════════════════════════════════════ */
const Reports = ({ toast }) => {
  const reportCards = [
    {id:"annual",title:"LkSG Jahresbericht 2024",desc:"§10 Pflichtbericht inkl. aller Angaben. BAFA-formatkonform, sofort einreichungsbereit.",tag:"Jährlich / Pflicht",ready:true},
    {id:"risk",title:"Risikoanalyse-Bericht (§5)",desc:"Sektorale und länderbezogene Risikodarstellung aller 20 §2-Kategorien mit 53 Unterindikatoren.",tag:"Quartalsweise",ready:true},
    {id:"grundsatz",title:"Grundsatzerklärung (§6 Abs.2)",desc:"Menschenrechtliche Sorgfaltspflichtrichtlinie — inkl. Vorstandsunterzeichnung.",tag:"Einmalig",ready:true},
    {id:"actions",title:"Maßnahmendokumentation (§7)",desc:"Alle Präventions- und Abhilfemaßnahmen, timestamped, revisionssicher.",tag:"Laufend",ready:true},
    {id:"complaint",title:"Beschwerdemechanismus (§8)",desc:"Eingegangene Meldungen, Bearbeitungsstatus, Ergebnisse gem. §8 Abs.5.",tag:"Monatlich",ready:true},
    {id:"csddd",title:"CSDDD Gap-Analyse 2027",desc:"Abweichungsanalyse LkSG ↔ EU-CSDDD-Anforderungen inkl. Aktionsplan.",tag:"Neu",ready:false},
  ];
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,color:C.text }}>LkSG Jahresbericht 2024</div>
          <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>BAFA-Einreichung bereit · Berichtszeitraum 01.01–31.12.2024</div>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <Btn sm onClick={()=>toast("Vorschau geladen")}>Vorschau</Btn>
          <Btn sm primary onClick={()=>toast("Jahresbericht-PDF wird heruntergeladen")}>↓ PDF</Btn>
          <Btn sm onClick={()=>toast("Word-Export gestartet")}>↓ Word</Btn>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14 }}>
        {reportCards.map(r=>(
          <div key={r.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:18,display:"flex",flexDirection:"column" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
              <Badge col={r.ready?C.accentM:C.warnM} bg={r.ready?C.accentL:C.warnL} sm>{r.tag}</Badge>
              {r.ready&&<span style={{ fontSize:10,color:C.accentM }}>✓ Bereit</span>}
            </div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:14,color:C.text,marginBottom:6 }}>{r.title}</div>
            <div style={{ fontSize:12,color:C.muted,lineHeight:1.6,flex:1 }}>{r.desc}</div>
            <Btn full sm primary={r.ready} style={{ marginTop:14 }} onClick={()=>r.ready?toast(`${r.title} generiert`):toast("Demnächst verfügbar")}>
              {r.ready?"Generieren →":"Demnächst"}
            </Btn>
          </div>
        ))}
      </div>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20 }}>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,color:C.text,marginBottom:14 }}>Revisionssicherer Audit Trail (letzte 30 Tage)</div>
        {[
          ["20.02.2025 14:32","admin@firma.de","Risikoanalyse durchgeführt","Hanoi Industrial — Score: 31 (Kritisch)"],
          ["18.02.2025 09:15","admin@firma.de","Fragebogen versendet","Shenzhen ElecParts Ltd."],
          ["15.02.2025 11:48","admin@firma.de","Lieferant hinzugefügt","Atlas Steel Morocco"],
          ["10.02.2025 16:20","admin@firma.de","Bericht generiert","LkSG Risikoanalyse Q4 2024"],
          ["05.02.2025 08:45","admin@firma.de","Maßnahme abgeschlossen","Apex Textiles — Audit angefordert"],
          ["01.02.2025 12:00","system","Automatische Erinnerung","Hanoi Industrial — Fragebogen überfällig"],
        ].map((l,i)=>(
          <div key={i} style={{ display:"grid",gridTemplateColumns:"155px 170px 1fr 1fr",gap:12,padding:"9px 12px",borderRadius:8,background:C.bg,marginBottom:4,fontSize:11 }}>
            <span style={{ color:C.faint,fontFamily:"monospace" }}>{l[0]}</span>
            <span style={{ color:C.muted }}>{l[1]}</span>
            <span style={{ color:C.text,fontWeight:600 }}>{l[2]}</span>
            <span style={{ color:C.muted }}>{l[3]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   13. BILLING
═══════════════════════════════════════════════════════════ */
const Billing = ({ toast }) => {
  const [annual, setAnnual] = useState(false);
  const plans = [
    {id:"starter",name:"Starter",mo:149,sups:25,users:2,features:["20-Kategorien Risikoanalyse","53 Unterindikatoren · 40 Länder","Automatischer Fragebogenversand","2 Berichte/Monat","E-Mail Support","CSDDD-ready Datenstruktur"]},
    {id:"business",name:"Business",mo:399,sups:100,users:10,popular:true,features:["Alles aus Starter","KI-Risikonarrative auf Deutsch","BAFA-Format PDF Export","Maßnahmenplanung & Tracking","Revisionssicherer Audit Trail","Anwaltlich geprüfte Methodik v2.1","Priorität Support"]},
    {id:"enterprise",name:"Enterprise",mo:799,sups:999,users:99,features:["Alles aus Business","Unbegrenzte Lieferanten","SSO / SCIM","Custom Fragebogen","Dedizierter Account Manager","SLA 99,9%","On-Premise Option auf Anfrage"]},
  ];
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20,maxWidth:880 }}>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontSize:14,fontWeight:700,color:C.text }}>Aktueller Plan: Business</div>
          <div style={{ fontSize:11,color:C.muted }}>Nächste Abrechnung: 01. März 2025 · €399/Monat · SEPA-Lastschrift</div>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <Badge col={C.accentM} bg={C.accentL}>Aktiv</Badge>
          <Btn sm onClick={()=>toast("Rechnungen werden angezeigt")}>Rechnungen</Btn>
        </div>
      </div>
      <div style={{ display:"flex",justifyContent:"center",gap:14,alignItems:"center" }}>
        <span style={{ fontSize:13,color:!annual?C.text:C.muted,fontWeight:!annual?700:400 }}>Monatlich</span>
        <div onClick={()=>setAnnual(x=>!x)} style={{ width:44,height:24,borderRadius:12,background:annual?C.accent:C.border,cursor:"pointer",position:"relative",transition:"background 0.2s" }}>
          <div style={{ position:"absolute",top:3,left:annual?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s" }}/>
        </div>
        <span style={{ fontSize:13,color:annual?C.text:C.muted,fontWeight:annual?700:400 }}>Jährlich <Badge col={C.accentM} bg={C.accentL} sm>–20%</Badge></span>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
        {plans.map(p=>{
          const price = annual?Math.round(p.mo*0.8):p.mo;
          const isCurrent = p.id==="business";
          return (
            <div key={p.id} style={{ background:p.popular?C.accent:C.surface,border:`2px solid ${p.popular?C.accent:isCurrent?C.accentM:C.border}`,borderRadius:14,padding:24,position:"relative",display:"flex",flexDirection:"column" }}>
              {p.popular&&<div style={{ position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:C.accentM,color:"#fff",fontSize:9,fontWeight:700,padding:"3px 12px",borderRadius:99,whiteSpace:"nowrap" }}>BELIEBTESTER PLAN</div>}
              {isCurrent&&!p.popular&&<div style={{ position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:C.border,color:C.muted,fontSize:9,fontWeight:700,padding:"3px 12px",borderRadius:99,whiteSpace:"nowrap" }}>IHR PLAN</div>}
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:p.popular?"#fff":C.text,marginBottom:4 }}>{p.name}</div>
              <div style={{ marginBottom:14 }}>
                <span style={{ fontSize:32,fontWeight:800,color:p.popular?"#fff":C.text,fontFamily:"monospace" }}>€{price}</span>
                <span style={{ fontSize:12,color:p.popular?"rgba(255,255,255,0.6)":C.faint }}>/Monat</span>
              </div>
              <div style={{ fontSize:11,color:p.popular?"rgba(255,255,255,0.65)":C.muted,marginBottom:16 }}>Bis zu {p.sups===999?"unlimitierte":p.sups} Lieferanten · {p.users===99?"unlimitierte":p.users} Nutzer</div>
              <div style={{ flex:1,display:"flex",flexDirection:"column",gap:7,marginBottom:20 }}>
                {p.features.map(f=><div key={f} style={{ display:"flex",gap:8,fontSize:12,color:p.popular?"rgba(255,255,255,0.85)":C.muted }}>
                  <span style={{ color:p.popular?"#86efac":C.accentM,fontWeight:700 }}>✓</span>{f}
                </div>)}
              </div>
              <button onClick={()=>toast(isCurrent?"Das ist bereits Ihr Plan":`Stripe Checkout für ${p.name} wird geöffnet`)}
                style={{ padding:"10px 0",borderRadius:8,background:p.popular?"#fff":isCurrent?C.bg:C.accent,color:p.popular?C.accent:isCurrent?C.muted:"#fff",border:`1px solid ${isCurrent?C.border:"transparent"}`,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
                {isCurrent?"Aktueller Plan":`Wechseln zu ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   14. SETTINGS
═══════════════════════════════════════════════════════════ */
const Settings = ({ toast, user, onLogout }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:20,maxWidth:720 }}>
    {[
      {title:"Unternehmensangaben",fields:[["Firmenname",user?.name||"Muster AG"],["Handelsregister","HRB 12345 Berlin"],["Sitz","Berlin, Deutschland"],["Branche","Maschinenbau"],["Mitarbeiterzahl","1.200"]]},
      {title:"Compliance-Konfiguration",fields:[["Berichtsjahr","2024"],["Compliance-Verantwortliche","Maria Müller"],["E-Mail",user?.email||"compliance@muster-ag.de"],["Fragebogen-Frist (Tage)","14"],["Auto-Erinnerung nach (Tage)","7"]]},
    ].map(s=>(
      <div key={s.title} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20 }}>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,color:C.text,marginBottom:16 }}>{s.title}</div>
        <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
          {s.fields.map(([l,v])=>(
            <div key={l} style={{ display:"flex",gap:16,alignItems:"center" }}>
              <div style={{ fontSize:12,color:C.muted,width:220,flexShrink:0 }}>{l}</div>
              <input defaultValue={v} style={{ flex:1,padding:"8px 12px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none",background:C.bg,fontFamily:"'DM Sans',sans-serif" }}/>
            </div>
          ))}
        </div>
        <Btn sm primary onClick={()=>toast("Einstellungen gespeichert")} style={{ marginTop:14 }}>Speichern</Btn>
      </div>
    ))}
    <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20 }}>
      <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,color:C.text,marginBottom:8 }}>Methodik & Rechtlicher Hinweis</div>
      <div style={{ fontSize:12,color:C.muted,lineHeight:1.8 }}>Die Risikobewertungsmethodik basiert auf §2 LkSG (20 gesetzliche Verbotskategorien, 53 Unterindikatoren, 40 Länder) sowie ILO NORMLEX, WorldBank WGI, ITUC GRI 2023, Global Slavery Index, Transparency International CPI, UNEP-Daten. Methodik durch unabhängige Fachanwaltskanzlei geprüft. Sie ersetzt keine individuelle Rechtsberatung.</div>
      <div style={{ marginTop:10,fontSize:10,color:C.faint }}>Version 2.2.0 · Geprüft Januar 2025 · BAFA-konform · CSDDD 2027-ready · 40 Länder</div>
    </div>
    <div style={{ background:C.dangerL,border:`1px solid ${C.dangerM}40`,borderRadius:12,padding:20 }}>
      <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:15,color:C.danger,marginBottom:8 }}>Sitzung beenden</div>
      <div style={{ fontSize:12,color:C.muted,marginBottom:14 }}>Sie werden zur Landing Page weitergeleitet.</div>
      <Btn danger onClick={onLogout}>Abmelden</Btn>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   15. MAIN APP
═══════════════════════════════════════════════════════════ */
const NAV = [
  {id:"dashboard",icon:"◈",label:"Dashboard"},
  {id:"suppliers",icon:"◎",label:"Lieferanten"},
  {id:"risk",icon:"⬡",label:"Risikoanalyse"},
  {id:"questionnaire",icon:"▣",label:"Fragebögen"},
  {id:"reports",icon:"◉",label:"Berichte"},
  {id:"billing",icon:"◆",label:"Abonnement"},
  {id:"settings",icon:"⊕",label:"Einstellungen"},
];

export default function App() {
  const [user, setUser] = useState(null); // null = logged out
  const [page, setPage] = useState("dashboard");
  const [toastMsg, setToastMsg] = useState(null);
  const showToast = msg => setToastMsg(msg);

  const handleLogin = (userData) => { setUser(userData); setPage("dashboard"); };
  const handleLogout = () => { setUser(null); setPage("dashboard"); };

  if (!user) return <LoginScreen onLogin={handleLogin}/>;

  const titles = {dashboard:"Dashboard",suppliers:"Lieferantenverwaltung",risk:"Risikoanalyse · §2 LkSG",questionnaire:"Fragebögen",reports:"Berichte & Dokumente",billing:"Abonnement",settings:"Einstellungen"};
  const pending = SUPPLIERS.filter(s=>!s.questReturned).length;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@500;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    html,body{height:100%;background:${C.bg};}
    ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
    input,select,button{font-family:'DM Sans',sans-serif;}
    select{cursor:pointer;}
  `;

  const views = {
    dashboard:<Dashboard setPage={setPage} toast={showToast}/>,
    suppliers:<Suppliers toast={showToast}/>,
    risk:<RiskAnalysis toast={showToast}/>,
    questionnaire:<Questionnaire toast={showToast}/>,
    reports:<Reports toast={showToast}/>,
    billing:<Billing toast={showToast}/>,
    settings:<Settings toast={showToast} user={user} onLogout={handleLogout}/>,
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ display:"flex",height:"100vh",fontFamily:"'DM Sans',sans-serif",color:C.text,overflow:"hidden" }}>
        {/* Sidebar */}
        <div style={{ width:224,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0 }}>
          <div style={{ padding:"20px 18px 16px",borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:21,color:C.text,letterSpacing:"-0.02em" }}>
              LkSG<span style={{ color:C.accentM }}> Compass</span>
            </div>
            <div style={{ fontSize:9,color:C.faint,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:2 }}>Supply Chain Compliance</div>
          </div>
          <nav style={{ flex:1,padding:"10px 8px",display:"flex",flexDirection:"column",gap:1 }}>
            {NAV.map(n=>(
              <div key={n.id} onClick={()=>setPage(n.id)}
                style={{ display:"flex",alignItems:"center",gap:9,padding:"8px 12px",borderRadius:8,cursor:"pointer",background:page===n.id?C.accentL:"transparent",color:page===n.id?C.accent:C.muted,fontWeight:page===n.id?700:500,fontSize:13,transition:"all 0.1s",position:"relative" }}>
                <span style={{ fontSize:12 }}>{n.icon}</span>
                {n.label}
                {n.id==="questionnaire"&&pending>0&&<span style={{ marginLeft:"auto",background:C.dangerM,color:"#fff",fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:99 }}>{pending}</span>}
              </div>
            ))}
          </nav>
          <div style={{ padding:"12px 18px",borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:30,height:30,borderRadius:7,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800,flexShrink:0 }}>
                {user.name?.[0]?.toUpperCase()||"M"}
              </div>
              <div>
                <div style={{ fontSize:12,fontWeight:700,color:C.text }}>{user.name||"Muster AG"}</div>
                <div style={{ fontSize:10,color:C.accentM,fontWeight:600 }}>Business Plan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
          <div style={{ padding:"13px 26px",borderBottom:`1px solid ${C.border}`,background:C.surface,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0 }}>
            <div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:C.text }}>{titles[page]}</div>
              <div style={{ fontSize:10,color:C.faint,marginTop:1 }}>{user.name||"Muster AG"} · Berichtsjahr 2024 / 2025 · 20 Kategorien · 53 Unterindikatoren · 40 Länder</div>
            </div>
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              {pending>0&&<div style={{ padding:"5px 14px",borderRadius:8,background:C.dangerL,fontSize:11,fontWeight:700,color:C.dangerM }}>⚠ {pending} Fragebogen überfällig</div>}
              <div onClick={()=>setPage("settings")} style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 12px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer",fontSize:12,color:C.muted }}>
                <div style={{ width:22,height:22,borderRadius:5,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:800 }}>{user.name?.[0]?.toUpperCase()||"M"}</div>
                {user.email}
              </div>
            </div>
          </div>
          <div style={{ flex:1,overflow:"auto",padding:22 }}>
            {views[page]}
          </div>
        </div>
      </div>
      {toastMsg&&<Toast msg={toastMsg} onDone={()=>setToastMsg(null)}/>}
    </>
  );
}
