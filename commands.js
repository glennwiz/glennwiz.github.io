const output = document.createElement('div');
output.className = 'command-output';
const outputContainer = document.getElementById('output-container');
outputContainer.appendChild(output);

import { codeDivs, isAlienBlockVisible } from './terminalScript.js';
import { is8bitBlockVisible } from './terminalScript.js';
import { terminalDivs } from './terminalScript.js';

let currentDirectory = null;
let currentPath = [];

function findFolder(obj, folderName) {
    console.log("----Searching for folder: ", folderName);
    console.log(obj)
    if(obj.name === folderName){
        console.log("1----Folder Found: ", obj);
        return obj;
    }

    for(let i=0; i<obj.folders.length; i++){
        let found = findFolder(obj.folders[i], folderName);
        if(found) {
            console.log("2---->Folder Found: ", found);
            return found;
        }
    }
    console.log("9999---->-Folder not found");
    return null;
}

let fileSystem = {
    name: "root",
    mode: "rw-r--r--",
    lastWriteTime: "2023-01-03 10:13",
    length: 12354,
    files: [
        {
            mode: "rw-r--r--",
            lastWriteTime: "2023-01-03 10:13",
            length: 12354,
            name: "file1.txt"
        },
        {
            mode: "rw-r--r--",
            lastWriteTime: "2023-01-05 14:15",
            length: 765,
            name: "file2.png"
        },
    ],
    folders: [
        {
            name: "hidden",
            mode: "rw-r--r--",
            lastWriteTime: "2023-01-03 10:13",
            length: 12354,
            files: [
                {
                    mode: "rw-r--r--",
                    lastWriteTime: "2023-01-06 04:23",
                    length: 56123,
                    name: "secret_readme.txt"
                },                
            ],
            folders: [
                {
                    mode: "rw-r--r--",
                    lastWriteTime: "2023-01-03 10:13",
                    length: null,
                    name : "pictures",
                    "files": [
                        {
                            "mode": "-a---",
                            "lastWriteTime": "07/06/2023 22:00",
                            "length": "1.5MB",
                            "name": "alien_world.jpg"
                        },
                        {
                            "mode": "-a---",
                            "lastWriteTime": "07/06/2023 22:05",
                            "length": "1.8MB",
                            "name": "david_grush_hidden.png"
                        },
                        {
                            "mode": "-a---",
                            "lastWriteTime": "07/06/2023 22:10",
                            "length": "2.1MB",
                            "name": "whistleblower.jpg"
                        },
                        {
                            "mode": "-a---",
                            "lastWriteTime": "07/06/2023 22:15",
                            "length": "2.5MB",
                            "name": "proxima_prof.png"
                        },
                        {
                            "mode": "-a---",
                            "lastWriteTime": "07/06/2023 23:33",
                            "length": "0.1MB",
                            "name": "readme.txt"
                        }
                    ],
                    folders: []
                },
                {
                    mode: "rw-r--r--",
                    lastWriteTime: "2023-01-03 10:13",
                    length: null,
                    name : "secrets",
                    files: [
                        {
                            "mode": "rw-r--r--",
                            "lastWriteTime": "2023-01-06 04:23",
                            "length": 56123,
                            "name": "secret_readme.txt"
                        },
                        {
                            "mode": "-a---",
                            "lastWriteTime": "07/06/2023 21:30",
                            "length": "564KB",
                            "name": "topsecret_materials.pdf"
                        },
                        {
                            "mode": "-a---",
                            "lastWriteTime": "07/06/2023 21:32",
                            "length": "1.2MB",
                            "name": "ufo_photo.png"
                        },
                        {
                            "mode": "-a---",
                            "lastWriteTime": "07/06/2023 21:35",
                            "length": "876KB",
                            "name": "secret_photo.jpg"
                        },
                        {
                            "mode": "-a---",
                            "lastWriteTime": "07/06/2023 21:38",
                            "length": "2.3MB",
                            "name": "confidential_report.docx"
                        },
                        {
                            "mode": "-a---",
                            "lastWriteTime": "07/06/2023 23:33",
                            "length": "0.1MB",
                            "name": "readme.txt"
                        }
                    ],
                    folders: []
                },
            ]
        }
    ]
};

// Initialize current directory (default to root/hidden if present)
const hiddenFolderInit = fileSystem.folders.find(folder => folder.name === "hidden");
currentDirectory = hiddenFolderInit || fileSystem;
currentPath = ['root'];
if (hiddenFolderInit) {
    currentPath.push('hidden');
}

function findChildFolder(parentFolder, folderName) {
    if (!parentFolder || !parentFolder.folders) return null;
    return parentFolder.folders.find(f => f.name === folderName) || null;
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

export class LsCommand {
    constructor(fileSystem) {
        this.name = "ls";
        this.fileSystem = fileSystem;
    }

    generateListing(currentFolder, depth = 0) {
        let output = '';
        let prefix = "🗍"; // folder
        output += "\nroot@blackmage:~$ ls\n";
        // list sub-folders
        for(const folder of currentFolder.folders) {
            // Example of Unix-like file attributes
            const attributes = 'drwxr-xr-x   1 root root';

            const date = formatUnixDate(folder.lastWriteTime);
            const lengthDisplay = '-';

            output += `${attributes} ${date} ${lengthDisplay} ${prefix} ${folder.name}/\n`;
        }

        // list files in folder
        for(const file of currentFolder.files) {
            // Example of Unix-like file attributes
            const attributes = '-rw-r--r--   1 root root';

            const date = formatUnixDate(file.lastWriteTime);
            const fileSizeDisplay = (file.length !== undefined && file.length !== null) ? file.length : '-';
            prefix = "\uD83D\uDDCE"; // file
            output += `${attributes} ${date} ${fileSizeDisplay} ${prefix} ${file.name}\n`;
        }

        return output;
    }
    
    execute() {
        console.log("ls command executed");
        console.log(fileSystem)
        console.log("------------");
        console.log(currentDirectory)
        console.log("------------");
        let result = "";

        if (!currentDirectory) {
            currentDirectory = hiddenFolderInit || fileSystem;
        }

        result = this.generateListing(currentDirectory);
        output.innerHTML += result;
    }
}

export class PwdCommand {
    constructor() {
        this.name = "pwd";
    }

    execute() {
        console.log("pwd")
        console.log(currentDirectory)
        console.log("pwd")
        const path = "/" + currentPath.join('/') + "/";
        appendToOutput(path);
    }
}

export class CdCommand { //TODO: fix file system
    constructor() {
        this.name = "cd";
    }
    execute(myArgs)  {
        console.log('cd');
        const changeToDirectory = myArgs[1];
        console.log('arg1 ' + changeToDirectory)
        console.log(fileSystem);

        if (!changeToDirectory) {
            output.innerHTML += `\nroot@blackmage:~$ cd\n`;
            return;
        }

        if (changeToDirectory === '..') {
            if (currentPath.length > 1) {
                currentPath.pop();
                // Recompute currentDirectory by walking from root using currentPath
                let cursor = fileSystem;
                for (let i = 1; i < currentPath.length; i++) {
                    cursor = findChildFolder(cursor, currentPath[i]) || cursor;
                }
                currentDirectory = cursor;
            }
            output.innerHTML += `\nroot@blackmage:~$ cd ..\n`;
            return;
        }

        const next = findChildFolder(currentDirectory, changeToDirectory);
        if (next) {
            currentDirectory = next;
            currentPath.push(changeToDirectory);
            output.innerHTML += `\nroot@blackmage:~$ cd ${changeToDirectory}\n`;
        } else {
            const noFound = `\nroot@blackmage:~$ cd ${changeToDirectory}\ncd: cannot find: '/${currentPath.join('/')}/${changeToDirectory}'\n`;
            output.innerHTML += noFound;
        }
    }
}

export class CatCommand {
    constructor() {
        this.name = "cat";
    }

    execute()  {

        //Need to print out the content of the file this is the readme.txt file
        //need to implement the cat command

        const readmeContent = `
      This is the readme file for the deep secrets. 
    
      All the files listed in this directory are highly confidential and are not meant to be shared outside the organisation.
    
      Please, handle the files with care.
      
      To open a file use the command 'open <filename>'.
      `;

        output.innerHTML +=readmeContent;
    }
}

export class MkdirCommand {
    constructor() {
        this.name = "mkdir";
    }

    execute()  {
        const newDirectory = commandParts[1];
        if (!(newDirectory in fileSystem[currentDirectory])) {
            fileSystem[currentDirectory][newDirectory] = {};
            output.textContent = 'Created new directory: ' + newDirectory;
        } else {
            output.textContent = 'Directory already exists: ' + newDirectory;
        }
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
        var element = document.getElementById('alienBlock');
        if (!isAlienBlockVisible) {       // if the block is not visible
            element.style.display = '';    // make it visible
            isAlienBlockVisible = true;    // update our flag
        } else {                           // if the block is already visible
            element.style.display = 'none';// hide it,
            isAlienBlockVisible = false;   // update our flag
        }
    }
}

export class EightBitCommand {
    constructor() {
        this.name = "8bit";
    }

    execute()  {
        var element = document.getElementById('8bitMageBlock');
        if (!is8bitBlockVisible) {       // if the block is not visible
            element.style.display = '';    // make it visible
            is8bitBlockVisible = true;    // update our flag
        } else {                           // if the block is already visible
            element.style.display = 'none';// hide it,
            is8bitBlockVisible = false;   // update our flag
        }
    }
}

export class IfconfigCommand {
    constructor() {
        this.name = "ifconfig";
    }

    execute() {
        const ipInfo = `
root@blackmage:~$ ipconfig        
        
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
root@blackmage:~$ lsblk

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
        const commandHistory = `
        

 1  ls
 2  cd secrets
 3  ifconfig
 4  lsblk
 5  top
 6  cat myfile.txt
 7  cp file1.txt file2.txt
 8  mv file.txt newdir/
 9  mkdir newdir
10  rm myfile.txt
11  ssh root@185.53.177.52 -p 22 -i id_rsa -o StrictHostKeyChecking=no -password '3treaE$1£'
        `;

        output.innerHTML += commandHistory;
    }
}



export class WhoamiCommand {
    constructor() {
        this.name = "whoami";
    }

    execute()  {
        const player = 'root';
        output.textContent = player;
    }
}

export class TouchCommand {
    constructor() {
        this.name = "touch";
    }

    execute()  {
        const fileName = command.substring(6);
        const newFile = document.createElement('span');
        newFile.textContent = fileName;
        output.appendChild(newFile);
    }
}

export class RmCommand {
    constructor() {
        this.name = "rm -rf";
    }

    execute()  {
        const directoryName = command.substring(7);
        const deletedDirectory = document.createElement('span');
        deletedDirectory.textContent = directoryName + ' (deleted)';
        output.appendChild(deletedDirectory);
    }
}

export class EchoCommand {
    constructor() {
        this.name = "echo";
    }

    execute()  {
        const message = command.substring(5);
        output.textContent = message;
    }
}

export class MvCommand {
    constructor() {
        this.name = "mv";
    }

    execute()  {
        const source = args[1];
        const destination = args[2];
        const moveMessage = `Moved ${source} to ${destination}`;
        output.textContent = moveMessage;
    }
}

export class DateCommand {
    constructor() {
        this.name = "date";
    }

    execute()  {
        const currentDate = new Date().toLocaleString();
        output.textContent = currentDate;
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
        - git: Show the git info.
        - code: Show snippets
        - vim: Show vim commands
        - ls: List files and directories.
        - cd <directory>: Change the current directory.
        - ifconfig: Display network configuration.
        - ipconfig: Display network configuration.
        - lsblk: List block devices.
        - top: Display system processes.
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
        Array.from(terminalDivs).forEach(div => {
            if (div.style.display === "none") {
                div.style.display = "block";
            } else {
                div.style.display = "none";
            }
        });
    }
}

export class CodeCommand {
    constructor() {
        this.name = "code";
    }

    execute() {
        // Show or hide terminal divs 
        Array.from(codeDivs).forEach(div => {
            if (div.style.display === "none") {
                div.style.display = "block";
            } else {
                div.style.display = "none";
            }
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
        

export const commands = {
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
    _47313638: new tlfCommand()
};   