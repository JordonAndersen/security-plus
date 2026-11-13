// Domain 3.0 — Security Architecture
PBQ.add([
{
  id: "firewall", domain: 3, time: 4, type: "grid",
  title: "Configure the DMZ firewall",
  scenario: `<p>You are configuring the perimeter firewall for a small company. Rules are processed <b>top-down, first match wins</b>.</p>
  <ul><li>Public web server (HTTPS only): <b>10.1.1.10</b></li><li>Mail server (inbound mail): <b>10.1.1.20</b></li><li>Internal LAN: <b>192.168.10.0/24</b></li><li>Admin workstation: <b>192.168.10.5</b></li></ul>
  <p>Requirements, in rule order:</p>
  <ol><li>Anyone on the internet can reach the website securely.</li><li>The mail server can receive email from other mail servers.</li><li>Only the admin workstation can manage the web server, using an encrypted remote shell.</li><li>All other traffic is blocked.</li></ol>`,
  task: "Complete each rule.",
  cols: ["Action","Protocol","Source","Destination","Port"],
  opts: [["ALLOW","DENY"],["TCP","UDP","ANY"],["ANY","192.168.10.0/24","192.168.10.5","10.1.1.10"],["10.1.1.10","10.1.1.20","192.168.10.0/24","ANY"],["22","23","25","80","443","3389","ANY"]],
  rows: [
    { l: "Rule 1", a: ["ALLOW","TCP","ANY","10.1.1.10","443"], w: "HTTPS is TCP 443. Port 80 would be unencrypted HTTP." },
    { l: "Rule 2", a: ["ALLOW","TCP","ANY","10.1.1.20","25"], w: "Server-to-server mail transfer is SMTP on TCP 25 (587 is client submission)." },
    { l: "Rule 3", a: ["ALLOW","TCP","192.168.10.5","10.1.1.10","22"], w: "Encrypted remote shell is SSH (TCP 22). Source must be the single admin host, not the whole /24 (least privilege). Telnet (23) is cleartext." },
    { l: "Rule 4", a: ["DENY","ANY","ANY","ANY","ANY"], w: "Explicit deny-all at the bottom = implicit deny. If it were at the top, it would block everything." }
  ],
  explain: "PBQ traps: choosing 80 instead of 443, allowing the whole subnet when one host is specified, and putting the deny-all rule anywhere but last."
},
{
  id: "placement", domain: 3, time: 3, type: "grid",
  title: "Secure network placement",
  scenario: `<p>You are redesigning the network. Place each device in the most appropriate location.</p>`,
  task: "Choose a location for each device.",
  cols: ["Location"],
  opts: [["Perimeter (internet edge)","Screened subnet (DMZ)","Inline in front of the web server","Internal network","Management network"]],
  rows: [
    { l: "Next-generation firewall", a: ["Perimeter (internet edge)"], w: "The NGFW sits at the boundary between the internet and everything else." },
    { l: "Public-facing web server", a: ["Screened subnet (DMZ)"], w: "Anything the internet must reach goes in the screened subnet, isolated from internal hosts." },
    { l: "Web application firewall (WAF)", a: ["Inline in front of the web server"], w: "A WAF inspects HTTP/S at layer 7 directly in front of the application it protects." },
    { l: "Database with customer records", a: ["Internal network"], w: "Sensitive data stays internal. Only the web tier should reach it, on a specific port." },
    { l: "Jump server for admins", a: ["Management network"], w: "Admins connect to the jump server, which is the only path into management interfaces." },
    { l: "Domain controller", a: ["Internal network"], w: "Never expose directory services in the DMZ." }
  ],
  explain: "Rule of thumb: public goes in the DMZ, sensitive goes internal, admin access goes through a jump box on a management VLAN."
},
{
  id: "protocols", domain: 3, time: 4, type: "grid",
  title: "Replace insecure protocols",
  scenario: `<p>A vulnerability scan flagged several cleartext protocols on your network.</p>`,
  task: "Select the secure replacement and its default port.",
  cols: ["Secure replacement","Port"],
  opts: [["SSH","HTTPS","SFTP","LDAPS","SNMPv3","IMAPS","POP3S","DNSSEC","TLS 1.0"],["22","53","161","389","443","636","993","995","3389"]],
  rows: [
    { l: "Telnet (23)", a: ["SSH","22"], w: "SSH replaces Telnet for remote shells." },
    { l: "HTTP (80)", a: ["HTTPS","443"], w: "HTTP over TLS." },
    { l: "FTP (20/21)", a: ["SFTP","22"], w: "SFTP runs over SSH, so it uses 22. (FTPS is the TLS version and uses 989/990.)" },
    { l: "LDAP (389)", a: ["LDAPS","636"], w: "LDAP over TLS." },
    { l: "SNMPv1/v2c (161)", a: ["SNMPv3","161"], w: "v3 adds authentication and encryption on the same port." },
    { l: "IMAP (143)", a: ["IMAPS","993"], w: "IMAP over TLS." },
    { l: "POP3 (110)", a: ["POP3S","995"], w: "POP3 over TLS." }
  ],
  explain: "Port traps: SFTP = 22 (not 990), SNMPv3 keeps 161, and LDAPS = 636. TLS 1.0 is deprecated and never a secure answer."
},
{
  id: "wireless", domain: 3, time: 3, type: "grid",
  title: "Configure enterprise wireless",
  scenario: `<p>Requirements for the new office Wi-Fi:</p>
  <ul><li>Employees use company-managed laptops with certificates issued by the internal CA.</li><li>Authentication must use the strongest available method and be checked against a central AAA server.</li><li>Guests need internet access only, with no access to internal resources, after accepting the terms of use.</li></ul>`,
  task: "Choose each setting.",
  cols: ["Setting"],
  opts: [["WPA3-Enterprise","WPA3-Personal (SAE)","WPA2-Personal (PSK)","WEP","EAP-TLS","PEAP-MSCHAPv2","EAP-FAST","RADIUS","TACACS+","LDAP","AES-based (CCMP/GCMP)","TKIP","RC4","Captive portal on an isolated guest VLAN","Same SSID with a shared PSK","MAC filtering"]],
  rows: [
    { l: "Employee SSID security mode", a: ["WPA3-Enterprise"], w: "Enterprise mode = 802.1X with individual credentials. Personal mode uses a shared passphrase." },
    { l: "EAP method", a: ["EAP-TLS"], w: "Certificates on both sides. This is the strongest option, and the scenario says devices already have certificates." },
    { l: "AAA server", a: ["RADIUS"], w: "802.1X wireless authentication uses RADIUS. TACACS+ is for device administration." },
    { l: "Encryption", a: ["AES-based (CCMP/GCMP)"], w: "TKIP and RC4 are legacy and broken." },
    { l: "Guest access", a: ["Captive portal on an isolated guest VLAN"], w: "Segmentation keeps guests off internal resources, and the portal handles accepting the terms." }
  ],
  explain: "If certificates are mentioned, the answer is EAP-TLS. If a passphrase for home or small-office use is mentioned, the answer is WPA3-Personal (SAE)."
},
{
  id: "cloud-responsibility", domain: 3, time: 4, type: "grid",
  title: "Cloud shared responsibility matrix",
  scenario: `<p>Leadership wants a clear picture of who secures what before moving three workloads to the cloud: a VM-based app (<b>IaaS</b>), a managed app platform (<b>PaaS</b>), and a hosted email suite (<b>SaaS</b>).</p>`,
  task: "For each layer, select who is primarily responsible under each model.",
  cols: ["IaaS","PaaS","SaaS"],
  opts: [["Customer","Provider"],["Customer","Provider"],["Customer","Provider"]],
  rows: [
    { l: "Physical data center security", a: ["Provider","Provider","Provider"], w: "The customer never owns the physical facility in any cloud model." },
    { l: "Hypervisor / virtualization layer", a: ["Provider","Provider","Provider"], w: "Even in IaaS, the provider runs the hypervisor." },
    { l: "Guest operating system patching", a: ["Customer","Provider","Provider"], w: "In IaaS you own the VM's OS. In PaaS and SaaS, the provider manages it." },
    { l: "Application code and its vulnerabilities", a: ["Customer","Customer","Provider"], w: "You deploy your own code to IaaS and PaaS. In SaaS, the app is the provider's." },
    { l: "Data and its classification", a: ["Customer","Customer","Customer"], w: "Data is ALWAYS the customer's responsibility." },
    { l: "User accounts and access permissions", a: ["Customer","Customer","Customer"], w: "Identity and access management (who gets in, with what rights) stays with the customer." }
  ],
  explain: "As you move from IaaS to PaaS to SaaS, the provider takes on more. But data, identities, and access are always yours."
},
{
  id: "resilience", domain: 3, time: 4, type: "grid",
  title: "Choose the resilience solution",
  scenario: `<p>The business continuity committee has handed you several requirements. Pick the solution that <b>best</b> meets each one at the lowest reasonable cost.</p>`,
  task: "Select a solution for each requirement.",
  cols: ["Solution"],
  opts: [["Hot site","Warm site","Cold site","RAID 0","RAID 1","RAID 5","RAID 10","Full backup","Incremental backup","Differential backup","Snapshot","Load balancer"]],
  rows: [
    { l: "Trading platform: RTO under 1 hour, budget approved for near-real-time replication", a: ["Hot site"], w: "Fully equipped with current data. The fastest option and the most expensive." },
    { l: "Order system: RTO of 2–3 days, moderate budget, hardware already in place but data must be loaded", a: ["Warm site"], w: "Has equipment and connectivity. Data and configuration need restoring." },
    { l: "Archive system: RTO of several weeks, minimal budget", a: ["Cold site"], w: "Space and power only. The cheapest option and the slowest." },
    { l: "Two-disk server must survive one disk failure", a: ["RAID 1"], w: "Mirroring. Needs a minimum of 2 disks." },
    { l: "Video scratch disk: maximum speed and capacity, redundancy not required", a: ["RAID 0"], w: "Striping only. One failed disk loses everything." },
    { l: "Three-disk file server: survive one failure with the most usable capacity", a: ["RAID 5"], w: "Striping with parity. Minimum 3 disks, and it survives one failure." },
    { l: "Restore must need only the last full backup plus ONE other backup set", a: ["Differential backup"], w: "Differential = all changes since the last full backup. Incremental restores need every incremental set." },
    { l: "Spread web traffic across 4 servers so that one failure doesn't cause an outage", a: ["Load balancer"], w: "High availability across multiple nodes." }
  ],
  explain: "Hot, warm, and cold trade cost against RTO. Differential = full + 1 to restore. Incremental = full + every incremental since."
}
]);
