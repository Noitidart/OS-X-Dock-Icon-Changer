// Imports
importScripts('resource://gre/modules/osfile.jsm');

// Globals
var WORKER = this;

// Set up messaging system
self.onmessage = function (msg) {

	WORKER[msg.data[0]].apply(WORKER, msg.data.slice(1));
}

// Ok my custom addon functionality goes below here

var objc = ctypes.open(ctypes.libraryName('objc'));

if (ctypes.voidptr_t.size == 4 /* 32-bit */) {
	var is64bit = false;
} else if (ctypes.voidptr_t.size == 8 /* 64-bit */) {
	var is64bit = true;
} else {
	throw new Error('huh??? not 32 or 64 bit?!?!');
}

// C TYPES
var char = ctypes.char;

// SIMPLE OBJC TYPES
BOOL = ctypes.signed_char;
NSInteger = is64bit ? ctypes.long: ctypes.int;
NSUInteger = is64bit ? ctypes.unsigned_long : ctypes.unsigned_int;

// GUESS TYPES OBJC - they work though
var id = ctypes.voidptr_t;
var Class = ctypes.voidptr_t;
var IMP = ctypes.voidptr_t;
var Method = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;

// OBJC FUNCTION TYPES
var IMP_for_imageNamed = ctypes.FunctionType(ctypes.default_abi, id, [id, SEL, id]).ptr; //repalced variadic with id as its specific to my use otherwise doing class_addMethod throws error saying expected pointer blah blah //ctypes.FunctionType(ctypes.default_abi, id, [id, SEL, '...']).ptr;

// FUNCTIONS
var class_getClassMethod = objc.declare('class_getClassMethod', ctypes.default_abi, Method, Class, SEL);
var method_setImplementation = objc.declare('method_setImplementation', ctypes.default_abi, IMP_for_imageNamed, Method, IMP_for_imageNamed);
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, char.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, char.ptr);

// custom objc_msgSend's
var objc_msgSend_char = objc.declare('objc_msgSend', ctypes.default_abi, char.ptr, id, SEL, '...');

// COMMON OBJC THINGS
	var alloc = sel_registerName('alloc');
	var init = sel_registerName('init');
	var release = sel_registerName('release');
	var UTF8String = sel_registerName('UTF8String');

	// NSApp = [NSApplication sharedApplication];
	var NSApplication = objc_getClass('NSApplication');
	var sharedApplication = sel_registerName('sharedApplication');
	var NSApp = objc_msgSend(NSApplication, sharedApplication);

	var setApplicationIconImage = sel_registerName('setApplicationIconImage:');
	var NSData = objc_getClass('NSData');
	var dataWithBytes_length = sel_registerName('dataWithBytes:length:');
	var NSImage = objc_getClass('NSImage');
	var initWithData = sel_registerName('initWithData:');
	var imageNamed = sel_registerName('imageNamed:');
	
// CONSTANTS
var NIL = ctypes.voidptr_t(0);
	
// my personal globals for this code
var myIcon; // global so i can do release on it at shutdown
var swizzled_imageNamed; // important to make this global otherwise the callback will be GC'ed and firefox will crash
var original_imageNamed; // so can restore it

function changeDockIcon(aOsPath) {

	
	if (myIcon) { // due to rentry
		objc_msgSend(myIcon, release);
		myIcon = undefined;
	}
	
	
	if (aOsPath == '') {
		// reset the dock icon (removes any custom applied image)

		objc_msgSend(NSApp, setApplicationIconImage, NIL);
		
		/*
		// unswizzle
		if (original_imageNamed) { // else it hasnt been swizzled
			var currentMethod_imageNamed = class_getClassMethod(NSImage, imageNamed);
			var previousImp_imageNamed = method_setImplementation(currentMethod_imageNamed, original_imageNamed);
			if (previousImp_imageNamed.isNull()) {

			}
			original_imageNamed = null;
		}
		*/
		self.postMessage(['swizzleImageNamed']);
		
	} else {
		// read from file and set this image to the dock
		var iconData = OS.File.read(aOsPath);
		
		// NOTE: iconData is Uint8Array
		var length = NSUInteger(iconData.length);
		var bytes = ctypes.uint8_t.array()(iconData);

		// data = [NSData dataWithBytes: bytes length: length];
		var data = objc_msgSend(NSData, dataWithBytes_length, bytes, length);

		// icon = [[NSImage alloc] initWithData: data];
		var myIcon = objc_msgSend(objc_msgSend(NSImage, alloc), initWithData, data);

		if (myIcon.isNull()) {
			throw new Error('Image file is corrupted. Maybe the file path was not to a .ICNS or .PNG or other image file.');
		}

		// [NSApp setApplicationIconImage: myIcon]
		objc_msgSend(NSApp, setApplicationIconImage, myIcon);
		
		// ensure it is applied, because on startup for some darn reason it seems to reset
		setTimeout(function() {
			if (myIcon) {
				objc_msgSend(NSApp, setApplicationIconImage, myIcon);
			}
		}, 10000);

		// [myIcon release]
		// objc_msgSend(myIcon, release); // dont release it as the swizzled implementation needs it

		/*
		// swizzle it
		function js_swizzled_imageNamed(c_arg1__self, c_arg2__sel, objc_arg1__NSStringPtr) {


			var tt_read = objc_msgSend_char(objc_arg1__NSStringPtr, UTF8String);


			var tt_read_jsStr = tt_read_casted.readStringReplaceMalformed();

			
			return NIL;
			
			if (tt_read_jsStr == 'NSApplicationIcon') {
				// do my hook

				return myIcon;
			} else {
				// do normal

				var icon = original_imageNamed(c_arg1__self, c_arg2__sel, objc_arg1__NSStringPtr); // this is how you call the original
				return icon;
			}
		}
		
		swizzled_imageNamed = IMP_for_imageNamed(js_swizzled_imageNamed); //if use IMP as non-specifically defined as `ctypes.FunctionType(ctypes.default_abi, ID, [ID, SEL, '...']).ptr` you will have variadic in callback defined above, it keeps throwing expecting pointer blah blah. and it wouldnt accept me putting in variadic on this line if do use varidic, on this line it throws `Can't delcare a variadic callback function`
		
		var currentMethod_imageNamed = class_getClassMethod(NSImage, imageNamed);
		var previousImp_imageNamed = method_setImplementation(currentMethod_imageNamed, swizzled_imageNamed);
		if (previousImp_imageNamed.isNull()) {

		}
		
		if (!original_imageNamed) {
			original_imageNamed = previousImp_imageNamed;
		}
		*/
		
		var strOfPtrOfMyIcon = myIcon.toString().match(/.*"(.*?)"/)[1];
		
		self.postMessage(['swizzleImageNamed', strOfPtrOfMyIcon]);

	}
	
}