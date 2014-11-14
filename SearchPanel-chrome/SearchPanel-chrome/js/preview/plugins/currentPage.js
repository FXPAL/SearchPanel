function CurrentPage() {
	$(document).on('preview_triggers_previewList', function(trigger,barContainerList, adapter, elements) { 
		var added = markPage(barContainerList, document.location.href);
		//console.log(added);
		if(!added && !adapter)
		{
			// highlight last page
			url = searchHistory.getLastSelectedPagae();
			markPage(barContainerList, url);
		}
		else if(added)
		{
			searchHistory.setNewLastSelectedPagae(document.location.href);
		}
		
		$.each(barContainerList, function(url, $barcontainer) {
			$barcontainer.click(function() {
				searchHistory.setNewLastSelectedPagae(url);
			});
		});
	});
	
	var markPage = function(barContainerList, loadedUrl) {
		// set up a fake 'a' tag to parse the domain name and other stuff  out of an url to compare it
		var urlfetcher1 = document.createElement('a');
		var urlfetcher2 = document.createElement('a');
		
		urlfetcher1.href = loadedUrl;
		
		//console.log(barContainerList);
		//console.log(elements);
		
		var added=false;
		//console.log(urlfetcher2.pathname, urlfetcher1.pathname);
		$.each(barContainerList, function(url, $barcontainer) { 
			urlfetcher2.href = url;
			if(urlfetcher1.host == urlfetcher2.host && urlfetcher1.pathname == urlfetcher2.pathname && urlfetcher1.search == urlfetcher2.search) {
				$barcontainer.append($('<div>').addClass('pp_selected'));
				added=true;
				
				return false;
			}
		});
		
		return added;
	};
}