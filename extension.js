const vscode = require("vscode");

class Testicate {
  runTestUnderCursor() {
    this.mungeTestPathIntoConfig(this.testPathAtCursor());
    this.term.sendText("python3 ./run.py");
  }

  runAllTestsInCurrentModule() {
    this.mungeTestPathIntoConfig(this.moduleNameOfCurrentFile());
    this.term.sendText("python3 ./run.py");
  }

  // everything below here should be considered private

  get editor() {
    return vscode.window.activeTextEditor;
  }

  get document() {
    return this.editor.document
  }

  get term() {
    return vscode.window.activeTerminal
  }

  testPathAtCursor() {
    const moduleName = this.moduleNameOfCurrentFile();
    const className = this.searchBackward(/^\s*class (\w+)/);
    const funcName = this.searchBackward(/^\s*def (test_\w+)/);
    return `${moduleName}.${className}.${funcName}`;
  }

  moduleNameOfCurrentFile() {
    const fname = this.document.fileName;
    const relativeFname = fname.replace(vscode.workspace.rootPath + "/", "");
    return relativeFname.replace(/\//g, ".").replace(/\.py$/, "");
  }

  mungeTestPathIntoConfig(testPath) {
    this.term.sendText(
      `sed -i -e "s/^\\( \\+'test_subset': \\)'.*'/\\1'${testPath}'/" configs/test_config.py`
    );
  }

  searchBackward(regex) {
    var lineNum = this.editor.selection.active.line;
    while (lineNum >= 0) {
      const curLine = this.document.lineAt(lineNum).text;
      if (curLine.match(regex)) {
        return curLine.match(regex)[1];
      }
      lineNum--;
    }

    // FIXME: should probably do something better than this
    throw new Error("Didnt find search regex");
  }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.testUnderCursor",
      function() {
        (new Testicate()).runTestUnderCursor()
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.allTestsOnPage",
      function() {
        (new Testicate()).runAllTestsInCurrentModule()
      }
    )
  );
}
exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
