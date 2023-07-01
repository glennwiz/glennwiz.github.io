const commandInput = document.getElementById('command-input');
const outputContainer = document.getElementById('output-container');
const commandContainer = document.getElementById('command-container');
const terminalDivs = document.getElementsByClassName('terminal');

let isAlienBlockVisible = false;
let is8bitBlockVisible = false;

// Hide terminal divs initially
Array.from(terminalDivs).forEach(div => {
    div.style.display = 'none';
});

/ Let's create a simple file system structure
let fileSystem = {
    root: {
        pictures: {},
        secret: {}
    }
};

let currentDirectory = 'root';

commandInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const commandParts = commandInput.value.split(' ');
        const command = commandParts[0];
        commandInput.value = '';

        if (command === 'clear') {
            outputContainer.innerHTML = ''; // Clear the output container
        } else {
            const output = document.createElement('div');
            output.className = 'command-output';

            if (command === 'ls') {
                const fileSystemListing = `
    Directory: /root/hidden/
    
    Mode         LastWriteTime         Length Name
    ----         -------------         ------ ----
    d----        07/06/2023      19:02                <span class="directory-name">  pictures</span>
    d----        07/06/2023      20:11                <span class="directory-name">  secret</span>`;

                output.innerHTML = fileSystemListing;
            }else if (command === 'alien') {
                var element = document.getElementById('alienBlock');
                if (!isAlienBlockVisible) {       // if the block is not visible
                    element.style.display = '';    // make it visible
                    isAlienBlockVisible = true;    // update our flag
                } else {                           // if the block is already visible
                    element.style.display = 'none';// hide it,
                    isAlienBlockVisible = false;   // update our flag
                }
            } else if (command === '8bit') {
                var element = document.getElementById('8bitMageBlock');
                if (!is8bitBlockVisible) {       // if the block is not visible
                    element.style.display = '';    // make it visible
                    is8bitBlockVisible = true;    // update our flag
                } else {                           // if the block is already visible
                    element.style.display = 'none';// hide it,
                    is8bitBlockVisible = false;   // update our flag
                }
            }
            else if (command === 'cd secret') {
                const secretFilesListing = `
    Directory: /root/hidden/secret/
    
    Mode         LastWriteTime             Length    Name
    ----         -------------             ------    ----
    -a---        07/06/2023      21:30     564KB     topsecret_materials.pdf
    -a---        07/06/2023      21:32     1.2MB     ufo_photo.png
    -a---        07/06/2023      21:35     876KB     secret_photo.jpg
    -a---        07/06/2023      21:38     2.3MB     confidential_report.docx
    -a---        07/06/2023      23:33     0.1MB     readme.txt
    
    `;


                output.innerHTML = secretFilesListing;
            } else if (command === 'cd pictures') {
                const picturesListing = `
    Directory: /root/hidden/pictures/
    
    Mode         LastWriteTime             Length     Name
    ----         -------------             ------     ----
    -a---        07/06/2023      22:00     1.5MB     alien_world.jpg
    -a---        07/06/2023      22:05     1.8MB     david_grush_hidden.png
    -a---        07/06/2023      22:10     2.1MB     whistleblower.jpg
    -a---        07/06/2023      22:15     2.5MB     proxima_prof.png
    -a---        07/06/2023      23:33     0.1MB     readme.txt
    `;

                output.innerHTML = picturesListing;
            }
            else if (command === 'cat readme.txt') {
                const readmeContent = `
      This is the readme file for the deep secrets. 
    
      All the files listed in this directory are highly confidential and are not meant to be shared outside the organisation.
    
      Please, handle the files with care.
      
      To open a file use the command 'open <filename>'.
      `;

                output.innerHTML = readmeContent;
            }
            else if (command === 'ifconfig' || command === 'ipconfig') {
                const ipInfo = `
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

                output.innerHTML = ipInfo;
            } else if (command === 'lsblk') {
                const blockDevicesListing = `
        NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
        sda      8:0    0   20G  0 disk 
        └─sda1   8:1    0   20G  0 part /
        sdb      8:16   0   50G  0 disk 
        └─sdb1   8:17   0   50G  0 part /mnt/data
        sdc      8:32   0  100G  0 disk 
        `;

                output.innerHTML = blockDevicesListing;
            } else if (command === 'top') {
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

                output.innerHTML = processListing;
            } else if (command === 'history') {
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

                output.innerHTML = commandHistory;
            }
            else if (command === 'pwd') {
                const currentDirectory = '/root/hidden/';
                output.textContent = currentDirectory;
            }
            else if (command === 'whoami') {
                const player = 'root';
                output.textContent = player;
            }
            else if (command.startsWith('touch')) {
                const fileName = command.substring(6);
                const newFile = document.createElement('span');
                newFile.textContent = fileName;
                output.appendChild(newFile);
            }
            else if (command.startsWith('rm -rf'))
            {
                const directoryName = command.substring(7);
                const deletedDirectory = document.createElement('span');
                deletedDirectory.textContent = directoryName + ' (deleted)';
                output.appendChild(deletedDirectory);
            }
            else if (command.startsWith('echo '))
            {
                const message = command.substring(5);
                output.textContent = message;
            }
            else if (command === 'cd') {
                const newDirectory = commandParts[1];
                if (newDirectory in fileSystem[currentDirectory]) {
                    currentDirectory = newDirectory;
                    output.textContent = 'Changed directory to ' + newDirectory;
                } else {
                    output.textContent = 'No such directory: ' + newDirectory;
                }
            }
            else if (command === 'mkdir') {
                const newDirectory = commandParts[1];
                if (!(newDirectory in fileSystem[currentDirectory])) {
                    fileSystem[currentDirectory][newDirectory] = {};
                    output.textContent = 'Created new directory: ' + newDirectory;
                } else {
                    output.textContent = 'Directory already exists: ' + newDirectory;
                }
            }
            else if (command.startsWith('cat ')) {
                const fileName = command.substring(4);
                const fileContent = 'This is the content of ' + fileName;
                output.textContent = fileContent;
            }
            else if (command.startsWith('mv ')) {
                const args = command.split(' ');
                const source = args[1];
                const destination = args[2];
                const moveMessage = `Moved ${source} to ${destination}`;
                output.textContent = moveMessage;
            }
            else if (command === 'date')
            {
                const currentDate = new Date().toLocaleString();
                output.textContent = currentDate;
            }
            else if (command === 'help') {
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
                output.innerHTML = availableCommands;
            } else {
                output.textContent = command;
            }

            outputContainer.appendChild(output);
            outputContainer.scrollTop = 0; // Scroll to the top of the output container

            // Show terminal divs when "git" command is typed
            if (command.includes('git')) {
                Array.from(terminalDivs).forEach(div => {
                    div.style.display = 'block';
                });
            }

            if (command.includes('git hide')) {
                Array.from(terminalDivs).forEach(div => {
                    div.style.display = 'none';
                });
            }
        }

        commandContainer.scrollIntoView(false);
    }
});

window.addEventListener('load', function() {
    localStorage.clear(); // Clear command history on page load
    commandInput.focus();
});