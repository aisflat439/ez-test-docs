import fs from "fs";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { Expression, V8IntrinsicIdentifier } from "@babel/types";

type Node = V8IntrinsicIdentifier | Expression;

class TestNode {
  name: string;
  type: "describe" | "it" | "test" | "root";
  children: TestNode[];

  constructor(name: string, type: "describe" | "it" | "test" | "root") {
    this.name = name;
    this.type = type;
    this.children = [];
  }
}

export function extractTestStructure(filePath: string): TestNode {
  const code = fs.readFileSync(filePath, "utf8");

  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  const root = new TestNode("root", "root");
  const stack = [root];

  const jestFunctions = ["describe", "it", "test"];

  traverse(ast, {
    CallExpression: {
      enter(path) {
        const callee = path.node.callee;

        function getFunctionName(node: Node) {
          if (node.type === "Identifier") {
            return node.name;
          } else if (node.type === "MemberExpression") {
            return getFunctionName(node.object);
          }
          return null;
        }

        const functionName = getFunctionName(callee);

        if (jestFunctions.includes(functionName!)) {
          const args = path.node.arguments;
          const [firstArg, secondArg] = args;

          let name = "";
          if (firstArg && firstArg.type === "StringLiteral") {
            name = firstArg.value;
          } else if (firstArg && firstArg.type === "TemplateLiteral") {
            name = firstArg.quasis.map((elem) => elem.value.raw).join("");
          }

          const node = new TestNode(
            name,
            functionName as "describe" | "it" | "test"
          );
          stack[stack.length - 1].children.push(node);

          if (
            secondArg &&
            (secondArg.type === "ArrowFunctionExpression" ||
              secondArg.type === "FunctionExpression")
          ) {
            stack.push(node);
          }
        }
      },
      exit(path) {
        const callee = path.node.callee;

        function getFunctionName(node: Node) {
          if (node.type === "Identifier") {
            return node.name;
          } else if (node.type === "MemberExpression") {
            return getFunctionName(node.object);
          }
          return null;
        }

        const functionName = getFunctionName(callee);

        if (jestFunctions.includes(functionName!)) {
          const secondArg = path.node.arguments[1];

          if (
            secondArg &&
            (secondArg.type === "ArrowFunctionExpression" ||
              secondArg.type === "FunctionExpression")
          ) {
            // Pop the node from the stack aftr finishing its traversal
            stack.pop();
          }
        }
      },
    },
  });

  return root;
}

export function mapTestNodeToText(
  node: TestNode,
  indent: string = "",
  parentType: string = "root"
): string {
  let result = "";

  // Add a newline before 'describe' blocks (except at the root level)
  if (node.type === "describe" && parentType !== "root") {
    result += "\n";
  }

  // Output the current node
  if (node.type === "describe") {
    result += `${indent}**${node.name}**\n`;
  } else if (node.type === "it" || node.type === "test") {
    result += `${indent}- ${node.name}\n`;
  }

  // Increase indent for child nodes
  const childIndent = indent + "  ";

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];

    // Add a newline before 'it' nodes that follow a 'describe' node
    if (
      i > 0 &&
      child.type === "it" &&
      node.children[i - 1].type === "describe"
    ) {
      result += "\n";
    }

    result += mapTestNodeToText(child, childIndent, node.type);
  }

  return result;
}
