// Learn pages — Domains 1 and 2. One entry per SY0-701 objective.
// Fields: summary, concepts [[term, meaning]], traps [look-alikes and how to tell them apart], tips [exam advice].
PBQ.addLearn([
{ id: "1.1",
  summary: "Every control can be described two ways: its category (what implements it — technology, management, day-to-day operations, or something physical) and its type (what it does — prevent, deter, detect, correct, compensate, or direct). Questions often hinge on one word in the scenario.",
  concepts: [
    ["Technical", "Implemented by systems: firewall rules, encryption, MFA, EDR, a GPO that locks screens."],
    ["Managerial", "Governance and oversight: policies, risk assessments, security planning, vendor reviews."],
    ["Operational", "Carried out by people as part of daily work: awareness training, log reviews, guards following procedures."],
    ["Physical", "Tangible barriers and devices: fences, locks, bollards, lighting, access control vestibules."],
    ["Preventive", "Stops the incident from happening: a deny rule, a door lock, MFA."],
    ["Deterrent", "Discourages an attacker but doesn't stop them: warning signs, lighting, visible guards."],
    ["Detective", "Notices something happened or is happening: IDS, log review, motion sensors, recording cameras."],
    ["Corrective", "Fixes or restores after the fact: restoring a backup, reimaging, patching after an exploit."],
    ["Compensating", "An alternative used because the required control can't be implemented: VPN + MFA in front of a legacy app that can't do MFA."],
    ["Directive", "Tells people what to do: policies, procedures, 'Authorized personnel only' instructions."]
  ],
  traps: [
    "Deterrent vs preventive — a sign or light only discourages; a lock or fence physically stops.",
    "Camera vs sign — the camera is detective; the 'under surveillance' sign is deterrent.",
    "Detective vs corrective — the FIM alert is detective; the automatic restore that follows is corrective.",
    "Compensating is only correct when the scenario says the primary control can't be used.",
    "A written policy is managerial + directive; the same rule enforced by a GPO is technical + preventive."
  ],
  tips: ["Ask two questions: who or what implements it (category), and what does it do, and when (type)?", "If a control fits several types, choose the one the scenario emphasizes — usually the words right next to the control."] },

{ id: "1.2",
  summary: "The building blocks everything else rests on: the CIA triad, non-repudiation, AAA, gap analysis, Zero Trust, physical security, and deception technology.",
  concepts: [
    ["Confidentiality / Integrity / Availability", "Keep data secret, keep it accurate and unaltered, keep it accessible when needed."],
    ["Non-repudiation", "Someone can't deny an action — needs individual identities plus digital signatures or tamper-resistant logs."],
    ["AAA", "Authentication (prove who you are), authorization (what you may do), accounting (record what you did)."],
    ["Gap analysis", "Compare current controls to a target framework or baseline to find what's missing."],
    ["Zero Trust", "Never trust by network location; verify every request using identity, device health and context, continuously."],
    ["Policy engine / administrator", "Control plane: the PE decides, the PA tells the enforcement point to allow or end the session."],
    ["Policy enforcement point (PEP)", "Data plane: sits in the traffic path and enforces the decision."],
    ["Physical controls", "Bollards (vehicles), access control vestibules (tailgating), fencing, lighting, guards, badges, sensors (infrared, pressure, microwave, ultrasonic)."],
    ["Honeypot / honeynet", "A decoy system / a decoy network that attracts and studies attackers."],
    ["Honeyfile / honeytoken", "A decoy file / a fake credential or data record — any use is a high-fidelity alert."]
  ],
  traps: [
    "Integrity vs confidentiality — records changed but not disclosed is an integrity failure.",
    "PE vs PEP — the PE decides; the PEP enforces. Candidates pick the PEP because it 'blocks'.",
    "Authentication vs authorization — logging in is authentication; checking whether you may open the folder is authorization.",
    "Shared admin accounts destroy non-repudiation no matter how strong the password is.",
    "Deception detects and gives early warning; it doesn't prevent anything."
  ],
  tips: ["Zero Trust questions: look for 'continuous', 'device posture', 'every request' and 'no implicit trust'.", "Accounting = logging. If the question is about proving what someone did, think accounting + non-repudiation."] },

{ id: "1.3",
  summary: "Change management keeps changes from causing outages or security gaps. Know the business process, the technical implications, and the documentation that has to follow.",
  concepts: [
    ["Approval / CAB", "A change advisory board reviews risk, impact and timing before approving."],
    ["Ownership", "One person or team is accountable for the change and its outcome."],
    ["Stakeholders", "Everyone affected is identified and consulted or informed."],
    ["Impact analysis", "What will this change affect, how badly, and what's the risk of not doing it?"],
    ["Test results", "Evidence the change worked in a test environment before production."],
    ["Backout plan", "How to roll back quickly if the change fails — the item that most directly limits an outage."],
    ["Maintenance window", "A scheduled low-impact time for the change."],
    ["Technical implications", "Allow/deny lists, restricted activities, downtime, service and application restarts, legacy applications, dependencies."],
    ["Documentation", "Update diagrams, policies and procedures so they match reality."],
    ["Version control", "Track every revision of code or configuration so changes are reviewable and reversible."]
  ],
  traps: [
    "Backout plan vs impact analysis — impact analysis predicts damage; the backout plan undoes it.",
    "New software blocked after a change? The allow list wasn't updated (a technical implication).",
    "A change that broke something that relies on the changed component missed a dependency.",
    "Emergency changes still get documented and reviewed afterwards — never skipped."
  ],
  tips: ["'MOST directly reduces the outage risk' → backout plan.", "If a question mentions a legacy app, think dependencies and restarts."] },

{ id: "1.4",
  summary: "Pick the right cryptographic tool for the job: symmetric vs asymmetric, hashing vs encryption, where keys live, how certificates are issued and revoked, and when obfuscation is enough.",
  concepts: [
    ["Symmetric", "One shared key, fast, for bulk data (AES). Key distribution is the hard part."],
    ["Asymmetric", "Public/private key pair (RSA, ECC) for key exchange and signatures. ECC = same strength, smaller keys."],
    ["Key exchange / PFS", "Ephemeral (EC)DHE creates per-session keys, so a stolen long-term key can't decrypt old sessions."],
    ["Hashing", "One-way fingerprint for integrity (SHA-256). Not encryption, not reversible."],
    ["Salting / key stretching", "Salt defeats precomputed tables; PBKDF2/bcrypt deliberately slow down password guessing."],
    ["Digital signature", "Hash signed with the private key — proves integrity and origin (non-repudiation)."],
    ["Encryption levels", "Full-disk, partition, volume, file, database, record/field — protect only what's needed."],
    ["TPM / HSM / KMS / secure enclave", "TPM: chip in one device. HSM: tamper-resistant appliance for many keys. KMS: cloud key service. Enclave: protects data in use."],
    ["Obfuscation", "Steganography (hide data in data), tokenization (swap for a token), masking (hide part of a value)."],
    ["Certificates", "CSR → CA signs; root of trust; wildcard (*.example.com, one level) vs SAN (many names); self-signed for labs."],
    ["Revocation", "CRL is a downloaded list; OCSP checks one certificate in real time; stapling lets the server attach the OCSP response."],
    ["Blockchain", "Append-only public ledger; each block includes the previous block's hash."]
  ],
  traps: [
    "Hashing vs encryption — hashes can't be decrypted; if you need the data back, it's encryption.",
    "Wildcard vs SAN — a wildcard covers one level of one domain; different domains need SAN entries.",
    "TPM vs HSM — one laptop's keys → TPM; thousands of keys for high-volume signing → HSM.",
    "Signing isn't encryption, and a valid signature says nothing about whether the code is safe.",
    "Tokenization vs masking — tokenization replaces the whole value (reversible via the vault); masking hides part of it."
  ],
  tips: ["Match the requirement word: 'integrity' → hash; 'confidentiality' → encrypt; 'non-repudiation' → sign.", "AEAD (AES-GCM) = encryption + integrity in one; ECB is never the right answer."] },

{ id: "2.1",
  summary: "Who attacks and why. SY0-701 describes actors by three attributes — internal or external, resources and funding, and sophistication — and lists their typical motivations.",
  concepts: [
    ["Nation-state", "Highest funding and sophistication; espionage, war, critical infrastructure; long, quiet APT campaigns."],
    ["Unskilled attacker", "Uses ready-made tools without understanding them; low funding and skill."],
    ["Hacktivist", "Driven by a cause; wants visibility (defacement, leaks, DDoS)."],
    ["Insider threat", "Internal, already has access; motives include revenge and financial gain."],
    ["Organized crime", "Profit-driven, organized and funded — ransomware, fraud, extortion."],
    ["Shadow IT", "Employees using unapproved technology; usually unintentional but creates unmanaged risk."],
    ["Attributes", "Internal/external, resources/funding, level of sophistication/capability."],
    ["Motivations", "Data exfiltration, espionage, service disruption, blackmail, financial gain, philosophical/political beliefs, ethical, revenge, chaos, war."]
  ],
  traps: [
    "Long dwell time + stealth + IP theft → nation-state APT, not a hacktivist (who wants publicity).",
    "Publish-or-pay threats → blackmail; the attacker also wants money, but the mechanism is extortion.",
    "Shadow IT is a threat actor because of the risk it creates, not because of intent.",
    "An insider's defining attribute is access, not funding."
  ],
  tips: ["Read for the motive word: protest → hacktivist, profit → organized crime, grievance → insider, geopolitics → nation-state."] },

{ id: "2.2",
  summary: "How attacks get in: message, file, voice, removable media, vulnerable or unsupported software, insecure networks, open ports, default credentials, the supply chain — and the social engineering techniques that exploit people.",
  concepts: [
    ["Message-based", "Email, SMS (smishing), instant messaging; image- and file-based lures."],
    ["Voice", "Vishing — phone calls, often combined with pretexting."],
    ["Removable devices", "USB drives and malicious cables that act as keyboards (HID)."],
    ["Vulnerable / unsupported software", "Unpatched or end-of-life systems; client-based vs agentless exposure."],
    ["Unsecure networks", "Open Wi-Fi, wired ports with no NAC, Bluetooth."],
    ["Open service ports / default credentials", "Exposed services and factory logins (admin/admin)."],
    ["Supply chain", "Compromise through MSPs, vendors, suppliers or third-party code."],
    ["BEC", "A real (compromised) business mailbox used for payment fraud."],
    ["Pretexting / impersonation", "A believable, researched story; pretending to be IT, a vendor or an executive."],
    ["Watering hole", "Compromise a legitimate site the victims already visit."],
    ["Typosquatting / brand impersonation", "Look-alike domains and copied branding."],
    ["Misinformation / disinformation", "False information spread accidentally / deliberately."]
  ],
  traps: [
    "BEC vs whaling — BEC uses a real compromised mailbox; whaling is phishing aimed at executives.",
    "Watering hole vs typosquatting — watering hole uses the real site (compromised); typosquatting uses a look-alike domain.",
    "Smishing = SMS, vishing = voice. The reversed pair is a common distractor.",
    "Compromising an MSP to reach its clients is a supply chain attack."
  ],
  tips: ["Identify the delivery channel first (email, SMS, phone, website, USB, vendor) — that usually narrows it to one answer."] },

{ id: "2.3",
  summary: "Types of weaknesses attackers exploit: application, OS, web, hardware, virtualization, cloud, supply chain, cryptographic, misconfiguration, mobile, and zero-days.",
  concepts: [
    ["Memory injection / buffer overflow", "Writing code or data into memory it shouldn't reach; defended by input validation, bounds checking, ASLR/DEP."],
    ["Race condition (TOCTOU)", "The resource changes between the check and the use."],
    ["Malicious update", "A trusted update channel delivers malware."],
    ["Web-based", "SQL injection (database), XSS (scripts in the victim's browser)."],
    ["Hardware", "Firmware flaws, end-of-life and legacy hardware with no patches."],
    ["Virtualization", "VM escape (guest → hypervisor), resource reuse between tenants."],
    ["Cloud-specific", "Misconfigured storage, exposed management APIs, weak IAM policies."],
    ["Cryptographic", "Weak or deprecated algorithms, poor key management."],
    ["Misconfiguration", "Insecure settings — the leading cause of cloud incidents."],
    ["Mobile", "Side loading apps, jailbreaking/rooting."],
    ["Zero-day", "Unknown to the vendor; no patch exists yet."]
  ],
  traps: [
    "Exposed, unauthenticated API = misconfiguration, not a zero-day.",
    "VM escape is the vulnerability most specific to virtualization; buffer overflows happen everywhere.",
    "End-of-life = no more patches, ever — compensate with isolation.",
    "SQLi targets the database; XSS targets other users' browsers."
  ],
  tips: ["Zero-day response: compensating controls (isolate, restrict, monitor) until a patch exists."] },

{ id: "2.4",
  summary: "Recognize attacks from their indicators: malware behavior, physical, network, application, cryptographic and password attacks, plus the log and account signs that something is wrong.",
  concepts: [
    ["Ransomware / worm / trojan / rootkit", "Encrypts for payment / spreads itself / hides in legit software / hides at the kernel level."],
    ["Logic bomb / keylogger / spyware", "Triggers on a date or event / records keystrokes / collects activity."],
    ["On-path", "Intercepts traffic (ARP poisoning, rogue AP); often followed by SSL stripping."],
    ["DDoS", "Many sources overwhelm a target; amplified/reflected variants abuse open services."],
    ["Credential replay / pass-the-hash", "Reuse captured authentication material without cracking it."],
    ["Application attacks", "Injection, buffer overflow, replay, privilege escalation, forgery (CSRF/SSRF), directory traversal (../)."],
    ["Cryptographic attacks", "Downgrade (force weaker protocol), collision (two inputs, same hash), birthday."],
    ["Password attacks", "Spraying (one password, many accounts) vs brute force (many passwords, one account)."],
    ["Account indicators", "Lockouts, concurrent sessions, impossible travel."],
    ["System indicators", "Resource consumption, blocked content, out-of-cycle or missing logs, published/documented breaches."]
  ],
  traps: [
    "Spraying vs brute force — spraying stays under the lockout threshold by trying one password everywhere.",
    "Credential stuffing uses passwords leaked from another site; spraying guesses common ones.",
    "CSRF makes the victim's browser send the request; SSRF makes the server send it.",
    "Worm = many hosts scanning the same port; one busy host isn't a worm.",
    "%2e%2e%2f is URL-encoded ../ — directory traversal."
  ],
  tips: ["In logs, look for the pattern: timing (beacons), volume (exfiltration), breadth (scans/spraying), sequence (exploit → shell → lateral movement)."] },

{ id: "2.5",
  summary: "The standard ways to reduce risk: segmentation, access control, allow lists, isolation, patching, encryption, monitoring, least privilege, configuration enforcement, decommissioning, and hardening.",
  concepts: [
    ["Segmentation", "Split the network so a compromise can't spread (VLANs, firewalls, microsegmentation)."],
    ["Access control", "ACLs and permissions that grant only what's needed."],
    ["Application allow list", "Only approved software can run — strong against malware."],
    ["Isolation", "Cut a system off entirely (quarantine, air gap) — the go-to for unpatchable devices."],
    ["Patching", "Fix the vulnerability itself; the best mitigation when available."],
    ["Least privilege", "Minimum rights for the shortest time."],
    ["Configuration enforcement", "Baselines pushed and checked automatically so drift is corrected."],
    ["Decommissioning", "Retire systems fully — data, accounts, DNS, firewall rules."],
    ["Hardening", "Endpoint protection, host firewall, HIPS, disable unused ports/protocols, change default passwords, remove unneeded software."]
  ],
  traps: [
    "Can't patch? Isolate/segment and monitor — don't expose it or 'wait for the vendor'.",
    "Input validation stops SQLi and XSS, not network attacks like ARP poisoning.",
    "Lowering lockout thresholds doesn't stop password spraying — MFA does."
  ],
  tips: ["'BEST mitigation' usually fixes the root cause (patch, MFA, validation); 'compensating' is for when you can't."] }
]);
