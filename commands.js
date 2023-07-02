const output = document.createElement('div');
output.className = 'command-output';
const outputContainer = document.getElementById('output-container');
outputContainer.appendChild(output);

import { isAlienBlockVisible } from './terminalScript.js';
import { is8bitBlockVisible } from './terminalScript.js';

let currentDirectory = 'hidden';

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
    constructor() {
        this.name = "ls";
    }
    
    execute() {
        let fileSystemListing = `
root@blackmage:~$ ls

Directory: /root/hidden/

Mode         LastWriteTime         Length Name
----         -------------         ------ ----
d----        07/06/2023      19:02                <span class="directory-name">  pictures</span>
d----        07/06/2023      20:11                <span class="directory-name">  secret</span>`;

        if (currentDirectory === 'secret' || currentDirectory === 'secrets') {
            const secretFilesListing = `
root@blackmage:~$ ls            
            
Directory: /root/hidden/secret/

Mode         LastWriteTime             Length    Name
----         -------------             ------    ----
-a---        07/06/2023      21:30     564KB     topsecret_materials.pdf
-a---        07/06/2023      21:32     1.2MB     ufo_photo.png
-a---        07/06/2023      21:35     876KB     secret_photo.jpg
-a---        07/06/2023      21:38     2.3MB     confidential_report.docx
-a---        07/06/2023      23:33     0.1MB     readme.txt`;

            fileSystemListing = secretFilesListing;
        }
        if(currentDirectory === 'pictures') {

            const picturesListing = `
root@blackmage:~$ ls
            
Directory: /root/hidden/pictures/

Mode         LastWriteTime             Length     Name
----         -------------             ------     ----
-a---        07/06/2023      22:00     1.5MB     alien_world.jpg
-a---        07/06/2023      22:05     1.8MB     david_grush_hidden.png
-a---        07/06/2023      22:10     2.1MB     whistleblower.jpg
-a---        07/06/2023      22:15     2.5MB     proxima_prof.png
-a---        07/06/2023      23:33     0.1MB     readme.txt
    `;

            fileSystemListing = picturesListing;
        }

        output.innerHTML += fileSystemListing;
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

let fileSystem = {
    root: {
        hidden: {
            pictures: {},
            secret: {}
        }
    }
};

function findFolder(obj, folderName) {
    for(let key in obj) {
        if(key === folderName) {
            return obj[key];
        }
        if(typeof obj[key] === "object") {
            let result = findFolder(obj[key], folderName);
            if(result) {
                return result;
            }
        }
    }
}

export class CdCommand {
    constructor() {
        this.name = "cd";
    }   
    execute(myArgs)  {
        console.log('cd');
        const changeToDirectory = myArgs[1];
        console.log('arg1 ' + changeToDirectory)
        console.log(fileSystem);

        // Check if the directory exists
        //loop through the file system and check if the directory exists
        let folder = findFolder(fileSystem, changeToDirectory);
        if(folder !== undefined) {
            console.log('folder exist' + folder);
            currentDirectory = changeToDirectory;
            const directoryChanged = `
root@blackmage:~$ cd ${changeToDirectory}
            `;
            output.innerHTML += directoryChanged;
        } else {
            const noFound = `
root@blackmage:~$ cd ${changeToDirectory}
cd : Cannot find path '/root/hidden/${changeToDirectory}' because it does not exist.
            `;
            output.innerHTML += noFound;
        }
        
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
                console.log(repos); // Print the repositories to the console
                repos.forEach(repo => {
                    console.log(repo.name); // Print each repo name
                });

                let ul = document.createElement('ul');

                repos.forEach(repo => {
                    let li = document.createElement('li');
                    let anchor = document.createElement('a');
                    anchor.href = repo.html_url;
                    anchor.target = "_blank";
                    anchor.rel = "noopener noreferrer";
                    anchor.textContent = repo.name;
                    li.appendChild(anchor);
                    ul.appendChild(li);
                });

// Append the ul element to your document or a specific element. Here we are appending to document body
                document.body.appendChild(ul);
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

export class PwdCommand {
    constructor() {
        this.name = "pwd";
    }

    execute()  {
        appendToOutput(currentDirectory);
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
        - help: Show available commands.
        `;
        output.innerHTML +=availableCommands;
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
    aitbit: new EightBitCommand(),
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
    help: new HelpCommand()
};   

   
