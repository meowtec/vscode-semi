'use strict'

var vscode = require('vscode')
var workspace = vscode.workspace
var window = vscode.window
var Range = vscode.Range
var semi = require('semi')

// Detect if saved by self (if true do nothing).
var date

function activate(context) {

  let listener = workspace.onDidSaveTextDocument((doc) => {
    if (Date.now() - date < 100) {return}

    var range = new Range(0, 0, doc.lineCount + 1, 0)
    var text = doc.getText(range)

    var newText = semi.remove(text, {
      leading: true
    })

    if (newText === text) {return}

    window.activeTextEditor.edit((editBuilder) => {
      editBuilder.replace(range, newText)
      setImmediate(() => {
        doc.save()
        date = Date.now()
      })
    })
  })

  context.subscriptions.push(listener)
}


exports.activate = activate