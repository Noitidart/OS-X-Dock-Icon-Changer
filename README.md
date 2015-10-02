#Firefox on OS X Icon
Allows you to set a custom icon for your Firefox in you Mac OS X dock.

# JPM Walkthrough with videos on how to create this addon from scratch:

Screencast Part 1/5: [Youtube :: Tutorial Writing Localized js-ctypes JPM Addon - Part 1](https://www.youtube.com/watch?v=r-kDUVTDY7E)

Screencast Part 2/5: [Youtube :: Tutorial Writing Localized js-ctypes JPM Addon - Part 2](https://www.youtube.com/watch?v=v9bTs8Goxr4)

Screencast Part 3/5: [Youtube :: Tutorial Writing Localized js-ctypes JPM Addon - Part 3](https://www.youtube.com/watch?v=M4tn-k28qWE)

Screencast Part 4/5: [Youtube :: Tutorial Writing Localized js-ctypes JPM Addon - Part 4](https://www.youtube.com/watch?v=6VLAFbxQer0)

Screencast Part 5/5: [Youtube :: Tutorial Writing Localized js-ctypes JPM Addon - Part 5](https://www.youtube.com/watch?v=ZY6kQikSgdQ)

### Here is the text that goes along with the videos
```
We'll make a full jpm addon here.
1. Go to https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Getting_Started_%28jpm%29
2. Install JPM
	a. first step is to install npm click that link
	b. ok we need to install node.js so lets get that (install node.js comes with npm)
	c. ok imagine we did all that, i already have it setup
3. Lets make a github repo http://github.com/
4. Lets clone this repository to our computer, lets use the github desktop clientInformation
	a. Downloading that gives you this
	b. Lets clone the repo to our computer
	c. lets make sure the folder is on our computer, cool its there
5. Lets fire up JPM and make a jpm addon in this folder
	a. here are the instructions on how to initilalize a jpm addon: its the " https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Getting_Started_%28jpm%29" section
	b. we wont do mkdir as we already have the directory, be we did cd into that directory just a second ago remember
	c. ok it says do `jpm init` see im in right folder so lets go for it
	d. ok lets answer the questions
	e. for title lets use same as name, it auto does, so just hit enter
	f. lets make it v1.0-night
	g. entry point just hit enter, index.js is good
	h. just hit enter for engines, actually type in firefox, as this is for desktop only
6. Ok its been initailized
7. I cant upload more then 10min vids to youtube so ill stop thi svid and start another
8. Ok im back
9. Now for our addon we want to have a preference which user can set to path of a image, so lets create that lets look up how to do it on docs
	a. go to https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Getting_Started_%28jpm%29 as search engine fails us
	b. then click addon sdk to get us here: https://developer.mozilla.org/en-US/Add-ons/SDK
	c. ok we end up on simple-pref https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/simple-prefs
	d. it tells us to: 	modify the package.json
	e. so back in the folder we clone from github. and the same folder we did jpm init in, lets open up package.json
	f. they say to add this to package.json so lets do it
	g. lets name our pref
	h. actually we dont want to hard code that, we want to localize, so lets see how to do that, it tells us here: https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/l10n#Using_Localized_Strings_in_Preferences
	j. ok it says we need a locale folder and we should put a properties folder there
	lets make default blank, meaning no change to dock icon
	so i dont know french, so lets go to beta.babelzilla nad create a topic so community can help us localize http://beta.babelzilla.org/
	click "new project"
	just noticed that the versio nwas not set to 1.0-night
	ok lets now add in our en-US.properties file so people can translate it to French and other languages
	Oh oh never mind!!! Click on resources tab: http://beta.babelzilla.org/projects/p/firefox-on-os-x-icon/resources/
	Click add new resource
	select your properties file, it auto fills in rest of form, and hit "create resource"
	ok now go to babelzilla forums and post telling them that you made this addon:
	must create topic in this forum: http://www.babelzilla.org/forum/index.php?showforum=2
	click new topic
	provide link to your project
	hit submit
	now people will translate, then you can download the .properties file and stick it into your locale folder
10. im reaching 10min limit for vid, so will stop and restart
11. ok im back
12. ok now we see how to localize lets get back to that preference
	a. i saved package.json, oh wait, we want it to open a file browse dialog on click so lets do that, we dont (actually never mind this gets a little complicated as i dont think there is a jpm module for file picker, lets check ah wait they have it!!!) we just have to set our preference type to File! cool!
	b. ok lets test our addon, lets go back to  https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Getting_Started_%28jpm%29 it will tell us how
	c. we type jpm run while in the folder so lets make sure our command line tool is in our folder, yes it is, lets do jpm run. ok it says error in package.json lets fix that. see i forgot to close this array. ok now lets jpm run
	d. cool lets see our pref, whaa its not there :(
	e. ok it seems we need to give it a default title and description so lets do that, because if a user locale is not something that we have a .properties file for, then it will use these values.
		for example though i will show you that the default values will not be used as we have a en-US.properties
		see the values are not "default title" or "default desc" it took from my en-US.properties, lets remove this file and see what happens, i just renamed it to a bogus locale, see now it uses "default title" and "default description" so lets make this english be default
		lets restore our .properties file
	f. now lets set up a listener when preference changes
	well actually before that, on startup, lets check if our preference value is not blank, and if it is not then we apply the icon
	ok back at https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/simple-prefs#Localization it tells how to get pref value
	reached 10min limi
	ok im back
	so what were we working oN? i forogt... oh yea
	ok lets test to see our preference response to changes
	it says error on line 17
	
	yay that works on change. now lets see on startup what it will do, lets restart the browser
	
	hit shift + f2 then type restart
	bah it makes a new profile everytime. lets just assume it works for now
	lets commit this to github so we dont lose our work in case someone robs my computer
	lets make sure this commit shows up on github
	yay its there.
	ok reaching 10min limit brb
	hi im back
	ok lets now hoook up the functiaonlity of the set icon, it uses jsctypes so lets make it run from a chromeworker
	
	ok lets test to see if chromeworker gets this message
	
	very nice. ok now this is going to be mac os x specific js-ctypes, so i can write it on my windows machine but will have to test on osx
	ill pause vid recording and write the js-ctypes and ill be back soon
	ok im back, i finished writing the ctypes. ill comit it to github now so you can read that code
	ok so now that i wrote it, i want to test it, but i need to test on mac. so lets do jpm xpi, which makes it an xpi according to the jpm geting started docs
	ok cool it got made. now lets set it over to my mac and test it:
	ok here we goooo lets test it out!! (secret: i already tested it i know it works nahnah :P) lets set it to aurora.icns yayyy
	lets remove it. oooo i forgot we didnt set up a way to restore the default. lets for now go to about:config and reset our pref which will restore it to '' which should remove hte icon yayyyyyyyyy
	
	the end :)
```
