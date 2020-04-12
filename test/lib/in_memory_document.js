"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var InMemoryDocument = /** @class */ (function () {
  function InMemoryDocument(uri, _contents, version) {
    if (version === void 0) { version = 1; }
    this.uri = uri;
    this._contents = _contents;
    this.version = version;
    this.isUntitled = false;
    this.languageId = '';
    this.isDirty = false;
    this.isClosed = false;
    this.eol = vscode.EndOfLine.LF;
    this._lines = this._contents.split(/\n/g);
  }
  Object.defineProperty(InMemoryDocument.prototype, "fileName", {
    get: function () {
      return this.uri.fsPath;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(InMemoryDocument.prototype, "lineCount", {
    get: function () {
      return this._lines.length;
    },
    enumerable: true,
    configurable: true
  });
  InMemoryDocument.prototype.lineAt = function (line) {
    return {
      lineNumber: line,
      text: this._lines[line],
      range: new vscode.Range(0, 0, 0, 0),
      firstNonWhitespaceCharacterIndex: 0,
      rangeIncludingLineBreak: new vscode.Range(0, 0, 0, 0),
      isEmptyOrWhitespace: false
    };
  };
  InMemoryDocument.prototype.offsetAt = function (_position) {
    throw new Error('Method not implemented.');
  };
  InMemoryDocument.prototype.positionAt = function (offset) {
    var before = this._contents.slice(0, offset);
    var newLines = before.match(/\n/g);
    var line = newLines ? newLines.length : 0;
    var preCharacters = before.match(/(\n|^).*$/g);
    return new vscode.Position(line, preCharacters ? preCharacters[0].length : 0);
  };
  InMemoryDocument.prototype.getText = function (_range) {
    return this._contents;
  };
  InMemoryDocument.prototype.getWordRangeAtPosition = function (_position, _regex) {
    throw new Error('Method not implemented.');
  };
  InMemoryDocument.prototype.validateRange = function (_range) {
    throw new Error('Method not implemented.');
  };
  InMemoryDocument.prototype.validatePosition = function (_position) {
    throw new Error('Method not implemented.');
  };
  InMemoryDocument.prototype.save = function () {
    throw new Error('Method not implemented.');
  };
  return InMemoryDocument;
}());
exports.InMemoryDocument = InMemoryDocument;
