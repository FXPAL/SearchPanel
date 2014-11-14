function DisplayFavicons() {
	$(document).on('preview_triggers_newBar', function(trigger,$barcontainer, currentUrl, $bar) {
		var $icon = $('<img>');
		$icon.addClass('pp_icon');
		
		$icon.on("click", function() {
			$(document).trigger("preview_triggers_specialclick", [currentUrl.url, {where: 'favicon'}]);
		});

		var obj = {};
		obj['favicons'] = {};
		obj['favicons'][currentUrl.icon] = null;
		
		var onerr = function(img) {
			//console.log('gone');
			var ne = $('<span>').addClass('pp_icon'); 
			img.replaceWith(ne); /* hide();  /* hide unloadable ones */
		};
		
		// TODO: rewrite! use ajax request to fetch the image, problem is that insecure https:// get cancelled,
		// without calling any event listener.. i think this can be fixed by using AJAX!
		// see: http://robnyman.github.io/html5demos/localstorage/js/base.js
		
		chrome.storage.local.get(obj, function(res) {
			//console.log('result of storage:',res['favicons'][currentUrl.icon]);
			if(res['favicons'][currentUrl.icon]!=null)
			{
				//console.log('loaded from storage',res);
				if(res['favicons'][currentUrl.icon]=="")
					onerr($icon);
				else
					$icon.attr('src',res['favicons'][currentUrl.icon]);
			}
			else
			{
				$icon.load(function() {
					/*html2canvas($(this)[0], {
						 //logging: true,
						  onerror: function(error) { 
							  console.log('html2canvas FAILED',error);
						  },
						  onrendered: function(canvas) {
							 window.open(canvas.toDataURL("image/png"));
							//obj['favicons'][currentUrl.icon] = canvas.toDataURL();
							console.log('icon saved', currentUrl.icon, obj);
							//console.log(obj);
							chrome.storage.local.set(obj);
						  }
						});*/
				});
				
				$icon.error(function() { //$(this).attr('src', chrome.extension.getURL('icons/modern/open-favicon.png'));
					//console.log('ERROR',currentUrl.icon);
    				
	    			//if($(this).attr('triedhttp'))
	   				{
	    				//obj['favicons'][currentUrl.icon] = "";
						//console.log(obj);
						//chrome.storage.local.set(obj);
						onerr($(this));
	   				}
	    		/*	else
	    			{
	    				console.log('https not useable for favicon, trying http instead',currentUrl.icon);
	    				$(this).attr('triedhttp', true);
	    				$(this).attr('src',currentUrl.icon);
	    			}*/
    			});
			
				$icon.attr('src',currentUrl.icon);
			}
		});
		
		$bar.parent().prepend($icon);
	});
}