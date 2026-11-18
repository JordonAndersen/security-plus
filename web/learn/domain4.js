// Learn pages — Domain 4: Security Operations.
PBQ.addLearn([
{ id: "4.1",
  summary: "Securing the things you run: secure baselines, hardening each kind of device, wireless design, mobile device management, application security and sandboxing.",
  concepts: [
    ["Secure baselines", "Establish (from CIS/vendor benchmarks), deploy (GPO, MDM, IaC), maintain (scan and fix drift)."],
    ["Hardening targets", "Mobile, workstations, switches, routers, cloud, servers, ICS/SCADA, embedded, RTOS, IoT — each with its own checklist."],
    ["Site survey / heat map", "Measure signal strength before placing access points."],
    ["WPA3", "SAE replaces the PSK handshake (resists offline guessing); Enterprise mode uses 802.1X/RADIUS; PMF stops deauth attacks."],
    ["MDM", "Central policy, encryption, app control and remote wipe for phones and tablets."],
    ["BYOD / COPE / CYOD", "Personal device / company-owned, personally enabled / choose from an approved list."],
    ["Input validation / secure cookies", "Validate server-side; cookies with Secure, HttpOnly, SameSite."],
    ["Static vs dynamic analysis", "SAST reads source without running it; DAST tests the running app."],
    ["Code signing", "Proves who published the code and that it wasn't altered."],
    ["Sandboxing", "Run untrusted code in isolation to observe it safely."]
  ],
  traps: [
    "SAST vs DAST — 'without running it' = static.",
    "The Secure attribute keeps a cookie on HTTPS; HttpOnly keeps it from JavaScript.",
    "WPS should be disabled — its PIN can be brute-forced.",
    "COPE = company owns it; BYOD = employee owns it."
  ],
  tips: ["First step for baselines is establishing them; you can't deploy or check drift without one."] },

{ id: "4.2",
  summary: "Managing assets from purchase to disposal so nothing is unknown, unowned or improperly destroyed.",
  concepts: [
    ["Acquisition / procurement", "Build security in before purchase: requirements, vendor review, approved lists."],
    ["Assignment / accounting", "Every asset has an owner and a classification."],
    ["Inventory / enumeration", "Keep a list; discover what's actually on the network to keep it accurate."],
    ["Sanitization", "Overwrite or crypto-erase so data can't be recovered; degaussing works only on magnetic media."],
    ["Destruction", "Shred, pulverize or incinerate — for the most sensitive data."],
    ["Certification", "Certificate of sanitization/destruction as compliance evidence."],
    ["Data retention", "Keep data as long as required, then dispose of it."]
  ],
  traps: [
    "SSDs can't be degaussed — use crypto-erase/secure erase or destruction.",
    "Decommissioning isn't done until DNS records, firewall rules, monitoring and accounts are removed.",
    "Shadow IT assets are unknown, so they miss patching, monitoring and retention rules."
  ],
  tips: ["You can't protect what you don't know you have — asset inventory is the foundation of vulnerability management."] },

{ id: "4.3",
  summary: "Finding, analyzing, fixing and verifying vulnerabilities — and reporting on it.",
  concepts: [
    ["Identification", "Vulnerability scans, SAST/DAST, package monitoring, threat feeds (OSINT, paid, ISACs, dark web), pen tests, bug bounties, audits."],
    ["Credentialed vs non-credentialed scan", "Credentialed logs in and sees missing patches and local config — more accurate."],
    ["False positive / false negative", "Reported but not real / real but not reported."],
    ["CVE / CVSS", "CVE identifies a specific vulnerability; CVSS scores severity 0–10."],
    ["Prioritization", "CVSS adjusted for exposure, environment, business impact and risk tolerance."],
    ["Remediation", "Patch; or compensating controls, segmentation, insurance, or a documented exception."],
    ["Validation", "Rescan, audit and verify that the fix worked."],
    ["ISAC", "Sector-specific organization where members share threat intelligence."]
  ],
  traps: [
    "A closed ticket or the owner's word isn't validation — rescan.",
    "Can't patch for 90 days → compensating controls plus a documented exception, not ignoring it.",
    "CVE is an ID; CVSS is a score. STIX/TAXII are formats/transport for sharing threat intel."
  ],
  tips: ["Highest priority = high severity × exposed × critical asset × actively exploited."] },

{ id: "4.4",
  summary: "Watching systems, applications and infrastructure, turning logs into useful alerts, and responding well.",
  concepts: [
    ["Log aggregation", "Collect logs from many sources centrally (usually a SIEM)."],
    ["Alerting / tuning", "Rules that fire on suspicious patterns; tune narrowly to cut false positives without blind spots."],
    ["Archiving", "Move older logs to cheap long-term storage for compliance."],
    ["Quarantine", "Isolate a suspicious file or host during response."],
    ["Validation of remediation", "Confirm the fix before closing the alert."],
    ["SIEM vs SOAR", "SIEM correlates and alerts; SOAR orchestrates and automates the response."],
    ["SCAP / benchmarks", "Automated configuration checks against CIS benchmarks (OVAL, XCCDF)."],
    ["Agent vs agentless", "Agents give deeper continuous data; agentless is easier to deploy."],
    ["NetFlow vs packet capture", "NetFlow = who, when, how much; PCAP = full content."],
    ["SNMP traps", "Devices push alerts to the manager without being polled."]
  ],
  traps: [
    "Never disable a noisy rule or stop collecting logs — tune it with specific exclusions.",
    "A missed attack is a false negative — the most dangerous outcome.",
    "Volume anomalies without storing payloads → NetFlow, not PCAP."
  ],
  tips: ["Detection (SIEM) and response (SOAR) are complementary — questions often test the difference."] },

{ id: "4.5",
  summary: "The enterprise controls you configure: firewalls, IDS/IPS, web and DNS filtering, OS security, secure protocols, email authentication, FIM, DLP, NAC, EDR/XDR and user behavior analytics.",
  concepts: [
    ["Firewall rules", "Ordered, first match wins, implicit deny at the end; screened subnets for public services."],
    ["Web filtering", "Agent-based (works off-network) or centralized proxy; URL categories, reputation, block rules."],
    ["DNS filtering", "Block known-bad domains at the resolver."],
    ["Group Policy / SELinux", "Centralized Windows settings / Linux mandatory access control."],
    ["Secure protocols", "SSH (22) not Telnet, HTTPS (443), LDAPS (636), SFTP, SNMPv3, IMAPS (993), POP3S (995)."],
    ["SPF / DKIM / DMARC", "Allowed senders / message signature / policy that tells receivers what to do on failure."],
    ["FIM", "Alerts when critical files change."],
    ["DLP", "Detects and blocks sensitive data leaving (email, upload, USB)."],
    ["NAC", "Checks device identity and posture before network access; agent-based or agentless."],
    ["EDR / XDR", "Endpoint behavior detection / correlation across endpoint, email, identity, cloud."],
    ["UBA", "Baselines normal user behavior and flags deviations (3 a.m., 40 GB)."]
  ],
  traps: [
    "DMARC is the policy (p=reject); SPF and DKIM are the checks it relies on.",
    "Fileless PowerShell malware is caught by EDR behavior detection, not AV signatures.",
    "Rule order matters — a broad allow above a specific deny makes the deny useless."
  ],
  tips: ["Know the secure replacement and its port for every insecure protocol."] },

{ id: "4.6",
  summary: "Identity and access management: lifecycle, federation and SSO, access control models, MFA, passwords and privileged access.",
  concepts: [
    ["Provisioning / deprovisioning", "Create and remove access, ideally automated from HR as the source of truth."],
    ["Identity proofing / attestation", "Verify who someone is before issuing credentials / periodically confirm access is still needed."],
    ["Federation / SSO", "Trust identities across organizations / one login for many apps."],
    ["SAML / OAuth / OIDC / LDAP", "SAML: XML assertions for web SSO. OAuth: delegated authorization without sharing passwords. LDAP: directory lookups."],
    ["MAC / DAC / RBAC / ABAC / rule-based", "Labels + clearances / owner decides / by role / by many attributes / by global rules like time of day."],
    ["MFA factors", "Know (password), have (token, smart card), are (biometrics), somewhere you are (location)."],
    ["Phishing-resistant MFA", "FIDO2 security keys and PIV smart cards — bound to the real site or certificate."],
    ["Password practices", "Length over complexity, no reuse, screen against breached lists, password managers, passwordless."],
    ["PAM", "Vaulting, rotation, just-in-time elevation, ephemeral credentials, session recording."],
    ["Kerberos / TACACS+ / RADIUS", "Tickets (TGT) for SSO / per-command admin authorization on TCP 49 / network access AAA on UDP 1812/1813."]
  ],
  traps: [
    "Password + PIN or two biometrics isn't multifactor — both are the same factor type.",
    "OAuth is authorization (delegated access), not authentication; SAML is for web SSO.",
    "Labels and clearances → MAC, even if job roles are mentioned.",
    "Department + device + time + location → ABAC.",
    "Number matching and FIDO2 stop MFA fatigue; SMS makes things weaker."
  ],
  tips: ["Moving departments without an access review → privilege creep."] },

{ id: "4.7",
  summary: "Using automation and orchestration to make security faster and more consistent — and the risks that come with it.",
  concepts: [
    ["Use cases", "User and resource provisioning, guard rails, security groups, ticket creation, escalation, enabling/disabling services and access, CI/testing, API integrations."],
    ["Guard rails", "Automatically block insecure configurations (e.g., SSH open to 0.0.0.0/0)."],
    ["Benefits", "Efficiency, enforced baselines, standard configurations, secure scaling, faster reaction, workforce multiplier, less burnout."],
    ["Considerations", "Complexity, cost, single point of failure, technical debt, ongoing supportability."]
  ],
  traps: [
    "Automated responses an attacker can trigger (lock accounts after failures) can become a denial of service.",
    "Undocumented scripts nobody understands = technical debt.",
    "Faster reaction time is a benefit, not a risk."
  ],
  tips: ["High-impact automated actions need guard rails, testing and sometimes human approval."] },

{ id: "4.8",
  summary: "Incident response: the process, training and testing, root cause analysis, threat hunting and digital forensics.",
  concepts: [
    ["Process", "Preparation → detection → analysis → containment → eradication → recovery → lessons learned."],
    ["Preparation", "IR plan, roles and authority, contacts, tools — practiced in tabletop exercises."],
    ["Containment first", "Isolate affected hosts before reimaging or attribution."],
    ["Root cause analysis", "Find how it really started so it doesn't recur."],
    ["Threat hunting", "Proactively search for attackers that alerts missed."],
    ["Legal hold", "Suspend deletion of relevant data when litigation is expected."],
    ["Chain of custody", "Record everyone who handled evidence, when and why."],
    ["Order of volatility", "CPU registers/cache → RAM → disk → remote logs → archives/backups."],
    ["Acquisition / preservation", "Bit-for-bit image with a write blocker; hash at acquisition and analysis."],
    ["E-discovery", "Identify, collect and produce electronic information for legal matters."]
  ],
  traps: [
    "Reimaging first destroys evidence and doesn't stop spread — contain first.",
    "Matching hashes, not timestamps, prove an image is unchanged.",
    "Legal hold comes before e-discovery production."
  ],
  tips: ["'FIRST' questions almost always want containment (during an incident) or the most volatile data (during forensics)."] },

{ id: "4.9",
  summary: "Choosing the right data source to support an investigation: firewall, application, endpoint, OS, IDS/IPS and network logs, metadata, scans, reports, dashboards and packet captures.",
  concepts: [
    ["Firewall logs", "Allowed/denied connections — who talked to whom."],
    ["Application logs", "What users and attackers did inside the app (web requests, errors)."],
    ["Endpoint / OS logs", "Processes, services, logons (Windows 4624/4625, 4648, 4698), file changes."],
    ["IDS/IPS logs", "Signature and anomaly alerts."],
    ["Network logs / NetFlow", "Traffic metadata: volumes, timing, destinations."],
    ["Packet capture", "Full payload — the only source that shows what was actually sent."],
    ["Metadata", "Email headers, file properties, timestamps."],
    ["Vulnerability scans / reports / dashboards", "Context: what was exposed and when."]
  ],
  traps: [
    "Full content of a C2 exchange → PCAP; NetFlow has no payload.",
    "Valid stolen credentials don't trigger AV or firewall alerts — use file audit logs + UBA.",
    "Who changed a firewall rule → the device's audit/admin log, not traffic logs."
  ],
  tips: ["Match the question's verb: 'who changed' → audit log; 'what was sent' → PCAP; 'how much / how often' → NetFlow."] }
]);
