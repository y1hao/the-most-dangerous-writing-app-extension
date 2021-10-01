import * as vscode from 'vscode';
import { MostDangerousWritingApp as App, LimitType } from './mdwa';

let app: App | undefined;

const minutes: vscode.QuickPickItem[] = ['3', '5', '10', '15', '20', '30', '60']
	.map((n) => ({label: n, description: 'minutes'}));
const words: vscode.QuickPickItem[] = ['150', '250', '500', '750', '1667']
	.map((n) => ({label: n, description: 'words'}));
const limitItems = minutes.concat(words);

function startSession() {
	vscode.window.showQuickPick(limitItems, {
		placeHolder: 'Set limit',
		canPickMany: false
	}).then((item) => {
		const type = item!.description === 'minutes' ? 'minutes' : 'words';
		const limit = Number.parseInt(item!.label, 10);

		vscode.window.showQuickPick(['Off', 'On'], {
			placeHolder: 'Hard core mode',
			canPickMany: false
		}).then((hc) => {
			const hardCore = hc === 'On';

			vscode.workspace.openTextDocument().then(doc => {
				vscode.window.showInformationMessage(`type: ${type}, limit: ${limit}, hardcore: ${hardCore}`);
				
				vscode.window.showTextDocument(doc);

				app = new App(type, limit, hardCore, doc);
				app.start();
			});
		});
	});
}

function stopSession() {
	app?.stop();
}

function restartSession() {
	stopSession();
	startSession();
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('the-most-dangerous-writing-app.startSession', () => {
		if (app?.isRunning()) {
			vscode.window.showErrorMessage('The Most Dangerous Writing App is already running', 'Stop', 'New Session')
				.then((action) => action === 'Stop' ? stopSession() : restartSession());
			return;
		}

		startSession();
	});

	context.subscriptions.push(disposable);
}