// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const editor = vscode.window.activeTextEditor;
  const document = editor.document;
  const term = vscode.window.activeTerminal;

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  function moduleNameOfCurrentFile() {
    const fname = document.fileName;
    const relativeFname = fname.replace(vscode.workspace.rootPath + "/", "");
    return relativeFname.replace(/\//g, ".").replace(/\.py$/, "");
  }
  function mungeTestPathIntoConfig(testPath) {
    term.sendText(
      `sed -i -e "s/^\\( \\+'test_subset': \\)'.*'/\\1'${testPath}'/" configs/test_config.py`
    );
  }

  let disposable = vscode.commands.registerCommand(
    "extension.testUnderCursor",
    function() {
      function searchBackward(regex) {
        var lineNum = editor.selection.active.line;
        while (lineNum >= 0) {
          const curLine = document.lineAt(lineNum).text;
          if (curLine.match(regex)) {
            return curLine.match(regex)[1];
          }
          lineNum--;
        }

        // FIXME: should probably do something better than this
        throw new Error("Didnt find search regex");
      }

      function testPathAtCursor() {
        const moduleName = moduleNameOfCurrentFile();
        const className = searchBackward(/^\s*class (\w+)/);
        const funcName = searchBackward(/^\s*def (test_\w+)/);
        return `${moduleName}.${className}.${funcName}`;
      }
      mungeTestPathIntoConfig(testPathAtCursor());
      term.sendText("python3 ./run.py");
    }
  );
  context.subscriptions.push(disposable);

  let allTestsDisposable = vscode.commands.registerCommand(
    "extension.allTestsOnPage",
    function() {
      function allTestsOnPage() {
        return moduleNameOfCurrentFile();
      }
      mungeTestPathIntoConfig(allTestsOnPage());
      term.sendText("python3 ./run.py");
    }
  );
  context.subscriptions.push(allTestsDisposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
