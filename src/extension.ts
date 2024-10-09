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
    async provideHover(document, position) {
      const wordRange = document.getWordRangeAtPosition(position);
      if (!wordRange) {
        return;
      }

      const hoveredText = document.getText(wordRange);

      const currentFilePath = document.fileName;
      const currentFileExtension = path.extname(currentFilePath);
      const directory = path.dirname(currentFilePath);
      const baseName = path.basename(
        currentFilePath,
        path.extname(currentFilePath)
      );

      let specFilePath: string | null = null;

      // Array of possible test file extensions
      const possibleExtensions = [
        `.spec${currentFileExtension}`,
        `.test${currentFileExtension}`,
      ];

      // Loop through possible extensions and find the first existing file
      for (const ext of possibleExtensions) {
        const filePath = path.join(directory, `${baseName}${ext}`);
        if (fs.existsSync(filePath)) {
          specFilePath = filePath;
          break; // Exit loop once we find a valid file
        }
      }

      if (!specFilePath) {
        return;
      } else {
        const blocks: Array<string[]> = [];
        const fileStream = fs.createReadStream(specFilePath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });

        let currentDescribe: string | null = null;
        const describeRegex = /^describe\(\s*"([^"]*)"/;
        const testItRegex = /^\s*(it|test)\(\s*["'`](.*?)["'`]/;

        for await (const untrimmedLine of rl) {
          const line = untrimmedLine.trim();

          const describeMatch = line.match(describeRegex);
          if (describeMatch) {
            currentDescribe = describeMatch[1];
            blocks.push([currentDescribe]);
            continue;
          }

          const itMatch = line.match(testItRegex);
          if (itMatch && currentDescribe) {
            const testCase = itMatch[2];
            blocks[blocks.length - 1].push(testCase);
          }
        }

        const hoverText = new vscode.MarkdownString(
          blocks
            .filter((block) => block[0].includes(hoveredText))
            .map((block) => `**${block[0]}**\n- ${block.slice(1).join("\n- ")}`)
            .join("\n\n")
        );

        return new vscode.Hover(hoverText);
      }
    },
  });

  context.subscriptions.push(provider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
