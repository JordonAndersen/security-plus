// Domain 4.0 — Security Operations
PBQ.add([
{
  id: "ir", domain: 4, time: 2, type: "order",
  title: "Order the incident response",
  scenario: `<p>Ransomware hit a file server. Put the activities in the correct order according to the incident response process.</p>`,
  task: "Use the arrows to put the steps in order (first at the top).",
  items: [
    "Write the IR plan and run tabletop exercises",
    "SIEM alerts on mass file renames on FS01",
    "Determine scope, the ransomware strain, and affected hosts",
    "Disconnect infected hosts from the network",
    "Remove the malware and reimage affected systems",
    "Restore files from backup and monitor for reinfection",
    "Hold a post-incident review and update playbooks"
  ],
  labels: ["(Preparation)","(Detection)","(Analysis)","(Containment)","(Eradication)","(Recovery)","(Lessons learned)"],
  explain: "Preparation → Detection → Analysis → Containment → Eradication → Recovery → Lessons learned. Contain BEFORE you eradicate, and eradicate BEFORE you restore."
},
{
  id: "volatility", domain: 4, time: 2, type: "order",
  title: "Order of volatility",
  scenario: `<p>You are collecting evidence from a compromised workstation that is still powered on.</p>`,
  task: "Order the evidence from MOST volatile (collect first) to LEAST volatile.",
  items: ["CPU registers and cache","RAM","Swap / page file","Local hard drive","Remote logs (SIEM)","Archived backup tapes"],
  explain: "Collect the most short-lived data first. Pulling the power cord destroys everything above the disk."
},
{
  id: "email-security", domain: 4, time: 3, type: "grid",
  title: "Email security controls",
  scenario: `<p>Spoofed emails that appear to come from <b>@example.org</b> are reaching customers, and a staff member recently emailed a spreadsheet of SSNs outside the company. You are reviewing the email security stack.</p>`,
  task: "Match each function to the control that provides it.",
  cols: ["Control"],
  opts: [["SPF","DKIM","DMARC","MX record","DLP","Sandboxing","S/MIME","Secure email gateway"]],
  rows: [
    { l: "DNS TXT record listing which servers may send mail for example.org", a: ["SPF"], w: "Sender Policy Framework authorizes sending IP addresses." },
    { l: "Cryptographically signs outgoing messages so receivers can verify they weren't altered", a: ["DKIM"], w: "DomainKeys Identified Mail. The public key is published in DNS." },
    { l: "Tells receivers to quarantine or reject mail that fails the checks, and sends reports", a: ["DMARC"], w: "DMARC builds a policy and reporting on top of SPF and DKIM." },
    { l: "Identifies which servers accept inbound mail for the domain", a: ["MX record"], w: "Routing only. It isn't a security control." },
    { l: "Blocks outbound messages that contain SSNs or card numbers", a: ["DLP"], w: "Data loss prevention inspects content leaving the organization." },
    { l: "Detonates attachments in an isolated environment before delivery", a: ["Sandboxing"], w: "Behavioral analysis of unknown files." },
    { l: "Lets one user digitally sign and encrypt an email end to end", a: ["S/MIME"], w: "Uses certificates for per-message encryption and signatures." }
  ],
  explain: "SPF = who can send. DKIM = was it altered. DMARC = what to do when they fail, plus reporting. Together they stop domain spoofing."
},
{
  id: "linux-hardening", domain: 4, time: 3, type: "multi",
  title: "Harden a new Linux web server",
  scenario: `<p>A new Linux server will host the public company website in the DMZ. It was built from the vendor's default image. Admins will manage it from the management VLAN.</p>`,
  task: "Select the FIVE actions that best harden this server.",
  choices: [
    { t: "Disable and remove services the web server doesn't need", c: true, w: "This reduces the attack surface." },
    { t: "Change all default accounts and passwords", c: true, w: "Default credentials are one of the most common ways in." },
    { t: "Configure the host firewall to allow only 443 from anywhere and 22 from the management VLAN", c: true, w: "Least privilege at the host level." },
    { t: "Apply all current OS and application patches before go-live", c: true, w: "Closes known vulnerabilities." },
    { t: "Forward logs to the SIEM", c: true, w: "This supports detection and keeps logs safe if the host is compromised." },
    { t: "Enable Telnet as a backup admin path in case SSH fails", c: false, w: "Telnet is cleartext. Never add it." },
    { t: "Disable SELinux so the application installs without errors", c: false, w: "This removes mandatory access control. Fix the policy instead." },
    { t: "Leave the SNMP community string as 'public' for monitoring", c: false, w: "Default community strings leak data. Use SNMPv3." },
    { t: "Allow direct root login over SSH for faster troubleshooting", c: false, w: "Use named accounts plus sudo for accountability." }
  ],
  explain: "Hardening = remove what you don't need, change defaults, restrict access, patch, and log. Anything that adds convenience at the cost of security is a distractor."
},
{
  id: "access-models", domain: 4, time: 3, type: "grid",
  title: "Access control models and auth factors",
  scenario: `<p>You are documenting how access works across several systems in your environment.</p>`,
  task: "Identify the access control model or authentication factor for each item.",
  cols: ["Answer"],
  opts: [["Mandatory access control (MAC)","Discretionary access control (DAC)","Role-based access control (RBAC)","Attribute-based access control (ABAC)","Rule-based access control"]],
  rowOpts: {
    5: ["Something you know","Something you have","Something you are","Somewhere you are"],
    6: ["Something you know","Something you have","Something you are","Somewhere you are"],
    7: ["Something you know","Something you have","Something you are","Somewhere you are"],
    8: ["Single-factor (two of the same factor)","Multifactor"]
  },
  rows: [
    { l: "Files are labeled Secret or Top Secret. Users get access based on clearance, and only the OS/admin can change labels.", a: ["Mandatory access control (MAC)"], w: "Labels and clearances are set by the system. Users can't change them." },
    { l: "The owner of a file share decides who else can read it", a: ["Discretionary access control (DAC)"], w: "The owner has discretion. Example: NTFS permissions set by the file owner." },
    { l: "Everyone in the 'Nurse' group gets the same EHR permissions", a: ["Role-based access control (RBAC)"], w: "Permissions follow job role or group." },
    { l: "Access is allowed only if dept=Finance AND device=compliant AND country=US", a: ["Attribute-based access control (ABAC)"], w: "Policies evaluate several attributes of the user, device, and environment. Conditional Access works this way." },
    { l: "A router ACL blocks all inbound traffic to 3389 for everyone", a: ["Rule-based access control"], w: "A global rule applied to everyone, regardless of identity." },
    { l: "Fingerprint scan", a: ["Something you are"], w: "Biometric." },
    { l: "Smart card / hardware security key", a: ["Something you have"], w: "Possession factor." },
    { l: "Login allowed only when GPS shows the user is on campus", a: ["Somewhere you are"], w: "Location attribute." },
    { l: "Password plus a security question", a: ["Single-factor (two of the same factor)"], w: "Both are 'something you know.' Two of the same factor is NOT MFA." }
  ],
  explain: "MAC = labels. DAC = owner decides. RBAC = job role. ABAC = many attributes, conditional. Password + PIN is still single-factor."
},
{
  id: "vuln-priority", domain: 4, time: 3, type: "order",
  title: "Prioritize vulnerability remediation",
  scenario: `<p>The weekly authenticated scan returned the findings below. Your team can fix one per day. Consider CVSS score, exposure, exploit availability, and asset criticality.</p>`,
  task: "Order the findings from HIGHEST to LOWEST remediation priority.",
  items: [
    "CVSS 9.8 RCE on the internet-facing VPN appliance, listed in CISA KEV (actively exploited)",
    "CVSS 8.8 on the internet-facing web server, public proof-of-concept available",
    "CVSS 7.2 on an internal HR database server, no known exploit",
    "CVSS 5.3 information disclosure on an internal printer",
    "CVSS 2.6 on an isolated lab VM scheduled for decommissioning"
  ],
  explain: "Active exploitation (KEV) and internet exposure come before raw CVSS score. Low-value, isolated, or soon-retired assets come last. Their risk may simply be accepted."
}
]);
