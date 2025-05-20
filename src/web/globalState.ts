import { EventEmitter } from "events";
class GlobalStateEmitter extends EventEmitter {}
import * as vscode from "vscode";

const globalStateEmitter = new GlobalStateEmitter();

type GlobalStateUpdate = { key: string; value: any };

function updateGlobalState(
  context: vscode.ExtensionContext,
  update: GlobalStateUpdate
): void {
  context.globalState.update(update.key, update.value).then(() => {
    globalStateEmitter.emit("changed", update);
  });
}

async function getStoreState(
  context: vscode.ExtensionContext,
  key: string
): Promise<any> {
  const value = await context.globalState.get(key);
  return value;
}

export { globalStateEmitter, updateGlobalState, getStoreState }; 