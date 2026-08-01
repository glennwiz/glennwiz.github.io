const output = document.createElement('div');
output.className = 'command-output';
const outputContainer = document.getElementById('output-container');
outputContainer.appendChild(output);

import { codeDivs, terminalDivs } from './terminalScript.js';

const PROMPT = 'root@DarkMage:~$';
const ROOT_NAME = 'root';

// Shared palette (btop panels, ssh handshake).
const COLOR_LOW = '#00cc6d';
const COLOR_MID = '#ffcc00';
const COLOR_HIGH = '#ff4d4d';
const COLOR_FRAME = '#2393ee';
const COLOR_LABEL = '#8a8a8a';
const COLOR_TRACK = '#2f2f2f';

let currentDirectory = null;
let currentPath = [];

// length is always bytes, lastWriteTime is always "YYYY-MM-DD HH:MM".
// Text files carry a `content` string; anything without one is treated as
// binary by cat and has to go through `open`.
let fileSystem = {
    name: ROOT_NAME,
    mode: "drwxr-xr-x",
    lastWriteTime: "2023-01-03 10:13",
    files: [
        {
            mode: "-rw-r--r--",
            lastWriteTime: "2023-01-03 10:13",
            length: 12354,
            name: "file1.txt",
            content: "Nothing to see here. Move along.\n"
        },
        {
            mode: "-rw-r--r--",
            lastWriteTime: "2023-01-05 14:15",
            length: 765,
            name: "file2.png"
        },
    ],
    folders: [
        {
            name: "hidden",
            mode: "drwxr-xr-x",
            lastWriteTime: "2023-01-03 10:13",
            files: [
                {
                    mode: "-rw-r--r--",
                    lastWriteTime: "2023-01-06 04:23",
                    length: 56123,
                    name: "secret_readme.txt",
                    content: `If you are reading this, you already went further than you should have.

Two directories below this one. Everything the committee denied exists
is in 'secrets'. The photographs are in 'pictures'.

Use 'open <filename>' for anything that is not text.
`
                },
            ],
            folders: [
                {
                    mode: "drwxr-xr-x",
                    lastWriteTime: "2023-01-03 10:13",
                    name: "pictures",
                    files: [
                        {
                            mode: "-rw-r--r--",
                            lastWriteTime: "2023-06-07 22:00",
                            length: 1572864,
                            name: "alien_world.jpg"
                        },
                        {
                            mode: "-rw-r--r--",
                            lastWriteTime: "2023-06-07 22:05",
                            length: 1887437,
                            name: "david_grush_hidden.png"
                        },
                        {
                            mode: "-rw-r--r--",
                            lastWriteTime: "2023-06-07 22:10",
                            length: 2202010,
                            name: "whistleblower.jpg"
                        },
                        {
                            mode: "-rw-r--r--",
                            lastWriteTime: "2023-06-07 22:15",
                            length: 2621440,
                            name: "proxima_prof.png"
                        },
                        {
                            mode: "-rw-r--r--",
                            lastWriteTime: "2023-06-07 23:33",
                            length: 102400,
                            name: "readme.txt",
                            content: `Recovered imagery, unprocessed.

Provenance for every frame in this directory is disputed. Four of the six
have no chain of custody at all. Treat accordingly.
`
                        }
                    ],
                    folders: []
                },
                {
                    mode: "drwxr-xr-x",
                    lastWriteTime: "2023-01-03 10:13",
                    name: "secrets",
                    files: [
                        {
                            mode: "-rw-r--r--",
                            lastWriteTime: "2023-01-06 04:23",
                            length: 56123,
                            name: "secret_readme.txt",
                            content: `DEEP ARCHIVE - RESTRICTED

All files listed in this directory are highly confidential and are not
meant to be shared outside the organisation.

Please handle the files with care.

To open a file use the command 'open <filename>'.
`
                        },
                        {
                            mode: "-rw-r--r--",
                            lastWriteTime: "2023-06-07 21:30",
                            length: 577536,
                            name: "topsecret_materials.pdf"
                        },
                        {
                            mode: "-rw-r--r--",
                            lastWriteTime: "2023-06-07 21:32",
                            length: 1258291,
                            name: "ufo_photo.png"
                        },
                        {
                            mode: "-rw-r--r--",
                            lastWriteTime: "2023-06-07 21:35",
                            length: 897024,
                            name: "secret_photo.jpg"
                        },
                        {
                            mode: "-rw-r--r--",
                            lastWriteTime: "2023-06-07 21:38",
                            length: 2411724,
                            name: "confidential_report.docx"
                        },
                        {
                            mode: "-rw-r--r--",
                            lastWriteTime: "2023-06-07 23:33",
                            length: 102400,
                            name: "readme.txt",
                            content: `Index is incomplete. Three items were pulled before this archive
was sealed and never came back.

Do not ask which three.
`
                        }
                    ],
                    folders: []
                },
            ]
        }
    ]
};

// Home is root/hidden if it exists, so the interesting stuff is one 'ls' away.
const homeFolder = fileSystem.folders.find(folder => folder.name === "hidden") || fileSystem;
const homePath = homeFolder === fileSystem ? [ROOT_NAME] : [ROOT_NAME, "hidden"];
currentDirectory = homeFolder;
currentPath = homePath.slice();

function findChildFolder(parentFolder, folderName) {
    if (!parentFolder || !parentFolder.folders) return null;
    return parentFolder.folders.find(f => f.name === folderName) || null;
}

function findChildFile(parentFolder, fileName) {
    if (!parentFolder || !parentFolder.files) return null;
    return parentFolder.files.find(f => f.name === fileName) || null;
}

// Walk a path array like ['root', 'hidden', 'secrets'] back to its folder.
function folderAtPath(path) {
    let cursor = fileSystem;
    for (let i = 1; i < path.length; i++) {
        cursor = findChildFolder(cursor, path[i]) || cursor;
    }
    return cursor;
}

// Turn a user-typed path into a node. Handles absolute ('/root/hidden'),
// relative ('secrets/readme.txt'), '.' and '..'.
// Returns { node, path, type: 'folder' | 'file' }, or null if nothing is there.
function resolvePath(pathStr) {
    if (!pathStr) return null;

    const isAbsolute = pathStr.startsWith('/');
    let node = isAbsolute ? fileSystem : currentDirectory;
    let path = isAbsolute ? [ROOT_NAME] : currentPath.slice();

    const segments = pathStr.split('/').filter(segment => segment.length > 0);

    // '/root/hidden' and '/hidden' should both mean the same thing.
    if (isAbsolute && segments[0] === ROOT_NAME) {
        segments.shift();
    }

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        if (segment === '.') continue;

        if (segment === '..') {
            if (path.length > 1) {
                path.pop();
                node = folderAtPath(path);
            }
            continue;
        }

        const childFolder = findChildFolder(node, segment);
        if (childFolder) {
            node = childFolder;
            path.push(segment);
            continue;
        }

        // A file is only valid as the very last segment of a path.
        const childFile = findChildFile(node, segment);
        if (childFile && i === segments.length - 1) {
            return { node: childFile, path: path.concat(segment), type: 'file' };
        }

        return null;
    }

    return { node, path, type: 'folder' };
}

// Timestamp for files created during the session, in the same shape as the data.
function nowStamp() {
    const pad = n => String(n).padStart(2, '0');
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatUnixDate(dt) {
    return new Date(dt).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function appendToOutput(content, isHTML = false) {
    const elem = document.createElement('div');
    if (isHTML) {
        elem.innerHTML = content;
    } else {
        elem.textContent = content;
    }
    output.append(elem);
}

// Echo the command back the way a real shell does, above its own output.
function echoCommand(line) {
    appendToOutput(`\n${PROMPT} ${line}`);
}

// --- command history -------------------------------------------------------
// Session-only: a reload starts fresh, which is what the original code intended.
const commandHistory = [];

export function pushHistory(line) {
    const trimmed = line.trim();
    if (!trimmed) return;
    // Don't record the same command twice in a row, like a real shell.
    if (commandHistory[commandHistory.length - 1] === trimmed) return;
    commandHistory.push(trimmed);
}

export function getHistory() {
    return commandHistory;
}

// --- tab completion --------------------------------------------------------
// Given the whole input line, return the possible completions for its last word.
export function getCompletions(line) {
    const parts = line.split(' ');
    const word = parts[parts.length - 1];

    // First word: complete command names. Skip the full-line aliases (they
    // contain spaces) and anything starting with '_' so easter eggs stay hidden.
    if (parts.length === 1) {
        return Object.keys(commands)
            .filter(name => !name.includes(' ') && !name.startsWith('_'))
            .filter(name => name.startsWith(word))
            .sort();
    }

    // Later words: complete against the filesystem, honouring any path prefix.
    const slash = word.lastIndexOf('/');
    const dirPart = slash === -1 ? '' : word.slice(0, slash + 1);
    const namePart = slash === -1 ? word : word.slice(slash + 1);

    let folder = currentDirectory;
    if (dirPart) {
        const resolved = resolvePath(dirPart);
        if (!resolved || resolved.type !== 'folder') return [];
        folder = resolved.node;
    }

    return [
        ...folder.folders.map(entry => entry.name + '/'),
        ...folder.files.map(entry => entry.name)
    ]
        .filter(name => name.startsWith(namePart))
        .sort()
        .map(name => dirPart + name);
}

// Bash-style: when a Tab is ambiguous, echo the line and list the options.
export function printCompletions(line, matches) {
    appendToOutput(`\n${PROMPT} ${line}`);
    appendToOutput(matches.join('   '));
}

// Show/hide one of the ASCII art blocks. Reads the rendered state rather than
// tracking a flag, since imported module bindings are read-only.
function toggleBlock(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.style.display = getComputedStyle(element).display === 'none' ? 'block' : 'none';
}

export class LsCommand {
    constructor() {
        this.name = "ls";
    }

    generateListing(folder) {
        const folderIcon = "🗍";
        const fileIcon = "🗎";
        const rows = [];

        for (const child of folder.folders) {
            rows.push({
                mode: child.mode || 'drwxr-xr-x',
                date: formatUnixDate(child.lastWriteTime),
                size: '-',
                icon: folderIcon,
                name: `${child.name}/`
            });
        }

        for (const file of folder.files) {
            rows.push({
                mode: file.mode || '-rw-r--r--',
                date: formatUnixDate(file.lastWriteTime),
                size: (file.length === undefined || file.length === null) ? '-' : String(file.length),
                icon: fileIcon,
                name: file.name
            });
        }

        // Right-align the size column so the listing lines up.
        const sizeWidth = rows.reduce((widest, row) => Math.max(widest, row.size.length), 0);

        return rows
            .map(row => `${row.mode}   1 root root ${row.date} ${row.size.padStart(sizeWidth)} ${row.icon} ${row.name}`)
            .join('\n');
    }

    execute(args) {
        const target = args && args[1];
        echoCommand(target ? `ls ${target}` : 'ls');

        let folder = currentDirectory;
        if (target) {
            const resolved = resolvePath(target);
            if (!resolved) {
                appendToOutput(`ls: cannot access '${target}': No such file or directory`);
                return;
            }
            if (resolved.type === 'file') {
                appendToOutput(resolved.node.name);
                return;
            }
            folder = resolved.node;
        }

        appendToOutput(this.generateListing(folder));
    }
}

export class PwdCommand {
    constructor() {
        this.name = "pwd";
    }

    execute() {
        echoCommand('pwd');
        appendToOutput('/' + currentPath.join('/'));
    }
}

export class CdCommand {
    constructor() {
        this.name = "cd";
    }

    execute(args) {
        const target = args && args[1];
        echoCommand(target ? `cd ${target}` : 'cd');

        // Bare 'cd' goes home, like a real shell.
        if (!target || target === '~') {
            currentDirectory = homeFolder;
            currentPath = homePath.slice();
            return;
        }

        const resolved = resolvePath(target);
        if (!resolved) {
            appendToOutput(`cd: no such file or directory: ${target}`);
            return;
        }
        if (resolved.type === 'file') {
            appendToOutput(`cd: not a directory: ${target}`);
            return;
        }

        currentDirectory = resolved.node;
        currentPath = resolved.path;
    }
}

export class CatCommand {
    constructor() {
        this.name = "cat";
    }

    execute(args) {
        const target = args && args[1];
        echoCommand(target ? `cat ${target}` : 'cat');

        if (!target) {
            appendToOutput('usage: cat <file>');
            return;
        }

        const resolved = resolvePath(target);
        if (!resolved) {
            appendToOutput(`cat: ${target}: No such file or directory`);
            return;
        }
        if (resolved.type === 'folder') {
            appendToOutput(`cat: ${target}: Is a directory`);
            return;
        }
        if (resolved.node.content === undefined) {
            appendToOutput(`cat: ${target}: binary file (try 'open ${target}')`);
            return;
        }

        appendToOutput(resolved.node.content);
    }
}

export class MkdirCommand {
    constructor() {
        this.name = "mkdir";
    }

    execute(args) {
        const name = args && args[1];
        echoCommand(name ? `mkdir ${name}` : 'mkdir');

        if (!name) {
            appendToOutput('usage: mkdir <directory>');
            return;
        }
        if (findChildFolder(currentDirectory, name) || findChildFile(currentDirectory, name)) {
            appendToOutput(`mkdir: cannot create directory '${name}': File exists`);
            return;
        }

        currentDirectory.folders.push({
            name: name,
            mode: 'drwxr-xr-x',
            lastWriteTime: nowStamp(),
            files: [],
            folders: []
        });
    }
}

export class RepoCommand {
    constructor() {
        this.name = "repo";
    }

    execute() {
        fetch('https://api.github.com/users/glennwiz/repos') // Fetch repositories from GitHub API
            .then(response => response.json()) // Parse the JSON from the API
            .then(repos => {
                // Sort repos by updated_at in descending order
                repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            
                let table = document.createElement('table');
                let headerRow = table.insertRow();
                
                // Create headers for the two columns
                let headerName = headerRow.insertCell();
                headerName.textContent = 'Repository Name';
                let headerUpdated = headerRow.insertCell();
                headerUpdated.textContent = 'Last Updated';
            
                repos.forEach(repo => {
                    let row = table.insertRow();
                    
                    let cellName = row.insertCell();
                    let anchor = document.createElement('a');
                    anchor.href = repo.html_url;
                    anchor.target = "_blank";
                    anchor.rel = "noopener noreferrer";
                    anchor.textContent = repo.name;
                    cellName.appendChild(anchor);
            
                    let cellUpdated = row.insertCell();
                    cellUpdated.textContent = new Date(repo.updated_at).toLocaleString(); // Pretty print the date
                });
            
                // Append the table element to your document or a specific element. Here we are appending to document body
                document.body.appendChild(table);
            });            
    }
}


export class ClearCommand {
    constructor() {
        this.name = "clear";
    }

    execute()  {
        output.innerHTML = ''; // Clear the terminal
    }
}

export class AlienCommand {
    constructor() {
        this.name = "alien";
    }

    execute()  {
        toggleBlock('alienBlock');
    }
}

export class EightBitCommand {
    constructor() {
        this.name = "8bit";
    }

    execute()  {
        toggleBlock('8bitMageBlock');
    }
}

export class IfconfigCommand {
    constructor() {
        this.name = "ifconfig";
    }

    execute() {
        const ipInfo = `
${PROMPT} ipconfig        
        
Windows IP Configuration


Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . : lan
   IPv6 Address. . . . . . . . . . . : ee8c:0a0f:1782:0893:4cb7:1d74:ef66:8b5e
   Temporary IPv6 Address. . . . . . : ee8c:0a0f:1782:0893:4cb7:1d74:ef66:8b5e
   Temporary IPv6 Address. . . . . . : ee8c:0a0f:1782:0893:4cb7:1d74:ef66:8b5e
   Link-local IPv6 Address . . . . . : ee8c:0a0f:1782:0893:4cb7:1d74:ef66:8b5e
   IPv4 Address. . . . . . . . . . . : 185.53.177.52
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 185.53.177.1

Ethernet adapter vEthernet (WSL):

   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : ee8c:0a0f:1782:0893:4cb7:1d74:ef66:8b5e
   IPv4 Address. . . . . . . . . . . : 172.21.0.1
   Subnet Mask . . . . . . . . . . . : 255.255.240.0
   Default Gateway . . . . . . . . . :
        `;

        output.innerHTML +=ipInfo;
    }
}

export class LsblkCommand {
    constructor() {
        this.name = "lsblk";
    }

    execute()  {
        const blockDevicesListing = `
${PROMPT} lsblk

NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda      8:0    0   20G  0 disk 
└─sda1   8:1    0   20G  0 part /
sdb      8:16   0   50G  0 disk 
└─sdb1   8:17   0   50G  0 part /mnt/data
sdc      8:32   0  100G  0 disk 
        `;

        output.innerHTML += blockDevicesListing;
    }
}

export class TopCommand {
    constructor() {
        this.name = "top";
    }

    execute()  {
        const processListing = `
top - 12:34:56 up 1 day, 2:30,  2 users,  load average: 0.08, 0.10, 0.12
Tasks: 197 total,   1 running, 196 sleeping,   0 stopped,   0 zombie
%Cpu(s):  1.5 us,  1.1 sy,  0.0 ni, 97.3 id,  0.0 wa,  0.0 hi,  0.1 si,  0.0 st
MiB Mem :   3953.1 total,    180.8 free,   3075.3 used,    697.0 buff/cache
MiB Swap:   1024.0 total,   1024.0 free,      0.0 used.    610.3 avail Mem 

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND                 
    1 root      20   0  169516  11116   7828 S   0.0   0.3   0:06.16 init                    
    2 root      20   0       0      0      0 S   0.0   0.0   0:00.02 kthreadd                
    3 root      20   0       0      0      0 S   0.0   0.0   0:00.24 ksoftirqd/0             
        `;

        output.innerHTML += processListing;
    }
}

export class HistoryCommand {
    constructor() {
        this.name = "history";
    }

    execute()  {
        echoCommand('history');

        const entries = getHistory();
        if (entries.length === 0) {
            appendToOutput('(no history yet)');
            return;
        }

        appendToOutput(
            entries
                .map((entry, index) => `${String(index + 1).padStart(4)}  ${entry}`)
                .join('\n')
        );
    }
}



export class WhoamiCommand {
    constructor() {
        this.name = "whoami";
    }

    execute()  {
        echoCommand('whoami');
        appendToOutput('root');
    }
}

export class TouchCommand {
    constructor() {
        this.name = "touch";
    }

    execute(args)  {
        const name = args && args[1];
        echoCommand(name ? `touch ${name}` : 'touch');

        if (!name) {
            appendToOutput('usage: touch <file>');
            return;
        }

        const existing = findChildFile(currentDirectory, name);
        if (existing) {
            existing.lastWriteTime = nowStamp();
            return;
        }
        if (findChildFolder(currentDirectory, name)) {
            appendToOutput(`touch: cannot touch '${name}': Is a directory`);
            return;
        }

        currentDirectory.files.push({
            name: name,
            mode: '-rw-r--r--',
            lastWriteTime: nowStamp(),
            length: 0,
            content: ''
        });
    }
}

export class RmCommand {
    constructor() {
        this.name = "rm";
    }

    execute(args)  {
        // Accept the flags without acting on them, so 'rm -rf dir' works.
        const operands = (args || []).slice(1).filter(arg => !arg.startsWith('-'));
        const recursive = (args || []).some(arg => /^-\w*r/i.test(arg));
        const name = operands[0];
        echoCommand(`rm ${(args || []).slice(1).join(' ')}`.trim());

        if (!name) {
            appendToOutput('usage: rm [-rf] <file>');
            return;
        }

        const fileIndex = currentDirectory.files.findIndex(f => f.name === name);
        if (fileIndex !== -1) {
            currentDirectory.files.splice(fileIndex, 1);
            return;
        }

        const folderIndex = currentDirectory.folders.findIndex(f => f.name === name);
        if (folderIndex === -1) {
            appendToOutput(`rm: cannot remove '${name}': No such file or directory`);
            return;
        }
        if (!recursive) {
            appendToOutput(`rm: cannot remove '${name}': Is a directory`);
            return;
        }
        currentDirectory.folders.splice(folderIndex, 1);
    }
}

export class EchoCommand {
    constructor() {
        this.name = "echo";
    }

    execute(args)  {
        const message = (args || []).slice(1).join(' ');
        echoCommand(`echo ${message}`.trim());
        appendToOutput(message);
    }
}

export class MvCommand {
    constructor() {
        this.name = "mv";
    }

    execute(args)  {
        const source = args && args[1];
        const destination = args && args[2];
        echoCommand(`mv ${[source, destination].filter(Boolean).join(' ')}`.trim());

        if (!source || !destination) {
            appendToOutput('usage: mv <source> <destination>');
            return;
        }

        const entry = findChildFile(currentDirectory, source)
            || findChildFolder(currentDirectory, source);
        if (!entry) {
            appendToOutput(`mv: cannot stat '${source}': No such file or directory`);
            return;
        }

        // Moving into an existing directory keeps the name; otherwise it's a rename.
        const targetFolder = findChildFolder(currentDirectory, destination);
        if (targetFolder) {
            const list = findChildFile(currentDirectory, source) ? 'files' : 'folders';
            currentDirectory[list].splice(currentDirectory[list].indexOf(entry), 1);
            targetFolder[list].push(entry);
            return;
        }

        entry.name = destination;
        entry.lastWriteTime = nowStamp();
    }
}

export class DateCommand {
    constructor() {
        this.name = "date";
    }

    execute()  {
        echoCommand('date');
        appendToOutput(new Date().toLocaleString());
    }
}

export class HelpCommand {
    constructor() {
        this.name = "help";
    }

    execute()  {
        const availableCommands = `
        Available Commands:
        - help: Show available commands.
        - auto: Watch someone break in (Escape to stop).
        - git: Show the git info.
        - code: Show snippets
        - vim: Show vim commands
        - ls: List files and directories.
        - cd <directory>: Change the current directory.
        - open <file>: Open a supported file (images render inline).
        - ifconfig: Display network configuration.
        - ipconfig: Display network configuration.
        - lsblk: List block devices.
        - top: Display system processes.
        - btop: Live resource monitor (q or esc to quit).
        - history: Show command history.
        - cat <file>: Display the content of a file.
        - cp <source> <destination>: Copy a file or directory.
        - mv <source> <destination>: Move or rename a file or directory.
        - mkdir <directory>: Create a new directory.
        - rm <file>: Remove a file.
        - pwd: Print the current working directory.
        - touch <file>: Create a new file.
        - rm -rf <directory>: Remove a directory and its contents recursively.
        - echo <message>: Print a message to the console.
        - cd: Navigate to the parent directory.
        - date: Display the current date and time.
        - clear: Clear the console output.   
        - matrix: Show the matrix. 
        `;
        output.innerHTML +=availableCommands;
    }
}

export class tlfCommand{
    constructor() {
        this.name = "_47313638"
    }

    execute() {
        window.location.href = "image.png";
    }
}

export class GitCommand {
    constructor() {
        this.name = "git";
    }

    execute() {
        // Show or hide terminal divs
        // Read the computed style, not the inline one, so the first toggle
        // works while they are still hidden by the stylesheet.
        Array.from(terminalDivs).forEach(div => {
            const isHidden = getComputedStyle(div).display === "none";
            div.style.display = isHidden ? "block" : "none";
        });
    }
}

export class CodeCommand {
    constructor() {
        this.name = "code";
    }

    execute() {
        // Show or hide code divs
        Array.from(codeDivs).forEach(div => {
            const isHidden = getComputedStyle(div).display === "none";
            div.style.display = isHidden ? "block" : "none";
        });
    }
}

export class MatrixCommand {
    constructor() {
        this.name = "matrix";
    }   
        
    execute() {
       //i want to redirect to a new page
         window.location.href = "Matrix.html";
 
    }
}
        

// Open files (maps simulated names to real assets and renders images inline)
export class OpenCommand {
    constructor() {
        this.name = "open";
    }

    execute(args) {
        const target = args && args[1];
        echoCommand(target ? `open ${target}` : 'open');

        if (!target) {
            appendToOutput("usage: open <filename>");
            return;
        }

        const fileUrlMap = {
            'ufo_photo.png': '2010_blast_from_the_past.gif',
            'secret_photo.jpg': '2010_blast_from_the_past.gif',
            'david_grush_hidden.png': '2010_blast_from_the_past.gif',
            'proxima_prof.png': '2010_blast_from_the_past.gif',
            'alien_world.jpg': '2010_blast_from_the_past.gif',
            'whistleblower.jpg': '2010_blast_from_the_past.gif'
        };

        // Accept a path, not just a bare name, so 'open pictures/ufo_photo.png' works.
        const resolved = resolvePath(target);
        const name = resolved && resolved.type === 'file' ? resolved.node.name : target;

        let url = fileUrlMap[name];

        // A text file we know about opens in the terminal rather than a tab.
        if (!url && resolved && resolved.type === 'file' && resolved.node.content !== undefined) {
            appendToOutput(resolved.node.content);
            return;
        }

        if (!url && /^https?:\/\//i.test(target)) {
            url = target;
        }

        if (!url) {
            appendToOutput(`open: cannot open '${target}': No such file or directory`);
            return;
        }

        if (/\.(png|jpe?g|gif|webp)$/i.test(url)) {
            const wrapper = document.createElement('div');
            const img = document.createElement('img');
            img.src = url;
            img.alt = target;
            img.style.maxWidth = '100%';
            img.style.marginTop = '8px';
            const link = document.createElement('div');
            link.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">Open in new tab</a>`;
            wrapper.appendChild(img);
            wrapper.appendChild(link);
            output.appendChild(wrapper);
        } else {
            window.open(url, '_blank');
        }
    }
}

// A plausible OpenSSH negotiation. [delay before the line, text, colour].
const SSH_HANDSHAKE = [
    [0,   'OpenSSH_9.6p1, OpenSSL 3.0.13 30 Jan 2024', COLOR_LABEL],
    [90,  'debug1: Reading configuration data /etc/ssh/ssh_config', COLOR_LABEL],
    [140, 'debug1: Connecting to 185.53.177.52 [185.53.177.52] port 22.', COLOR_LABEL],
    [620, 'debug1: Connection established.', COLOR_LABEL],
    [120, 'debug1: identity file id_rsa type 0', COLOR_LABEL],
    [90,  'debug1: Local version string SSH-2.0-OpenSSH_9.6p1', COLOR_LABEL],
    [260, 'debug1: Remote protocol version 2.0, remote software version OpenSSH_8.9p1 Ubuntu-3ubuntu0.10', COLOR_LABEL],
    [150, "debug1: Authenticating to 185.53.177.52:22 as 'root'", COLOR_LABEL],
    [110, 'debug1: SSH2_MSG_KEXINIT sent', COLOR_LABEL],
    [180, 'debug1: SSH2_MSG_KEXINIT received', COLOR_LABEL],
    [140, 'debug1: kex: algorithm: curve25519-sha256', COLOR_LABEL],
    [70,  'debug1: kex: host key algorithm: ssh-ed25519', COLOR_LABEL],
    [70,  'debug1: kex: server->client cipher: chacha20-poly1305@openssh.com', COLOR_LABEL],
    [330, 'debug1: Server host key: ssh-ed25519 SHA256:9Xk2Qv7mB1oLdR4tYs0FzNcHpEuJwAaG3iKvTnMbQxU', COLOR_LABEL],
    [240, "Warning: Permanently added '185.53.177.52' (ED25519) to the list of known hosts.", COLOR_MID],
    [380, 'debug1: Offering public key: id_rsa RSA SHA256:tR8vN2LqCmZ5wXeJfPdA1yHkUoB7sGnQ4iVbMxKcT0E', COLOR_LABEL],
    [420, 'debug1: Server accepts key: id_rsa', COLOR_LABEL],
    [300, 'debug1: Authentication succeeded (publickey).', COLOR_LABEL],
    [80,  'Authenticated to 185.53.177.52 ([185.53.177.52]:22).', COLOR_LOW],
    [120, 'debug1: channel 0: new session', COLOR_LABEL],
    [90,  'debug1: Entering interactive session.', COLOR_LABEL],
    [500, '', null],
    [0,   'Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-105-generic x86_64)', null],
    [260, '', null],
    [0,   '  System load:  0.42               Processes:             213', COLOR_LABEL],
    [60,  '  Usage of /:   61.7% of 19.24GB   Users logged in:       0', COLOR_LABEL],
    [60,  '  Memory usage: 38%                IPv4 address for eth0: 185.53.177.52', COLOR_LABEL],
    [60,  '  Swap usage:   8%', COLOR_LABEL],
    [240, '', null],
    [0,   '  17 updates can be applied immediately.', COLOR_LABEL],
    [320, '', null],
    [0,   'Last login: Tue Jun  6 23:41:08 2023 from 10.0.0.66', COLOR_LABEL],
    [640, '', null],
    [0,   'root@archive:~# cat -- /var/spool/archive/*', COLOR_LOW],
    [520, '', null]
];

// SSH command that renders a "matrix-style" breakdown of the target page's text
export class SshCommand {
    constructor() {
        this.name = 'ssh';
    }

    async handshake() {
        for (const [delay, text, color] of SSH_HANDSHAKE) {
            if (delay) await sleep(delay);
            const line = document.createElement('div');
            line.textContent = text;
            if (color) line.style.color = color;
            output.appendChild(line);
            document.getElementById('command-container').scrollIntoView(false);
        }
    }

    async execute(args) {
        echoCommand((args || ['ssh']).join(' '));
        await this.handshake();

        // For the demo, fetch the current page (index.html) and stream characters in a matrix effect
        const url = 'index.html';
        try {
            const res = await fetch(url, { cache: 'no-store' });
            const html = await res.text();

            // Extract text content naively
            const textOnly = html
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            const container = document.createElement('div');
            container.style.height = '240px';
            container.style.overflow = 'hidden';
            container.style.background = '#000';
            container.style.color = '#0f0';
            container.style.fontFamily = 'Courier New, monospace';
            container.style.padding = '8px';
            container.style.marginTop = '8px';
            container.style.border = '1px solid #0f0';

            const pre = document.createElement('pre');
            pre.style.whiteSpace = 'pre-wrap';
            pre.style.margin = '0';
            container.appendChild(pre);
            output.appendChild(container);

            // Stream characters with a "matrix" effect
            let i = 0;
            const chunkSize = 3; // small chunk for effect
            const interval = setInterval(() => {
                if (i >= textOnly.length) {
                    clearInterval(interval);
                    return;
                }
                const next = textOnly.slice(i, i + chunkSize);
                pre.textContent += next;
                container.scrollTop = container.scrollHeight;
                i += chunkSize;
            }, 10);
        } catch (e) {
            appendToOutput('ssh: failed to establish connection');
        }
    }
}

// Plays back a scripted intrusion, typing each command a character at a time.
// Escape aborts it; the keyboard is otherwise locked out while it runs.
let autoRunning = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

export class AutoCommand {
    constructor() {
        this.name = "auto";
    }

    // The story: get oriented, find the hidden archive, read it, poke the box,
    // stage an exfil directory, clean up after yourself, then jump the wire.
    get script() {
        return [
            { cmd: 'clear',                       pause: 300 },
            { cmd: 'whoami',                      pause: 700 },
            { cmd: 'pwd',                         pause: 600 },
            { cmd: 'ls',                          pause: 1200 },
            { cmd: 'cat secret_readme.txt',       pause: 2200 },
            { cmd: 'cd pictures',                 pause: 500 },
            { cmd: 'ls',                          pause: 1400 },
            { cmd: 'cat readme.txt',              pause: 1800 },
            { cmd: 'open alien_world.jpg',        pause: 2200 },
            { cmd: 'cd ../secrets',               pause: 600 },
            { cmd: 'ls',                          pause: 1500 },
            { cmd: 'cat secret_readme.txt',       pause: 2000 },
            { cmd: 'cat topsecret_materials.pdf', pause: 1400 },
            { cmd: 'open ufo_photo.png',          pause: 2200 },
            { cmd: 'ifconfig',                    pause: 1800 },
            { cmd: 'lsblk',                       pause: 1500 },
            { cmd: 'top',                         pause: 1800 },
            { cmd: 'btop',                        pause: 7000, thenStop: true },
            { cmd: 'mkdir exfil',                 pause: 500 },
            { cmd: 'touch manifest.txt',          pause: 500 },
            { cmd: 'mv manifest.txt exfil',       pause: 700 },
            { cmd: 'ls exfil',                    pause: 1400 },
            { cmd: 'echo they were here all along', pause: 1600 },
            { cmd: 'rm -r exfil',                 pause: 900 },
            { cmd: 'ls',                          pause: 1300 },
            { cmd: 'cd /root',                    pause: 600 },
            { cmd: 'ls',                          pause: 1400 },
            { cmd: 'cat file1.txt',               pause: 1600 },
            { cmd: 'cd',                          pause: 600 },
            { cmd: '8bit',                        pause: 2000 },
            { cmd: '8bit',                        pause: 600 },
            { cmd: 'date',                        pause: 1200 },
            { cmd: "ssh root@185.53.177.52 -p 22 -i id_rsa -o StrictHostKeyChecking=no -password '3treaE$1£'", pause: 1000 }
        ];
    }

    async typeLine(input, line) {
        for (const char of line) {
            if (!autoRunning) return;
            input.value += char;
            // Space bars get a slightly longer beat, the way real typing does.
            await sleep(char === ' ' ? randomBetween(90, 190) : randomBetween(35, 105));
        }
    }

    runLine(line) {
        const args = line.split(' ');
        const entry = commands[line] || commands[args[0]];
        if (!entry) return;
        // Recorded like a real session, so 'history' afterwards shows the break-in.
        pushHistory(line);
        try {
            entry.execute(args);
        } catch (err) {
            appendToOutput(`${args[0]}: ${err.message}`);
        }
    }

    async execute() {
        if (autoRunning) return; // never run two playbacks at once

        const input = document.getElementById('command-input');
        const commandContainer = document.getElementById('command-container');

        // While the playback runs the keyboard belongs to us: Escape aborts,
        // everything else is swallowed so stray keys can't fire a half-typed line.
        const keyGuard = (event) => {
            if (event.key === 'Escape') {
                autoRunning = false;
            }
            event.preventDefault();
            event.stopPropagation();
        };

        autoRunning = true;
        input.readOnly = true;
        document.addEventListener('keydown', keyGuard, true);

        try {
            for (const step of this.script) {
                if (!autoRunning) break;

                await this.typeLine(input, step.cmd);
                if (!autoRunning) break;

                await sleep(randomBetween(250, 500)); // beat before hitting enter
                input.value = '';
                this.runLine(step.cmd);
                commandContainer.scrollIntoView(false);

                await sleep(step.pause);

                // Long-running screens (btop) need closing before moving on.
                if (step.thenStop) stopBtop();
            }

            if (autoRunning) {
                appendToOutput('\n-- connection closed --');
            } else {
                appendToOutput('\n-- aborted --');
            }
        } finally {
            stopBtop(); // in case we aborted while a live screen was up
            autoRunning = false;
            input.readOnly = false;
            input.value = '';
            document.removeEventListener('keydown', keyGuard, true);
            commandContainer.scrollIntoView(false);
            input.focus();
        }
    }
}

// --- btop ------------------------------------------------------------------
// A fake resource monitor. Everything is simulated with a random walk so the
// numbers drift like real load instead of jumping around.

const SPARK = '▁▂▃▄▅▆▇█';
const BAR_FULL = '█';
const BAR_EMPTY = '░';


let btopTimer = null;
let btopKeyHandler = null;
let btopState = null;

function loadColor(percent) {
    if (percent < 40) return COLOR_LOW;
    if (percent < 75) return COLOR_MID;
    return COLOR_HIGH;
}

// Nudge a value around without letting it escape its range.
function drift(value, min, max, step) {
    const next = value + (Math.random() - 0.5) * step;
    return Math.max(min, Math.min(max, next));
}

// Two parts, so the unused portion stays dim instead of taking the load colour.
function barParts(percent, width, color) {
    const filled = Math.round((percent / 100) * width);
    return [
        [BAR_FULL.repeat(filled), color],
        [BAR_EMPTY.repeat(Math.max(0, width - filled)), COLOR_TRACK]
    ];
}

function sparkline(values) {
    return values
        .map(value => SPARK[Math.max(0, Math.min(7, Math.floor(value / 12.6)))])
        .join('');
}

function partsWidth(parts) {
    return parts.reduce((total, part) => total + part[0].length, 0);
}

// Pad a row of [text, color] pairs out to an exact column count.
function padParts(parts, width) {
    const gap = width - partsWidth(parts);
    return gap > 0 ? parts.concat([[' '.repeat(gap), null]]) : parts;
}

// Wrap rows in a titled box. Each row is an array of [text, color] pairs.
function box(title, innerWidth, rows) {
    const heading = `╭─ ${title} `;
    const lines = [];

    lines.push([
        [heading + '─'.repeat(Math.max(0, innerWidth + 2 - heading.length + 1)) + '╮', COLOR_FRAME]
    ]);

    for (const row of rows) {
        lines.push([['│ ', COLOR_FRAME]].concat(padParts(row, innerWidth)).concat([[' │', COLOR_FRAME]]));
    }

    lines.push([['╰' + '─'.repeat(innerWidth + 2) + '╯', COLOR_FRAME]]);
    return lines;
}

// Glue two boxes together column-wise so they sit next to each other.
function sideBySide(leftLines, rightLines) {
    const height = Math.max(leftLines.length, rightLines.length);
    const leftWidth = partsWidth(leftLines[0]);
    const merged = [];

    for (let i = 0; i < height; i++) {
        const left = leftLines[i] ? padParts(leftLines[i], leftWidth) : [[' '.repeat(leftWidth), null]];
        const right = rightLines[i] || [];
        merged.push(left.concat(right));
    }
    return merged;
}

function formatUptime(seconds) {
    const pad = n => String(Math.floor(n)).padStart(2, '0');
    return `${pad(seconds / 3600)}:${pad((seconds % 3600) / 60)}:${pad(seconds % 60)}`;
}

function createBtopState() {
    const processNames = [
        ['garmd',           'root'],
        ['gnipa-watch',     'root'],
        ['systemd',         'root'],
        ['sshd',            'root'],
        ['telemetry-relay', 'daemon'],
        ['hel-indexer',     'root'],
        ['nginx',           'www'],
        ['archive-sync',    'nobody'],
        ['ufo-classifier',  'root'],
        ['postgres',        'postgres'],
        ['containerd',      'root'],
        ['node_exporter',   'prom']
    ];

    return {
        cores: Array.from({ length: 8 }, () => 5 + Math.random() * 60),
        cpuHistory: Array.from({ length: 68 }, () => 20 + Math.random() * 40),
        netDownHistory: Array.from({ length: 34 }, () => Math.random() * 60),
        freq: 3.4,
        temp: 48,
        memUsed: 6.2,
        memCache: 2.1,
        swap: 0.3,
        netDown: 1.2,
        netUp: 0.34,
        uptime: 51727,
        processes: processNames.map(([name, user], index) => ({
            pid: 1337 + index * 97,
            name,
            user,
            cpu: Math.random() * 35,
            mem: 0.4 + Math.random() * 6,
            time: 40 + Math.random() * 4000
        }))
    };
}

function tickBtopState(state) {
    state.cores = state.cores.map(core => drift(core, 0, 100, 26));
    const average = state.cores.reduce((sum, core) => sum + core, 0) / state.cores.length;

    state.cpuHistory.push(average);
    state.cpuHistory.shift();

    state.freq = drift(state.freq, 1.2, 4.8, 0.5);
    state.temp = drift(state.temp, 38, 88, 3);
    state.memUsed = drift(state.memUsed, 3.5, 14.5, 0.5);
    state.memCache = drift(state.memCache, 0.8, 5.0, 0.3);
    state.swap = drift(state.swap, 0, 2.5, 0.15);
    state.netDown = drift(state.netDown, 0.05, 12, 2.2);
    state.netUp = drift(state.netUp, 0.02, 4, 0.8);
    state.uptime += 1;

    state.netDownHistory.push((state.netDown / 12) * 100);
    state.netDownHistory.shift();

    for (const process of state.processes) {
        process.cpu = drift(process.cpu, 0, 60, 12);
        process.mem = drift(process.mem, 0.2, 12, 0.6);
        process.time += 1;
    }
    state.processes.sort((a, b) => b.cpu - a.cpu);
}

function renderBtop(state) {
    const TOTAL_MEM = 16;
    const average = state.cores.reduce((sum, core) => sum + core, 0) / state.cores.length;

    // --- cpu box ---
    const cpuRows = [];
    cpuRows.push([[sparkline(state.cpuHistory), loadColor(average)]]);
    cpuRows.push([
        ['CPU  ', COLOR_LABEL],
        ...barParts(average, 28, loadColor(average)),
        [`${String(Math.round(average)).padStart(4)}%`, loadColor(average)],
        [`   ${state.freq.toFixed(1)} GHz`, null],
        [`   ${Math.round(state.temp)}°C`, loadColor((state.temp - 38) * 2)],
        [`   up ${formatUptime(state.uptime)}`, COLOR_LABEL]
    ]);
    state.cores.forEach((core, index) => {
        cpuRows.push([
            [`C${index}   `, COLOR_LABEL],
            ...barParts(core, 28, loadColor(core)),
            [`${String(Math.round(core)).padStart(4)}%`, loadColor(core)]
        ]);
    });

    // --- mem box ---
    const memRows = [
        [
            ['Used   ', COLOR_LABEL],
            ...barParts((state.memUsed / TOTAL_MEM) * 100, 16, loadColor((state.memUsed / TOTAL_MEM) * 100)),
            [`  ${state.memUsed.toFixed(2)} GiB`, null]
        ],
        [
            ['Cache  ', COLOR_LABEL],
            ...barParts((state.memCache / TOTAL_MEM) * 100, 16, COLOR_LOW),
            [`  ${state.memCache.toFixed(2)} GiB`, null]
        ],
        [
            ['Swap   ', COLOR_LABEL],
            ...barParts((state.swap / 4) * 100, 16, state.swap > 1 ? COLOR_MID : COLOR_LOW),
            [`  ${state.swap.toFixed(2)} GiB`, null]
        ],
        [
            ['Free   ', COLOR_LABEL],
            ...barParts(((TOTAL_MEM - state.memUsed - state.memCache) / TOTAL_MEM) * 100, 16, COLOR_LOW),
            [`  ${(TOTAL_MEM - state.memUsed - state.memCache).toFixed(2)} GiB`, null]
        ]
    ];

    // --- net box ---
    const netRows = [
        [
            ['▼ ', COLOR_LOW],
            [`${state.netDown.toFixed(2)} MiB/s`, COLOR_LOW],
            ['    ▲ ', COLOR_MID],
            [`${state.netUp.toFixed(2)} MiB/s`, COLOR_MID]
        ],
        [[sparkline(state.netDownHistory), COLOR_LOW]],
        [['eth0   185.53.177.52', COLOR_LABEL]],
        [['wlan0  down', COLOR_LABEL]]
    ];

    // --- proc box ---
    const procRows = [[
        ['  PID  PROGRAM           USER        CPU%    MEM%   TIME+', COLOR_LABEL]
    ]];
    for (const process of state.processes.slice(0, 9)) {
        procRows.push([
            [String(process.pid).padStart(5), null],
            ['  ' + process.name.padEnd(17), null],
            [process.user.padEnd(10), COLOR_LABEL],
            [String(process.cpu.toFixed(1)).padStart(5), loadColor(process.cpu)],
            [String(process.mem.toFixed(1)).padStart(8), null],
            ['   ' + formatUptime(process.time), COLOR_LABEL]
        ]);
    }

    return []
        .concat(box('cpu', 74, cpuRows))
        .concat(sideBySide(box('mem', 34, memRows), box('net', 36, netRows)))
        .concat(box('proc', 74, procRows))
        .concat([[['  esc / q  quit', COLOR_LABEL]]]);
}

export function stopBtop() {
    if (btopTimer) {
        clearInterval(btopTimer);
        btopTimer = null;
    }
    if (btopKeyHandler) {
        document.removeEventListener('keydown', btopKeyHandler, true);
        btopKeyHandler = null;
    }
    btopState = null;
}

export class BtopCommand {
    constructor() {
        this.name = "btop";
    }

    execute() {
        echoCommand('btop');
        if (btopTimer) return; // already running

        const screen = document.createElement('pre');
        screen.style.margin = '8px 0';
        screen.style.lineHeight = '1.35';
        output.appendChild(screen);

        btopState = createBtopState();

        const paint = () => {
            screen.textContent = '';
            for (const line of renderBtop(btopState)) {
                for (const [text, color] of line) {
                    const piece = document.createElement('span');
                    piece.textContent = text;
                    if (color) piece.style.color = color;
                    screen.appendChild(piece);
                }
                screen.appendChild(document.createTextNode('\n'));
            }
        };

        paint();

        // q or escape quits, the way the real thing does. 'q' only counts when
        // the prompt is empty, so it doesn't get eaten out of a command you
        // are part way through typing.
        btopKeyHandler = (event) => {
            const promptIsEmpty = document.getElementById('command-input').value.length === 0;
            const quitKey = event.key === 'Escape'
                || ((event.key === 'q' || event.key === 'Q') && promptIsEmpty);
            if (!quitKey) return;
            event.preventDefault();
            event.stopPropagation();
            stopBtop();
        };
        document.addEventListener('keydown', btopKeyHandler, true);

        btopTimer = setInterval(() => {
            tickBtopState(btopState);
            paint();
        }, 1000);
    }
}

// --- mayhem ----------------------------------------------------------------
// Anything that would wreck a real box kicks off a scripted meltdown instead.
// Nothing is actually harmed: the filesystem is rebuilt from a snapshot and
// every element and style added here is torn down at the end. Escape aborts.

const DESTRUCTIVE_PATTERNS = [
    /\brm\b[^;|]*\s-{1,2}[a-z]*f/i,              // rm -f, rm -rf, rm -fr
    /\brm\b[^;|]*--force/i,                       // rm --force
    /\bformat\b/i,                                // format, format c:
    /\bmkfs(\.[a-z0-9]+)?\b/i,
    /\bdd\b[^;|]*\bif=\/dev\/(zero|u?random)/i,
    /\bshred\b/i,
    /\bwipefs\b/i,
    /\b(fdisk|diskpart)\b/i,
    /\bdel\b[^;|]*\/[sfq]\b/i,                    // del /f /s /q
    /:\(\)\s*\{[^}]*\}\s*;?\s*:/,                 // fork bomb
    /\bchmod\b[^;|]*-R[^;|]*\b000\b/i,
    /\b(halt|poweroff|shutdown)\b[^;|]*-f/i
];

export function isDestructive(line) {
    return DESTRUCTIVE_PATTERNS.some(pattern => pattern.test(line));
}

// Taken once at load, so the meltdown can put everything back afterwards.
const FS_SNAPSHOT = JSON.stringify(fileSystem);

const GLITCH_CHARS = '▓▒░█▚▞╳⌁‡¿¥§ØÆΔΞ#@%&';

const DOOMED_PATHS = [
    '/root/hidden/secrets/topsecret_materials.pdf',
    '/root/hidden/secrets/confidential_report.docx',
    '/root/hidden/secrets/ufo_photo.png',
    '/root/hidden/pictures/whistleblower.jpg',
    '/root/hidden/secret_readme.txt',
    '/etc/shadow',
    '/etc/ssh/sshd_config',
    '/var/log/auth.log',
    '/var/log/syslog',
    '/var/spool/archive/ingest.db',
    '/usr/lib/x86_64-linux-gnu/libc.so.6',
    '/usr/bin/sudo',
    '/lib/systemd/systemd',
    '/boot/vmlinuz-5.15.0-105-generic',
    '/boot/initrd.img-5.15.0-105-generic',
    '/home/glenn/.ssh/id_ed25519',
    '/home/glenn/.bash_history',
    '/proc/1/ns/mnt',
    '/dev/sda1',
    '/'
];

const EXFIL_HOSTS = [
    '91.243.88.14:443',
    '45.77.201.9:8443',
    '185.220.101.34:9001',
    '104.244.79.61:443'
];

const MAYHEM_CSS = `
@keyframes mayhem-shake {
  0%   { transform: translate(0px, 0px)   }
  25%  { transform: translate(-4px, 2px)  }
  50%  { transform: translate(3px, -3px)  }
  75%  { transform: translate(-2px, -1px) }
  100% { transform: translate(4px, 1px)   }
}
@keyframes mayhem-flicker {
  0%, 100% { opacity: 1 }
  47%      { opacity: 1 }
  48%      { opacity: 0.25 }
  52%      { opacity: 1 }
  73%      { opacity: 0.6 }
}
.mayhem-shake  { animation: mayhem-shake 0.13s infinite steps(2); }
.mayhem-split  { text-shadow: 2px 0 #ff00c1, -2px 0 #00fff9; }
.mayhem-invert { filter: invert(1) hue-rotate(90deg); }
#mayhem-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 9999;
  mix-blend-mode: screen;
}
#mayhem-overlay .slice {
  position: absolute; left: 0; right: 0;
  background: rgba(0, 255, 249, 0.14);
  border-top: 1px solid rgba(255, 0, 193, 0.5);
}
`;

let mayhemRunning = false;
let mayhemStyle = null;
let mayhemOverlay = null;
let mayhemTimers = [];
let mayhemKeyHandler = null;

function corrupt(text, intensity) {
    let out = '';
    for (const char of text) {
        out += (char !== ' ' && Math.random() < intensity)
            ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            : char;
    }
    return out;
}

function mayhemLine(text, color, weight) {
    const line = document.createElement('div');
    line.textContent = text;
    if (color) line.style.color = color;
    if (weight) line.style.fontWeight = weight;
    output.appendChild(line);
    document.getElementById('command-container').scrollIntoView(false);
    return line;
}

function startVisualChaos() {
    mayhemStyle = document.createElement('style');
    mayhemStyle.textContent = MAYHEM_CSS;
    document.head.appendChild(mayhemStyle);

    mayhemOverlay = document.createElement('div');
    mayhemOverlay.id = 'mayhem-overlay';
    document.body.appendChild(mayhemOverlay);

    document.body.classList.add('mayhem-shake', 'mayhem-split');

    // Tearing: bright bands that jump around the viewport.
    mayhemTimers.push(setInterval(() => {
        mayhemOverlay.textContent = '';
        const bands = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < bands; i++) {
            const slice = document.createElement('div');
            slice.className = 'slice';
            slice.style.top = `${Math.random() * 100}%`;
            slice.style.height = `${2 + Math.random() * 26}px`;
            slice.style.transform = `translateX(${(Math.random() - 0.5) * 60}px)`;
            mayhemOverlay.appendChild(slice);
        }
    }, 110));

    // Shove random blocks of the page sideways, then let them snap back.
    mayhemTimers.push(setInterval(() => {
        const blocks = Array.from(document.querySelectorAll('#alienBlock, [id="8bitMageBlock"], .text-block, .command-output > div'));
        if (blocks.length === 0) return;
        const victim = blocks[Math.floor(Math.random() * blocks.length)];
        victim.style.transform = `translateX(${(Math.random() - 0.5) * 90}px) skewX(${(Math.random() - 0.5) * 22}deg)`;
        victim.style.filter = Math.random() < 0.4 ? 'hue-rotate(180deg)' : '';
        mayhemTimers.push(setTimeout(() => {
            victim.style.transform = '';
            victim.style.filter = '';
        }, 180));
    }, 160));

    // Occasional full inversion, like a display losing sync.
    mayhemTimers.push(setInterval(() => {
        if (Math.random() < 0.35) {
            document.body.classList.add('mayhem-invert');
            mayhemTimers.push(setTimeout(() => document.body.classList.remove('mayhem-invert'), 70));
        }
    }, 700));
}

function stopVisualChaos() {
    for (const timer of mayhemTimers) {
        clearInterval(timer);
        clearTimeout(timer);
    }
    mayhemTimers = [];

    document.body.classList.remove('mayhem-shake', 'mayhem-split', 'mayhem-invert');

    for (const el of document.querySelectorAll('#alienBlock, [id="8bitMageBlock"], .text-block, .command-output > div')) {
        el.style.transform = '';
        el.style.filter = '';
    }

    if (mayhemOverlay) { mayhemOverlay.remove(); mayhemOverlay = null; }
    if (mayhemStyle) { mayhemStyle.remove(); mayhemStyle = null; }
}

// Genuinely empties the in-memory tree, so 'ls' really is bare if you look
// mid-meltdown. Always paired with restoreFilesystem() in the finally block.
function wipeFilesystem() {
    fileSystem.files = [];
    fileSystem.folders = [];
    currentDirectory = fileSystem;
    currentPath = [ROOT_NAME];
}

function restoreFilesystem() {
    const fresh = JSON.parse(FS_SNAPSHOT);
    fileSystem.files = fresh.files;
    fileSystem.folders = fresh.folders;
    currentDirectory = homeFolder;
    currentPath = homePath.slice();
}

export async function runMayhem(line) {
    if (mayhemRunning) return;
    mayhemRunning = true;

    const input = document.getElementById('command-input');
    input.readOnly = true;

    mayhemKeyHandler = (event) => {
        if (event.key === 'Escape') mayhemRunning = false;
        event.preventDefault();
        event.stopPropagation();
    };
    document.addEventListener('keydown', mayhemKeyHandler, true);

    const alive = () => mayhemRunning;

    try {
        echoCommand(line);

        // Phase 1 - looks like it is just doing its job.
        await sleep(400);
        mayhemLine('rm: descending into /', COLOR_LABEL);
        await sleep(500);

        for (const path of DOOMED_PATHS.slice(0, 5)) {
            if (!alive()) return;
            mayhemLine(`removed '${path}'`, COLOR_LABEL);
            await sleep(180);
        }

        // Phase 2 - it does not stop.
        if (!alive()) return;
        mayhemLine("rm: cannot remove '/proc/1/ns/mnt': Device or resource busy", COLOR_MID);
        await sleep(400);
        mayhemLine('rm: continuing anyway', COLOR_HIGH, 'bold');
        await sleep(600);

        startVisualChaos();

        let delay = 120;
        for (let i = 0; i < 34; i++) {
            if (!alive()) return;
            const path = DOOMED_PATHS[Math.floor(Math.random() * DOOMED_PATHS.length)];
            const intensity = Math.min(0.5, i / 70);
            mayhemLine(corrupt(`unlinked ${path}`, intensity), COLOR_HIGH);
            delay = Math.max(28, delay * 0.9);
            await sleep(delay);
        }

        // Phase 3 - somebody else is taking the data.
        if (!alive()) return;
        mayhemLine('', null);
        for (const host of EXFIL_HOSTS) {
            if (!alive()) return;
            mayhemLine(`[exfil] opening tunnel  ${host}`, '#00fff9');
            await sleep(260);
            const size = (2 + Math.random() * 40).toFixed(1);
            mayhemLine(`[exfil] POST /ingest    ${size} MiB  ${'█'.repeat(12 + Math.floor(Math.random() * 10))}  ok`, '#00fff9');
            await sleep(300);
        }
        mayhemLine('[exfil] beacon installed, persistence via systemd-timer', '#ff00c1');
        await sleep(500);

        // Phase 4 - the filesystem is gone.
        if (!alive()) return;
        wipeFilesystem();
        for (let i = 0; i < 12; i++) {
            if (!alive()) return;
            mayhemLine(corrupt('SEGFAULT  vfs_unlink  0xDEADBEEF  no such device', 0.15 + i * 0.05), COLOR_HIGH);
            await sleep(70);
        }

        // Phase 5 - kernel panic.
        if (!alive()) return;
        mayhemLine('', null);
        mayhemLine('Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(0,0)', COLOR_HIGH, 'bold');
        await sleep(300);
        mayhemLine('CPU: 3 PID: 1 Comm: systemd Tainted: G      D           5.15.0-105-generic', COLOR_LABEL);
        await sleep(200);
        mayhemLine('Call Trace:  panic+0x10b  mount_block_root+0x1e7  prepare_namespace+0x13e', COLOR_LABEL);
        await sleep(1400);

        // Phase 6 - it was never real.
        stopVisualChaos();
        output.innerHTML = '';
        await sleep(700);

        mayhemLine('-- watchdog tripped, rolling back to snapshot --', COLOR_LABEL);
        await sleep(900);
        restoreFilesystem();
        mayhemLine('filesystem restored.  0 files actually harmed.', COLOR_LOW);
        await sleep(400);
        mayhemLine('nice try.', COLOR_MID, 'bold');
    } finally {
        mayhemRunning = false;
        stopVisualChaos();
        restoreFilesystem();
        document.removeEventListener('keydown', mayhemKeyHandler, true);
        mayhemKeyHandler = null;
        input.readOnly = false;
        input.value = '';
        input.focus();
        document.getElementById('command-container').scrollIntoView(false);
    }
}

export const commands = {
    auto: new AutoCommand(),
    btop: new BtopCommand(),
    ls: new LsCommand(),
    cat: new CatCommand(),
    cd: new CdCommand(),
    mkdir: new MkdirCommand(),
    repo: new RepoCommand(),
    clear: new ClearCommand(),
    alien: new AlienCommand(),
    "8bit": new EightBitCommand(),
    ifconfig: new IfconfigCommand(),
    ipconfig: new IfconfigCommand(),
    lsblk: new LsblkCommand(),
    top: new TopCommand(),
    history: new HistoryCommand(),
    pwd: new PwdCommand(),
    whoami: new WhoamiCommand(),
    touch: new TouchCommand(),
    rm: new RmCommand(),    
    echo: new EchoCommand(),   
    mv: new MvCommand(),   
    date: new DateCommand(),
    help: new HelpCommand(),
    git: new GitCommand(),
    matrix: new MatrixCommand(),
    code: new CodeCommand(),
    _47313638: new tlfCommand(),
    open: new OpenCommand(),
    ssh: new SshCommand(),
    "ssh root@185.53.177.52 -p 22 -i id_rsa -o StrictHostKeyChecking=no -password '3treaE$1£'": new SshCommand()
};   