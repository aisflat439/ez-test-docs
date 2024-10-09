# ez-test-docs

ez-test-docs is a Visual Studio Code extension that provides a convenient hover feature to display relevant test descriptions (`it` blocks) for your functions.

When hovering over a function, this extension fetches the corresponding test cases from associated `.spec` or `.test` files and displays them in a hover tooltip. It supports both JavaScript and TypeScript projects, making it easy to understand what has been tested without needing to open the test files manually.

## Features

- Automatically shows test descriptions when hovering over functions.
- Supports `.spec` and `.test` files for test detection.
- Works with JavaScript, TypeScript, React, and React Native projects.
- Detects test cases using different quote types: `"`, `'`, and `` ` ``.

## Example

If you have a function like this:

```typescript
// src/add.ts
export const add = (a: number, b: number) => a + b;
```

And a test like this:

```typescript
// src/add.spec.ts
describe("add", () => {
  it("2 plus 2 is four", () => {
    expect(add(2, 2)).toBe(4);
  });

  it("3 plus 2 is five", () => {
    expect(add(3, 2)).toBe(5);
  });
});
```

When you hover over the `add` function, you’ll see a tooltip like this:

```
add

- 2 plus 2 is four
- 3 plus 2 is five
```

## Installation

1. Install ez-test-docs from the VS Code Marketplace.
2. Once installed, the extension will activate whenever you open a supported project.
3. Start hovering over your functions to see the associated test descriptions!

## Supported Languages

- JavaScript
- TypeScript
- React (.jsx)
- React Native (.tsx)

## Contributing

Contributions are welcome! If you'd like to contribute to ez-test-docs, please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License.
