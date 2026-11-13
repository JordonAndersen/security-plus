// Domain 5.0 — Security Program Management & Oversight
PBQ.add([
{
  id: "risk", domain: 5, time: 3, type: "grid",
  title: "Quantitative risk calculation",
  scenario: `<p>A file server is valued at <b>$120,000</b>. A flood would destroy <b>25%</b> of its value. The facility expects a flood <b>once every 2 years</b>. A flood barrier would cost <b>$20,000 per year</b>.</p>`,
  task: "Enter the values (numbers only) and make the call.",
  cols: ["Answer"],
  opts: [null],
  rowOpts: { 4: ["Yes","No"] },
  rows: [
    { l: "Exposure factor (as a decimal)", a: [0.25], w: "25% = 0.25" },
    { l: "SLE ($)", a: [30000], w: "SLE = AV × EF = 120,000 × 0.25 = 30,000" },
    { l: "ARO", a: [0.5], w: "Once every 2 years = 0.5" },
    { l: "ALE ($)", a: [15000], w: "ALE = SLE × ARO = 30,000 × 0.5 = 15,000" },
    { l: "Is the $20,000/yr barrier cost-justified?", a: ["No"], w: "The control costs more per year ($20K) than the expected annual loss ($15K)." }
  ],
  explain: "SLE = AV × EF, and ALE = SLE × ARO. A control makes financial sense when its annual cost is less than the ALE it removes."
},
{
  id: "data-roles", domain: 5, time: 3, type: "grid",
  title: "Data roles and risk responses",
  scenario: `<p>Your organization is preparing for a privacy audit. Identify each role, then the risk response the leadership team chose for each risk.</p>`,
  task: "Select the data role or risk strategy for each item.",
  cols: ["Answer"],
  opts: [["Data owner","Data custodian","Data controller","Data processor","Data subject"]],
  rowOpts: {
    5: ["Accept","Avoid","Transfer","Mitigate"],
    6: ["Accept","Avoid","Transfer","Mitigate"],
    7: ["Accept","Avoid","Transfer","Mitigate"],
    8: ["Accept","Avoid","Transfer","Mitigate"]
  },
  rows: [
    { l: "VP of Sales, who is accountable for classifying CRM data and approving access", a: ["Data owner"], w: "A senior business leader accountable for the data." },
    { l: "DBA who runs backups and applies the access controls the owner approved", a: ["Data custodian"], w: "Handles day-to-day technical care of the data." },
    { l: "The company, which decides why and how customer personal data is processed", a: ["Data controller"], w: "Determines the purposes and means of processing (a GDPR term)." },
    { l: "A payroll vendor that processes employee data on the company's behalf", a: ["Data processor"], w: "Acts on the controller's instructions." },
    { l: "The customer whose personal data is collected", a: ["Data subject"], w: "The individual the data is about." },
    { l: "Buy a cyber insurance policy to cover breach costs", a: ["Transfer"], w: "Shifts the financial impact to a third party." },
    { l: "Stop offering a legacy feature that requires storing card numbers", a: ["Avoid"], w: "Eliminates the activity that creates the risk." },
    { l: "Deploy MFA and EDR to reduce the likelihood of account takeover", a: ["Mitigate"], w: "Controls reduce likelihood or impact." },
    { l: "Document that a low-impact risk is within appetite and take no action", a: ["Accept"], w: "A formal decision, recorded in the risk register." }
  ],
  explain: "Owner = accountable. Custodian = hands-on technical care. Controller decides, processor acts. Insurance = transfer. Stopping the activity = avoid."
},
{
  id: "agreements", domain: 5, time: 3, type: "grid",
  title: "Vendor agreements and documents",
  scenario: `<p>Procurement is onboarding several vendors and partners and asks which document fits each need.</p>`,
  task: "Match each need to the right agreement.",
  cols: ["Agreement"],
  opts: [["SLA","MOU","MOA","MSA","SOW","NDA","BPA","Rules of engagement"]],
  rows: [
    { l: "Guarantees 99.9% uptime, with service credits if it's missed", a: ["SLA"], w: "Service-level agreement: measurable performance plus penalties." },
    { l: "Non-binding statement of intent to cooperate between two agencies", a: ["MOU"], w: "Memorandum of understanding: informal, usually not legally binding." },
    { l: "A more formal, binding agreement on shared responsibilities between two organizations", a: ["MOA"], w: "Memorandum of agreement: more formal than an MOU, with specific conditions." },
    { l: "Overall legal terms that will govern all future projects with an MSP", a: ["MSA"], w: "Master service agreement: the umbrella contract." },
    { l: "Specific deliverables, timeline, and cost for one network upgrade project", a: ["SOW"], w: "Statement of work, often issued under an MSA." },
    { l: "Protects confidential information shared during a vendor evaluation", a: ["NDA"], w: "Non-disclosure agreement." },
    { l: "Two companies set terms for a joint venture, including profit sharing and responsibilities", a: ["BPA"], w: "Business partners agreement." },
    { l: "Defines the scope, testing windows, and allowed techniques for a penetration test", a: ["Rules of engagement"], w: "Sets the authorization and boundaries for testers." }
  ],
  explain: "MSA = umbrella terms. SOW = a specific project. SLA = measurable service levels. MOU is informal and MOA is formal. RoE = the pen test boundaries."
}
]);
