import { EventEmitter } from 'events';
class GlobalStateEmitter extends EventEmitter {}
import * as vscode from 'vscode';

const globalStateEmitter = new GlobalStateEmitter();

type GlobalStateUpdate =
	| { key: 'verseRef'; value: string }
	| { key: 'uri'; value: string }
	| { key: string; value: any };

function updateGlobalState(
	context: vscode.ExtensionContext,
	update: GlobalStateUpdate
): void {
	console.log({ context });
	context.globalState.update(update.key, update.value).then(() => {
		console.log('Value changed', update);
		globalStateEmitter.emit('changed', update);
	});
}

export { globalStateEmitter, updateGlobalState };
