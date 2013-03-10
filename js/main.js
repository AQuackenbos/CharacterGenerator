function resetResults()
{
	$("#results").html("--");
}

function randomize()
{
	$("#results").empty();
	
	$(".filter-entry").each(function(idx,r){
		var row = $(r);
		var identifier = row.find("input[id*='identifier-']").val();
		var type = row.find("select[id*='type-']").val();
		var options = window.availableFilters[identifier].options;
		var value = "";
		
		if(type == 'none') return true;
		
		var limiter = $.makeArray(row.find("select[id*='options-']").val());
		
		if(type == 'limited' || type == 'set')
		{
			options = $.map(options, function(item, idx) {
				return (limiter.indexOf(item.value) != -1) ? item : null;
			});
		}
		
		value = options[Math.floor(Math.random() * options.length)].label;
		
		var result = {};
		
		result.label = row.find("label").html();
		result.value = value;
		
		var template = Handlebars.compile($("#template-result").html());
		$(template(result).trim()).hide().appendTo("#results").delay( idx * 250 ).animate({
			"height": "toggle", "opacity": "toggle" 
			}, 250);;
	});
}

$(function(){
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

	$.getJSON("data.json",function(data){
		window.availableFilters = data;
		$.each(data, function(idx,filter){
			var template = Handlebars.compile($("#template-filter").html());
			$(template(filter).trim()).hide().appendTo("#filterArea").delay( idx * 250 ).animate({
				"height": "toggle", "opacity": "toggle" 
				}, 250);;
		});
		$("#btn-randomize").delay(250 * Object.keys(window.availableFilters).length).fadeIn();
	});
	
	$("button").hide();
	
	$("#btn-randomize").on("click",function(e){
		e.preventDefault();
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
		$(".filter-entry").each(function(idx) {
			$(this).delay( idx * 250 ).animate({
				"height": "toggle", "opacity": "toggle" 
				}, 250);
		});
		
		$("#btn-randomize").show("medium");
		$("#btn-again,#btn-refilter,#results").hide("medium");
		resetResults();
	});
	
	$("body").on("change","select[id*='type-']",function(e){
		var optList = $(this).parent().find("select[id*='options-']");
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