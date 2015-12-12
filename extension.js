'use strict'

var vscode = require('vscode')
var workspace = vscode.workspace
var window = vscode.window
var Range = vscode.Range
var StatusBarAlignment = vscode.StatusBarAlignment

var semi = require('semi')

var semiStatusDict = {
  SLEEP: 0,
  REMOVE: 1,
  ADD: 2
}

var nextSemiStatue = status => (status + 1) % 3

var semiMap = (map) => {
  var _map = {}
  var key
  for (key in map) {
    _map[semiStatusDict[key]] = map[key]
  }
  return _map
}

var semiToolTipOtions = semiMap({
  REMOVE: {
    text: '-all;',
    tooltip: 'Toggle to Add semicolons when save.'
  },
  ADD: {
    text: '+all;',
    tooltip: 'Toggle to Remove semicolons when save.'
  },
  SLEEP: {
    text: 'zzz;',
    tooltip: 'Toggle to Remove semicolons when save.'
  }
})

var semiNotices = semiMap({
  REMOVE: 'Semicolons will be removed when save.',
  ADD: 'Semicolons will be added when save.',
  SLEEP: 'Semicolons will not be added or removed auto when save.'
})

function activate(context) {

  // Detect if saved by self (if true do nothing).
  var date

  var semiStatus = context.globalState.get('semi.status')
  if (semiStatus == null) {
    semiStatus = semiStatusDict.REMOVE
  }

  var statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right)

  var toggleSemiOptions = () => Object.assign(statusBarItem, semiToolTipOtions[semiStatus])

  var commandDisposable = vscode.commands.registerCommand('extension.semi.toggle', () => {
    semiStatus = nextSemiStatue(semiStatus)
    context.globalState.update('meow.semi.status', semiStatus)

    toggleSemiOptions()
    window.showInformationMessage(semiNotices[semiStatus])
  })

  toggleSemiOptions()
  statusBarItem.show()
  statusBarItem.command = 'extension.semi.toggle'

  var savedDisposable = workspace.onDidSaveTextDocument((doc) => {
    if (Date.now() - date < 100) {return}

    var range = new Range(0, 0, doc.lineCount + 1, 0)
    var text = doc.getText(range)

    var newText = text
    if (semiStatus === semiStatusDict.REMOVE) {
      newText = semi.remove(text, {
        leading: true
      })
    }
    if (semiStatus === semiStatusDict.ADD) {
      newText = semi.add(text)
    }

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
