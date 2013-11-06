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
    js  : ['http://somedrafts.com/erase_mark/scripts/jquery.ba-replacetext.js','http://somedrafts.com/erase_mark/scripts/jgestures.min.js','http://somedrafts.com/erase_mark/scripts/jquery.hammer.js','http://somedrafts.com/erase_mark/scripts/hammer.js'],    
//	jqpath : 'myCustomjQueryPath.js', <-- option to include your own jquery
    ready : function(){
			var spanCounter = 0;
			var bombCenter;
			var bombCenterHolder;
			var bombSize = 20;
			var bombSizeArray = [20, 30, 40, 50, 10];
			var bombSizeArrayCounter = 0;
			var slateOpacityArray = [0.05, 0.1, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0]
			var slateOpacityArrayCounter = 0;
			var zoomDisabled = false;
			var bombTimer;
			var swipeTimer;
			var swipeTimer2;
			var swipeCheck = false;
			var swipeCheck2 = false;
			var slateOpacity = 0.05;
			var zPressed = false;
			var ctrlPressed = false;
			var burn1 = "no";
			var burn2 = "no";
			var slateMode = "eraser";
			var burnMode = false;
			var menuOpen = false;
			
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
				addMobileSlateListeners();
			};
			
			function addMobileSlateListeners(){
				$('a').click(function(e) {
					e.preventDefault();
				});
				$('img').click(function(e) {
					e.preventDefault();
					$(this).toggleClass("eraser");
				});		
				$("span").hammer({prevent_default: false, drag_vertical: false}).bind("tap hold", function(ev) {
					if (ev.type == "tap"){
						if (burnMode == false){
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
						} else if (burnMode == true){
							if (burn1 == "no" && burn2 == "no"){
								$(this).addClass("burnMarker");
								$(this).removeClass("eraser");
								$(this).removeClass("redactor");
								$(this).css('opacity', 1);
								var burn1Holder = $(this).attr('id');
								var burn1Parser = burn1Holder.substring(4);
								burn1 = parseInt(burn1Parser);		
							} else if (burn1 != "no" && burn2 == "no"){
								$(this).addClass("burnMarker");
								$(this).removeClass("eraser");
								$(this).removeClass("redactor");
								$(this).css('opacity', 1);
								var burn2Holder = $(this).attr('id');
								var burn2Parser = burn2Holder.substring(4);
								burn2 = parseInt(burn2Parser);
							} else if (burn1 != "no" && burn2 != "no"){
								$("#word" + burn1).removeClass("burnMarker");
								$("#word" + burn2).removeClass("burnMarker");
								burn1 = "no";
								burn2 = "no";	
							};							
						};
					} else if (ev.type == "hold"){
						bombCenterHolder = $(this).attr('id');	
						var bombCenterParser = bombCenterHolder.substring(4);
						bombCenter = parseInt(bombCenterParser);
						slateBomb();
					} else if (ev.type == "doubletap"){
					
					};
				});
				$(window).bind("swipeleft swipeleftup swipeleftdown", function(e){
					if (burnMode == true){
						if (burn1 != "no" && burn2 != "no"){
							swipeCheck2 = true;
							slateRandomBurn();
						} else {
						}
					} else if (burnMode == false){	
						if (swipeCheck == false && swipeCheck2 == false){
							swipeTimer = setTimeout(function(){swipeCheck = false},600)
							burnMode = true;
							swipeCheck = true;
							$("body").append("\
								<div id='burnTopFrame'></div>\
								<div id='burnBottomFrame'></div>");
							$("#burnTopFrame").hammer({prevent_default: false, drag_vertical: false}).bind("tap", function(ev) {
								$("#burnTopFrame").remove();
								$("#burnBottomFrame").remove();
								burnMode = false;
							});	
							$("#burnBottomFrame").hammer({prevent_default: false, drag_vertical: false}).bind("tap", function(ev) {
								$("#burnTopFrame").remove();
								$("#burnBottomFrame").remove();
								burnMode = false;
							});								
						} else {
						};
					};	
				});				
				$(window).bind("swiperight swiperightup swiperightdown", function(e){
					if (burnMode == true){
						if (burn1 != "no" && burn2 != "no"){
							swipeCheck2 = true;
							slateBurn();
						} else {
						};
					} else if (burnMode == false && menuOpen == false){	
						if (swipeCheck == false && swipeCheck2 == false){
							swipeCheck = true;
							menuOpen = true;
							swipeTimer = setTimeout(function(){swipeCheck = false},600)
							mobileMenu();
						} else {
						};
					};							
				});
			};
			
			function mobileMenu(){
				$("body").append("\
					<div id='mobileSlateMenu'>\
						<div id='closeMenu'>close this menu</div>\
						<div class='mobileMenuHeading' id='mobileMenuSettings'>settings</div>\
						<div id='modeHolder'><div class='mobileMenuButton' id='modeLabel'>mode: </div><div class='mobileMenuOption' id='modeSwitch'>butt</div></div>\
						<div id='opacityHolder'><div class='mobileMenuButton' id='opacityLabel'>opacity: </div><div class='mobileMenuOption' id='opacitySwitch'>.05</div></div>\
						<div id='bombSizeHolder'><div class='mobileMenuButton' id='bombSizeLabel'>radius: </div><div class='mobileMenuOption' id='bombSizeSwitch'>20</div></div>\
						<div class='mobileMenuHeading' id='mobileMenuActions'>actions</div>\
						<div class='mobileMenuButton2' id='clearSlate'>clear</div>\
						<div class='mobileMenuButton2' id='randomSlate'>random</div>\
						<div class='mobileMenuButton2' id='resetSlate'>reset</div>\
					</div>");
				//set up what the settings are
				$("#modeSwitch").text(slateMode);
				$("#opacitySwitch").text(slateOpacity);
				$("#bombSizeSwitch").text(bombSize);
				//event listeners	
				$("#closeMenu").hammer({prevent_default: false,	drag_vertical: false}).bind("tap", function(ev){
					$("#mobileSlateMenu").remove();
					menuOpen = false;
				});
				$("#modeLabel").hammer({prevent_default: false,	drag_vertical: false}).bind("tap", function(ev){
					slateModeChange();
					$("#modeSwitch").text(slateMode);
				});					
				$("#opacityLabel").hammer({prevent_default: false,	drag_vertical: false}).bind("tap", function(ev){
					if(slateOpacityArrayCounter <= 9){
						slateOpacityArrayCounter = slateOpacityArrayCounter + 1;
						slateOpacity = slateOpacityArray[slateOpacityArrayCounter]
						$('.eraser').css('opacity', slateOpacity);
						$("span").each(function(index, value) {
							//because there are weird glitches going on when you're working with different transparency levels
							if($(this).hasClass('eraser') == true){
								$(this).removeClass('eraser');	
								$(this).addClass('eraser');									
							};
						});								
						$("#opacitySwitch").text(slateOpacity);	
					} else if (slateOpacityArrayCounter >=10){
						slateOpacityArrayCounter = 0
						slateOpacity = slateOpacityArray[slateOpacityArrayCounter]
						$('.eraser').css('opacity', slateOpacity);
						$("span").each(function(index, value) {
							//because there are weird glitches going on when you're working with different transparency levels
							if($(this).hasClass('eraser') == true){
								$(this).removeClass('eraser');	
								$(this).addClass('eraser');									
							};
						});							
						$("#opacitySwitch").text(slateOpacity);							
					};
				});	
				$("#bombSizeLabel").hammer({prevent_default: false,	drag_vertical: false}).bind("tap", function(ev){
					if(bombSizeArrayCounter <= 3){
						bombSizeArrayCounter = bombSizeArrayCounter + 1;
						bombSize = bombSizeArray[bombSizeArrayCounter]
						$("#bombSizeSwitch").text(bombSize);	
					} else if (bombSizeArrayCounter >=4){
						bombSizeArrayCounter = 0
						bombSize = bombSizeArray[bombSizeArrayCounter]
						$("#bombSizeSwitch").text(bombSize);							
					};
				});						
				$("#clearSlate").hammer({prevent_default: false, drag_vertical: false}).bind("tap", function(ev){
					clearSlate();
				});		
				$("#randomSlate").hammer({prevent_default: false, drag_vertical: false}).bind("tap", function(ev){
					randomSlate();
				});	
				$("#resetSlate").hammer({prevent_default: false, drag_vertical: false}).bind("tap", function(ev){
					resetSlate();
				});					
			};

			function spanWrap(str){
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
				$("span").each(function(index, value) {
					$(this).removeClass("burnMarker");
				});				
				burn1 = "no";
				burn2 = "no";
				swipeTimer2 = setTimeout(function(){swipeCheck2 = false},300);
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
				swipeTimer2 = setTimeout(function(){swipeCheck2 = false},300);
			};			
			
			function slateBomb(){
				var bombLower = (bombCenter*1) - (bombSize*1);
				var bombUpper = (bombCenter*1) + (bombSize*1);
				for (var i=bombLower;i<bombUpper; i++){
					if (slateMode == "eraser"){	
						if (i == bombCenter){
						} else {
							$('span[id="word' + i + '"]').addClass("eraser");
							$('span[id="word' + i + '"]').css('opacity', slateOpacity);
						};
					} else if (slateMode == "redactor"){
						if (i == bombCenter){
						} else {
							$('span[id="word' + i + '"]').addClass("redactor");
							$('span[id="word' + i + '"]').css('opacity', 1);
						};	
					};	
				};
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