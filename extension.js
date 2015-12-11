'use strict'

var vscode = require('vscode')
var workspace = vscode.workspace
var window = vscode.window
var Range = vscode.Range
var StatusBarAlignment = vscode.StatusBarAlignment

var semi = require('semi')

// Detect if saved by self (if true do nothing).
var date

var getSemiToolTipOtion = (remove) => {
  return remove ? {
    text: '- all ;',
    tooltip: 'Toggle to Add semicolons when save.'
  } : {
    text: '+ all ;',
    tooltip: 'Toggle to Remove semicolons when save.'
  }
}

var getRemiNotice = (remove) => {
  return remove ? 'Semicolons will be removed when save.' : 'Semicolons will be added when save.'
}

function activate(context) {

  var semiRemove = true
  var statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right)

  var toggleSemiOptions = () => Object.assign(statusBarItem, getSemiToolTipOtion(semiRemove))

  var commandDisposable = vscode.commands.registerCommand('extension.semi.toggle', () => {
    semiRemove = !semiRemove

    toggleSemiOptions()
    window.showInformationMessage(getRemiNotice(semiRemove))
  })


  toggleSemiOptions()
  statusBarItem.show()
  statusBarItem.command = 'extension.semi.toggle'


  var savedDisposable = workspace.onDidSaveTextDocument((doc) => {
    if (Date.now() - date < 100) {return}

    var range = new Range(0, 0, doc.lineCount + 1, 0)
    var text = doc.getText(range)

    var newText = semiRemove ? semi.remove(text, {
      leading: true
    }) : semi.add(text)

    if (newText === text) {return}

    window.activeTextEditor.edit((editBuilder) => {
      editBuilder.replace(range, newText)
      setImmediate(() => {
        doc.save()
        date = Date.now()
      })
    })
  })

  context.subscriptions.push(commandDisposable)
  context.subscriptions.push(savedDisposable)
}

exports.activate = activate
