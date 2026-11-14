// Domain 1.0 — General Security Concepts
PBQ.add([
{
  id: "controls", domain: 1, time: 4, type: "grid",
  title: "Classify the security controls",
  scenario: `<p>An auditor asks you to classify existing controls by <b>category</b> (what kind of control it is) and <b>type</b> (what it does).</p>`,
  task: "Pick the category and type for each control.",
  cols: ["Category", "Type"],
  opts: [["Technical","Managerial","Operational","Physical"], ["Preventive","Deterrent","Detective","Corrective","Compensating","Directive"]],
  rows: [
    { l: "Firewall rule blocking inbound Telnet", a: ["Technical","Preventive"], w: "Implemented by a system, stops the action before it happens." },
    { l: "Acceptable use policy", a: ["Managerial","Directive"], w: "Policy documents are managerial and tell people what to do (directive)." },
    { l: "CCTV cameras recording the data center", a: ["Physical","Detective"], w: "Records and identifies events. It doesn't stop them." },
    { l: "'Premises under surveillance' warning sign", a: ["Physical","Deterrent"], w: "Discourages an attacker but can't physically stop them." },
    { l: "EDR automatically quarantining a malicious file", a: ["Technical","Corrective"], w: "Acts after detection to fix or limit the damage." },
    { l: "Security staff reviewing access logs daily", a: ["Operational","Detective"], w: "Done by people as a process, and it finds issues after the fact." },
    { l: "Isolating an unpatchable legacy system on its own VLAN", a: ["Technical","Compensating"], w: "An alternate control used because the primary one (patching) isn't possible." }
  ],
  explain: "Category = who or what implements it (technology, management, people/process, physical). Type = what it does."
},
{
  id: "pki", domain: 1, time: 3, type: "grid",
  title: "Pick the right PKI solution",
  scenario: `<p>Your organization is cleaning up its certificate management.</p>`,
  task: "Match each requirement to the best solution.",
  cols: ["Solution"],
  opts: [["Wildcard certificate","SAN certificate","OCSP stapling","CRL","Certificate pinning","Self-signed certificate","CSR","Key escrow"]],
  rows: [
    { l: "One certificate for www., mail., and shop.example.com", a: ["Wildcard certificate"], w: "*.example.com covers any first-level subdomain." },
    { l: "One certificate for example.com AND example.net", a: ["SAN certificate"], w: "Different domains need Subject Alternative Names. A wildcard only covers one domain." },
    { l: "Real-time revocation status without each client contacting the CA", a: ["OCSP stapling"], w: "The server attaches a signed, timestamped OCSP response to the TLS handshake." },
    { l: "Mobile app should reject a certificate from a different, even if trusted, CA", a: ["Certificate pinning"], w: "The app expects a specific certificate or public key." },
    { l: "Isolated lab, no external trust needed, no cost", a: ["Self-signed certificate"], w: "Fine internally. Not trusted publicly." },
    { l: "First step to get a certificate from a public CA", a: ["CSR"], w: "A certificate signing request contains the public key and the subject info." },
    { l: "A third party holds copies of private keys for recovery", a: ["Key escrow"], w: "Used for recovery or legal access requirements." }
  ],
  explain: "Wildcard = many subdomains of ONE domain. SAN = multiple different names or domains."
},
{
  id: "crypto-usecases", domain: 1, time: 4, type: "grid",
  title: "Match the cryptographic technique",
  scenario: `<p>The development and infrastructure teams each have a requirement. Pick the technique that <b>best</b> meets each one. Each technique is used once.</p>`,
  task: "Select the best technique for each requirement.",
  cols: ["Technique"],
  opts: [["Hashing","Symmetric encryption","Asymmetric encryption","Digital signature","Salting","Key stretching","Tokenization","Steganography","Data masking"]],
  rows: [
    { l: "Confirm a downloaded ISO file wasn't corrupted or altered", a: ["Hashing"], w: "Compare the published hash (for example, SHA-256) with the hash of the downloaded file." },
    { l: "Encrypt a 2 TB nightly backup as fast as possible", a: ["Symmetric encryption"], w: "Symmetric ciphers like AES are much faster than asymmetric ones for bulk data." },
    { l: "Securely share a session key with a server over the internet", a: ["Asymmetric encryption"], w: "Public-key crypto (RSA or ECDHE key exchange) solves the key distribution problem. The session key then does the symmetric bulk encryption." },
    { l: "Prove a contract came from the CEO and wasn't modified (non-repudiation)", a: ["Digital signature"], w: "Hash the document, then sign the hash with the CEO's private key. This gives integrity, authentication, and non-repudiation." },
    { l: "Make precomputed rainbow tables useless against stored password hashes", a: ["Salting"], w: "A unique random salt per password means precomputed tables don't match." },
    { l: "Make each offline password-guess attempt much slower", a: ["Key stretching"], w: "PBKDF2, bcrypt, and Argon2 run the hash many times on purpose." },
    { l: "Replace card numbers with surrogate values that map back only in a secure vault", a: ["Tokenization"], w: "Tokens have no mathematical relationship to the original value, unlike encryption." },
    { l: "Hide a message inside an image file", a: ["Steganography"], w: "This conceals that the data exists at all, rather than encrypting it." },
    { l: "Show only the last 4 digits of an SSN to help desk staff", a: ["Data masking"], w: "Masking hides part of the value when it's displayed." }
  ],
  explain: "Hashing gives integrity. Symmetric encryption is for speed and bulk data. Asymmetric is for key exchange and signatures. You sign with the sender's PRIVATE key."
}
]);
