# Shared State Store Extension

This extension provides a shared state management solution for VS Code extensions, allowing for the storage and retrieval of state across multiple extensions.

## Features

- Set and get global state values.
- Register listeners for state changes.
- Access a global state emitter for advanced state management.

## How to Use

### Setting a State Value

To set a state value, use the command `sharedStateStore.setState` with a key and value. This will store the value in the global state, accessible by any extension.

### Getting a State Value

To retrieve a state value, use the command `sharedStateStore.getState` with the key of the value you want to retrieve. This will return the value associated with the key from the global state.

### Registering a Listener for State Changes

To listen for changes to a specific state value, use the command `sharedStateStore.registerListener` with a key and a callback command. Whenever the specified state value changes, your callback command will be executed.

### Utilizing Returned Values from Activation Function

Upon activating the extension, the activation function returns an object containing methods for interacting with the state store programmatically. After initializing the global state through `initializeGlobalState`, you gain access to `storeListener` and `updateGlobalState` methods. These methods allow you to listen for state changes and update the state, respectively.

#### Example Implementation with Strong Type Checking:

```typescript
// globalState.ts
import * as vscode from "vscode";
import { VerseRefGlobalState, SelectedTextDataWithContext } from "../types";
type GlobalStateUpdate =
  | { key: "verseRef"; value: VerseRefGlobalState }
  | { key: "uri"; value: string | null }
  | { key: "currentLineSelection"; value: SelectedTextDataWithContext };

type GlobalStateKey = GlobalStateUpdate["key"];
type GlobalStateValue<K extends GlobalStateKey> = Extract<
  GlobalStateUpdate,
  { key: K }
>["value"];

const extensionId = "project-accelerate.shared-state-store";

type DisposeFunction = () => void;
export async function initializeGlobalState() {
  let storeListener: <K extends GlobalStateKey>(
    keyForListener: K,
    callBack: (value: GlobalStateValue<K> | undefined) => void
  ) => DisposeFunction = () => () => undefined;

  let updateStoreState: (update: GlobalStateUpdate) => void = () => undefined;
  let getStoreState: <K extends GlobalStateKey>(
    key: K
  ) => Promise<GlobalStateValue<K> | undefined> = () =>
    Promise.resolve(undefined);

  const extension = vscode.extensions.getExtension(extensionId);
  if (extension) {
    const api = await extension.activate();
    if (!api) {
      console.log(`Extension ${extensionId} does not expose an API.`);
    } else {
      storeListener = api.storeListener;

      updateStoreState = api.updateStoreState;
      getStoreState = api.getStoreState;
      return {
        storeListener,
        updateStoreState,
        getStoreState,
      };
    }
  }
  console.error(`Extension ${extensionId} not found.`);
  return {
    storeListener,
    updateStoreState,
    getStoreState,
  };
}
```

#### Example of use of storeListener

```typescript
export class CustomWebviewProvider {
    _context: vscode.ExtensionContext;
    selectionChangeListener: any;
    constructor(context: vscode.ExtensionContext) {
        this._context = context;
    }

    resolveWebviewView(webviewView: vscode.WebviewView) {
        initializeGlobalState().then(({ storeListener }) => {
            const disposeFunction = storeListener("verseRef", (value) => {
                if (value) {
                    webviewView.webview.postMessage({
                        command: "reload",
                        data: { verseRef: value.verseRef, uri: value.uri },
                    } as CommentPostMessages);
                }
            });
            webviewView.onDidDispose(() => {
                disposeFunction();
            });
        });
  //...
```
