"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const child_process_1 = require("child_process");
let statusBarItem;
let lastSoundTime = 0;
const COOLDOWN = 1200;
/* ================================
   PLAY SOUND (Stable Cross-Platform)
================================ */
function playSound(context) {
    const now = Date.now();
    if (now - lastSoundTime < COOLDOWN)
        return;
    lastSoundTime = now;
    const soundPath = path.join(context.extensionPath, 'sounds', 'faah.wav');
    try {
        if (process.platform === 'win32') {
            (0, child_process_1.spawn)('powershell', [
                '-c',
                `(New-Object Media.SoundPlayer '${soundPath}').PlaySync();`
            ]);
        }
        else if (process.platform === 'darwin') {
            (0, child_process_1.spawn)('afplay', [soundPath]);
        }
        else {
            (0, child_process_1.spawn)('aplay', [soundPath]);
        }
    }
    catch (err) {
        console.error('Faah sound failed:', err);
    }
    statusBarItem.text = '$(megaphone) 🔴 FAAH!';
    setTimeout(() => {
        statusBarItem.text = '$(megaphone) ✅ Faah Active';
    }, 1000);
}
/* ================================
   CONTROLLED PYTHON RUNNER
   (100% Reliable Exit Code Detection)
================================ */
async function runPythonFile(context) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active file.');
        return;
    }
    if (!editor.document.fileName.endsWith('.py')) {
        vscode.window.showErrorMessage('Not a Python file.');
        return;
    }
    await editor.document.save();
    const filePath = editor.document.fileName;
    const terminal = vscode.window.createTerminal({
        name: 'Faah Python Runner'
    });
    terminal.show();
    const pythonExecutable = 'python'; // Uses system PATH
    const child = (0, child_process_1.spawn)(pythonExecutable, [filePath], {
        cwd: path.dirname(filePath)
    });
    child.stdout.on('data', (data) => {
        terminal.sendText(data.toString(), false);
    });
    child.stderr.on('data', (data) => {
        terminal.sendText(data.toString(), false);
    });
    child.on('close', (code) => {
        if (code && code !== 0) {
            playSound(context);
        }
    });
}
/* ================================
   JUPYTER ERROR DETECTION
================================ */
function watchNotebook(context) {
    context.subscriptions.push(vscode.workspace.onDidChangeNotebookDocument(event => {
        for (const change of event.cellChanges) {
            const cell = change.cell;
            if (!cell.outputs || cell.outputs.length === 0)
                continue;
            const hasError = cell.outputs.some(output => output.items.some(item => item.mime?.toLowerCase().includes('error') ||
                item.mime?.toLowerCase().includes('traceback')));
            if (hasError) {
                playSound(context);
                break;
            }
        }
    }));
}
/* ================================
   ACTIVATE
================================ */
function activate(context) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(megaphone) ✅ Faah Active';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    context.subscriptions.push(vscode.commands.registerCommand('faah-sound.testSound', () => {
        playSound(context);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('faah-sound.runPython', () => {
        runPythonFile(context);
    }));
    watchNotebook(context);
}
function deactivate() {
    statusBarItem?.dispose();
}
//# sourceMappingURL=extension.js.map