# Shared State Store Extension

This extension provides a shared state management solution for VS Code extensions, allowing for the storage and retrieval of state across multiple extensions.

## Features

- Set and get global state values.
- Register listeners for state changes.
- Access a global state emitter for advanced state management.

## How to Use

### Setting a State Value

To set a state value, use the command `multiExtensionState.setState` with a key and value. This will store the value in the global state, accessible by any extension.

### Getting a State Value

To retrieve a state value, use the command `multiExtensionState.getState` with the key of the value you want to retrieve. This will return the value associated with the key from the global state.

### Registering a Listener for State Changes

To listen for changes to a specific state value, use the command `multiExtensionState.registerListener` with a key and a callback command. Whenever the specified state value changes, your callback command will be executed.

### Utilizing Returned Values from Activation Function

Upon activating the extension, the activation function returns an object containing methods for interacting with the state store programmatically. After initializing the global state through `initializeGlobalState`, you gain access to `storeListener` and `updateGlobalState` methods. These methods allow you to listen for state changes and update the state, respectively.

#### Example Implementation:
```typescript
import \* as vscode from "vscode";
import { VerseRefGlobalState, SelectedTextDataWithContext } from "../types";
type GlobalStateUpdate =
| { key: "verseRef"; value: VerseRefGlobalState }
| { key: "uri"; value: string }
| { key: "currentLineSelection"; value: SelectedTextDataWithContext };

type GlobalStateKey = GlobalStateUpdate["key"];
type GlobalStateValue<K extends GlobalStateKey> = Extract<
GlobalStateUpdate,
{ key: K }

> ["value"];

const extensionId = "codex.shared-state-store";

let storeListener: <K extends GlobalStateKey>(
keyForListener: K,
callBack: (value: GlobalStateValue<K>) => void,
) => void;

let updateGlobalState: (update: GlobalStateUpdate) => void;

async function initializeGlobalState() {
const extension = vscode.extensions.getExtension(extensionId);
if (!extension) {
console.log(`Extension ${extensionId} not found.`);
return;
}

    // Ensure the extension is activated
    const api = await extension.activate();
    if (!api) {
        console.log(`Extension ${extensionId} does not expose an API.`);
        return;
    }

    storeListener = api.storeListener;
    updateGlobalState = api.updateStoreState;

}

initializeGlobalState().catch(console.error);

export { storeListener, updateGlobalState };

```
