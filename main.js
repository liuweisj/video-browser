/**
 * Created by grant on 16/7/26.
 */
const electron = require('electron')
const fs = require('fs')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

app.on('ready', createWindow)
let dataDir = app.getPath("appData")+"/com.grant.video.browser";

function createWindow() {
    if(!fs.existsSync(dataDir)){
       fs.mkdirSync(dataDir)
    }
    const FileManager = require("./FileManager")

    let f = new FileManager({
        dataDir:dataDir,
        configFile:dataDir+"/video.db.json",
    })

    f.loadLocalFile("/tmp/code.uniq")
    mainWindow = new BrowserWindow({width: 800, height: 600})
    mainWindow.loadURL(`file://${__dirname}/index.html`)
    var a = mainWindow.webContents.insert
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
    mainWindow.webContents.insertText("<script id='test'></script>")
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})