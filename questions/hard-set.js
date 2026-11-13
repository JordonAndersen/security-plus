// PBQ — HARD set: common traps and multi-step reasoning
PBQ.add([
{
  id: "hard-fw-trace", domain: 3, time: 6, type: "grid", level: "hard",
  title: "Troubleshoot a broken firewall rule base",
  scenario: `<p>The perimeter firewall processes rules <b>top-down, first match wins</b>. The security policy is:</p>
  <ul><li>The web server <b>10.1.1.10</b> is reachable from the internet over <b>HTTPS only</b>.</li>
  <li>The known-malicious range <b>203.0.113.0/24</b> is blocked from everything.</li>
  <li>The management VLAN <b>10.99.0.0/24</b> can SSH to the web server, <b>except</b> the compromised host <b>10.99.0.66</b>.</li>
  <li>The DNS server <b>10.1.1.53</b> can query internet resolvers.</li></ul>
  <p>The current rule base is below.</p>`,
  log: `#  ACTION  PROTO  SOURCE            DEST         PORT
1  ALLOW   TCP    ANY               10.1.1.10    443
2  ALLOW   TCP    10.99.0.0/24      10.1.1.10    22
3  DENY    ANY    203.0.113.0/24    ANY          ANY
4  DENY    TCP    10.99.0.66        10.1.1.10    22
5  ALLOW   UDP    10.1.1.53         ANY          53
6  ALLOW   TCP    ANY               10.1.1.10    80
7  DENY    ANY    ANY               ANY          ANY`,
  task: "Using the CURRENT rules, trace each packet. Then identify the fixes.",
  cols: ["Answer"],
  opts: [["Allowed by rule 1","Allowed by rule 2","Allowed by rule 5","Allowed by rule 6","Denied by rule 3","Denied by rule 4","Denied by rule 7"]],
  rowOpts: {
    5: ["Move rule 3 above rule 1","Move rule 3 below rule 7","Delete rule 1","Change rule 3 to ALLOW"],
    6: ["Move rule 4 above rule 2","Delete rule 2","Move rule 4 below rule 7","Change rule 2 source to ANY"],
    7: ["Delete rule 6","Move rule 6 to the top","Change rule 6 to UDP","Leave it — 80 redirects to 443"]
  },
  rows: [
    { l: "203.0.113.9 → 10.1.1.10 TCP 443", a: ["Allowed by rule 1"], w: "Rule 1 matches first (source ANY), so the deny in rule 3 is never reached. This is the classic shadowed-rule trap." },
    { l: "10.99.0.66 → 10.1.1.10 TCP 22", a: ["Allowed by rule 2"], w: "10.99.0.66 is inside 10.99.0.0/24, so rule 2 matches before the specific deny in rule 4." },
    { l: "203.0.113.9 → 10.1.1.10 TCP 22", a: ["Denied by rule 3"], w: "Rule 1 is port 443 only and rule 2's source doesn't match, so rule 3 is the first match." },
    { l: "10.1.1.53 → 8.8.8.8 TCP 53 (large DNS response retry)", a: ["Denied by rule 7"], w: "Rule 5 allows UDP only. DNS falls back to TCP 53 for large responses, so this is denied by the final rule." },
    { l: "198.51.100.20 → 10.1.1.10 TCP 80", a: ["Allowed by rule 6"], w: "Rule 6 allows HTTP, which violates the HTTPS-only policy." },
    { l: "Fix so the malicious range is fully blocked", a: ["Move rule 3 above rule 1"], w: "Specific denies must come before broader allows." },
    { l: "Fix so the compromised host can't SSH", a: ["Move rule 4 above rule 2"], w: "Put the more specific rule (one host) above the broader rule (the subnet)." },
    { l: "Fix the HTTPS-only violation", a: ["Delete rule 6"], w: "If you really need a redirect, terminate HTTP at a load balancer. The policy as stated says HTTPS only." }
  ],
  explain: "Trace every packet top-down and stop at the FIRST match. Specific rules (single hosts, denies) go above broad rules (subnets, ANY). Watch for TCP vs UDP mismatches."
},
{
  id: "hard-pki-troubleshoot", domain: 1, time: 5, type: "grid", level: "hard",
  title: "Diagnose certificate errors",
  scenario: `<p>After a certificate cleanup project, the help desk is reporting several TLS problems. The public certificate for the main site is a wildcard: <b>*.example.com</b>.</p>`,
  task: "Identify the MOST likely cause of each problem, or the BEST action.",
  cols: ["Cause / action"],
  opts: [["Wildcard covers only one subdomain level","Server isn't sending the intermediate certificate","Clients are using a cached CRL","App has pinned the old public key","Root CA not in the device trust store","Revoke the certificate and reissue with a new key pair","Certificate has expired","Clock skew on the client"]],
  rows: [
    { l: "Name-mismatch error on api.shop.example.com", a: ["Wildcard covers only one subdomain level"], w: "*.example.com matches shop.example.com but NOT api.shop.example.com. Use a SAN entry or *.shop.example.com." },
    { l: "Some clients report 'unable to get local issuer certificate' even though the leaf certificate is valid", a: ["Server isn't sending the intermediate certificate"], w: "An incomplete chain. Browsers that cached the intermediate work, but others fail. Install the full chain." },
    { l: "A certificate revoked yesterday is still accepted by some clients", a: ["Clients are using a cached CRL"], w: "CRLs are published on an interval and cached until their next-update time. OCSP or OCSP stapling gives fresher status." },
    { l: "After renewal with a NEW key, browsers work but the company's mobile app fails", a: ["App has pinned the old public key"], w: "Pinning breaks when the key changes. Update the pin or pin to the CA's key." },
    { l: "New BYOD phones show untrusted-certificate warnings on intranet sites signed by the internal CA", a: ["Root CA not in the device trust store"], w: "Distribute the internal root CA through MDM." },
    { l: "The web server's private key was found in a public GitHub repo", a: ["Revoke the certificate and reissue with a new key pair"], w: "Reissuing with the SAME key is useless. A compromised key means revoke, then generate a new key pair and CSR." },
    { l: "A single laptop shows 'certificate not yet valid' on every HTTPS site", a: ["Clock skew on the client"], w: "If every site fails on one machine, the problem is the client. Fix NTP." }
  ],
  explain: "A wildcard covers one level only. 'Unable to get local issuer' means a missing intermediate. Revocation lag means CRL caching. A compromised key needs a NEW key pair, not just a new certificate."
},
{
  id: "hard-auth-protocols", domain: 4, time: 4, type: "grid", level: "hard",
  title: "Pick the right identity protocol",
  scenario: `<p>You are designing identity for several systems. Each requirement points to <b>one</b> protocol. Watch the details: authentication vs. authorization, token format, and transport.</p>`,
  task: "Select the BEST protocol for each requirement.",
  cols: ["Protocol"],
  opts: [["Kerberos","LDAPS","SAML 2.0","OAuth 2.0","OpenID Connect","RADIUS","TACACS+","NTLM"]],
  rowOpts: { 7: ["Time synchronization within a few minutes","Port 88 open to the internet","A public CA certificate","SMBv1 enabled"] },
  rows: [
    { l: "Network admins on Cisco devices need per-command authorization and full command accounting", a: ["TACACS+"], w: "TACACS+ separates AAA and can authorize individual commands. It uses TCP 49 and encrypts the whole payload." },
    { l: "A mobile app must sign users in with corporate identity and receive a JWT ID token describing the user", a: ["OpenID Connect"], w: "OIDC = authentication on top of OAuth 2.0 with JSON/JWT ID tokens. Plain OAuth is authorization only." },
    { l: "An older enterprise SaaS app supports SSO only through XML assertions from the IdP", a: ["SAML 2.0"], w: "SAML uses XML assertions, which is typical for browser SSO to enterprise SaaS." },
    { l: "A scheduling app needs to read users' calendars without ever seeing their passwords", a: ["OAuth 2.0"], w: "Delegated authorization with scoped access tokens." },
    { l: "Domain-joined Windows PCs get ticket-based mutual authentication to file servers", a: ["Kerberos"], w: "AD's default: TGTs and service tickets from the KDC. NTLM is the legacy fallback." },
    { l: "The VPN concentrator and Wi-Fi controllers authenticate users against a central AAA server", a: ["RADIUS"], w: "The standard for network access (VPN, 802.1X). It encrypts only the password." },
    { l: "An app must query the directory for group membership over an encrypted connection", a: ["LDAPS"], w: "LDAP over TLS on TCP 636." },
    { l: "Kerberos authentication suddenly fails for one site. What does Kerberos depend on that's most likely broken?", a: ["Time synchronization within a few minutes"], w: "Kerberos tickets carry timestamps to prevent replay. The default tolerance is 5 minutes of clock skew." }
  ],
  explain: "OAuth = authorization (access tokens). OIDC = authentication (ID tokens). SAML = XML SSO. RADIUS = network access. TACACS+ = device administration. Kerberos needs synchronized clocks."
},
{
  id: "hard-risk-roi", domain: 5, time: 5, type: "grid", level: "hard",
  title: "Justify a control with ALE math",
  scenario: `<p>The company issues <b>400 laptops</b>. When one is lost, the cost is <b>$1,500</b> in hardware plus <b>$8,500</b> in breach response because the drives aren't encrypted. On average, <b>12 laptops are lost each year</b>.</p>
  <p>A full-disk-encryption rollout costs <b>$30,000 per year</b>. With FDE, a lost laptop costs only the hardware.</p>`,
  task: "Enter numbers only (no $ or commas needed), then decide.",
  cols: ["Answer"],
  opts: [null],
  rowOpts: { 6: ["Yes","No"] },
  rows: [
    { l: "SLE per lost laptop today ($)", a: [10000], w: "$1,500 hardware + $8,500 breach response = $10,000." },
    { l: "ARO", a: [12], w: "12 losses per year. ARO can be greater than 1." },
    { l: "ALE today ($)", a: [120000], w: "10,000 × 12" },
    { l: "SLE with FDE ($)", a: [1500], w: "Encryption removes the breach response cost. Only the hardware remains." },
    { l: "ALE with FDE ($)", a: [18000], w: "1,500 × 12. FDE doesn't change how often laptops are lost, so ARO stays 12." },
    { l: "Net annual benefit of FDE ($)", a: [72000], w: "(120,000 − 18,000) − 30,000 = 72,000" },
    { l: "Is FDE cost-justified?", a: ["Yes"], w: "The control saves $102,000 in ALE and costs $30,000." }
  ],
  explain: "Value of a control = ALE before − ALE after − annual cost of the control. Watch for controls that change the SLE (impact) versus the ARO (likelihood)."
},
{
  id: "hard-ir-decisions", domain: 4, time: 5, type: "grid", level: "hard",
  title: "Make the right call during an incident",
  scenario: `<p>At 9:12 a.m., EDR alerts that ransomware is encrypting files on <b>FIN-PC14</b> and trying SMB connections to other hosts. Choose the <b>BEST</b> action at each point as the incident unfolds.</p>`,
  task: "Select the best action at each point.",
  cols: ["Best action"],
  opts: [["Isolate the host with EDR network containment","Power off the host immediately","Capture a memory image before shutting down","Reimage the host right away","Place a legal hold and maintain chain of custody","Search and purge the phishing email from all mailboxes, then hunt for other executions","Restore from known-good backups taken before the infection, then monitor","Follow breach notification requirements through legal/compliance","Pay the ransom to speed up recovery","Post an update on the company's social media"]],
  rows: [
    { l: "9:13 — Encryption in progress, and the host is attempting lateral movement", a: ["Isolate the host with EDR network containment"], w: "Containment first. EDR isolation stops the spread but keeps the host powered on, so volatile evidence survives." },
    { l: "9:20 — The host is isolated. Analysts suspect a fileless loader in memory.", a: ["Capture a memory image before shutting down"], w: "RAM is the most volatile evidence. Powering off would destroy it." },
    { l: "10:05 — Legal says litigation with a vendor is likely", a: ["Place a legal hold and maintain chain of custody"], w: "Preserve all relevant data and document every handoff." },
    { l: "11:30 — Root cause: a phishing email with a macro. 40 other users received it.", a: ["Search and purge the phishing email from all mailboxes, then hunt for other executions"], w: "Scope the incident: remove the lure everywhere and check whether anyone else ran it." },
    { l: "Day 2 — The malware is eradicated and systems are rebuilt", a: ["Restore from known-good backups taken before the infection, then monitor"], w: "Make sure the backups predate the compromise, and watch for reinfection." },
    { l: "Day 3 — Forensics confirms customer PII was exfiltrated before encryption", a: ["Follow breach notification requirements through legal/compliance"], w: "Notification is regulated (timelines and content). Legal leads it, not ad hoc social media posts." }
  ],
  explain: "The trap answers are 'power off' (destroys memory evidence) and 'reimage now' (destroys evidence and skips scoping). Contain → preserve → scope → eradicate → recover → notify as required."
},
{
  id: "hard-data-protection", domain: 3, time: 4, type: "grid", level: "hard",
  title: "Choose the precise data protection method",
  scenario: `<p>Each team has a data protection requirement. Several methods <i>sound</i> right, so pick the one that meets the exact requirement.</p>`,
  task: "Select the BEST method for each requirement.",
  cols: ["Method"],
  opts: [["Tokenization","Dynamic data masking","Anonymization","Salted hash with key stretching","Field-level encryption","Full-disk encryption","Geographic restrictions","DLP"]],
  rows: [
    { l: "Analytics must join records on customer ID without seeing real IDs, but billing must be able to recover the originals", a: ["Tokenization"], w: "Tokens map back to the originals through a secure vault. That's reversible for authorized systems, and the tokens alone are meaningless." },
    { l: "Call-center agents see only the last 4 digits of a card on screen, while the database keeps the full value", a: ["Dynamic data masking"], w: "Masking applied at display or query time, depending on the viewer's role." },
    { l: "Developers need realistic test data that can NEVER be traced back to real people", a: ["Anonymization"], w: "Irreversible. Tokenization and masking can be reversed or linked back." },
    { l: "User passwords for a custom web app", a: ["Salted hash with key stretching"], w: "Passwords should never be decryptable. Use bcrypt, scrypt, or Argon2." },
    { l: "DBAs must not be able to read the SSN column, but the application can", a: ["Field-level encryption"], w: "The app holds the keys. Full-disk encryption wouldn't stop a DBA querying the live database." },
    { l: "Protect data if a server's drives are pulled from the data center", a: ["Full-disk encryption"], w: "Protects data at rest when the drives are offline." },
    { l: "EU customer data must never be stored outside the EU", a: ["Geographic restrictions"], w: "Enforces data sovereignty and residency through region controls." },
    { l: "Block files labeled 'Confidential' from being emailed outside the company", a: ["DLP"], w: "DLP inspects content and labels and blocks policy violations." }
  ],
  explain: "Reversible: tokenization, encryption. Irreversible: hashing, anonymization. Display-only: masking. FDE does NOTHING once the system is running and the volume is unlocked."
},
{
  id: "hard-lookalike-attacks", domain: 2, time: 5, type: "grid", level: "hard",
  title: "Separate the look-alike attacks",
  scenario: `<p>These pairs are where most candidates lose points. Read each description carefully: the key detail decides the answer.</p>`,
  task: "Identify the attack.",
  cols: ["Attack"],
  opts: [["Whaling","Business email compromise","Pharming","DNS cache poisoning","Typosquatting","Replay","Pass-the-hash","Session hijacking","CSRF","SSRF","Stored XSS","Command injection","Directory traversal","Downgrade","SSL stripping"]],
  rows: [
    { l: "Malware edits the hosts file on one PC so bank.com resolves to an attacker IP", a: ["Pharming"], w: "Local redirection (hosts file) = pharming. Poisoning a DNS SERVER's cache affects many users." },
    { l: "A resolver's cache is fed forged answers, so every client using it is redirected", a: ["DNS cache poisoning"], w: "Server-side, many victims. DNSSEC is the fix." },
    { l: "A real supplier's mailbox is compromised and used to request payment to a new bank account", a: ["Business email compromise"], w: "A legitimate account used for financial fraud. Whaling is about the target (executives), not the sender." },
    { l: "An attacker steals a user's session cookie over open Wi-Fi and uses it to take over the logged-in session", a: ["Session hijacking"], w: "Reusing an active session token. Pass-the-hash reuses Windows credential hashes." },
    { l: "An attacker reuses a captured NTLM hash to authenticate to other servers", a: ["Pass-the-hash"], w: "No cracking needed. Limit credential exposure with Credential Guard and tiered admin accounts." },
    { l: "The victim's browser silently submits a 'change email' form to a site where the victim is logged in", a: ["CSRF"], w: "The browser sends the request using the victim's session. In SSRF, the SERVER makes the request." },
    { l: "A URL-preview feature is abused to make the server fetch internal admin pages", a: ["SSRF"], w: "Server-side request forgery." },
    { l: "A comment containing a script is saved and runs for every visitor who views the page", a: ["Stored XSS"], w: "Persistent. Reflected XSS needs a crafted link per victim." },
    { l: "Input '; cat /etc/shadow' in a ping tool returns the shadow file", a: ["Command injection"], w: "OS commands chained onto the input. Directory traversal uses ../ to read files." },
    { l: "An on-path attacker rewrites HTTPS links to HTTP so the victim never establishes TLS", a: ["SSL stripping"], w: "Stripping removes TLS entirely, while a downgrade negotiates an older TLS version. HSTS prevents stripping." }
  ],
  explain: "Ask: Who makes the request (browser = CSRF, server = SSRF)? Where is the redirect (host = pharming, resolver = poisoning)? What is reused (cookie = hijack, hash = PtH, whole message = replay)?"
},
{
  id: "hard-cert-lifecycle", domain: 1, time: 3, type: "order", level: "hard",
  title: "Certificate issuance lifecycle",
  scenario: `<p>You need a new public TLS certificate for <b>portal.example.com</b>, issued by a public CA.</p>`,
  task: "Put the steps in the correct order (first at the top).",
  items: [
    "Generate a public/private key pair on the server (or in an HSM)",
    "Create a CSR containing the public key and subject/SAN details",
    "Submit the CSR to the CA (through its RA)",
    "CA validates domain control or organization identity",
    "CA signs and issues the certificate",
    "Install the certificate with the full intermediate chain",
    "Monitor expiration and revocation status (OCSP/CRL), and renew before expiry"
  ],
  explain: "The private key never leaves your side. Only the CSR (which contains the public key) goes to the CA. The trap is putting the CSR before key generation."
},
{
  id: "hard-endpoint-baseline", domain: 4, time: 4, type: "multi", level: "hard",
  title: "Harden a Windows laptop baseline",
  scenario: `<p>You are building the MDM security baseline for 300 Windows laptops used by staff who travel and handle student records. EDR is already deployed.</p>`,
  task: "Select the FIVE settings that best belong in the baseline.",
  choices: [
    { t: "BitLocker with TPM + startup PIN", c: true, w: "Protects data at rest on lost or stolen laptops. The PIN defends against some TPM-only attacks." },
    { t: "Remove local admin rights from users and manage the local admin password with LAPS", c: true, w: "Least privilege, plus unique rotated local admin passwords that stop lateral movement through a shared local admin." },
    { t: "Enable application control (WDAC/AppLocker) in enforce mode for approved software", c: true, w: "Allow listing blocks unknown executables." },
    { t: "Keep the host firewall on for all profiles, especially Public", c: true, w: "Traveling laptops sit on hostile networks." },
    { t: "Automatic OS and application updates with a deadline", c: true, w: "Patch management on endpoints." },
    { t: "Disable UAC to reduce help desk tickets", c: false, w: "Removes a privilege boundary." },
    { t: "Enable SMBv1 so the old copier can scan to folders", c: false, w: "SMBv1 is exploited by wormable malware. Fix the copier instead." },
    { t: "Force password changes every 30 days with complexity", c: false, w: "Current NIST guidance discourages frequent forced rotation without evidence of compromise. Use length and MFA instead. A common trap." },
    { t: "Allow users to install software from any website to boost productivity", c: false, w: "Contradicts application control." },
    { t: "Disable Microsoft Defender completely because EDR is installed", c: false, w: "Many EDRs rely on, or run alongside, Defender in passive mode. Turning it off entirely removes a protection layer and tamper protection." }
  ],
  explain: "Expect distractors that LOOK like security (30-day password rotation) or that trade security for convenience (SMBv1, disabling UAC). Choose least privilege, encryption, allow listing, firewall, and patching."
},
{
  id: "hard-email-auth", domain: 4, time: 4, type: "grid", level: "hard",
  title: "Read the email authentication results",
  scenario: `<p>A user forwarded a convincing invoice email that appears to come from <b>billing@example.org</b> (your domain). Its headers include:</p>`,
  log: `From: "Example Billing" <billing@example.org>
Return-Path: <bounce@mailer.badguy.test>
Authentication-Results: mx.example.org;
   spf=pass  smtp.mailfrom=mailer.badguy.test;
   dkim=pass header.d=badguy.test;
   dmarc=fail (p=none) header.from=example.org

DNS:  _dmarc.example.org  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@example.org"`,
  task: "Answer each item.",
  cols: ["Answer"],
  opts: [[""]],
  rowOpts: {
    0: ["SPF checked the envelope sender (badguy.test), not the visible From","SPF is broken on example.org","The email really came from example.org","DKIM overrides SPF"],
    1: ["No — neither SPF nor DKIM aligns with example.org, so DMARC failed","Yes — both SPF and DKIM passed","Yes — DKIM passed","It can't be determined"],
    2: ["It was delivered because p=none only monitors and reports","DMARC blocked it","SPF quarantined it","It bounced"],
    3: ["p=reject","p=none","sp=none","rua=mailto"],
    4: ["Move to p=quarantine and then p=reject after reviewing aggregate reports","Delete the SPF record","Disable DKIM","Set p=reject immediately without checking legitimate senders"]
  },
  rows: [
    { l: "Why did SPF pass?", a: ["SPF checked the envelope sender (badguy.test), not the visible From"], w: "SPF validates the MAIL FROM/Return-Path domain. The attacker owns badguy.test." },
    { l: "Is the visible From domain authenticated?", a: ["No — neither SPF nor DKIM aligns with example.org, so DMARC failed"], w: "DMARC requires alignment between the From domain and the SPF or DKIM domain. Passing checks for a different domain doesn't count." },
    { l: "Why did the user still receive it?", a: ["It was delivered because p=none only monitors and reports"], w: "p=none is monitoring mode." },
    { l: "Which DMARC policy would have rejected it?", a: ["p=reject"], w: "Reject blocks failing mail. Quarantine sends it to spam." },
    { l: "Safest path to enforcement", a: ["Move to p=quarantine and then p=reject after reviewing aggregate reports"], w: "Use rua reports to find legitimate senders (CRM, invoicing SaaS) first, or you'll block your own mail." }
  ],
  explain: "SPF pass + DKIM pass + DMARC fail = spoofing with the attacker's own domains. ALIGNMENT is the concept most people miss."
},
{
  id: "hard-vuln-scan-read", domain: 4, time: 4, type: "grid", level: "hard",
  title: "Interpret vulnerability scan results",
  scenario: `<p>You are validating last night's scan before sending remediation tickets.</p>`,
  log: `[A] 10.1.1.10  CVE-2021-41773 Apache 2.4.49 path traversal   CVSS 7.5
    Evidence: banner "Apache/2.4.49"  — host actually runs nginx 1.24 (confirmed via SSH)
[B] 10.2.0.15  Non-credentialed scan: 0 findings
    WSUS shows host has not installed updates in 6 months
[C] 10.1.1.20  CVE-2023-4966  CVSS 9.4  internet-facing  listed in CISA KEV
[D] 10.5.5.5   OpenSSL 1.0.2 (EOL)  vendor appliance; vendor patch not available until Q3
[E] CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`,
  task: "Classify each finding or choose the best action.",
  cols: ["Answer"],
  opts: [[""]],
  rowOpts: {
    0: ["False positive","True positive","False negative","True negative"],
    1: ["False negative — run a credentialed scan","True negative — host is clean","False positive","Accept the risk"],
    2: ["Remediate first — emergency change","Schedule for next quarter","Accept the risk","Mark as false positive"],
    3: ["Document an exception and apply compensating controls (segmentation, monitoring)","Ignore it until Q3","Disable the scanner on this host","Mark as false positive"],
    4: ["Remotely exploitable over the network, low complexity, no privileges or user interaction needed","Requires local access and admin privileges","Requires user interaction over Bluetooth","Physical access only, low impact"]
  },
  rows: [
    { l: "Finding A", a: ["False positive"], w: "A spoofed or stale banner triggered a version match. Credentialed checks verify what's actually installed." },
    { l: "Finding B", a: ["False negative — run a credentialed scan"], w: "Non-credentialed scans miss missing local patches." },
    { l: "Finding C", a: ["Remediate first — emergency change"], w: "Known to be exploited, internet-facing, and critical. That's the top priority." },
    { l: "Finding D", a: ["Document an exception and apply compensating controls (segmentation, monitoring)"], w: "No patch is available. Formalize the risk and reduce exposure." },
    { l: "Vector E means…", a: ["Remotely exploitable over the network, low complexity, no privileges or user interaction needed"], w: "AV:N = network, AC:L = low complexity, PR:N = no privileges, UI:N = no user interaction. With C/I/A all High, that's ≈9.8 critical." }
  ],
  explain: "Validate before you remediate: banner-based findings are often false positives, and non-credentialed scans produce false negatives. Prioritize by exploitation (KEV) and exposure, not by CVSS alone."
}
]);
