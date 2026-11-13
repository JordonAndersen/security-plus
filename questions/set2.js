// PBQ set 2 — mixed domains
PBQ.add([
{
  id: "zero-trust", domain: 1, time: 3, type: "grid",
  title: "Zero Trust architecture components",
  scenario: `<p>Your organization is adopting a Zero Trust model based on NIST SP 800-207. You are documenting each component for the architecture review board.</p>`,
  task: "Identify the component or concept described, and which plane it belongs to.",
  cols: ["Component / concept", "Plane"],
  opts: [["Policy engine","Policy administrator","Policy enforcement point","Subject/system","Adaptive identity","Threat scope reduction","Implicit trust zone"],["Control plane","Data plane"]],
  rows: [
    { l: "Makes the final grant/deny decision using policy, threat intel, and identity signals", a: ["Policy engine","Control plane"], w: "The PE is the 'brain' of the Policy Decision Point." },
    { l: "Creates or tears down the session path based on the decision, and sends tokens or credentials to the gateway", a: ["Policy administrator","Control plane"], w: "The PA carries out the PE's decision. Together, the PE and PA form the Policy Decision Point (PDP)." },
    { l: "Gateway that sits in front of the resource and enables, monitors, and terminates connections", a: ["Policy enforcement point","Data plane"], w: "The PEP is where traffic actually passes or gets blocked." },
    { l: "The user or device requesting access to the resource", a: ["Subject/system","Data plane"], w: "Subjects live in the data plane and send their requests through the PEP." },
    { l: "Area behind the PEP where entities are trusted to the same level", a: ["Implicit trust zone","Data plane"], w: "Zero Trust works to make these zones as small as possible." },
    { l: "Using context (location, device health, behavior) to evaluate identity at every request", a: ["Adaptive identity","Control plane"], w: "A control-plane concept: risk-based, continuous verification." },
    { l: "Limiting a user's reachable resources to only what's needed, so a breach does less damage", a: ["Threat scope reduction","Control plane"], w: "Least privilege applied at the architecture level." }
  ],
  explain: "Control plane = decisions (adaptive identity, threat scope reduction, policy-driven access, policy engine and policy administrator). Data plane = traffic (subject, PEP, implicit trust zones)."
},
{
  id: "change-mgmt", domain: 1, time: 2, type: "order",
  title: "Change management process",
  scenario: `<p>The networking team needs to upgrade core switch firmware. Your organization follows a formal change management process.</p>`,
  task: "Put the change management steps in order (first at the top).",
  items: [
    "Submit a change request that identifies the owner and stakeholders",
    "Perform an impact analysis (risk, affected systems, required downtime)",
    "Test in a non-production environment and document a backout plan",
    "Get approval from the change advisory board (CAB)",
    "Implement during the approved maintenance window",
    "Verify, then update diagrams, documentation, and version control"
  ],
  explain: "Request → impact analysis → test plus backout plan → CAB approval → implement in the maintenance window → verify and update documentation. Always have a backout plan BEFORE you're approved."
},
{
  id: "indicators", domain: 2, time: 3, type: "grid",
  title: "Recognize indicators of malicious activity",
  scenario: `<p>The SOC dashboard shows several anomalies this morning. Name the indicator in each case (SY0-701 objective 2.4 terms).</p>`,
  task: "Select the indicator for each observation.",
  cols: ["Indicator"],
  opts: [["Account lockout","Concurrent session usage","Blocked content","Impossible travel","Resource consumption","Resource inaccessibility","Out-of-cycle logging","Missing logs","Published/documented"]],
  rows: [
    { l: "The same user account is logged in from 3 workstations in different buildings at once", a: ["Concurrent session usage"], w: "One person can't sit at three desks. The credential is probably shared or stolen." },
    { l: "Security logs on the DC have a 4-hour gap overnight", a: ["Missing logs"], w: "Attackers often clear logs to hide their activity." },
    { l: "A file server's CPU and outbound bandwidth spike at 2 a.m. with no scheduled jobs", a: ["Resource consumption"], w: "Possibly crypto-mining or data exfiltration." },
    { l: "The web proxy keeps blocking attempts to reach a known C2 domain from one laptop", a: ["Blocked content"], w: "The block worked, but the host is still trying, which suggests it's infected." },
    { l: "Users can't open files on the share, and new files have strange extensions", a: ["Resource inaccessibility"], w: "A classic ransomware symptom." },
    { l: "A help desk tech's account is locked after a burst of failed logins at 3 a.m.", a: ["Account lockout"], w: "Points to brute-force guessing against that account." },
    { l: "Audit logging was turned on and off at 1 a.m. with no change ticket", a: ["Out-of-cycle logging"], w: "Logging activity that falls outside normal patterns or schedules." },
    { l: "Your company's internal network diagram shows up on a paste site", a: ["Published/documented"], w: "Internal data showing up publicly is an indicator of compromise." }
  ],
  explain: "Know these indicator names exactly. Exam questions describe the symptom and ask for the term."
},
{
  id: "network-attacks", domain: 2, time: 4, type: "grid",
  title: "Identify the network attack",
  scenario: `<p>Packet captures and device logs from four separate incidents are shown below.</p>`,
  log: `--- Capture A (switch: 10.0.5.0/24, gateway 10.0.5.1) ---
ARP reply: 10.0.5.1 is-at 00:1a:2b:3c:4d:5e
ARP reply: 10.0.5.1 is-at 66:77:88:99:aa:bb   (unsolicited, repeated every 2s)

--- Capture B (border router) ---
40,000 pkts/s  UDP 53 -> victim 203.0.113.80   avg size 3,900 bytes
src: 1,200 different open DNS resolvers   query: ANY isc.org

--- Capture C (switch syslog) ---
%SW-4-MACFLAP / CAM table full (8192/8192), port Gi0/14 learned 6,400 MACs in 10s
switch now flooding all frames out every port

--- Capture D (wireless controller) ---
Rogue AP detected: SSID "CorpWiFi" BSSID 12:34:56:ab:cd:ef  (not in inventory)
802.11 deauthentication frames to broadcast from spoofed legitimate AP BSSID`,
  task: "Identify each attack, then pick the best mitigation for Capture C.",
  cols: ["Attack"],
  opts: [["ARP poisoning","DNS amplification (DDoS)","MAC flooding","Evil twin with deauthentication","DNS poisoning","Replay attack","VLAN hopping"]],
  rowOpts: { 4: ["Port security (limit MACs per port)","DNSSEC","Disable ARP","Increase CAM table timeout"] },
  rows: [
    { l: "Capture A", a: ["ARP poisoning"], w: "Two MACs claim the gateway IP, and one sends unsolicited replies. That's an on-path setup. Mitigate with Dynamic ARP Inspection." },
    { l: "Capture B", a: ["DNS amplification (DDoS)"], w: "Small spoofed queries to open resolvers produce large responses aimed at the victim. That's reflection plus amplification." },
    { l: "Capture C", a: ["MAC flooding"], w: "Filling the CAM table makes the switch act like a hub, so the attacker can sniff all traffic." },
    { l: "Capture D", a: ["Evil twin with deauthentication"], w: "A rogue AP clones the SSID and deauth frames push clients to reconnect to it. WPA3 protected management frames help." },
    { l: "Best mitigation for Capture C", a: ["Port security (limit MACs per port)"], w: "Port security caps the number of MAC addresses learned on each port." }
  ],
  explain: "ARP poisoning = duplicate MACs for the gateway. MAC flooding = CAM table full. Amplification = small request, large response, many reflectors."
},
{
  id: "vuln-types", domain: 2, time: 3, type: "grid",
  title: "Classify the vulnerability",
  scenario: `<p>Your vulnerability management program is categorizing recent findings.</p>`,
  task: "Select the vulnerability type for each finding.",
  cols: ["Vulnerability type"],
  opts: [["VM escape","Side loading","Jailbreaking","Misconfiguration","Zero-day","Supply chain","End-of-life (legacy)","Firmware","Resource reuse","Cryptographic"]],
  rows: [
    { l: "An attacker in a guest VM runs code on the hypervisor and reaches other tenants' VMs", a: ["VM escape"], w: "Breaking out of virtualization isolation." },
    { l: "A user installs an app from an untrusted website onto a company Android phone, bypassing the store", a: ["Side loading"], w: "Installing apps from outside the official store." },
    { l: "A user removes iOS restrictions to install unapproved tweaks", a: ["Jailbreaking"], w: "iOS = jailbreaking. Android = rooting." },
    { l: "An S3 bucket containing student records is set to public read", a: ["Misconfiguration"], w: "The most common cloud vulnerability." },
    { l: "Attackers exploit a flaw that the vendor doesn't know about yet and has no patch for", a: ["Zero-day"], w: "No patch exists. Use compensating controls and monitoring." },
    { l: "A trusted IT management tool's update contained a backdoor inserted at the vendor", a: ["Supply chain"], w: "SolarWinds-style compromise through a trusted provider." },
    { l: "Windows Server 2012 R2 still runs the HVAC controller and no longer gets patches", a: ["End-of-life (legacy)"], w: "No vendor support. Isolate or replace it." },
    { l: "A cloud VM's newly allocated disk still holds fragments of a previous tenant's data", a: ["Resource reuse"], w: "Memory or storage wasn't sanitized before reallocation." },
    { l: "A server still accepts TLS 1.0 with RC4 cipher suites", a: ["Cryptographic"], w: "Weak or deprecated algorithms." }
  ],
  explain: "Mobile: side loading and jailbreaking. Virtualization: VM escape and resource reuse. Cloud: misconfiguration is #1."
},
{
  id: "firewall-vlan", domain: 3, time: 5, type: "grid",
  title: "Segment VLANs with an internal firewall",
  scenario: `<p>A school is segmenting its network. The internal firewall routes between VLANs and processes rules <b>top-down, first match wins</b>.</p>
  <ul><li>Staff VLAN 10: <b>10.10.0.0/24</b></li><li>Student VLAN 20: <b>10.20.0.0/24</b></li><li>Guest VLAN 30: <b>10.30.0.0/24</b></li><li>Server VLAN 40: internal DNS <b>10.40.0.53</b>, file server <b>10.40.0.20</b> (SMB)</li></ul>
  <p>Requirements, in rule order:</p>
  <ol><li>Staff can use the internal DNS server.</li><li>Students can use the internal DNS server.</li><li>Staff can reach the file server's SMB shares.</li><li>Guests can't reach anything in the server VLAN.</li><li>Students can't reach the file server.</li></ol>`,
  task: "Complete each rule.",
  cols: ["Action","Protocol","Source","Destination","Port"],
  opts: [["ALLOW","DENY"],["TCP","UDP","ANY"],["10.10.0.0/24","10.20.0.0/24","10.30.0.0/24","ANY"],["10.40.0.53","10.40.0.20","10.40.0.0/24","ANY"],["53","139","445","3389","ANY"]],
  rows: [
    { l: "Rule 1", a: ["ALLOW","UDP","10.10.0.0/24","10.40.0.53","53"], w: "DNS queries use UDP 53. (Zone transfers and large responses use TCP 53.)" },
    { l: "Rule 2", a: ["ALLOW","UDP","10.20.0.0/24","10.40.0.53","53"], w: "Same as Rule 1, for the student subnet." },
    { l: "Rule 3", a: ["ALLOW","TCP","10.10.0.0/24","10.40.0.20","445"], w: "Modern SMB runs directly over TCP 445. 139 is legacy NetBIOS." },
    { l: "Rule 4", a: ["DENY","ANY","10.30.0.0/24","10.40.0.0/24","ANY"], w: "Block the guest subnet from the entire server subnet." },
    { l: "Rule 5", a: ["DENY","ANY","10.20.0.0/24","10.40.0.20","ANY"], w: "Students are denied the file server. Their DNS was already allowed above it." }
  ],
  explain: "Allow specific traffic above broader deny rules. DNS = UDP 53. SMB = TCP 445. Use the narrowest source and destination that satisfy the requirement."
},
{
  id: "remote-access", domain: 3, time: 3, type: "grid",
  title: "Choose the secure connectivity solution",
  scenario: `<p>Several connectivity projects are on your roadmap. Choose the <b>best</b> technology for each one.</p>`,
  task: "Select the best solution for each requirement.",
  cols: ["Solution"],
  opts: [["IPsec site-to-site VPN (tunnel mode)","TLS/SSL remote access VPN","SD-WAN","SASE","Jump server","Air gap","Microsegmentation","802.1X / NAC"]],
  rows: [
    { l: "Permanently connect the Lake office router to the HQ router over the internet, encrypting all traffic between them", a: ["IPsec site-to-site VPN (tunnel mode)"], w: "Tunnel mode encrypts the entire original packet between the two gateways." },
    { l: "Remote staff need encrypted access from hotel Wi-Fi through a browser or lightweight client", a: ["TLS/SSL remote access VPN"], w: "TLS-based VPNs usually get through restrictive networks on 443." },
    { l: "Route branch traffic intelligently over several internet links based on application and performance", a: ["SD-WAN"], w: "Software-defined WAN. Its focus is path selection and connectivity." },
    { l: "Combine SD-WAN with cloud-delivered security (secure web gateway, CASB, ZTNA, firewall-as-a-service) at the edge", a: ["SASE"], w: "Secure Access Service Edge = networking plus security delivered from the cloud." },
    { l: "Admins must reach server management interfaces only through one hardened, monitored host", a: ["Jump server"], w: "A single controlled entry point for administration." },
    { l: "A safety PLC network must have NO network connection to any other network", a: ["Air gap"], w: "Physical isolation." },
    { l: "Restrict east-west traffic between individual workloads in the data center", a: ["Microsegmentation"], w: "Fine-grained policies between workloads, not just between VLANs." },
    { l: "Devices must authenticate before a switch port grants network access", a: ["802.1X / NAC"], w: "Port-based network access control." }
  ],
  explain: "IPsec tunnel mode = site-to-site. Transport mode = host-to-host. SASE = SD-WAN plus cloud security services."
},
{
  id: "infra-concepts", domain: 3, time: 3, type: "grid",
  title: "Infrastructure models and their key risks",
  scenario: `<p>For the architecture review, match each environment to its description, and then to its biggest security consideration.</p>`,
  task: "Choose the model and its key security consideration.",
  cols: ["Model","Key security consideration"],
  opts: [["Containers","Serverless","Microservices","Infrastructure as code","ICS/SCADA","Embedded/RTOS","IoT"],["Shared host kernel and image provenance","Limited visibility, so you rely on the provider and least-privilege function roles","Many APIs, so API authentication and rate limiting matter most","Secrets or misconfigurations replicated through templates","Safety and availability first, with legacy protocols that lack authentication","Hard or impossible to patch, with long device lifecycles","Weak default credentials and huge numbers of devices"]],
  rows: [
    { l: "Apps packaged with their dependencies, sharing the host OS kernel", a: ["Containers","Shared host kernel and image provenance"], w: "Scan images, use trusted registries, and don't run containers as root." },
    { l: "Code runs as functions triggered by events, with no servers to manage", a: ["Serverless","Limited visibility, so you rely on the provider and least-privilege function roles"], w: "You can't harden the OS. Focus on IAM roles and the code itself." },
    { l: "An app split into small independent services that talk over APIs", a: ["Microservices","Many APIs, so API authentication and rate limiting matter most"], w: "The attack surface grows with each API." },
    { l: "Network and cloud resources defined in Terraform templates", a: ["Infrastructure as code","Secrets or misconfigurations replicated through templates"], w: "One bad template means many bad deployments. Scan templates and keep secrets out of them." },
    { l: "Controls valves and pumps at a water treatment plant", a: ["ICS/SCADA","Safety and availability first, with legacy protocols that lack authentication"], w: "Availability and safety come before confidentiality. Segment heavily." },
    { l: "Deterministic OS running a medical infusion pump", a: ["Embedded/RTOS","Hard or impossible to patch, with long device lifecycles"], w: "Compensate with network isolation." },
    { l: "Thousands of smart thermostats and cameras across campus", a: ["IoT","Weak default credentials and huge numbers of devices"], w: "Change defaults and put them on their own VLAN." }
  ],
  explain: "Each model shifts where the risk lives. On the exam, match the architecture to its characteristic weakness."
},
{
  id: "log-sources", domain: 4, time: 3, type: "grid",
  title: "Pick the right data source",
  scenario: `<p>You are investigating a suspected compromise. For each question, pick the <b>best</b> data source to answer it.</p>`,
  task: "Select the best data source.",
  cols: ["Data source"],
  opts: [["Firewall logs","DNS logs","Endpoint (EDR) logs","Application logs","OS security logs","NetFlow / IPFIX","Packet capture","Vulnerability scan results","Dashboard"]],
  rows: [
    { l: "Which internal hosts looked up the newly registered phishing domain?", a: ["DNS logs"], w: "DNS query logs show who resolved which names." },
    { l: "Was inbound RDP from the internet allowed or blocked last night?", a: ["Firewall logs"], w: "Allow/deny decisions at the perimeter." },
    { l: "Which process launched powershell.exe on the CFO's laptop, and what did it spawn?", a: ["Endpoint (EDR) logs"], w: "Process trees and command lines come from endpoint telemetry." },
    { l: "Who logged in to the domain controller interactively, and when (event 4624)?", a: ["OS security logs"], w: "Windows Security event log." },
    { l: "Which hosts talked to 198.51.100.9, and how much data moved — without payload contents?", a: ["NetFlow / IPFIX"], w: "Flow metadata: who talked to whom, when, and how much." },
    { l: "What exact data was in the exfiltrated HTTP POST?", a: ["Packet capture"], w: "Only a full PCAP has the payload." },
    { l: "Did the web app record failed admin logins and SQL errors?", a: ["Application logs"], w: "App-level events." },
    { l: "Was the exploited server already known to be missing the patch?", a: ["Vulnerability scan results"], w: "Shows whether the weakness was known before the incident." }
  ],
  explain: "NetFlow = metadata (who, when, how much). PCAP = full content. EDR = process-level behavior. DNS logs = who resolved what."
},
{
  id: "alert-tuning", domain: 4, time: 3, type: "grid",
  title: "Triage SIEM alerts",
  scenario: `<p>You are reviewing yesterday's SIEM alerts and incidents to tune detection rules.</p>`,
  task: "Classify each outcome, and pick the best response for the last item.",
  cols: ["Classification"],
  opts: [["True positive","False positive","True negative","False negative"]],
  rowOpts: { 5: ["Tune the rule (add an exception for the approved scanner)","Disable the rule entirely","Ignore it","Escalate to law enforcement"] },
  rows: [
    { l: "Alert: 'Mimikatz detected' — investigation confirms credential dumping on HR-PC07", a: ["True positive"], w: "The alert fired, and the attack was real." },
    { l: "Alert: 'Port scan' — the source was the approved vulnerability scanner during its window", a: ["False positive"], w: "The alert fired, but the activity was legitimate." },
    { l: "No alert fired. Later forensics show data was exfiltrated over DNS tunneling.", a: ["False negative"], w: "The most dangerous outcome: a real attack was missed." },
    { l: "No alert fired, and nothing malicious happened", a: ["True negative"], w: "Correct silence." },
    { l: "Alert: 'Impossible travel' — the user really was on a VPN exit node in another country", a: ["False positive"], w: "Benign activity matched the rule. Tune it with VPN egress IPs." },
    { l: "Best response to the recurring scanner false positive", a: ["Tune the rule (add an exception for the approved scanner)"], w: "Tune narrowly. Disabling the rule creates false negatives." }
  ],
  explain: "Positive or negative = whether the alert fired. True or false = whether that was right. False negatives are the worst, because they're attacks you never saw."
},
{
  id: "mobile-mdm", domain: 4, time: 3, type: "grid",
  title: "Mobile device management decisions",
  scenario: `<p>You manage 300 mobile devices with an MDM platform. Choose the deployment model or control that fits each requirement.</p>`,
  task: "Select the best deployment model or MDM control.",
  cols: ["Answer"],
  opts: [["BYOD","COPE","CYOD","Corporate-owned, business only","Containerization","Remote wipe","Geofencing","Full device encryption","Screen lock + biometrics","Application allow list"]],
  rows: [
    { l: "Staff use personal phones. Corporate email must be separated from personal apps and wipeable on its own.", a: ["Containerization"], w: "A work profile or container keeps business data isolated. A selective wipe removes only that." },
    { l: "The company buys the phones, and employees may also use them personally", a: ["COPE"], w: "Corporate-owned, personally enabled." },
    { l: "Employees choose from an approved list of devices the company buys and owns", a: ["CYOD"], w: "Choose your own device." },
    { l: "Employees use their own devices with company apps enrolled", a: ["BYOD"], w: "Bring your own device. The most privacy concerns and the least control." },
    { l: "Kiosk tablets used only for check-in, with no personal use allowed", a: ["Corporate-owned, business only"], w: "Maximum control (COBO)." },
    { l: "A lost phone with student data must have all its data erased", a: ["Remote wipe"], w: "Erases a lost or stolen device." },
    { l: "The camera turns off automatically when devices are inside the secure lab", a: ["Geofencing"], w: "Location-based policy enforcement." },
    { l: "Only approved apps may be installed on corporate phones", a: ["Application allow list"], w: "Blocks unapproved apps." }
  ],
  explain: "BYOD = personal device. COPE = corporate device, personal use OK. CYOD = choose from a list. Containerization = the BYOD separation answer."
},
{
  id: "assessments", domain: 5, time: 3, type: "grid",
  title: "Audits, assessments, and penetration testing",
  scenario: `<p>The board wants independent assurance, and you are planning the next year's assessment program.</p>`,
  task: "Select the best match for each item.",
  cols: ["Answer"],
  opts: [["Internal audit","External audit","Attestation","Regulatory examination","Known environment test","Unknown environment test","Partially known environment test","Passive reconnaissance","Active reconnaissance","Bug bounty"]],
  rows: [
    { l: "Your compliance team checks that quarterly access reviews actually happened", a: ["Internal audit"], w: "Performed by the organization's own staff." },
    { l: "A CPA firm reviews your controls and issues a SOC 2 Type II report", a: ["External audit"], w: "An independent third party." },
    { l: "Leadership formally signs off that the PCI controls are in place and accurate", a: ["Attestation"], w: "A formal declaration of accuracy or compliance." },
    { l: "A state agency inspects your compliance with privacy law", a: ["Regulatory examination"], w: "Done by a government regulator." },
    { l: "Testers get network diagrams, source code, and credentials in advance", a: ["Known environment test"], w: "Formerly called white box." },
    { l: "Testers get only the company name, simulating an outside attacker", a: ["Unknown environment test"], w: "Formerly called black box." },
    { l: "Testers get a standard user account and an IP range", a: ["Partially known environment test"], w: "Formerly called gray box." },
    { l: "Gather employee names from LinkedIn and DNS records via OSINT, without touching your systems", a: ["Passive reconnaissance"], w: "No direct interaction with the target." },
    { l: "Run Nmap scans against your public IP range", a: ["Active reconnaissance"], w: "Interacts directly with the target, so it can be detected." },
    { l: "Pay outside researchers for each valid vulnerability they responsibly disclose", a: ["Bug bounty"], w: "Continuous crowdsourced testing." }
  ],
  explain: "Known, partially known, and unknown environment replace the old white, gray, and black box terms. Passive recon never touches the target."
}
]);
