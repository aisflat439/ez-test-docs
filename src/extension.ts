// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const languages = [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact",
  ];

  const provider = vscode.languages.registerHoverProvider(languages, {
    async provideHover(document, position, token) {
      const currentFilePath = document.fileName;
      const currentFileExtension = path.extname(currentFilePath);
      const directory = path.dirname(currentFilePath);
      const baseName = path.basename(
        currentFilePath,
        path.extname(currentFilePath)
      );

      const specFilePath = path.join(
        directory,
        `${baseName}.spec${currentFileExtension}`
      );

      if (!fs.existsSync(specFilePath)) {
        return;
      } else {
        const blocks: string[] = [];
        const fileStream = fs.createReadStream(specFilePath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });

        const describeRegex = /^describe\(/;
        const testItRegex = /^(it|test)\(/;

        for await (const untrimmedLine of rl) {
          const line = untrimmedLine.trim();
          if (describeRegex.test(line) || testItRegex.test(line)) {
            blocks.push(line);
          }
        }

        console.log("blocks: ", blocks);
        const text = blocks
          .map((block) => {
            const isDescribe = describeRegex.test(block);
            const str = block.match(/"([^"]*)"/);
            if (str) {
              return isDescribe ? `\`${str[1]}\`: ` : `${str[1]}\n`;
            }
          })
          .join(". ");

        const hoverText = new vscode.MarkdownString(
          `
					**${path.basename(specFilePath)}** 
					${text}
					`
        );
        return new vscode.Hover(hoverText);
      }
    },
  });

  context.subscriptions.push(provider);
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ez-test-docs" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "ez-test-docs.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from ez-test-docs!");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
