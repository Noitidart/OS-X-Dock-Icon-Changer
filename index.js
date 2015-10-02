var self = require('sdk/self');


function applyOsPathOfImageToDock(aOsPath) {
	// i call this funciton os path, instead of file path. because file path is file://C:/path/to/image.png and OS path is: C:\path\to\image.png (for windows)
	// do stuff here to apply icon we'll set this up later
	
	// if aOsPath is blank, then it should remove dock icon
	
	console.error('applying path of: ', aOsPath); // lets do testing
}

function onPrefChange(prefName) {
  console.log("The preference " +  prefName + " value has changed!");
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
  require("sdk/simple-prefs").on("imagePath", onPrefChange);
}

startup();