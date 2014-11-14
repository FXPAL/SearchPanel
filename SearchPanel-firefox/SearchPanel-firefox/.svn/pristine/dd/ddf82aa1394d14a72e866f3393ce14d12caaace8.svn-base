/*
 * These functions are responsible for maintaining the view and 
 * processing page updates.
 * 
 * 2012 Sep 24 Gene Golovchinsky
 * 2013 May 17 Simon Tretter
 */
var manifest = getManifest();

// current state variables
var loadedUrl = null;
var site = null;
var lastResults = [];
var savedState = {};
var logging=true;

// reset basic vars
UUID=false;
versionType=false;

// dragging variables
var dragging=false;
var startDraggingY = {};
var totalPosY;
var actualDragged=false;

// helper classes
var searchAdapters = new SearchAdapters();
var searchHistory = new SearchHistory();
var bookmarkManager = new BookmarkManager(); 
var historyManager = new HistoryManager();

// plugins
var initPlugins = function() {
    new Logging({version: manifest.version, versionType: versionType, UUID: UUID});
    if(versionType == 'complex')
	{ 
		new SearchSnippet();
		new HighlightBar();
	}
	
	new DisplayFavicons();
	new SearchEngineSwitcher();
	new CurrentPage();
	initPlugins = function() { };
};

addMessageListener(
  function(request) {	  
	if(!request.command)
	{
		  console.log('invalid command',request);
		  return;
	}
  	
	console.log('new message: '+request.command,request);

	switch(request.command)
	{
		case 'initVars':
			versionType = request.versionType;
			UUID = request.UUID;
            logging = request.logging;
			initPlugins(); // init plugins on first message
			break;
		case 'data':
			searchHistory.setData(request.key,request.value, true);
			
			if(searchHistory.isReady())
			{
				// after history got initalized, check the page
				checkPage();
			}
			break;
		case 'top_position':
			saveWidgetPosition(request.value,true);
			getPreview(function($preview) { ;
			    $preview.css('top',request.value);
			});
			break;
		case 'trigger_update':// for debugging purpose only
			loadedUrl = null;
			checkPage();
			break;
		case 'screen_captures': // not used
			searchSnippet.updateSnaps(request.results);
			break;
		case 'bookmark_result':
			bookmarkManager.resumeCheckEntry(request.query,request.results);
			break;
		case 'history_visitresult':
			historyManager.resumeCheckEntry(request.url,request.results);
			break;
		case 'bookmark_added':
			console.log('bookmark added',request.url);
			$(document).trigger('preview_triggers_addedBookmark',request.url);
			break;
		case 'bookmark_deleted':
			console.log('bookmark removed');
			$(document).trigger('preview_triggers_deletedBookmark',request.url);
			break;
		case 'tabstate':
			$(document).trigger('preview_triggers_tabstate',request);
			
			//if(request.version_type) { // simple | complex
			//	versionType = request.version_type;
			//}
			
			if(request.state)
			{
				//getPreview().fadeIn();
				getPreview(function($preview) { $preview.show() });
				checkPage(0,true);
			}
			else
			{
				getPreview(function($preview) { $preview.hide() });
			}
			
			//sendResponse({active: request.active, history: history});
			break;
		default:
			console.log('Roger, we\'ve got another problem...command '+request.command+' is unknown. help me with this:', request);
	}
});


postMessage({
	'command': 'load_vars'
});

function checkPage(cntCall,redraw)
{
	if (!searchHistory.isReady()) {
		console.log("checkPage: history not ready/loaded -> continue anyway");
		//return;
	}
	
	if(redraw && savedState)
	{
		console.log('redraw',savedState);
		if(savedState.current != null)
		{
			updatePreview(savedState.adapter,savedState.current);
		}
		return;
	}
	
	console.log("check page called");
    var newurl = document.location.href;
    if (newurl != loadedUrl)
    {
    	$(document).trigger('preview_triggers_newUrl',newurl);
    	
    	// check if we are on a supported search engine
    	adapterResult = searchAdapters.match(newurl);
    	
    	var currentResults;    	
    	//console.log('adapter', adapterResult);

    	/* if current results is 0 and an adapter matches, we keep trying at least some time to 
    	 parse results.. maybe an ajax request is still going on.
    	*/
    	if (adapterResult.results.length == 0 && adapterResult.site) {
    		if(!cntCall) cntCall = 0; 
    		console.log("no results yet, but we don't give up....",cntCall);
    		
    		if(cntCall > 10) { } //console.log("alright, we give up..."); 
    		else setTimeout(function() { checkPage(++cntCall); },400);
    		return;
    	} 
    	/* if search results are the same than before, but checkPage got called again
    	we can assume that the results are still loading and we keep trying to find them.. */
    	else if ( (adapterResult.results.length == 0 || calculateHash(adapterResult.results) == calculateHash(lastResults)) 
    			// adapterResult.resultsJSON.stringify($(adapterResult.results)) == JSON.stringify($(lastResults))) // todo: look for a cheesier way to compare two arrays... note: .not() doesnt work somehow 
    			//$(currentResults).not(lastResults).length == 0 && $(lastResults).not(currentResults).length == 0
    			//currentResults == lastResults 
    			&& adapterResult.site) {
    		if(!cntCall) cntCall = 0; 
    	console.log("no NEW results yet, but we don't give up....",cntCall, calculateHash(adapterResult.results)+" = "+calculateHash(lastResults));
    		
    		if(cntCall > 10) { } //console.log("alright, we give up..."); 
    		else {
    			setTimeout(function() { checkPage(++cntCall); },400);
    		}
    		return;
    	}
    	else if(adapterResult.results.length > 0 && adapterResult.site)
		{
    		// populate results
    		searchHistory.updateCurrentSearch(location.href, 
    				adapterResult.query, 
    				adapterResult.site, 
    				adapterResult.results);
    		
    		// if not in query history, add to retrieved results and add query to history
    		if(!searchHistory.isInQueryHistory(adapterResult)) {
    			$(document).trigger('preview_triggers_newQuery', [adapterResult.query, adapterResult]);
    			
    			// mark them as retrieved
    			searchHistory.markResultAsRetrieved(adapterResult.results);
    			
    			// add query to query history
    			searchHistory.addQueryToHistory(adapterResult);
    		}
    		else
    		{
    			$(document).trigger('preview_triggers_oldQuery', [adapterResult.query, adapterResult]);
    		}

    		currentResults = adapterResult.results;
		}
    	else
		{
    		// not on a search page, check our history adapter if we have something in there...
    		currentResults = searchHistory.getCurrentResults();
    		
    		if (currentResults.length <= 0 && !searchHistory.isReady()) {
    			if(!cntCall) cntCall = 0; 
    			//console.log("no history yet, but we don't give up....",cntCall);
    			
    			if(cntCall > 10) { } //console.log("alright, we give up..."); 
    			else {
    				setTimeout(function() { checkPage(++cntCall); },400);
    			}
    			return;
    		}
		}

    	console.log('currentResults', currentResults);
    	
    	// update loadedUrl and lastResults
    	loadedUrl = newurl;
    	lastResults = adapterResult.results;
    	
    	if(currentResults.length > 0 && adapterResult.site)
		{
    		console.log('checkPage() result: ', 'search page (code: '+adapterResult.site+') and all seems fine.. display the widget');
    		updatePreview(adapterResult,currentResults);
    		savedState = {adapter: adapterResult, current: currentResults};
		}
    	else if(currentResults.length > 0 && !adapterResult.site)
    	{
    		console.log('checkPage() result:', "not on a search result page, but we have some information about last search session to display");
    		updatePreview(null, currentResults);
    		savedState = {adapter: null, current: currentResults};
    	}
    	else
    	{
    		console.log('checkPage() result:', 'nothing to display');
    		savedState = {adapter: null, current: null};
    	}
    	
        var status = {
			command: "status",
			site: adapterResult.site,
			url: loadedUrl,
			referer: document.referrer,
			history: history
		};
        postMessage(status);
    }
};

function getPreview(fct) {
    console.log('getPreview() called');
	$previewContainer = getPreviewContainer();
	
    console.log('container length:', $previewContainer);
    
	if ($previewContainer.length == 0) {
		//console.log('generate new preview');
		$previewContainer = $('<div>')
			.addClass(previewContainerClass)
			.attr('style', 
					"position: fixed !important; \
					top: "+getWidgetPosition()+"; \
    				min-height: 300px; \
					right: 0px; \
					z-index: 1010101; \
					display: inline-block; \
					width: 0px; \
					margin: 0px ! important; \
					border: none ! important; \
					overflow: hidden; \
					"); //display: none;
        $(document.body).append($previewContainer);
        
        var $contentFrame = $('<iframe>')
			.addClass('pp_iframe')
			.attr('style',"top: 0px;\
				right: 0px;\
				width: 100%;\
				height: 100%;\
				margin: 0px ! important;\
				border: none ! important;\
				overflow: hidden  ! important;\
				background-color: transparent  ! important;\
				padding: 0  ! important;");
		//$contentFrame.attr('src', 'about:blank');
        $contentFrame.attr("scrolling","no");
        
		var myContent = '<!DOCTYPE html>'
		    + '<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en"><head><title>search widget iframe</title>'
		    + '<link rel="stylesheet" href="'+getURL('preview.css')+'"> </head>'
		    + '<body></body></html>';
            
        //console.log('creating iframe');

        var $contents = $('<div>');

		try {
            $previewContainer.append($contentFrame);
            
            let url = "data:text/html;charset=utf-8," + encodeURIComponent(myContent);
            
            $contentFrame.on("load", function() {
                console.log('damn iframe');
                //var iFrameDoc = $contentFrame[0].contentDocument || $contentFrame[0].contentWindow.document;
            
                $(this).contents().find('body').addClass('pp_iframe_body');
                $(this).contents().find('body').append($contents);
                
                console.log('created  $previewContainer');
                if(fct) fct($(this));
            });
            $contentFrame.attr('src', url);
		}
		catch(e)
		{
			console.log('getPreview(): problem with contentframe for widget', $contentFrame);
			return false;
		}
		
		//var $link = $('<link>');
		//$link.attr('rel', 'stylesheet');
		//$link.attr('href', getURL('preview.css'));
	    //$contentFrame.contents().find('head').append($link);

        //document.getElementsByClassName('pp_iframe')[0].contentDocument.getElementsByTagName('body')[0].innerHTML='<div></div>'

       // document.getElementsByClassName('pp_iframe')[0].contentDocument

       
        
        //console.log($contentFrame.contents().find('body div').length);
        
        
            
        //$contentFrame.on("load", function() {
        //
        
        //    console.log('contentFrame on load');
            
        //});
        
        //$contentFrame.attr('src', url);
        
		$contents.addClass('pp_contents')
			.on('mousedown', function(event) {
				if(!dragging)
				{
					dragging=true;
					actualDragged=false;
					startDraggingY['outside']=false;
					startDraggingY['iframe']=event.pageY;
					totalPosY = getPreviewContainer().offset().top - $(window).scrollTop();
					//console.log('drag is here');
				}
				})
			.on('mousemove', function(event,bla) {
                	if(dragging)
            		{
            			newPosY = event.pageY - startDraggingY['iframe'];
            			if(newPosY > 2 || newPosY < -2)
            				actualDragged=true;
            			//console.log('iframe move',newPosY);
            			totalPosY += newPosY;
            			//console.log(totalPosY);
            			getPreviewContainer().css("top",totalPosY+"px");
            		}
				})
			.on('mouseup', function() {
				if(dragging)
				{
					dragging=false;
					
					var top = getPreviewContainer().offset().top - $(window).scrollTop();
					//console.log("iframe - draggable stop", top);
					if(actualDragged)
						saveWidgetPosition(top);
				}
			})
			.on('mouseleave', function() {
				if(dragging)
				{
					dragging=false;
					
					var top = getPreviewContainer().offset().top - $(window).scrollTop();
					//console.log("iframe - draggable stop (mouse focus lost)", top);
					if(actualDragged)
						saveWidgetPosition(top);
				}
			});
            return;
	}
    console.log('done  $previewContainer');
    if(fct) fct($(this));
	//return $previewContainer; 
};

function updatePreview(adapter, currentResults, $container) {
	console.log("updatePreview called", $container);
    
    if(!$container)
    {
	    $(document).trigger('preview_triggers_updatePreview', [adapter, currentResults]);

    	var $previewContainer = getPreviewContainer();
	
    	console.log('jquery dom is ready',jQuery.isReady);
	
    	if(chromebug_workaround && $previewContainer.length > 0)
    	{
		    console.log('removing iframe');
		    // remove container and add a new iframe everytime
		    $previewContainer.remove();
    		
	    	//console.log($previewContainer);
		    $previewContainer.length=0;
	    }   
    
        getPreview(function($container) { updatePreview(adapter, currentResults, $container); });
		return false;
    }
	    
    var previewWidth = 78;
	if(versionType == 'simple')
        previewWidth = 56;
    
	var $preview = $container.contents().find('div');  // find('iframe').contents()
	
	$preview.empty();

	/*var currentResults = searchHistory.currentResults(); // do not use adapter.results! 
													  // (adapter.results only contains results from the current page..
	*/												// this is only the case on a search result page)
	
	if (currentResults.length == 0) {					  
		console.log("no urls");
		return false;
	}
	
    $previewContainer = getPreviewContainer();
	$previewContainer.css('width', previewWidth + 'px');
	
	$preview.addClass('pp_frame');
	var $header = $('<div>').addClass('pp_top pp_clean');
	var $body = $('<div>').addClass('pp_body pp_clean');
	var $footer = $('<div>').addClass('pp_bottom pp_clean');
	
	if(versionType == 'simple')
		previewWidth = 67;
	var barAreaWidth = previewWidth - 45;

    console.log('filling stuff');
	var barContainerList = {};
	for(var i=0; i<currentResults.length; i++) {
		var url = currentResults[i].url;
		
		var $barcontainer = $('<div>').addClass('pp_container');
		var $bar = $('<div>').addClass('pp_bar');
		
		// search for url in history
		var nRetrieved = searchHistory.wasUrlRetrieved(url);
		console.log('minki 1');
		//console.log(nRetrieved);
		if (nRetrieved == 1)
			state = 'new';
		else
			state = 'unclicked';
		
		$bar.addClass('pp_' + state);
		
		var width=10;
		if(versionType == 'complex')
			width = 11 - Math.min(10, nRetrieved);
		var actualWidth = Math.round(barAreaWidth * width / 10);
		
        console.log('minki 2');
		$barcontainer.attr('title', currentResults[i].title); 
		
		//$bar.click(previewClickHandler(url, i+1)); // -. only used for logging,.. moved to logging.js
		$bar.animate({width: actualWidth + 'px'}, 600);
		//$bar.css("width", actualWidth + 'px');
		
		var $a = $('<a>').attr('href', url)
					.attr('target', '_top');
		
		$a.append($bar);
		$barcontainer.append($a);
		
        console.log('minki 3');
		/*****   
		 * check if url should be highlighted with a star -> higlightBar.js plugin		
		****/
		// check browser history
		checkLinkHistory($bar,currentResults[i], state);
        
        console.log('minki 4');
		console.log($(document));
		$(document).trigger('preview_triggers_newBar',[$barcontainer, currentResults[i], $bar]);

console.log('minki 4.1');
		$body.append($barcontainer);
        console.log('minki 4.2');
		barContainerList[url] = $barcontainer;
        
        console.log('minki 5');
	}
	
	var elements = {header: $header, body: $body, footer: $footer};
	$.each(elements, function(k,e) { $preview.append(e); });
	
    console.log('minki 6');
    
	/*** add visual connection to content and content to this one --. does the plugin searcHSnippet now ***/
	$(document).trigger('preview_triggers_previewList',[barContainerList, adapter, elements]);
	
	/*** set height of iframe to appropriate value ***/
	$container.css('height', currentResults.length*24+46+30 + "px"); // TODO: use css value instead of fixed value (height + padding values)
    
    console.log('DONE with that part');
	return true;
}

/********** BOOTSTRAP ***************/
// initial event gets called through the initializion of the history (message from bg.js).. \
// as soon this is done, the checkPage gets called

// with the new google instant search, the results change as users type in the query box the location changes too after the # tag
// so we check that and call checkPage if necessary
window.onhashchange = function () {
	checkPage();
};

