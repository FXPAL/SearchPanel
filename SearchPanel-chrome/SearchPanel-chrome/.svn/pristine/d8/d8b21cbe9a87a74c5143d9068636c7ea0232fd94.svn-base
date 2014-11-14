// 

function SearchSnippet() {
	var self = this;
	var snaps = {}; 
	
	$(document).on('preview_triggers_updatePreview', function(trigger, adapter, currentUrls) {
		//console.log(adapter, currentUrls);
		if(adapter) 
		{
			// chrome screenshot - only captures visible screen and is buggy!!! (often just a blank image)
			/*
			var coords = {};
			
			$.each(adapter.domLinks, function(url,k) {
				coords[url] = {
						x: $(k.container).offset().left, 
						y: $(k.container).offset().top, 
						width: $(k.container).width(), 
						height: $(k.container).height()};
			});
			
			console.log('coords',coords);
			
			chrome.extension.connect().postMessage({
				'command': 'capture_screen',
				'coords': coords
			});
			*/
			
			// html2canvas method...
			$.each(adapter.domLinks, function(url,k) {
				//console.log(url,k);
		
				try {
					html2canvas($(k.container)[0], {
						 //logging: true,
						  onerror: function(error) { 
							  console.log('html2canvas FAILED',error);
						  },
						  onrendered: function(canvas) {
							//console.log('alright',canvas);
						    snaps[url] = canvas;
						    
						    
						    //if(Object.keys(snaps).length == Object.keys(adapter.domLinks).length) // all processed
					    	//{
						    	//console.log('saving snaps',snaps);
								// save snaps 
								searchHistory.saveSnippets(snaps);
					    	//}
						  }
						});
				}
				catch(e) {
					console.log('html2canvas failed',e);
					snaps[url] = false;
				}
			});
			
		}
		else
		{
			// get last search snippets
			snaps = searchHistory.getSnippets();
		}
	
	});
	
	$(document).on('preview_triggers_previewList', function(trigger, barContainerList, adapter) {
		if(adapter) // only on search result page
		{
			// highlight entry in widget when mouseover on search result and other way around
			var lastEFXcontainer=null;
			var lastEFXbar=null;
			var lastTimeoutID=null;
			var offsetTop=-1;
			
			$.each(adapter.domLinks, function(url,k) {
				if(offsetTop == -1)
					offsetTop = $(k.container).offset().top;
				
				// container (search page) to widget
				$(k.container).mouseenter(
					function() {
						if(lastEFXcontainer)
							lastEFXcontainer.stop(false,true);
						if(lastTimeoutID)
							clearTimeout(lastTimeoutID);
						
						lastEFXcontainer = barContainerList[url];
						lastTimeoutID = window.setTimeout(function() {
								lastEFXcontainer.find('.pp_bar').effect('shake', {duration: 1500, distance: 7});
						},200);
						
						//$barcontainer.effect( "highlight" ); 
					}
				);
				
				// widget to containers (search page)
				barContainerList[url].mouseenter(
						function() {
							if(lastEFXbar)
								lastEFXbar.stop(false,true);
							
							$(document).scrollTop($(k.container).offset().top - offsetTop);
							
							lastEFXbar = $(k.container);
							lastEFXbar.effect('highlight', {duration: 2500}); //.dequeue().effect('bounce', {duration: 500}); 
							//$barcontainer.effect( "highlight" ); 
						}
					);

			});
		}
		else
		{
		// if not on search result page (adapter is not defined), then display a snippet when we are over the bar
			$.each(barContainerList, function(url,k) {
				if(snaps[url])
				{
					barContainerList[url].removeAttr('title'); // get rid of tooltip
					barContainerList[url].mouseenter(
							function(e) {
								self.showSnippet(url,getPreviewContainer().position().top+k.offset().top);
							}
						);
					barContainerList[url].mouseleave(
							function(e) {
								self.hideSnippet();
							}
						);
				}
			});
		}
	});
	
	// not used anymore.. used for callbackf unction of chrome screenshots
	this.updateSnaps = function(res) {
		snaps = res;
	};
	
	function getSnippet() {
		$snippetContainer = getSnippetContainer();
	
		if ($snippetContainer.length == 0) {
			//console.log('generate snippet');
			$snippetContainer = $('<div>').addClass(snippetContainerClass)
					.attr('style',"position: fixed !important;\
					right: 75px;\
					z-index: 1010101;\
					display: inline-block;\
					margin: 0px ! important;\
					border: none ! important;\
					overflow: hidden;");
			
			$('body').append($snippetContainer);

			var $contentFrame = $('<iframe>').addClass('pp_iframe')
									.attr('style',"top: 0px;\
										right: 0px;\
										width: 100%;\
										height: 100%;\
										margin: 0px ! important;\
										border: none ! important;\
										overflow: hidden  ! important;\
										background-color: transparent  ! important;\
										padding: 0  ! important;");
			$contentFrame.attr('src', 'about:blank');
			$contentFrame.attr("scrolling", "no");
	
			$snippetContainer.append($contentFrame);
			
			var $link = $('<link>');
			$link.attr('rel', 'stylesheet');
			$link.attr('href', chrome.extension.getURL('bubble.css'));
		    $contentFrame.contents().find('head').append($link);
			
			var $contents = $('<div>');
			$contents.addClass('triangle-border right');
	
			$contentFrame.contents().find('body').addClass('pp_iframe_body');
			$contentFrame.contents().find('body').append($contents);
		}
		return $snippetContainer;
	};
	
	this.hideSnippet = function() {
		var $container = getSnippet();
		$container.hide();
	};
	
	this.showSnippet = function (url,top) {
		//console.log("showSnippet called");
		if(!snaps[url])
		{
			//obj.attr('title', )
			//console.log('no snappet for ',url);
			return;
		}
		
		var $container = getSnippet();
		$container.show();
		var $snippet = $container.find('iframe').contents().find('div');
			
		var width, height;
		if(!snaps[url].saved) {
			obj = snaps[url];
			width = obj.width;
			height = obj.height;
		}
		else
		{
			obj = $('<img>');
			obj.attr('src', snaps[url].img);
			width = snaps[url].width;
			height = snaps[url].height;
		}
		
		$container.css('top', top-40);
	
		$container.css('width',width+85)
				.css('height',height+104);
		
		$container.mouseleave(
				function(e) {
					self.hideSnippet();
				}
			);
	
		//console.log('snap of '+url,obj);
		
		$snippet.empty();
		//$img = $('<img>');
		//$img.attr('src',snaps[url]);
		
		var $a = $('<a>').attr('href', url)
		.attr('target', '_top');
		
		$a.append(obj); //snaps[url]
		
		$a.on("click", function() {
			$(document).trigger("preview_triggers_specialclick", [url, {where: 'snippet'}]);
		});
		
		$snippet.append($a);
		
		$(document).trigger('preview_triggers_showSnippet',
				[ url, $snippet]);
	};
}