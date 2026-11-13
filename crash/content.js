// Crash course content. Each section: { id, group, title, html }.
// Jump buttons: <button class="btn" data-cc="ACTION">…</button>, where ACTION is one of:
//   mcq-hard, mcq-missed, mcq-d1..mcq-d5, pbq-hard, exam, exam-hard, ref-acr-cards, ref-port-cards, ref-ports
PBQ.addCrash([
{ id:"plan", group:"Start here", title:"48-hour cram plan", html:`
<p>You don't have time to relearn everything, so spend it where points are most often lost. Work through this plan in order.</p>
<ol class="steps">
<li><b>Baseline (60 min).</b> Take one full practice exam with the realistic mix. Don't look anything up. Note your two weakest domains on the results screen.
<div class="ccbtns"><button class="btn primary" data-cc="exam">Start a practice exam</button></div></li>
<li><b>Read this crash course (90 min).</b> Focus on <i>How to read a question</i>, <i>Decision guides</i> and <i>Commonly confused pairs</i>, plus the high-yield pages for your two weakest domains. Tick each section as reviewed.</li>
<li><b>Hard drill (90 min).</b> Hard multiple choice in Study mode. Read every explanation, even when you got it right.
<div class="ccbtns"><button class="btn" data-cc="mcq-hard">Hard multiple choice</button></div></li>
<li><b>PBQ reps (60 min).</b> All the hard PBQs. Time yourself, and aim for under 5 minutes each.
<div class="ccbtns"><button class="btn" data-cc="pbq-hard">Hard PBQs</button></div></li>
<li><b>Memorize (45 min, split into short blocks).</b> High-yield acronyms, then ports from service to port.
<div class="ccbtns"><button class="btn" data-cc="ref-acr-cards">Acronym flashcards</button><button class="btn" data-cc="ref-port-cards">Port flashcards</button></div></li>
<li><b>Fix the misses (60 min).</b> Re-run only the questions you missed last time until the pool is empty.
<div class="ccbtns"><button class="btn" data-cc="mcq-missed">Missed questions</button></div></li>
<li><b>Final exam sim (90 min), ideally the evening before.</b> Use Hard-weighted. If you score 800+ on the estimated scale, you're in good shape.
<div class="ccbtns"><button class="btn" data-cc="exam-hard">Hard-weighted exam</button></div></li>
<li><b>Night before:</b> skim <i>Numbers & formulas</i> and <i>Commonly confused pairs</i> once. Then stop and sleep. Sleep is worth more points than a last 2 a.m. session.</li>
</ol>`},

{ id:"exam", group:"Start here", title:"The exam & time strategy", html:`
<table class="cc">
<tr><th>Exam</th><td>CompTIA Security+ SY0-701</td></tr>
<tr><th>Questions</th><td>Maximum of 90: multiple choice (single and multiple answer) plus performance-based questions (PBQs)</td></tr>
<tr><th>Time</th><td>90 minutes</td></tr>
<tr><th>Passing score</th><td>750 on a 100–900 scale</td></tr>
<tr><th>Domain weights</th><td>1.0 General Concepts 12% · 2.0 Threats 22% · 3.0 Architecture 18% · 4.0 Operations 28% · 5.0 Program Mgmt 20%</td></tr>
</table>
<p class="muted">Check CompTIA's site for current details before test day. Formats and policies can change.</p>
<h3>Time budget</h3>
<ul>
<li><b>PBQs usually come first.</b> Glance at each one. If it looks long, <b>flag it and skip it</b>. Do all the multiple choice first, which takes about 45–55 minutes at under 40 seconds a question.</li>
<li>Come back to the PBQs with 35–40 minutes left. That's 6–8 minutes per PBQ.</li>
<li>Aim to have <b>10 minutes</b> at the end to revisit flagged multiple-choice questions.</li>
<li><b>Never leave anything blank.</b> There's no known penalty for guessing, and PBQs are widely believed to give partial credit, so fill in every field.</li>
<li>If a multiple-choice question takes more than 90 seconds, pick your best answer, flag it, and move on. Later questions sometimes jog your memory.</li>
</ul>
<h3>Mindset</h3>
<ul>
<li>The exam tests <b>CompTIA's best-practice answer</b>, not what your company does. If your real-world habit conflicts with the textbook, choose the textbook.</li>
<li>Many questions have <b>two technically true answers</b>. Your job is to find the one that best fits the exact scenario.</li>
<li>A hard question isn't a sign you're failing. Unscored items and harder questions are normal. Reset after each one.</li>
</ul>`},

{ id:"reading", group:"How to think", title:"How to read a question", html:`
<p>Most wrong answers come from misreading the question, not from not knowing the material. Use this routine on every question:</p>
<ol class="steps">
<li><b>Read the LAST sentence first.</b> What exactly is being asked: a control, an attack, a step, a protocol?</li>
<li><b>Circle the qualifier:</b> BEST, MOST, FIRST, NEXT, LEAST, PRIMARY, MOST likely. The qualifier changes the answer.</li>
<li><b>Find the deciding detail</b> in the scenario: "certificates already deployed", "lowest cost", "must remain available", "cannot be patched", "visitor", "executive", "same password many accounts". There's almost always one.</li>
<li><b>Eliminate</b> anything that's wrong, off-topic, or solves a different problem. Usually two options go quickly.</li>
<li><b>Compare the last two</b> against the deciding detail. Pick the one that answers <i>this</i> scenario with the fewest assumptions.</li>
</ol>
<h3>What the qualifiers usually mean</h3>
<table class="cc">
<tr><th>FIRST / NEXT</th><td>Follow the process. In incident response: identify or verify, then contain before you eradicate. In risk work: assess before you treat. If something's unclear, the first step is often to verify or gather information, not to act drastically.</td></tr>
<tr><th>BEST</th><td>Several options would work, so pick the most effective, root-cause fix that fits the constraints. Code fixes beat WAF rules for injection. MFA beats password rules for stolen credentials.</td></tr>
<tr><th>MOST likely</th><td>Go with the most common explanation that fits all the clues, not an exotic one.</td></tr>
<tr><th>PRIMARY</th><td>The main purpose of the thing, not a side benefit.</td></tr>
<tr><th>LEAST</th><td>Flip your thinking: three options are good and one is weak.</td></tr>
</table>
<h3>Red flags in answer choices</h3>
<ul>
<li><b>Security through obscurity</b> (hiding the SSID, changing default ports, MAC filtering) is almost never the BEST answer.</li>
<li><b>Drastic or destructive actions</b> (power off, reimage now, pay the ransom, disable the control entirely) are usually wrong unless the question demands it.</li>
<li><b>Outdated advice</b> such as frequent forced password changes or complexity alone. Current guidance favors length, breached-password screening, and MFA.</li>
<li><b>Answers that add assumptions</b> the scenario never mentions.</li>
<li><b>Absolutes</b> ("always", "never", "guarantees") are suspicious unless they're simply true by definition.</li>
</ul>`},

{ id:"pbq", group:"How to think", title:"How to work a PBQ", html:`
<ol class="steps">
<li><b>Skim everything before touching anything.</b> Read the requirements, every tab or device, and every dropdown's options. The options themselves are clues.</li>
<li><b>Number the requirements.</b> Map each one to a row, rule, or device. Every requirement should be satisfied by something you set.</li>
<li><b>Look for the trap detail:</b> "only the admin workstation" (a single host, not a subnet), "HTTPS only" (443, not 80), "certificates on devices" (EAP-TLS), "first match wins" (rule order).</li>
<li><b>Fill in what you're sure of first.</b> That earns partial credit and often removes options for the harder fields.</li>
<li><b>Review once.</b> Check for blank dropdowns, the TCP vs UDP choice, and source vs destination swapped.</li>
<li><b>Move on.</b> Don't burn 15 minutes chasing the last field of one PBQ.</li>
</ol>
<h3>Common PBQ types and their traps</h3>
<table class="cc">
<tr><th>Firewall rules</th><td>Trace top-down, first match wins. Specific rules (single hosts, denies) go above broad ones. The deny-all goes last. Remember DNS = UDP 53 (TCP for large responses), SSH = TCP 22, HTTPS = TCP 443, SMB = TCP 445.</td></tr>
<tr><th>Log analysis</th><td>Read the status code and size. A 200 with a large response on an attack line probably means it worked, while 403/404 means it was blocked. Pick the IP whose attack <i>succeeded</i>.</td></tr>
<tr><th>Matching (attack ↔ control)</th><td>Each control is usually used once. Match the ones you're sure of first, and the rest fall into place.</td></tr>
<tr><th>Ordering (IR, volatility, change mgmt)</th><td>Memorize the lists cold (see <i>Numbers & formulas</i>).</td></tr>
<tr><th>Network placement</th><td>Public servers go in the DMZ (screened subnet). The WAF sits in front of the web app. Databases and DCs stay internal. Admins go through a jump box on the management network.</td></tr>
<tr><th>Wireless config</th><td>Enterprise = 802.1X + RADIUS. Certificates mean EAP-TLS. Encryption is AES (CCMP/GCMP). Guests get an isolated VLAN with a captive portal.</td></tr>
<tr><th>Certificates / PKI</th><td>A wildcard covers one level. A SAN covers several different names. A missing intermediate gives "unable to get local issuer". A compromised key means revoke and reissue with a NEW key pair.</td></tr>
</table>
<div class="ccbtns"><button class="btn primary" data-cc="pbq-hard">Practice hard PBQs</button></div>`},

{ id:"frameworks", group:"How to think", title:"Decision guides by question type", html:`
<p>Run these questions in your head for each type of problem.</p>
<h3>"Which attack is this?"</h3>
<ul>
<li><b>Who makes the request?</b> The victim's browser means CSRF. The server means SSRF. A script running in other users' browsers means XSS.</li>
<li><b>What's reused?</b> A session cookie means session hijacking. An NTLM hash means pass-the-hash. A whole captured exchange means replay.</li>
<li><b>Where's the redirect?</b> The local hosts file means pharming. A resolver's cache means DNS poisoning. A look-alike domain means typosquatting.</li>
<li><b>How many accounts and passwords?</b> One account with many passwords is brute force. Many accounts with one password is spraying. Leaked pairs from another site are credential stuffing.</li>
<li><b>Who's the target or sender?</b> Executives means whaling. A real compromised business account moving money means BEC. Voice means vishing, SMS means smishing.</li>
<li><b>Does it spread by itself?</b> Yes means a worm. Needing a user and a host file means a virus. Disguised as legitimate software means a trojan. Waiting for a trigger means a logic bomb.</li>
</ul>
<h3>"Which control?"</h3>
<ol><li>Which part of CIA is at risk?</li><li>Does it need to prevent, detect, deter, correct, compensate, or direct?</li><li>Is it implemented by technology, management, people/process, or physical means?</li><li>Fix the root cause where possible: patch, validate input, use MFA, segment.</li></ol>
<h3>"What do you do next?" (incident)</h3>
<p>Preparation → Detection → Analysis → <b>Containment</b> → Eradication → Recovery → Lessons learned. Contain before eradicating. Preserve volatile evidence (RAM) before shutting down. Legal hold when litigation is possible. Notification goes through legal and compliance.</p>
<h3>"Which crypto?"</h3>
<table class="cc">
<tr><th>Bulk or fast encryption</th><td>Symmetric (AES)</td></tr>
<tr><th>Key exchange / sharing secrets</th><td>Asymmetric (RSA, ECDHE). ECC when devices are constrained.</td></tr>
<tr><th>Integrity only</th><td>Hash (SHA-256)</td></tr>
<tr><th>Integrity + authenticity with a shared key</th><td>HMAC</td></tr>
<tr><th>Integrity + authenticity + non-repudiation</th><td>Digital signature (sender's PRIVATE key)</td></tr>
<tr><th>Confidentiality to a recipient</th><td>Encrypt with the recipient's PUBLIC key</td></tr>
<tr><th>Password storage</th><td>Salt + key stretching (bcrypt, PBKDF2, Argon2)</td></tr>
<tr><th>Protect past sessions if a key is stolen</th><td>PFS (ephemeral DH/ECDHE)</td></tr>
</table>
<h3>"Which identity protocol?"</h3>
<table class="cc">
<tr><th>Network access (VPN, Wi-Fi)</th><td>RADIUS (+ 802.1X/EAP)</td></tr>
<tr><th>Device administration, per-command</th><td>TACACS+</td></tr>
<tr><th>Web SSO with XML assertions</th><td>SAML</td></tr>
<tr><th>An app accessing data on a user's behalf</th><td>OAuth 2.0 (authorization)</td></tr>
<tr><th>Sign in with an ID token (JWT)</th><td>OpenID Connect (authentication)</td></tr>
<tr><th>Windows domain tickets</th><td>Kerberos (needs time sync)</td></tr>
<tr><th>Directory queries</th><td>LDAP / LDAPS</td></tr>
</table>
<h3>"Which access control model?"</h3>
<p>Labels and clearances → <b>MAC</b>. The owner decides → <b>DAC</b>. Job role → <b>RBAC</b>. Several attributes or conditions → <b>ABAC</b>. A global rule like an ACL → <b>Rule-based</b>.</p>
<h3>"Who's responsible?" (cloud)</h3>
<p>Physical facility: always the provider. Data, identities, and access: always the customer. OS patching: the customer in IaaS, the provider in PaaS and SaaS. App code: the customer in IaaS and PaaS, the provider in SaaS.</p>
<h3>"Which risk response?"</h3>
<p>Insurance → <b>Transfer</b>. Stop doing the activity → <b>Avoid</b>. Add controls → <b>Mitigate</b>. Formally document and take no action → <b>Accept</b>. A time-bound, approved deviation → <b>Exception</b>.</p>
<h3>Risk math, step by step</h3>
<ol><li>EF as a decimal (25% = 0.25).</li><li>SLE = AV × EF.</li><li>ARO = occurrences per year (once every 4 years = 0.25, twice a year = 2).</li><li>ALE = SLE × ARO.</li><li>Control value = ALE before − ALE after − annual cost of the control.</li></ol>`},

{ id:"d1", group:"High-yield by domain", title:"1.0 General Security Concepts (12%)", html:`
<ul>
<li><b>CIA + non-repudiation + AAA.</b> Non-repudiation needs digital signatures and individual (not shared) accounts. Accounting means logging.</li>
<li><b>Control categories:</b> Technical, Managerial, Operational, Physical. <b>Types:</b> Preventive, Deterrent, Detective, Corrective, Compensating, Directive. Expect to classify a control in both dimensions.</li>
<li><b>Zero Trust:</b> the control plane (policy engine, policy administrator, adaptive identity, threat scope reduction) decides; the data plane (subject, policy enforcement point, implicit trust zones) carries traffic.</li>
<li><b>Physical:</b> bollards (vehicles), access control vestibules (tailgating), sensors (infrared, pressure, microwave, ultrasonic). Lighting and signs deter.</li>
<li><b>Deception:</b> honeypot (one decoy system), honeynet (a decoy network), honeytoken (fake data or credentials), DNS sinkhole.</li>
<li><b>Change management:</b> approval, owner, stakeholders, impact analysis, test results, <b>backout plan</b>, maintenance window, SOP. Technical side: allow/deny lists, restricted activities, downtime, service restarts, legacy apps, dependencies. Update diagrams and version control afterwards.</li>
<li><b>PKI:</b> CA, RA, root and intermediate CAs, CSR, CRL vs OCSP (and stapling), wildcard vs SAN, self-signed, pinning, key escrow.</li>
<li><b>Key storage:</b> TPM (on the device), HSM (enterprise appliance), KMS (cloud service), secure enclave (protects data in use).</li>
<li><b>Obfuscation:</b> steganography, tokenization, data masking.</li>
<li><b>Hashing vs encryption:</b> hashing is one-way (integrity); encryption is reversible with a key (confidentiality). Salting defeats rainbow tables; key stretching slows brute force.</li>
</ul>
<div class="ccbtns"><button class="btn" data-cc="mcq-d1">Drill Domain 1</button></div>`},

{ id:"d2", group:"High-yield by domain", title:"2.0 Threats, Vulnerabilities & Mitigations (22%)", html:`
<ul>
<li><b>Threat actors:</b> nation-state (APT, espionage), organized crime (money), hacktivist (ideology, publicity), insider (access already granted), unskilled attacker (uses others' tools), shadow IT (unapproved but well-meaning). Know their attributes: internal or external, resources, sophistication, motive.</li>
<li><b>Threat vectors:</b> message-based (email, SMS, IM), image, file, voice, removable media, vulnerable or unsupported software, unsecured networks (wireless, wired, Bluetooth), open ports, default credentials, supply chain (MSPs, vendors, suppliers).</li>
<li><b>Human vectors:</b> phishing, vishing, smishing, misinformation, impersonation, BEC, pretexting, watering hole, brand impersonation, typosquatting.</li>
<li><b>Vulnerabilities:</b> memory injection, buffer overflow, race condition (TOCTOU), malicious update, OS and web app flaws (SQLi, XSS), hardware (firmware, end-of-life, legacy), virtualization (VM escape, resource reuse), cloud misconfiguration, supply chain, cryptographic, mobile (sideloading, jailbreaking), zero-day.</li>
<li><b>Malware:</b> ransomware, trojan, worm, spyware, bloatware, virus, keylogger, logic bomb, rootkit. Fileless malware lives in memory and abuses built-in tools.</li>
<li><b>Network attacks:</b> DDoS (amplified or reflected), DNS attacks, wireless (evil twin, deauth), on-path, credential replay, malicious code.</li>
<li><b>Application attacks:</b> injection, buffer overflow, replay, privilege escalation, forgery (CSRF, SSRF), directory traversal.</li>
<li><b>Crypto attacks:</b> downgrade, collision, birthday. <b>Password attacks:</b> spraying, brute force.</li>
<li><b>Indicators:</b> account lockout, concurrent session usage, blocked content, impossible travel, resource consumption, resource inaccessibility, out-of-cycle logging, published or documented data, missing logs.</li>
<li><b>Mitigations:</b> segmentation, access control (ACLs, permissions), application allow listing, isolation, patching, encryption, monitoring, least privilege, configuration enforcement, decommissioning, hardening (disable ports and services, change defaults, remove unneeded software, EDR, host firewall/HIPS).</li>
</ul>
<div class="ccbtns"><button class="btn" data-cc="mcq-d2">Drill Domain 2</button></div>`},

{ id:"d3", group:"High-yield by domain", title:"3.0 Security Architecture (18%)", html:`
<ul>
<li><b>Cloud models:</b> IaaS, PaaS, SaaS, the responsibility matrix, hybrid, third-party vendors. <b>Concepts:</b> IaC, serverless, microservices, SDN, air gaps, containers, virtualization, IoT, ICS/SCADA, RTOS, embedded systems.</li>
<li><b>Architecture trade-offs:</b> availability, resilience, cost, responsiveness, scalability, ease of deployment, risk transference, ease of recovery, patch availability, inability to patch, power, compute.</li>
<li><b>Infrastructure:</b> device placement, security zones, attack surface, connectivity, <b>fail-open vs fail-closed</b>, active vs passive, inline vs tap/monitor.</li>
<li><b>Appliances:</b> jump server, proxy (forward or reverse), IDS/IPS, load balancer, sensors. <b>Port security:</b> 802.1X with EAP. <b>Firewalls:</b> WAF, UTM, NGFW, layer 4 vs layer 7.</li>
<li><b>Secure communication:</b> VPN, remote access, tunneling (TLS, IPsec), SD-WAN, SASE. IPsec: AH = integrity only, ESP = encryption. Tunnel mode for site-to-site, transport mode for host-to-host.</li>
<li><b>Data:</b> types (regulated, trade secret, IP, legal, financial, human/non-human readable), classifications, states (at rest, in transit, in use), sovereignty, geolocation.</li>
<li><b>Data protection methods:</b> geographic restrictions, encryption, hashing, masking, tokenization, obfuscation, segmentation, permission restrictions.</li>
<li><b>Resilience:</b> HA (load balancing vs clustering), hot/warm/cold sites, geographic dispersion, platform diversity, multi-cloud, COOP, capacity planning, testing (tabletop, failover, simulation, parallel processing), backups (onsite/offsite, frequency, encryption, snapshots, replication, journaling), power (generators, UPS).</li>
<li><b>RAID:</b> 0 = striping, no redundancy. 1 = mirroring. 5 = parity, minimum 3 disks. 10 = mirrored stripes. RAID is NOT a backup.</li>
</ul>
<div class="ccbtns"><button class="btn" data-cc="mcq-d3">Drill Domain 3</button></div>`},

{ id:"d4", group:"High-yield by domain", title:"4.0 Security Operations (28% — biggest)", html:`
<p><b>This domain carries the most weight.</b> If you're short on time, put it here first.</p>
<ul>
<li><b>Secure baselines:</b> establish, deploy, maintain. <b>Hardening targets:</b> mobile, workstations, switches, routers, cloud, servers, ICS/SCADA, embedded, RTOS, IoT.</li>
<li><b>Wireless:</b> site surveys and heat maps, WPA3, AAA/RADIUS, cryptographic protocols, authentication protocols.</li>
<li><b>Mobile:</b> MDM, BYOD/COPE/CYOD, cellular, Wi-Fi, Bluetooth. <b>App security:</b> input validation, secure cookies, static analysis, code signing, sandboxing.</li>
<li><b>Asset management:</b> acquisition and procurement, ownership, classification, inventory and enumeration, disposal (sanitization, destruction, certification), data retention.</li>
<li><b>Vulnerability management:</b> identify (scans, SAST/DAST, package monitoring, threat feeds: OSINT, ISAC, dark web; pen tests, bug bounty, audits) → analyze (confirm false positives and negatives, prioritize with CVSS and CVE, exposure factor, environmental variables, risk tolerance) → respond (patch, insurance, segmentation, compensating controls, exceptions) → validate (rescan, audit, verify) → report.</li>
<li><b>Monitoring:</b> log aggregation, alerting, scanning, reporting, archiving, alert response (quarantine, tuning). <b>Tools:</b> SCAP, benchmarks, agent vs agentless, SIEM, AV, DLP, SNMP traps, NetFlow, vulnerability scanners.</li>
<li><b>Enterprise capabilities:</b> firewall rules, IDS/IPS signatures, web filtering (agent-based, centralized proxy, URL scanning, categorization, reputation), OS security (GPO, SELinux), secure protocols, DNS filtering, email (DMARC, DKIM, SPF, gateway), FIM, DLP, NAC, EDR/XDR, user behavior analytics.</li>
<li><b>IAM:</b> provisioning and deprovisioning, permissions, identity proofing, federation, SSO (LDAP, OAuth, SAML), interoperability, attestation, access models (MAC, DAC, RBAC, rule-based, ABAC, time-of-day, least privilege), MFA (biometrics, hard/soft tokens, security keys), password concepts and managers, passwordless, PAM (just-in-time access, vaulting, ephemeral credentials).</li>
<li><b>Automation:</b> provisioning, guard rails, security groups, ticketing, escalation, CI testing, APIs. <b>Benefits:</b> efficiency, consistency, faster reaction, scaling. <b>Risks:</b> complexity, cost, single point of failure, technical debt, ongoing supportability.</li>
<li><b>Incident response:</b> the 7-step process, training, testing (tabletop, simulation), root cause analysis, threat hunting. <b>Forensics:</b> legal hold, chain of custody, acquisition, reporting, preservation, e-discovery.</li>
<li><b>Data sources:</b> firewall, application, endpoint, OS security, IPS/IDS, network logs, metadata, vulnerability scans, automated reports, dashboards, packet captures.</li>
</ul>
<div class="ccbtns"><button class="btn" data-cc="mcq-d4">Drill Domain 4</button></div>`},

{ id:"d5", group:"High-yield by domain", title:"5.0 Program Management & Oversight (20%)", html:`
<ul>
<li><b>Governance documents:</b> policies (AUP, information security, BC, DR, IR, SDLC, change management), <b>standards</b> (mandatory specifics such as password, access control, physical, encryption), <b>procedures</b> (step by step, e.g., onboarding, offboarding, playbooks), <b>guidelines</b> (recommendations).</li>
<li><b>Governance structures:</b> boards, committees, government entities, centralized vs decentralized. <b>Roles:</b> owner, controller, processor, custodian or steward.</li>
<li><b>Risk:</b> identification. Assessment: ad hoc, recurring, one-time, continuous. Analysis: qualitative vs quantitative (SLE, ALE, ARO, probability, likelihood, EF, impact). Risk register (KRIs, owners, thresholds). Tolerance. Appetite: expansionary, conservative, neutral. Strategies: transfer, accept (exemption or exception), avoid, mitigate.</li>
<li><b>BIA:</b> RTO, RPO, MTTR, MTBF. MTD is the ceiling for RTO.</li>
<li><b>Third-party risk:</b> pen tests, right-to-audit clauses, internal audit evidence, independent assessments, supply chain analysis, due diligence, conflicts of interest. <b>Agreements:</b> SLA, MOA, MOU, MSA, WO/SOW, NDA, BPA. Ongoing vendor monitoring, questionnaires, rules of engagement.</li>
<li><b>Compliance:</b> internal and external reporting. <b>Consequences:</b> fines, sanctions, reputational damage, loss of license, contractual impacts. <b>Monitoring:</b> due diligence and care, attestation and acknowledgement, internal and external, automation.</li>
<li><b>Privacy:</b> local, national, and global law. Data subject, controller vs processor, ownership, data inventory and retention, right to be forgotten.</li>
<li><b>Audits and assessments:</b> attestation, internal (compliance, audit committee, self-assessment), external (regulatory, examinations, independent third party). <b>Pen testing:</b> physical, offensive, defensive, integrated; known, partially known, and unknown environments; passive vs active recon.</li>
<li><b>Security awareness:</b> phishing campaigns (recognizing and responding), anomalous behavior (risky, unexpected, unintentional), user guidance (policies, situational awareness, insider threat, passwords, removable media, social engineering, OPSEC, hybrid/remote work), reporting and monitoring, development and execution.</li>
</ul>
<div class="ccbtns"><button class="btn" data-cc="mcq-d5">Drill Domain 5</button></div>`},

{ id:"pairs", group:"Memorize", title:"Commonly confused pairs", html:`
<p>These pairs cost candidates the most points. Cover the right column and quiz yourself.</p>
<table class="cc pairs">
<tr><th>IDS vs IPS</th><td>IDS detects and alerts (passive, on a tap or SPAN port). IPS sits inline and blocks.</td></tr>
<tr><th>SIEM vs SOAR</th><td>SIEM collects, correlates, and alerts. SOAR automates the response with playbooks.</td></tr>
<tr><th>EDR vs XDR</th><td>EDR covers endpoints only. XDR correlates endpoint, network, cloud, email, and identity.</td></tr>
<tr><th>AH vs ESP</th><td>AH gives integrity and authentication with no encryption. ESP encrypts.</td></tr>
<tr><th>Tunnel vs transport mode</th><td>Tunnel encrypts the whole packet (site-to-site). Transport encrypts only the payload (host-to-host).</td></tr>
<tr><th>RADIUS vs TACACS+</th><td>RADIUS: UDP, encrypts only the password, used for network access. TACACS+: TCP 49, encrypts everything, separates AAA, used for device admin.</td></tr>
<tr><th>OAuth vs OIDC vs SAML</th><td>OAuth = authorization (access token). OIDC = authentication (JWT ID token). SAML = XML assertions for SSO.</td></tr>
<tr><th>Authentication vs authorization</th><td>Authentication proves who you are. Authorization decides what you can do.</td></tr>
<tr><th>CRL vs OCSP</th><td>A CRL is a downloaded, cached list (can be stale). OCSP is a real-time, per-certificate check. Stapling has the server attach the OCSP response.</td></tr>
<tr><th>Wildcard vs SAN</th><td>A wildcard covers subdomains one level deep under one domain. A SAN lists multiple specific names or domains.</td></tr>
<tr><th>TPM vs HSM</th><td>TPM is a chip in one device. HSM is an enterprise appliance for high-volume key operations.</td></tr>
<tr><th>Hashing vs encryption</th><td>Hashing is one-way (integrity). Encryption is reversible with a key (confidentiality).</td></tr>
<tr><th>Salting vs key stretching</th><td>A salt makes identical passwords hash differently, which defeats rainbow tables. Key stretching makes each guess slow.</td></tr>
<tr><th>Tokenization vs masking vs anonymization</th><td>Tokenization is reversible through a vault. Masking hides data on display. Anonymization is irreversible.</td></tr>
<tr><th>RPO vs RTO vs MTD</th><td>RPO = data loss you can tolerate. RTO = time to restore. MTD = the ceiling, so RTO must be at most MTD.</td></tr>
<tr><th>MTBF vs MTTR</th><td>MTBF = reliability (time between failures). MTTR = repair speed.</td></tr>
<tr><th>Incremental vs differential</th><td>Incremental: fast backup, slow restore (full + every incremental). Differential: slower backup, fast restore (full + the latest differential).</td></tr>
<tr><th>Hot vs warm vs cold site</th><td>Hot is ready now with current data. Warm has hardware but needs data restored. Cold is just space and power.</td></tr>
<tr><th>Fail-open vs fail-closed</th><td>Fail-open keeps traffic flowing (availability, and fire exits). Fail-closed blocks traffic (security).</td></tr>
<tr><th>Due diligence vs due care</th><td>Diligence is investigating before you commit. Care is acting responsibly on an ongoing basis.</td></tr>
<tr><th>MOU vs MOA</th><td>An MOU is a statement of intent and usually not binding. An MOA is formal, with specific responsibilities.</td></tr>
<tr><th>MSA vs SOW vs SLA</th><td>MSA = umbrella terms. SOW = one project's deliverables. SLA = measurable service levels and penalties.</td></tr>
<tr><th>Controller vs processor</th><td>The controller decides why and how data is processed (and stays accountable). The processor acts on the controller's instructions.</td></tr>
<tr><th>Owner vs custodian</th><td>The owner is accountable and classifies the data. The custodian does the technical care (backups, access controls).</td></tr>
<tr><th>Risk appetite vs tolerance</th><td>Appetite is the overall stance. Tolerance is the acceptable deviation for a specific risk.</td></tr>
<tr><th>Inherent vs residual risk</th><td>Inherent risk is before controls. Residual risk is what's left after them.</td></tr>
<tr><th>Vishing vs pretexting</th><td>Vishing is the channel (voice). Pretexting is the made-up story. They often appear together.</td></tr>
<tr><th>Whaling vs BEC</th><td>Whaling is about the target (executives). BEC uses a real business account to commit payment fraud.</td></tr>
<tr><th>Pharming vs DNS poisoning</th><td>Pharming redirects at the host (hosts file). DNS poisoning corrupts a resolver's cache and affects many users.</td></tr>
<tr><th>CSRF vs SSRF vs XSS</th><td>CSRF: the victim's browser sends the request. SSRF: the server makes the request. XSS: script runs in other users' browsers.</td></tr>
<tr><th>Worm vs virus vs trojan</th><td>A worm spreads by itself. A virus needs a host file and a user. A trojan is disguised as legitimate software.</td></tr>
<tr><th>Brute force vs spraying vs stuffing</th><td>Brute force: one account, many passwords. Spraying: many accounts, a few common passwords. Stuffing: leaked username/password pairs reused from another site.</td></tr>
<tr><th>Downgrade vs SSL stripping</th><td>A downgrade forces an older TLS version. Stripping removes TLS entirely (HTTPS becomes HTTP). HSTS stops stripping.</td></tr>
<tr><th>SPF vs DKIM vs DMARC</th><td>SPF = which servers may send for the domain. DKIM = a signature proving the message wasn't altered. DMARC = the policy for failures (with alignment to the From domain) plus reporting.</td></tr>
<tr><th>SFTP vs FTPS</th><td>SFTP runs over SSH on 22. FTPS is FTP over TLS on 989/990.</td></tr>
<tr><th>Known vs unknown vs partially known environment</th><td>The old white, black, and gray box testing terms.</td></tr>
<tr><th>Passive vs active recon</th><td>Passive never touches the target (OSINT). Active interacts with it (scans).</td></tr>
<tr><th>Credentialed vs non-credentialed scan</th><td>Credentialed scans are more accurate. Non-credentialed scans show the outsider's view and produce more false positives and negatives.</td></tr>
<tr><th>False positive vs false negative</th><td>A false positive is an alert with no real issue. A false negative is a real issue with no alert, and it's the dangerous one.</td></tr>
<tr><th>MAC vs DAC vs RBAC vs ABAC</th><td>MAC = labels. DAC = the owner decides. RBAC = job role. ABAC = several attributes and conditions.</td></tr>
<tr><th>BYOD vs COPE vs CYOD</th><td>BYOD = personal device. COPE = corporate device with personal use allowed. CYOD = the user chooses from an approved list.</td></tr>
<tr><th>Load balancing vs clustering</th><td>Load balancing spreads requests across servers. Clustering has nodes working as one system, often with failover.</td></tr>
</table>`},

{ id:"numbers", group:"Memorize", title:"Numbers, lists & formulas", html:`
<h3>Formulas</h3>
<table class="cc">
<tr><th>SLE</th><td>Asset value × exposure factor</td></tr>
<tr><th>ALE</th><td>SLE × ARO</td></tr>
<tr><th>Control value</th><td>ALE before − ALE after − annual cost of the control</td></tr>
<tr><th>ARO</th><td>Once every N years = 1/N. Several times a year = that count (ARO can be greater than 1).</td></tr>
</table>
<h3>Ordered lists (memorize cold)</h3>
<table class="cc">
<tr><th>Incident response</th><td>Preparation → Detection → Analysis → Containment → Eradication → Recovery → Lessons learned</td></tr>
<tr><th>Order of volatility</th><td>CPU registers and cache → RAM → swap/page file → disk → remote logs → archives and backups</td></tr>
<tr><th>Vulnerability management</th><td>Identify → Analyze → Respond → Validate → Report</td></tr>
<tr><th>Secure baselines</th><td>Establish → Deploy → Maintain</td></tr>
<tr><th>Certificate issuance</th><td>Generate key pair → CSR → submit to CA/RA → validation → issue → install with chain → monitor and renew</td></tr>
<tr><th>Change management</th><td>Request → impact analysis → test plus backout plan → approval (CAB) → implement in the maintenance window → verify and document</td></tr>
</table>
<h3>Numbers that show up</h3>
<table class="cc">
<tr><th>Passing score</th><td>750 out of 900</td></tr>
<tr><th>RAID minimum disks</th><td>RAID 0: 2 · RAID 1: 2 · RAID 5: 3 · RAID 6: 4 · RAID 10: 4</td></tr>
<tr><th>AES</th><td>128-bit block. 128/192/256-bit keys.</td></tr>
<tr><th>CVSS ranges</th><td>None 0 · Low 0.1–3.9 · Medium 4.0–6.9 · High 7.0–8.9 · Critical 9.0–10.0</td></tr>
<tr><th>Kerberos clock skew</th><td>5 minutes by default</td></tr>
<tr><th>Backup rule</th><td>3-2-1: 3 copies, 2 media types, 1 offsite (ideally one immutable or offline copy)</td></tr>
<tr><th>Top ports</th><td>22 SSH/SFTP · 23 Telnet · 25 SMTP · 49 TACACS+ · 53 DNS · 67/68 DHCP · 80 HTTP · 88 Kerberos · 110 POP3 · 123 NTP · 143 IMAP · 161/162 SNMP · 389 LDAP · 443 HTTPS · 445 SMB · 500 IKE · 514 Syslog · 587 SMTP submit · 636 LDAPS · 993 IMAPS · 995 POP3S · 1812/1813 RADIUS · 3389 RDP</td></tr>
</table>
<div class="ccbtns"><button class="btn" data-cc="ref-ports">Full ports table</button><button class="btn" data-cc="ref-port-cards">Port flashcards</button></div>`},

{ id:"mnemonics", group:"Memorize", title:"Memory hooks", html:`
<ul>
<li><b>IR order:</b> "<b>P</b>lease <b>D</b>on't <b>A</b>ttack <b>C</b>ompany <b>E</b>mail <b>R</b>ight <b>L</b>ater" (Preparation, Detection, Analysis, Containment, Eradication, Recovery, Lessons learned).</li>
<li><b>Volatility:</b> "<b>C</b>an <b>R</b>ats <b>S</b>wim <b>D</b>own <b>R</b>ivers <b>A</b>gain?" (CPU/cache, RAM, swap, disk, remote logs, archives).</li>
<li><b>Signing vs encrypting:</b> "<b>Sign with mine, seal with yours.</b>" Sign with your private key; encrypt with the recipient's public key.</li>
<li><b>OAuth vs OIDC:</b> OAuth gives you the <b>keys to the car</b> (access). OIDC gives you an <b>ID card</b> (identity).</li>
<li><b>RPO vs RTO:</b> R<b>P</b>O = <b>P</b>oint in time (data). R<b>T</b>O = <b>T</b>ime to restore.</li>
<li><b>TACACS+ = TCP</b>, both starting with T. RADIUS is the one that "radiates" over UDP.</li>
<li><b>Worm wiggles by itself.</b> A virus needs a ride (a host file) and a driver (a user).</li>
<li><b>SPF = Sender Permitted From</b> (who may send). <b>DKIM = Did Kontent Is Modified?</b> (signature). <b>DMARC = Decide what to do + report.</b></li>
<li><b>Wildcard = one level.</b> Picture *.example.com as a single stair step down.</li>
<li><b>Fail-open for fire doors.</b> People's safety comes first.</li>
</ul>`},

{ id:"examday", group:"Test day", title:"Exam-day checklist", html:`
<ul class="checklist">
<li>Confirm the appointment time and time zone. Re-read the Pearson VUE confirmation email for current rules.</li>
<li><b>Test center:</b> bring the required government ID (names must match your registration) and arrive about 30 minutes early.</li>
<li><b>Online proctored:</b> run the system test the day before, clear the desk and walls, use a wired connection if possible, close all apps, and keep your phone out of reach. Read the current break policy before you start.</li>
<li>Eat something and hydrate, but not so much that you need a break mid-exam.</li>
<li>Use the whiteboard or scratch tool at the start to jot down the IR order, order of volatility, the ALE formula, and any ports you tend to forget.</li>
<li>Glance at the PBQs, flag the long ones, and do the multiple choice first.</li>
<li>Read the last sentence first. Circle BEST, FIRST, or MOST. Find the deciding detail.</li>
<li>Don't change an answer without a concrete reason. Changing on a gut feeling more often turns a right answer wrong.</li>
<li>Keep 10 minutes at the end for flagged questions. Leave nothing blank.</li>
<li>If it doesn't go your way, your score report shows weak domains. Load those into this lab's domain and difficulty filters and go again.</li>
</ul>`}
]);
