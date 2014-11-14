// Modules needed are `require`d, similar to CommonJS modules.
// In this case, creating a Widget that opens a new tab needs both the
// `widget` and the `tabs` modules.
var Widget = require("widget").Widget;
var tabs = require('tabs');
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
var ss = require("sdk/simple-storage");
var workers = {};

//var wrapper = require("data/wrapperFF.js");
var document = this;
var window = document;
//eval(self.data.load("js/jquery-2.0.0.js"));

eval(self.data.load("js/preview/plugins/logging.js"));
eval(self.data.load("wrapperFF.js"));
eval(self.data.load("config.js"));

var logging = ss.storage['logging'];
if(logging == 'undefined' || logging == null)
{
    logging = true;
}

var on = ss.storage['extension_on'];
on = on == null || on == 'true';

var active = false;
var widget = null;
//var activeWorker;

//setTimeout(setOn, 250);
setOn(); // gets only called once (when the plugin loads)

var tab;

const { Cc, Ci } = require('chrome');

var historyService = Cc["@mozilla.org/browser/nav-history-service;1"]
    .getService(Ci.nsINavHistoryService);
    
var bookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"]
    .getService(Ci.nsINavBookmarksService);

var ioService = Cc["@mozilla.org/network/io-service;1"]
                    .getService(Ci.nsIIOService);
                    
/*chrome.bookmarks.onCreated.addListener(
    function(id, bookmark) {
		if(!tab) return;
		//console.log('bookmark added',bookmark);
		chrome.tabs.sendMessage(tab.id, {	
			'command': 'bookmark_added', 
			'url': bookmark.url
		});
	});

chrome.bookmarks.onRemoved.addListener(
	function(id, removeInfo) {
		if(!tab) return;
		//console.log('bookmark_deleted', removeInfo);
		chrome.tabs.sendMessage(tab.id, {	
			'command': 'bookmark_deleted'
		});
});
*/

tabs.on('activate', function(tab) {
    notifyTabOfState(workers[tab.id]);
});


if(backendStorage == 'db') {
    console.log('this storage type is not available for firefox');
}

var handleMsg = function(tab, info) {
		if(!info.command)
		{
    		console.log('invalid command',info);
    		return;
		}
    	
    	console.log('new message: '+info.command,info);
    	
    	switch(info.command)
    	{
	    	case 'load_data':
	    		if(info.specific == 'tab') 	mkey = info.key + '.' + uniqueTabId(tab, info.tabhash);
	    		else mkey = info.key;
	    		
	    		var postData = function(key,value) {
		    		tab.postMessage({
						'command': 'data', 
						'key': key,
						'value': value
					}); 
		    	};
	    		
	    	  	postData(info.key, readValue(mkey));
	    		break;
	    	case 'load_vars':
	    		tab.postMessage({
					'command': 'initVars', 
					'versionType': versionType,
					'UUID': UUID,
                    'logging': logging
				}); 
	    		break;
            case 'setLogging':
        	    logging = info.value;
                ss.storage['logging'] = logging;
	    		break;
	    	case 'save_data':
	    		if(info.specific == 'tab') 	mkey = info.key + '.' + uniqueTabId(tab, info.tabhash);
	    		else mkey = info.key;
	    		
	    		storeValue(mkey, info.value);
	    		break;

	    	case 'save_top':
	    		storeValue('top', info.value);
	    		break;
	    	case 'get_top':
	    		//console.log('get top');
	    		tab.postMessage({
	    						'command': 'top_position', 
	    						'value': readValue('top')
	    					});
	    		break;
	    	case 'search_visithistory':
                let options = historyService.getNewQueryOptions();
                let query1 = historyService.getNewQuery();
                query1.searchTerms = info.url;
                
                let result = historyService.executeQuery(query1, options);
                var rootNode = result.root;
                rootNode.containerOpen = true;
                
                var results = [];
                for (var i = 0; i < rootNode.childCount; i ++) {
                  results.push(rootNode.getChild(i).title);
                }
                
                // close a container after using it!
                rootNode.containerOpen = false;
                
                tab.postMessage({
    						'command': 'history_visitresult', 
    						'results': results,
                            'url': info.url
    					});
	    		/*chrome.history.getVisits({url: info.url}, function(results) {
			    		chrome.tabs.sendMessage(tab.id, {	
								'command': 'history_visitresult', 
								'results': results,
								'url': info.url
		    			});
	    		});*/
	    		break;
	    	case 'search_bookmark':
                var results = [];
                var uri = ioService.newURI(info.query, null, null);
                
                if(bookmarksService.isBookmarked(uri))
    	        {
                    results.push({url: info.query});
                }
                
                tab.postMessage({
        					'command': 'bookmark_result', 
    						'results': results,
                            'query': info.query
    					});
	    		/*chrome.bookmarks.search(info.query, function(results) { 
	    				chrome.tabs.sendMessage(tab.id, {	
	    						'command': 'bookmark_result', 
	    						'results': results,
	    						'query': info.query
						});
	    		});*/
	    		break;
	    	case 'add_bookmark':
	    		// needed parameters:
	    		// - url
	    		// - title
	    		// - subfolder
	    		// NOTE: we only give feedback on success
	    		
	    		/* steps:
	    		1. check if main folder exists
	    		1.1 if not, create them
	    		2. look for folder
	    		3. check if subfolder exists (date, but specified by parameter)
	    		4.1 if not, create it
	    		5. add bookmark
	    		*/
	    		/*
	    		var createBookmark = function(subFolder) {
	    			// create bookmark
	    			chrome.bookmarks.create({'parentId': subFolder.id,
                        'title': info.title,
                        'url': info.url},function(res) { // gets triggered by the new bookmark listener anyway
                        	//console.log(res);
	                        //chrome.tabs.sendMessage(tab.id, {	
	    					//	'command': 'bookmark_added', 
	    					//	'results': res,
	    					//	'url': info.url
	    					//});
                        });
	    		};
	    		
	    		var createSubFolder = function(newFolder,callback) {
					// create subfolder
					chrome.bookmarks.create(
							{'parentId': newFolder.id, 'title': info.subfolder},
							function(newFolder) {
								// add bookmark
								//console.log("added folder: " + newFolder.title);
								callback(newFolder);
							});
    				//console.log("added folder: " + newFolder.title);
    			};
	    		
	    		searchFolderNameInBookmarks(mainBookmarkFolderName, 
	    				function(folderName,mainFolder) {
	    					// found mainFolder
	    					//console.log('found main folder',mainFolder);
	    					searchFolderNameInBookmarks(info.subfolder, 
	    						function(folderName,subFolder) {
	    							// found
	    							//console.log('all folders exist');
	    							createBookmark(subFolder);
	    						},
	    						function(folderName) { 
	    							// not found
	    							//console.log('missing subfolder');
	    							createSubFolder(mainFolder,createBookmark); // create subfolder and on success create bookmark
	    						},
	    						mainFolder,
	    						1);
	    				},
	    				function(folderName) {
	    					// mainFolder not found -> create main folder
	    					chrome.bookmarks.create(
	    							{'title': mainBookmarkFolderName},
	    							function(newFolder) { createSubFolder(newFolder,createBookmark); } // create subfolder and on success create bookmark
	    		    			);
	    				},
	    				false,
	    				2);
	    		*/
                
                
                //crate foler
                //var menuFolder = bmsvc.bookmarksMenuFolder; // Bookmarks menu folder
                //var newFolderId = bmsvc.createFolder(menuFolder, "Folder name here", bmsvc.DEFAULT_INDEX);
                
                //create bookmark
                //var ios = Components.classes["@mozilla.org/network/io-service;1"]
                 //   .getService(Components.interfaces.nsIIOService);
                //var uri = ios.newURI("http://google.com/", null, null);
                //var newBkmkId = bmsvc.insertBookmark(newFolderId, uri, bmsvc.DEFAULT_INDEX, "");
	    		break;
	    	case 'del_bookmark':
                var uri = ioService.newURI(info.url, null, null);
                var bookmarksArray = bookmarksService.getBookmarkIdsForURI(uri, {});

                
	    		// needed parameters:
	    		// - url
	    		/*
	    		var deleteEntry = function(askForPermission,entry,subFolder) {
	    			if(askForPermission) {
	    				if(confirm('This bookmark is in a custom subfolder ('+subFolder.title+')! Do you really want to delete it?')==false)
	    					return;
	    			}
	    			
	    			chrome.bookmarks.remove(entry.id,function(res) { // gets triggered by the delete bookmark listener anyway
	    				console.log(res);
	    				//	if(res)
	    				//	{
		    			//		chrome.tabs.sendMessage(tab.id, {	
			 			//			'command': 'bookmark_deleted', 
			 			//			'results': res,
			 			//			'url': info.url
			 			//		});
	    				//	}
	    				});
	    		};
	    		
	    		chrome.bookmarks.search(info.url, function(results) {
	    			//console.log(results);
	    			$.each(results,function(k,v) { 
	    				// check if this bookmark is in our subfolder.. if not, ask for permission to remove it...
	    				chrome.bookmarks.get(v.parentId,function(resO) {
	    					if(resO[0].parentId) { 
	    						chrome.bookmarks.get(resO[0].parentId,function(res) {
	    							if(res[0].title != mainBookmarkFolderName) 
	    								deleteEntry(true,v,resO[0]);  // wrong subfolder, ask for permission to delete this entry
	    							else 
	    								deleteEntry(false,v); // all fine, we can remove this without asking again
	    						});
	    					}
	    					else 
	    						deleteEntry(true,v,resO[0]); // no subfolder, ask for permission to delete this entry
	    				});
	    			} );
	    		});
            */
	    		break;
	    	case 'log':
	    		if(ss.storage['noLogging'])
	    		{
	    			console.log('logging is deactivated!');
	    			return;
	    		}
	    		console.log('log', info.data);
	    		//$.ajax({url: logUrl,
	    		//	data: info.data});
	    		break;
	    	case 'status':
	    		//console.log("tab status", info);
	    		//console.log(info.site);
	    	    updateIcon(info.site !== false);
	        	
	    	    setOn();
	    		
	    		break;
    		default:
    			console.log('Houston, we\'ve got a problem...command '+info.command+' is unknown. help me with that:', info);
    	}
   };

tabs.on('open', function onOpen(tab) {
  if(tabs.activeTab)
  {
    ss.storage['currentSearch.' + tab.id] = ss.storage['currentSearch.' + tabs.activeTab.id];
    ss.storage['currentSnaps.' + tab.id] = ss.storage['currentSnaps.' + tabs.activeTab.id];
	notifyTabOfState(workers[tab.id]);
  }
});

tabs.on('close', function onOpen(tab) {
  if(tabs.activeTab)
  {
    delete ss.storage['currentSearch.' + tab.id];
    delete ss.storage['currentSnaps.' + tab.id];
  }
});
// problems:
// - hash IS not unique
// - hash is not available at listeners (save hash temporary through tab id.. complicated, but would be possible...)
function uniqueTabId(tab,hash) {
	//return hash;
	return tab.id; // 
}
  
function setOn(p_on)
{
	p_on = p_on == null ? on : p_on;
	
	//console.log('setOn',p_on);
	
    ss.storage['extension_on'] = '' + p_on;
    
    on = p_on;
    updateIcon();
    
    for (var w in workers) {
        notifyTabOfState(w);
    }
}

function notifyTabOfState(worker) {
    if(!worker) return;
    
	//console.log('notifyTabOfState message to ',id, active,on);
    worker.postMessage({
    		'command': 'tabstate', 
    		'active': active,
    		'state': on
    		});
}

function searchFolderNameInBookmarks(folderName, onSuccessCallback, onFailureCallback,subtree,maxdeep,currentdeep) {
	//console.log('searchFolderNameInBookmarks',folderName);
	if(!maxdeep) maxdeep = 10;
	if(!currentdeep) currentdeep = 0;
	
	if(maxdeep < currentdeep)
	{
		//console.log('max deep reached:', maxdeep + "<" + currentdeep);
		return false;
	}
	currentdeep++;
	
	if(!subtree)
	{
		chrome.bookmarks.getTree(function(results) {
			//console.log(results);
			if(results[0].children)
			{
				for(var i=0;i<results[0].children.length;i++)
				{
					var l = results[0].children[i];
					if(l.children)
					{
//						/console.log('root',l.title);
						if(searchFolderNameInBookmarks(folderName,onSuccessCallback, onFailureCallback, l, maxdeep, currentdeep))
							return true;
					}
				}
			}
			if(onFailureCallback) onFailureCallback(folderName);
			//console.log(folderName + " not found");
		});
	}
	else
	{
		//console.log('subtree',subtree.title);

		if(subtree.title == folderName) 
		{
			//console.log('found '+subtree.title+':', onSuccessCallback);
			if(onSuccessCallback) onSuccessCallback(folderName,subtree);
			return true;
		}
		
		for(var i=0;i<subtree.children.length;i++)
		{
			var l = subtree.children[i];
			if(l.children)
			{
				if(searchFolderNameInBookmarks(folderName,onSuccessCallback, onFailureCallback, l, maxdeep, currentdeep))
					return true;
			}
		}
		
		if(currentdeep==1)
		{
			if(onFailureCallback) onFailureCallback(folderName);
			//console.log(folderName + " not found");
		}
	}
	return false;
}

function getIcon() {
	var icon;
	if (on) 
		icon = active ? "icons/on.png" : "icons/inactive.png";
	else
		icon = "icons/off.png";
	return {path: icon};
}

function storeValue(key, value) {
	if (value) {
		var encoded = JSON.stringify(value);
		if (encoded != "undefined")
			ss.storage[key] = encoded;
		else
			console.log('cannot code '+key);
	}
}

function readValue(key) {
	var value = ss.storage[key];
	if (value)
		try {
			value = JSON.parse(value);
		}
	catch(err) {
		console.log("Error reading value at " + key + " from persistent store", err);
		value = null;
	}
	return value;
}

//loadStylesheet
  
function updateIcon(state) {
	//console.log('active',state);
    if(state)
	    active = state;
    if(widget)
        widget.contentURL = self.data.url(getIcon().path);
//	  var text = active ? 'ok' : 'foo';
//	  chrome.browserAction.setBadgeText({'text':text});
//	  console.log('updateIcon', text);
}

// show help page after installation
if (!ss.storage['hasSeenIntro']) {
  console.log('ss storage', ss.storage['hasSeenIntro']);
  ss.storage['hasSeenIntro'] = 'yep';
  console.log('ss storage', ss.storage['hasSeenIntro']);
  tabs.open({
    url: self.data.url('help.html')+'?firststart' ,
    onOpen: function(worker) {
        console.log('ontatach tab');
        worker.on('message', function(message) {
            handleMsg(worker,message);
        })
    },
    contentScriptOptions: {
        dataURL: self.data.url()
    }
  });
}

pageMod.PageMod({
  include: "resource://jid0-9vvlaffahkqmkzjfewct4rhkocy-at-jetpack/searchpanel/data/help.html*",
   contentScriptFile: [
                self.data.url("js/jquery-2.0.0.js"), 
              	self.data.url("js/jquery-ui-1.10.3.custom.js"),
                self.data.url("wrapperFF.js"),
                self.data.url("config.js"), 
                self.data.url("js/MD5.js"), 
              	self.data.url("js/preview/Utilities.js"), 
                self.data.url("js/preview/SearchHistory.js"), 
                self.data.url("js/preview/plugins/logging.js"),
                self.data.url("help.js")
            ],
    onAttach: function(worker) {
        workers[worker.tab.id] = worker;
        worker.on('message', function(message) {
            handleMsg(worker,message);
        })
    },
    contentScriptOptions: {
        dataURL: self.data.url()
    }
});

                
/*chrome.bookmarks.onCreated.addListener(
    function(id, bookmark) {
    	if(!tab) return;
		//console.log('bookmark added',bookmark);
		chrome.tabs.sendMessage(tab.id, {	
			'command': 'bookmark_added', 
			'url': bookmark.url
		});
	});

chrome.bookmarks.onRemoved.addListener(
	function(id, removeInfo) {
		if(!tab) return;
		//console.log('bookmark_deleted', removeInfo);
		chrome.tabs.sendMessage(tab.id, {	
			'command': 'bookmark_deleted'
		});
});*/
var myExt_bookmarkListener = {
  onItemAdded: function(aItemId, aFolder, aIndex) {
  /*tab.postMessage({
    					'command': 'data', 
						'key': key,
						'value': value
					}); 
  */
          console.log('bookmark ADDED');
  },
  onItemChanged: function(aBookmarkId, aProperty, aIsAnnotationProperty, aValue) {
    MyExtension.doSomething();
  },
  onItemRemoved: function(aItemId, aFolder, aIndex) {
        console.log('bookmark removed');
  /*tab.postMessage({
    					'command': 'data', 
						'key': key,
						'value': value
					}); */
  }
};


exports.main = function() {
    bookmarksService.addObserver(myExt_bookmarkListener, false);
 
    pageMod.PageMod({
      include: ["*"],
      //contentScriptWhen: 'end',
      attachTo: ["top"],
      contentScriptFile: [
                self.data.url("js/jquery-2.0.0.js"), 
          		self.data.url("js/jquery-ui-1.10.3.custom.js"),
                self.data.url("wrapperFF.js"),
                self.data.url("config.js"),
          		self.data.url("js/MD5.js"), 
          		self.data.url("js/html2canvas.js"),
          		self.data.url("js/preview/Utilities.js"), 
            	self.data.url("js/preview/SearchHistory.js"), 
          		self.data.url("js/preview/SearchEngineAdapters.js"), 
          		self.data.url("js/preview/BookmarkManager.js"),
          		self.data.url("js/preview/HistoryManager.js"),
          		self.data.url("js/preview/plugins/searchSnippet.js"),
          		self.data.url("js/preview/plugins/logging.js"),
          		self.data.url("js/preview/plugins/highlightBar.js"),
            	self.data.url("js/preview/plugins/displayFavicons.js"),
          		self.data.url("js/preview/plugins/searchEngineSwitcher.js"),
          		self.data.url("js/preview/plugins/currentPage.js"),
          	    self.data.url("query_preview.js")
            ],
            onAttach: function(worker) {
                worker.on('message', function(message) {
                    handleMsg(worker,message);
                })
            },
            contentScriptOptions: {
                dataURL: self.data.url()
            }
    });
    
    // Widget documentation: https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/widget.html

    widget = new Widget({
        // Mandatory string used to identify your widget in order to
        // save its location when the user moves it in the browser.
        // This string has to be unique and must not be changed over time.
        id: "search-panel-widget",

        // A required string description of the widget used for
        // accessibility, title bars, and error reporting.
        label: "SearchPanel",


        // An optional string URL to content to load into the widget.
        // This can be local content or remote content, an image or
        // web content. Widgets must have either the content property
        // or the contentURL property set.
        //
        // If the content is an image, it is automatically scaled to
        // be 16x16 pixels.
        contentURL: self.data.url("icons/on.png"),

        // Add a function to trigger when the Widget is clicked.
        onClick: function(event) {
            setOn(!on);
        }
    });
};
