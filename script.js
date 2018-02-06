var cachedResponse; //variable to cache response data to avoid multiple calls to the endpoint.
var consolidatedData; // hold the final html markup to append to the template.
$(function(){ // on doc ready
	init();
	$('#score-sort').click(initSort);
	$('#search-box').keydown(initSearch);
});
function init(){
	fetchResponse('http://starlord.hackerearth.com/gamesarena');
}
function fetchResponse(url){
	$.get(url,function(data){
		if(data.length){
			cachedResponse = data;
			appendRateLimit(cachedResponse[0]);
			appendToTemplate(cachedResponse,true);
			populatePlatformSelector(cachedResponse);
			populateGenreSelector(cachedResponse);
		}
	});
}
function appendRateLimit(data){
	var rateLimit;
	data['api_rate_limit']!== undefined ? rateLimit = data['api_rate_limit'] :  rateLimit = 'NA';
	$('#rate-limit').html(rateLimit);
}
function populateRow(datum){
	datum.genre.length > 0 ? datum.genre = datum.genre : datum.genre = 'NA';
	var editorChoiceSymbol='';
	datum.editors_choice === 'Y' ? editorChoiceSymbol = "Editor's Choice" : editorChoiceSymbol = '';
	var rowData = `<tr>
						<td> ${datum.title}&nbsp;<span class="EC">${editorChoiceSymbol}</span></td>
						<td> ${datum.platform} </td>
						<td> ${datum.score} </td>
						<td> ${datum.genre} </td>
					</tr>`;
	return rowData;
}
function appendToTemplate(data,performSort){
	if(data.length){
		if(performSort){data = sortScore(data,true)};
		$.each(data,function(index,datum){
			if(datum.title !== undefined){
				consolidatedData += populateRow(datum);
			}
		});
		$('#game-data').html(consolidatedData);
	}else{
		var noDataMsg = `<tr>
							<td class="text-center" colspan="4">Sorry, No Data Available.</td>
						</tr>`;
		$('#game-data').html(noDataMsg);
	}
}
function filterByPlatform(platform,target){
	$('#platform-list>li.selected').removeClass('selected');
	$('#genre-list>li.selected').removeClass('selected');
	$('#genre-list>li:first-of-type').addClass('selected');
	$(target).addClass('selected');
	if(platform === 'All'){
		appendToTemplate(cachedResponse,true);
		initSort(true);
		return;
	}
	var filteredArr = cachedResponse.filter(function(item){
		return item.platform && item.platform === platform;
	});
	consolidatedData = '';
	appendToTemplate(filteredArr,true);
	initSort(true);
}
function filterByGenre(genre,target){
	$('#genre-list>li.selected').removeClass('selected');
	$('#platform-list>li.selected').removeClass('selected');
	$('#platform-list>li:first-of-type').addClass('selected');
	$(target).addClass('selected');
	if(genre === 'All'){
		appendToTemplate(cachedResponse,true);
		initSort(true);
		return;
	}
	var filteredArr = cachedResponse.filter(function(item){
		return item.genre && item.genre === genre;
	});
	consolidatedData = '';
	appendToTemplate(filteredArr,true);
	initSort(true);
}
function getUniquePlatfroms(data){
	var platformNames = _.pluck(data,'platform');
	var uniqueNames = _.unique(platformNames).filter(function(name){ // get uniques and remove undefined
		return name !== undefined;
	});
	return uniqueNames;
}
function getUniqueGenres(data){
	var genreNames = _.pluck(data,'genre');
	var uniqueNames = _.unique(genreNames).filter(function(name){
		return name !== undefined;
	});
	return uniqueNames;
}
function populatePlatformSelector(data){
	var platformArr = getUniquePlatfroms(data);
	var finalOptTemplate='<li class="platform selected" onclick="filterByPlatform(\'All\',this)">All</li>';
	$.each(platformArr,function(index,item){
		var optTemplate = `<li class="platform" onclick="filterByPlatform('${item}',this)">${item}</li>`;
		finalOptTemplate +=optTemplate;
	})
	$('#platform-list').html(finalOptTemplate);
}
function populateGenreSelector(data){
	var genreArr = getUniqueGenres(data);
	var finalOptTemplate='<li class="genre selected" onclick="filterByGenre(\'All\',this)">All</li>';
	$.each(genreArr,function(index,item){
		var optTemplate = `<li class="genre" onclick="filterByGenre('${item}',this)">${item}</li>`;
		finalOptTemplate +=optTemplate;
	})
	$('#genre-list').html(finalOptTemplate);
}
function sortScore(data,isAsc){
	if(isAsc){
		var sortedData = _.sortBy(data,'score');
		return sortedData;
	}else{
		var sortedData = _.sortBy(data,function(obj){
			return -obj.score;
		});
		return sortedData;
	}
}
function initSort(onlyIcnChng){
	var target = $('#score-sort').children().first();
	var isAsc;
	if(target.hasClass('fa-caret-down')) {
		target.removeClass('fa-caret-down');
		target.addClass('fa-caret-up');
		isAsc = false;
	}else{
		target.removeClass('fa-caret-up');
		target.addClass('fa-caret-down');
		isAsc = true;
	}
	if(onlyIcnChng!==true){
		consolidatedData='';
		appendToTemplate(sortScore(cachedResponse,isAsc));
	}
}
function initSearch(ev){
	if(ev.keyCode === 13){
		var searchTerm = $.trim($(ev.target).val());
		var ResultDataSet = _.filter(cachedResponse,function(item){
			return item.title && item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
		});
		if(searchTerm===''){
			consolidatedData='';
			appendToTemplate(cachedResponse,true);
			return;
		}
		consolidatedData='';
		appendToTemplate(ResultDataSet,true);
	}
}
