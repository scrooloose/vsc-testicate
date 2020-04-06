const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const editor = vscode.window.activeTextEditor;
  const document = editor.document;
  const term = vscode.window.activeTerminal;

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

  let disposable = vscode.commands.registerCommand(
    "extension.testUnderCursor",
    function() {
      mungeTestPathIntoConfig(testPathAtCursor());
      term.sendText("python3 ./run.py");
    }
  );
  context.subscriptions.push(disposable);

  let allTestsDisposable = vscode.commands.registerCommand(
    "extension.allTestsOnPage",
    function() {
      mungeTestPathIntoConfig(moduleNameOfCurrentFile());
      term.sendText("python3 ./run.py");
    }
  );
  context.subscriptions.push(allTestsDisposable);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
