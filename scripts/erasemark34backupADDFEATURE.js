/*
 * jQuery Bookmarklet - version 1.0
 * Originally written by: Brett Barros
 * Heavily modified by: Paul Irish
 *
 * If you use this script, please link back to the source
 *
 * Copyright (c) 2010 Latent Motion (http://latentmotion.com/how-to-create-a-jquery-bookmarklet/)
 * Released under the Creative Commons Attribution 3.0 Unported License,
 * as defined here: http://creativecommons.org/licenses/by/3.0/
 *
 */
 
window.bookmarklet = function(opts){fullFunc(opts)};
 
// These are the styles, scripts and callbacks we include in our bookmarklet:
window.bookmarklet({
 
    css : ['http://somedrafts.com/erase_mark/scripts/erase_mark.css'],
    js  : ['http://somedrafts.com/erase_mark/scripts/jquery.ba-replacetext.js'],    
//	jqpath : 'myCustomjQueryPath.js', <-- option to include your own jquery
    ready : function(){
			var spanCounter = 0;
			var spanCounterCache = 0;
			var bombCenter;
			var bombSize = 30;
			var slateOpacity = 0.05;
			var zPressed = false;
			var ctrlPressed = false;
			var burn1 = "no";
			var burn2 = "no";
			var slateMode = "eraser";
			var outputString;
			addLoadingVeil();
				
			function addLoadingVeil(){
				$("body").append("\
				<div id='loadingVeil'></div>");
				$("#loadingVeil").fadeIn(750, function() { buildSlate() });
			};
			
			function buildSlate(){
				var regex = new RegExp("\\S+\\s*", "g");
				$("body *").replaceText(regex, spanWrap);
				$("#loadingVeil").remove();
				addDesktopSlateListeners();
			};
			
			function addDesktopSlateListeners(){
				$('span').click(function(){
					if (zPressed == false && ctrlPressed == false){
						if (slateMode == "eraser"){
							if($(this).hasClass('eraser') == true){
								$(this).removeClass('eraser');	
								$(this).css('opacity', 1);		
							} else {
								$(this).addClass('eraser');
								$(this).css('opacity', slateOpacity);	
							}
						} else if (slateMode == "redactor"){
							$(this).toggleClass("redactor");
						};		
					} else if (zPressed == true && ctrlPressed == false){
						if (burn1 == "no" && burn2 == "no"){
							$(this).addClass("burnMarker");
							var burn1Holder = $(this).attr('id');
							var burn1Parser = burn1Holder.substring(4);
							burn1 = parseInt(burn1Parser);		
						} else if (burn1 != "no" && burn2 == "no"){
							$(this).addClass("burnMarker");
							var burn2Holder = $(this).attr('id');
							var burn2Parser = burn2Holder.substring(4);
							burn2 = parseInt(burn2Parser);
						} else if (burn1 != "no" && burn2 != "no"){
							$("#word" + burn1).removeClass("burnMarker");
							$("#word" + burn2).removeClass("burnMarker");
							burn1 = "no";
							burn2 = "no";	
						};
					} else if (ctrlPressed == true && zPressed == false){
						var bombCenterHolder = $(this).attr('id');
						var bombCenterParser = bombCenterHolder.substring(4);
						bombCenter = parseInt(bombCenterParser);
						slateBomb();
					} else if (ctrlPressed == true && zPressed == true){
					};
				});
				$('a').click(function(e) {
					e.preventDefault();
				});
				$('img').click(function(e) {
					e.preventDefault();
					$(this).toggleClass("eraser");
				});
				$(window).keydown(function(evt) {
				  if (evt.which == 49) { 
					bombSize = 10;
				  };
				  if (evt.which == 50) { 
					bombSize = 20;
				  };		
				  if (evt.which == 51) { 
					bombSize = 30;
				  };
				  if (evt.which == 52) { 
					bombSize = 40;
				  };	
				  if (evt.which == 53) { 
					bombSize = 50;
				  };	
				  if (evt.which == 55) { 
					clearSlate();
				  };	
				  if (evt.which == 56) { 
					randomSlate();
				  };	
				  if (evt.which == 57) { 
					resetSlate();
				  };					  
				  if (evt.which == 13) { 
					slateModeChange();
				  };	
				  if (evt.which == 16) { 
					ctrlPressed = true;
				  };
				  if (evt.which == 192) { 
					//key index
				  };	
				  if (evt.which == 219) { 
					if (slateMode=="eraser"){
						if (slateOpacity >= 0.0){
							slateOpacity = slateOpacity - .025;
							$('.eraser').css('opacity', slateOpacity);
							$("span").each(function(index, value) {
								//because there are weird glitches going on when you're working with different transparency levels
								if($(this).hasClass('eraser') == true){
									$(this).removeClass('eraser');	
									$(this).addClass('eraser');									
								};
							});							
						};
					}; 
				  };	
				  if (evt.which == 221) { 
					if (slateMode=="eraser"){
						if (slateOpacity <= .8){
							slateOpacity = slateOpacity + .025;
							$('.eraser').css('opacity', slateOpacity);
							$("span").each(function(index, value) {
								//because there are weird glitches going on when you're working with different transparency levels
								if($(this).hasClass('eraser') == true){
									$(this).removeClass('eraser');	
									$(this).addClass('eraser');									
								};
							});								
						};
					}; 
				  };						  
				  if (evt.which == 90) { 
					zPressed = true;
				  };
				  if (evt.which == 88) { 
					slateRandomBurn();
				  };
				  if (evt.which == 67) { 
					slateBurn();
				  };	
				  if (evt.which == 83) { 
					//make text selectable
					$('*').css("-webkit-user-select", "auto");
					alert("made text selectable?!");
				  };				  
				}).keyup(function(evt) {
				  if (evt.which == 90) { 
					zPressed = false;
				  };
				  if (evt.which == 17) { 
					ctrlPressed = false;
				  };				  
				});
			};
			
			function spanWrap( str ){
				spanCounter = spanCounter + 1;
				return "<span id='word" + spanCounter + "'>" + str + "<\/span>";
				alert(spanCounter);
			};
			
			function slateModeChange(){
				var previousSlateMode = slateMode;
				if (previousSlateMode == "eraser"){
					$("span").each(function(index, value) {
						//use hasClass to check if it has the eraser class and switch it to redactor
						if($(this).hasClass('eraser') == true){
							$(this).css('opacity', 1);
							$(this).addClass('redactor');
							$(this).removeClass('eraser');					
						};
					});
					slateMode = 'redactor';
				} else if (previousSlateMode == "redactor"){
				    $("span").each(function(index, value) {
						//use hasClass to check if it has the eraser class and switch it to redactor
						if($(this).hasClass('redactor') == true){
							$(this).css('opacity', slateOpacity);
							$(this).removeClass('redactor');								
							$(this).addClass('eraser');
						};
					});
					slateMode = 'eraser';	
				};
			};			
			
			function clearSlate(){
				$("span").each(function(index, value) {
					if (slateMode == "eraser"){
						$(this).addClass("eraser");
						$(this).css('opacity', slateOpacity);
					} else if (slateMode == "redactor"){
						$(this).addClass("redactor");
						$(this).css('opacity', 1);
					};					
				});
				$("img").each(function(index, value) { 
					$(this).addClass("eraser"); 
				});
			};
			
			function randomSlate(){
				$("span").each(function(index, value) { 
					var soRandom = Math.random();
					if (soRandom > 0.5){
						if (slateMode == "eraser"){
							$(this).addClass("eraser");
							$(this).css('opacity', slateOpacity);
						} else if (slateMode == "redactor"){
							$(this).addClass("redactor");
							$(this).css('opacity', 1);
						};						
					} else {
					};		
				});
			};
			
			function resetSlate(){
				$("span").each(function(index, value) { 
					$(this).removeClass("eraser"); 
					$(this).removeClass("redactor"); 
					$(this).css('opacity', 1);
				});
				$("img").each(function(index, value) { 
					$(this).removeClass("eraser"); 
				});
			};

			function slateBurn(){
				if (burn1 < burn2){
					var burnLower = burn1;
					var burnUpper = burn2;
				} else if (burn1 > burn2){
					burnLower = burn2;
					burnUpper = burn1;
				};
				for (var i=burnLower;i<=burnUpper; i++){
					if (slateMode == "eraser"){	
						$('span[id="word' + i + '"]').addClass("eraser");
						$('span[id="word' + i + '"]').css('opacity', slateOpacity);
					} else if (slateMode == "redactor"){
						$('span[id="word' + i + '"]').addClass("redactor");
						$('span[id="word' + i + '"]').css('opacity', 1);
					};	
				};
				// there was a more efficient way to do this before, but certain types of tags throw this off for some reason and mean that the marker class doesn't get removed, so i'm doing it this way now to make sure it does get removed
				$("span").each(function(index, value) {
					$(this).removeClass("burnMarker");
				});				
				burn1 = "no";
				burn2 = "no";
			};
			
			//yes it would be not that hard to just feed an input to the previous function and have it do this if so but whatev i am tired
			function slateRandomBurn(){
				if (burn1 < burn2){
					var burnLower = burn1;
					var burnUpper = burn2;
				} else if (burn1 > burn2){
					burnLower = burn2;
					burnUpper = burn1;
				};
				for (var i=burnLower;i<=burnUpper; i++){
					if (slateMode == "eraser"){	
						var soRandom = Math.random();
						if (soRandom > 0.7){
							$('span[id="word' + i + '"]').addClass("eraser");
							$('span[id="word' + i + '"]').css('opacity', slateOpacity);
						} else {
						};
					} else if (slateMode == "redactor"){
						var soRandom2 = Math.random();
						if (soRandom2 > 0.7){					
							$('span[id="word' + i + '"]').addClass("redactor");
							$('span[id="word' + i + '"]').css('opacity', 1);
						} else {
						};
					};	
				};
				// there was a more efficient way to do this before, but certain types of tags throw this off for some reason and mean that the marker class doesn't get removed, so i'm doing it this way now
				$("span").each(function(index, value) {
					$(this).removeClass("burnMarker");
				});				
				burn1 = "no";
				burn2 = "no";			
			};			
			
			function slateBomb(){
				var bombLower = (bombCenter*1) - (bombSize*1);
				var bombUpper = (bombCenter*1) + (bombSize*1);
				for (var i=bombLower;i<bombUpper; i++){
					if (slateMode == "eraser"){	
						$('span[id="word' + i + '"]').addClass("eraser");
						$('span[id="word' + i + '"]').css('opacity', slateOpacity);
					} else if (slateMode == "redactor"){
						$('span[id="word' + i + '"]').addClass("redactor");
						$('span[id="word' + i + '"]').css('opacity', 1);
					};	
				};
				$('span[id="word' + bombCenter + '"]').removeClass("eraser");
				$('span[id="word' + bombCenter + '"]').removeClass("redactor");
			};

 
   	    }
 })
 
function fullFunc(opts){
 
    // User doesn't have to set jquery, we have a default.
    opts.jqpath = opts.jqpath || "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js";
 
    function getJS(jsfiles){
 
	// Check if we've processed all of the JS files (or if there are none)
	if (jsfiles.length === 0) {
		opts.ready();
		return false;
	}
 
        // Load the first js file in the array
        $.getScript(jsfiles[0],  function(){ 
 
            // When it's done loading, remove it from the queue and call the function again    
            getJS(jsfiles.slice(1));
 
        })
 
    }
 
    // Synchronous loop for css files
    function getCSS(csfiles){
        $.each(csfiles, function(i, val){
            $('<link>').attr({
                    href: val,
                    rel: 'stylesheet'
                }).appendTo('head');
        });
    }
 
	function getjQuery(filename) {
 
		// Create jQuery script element
		var fileref = document.createElement('script')
		fileref.type = 'text/javascript';
		fileref.src =  filename;
 
		// Once loaded, trigger other scripts and styles
		fileref.onload = function(){
 
			getCSS(opts.css); // load CSS files
			getJS(opts.js); // load JS files
 
		};
 
		document.body.appendChild(fileref);
	}
 
	getjQuery(opts.jqpath); // kick it off
 
}; // end of bookmarklet();