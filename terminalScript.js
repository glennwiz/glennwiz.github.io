import { commands, pushHistory, getHistory, getCompletions, printCompletions, isDestructive, runMayhem } from './commands.js';

const commandInput = document.getElementById('command-input');
const outputContainer = document.getElementById('output-container');
const commandContainer = document.getElementById('command-container');

export const terminalDivs = document.getElementsByClassName('terminal');
export const codeDivs = document.getElementsByClassName("codeblock");

// terminal/codeblock divs start hidden via styles.css, so there is no flash
// of them before this module runs.

// Let's create a simple file system structure


// Where we are while browsing history with the arrow keys. -1 means "not
// browsing"; draft holds whatever was half-typed when browsing started.
let historyIndex = -1;
let draft = '';

function moveCaretToEnd(input) {
    // Deferred so it wins against the browser's own caret placement.
    setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
}

function longestCommonPrefix(values) {
    if (values.length === 0) return '';
    let prefix = values[0];
    for (const value of values) {
        while (!value.startsWith(prefix)) {
            prefix = prefix.slice(0, -1);
            if (!prefix) return '';
        }
    }
    return prefix;
}

commandInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const raw = event.target.value.trim();
        const args = raw.split(' ');
        const command = args[0];
        commandInput.value = '';

        historyIndex = -1;
        draft = '';
        pushHistory(raw);

        // Anything that would destroy a real machine gets the meltdown instead
        // of running. Checked before lookup so 'format', 'dd', 'mkfs' and
        // friends are covered without needing a command each.
        if (isDestructive(raw)) {
            runMayhem(raw);
            commandInput.focus();
            commandContainer.scrollIntoView(false);
            return;
        }

        // Exact-match full-line commands first (e.g., the special ssh line)
        if (raw in commands) {
            commands[raw].execute(args);
        } else if (command in commands) {
            commands[command].execute(args);
        }

        commandInput.focus();
        commandContainer.scrollIntoView(false);
        return;
    }

    if (event.key === 'ArrowUp') {
        event.preventDefault();
        const history = getHistory();
        if (history.length === 0) return;

        if (historyIndex === -1) {
            draft = commandInput.value;      // remember the half-typed line
            historyIndex = history.length - 1;
        } else if (historyIndex > 0) {
            historyIndex--;
        }

        commandInput.value = history[historyIndex];
        moveCaretToEnd(commandInput);
        return;
    }

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (historyIndex === -1) return;

        const history = getHistory();
        if (historyIndex < history.length - 1) {
            historyIndex++;
            commandInput.value = history[historyIndex];
        } else {
            historyIndex = -1;               // walked past the newest entry
            commandInput.value = draft;
        }

        moveCaretToEnd(commandInput);
        return;
    }

    if (event.key === 'Tab') {
        event.preventDefault();

        const line = commandInput.value;
        const matches = getCompletions(line);
        if (matches.length === 0) return;

        const parts = line.split(' ');
        const word = parts[parts.length - 1];

        const completion = matches.length === 1
            ? matches[0]
            : longestCommonPrefix(matches);

        if (completion.length > word.length) {
            parts[parts.length - 1] = completion;
            commandInput.value = parts.join(' ');
            moveCaretToEnd(commandInput);
        } else if (matches.length > 1) {
            // Nothing more to fill in, so show the choices instead.
            printCompletions(line, matches);
            commandContainer.scrollIntoView(false);
        }
        return;
    }
});

// Run straight away rather than on window 'load'. That event waits for the
// archive.org iframes at the bottom of the page, which left the prompt dead
// for a few seconds after the page was visible.
localStorage.clear(); // Clear command history on page load
commandInput.focus();

// Typing anywhere on the page goes to the prompt, like a real terminal.
document.addEventListener('click', function(event) {
    if (window.getSelection().toString()) return; // don't steal focus mid-selection
    commandInput.focus();
});