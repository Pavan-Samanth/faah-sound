# 🔊 Faah Sound — Python Error Alert

Plays a **"faah" sound** every time a Python or Jupyter Notebook error is detected in VS Code.

## Features

- 🐍 Detects **Python runtime errors** in the terminal (Traceback, SyntaxError, TypeError, etc.)
- 📓 Detects **Jupyter Notebook cell errors** on execution
- 🔍 Detects **Pylance/Python linter errors** in the editor diagnostics
- 🎚️ Adjustable **volume** setting
- ✅ Enable/Disable via Command Palette or status bar

## Usage

1. Open any `.py` or `.ipynb` file — the extension activates automatically
2. Run your code — if there's an error, you'll hear the **faah** sound!
3. Click the `$(megaphone) Faah Sound Active` in the status bar to **test the sound**

## Commands

| Command | Description |
|---|---|
| `Faah Sound: Test Sound` | Play the faah sound manually |
| `Faah Sound: Enable` | Turn on sound alerts |
| `Faah Sound: Disable` | Turn off sound alerts |

## Settings

| Setting | Default | Description |
|---|---|---|
| `faahSound.enabled` | `true` | Enable/disable the extension |
| `faahSound.volume` | `0.8` | Sound volume (0.1–1.0) |
| `faahSound.triggerOnDiagnostics` | `true` | Trigger on editor error squiggles |
| `faahSound.triggerOnTerminalError` | `true` | Trigger on terminal Python errors |

## Error Patterns Detected

- `Traceback (most recent call last)`
- `SyntaxError`, `TypeError`, `ValueError`, `NameError`, `AttributeError`
- `ImportError`, `IndexError`, `KeyError`, `ZeroDivisionError`
- `RuntimeError`, `FileNotFoundError`, and many more!
- Jupyter notebook error outputs and cell execution failures
