// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { globalStateEmitter, updateGlobalState } from "./globalState";

// This method is called when your extension is activated
// Your extension acts as a state store and is activated the very first time the command is executed
type CallBackCommand = string;

const createListenerKey = (key: string) => {
  return `${key}-listeners`;
};
export function activate(context: vscode.ExtensionContext) {
  globalStateEmitter.on(
    "changed",
    async ({ key, value }: { key: string; value: any }) => {
      const callBackCommands: Array<CallBackCommand> | undefined =
        await context.globalState.get(createListenerKey(key));
      if (callBackCommands && callBackCommands.length > 0) {
        for (const callBackCommand of callBackCommands) {
          console.log("Executing callback for state change", {
            callBackCommands,
            key,
            callBack: callBackCommand,
          });
          if (callBackCommand) {
            await vscode.commands.executeCommand(callBackCommand, key, value);
          }
        }
      }
    }
  );
  // Use the console to output diagnostic information and errors
  // This line of code will only be executed once when your state store extension is activated
  console.log("State store extension is now active!");

  // Commands for manipulating the state store are defined in the package.json file
  // Now provide the implementation of these commands with registerCommand
  // The commandId parameter must match the command field in package.json

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sharedStateStore.setState",
      async (key: string | undefined, value: any | undefined) => {
        if (!key) {
          key = await vscode.window.showInputBox({
            prompt: "Enter the key for the state you want to set",
          });
          if (!key) {
            vscode.window.showInformationMessage(
              "Operation cancelled. Key was missing."
            );
            return;
          }
        }
        if (!value) {
          value = await vscode.window.showInputBox({
            prompt: `Enter the value for the state key '${key}'`,
          });
          if (!value) {
            vscode.window.showInformationMessage(
              "Operation cancelled. Value was missing."
            );
            return;
          }
        }
        // Set the key-value pair in the global state store
        await updateGlobalState(context, { key, value });
        // Notify the user that the key-value pair has been set in the state store
        vscode.window.showInformationMessage(
          `State updated: (${key}: ${value}).`
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sharedStateStore.getState",
      async (key: string | undefined) => {
        if (!key) {
          // Prompt the user for the key if it was not passed as an argument
          key = await vscode.window.showInputBox({
            prompt: "Enter the key for the state you want to retrieve",
          });
        }
        if (key) {
          // Retrieve the key-value pair from the global state store
          return await context.globalState.get(key);
        } else {
          // Notify the user that the operation was cancelled due to missing key
          vscode.window.showInformationMessage(
            "Operation cancelled. Key was missing."
          );
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sharedStateStore.registerListener",
      async (
        key: string | undefined,
        callBackCommand: CallBackCommand | undefined
      ) => {
        if (key && callBackCommand) {
          console.log("Registering listener for state change", {
            key,
            callBack: callBackCommand,
          });
          const listenersKey = createListenerKey(key);
          const existingListeners: Array<CallBackCommand> =
            (await context.globalState.get(listenersKey)) || [];
          const newListenersList = [...existingListeners, callBackCommand];
          await updateGlobalState(context, {
            key: listenersKey,
            value: newListenersList,
          });
        } else {
          key = await vscode.window.showInputBox({
            prompt: "Enter the key for the listener",
          });
          if (!key) {
            vscode.window.showInformationMessage(
              "Operation cancelled. Key was missing."
            );
            return;
          }
          callBackCommand = await vscode.window.showInputBox({
            prompt: "Enter the callback command for the listener",
          });
          if (!callBackCommand) {
            vscode.window.showInformationMessage(
              "Operation cancelled. Callback command was missing."
            );
            return;
          }
        }
      }
    )
  );

  return {
    storeListener: (keyForListener: string, callBack: (value: any) => void) => {
      globalStateEmitter.on(
        "changed",
        ({ key, value }: { key: string; value: any }) => {
          if (key === keyForListener) {
            callBack(value);
          }
        }
      );
    },
    updateStoreState: (arg: { key: string; value: any }) =>
      updateGlobalState(context, arg),
  };
}
