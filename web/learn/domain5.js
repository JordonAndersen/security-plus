// Learn pages — Domain 5: Security Program Management and Oversight.
PBQ.addLearn([
{ id: "5.1",
  summary: "Security governance: the hierarchy of documents, external considerations, governance structures and data roles.",
  concepts: [
    ["Policy", "High-level, mandatory statement of intent (AUP, information security, BC/DR, IR, SDLC, change management)."],
    ["Standard", "Mandatory specifics that implement a policy (e.g., 'AES-256 for data at rest', password standard)."],
    ["Procedure", "Step-by-step instructions (onboarding/offboarding, playbooks)."],
    ["Guideline", "Recommended, not mandatory."],
    ["External considerations", "Regulatory, legal, industry, local/regional, national, global requirements."],
    ["Governance structures", "Boards, committees, government entities; centralized vs decentralized."],
    ["Data roles", "Owner (accountable), controller (decides why/how), processor (acts for the controller), custodian/steward (day-to-day care)."],
    ["Monitoring and revision", "Review documents regularly and after major changes."]
  ],
  traps: [
    "Standard vs guideline — standards are mandatory; guidelines recommend.",
    "Procedure vs policy — step-by-step = procedure.",
    "Mandatory vacation and job rotation are administrative controls that uncover fraud."
  ],
  tips: ["If a document says exactly how (specific algorithm, length, setting), it's a standard."] },

{ id: "5.2",
  summary: "The risk management process: identify, assess, analyze (qualitatively or quantitatively), record, decide how to treat each risk, report, and set recovery targets with a business impact analysis.",
  concepts: [
    ["Assessment frequency", "Ad hoc, recurring, one-time, continuous (automated, real time)."],
    ["Qualitative", "Likelihood × impact ratings (heat map)."],
    ["Quantitative", "SLE = asset value × exposure factor; ALE = SLE × ARO."],
    ["Risk register", "Risks, owners, ratings, KRIs, thresholds and treatment status."],
    ["Appetite vs tolerance", "Appetite: how much risk you'll pursue (expansionary, conservative, neutral). Tolerance: acceptable deviation."],
    ["Treatments", "Transfer (insurance), accept (including exceptions/exemptions), avoid (stop the activity), mitigate (controls)."],
    ["Residual risk", "What remains after controls."],
    ["BIA metrics", "MTD → RTO (time to restore, < MTD), RPO (acceptable data loss), MTTR (average repair time), MTBF (average time between failures)."],
    ["KRI", "A metric that warns when a specific risk is rising, trended against a threshold."]
  ],
  traps: [
    "ARO 'once every 4 years' = 0.25 — divide, don't multiply.",
    "Control value = (ALE before − ALE after) − annual control cost.",
    "Insurance transfers the financial impact; it doesn't mitigate likelihood.",
    "Acceptance must be documented and owned — ignoring a risk isn't acceptance."
  ],
  tips: ["Write the formulas down at the start of the exam: SLE = AV × EF, ALE = SLE × ARO."] },

{ id: "5.3",
  summary: "Managing risk from vendors and partners: assessment, selection, agreements, monitoring and questionnaires.",
  concepts: [
    ["Vendor assessment", "Pen tests, right-to-audit clauses, evidence of internal audits, independent assessments (SOC 2), supply chain analysis."],
    ["Due diligence", "Investigate before selecting (financials, security, breach history, conflicts of interest)."],
    ["SLA", "Measurable service levels (uptime) with penalties."],
    ["MOU vs MOA", "Statement of intent (usually not binding) vs more formal, specific responsibilities."],
    ["MSA / SOW / WO", "Overall contract terms / one project's deliverables under the MSA."],
    ["NDA / BPA", "Confidentiality / business partnership terms."],
    ["Questionnaires", "Vendors' written answers about their security practices."],
    ["Rules of engagement", "Scope and limits for testing a vendor (or by a vendor)."],
    ["Ongoing monitoring", "Reassess vendors over time; limit and monitor their access (least privilege, JIT, MFA)."]
  ],
  traps: [
    "SOC 2 Type I = design at a point in time; Type II = operating effectiveness over a period.",
    "A right-to-audit clause complements SOC reports — it lets you verify directly.",
    "Outsourcing doesn't transfer accountability."
  ],
  tips: ["Match the document to its purpose: uptime → SLA, project deliverables → SOW, confidentiality → NDA."] },

{ id: "5.4",
  summary: "Compliance: reporting, consequences of non-compliance, monitoring, and privacy obligations.",
  concepts: [
    ["Reporting", "Internal (to leadership) and external (to regulators, customers, card brands)."],
    ["Consequences", "Fines, sanctions, reputational damage, loss of license, contractual impacts (e.g., losing card acceptance)."],
    ["Due diligence / due care", "Research before acting / ongoing responsible action."],
    ["Attestation / acknowledgment", "Formal statements that controls work; employees signing they read the policy."],
    ["Regulations", "PCI DSS (cardholder data), HIPAA (US health), GDPR (EU personal data), FERPA (US student records)."],
    ["Privacy roles", "Data subject (the person), controller (decides), processor (acts for the controller)."],
    ["Data inventory and retention", "Know what personal data you hold and how long you keep it."],
    ["Right to be forgotten", "A data subject can ask for their personal data to be erased (GDPR)."]
  ],
  traps: [
    "The controller stays accountable even when a processor does the work.",
    "PCI DSS is enforced by contract with the card brands/acquirer, not by a government regulator.",
    "MTBF, ALE and RTO are metrics — not consequences of non-compliance."
  ],
  tips: ["Pick the regulation by data type: cards → PCI DSS, health → HIPAA, EU personal → GDPR, students → FERPA."] },

{ id: "5.5",
  summary: "Audits and assessments: attestation, internal and external reviews, penetration testing approaches and reconnaissance.",
  concepts: [
    ["Attestation", "Management's formal assertion about controls, backed by an auditor's opinion."],
    ["Internal", "Compliance checks, the audit committee, self-assessments."],
    ["External", "Regulatory examinations, independent third-party audits — the most independent assurance."],
    ["Known / partially known / unknown environment", "Full details / some details (IP ranges, a user account) / nothing but the name."],
    ["Offensive / defensive / integrated", "Red team attacks / blue team detects and responds / purple team works together."],
    ["Physical testing", "Tailgating, badge cloning, planting devices."],
    ["Passive vs active reconnaissance", "Public sources only (OSINT, DNS records) vs touching the target (port scans)."],
    ["Rules of engagement", "Scope, timing, techniques and limits — testing outside them can be illegal."]
  ],
  traps: [
    "Internal audit reports to the audit committee to stay independent.",
    "Port scanning is active reconnaissance even though it's 'just looking'.",
    "Exploiting something out of scope violates the rules of engagement, not the NDA."
  ],
  tips: ["Independence increases from self-assessment → internal audit → third-party audit."] },

{ id: "5.6",
  summary: "Security awareness: phishing programs, recognizing anomalous behavior, user guidance and training, and measuring whether it works.",
  concepts: [
    ["Phishing campaigns", "Simulations to practice recognizing and reporting phishing."],
    ["Recognizing phishing", "Urgency, mismatched senders, unexpected attachments, links that don't match their text."],
    ["Responding to reports", "Analyze reported messages, purge malicious ones from all mailboxes, thank the reporter."],
    ["Anomalous behavior", "Risky, unexpected or unintentional behavior — report it, don't investigate yourself."],
    ["Training topics", "Policies/handbooks, situational awareness (tailgating), insider threat, password management, removable media and cables, social engineering, operational security, hybrid/remote work."],
    ["Initial vs recurring", "Training at onboarding, then periodically."],
    ["Measuring", "Trend phishing click and report rates over time."]
  ],
  traps: [
    "Publicly shaming clickers reduces reporting — avoid blame culture.",
    "A falling click rate with flat reporting means you're missing early warnings.",
    "Hours spent in training or slides presented aren't effectiveness metrics."
  ],
  tips: ["The goal is behavior change: more reports, fewer clicks, faster reporting."] }
]);
