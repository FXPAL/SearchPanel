function SearchEngineSwitcher() {
	$(document).on('preview_triggers_previewList', function(trigger, barContainerList, adapter, elements) {
		$switcher = $('<div>').addClass('pp_searchSwitcherBox');
		
		var currentAdapter = searchHistory.getCurrentSearchAdapter();
		
		var all = searchAdapters.getAllAdaptersForCategory(
				currentAdapter.getOptions().category
				);
		
		$.each(all, function(k,v) {
			var $a = $('<a>').attr('href', v.getOptions().searchUrl+searchHistory.getCurrentSearchQuery())
				.attr('target', '_top');
			
			var $img = $('<img>').attr('src', v.getOptions().icon)
								.addClass('pp_searchSwitcher')
								.attr('title', v.getOptions().title)
								.attr('style', 'width: 14px; \
								height: 14px; \
								margin-top: 1px; \
								/*background-color: rgb(255,255,255); */ \
								margin-right: 2px; \
								border-radius: 3px;');
			
			if(currentAdapter.getOptions().code == v.getOptions().code)
			{
				$a.attr('href',searchHistory.getCurrentSearchUrl());
				$img.addClass('pp_searchSwitcherSelected');
				
				$(document).trigger('preview_triggers_addedBackButton', $img);
			}
			else
			{
				$(document).trigger('preview_triggers_addedSearchSwitchButton', [$img, v.getOptions().code]);
			}
			$a.append($img);
			
			$switcher.append($a);
		});
	
		elements['header'].append($switcher);
	});
}