import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';

let lastErrorCell: string | undefined;
let lastErrorMessage: string | undefined;

let statusBarItem: vscode.StatusBarItem;
let lastSoundTime = 0;
const COOLDOWN = 1200;

/* ================================
   PLAY SOUND (Stable Cross-Platform)
================================ */
function playSound(context: vscode.ExtensionContext) {
  const now = Date.now();
  if (now - lastSoundTime < COOLDOWN) return;
  lastSoundTime = now;

  const soundPath = path.join(context.extensionPath, 'sounds', 'faah.wav');

  try {
    if (process.platform === 'win32') {
      spawn('powershell', [
        '-c',
        `(New-Object Media.SoundPlayer '${soundPath}').PlaySync();`
      ]);
    } else if (process.platform === 'darwin') {
      spawn('afplay', [soundPath]);
    } else {
      spawn('aplay', [soundPath]);
    }
  } catch (err) {
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
async function runPythonFile(context: vscode.ExtensionContext) {

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

  const child = spawn(pythonExecutable, [filePath], {
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


function watchNotebook(context: vscode.ExtensionContext) {

  context.subscriptions.push(
    vscode.workspace.onDidChangeNotebookDocument(event => {

      for (const change of event.cellChanges) {

        const cell = change.cell;

        if (!cell.outputs || cell.outputs.length === 0) continue;

        let errorMessage = '';

        const hasError = cell.outputs.some(output =>
          output.items.some(item => {

            const text = new TextDecoder().decode(item.data);
            errorMessage += text;

            return (
              item.mime?.toLowerCase().includes('error') ||
              item.mime?.toLowerCase().includes('traceback')
            );
          })
        );

        const cellId = cell.document.uri.toString();

        // Reset state if no error
        if (!hasError) {
          lastErrorCell = undefined;
          lastErrorMessage = undefined;
          continue;
        }

        // Prevent duplicate sound only if SAME error in SAME cell
        if (
          lastErrorCell === cellId &&
          lastErrorMessage === errorMessage
        ) {
          continue;
        }

        lastErrorCell = cellId;
        lastErrorMessage = errorMessage;

        playSound(context);
        break;
      }
    })
  );
}
/* ================================
   ACTIVATE
================================ */
export function activate(context: vscode.ExtensionContext) {

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  statusBarItem.text = '$(megaphone) ✅ Faah Active';
  statusBarItem.show();

  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand('faah-sound.testSound', () => {
      playSound(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('faah-sound.runPython', () => {
      runPythonFile(context);
    })
  );

  watchNotebook(context);
}

export function deactivate() {
  statusBarItem?.dispose();
}