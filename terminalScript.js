import { commands } from './commands.js';

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

// Let's create a simple file system structure
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
        const args = event.target.value.split(' ');
        const command = args[0];
        commandInput.value = '';
        console.log(`Command: ${command}`);
        console.log(`Args: ${args}`)
        console.log(commands)
        if(command in commands) {
            console.log('Command found');
            commands[command].execute(args); //todo: are we passing args?
        } else {
            console.log(`Unknown command: ${command}`);
        }
    }
});

window.addEventListener('load', function() {
    localStorage.clear(); // Clear command history on page load
    commandInput.focus();
});