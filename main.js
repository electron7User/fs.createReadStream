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
	{scheme: 'customfile', privileges: {standard: true, secure: true}},
]);

function createWindow () {
	
	
	protocol.registerStreamProtocol("custom", (request, callback) => {
		let requestUrl = url.parse(request.url, /*parseQueryString*/ true, /*slashesDenoteHost*/ true);
		let filePath = requestUrl.pathname.replace(/^\/static/, path.join(__dirname).replace(/[?#&].*/, ''));
		
		console.log(filePath);
		
		if (filePath.endsWith(".mp4")) {
			let options = {};
			let contentLength = 0;
			const range = request.headers.Range.replace('bytes=', '').split('-');
			if (range.length !== 2) {
				// No range header or unknown range header format, read whole file
				contentLength = fs.statSync(filePath).size;
			} else {
				let start = +range[0];
				
				// Generate options object to tell createReadStream which parts to read
				if (range[1].length > 0) {
					options = {start: start, end: +range[1]};
					contentLength = +range[1] - start;
				} else {
					options = {start: start};
					contentLength = fs.statSync(filePath).size - start;
				}
			}

			let stream = fs.createReadStream(filePath, options);

			// Here, the stream could be modified, e.g. via stream.pipe(...)
			// without having to process the whole file before starting to play it.
			// However, even when only passing the stream to the browser, 
			// the video cannot be viewed anymore

			// This _did_ work in electron 6, but does not in electron 7/8/9.
			// You can try it by replacing the electron version with ^6.0.0 in package.json

			callback({
				statusCode: 200,
				headers: {
					'Content-Type': 'video/mp4',
					'Content-Length': '' + contentLength,
				},
				data: stream
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
	
	protocol.registerFileProtocol('customfile', (request, callback) => {
		let requestUrl = url.parse(request.url, /*parseQueryString*/ true, /*slashesDenoteHost*/ true);
		let filePath = requestUrl.pathname.replace(/^\/static/, path.join(__dirname).replace(/[?#&].*/, ''));
		
		console.log(filePath);

		callback({
			path: filePath
		});
	})
	
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
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
