function resetResults()
{
	$("#results").html("--");
}

function randomize()
{
	$("#results").empty();
	
	$(".filter-group").each(function(gidx,r){
		var row = $(r);
		
		var results = [];
		if(!window.availableFilters[gidx].filters) return true;
		
		row.find(".filter-entry").each(function(idx,entry){
		
			var type = $(this).find("select.type").val();
			var options = window.availableFilters[gidx].filters[idx].options;
			
			if(type == 'none') return true;
			
			var limiter = $.makeArray($(this).find("select.options").val());
			
			if(type == 'limited' || type == 'set')
			{
				options = $.map(options, function(item, idx) {
					return (limiter.indexOf(item.value) != -1) ? item : null;
				});
			}
			var selected = options[Math.floor(Math.random() * options.length)];
			
			var result = {};
			
			result.group = window.availableFilters[gidx].identifier;
			result.identifier = selected.value;
			result.label = $(this).find("label").html();
			result.value = selected.label;
			result.image = "img/"+result.group+"/"+result.identifier+".png";
			
			results.push(result);
		});
		
		var groupResult = {
			identifier: window.availableFilters[gidx].identifier,
			label: window.availableFilters[gidx].label,
			results: results
		}
		
		var template = Handlebars.compile($("#template-group-result").html());
		$(template(groupResult).trim()).hide().appendTo("#results").delay( gidx * 250 ).animate({
			"height": "toggle", "opacity": "toggle" 
			}, 250);
	});
}

$(function(){
	window.groupDefaults = {
		"identifier": "",
		"label": "",
		"filters": []
	};

	window.filterDefaults = {
		"identifier": "",
		"label": "",
		"disallow": [],
		"options": []
	};

	window.selectOptions = [
		{"value":"random","label":"Random"},
		{"value":"limited","label":"Limited (select)"},
		{"value":"set","label": "Set"},
		{"value":"none","label": "None"}
	];

	Handlebars.registerHelper('selectOptions', function(filter) {
		var result = "";
		$.each(window.selectOptions,function(index,opt){
			if(filter.indexOf(opt.value) != -1) return true; //continue
			
			result += "<option value=\""+opt.value+"\">"+opt.label+"</option>";
		});
		
		return new Handlebars.SafeString(result);
	});

	Handlebars.registerHelper('renderFilters', function(filters, group) {
		var output = "";
		
		$.each(filters, function(idx,filter){
			filter = $.extend({},window.filterDefaults,filter);
		
			if((idx%3) == 0) output += '<div class="row-fluid">';
		
			var template = Handlebars.compile($("#template-filter").html());
			output += template($.extend(filter,{"group":group})).trim();
			
			if((idx+1)%3 == 0) output += '</div>';
		});
		
		if(filters.length%3 == 0)
			output += "</div>";
		
		return new Handlebars.SafeString(output);
	});
	
	Handlebars.registerHelper('renderResults', function(results) {
		var output = "";
		
		$.each(results, function(idx, result) {
			if((idx%3) == 0) output += '<div class="row-fluid">';
		
			var template = Handlebars.compile($("#template-result").html());
			output += template(result).trim();
			
			//Begin image check process
			$.ajax({
				url: result.image,
				type:'HEAD',
				error:
					function(){
						
						$("#result-"+result.group+"-"+result.identifier+" img").attr('src','img/no-image.png').fadeIn();
					},
				success:
					function(){
						$("#result-"+result.group+"-"+result.identifier+" img").attr('src',result.image).fadeIn();
					}
			});
			
			if((idx+1)%3 == 0) output += '</div>';
		});
		
		if(results.length%3 == 0)
			output += "</div>";
		
		return new Handlebars.SafeString(output);
	});
	
	$.getJSON("data.json",function(data){
		window.availableFilters = data;
		$.each(data, function(idx,group){
			group = $.extend({},window.groupDefaults,group);
			var template = Handlebars.compile($("#template-group").html());
			$(template(group).trim()).hide().appendTo("#filterArea").delay( idx * 250 ).animate({
				"height": "toggle", "opacity": "toggle" 
				}, 250);;
		});
		$("#btn-randomize").delay(250 * Object.keys(window.availableFilters).length).fadeIn();
	});
	
	$("button").hide();
	
	$("#btn-randomize").on("click",function(e){
		e.preventDefault();
		$($(".filter-group").get().reverse()).each(function(idx) {
			$(this).delay( idx * 250 ).animate({
				"height": "toggle", "opacity": "toggle" 
				}, 250);
		});
		$($(".filter-entry").get().reverse()).each(function(idx) {
			$(this).delay( idx * 250 ).animate({
				"height": "toggle", "opacity": "toggle" 
				}, 250);
		});
		
		$("#btn-randomize").hide("medium");
		$("#btn-again,#btn-refilter,#results").show("medium");
		
		randomize();
	});
	
	$("#btn-again").on("click",function(e){
		randomize();
	});
	
	$("#btn-refilter").on("click",function(e){
		e.preventDefault();
		$(".filter-group").each(function(idx) {
			$(this).delay( idx * 250 ).animate({
				"height": "toggle", "opacity": "toggle" 
				}, 250);
		});
		$(".filter-entry").each(function(idx) {
			$(this).delay( idx * 250 ).animate({
				"height": "toggle", "opacity": "toggle" 
				}, 250);
		});
		
		$("#btn-randomize").show("medium");
		$("#btn-again,#btn-refilter,#results").hide("medium");
		resetResults();
	});
	
	$("body").on("change","select.type",function(e){
		var optList = $(this).parent().find("select.options");
		optList.show();
		switch($(this).val()){
			case "limited":
				optList.prop("multiple",true);
				optList.prop("disabled",false);
				break;
			case "set":
				optList.prop("multiple",false);
				optList.prop("disabled",false);
				break;
			case "none":
				optList.hide();
				break;
			case "random":
			default:
				optList.prop('disabled',true);
				optList.prop('multiple',true);
				break;
		}
	});
	
});