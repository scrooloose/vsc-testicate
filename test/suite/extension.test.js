const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { Testicate } = require('../../extension.js');
const { InMemoryDocument } = require('../lib/in_memory_document.js');
const { execSync } = require('child_process');

function buildInMemDoc(fname) {
  const configPath = path.resolve(__dirname, fname);
  const uri = vscode.Uri.file(configPath);
  const content = fs.readFileSync(uri.fsPath, 'utf-8');

  return new InMemoryDocument(uri, content)
}

const extRoot = path.resolve(__dirname, '../../');

function build_vscode_mock() {
  return {
    'window': {
      'activeTerminal': {
        'sendText': function(command) {
          // FIXME: this is shit.
          // Run the sed, but not the python3.
          if (!command.includes('python3')) {
            execSync(command);
          }
        }
      },
      'activeTextEditor': {
        'document': buildInMemDoc('../fixtures/test_file.py'),
        'selection': {
          'active': {
            'line': 9
          }
        }
      },
    },
    'workspace': {
      'rootPath': extRoot
    }
  }
}

describe('Testicate', function() {
  describe('runTestUnderCursor', function() {
    it('updates the test config', function() {
      const testConfPath = '/tmp/testicate_test_config.py'
      fs.copyFileSync(`${extRoot}/test/fixtures/test_config.py`, testConfPath);
      vscode_mock = build_vscode_mock();

      new Testicate({
        'vscode': vscode_mock,
        'testConfPath': testConfPath
      }).runTestUnderCursor()

      const newConf = fs.readFileSync(testConfPath, 'utf-8')
      assert(
        newConf.includes(
          "'test_subset': 'test.fixtures.test_file.TestSomething.test_some_stuff'"
        )
      )
    })
  })

  describe('runAllTestsInCurrentModule', function() {
    it('updates the test config', function() {
      const testConfPath = '/tmp/testicate_test_config.py'
      fs.copyFileSync(`${extRoot}/test/fixtures/test_config.py`, testConfPath);
      vscode_mock = build_vscode_mock();

      new Testicate({
        'vscode': vscode_mock,
        'testConfPath': testConfPath
      }).runAllTestsInCurrentModule()

      const newConf = fs.readFileSync(testConfPath, 'utf-8')
      assert(
        newConf.includes(
          "'test_subset': 'test.fixtures.test_file'"
        )
      )
    })
  })
});
