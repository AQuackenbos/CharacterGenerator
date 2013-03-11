//Builds the character area
function buildCharacterList()
{
	var characters = JSON.parse(localStorage.getItem("characters"));
	
	$(".character-floater .character-list").empty();
	
	if(characters == null) //no chars to load
	{
		$(".character-floater .character-count").html("0");
		$("<li>",{class:"message"}).html("You have no characters!").appendTo(".character-floater .character-list");
		return;
	}
	
	$(characters).each(function(idx,character){
		if(character == null) return true; //continue;
		
		var template = Handlebars.compile($("#template-character").html());
		$(template({id:idx,name:character.name}).trim()).appendTo(".character-floater .character-list");
	});
	
	$(".character-floater .character-count").html($(".character-floater .character-list .character").size());
	
	if($(".character-floater .character-list .character").size() == 0) //no chars left in list
	{
		$("<li>",{class:"message"}).html("You have no characters!").appendTo(".character-floater .character-list");
		return;
	}
}

//Loads a character
function loadCharacter(character)
{
	resetResults();
	$("#btn-saveCharacter").prop("disabled",true).addClass("disabled").html("Saved!");

	if($($(".filter-group")[0]).is(":visible"))
	{
		slideAndFade($(".filter-group").get().reverse());
		slideAndFade($(".filter-entry").get().reverse());
	}
		
	$("#btn-randomize").hide("medium");
	$("#btn-again,#btn-refilter,#btn-saveCharacter,#results").show("medium");
	$(character.groups).each(function(gidx,group){
		var template = Handlebars.compile($("#template-group-result").html());
		$(template(group).trim()).hide().appendTo("#results").delay( gidx * 250 ).animate({
			"height": "toggle", "opacity": "toggle" 
			}, 250);
	});
	
	
	$("<h4>",{class:"characterName"}).html(character.name).prependTo("#results");
}

//Clears the results area
function resetResults()
{
	$("#results").empty();
	$("#btn-saveCharacter").prop("disabled",false).removeClass("disabled").html("Save Character");
}

//Generate the character
function randomize()
{
	resetResults();
	
	window.currentCharacter = {}
	window.currentCharacter.groups = [];
	
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
		
		//Save group
		window.currentCharacter.groups.push(groupResult);
		
		var template = Handlebars.compile($("#template-group-result").html());
		$(template(groupResult).trim()).hide().appendTo("#results").delay( gidx * 250 ).animate({
			"height": "toggle", "opacity": "toggle" 
			}, 250);
	});
}

function slideAndFade(selector)
{
	$(selector).each(function(idx) {
		$(this).delay( idx * 150 ).animate({
			"height": "toggle", "opacity": "toggle" 
			}, 250);
	});
}

$(function(){
	/*****
		Setup
	*****/

	//Setup defaults

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

	//Register handlebar helpers
	
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

	/*****
		Data Loading
	*****/
	
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
	
	buildCharacterList();
	
	//Hide buttons
	$("#btn-again,#btn-refilter,#btn-saveCharacter").hide();
	
	/*****
		Listeners
	*****/
	
	//Generate listener
	$("#btn-randomize").on("click",function(e){
		e.preventDefault();
		slideAndFade($(".filter-group").get().reverse());
		slideAndFade($(".filter-entry").get().reverse());
		
		$("#btn-randomize").hide("medium");
		$("#btn-again,#btn-refilter,#btn-saveCharacter,#results").show("medium");
		
		randomize();
	});
	
	//Go again listener
	$("#btn-again").on("click",function(e){
		randomize();
	});
	
	//Change filters listener
	$("#btn-refilter").on("click",function(e){
		e.preventDefault();
		slideAndFade($(".filter-group"));
		slideAndFade($(".filter-entry"))
		
		$("#btn-randomize").show("medium");
		$("#btn-again,#btn-refilter,#btn-saveCharacter,#results").hide("medium");
		resetResults();
	});
	
	$("body")
		//Change fields on type change
		.on("change","select.type",function(e){
			var optList = $(this).parent().find("select.options");
			optList.fadeTo(200,1.0);
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
					optList.fadeTo(200,0.001);
					break;
				case "random":
				default:
					optList.prop('disabled',true);
					optList.prop('multiple',true);
					break;
			}
		})
		//Toggle areas on h3 click
		.on("click",".filter-group > h3", function(e){
			e.preventDefault();
			var order = $(this).parent().find('.filter-entry');
			if($(order[0]).is(":visible")) order = order.get().reverse();
			slideAndFade(order);
		})
		//Handle Save Modal
		.on("click","#saveModal .save",function(e){
			var characterName = $(this).closest(".modal").find(".character-name").val();
			
			if(characterName.trim() == "")
			{
				$(this).closest(".modal").find(".modal-messages").addClass("alert").html("You must enter a name to save.");
				return;
			}
			
			window.currentCharacter.name = characterName.trim();
			
			var charList = JSON.parse(localStorage.getItem("characters"));
			
			//create if null
			if(charList == null) charList = [];
			
			charList.push(window.currentCharacter);
			
			localStorage.setItem("characters",JSON.stringify(charList));
			
			buildCharacterList();
			
			$("#saveModal").modal('hide');
			
			$("<h4>",{class:"characterName"}).html(characterName.trim()).prependTo("#results");
			
			$(this).prop('disabled',true).html("Saved!");
			$("#btn-saveCharacter").prop('disabled',true).addClass("disabled").html("Saved!");
		})
		//Handle Load Modal
		.on("click","#loadModal .confirm",function(e){
			var characters = JSON.parse(localStorage.getItem("characters"));
			
			loadCharacter(characters[window.currentTargetId]);
			
			$("#loadModal").modal('hide');
		})
		//Handle Delete Modal
		.on("click","#deleteModal .confirm",function(e){
			var characters = JSON.parse(localStorage.getItem("characters"));
		
			delete characters[window.currentTargetId];
			
			localStorage.setItem("characters",JSON.stringify(characters));
			
			buildCharacterList();
		
			$("#deleteModal").modal('hide');
		});
	
	$(".character-floater")
		.on("click",".name,.delete",function(e){
			window.currentTargetId = $(this).closest(".character").find(".character-id").val();
			
		})
		//Open/close
		.on("click",function(e){
			e.preventDefault();
			$(this).toggleClass("open");
			$(this).find(".character-floater-content").animate({"height":"toggle"});
		});
	
});