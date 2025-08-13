import { commands } from './commands.js';

const commandInput = document.getElementById('command-input');
const outputContainer = document.getElementById('output-container');
const commandContainer = document.getElementById('command-container');

export const terminalDivs = document.getElementsByClassName('terminal');
export const codeDivs = document.getElementsByClassName("codeblock");
export let isAlienBlockVisible = false;
export let is8bitBlockVisible = false;

// Hide terminal divs initially
Array.from(terminalDivs).forEach(div => {
    div.style.display = 'none';
});

Array.from(codeDivs).forEach(div => {
    div.style.display = 'none';
});

// Let's create a simple file system structure


commandInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const raw = event.target.value.trim();
        const args = raw.split(' ');
        const command = args[0];
        commandInput.value = '';
        console.log(`Command: ${command}`);
        console.log(`Args: ${args}`)
        console.log(commands)
        // Exact-match full-line commands first (e.g., the special ssh line)
        if (raw in commands) {
            console.log('Exact command match');
            commands[raw].execute(args);
            commandInput.focus()
            commandContainer.scrollIntoView(false);
        }
        else if(command in commands) {
            console.log('Command found');
            commands[command].execute(args);
            commandInput.focus()
            commandContainer.scrollIntoView(false);
        } else {
            console.log(`Unknown command: ${command}`);
            commandInput.focus()
            commandContainer.scrollIntoView(false);
        }
    }
});

window.addEventListener('load', function() {
    localStorage.clear(); // Clear command history on page load
    commandInput.focus();
});