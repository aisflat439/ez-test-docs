// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { extractTestStructure, mapTestNodeToText } from "./jestParser";

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
        const textNode = extractTestStructure(specFilePath);
        const matchedNode = textNode.children.find(
          (node) => node.name === hoveredText
        );

        const hoverText = mapTestNodeToText(matchedNode!);

        return new vscode.Hover(hoverText);
      }
    },
  });

  context.subscriptions.push(provider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
