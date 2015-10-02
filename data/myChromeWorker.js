// Imports
importScripts('resource://gre/modules/osfile.jsm');

// Globals
var WORKER = this;

// Set up messaging system
self.onmessage = function (msg) {
	console.error('incoming msg to worker:', msg.data);
	WORKER[msg.data[0]].apply(WORKER, msg.data.slice(1));
}

// Ok my custom addon functionality goes below here

var objc = ctypes.open(ctypes.libraryName('objc'));

var id = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var objc_getClass = objc.declare('objc_getClass',
								ctypes.default_abi,
								id,
								ctypes.char.ptr);
var sel_registerName = objc.declare('sel_registerName',
									ctypes.default_abi,
									SEL,
									ctypes.char.ptr);
var objc_msgSend = objc.declare('objc_msgSend',
								ctypes.default_abi,
								id,
								id,
								SEL,
								'...');

function changeDockIcon(aOsPath) {
	console.error('from chromeworker we got msg to set dock icon to:', aOsPath);
	
	// NSApp = [NSApplication sharedApplication];
	var NSApplication = objc_getClass('NSApplication');
	var sharedApplication = sel_registerName('sharedApplication');
	var NSApp = objc_msgSend(NSApplication, sharedApplication);
  
	if (aOsPath == '') {
		// reset the dock icon (removes any custom applied image)
		
		var NIL = ctypes.voidptr_t(0);
		
		// [NSApp setApplicationIconImage: NIL]
		var setApplicationIconImage = sel_registerName('setApplicationIconImage:');
		objc_msgSend(NSApp, setApplicationIconImage, NIL);
		
	} else {
		// read from file and set this image to the dock
		var iconData = OS.File.read(aOsPath);
		
		// NOTE: iconData is Uint8Array
		var length = ctypes.unsigned_long(iconData.length);
		var bytes = ctypes.uint8_t.array()(iconData);

		// data = [NSData dataWithBytes: bytes length: length];
		var NSData = objc_getClass('NSData');
		var dataWithBytes_length = sel_registerName('dataWithBytes:length:');
		var data = objc_msgSend(NSData, dataWithBytes_length, bytes, length);

		// icon = [[NSImage alloc] initWithData: data];
		var NSImage = objc_getClass('NSImage');
		var initWithData = sel_registerName('initWithData:');
		var alloc = sel_registerName('alloc');
		var icon = objc_msgSend(objc_msgSend(NSImage, alloc), initWithData, data);

		if (icon.isNull()) {
			throw new Error('Image file is corrupted. Maybe the file path was not to a .ICNS or .PNG or other image file.');
		}

		// [NSApp setApplicationIconImage: icon]
		var setApplicationIconImage = sel_registerName('setApplicationIconImage:');
		objc_msgSend(NSApp, setApplicationIconImage, icon);

		// [icon release]
		var release = sel_registerName('release');
		objc_msgSend(icon, release);

	}
	
}