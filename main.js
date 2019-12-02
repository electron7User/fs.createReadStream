// Modules to control application life and create native browser window
const {app, BrowserWindow, protocol} = require('electron')
const path = require("path");
const fs = require("fs");
const url = require("url");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

protocol.registerSchemesAsPrivileged([
	{scheme: 'custom', privileges: {standard: true, secure: true}},
]);

function createWindow () {
	
	
	protocol.registerStreamProtocol("custom", (request, callback) => {
		let requestUrl = url.parse(request.url, /*parseQueryString*/ true, /*slashesDenoteHost*/ true);
		let filePath = requestUrl.pathname.replace(/^\/static/, path.join(__dirname).replace(/[?#&].*/, ''));

		console.log(filePath);
		
		if (filePath.endsWith(".js")) {
			callback({
				statusCode: 200,
				headers: {
					'Content-Type': 'text/plain',
				},
				data: fs.createReadStream(filePath)
			})
		} else if (filePath.endsWith(".png")) {
			callback({
				statusCode: 200,
				headers: {
					'Content-Type': 'image/png',
				},
				data: fs.createReadStream(filePath)
			})
		} else {
			callback({
				statusCode: 200,
				headers: {
					'Content-Type': 'text/html',
				},
				data: fs.createReadStream(filePath)
			})
		}
	})
	
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 800,
		height: 900,
		webPreferences: {
			nodeIntegration: true
		}
	})
	
	// and load the index.html of the app.
	mainWindow.loadURL('custom://test/static/index.html')
	
	// Open the DevTools.
	mainWindow.webContents.openDevTools()
	
	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
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



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
