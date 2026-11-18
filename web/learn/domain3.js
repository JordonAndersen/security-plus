// Learn pages — Domain 3: Security Architecture.
PBQ.addLearn([
{ id: "3.1",
  summary: "How architecture choices change security: cloud and the shared responsibility model, infrastructure as code, serverless, microservices, segmentation and air gaps, SDN, containers and virtualization, IoT, ICS/SCADA, embedded and real-time systems — and the trade-offs between them.",
  concepts: [
    ["Shared responsibility", "IaaS: you patch the guest OS. PaaS: the provider runs OS and runtime. SaaS: provider runs almost everything. You always own your data and access."],
    ["Hybrid / third-party", "Mixing on-prem and cloud, or relying on vendors, spreads responsibility — document who does what."],
    ["Infrastructure as code", "Version-controlled templates: consistent builds, but a bad commit deploys everywhere."],
    ["Serverless", "Code runs on triggers, billed per execution; no servers for you to manage."],
    ["Microservices", "Small independent services talking over APIs — more attack surface to secure."],
    ["Air gap / logical segmentation", "No network connection at all vs separated by VLANs and firewalls."],
    ["SDN", "Control plane separated from data plane; network managed centrally in software."],
    ["Containers vs VMs", "Containers share the host kernel (lighter); VMs each have their own OS on a hypervisor."],
    ["ICS / SCADA", "Industrial control; availability and safety first, old protocols, hard to patch."],
    ["Embedded / RTOS / IoT", "Limited compute, long lifespans, often no patching; isolate them."],
    ["Considerations", "Availability, resilience, cost, responsiveness, scalability, ease of deployment and recovery, patch availability, power, compute."]
  ],
  traps: [
    "PaaS runtime vulnerability → the provider patches it, not the customer.",
    "Regardless of model, data and access management stay with the customer.",
    "IaC's biggest risk is a malicious or mistaken change applied consistently everywhere — protect the pipeline.",
    "ICS's main concern is availability/safety, not confidentiality."
  ],
  tips: ["Draw the responsibility line: whoever manages a layer patches it."] },

{ id: "3.2",
  summary: "Securing the network: where devices go, how they fail, active vs passive placement, the right appliance for each job, port security, firewall types, and secure remote connectivity.",
  concepts: [
    ["Security zones / screened subnet", "Group systems by trust; public-facing servers go in the DMZ."],
    ["Fail-open vs fail-closed", "Open keeps traffic flowing (availability); closed blocks everything (security)."],
    ["Inline vs tap/SPAN", "Inline devices can block (IPS); tapped/monitor devices only see a copy (IDS)."],
    ["Jump server", "Hardened single entry point for admin access."],
    ["Proxy", "Forward proxy filters users' outbound web traffic; reverse proxy fronts servers."],
    ["Load balancer", "Spreads requests across a pool; health checks; session persistence pins users."],
    ["WAF / NGFW / UTM", "WAF: layer 7 for web apps. NGFW: app-aware firewall. UTM: all-in-one for small sites."],
    ["802.1X / EAP", "Port-based network access control; RADIUS back end; EAP-TLS uses client + server certificates."],
    ["VPN / IPsec / TLS", "IPsec tunnel mode encrypts the whole packet (site-to-site); AH = integrity only, ESP = encryption."],
    ["SD-WAN / SASE", "SD-WAN: app-aware routing over many links. SASE: SD-WAN + cloud security (SWG, CASB, ZTNA, FWaaS)."]
  ],
  traps: [
    "IDS vs IPS — passive copy can't block, so 'blocks' means IPS inline.",
    "Fail-open is correct when the business says the site must stay up; fail-closed when security wins.",
    "AH gives integrity only; if the question needs confidentiality, it's ESP.",
    "Perimeter firewalls don't see east-west traffic — use microsegmentation/private VLANs."
  ],
  tips: ["For placement questions, trace the packet: internet → edge firewall → (WAF → load balancer → web) or (IPS → core)."] },

{ id: "3.3",
  summary: "Protecting data: know the data types and classifications, which state the data is in, where it must legally live, and the method that fits — encryption, hashing, masking, tokenization, obfuscation, segmentation or permissions.",
  concepts: [
    ["Data types", "Regulated, trade secret, intellectual property, legal, financial; human- and non-human-readable."],
    ["Classifications", "Public, private, sensitive, confidential, restricted, critical — classify before choosing controls."],
    ["At rest / in transit / in use", "Stored (FDE, database encryption) / moving (TLS, IPsec) / being processed (secure enclaves, confidential computing)."],
    ["Data sovereignty", "Data is subject to the laws of the country where it's stored — and remote access can count as transfer."],
    ["Geolocation / geographic restrictions", "Limit where data is stored or accessed from."],
    ["Encryption vs hashing", "Encryption is reversible with a key; hashing is one-way."],
    ["Masking", "Show only part of a value (****1234)."],
    ["Tokenization", "Replace the value with a meaningless token; the real value lives in a vault."],
    ["Segmentation / permission restrictions", "Keep sensitive data in its own zone and limit who can read it."]
  ],
  traps: [
    "Masking vs tokenization — masking hides part of the value on display; tokenization swaps the stored value.",
    "FDE and TLS don't protect data in use — that's enclaves/TEEs.",
    "Storing EU data in the EU doesn't solve sovereignty if admins abroad can access it.",
    "Unreleased product designs = confidential/trade secret, not public."
  ],
  tips: ["Identify the state first (rest, transit, use), then pick the matching control."] },

{ id: "3.4",
  summary: "Keeping services running and recovering when they don't: high availability, recovery sites, platform diversity, capacity planning, testing, backups and power.",
  concepts: [
    ["Load balancing vs clustering", "Active-active spreading of load vs servers that fail over to each other."],
    ["Hot / warm / cold site", "Ready immediately / partially equipped / space and power only."],
    ["Geographic dispersion", "Put recovery far enough away that one disaster can't hit both."],
    ["Platform diversity / multi-cloud", "Different vendors or providers so one failure doesn't take everything down."],
    ["COOP", "Continuity of operations — keep essential functions running."],
    ["Capacity planning", "Enough people, technology and infrastructure for peak demand and growth."],
    ["Testing", "Tabletop (discussion), simulation, failover, parallel processing (run both sites and compare)."],
    ["Backups", "On-site/off-site, frequency, encryption, snapshots, replication, journaling; keep an offline/immutable copy for ransomware."],
    ["RAID", "Availability, not backup — it mirrors deletions and encryption instantly."],
    ["UPS vs generator", "UPS bridges minutes for graceful shutdown or generator start; generators run for hours."]
  ],
  traps: [
    "Restore too slow for the RTO even with a hot site → replication, not more frequent tapes.",
    "Sticky sessions (persistence) keep a user on one server; round-robin doesn't.",
    "Tabletop = walk-through without touching systems; parallel processing = production at both sites.",
    "RAID 0 has no redundancy; RAID 5 needs at least three disks."
  ],
  tips: ["RPO = data loss (how far back), RTO = downtime (how long to restore). Fix RPO with more frequent backups; fix RTO with faster recovery."] }
]);
