/*
 *  CONFIG FILE FOR SearchPanel
 */

/* sets the main folder for the bookmarks to save */
var mainBookmarkFolderName = 'SearchPanel';

/* the class name of the main div container of the widget */
var previewContainerClass = 'pp_preview';

/* use a workaround for the redrawing bug in chrome: recreates the iframe every time (instead of just changing the content) */
var chromebug_workaround = false;

/* the class name of the preview snippet div - used by the plugin searchSnippet.js only */
var snippetContainerClass = 'pp_preview_snippet';

/* defines the used storage mechanism for the search history */
var backendStorage = "localStorage"; /** db or localStorage **/

/* defines the server for logging */
var logUrl = 'http://logging.paldeploy.com/previewlog';

/* quality settings for the snippets */
var snippetQuality = {format: "image/jpeg", 
        				quality: 0.9};


/* versionType..*/
var versionType; 
if(typeof ss != 'undefined') // simple storage is only defined in main.js
{
	var versionType = ss.storage['versionType'];
	if(!versionType)
	{
		var randomnumber=Math.floor(Math.random()*2);
		if(randomnumber==1)
			versionType = 'complex'; 
		else
			versionType = 'simple'; 
		
		ss.storage['versionType']=versionType;
	}
}

// UUID load/overwrite settings from storage
var UUID;

if(typeof ss != 'undefined')
{
    UUID = ss.storage['UUID'];
    
    if(!UUID || UUID == 'undefined'){
    		UUID = generateUUID();
            ss.storage['UUID'] = UUID;
    		
    		//var log = new Logging();
    		//log.logDirect('new_install', UUID, 'install');
    		//console.log('new UUID generated', UUID);
    }
}

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

console.log('config done');