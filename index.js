var self = require('sdk/self');
const {ChromeWorker, Cu} = require('chrome');
Cu.import('resource://gre/modules/ctypes.jsm');

var myChromeWorker;
var BOOTSTRAP = this;

function loadAndSetupWorker() {
	if (myChromeWorker) {
		// already initialized worker
	} else {
		myChromeWorker = new ChromeWorker(require('sdk/self').data.url('myChromeWorker.js'));
		myChromeWorker.addEventListener('message', function handleMessageFromWorker(msg) {

			BOOTSTRAP[msg.data[0]].apply(BOOTSTRAP, msg.data.slice(1));
		});
	}
}

function applyOsPathOfImageToDock(aOsPath) {
	
	
	if (require('sdk/system').platform != 'darwin') {

		return;
	}
	
	// i call this funciton os path, instead of file path. because file path is file://C:/path/to/image.png and OS path is: C:\path\to\image.png (for windows)
	// do stuff here to apply icon we'll set this up later
	
	// if aOsPath is blank, then it should remove dock icon
	

	
	loadAndSetupWorker();
	
	myChromeWorker.postMessage(['changeDockIcon', aOsPath]);
}

// globals for swizziling
var swizzled_imageNamed; // Imp // important to make this global otherwise the callback will be GC'ed and firefox will crash
var original_imageNamed; // Imp // so can restore it
var myIcon;
var NSImage;
var imageNamed;
var UTF8String;

var myCtypes;

function swizzleImageNamed(aStrOfPtrOfMyIcon) {
	// because swizziling from another thread is causing crashing

	
	if (!myCtypes) {
		myCtypes = {};
		myCtypes.objc = ctypes.open(ctypes.libraryName('objc'));
		myCtypes.id = ctypes.voidptr_t;
		myCtypes.SEL = ctypes.voidptr_t;
		myCtypes.char = ctypes.char;
		myCtypes.Class = ctypes.voidptr_t;
		myCtypes.Method = ctypes.voidptr_t;
		myCtypes.NIL = ctypes.voidptr_t(0);
		myCtypes.IMP_for_imageNamed = ctypes.FunctionType(ctypes.default_abi, myCtypes.id, [myCtypes.id, myCtypes.SEL, myCtypes.id]).ptr; //repalced variadic with id as its specific to my use otherwise doing class_addMethod throws error saying expected pointer blah blah //ctypes.FunctionType(ctypes.default_abi, id, [id, SEL, '...']).ptr;
		myCtypes.class_getClassMethod = myCtypes.objc.declare('class_getClassMethod', ctypes.default_abi, myCtypes.Method, myCtypes.Class, myCtypes.SEL);
		myCtypes.method_setImplementation = myCtypes.objc.declare('method_setImplementation', ctypes.default_abi, myCtypes.IMP_for_imageNamed, myCtypes.Method, myCtypes.IMP_for_imageNamed);
		myCtypes.objc_msgSend_char = myCtypes.objc.declare('objc_msgSend', ctypes.default_abi, myCtypes.char.ptr, myCtypes.id, myCtypes.SEL, '...');
		myCtypes.objc_getClass = myCtypes.objc.declare('objc_getClass', ctypes.default_abi, myCtypes.id, myCtypes.char.ptr);
		myCtypes.sel_registerName = myCtypes.objc.declare('sel_registerName', ctypes.default_abi, myCtypes.SEL, myCtypes.char.ptr);
		
		NSImage = myCtypes.objc_getClass('NSImage');
		imageNamed = myCtypes.sel_registerName('imageNamed:');
		UTF8String = myCtypes.sel_registerName('UTF8String');
	}
	
	if (aStrOfPtrOfMyIcon) {

		myIcon = ctypes.voidptr_t(ctypes.UInt64(aStrOfPtrOfMyIcon));
		
		// swizzle it
		function js_swizzled_imageNamed(c_arg1__self, c_arg2__sel, objc_arg1__NSStringPtr) {


			var tt_read = myCtypes.objc_msgSend_char(objc_arg1__NSStringPtr, UTF8String);


			var tt_read_jsStr = tt_read.readStringReplaceMalformed();

			
			// return myCtypes.NIL;
			
			if (tt_read_jsStr == 'NSApplicationIcon') {
				// do my hook

				return myIcon;
			} else {
				// do normal

				var icon = original_imageNamed(c_arg1__self, c_arg2__sel, objc_arg1__NSStringPtr); // this is how you call the original
				return icon;
			}
		}
		
		swizzled_imageNamed = myCtypes.IMP_for_imageNamed(js_swizzled_imageNamed); //if use IMP as non-specifically defined as `ctypes.FunctionType(ctypes.default_abi, ID, [ID, SEL, '...']).ptr` you will have variadic in callback defined above, it keeps throwing expecting pointer blah blah. and it wouldnt accept me putting in variadic on this line if do use varidic, on this line it throws `Can't delcare a variadic callback function`
		
		var currentMethod_imageNamed = myCtypes.class_getClassMethod(NSImage, imageNamed);
		var previousImp_imageNamed = myCtypes.method_setImplementation(currentMethod_imageNamed, swizzled_imageNamed);
		if (previousImp_imageNamed.isNull()) {

		}
		
		if (!original_imageNamed) {
			original_imageNamed = previousImp_imageNamed;
		}
	} else {
		// unswizzle it

		if (original_imageNamed) { // else it wasnt swizzled
			var currentMethod_imageNamed = myCtypes.class_getClassMethod(NSImage, imageNamed);
			var previousImp_imageNamed = myCtypes.method_setImplementation(currentMethod_imageNamed, original_imageNamed);
			if (previousImp_imageNamed.isNull()) {

			}
			original_imageNamed = null;
			myIcon = null; // myChromeWorker released it
		}
	}
}

function onPrefChange(prefName) {

	var prefValue = require('sdk/simple-prefs').prefs[prefName];
	
	// prefName will obviously be imagePath as that is our only pref. and we only attached listener to this pref
	if (prefName == 'imagePath') {
		applyOsPathOfImageToDock(prefValue); // even if its blank we want it to apply, because we will make our function, when it gets blank string, to remove the custom dock icon and restore default
	}
}

function startup(text, callback) {


	
	// check if preference is not blank, and if it isnt then call our apply icon function
	var pref_imagePath = require('sdk/simple-prefs').prefs['imagePath'];
	if (pref_imagePath != '') { // blank because we set default value to blank, and by default we want to icon applied
	  // user has a file path set so apply this path as icon:
	  applyOsPathOfImageToDock(pref_imagePath);
	}

	// lets also set up listener on the preference, so when user changes it, it will trigger applyOsPath
	require('sdk/simple-prefs').on('imagePath', onPrefChange);
	
	var sp = require('sdk/simple-prefs');
	sp.on('restoreDefault', function() {

		require('sdk/simple-prefs').prefs.imagePath = '';
	});
}

exports.onUnload = function(reason) {
    //called when add-on is 
    //    uninstalled
    //    disabled
    //    shutdown
    //    upgraded
    //    downgraded

	if (reason != 'shutdown') {
		// lets undo things
		applyOsPathOfImageToDock('');
	}
};

startup();