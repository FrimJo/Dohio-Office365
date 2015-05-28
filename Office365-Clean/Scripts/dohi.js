var distToFirst = 99999;
var minuteSteps = 5;
var firstFree, lastFree;
var minHeightBooking = 30;
var dayStartsAt = timeToMinutes("07:00");
var distArray = [];
var timeArray = [];
var placeNewMeetingAt = null;

document.documentElement.className = "free";

/*
	Kör följande var 10:e sekund.
*/
window.setInterval(function(){
	intervalFunctions();
}, 10000);

$(function(){
	//addUsers();

	// Kör intervallfunktionerna en gång vid sidladdning
    intervalFunctions();

    $(document).on("click", "form.users input", function () {
        $(".selectedUser").removeClass("selectedUser");
        $("form.users input:checked").siblings("label").addClass("selectedUser");
    });

    $(".filter input").keyup(function () {
        filterByInitials();
    });
	
	$("ul#background").click(function (e) {
		placeNewMeetingAt = e.pageY;
		$("#book button").trigger("click");
	});
	
	$("#book button").click(function () {

		getUsers();
	
		// Returnera false om trigger görs via ul#background (knappen är då dold)
		if( $(this).is(":hidden") ) return false;
		
		/*
			Om man har klickat i kalendern istället för på knappen
			så ska mötet placeras där man klickade. Annars vid aktuell tid.
		*/
		if (placeNewMeetingAt != null) {
			$(".cal-book").css("top", roundXToNearestY(placeNewMeetingAt, 5));
		} else {
			posYByTime($(".cal-book"));
		}
		
		$(".userSelected").addClass("disabled");
		$(".cover1, #selectUser").fadeIn(50, function(){
			$("#book button").hide();
		});
		
	});
		
	$(document).on("click", "form.users input", function () {
		$(".userSelected").removeClass("disabled");
		
	});
	
	$(".userListItem").click(function () {
		alert("alert");
		$(".userSelected").removeClass("disabled");		
	});
	
	$(".userSelected").click(function(){
		
		$("#book button").hide();
		
		$("#selectUser").fadeOut(50, function(){
			
			$("#coverRight").fadeOut();
			$(".cal-book").fadeIn(50, function(){
				checkIfFree();
			});
			
			applyTimeToBlock($(".cal-book"));
			
			$("#dragInstructions").css({
				left: $("#left").width()-$("#dragInstructions").outerWidth()-20+'px',
				top: $(".cal-book").offset().top - ( ($("#dragInstructions").outerHeight() - $(".cal-book").outerHeight() )/2)
			}).fadeIn(50);
			
		});
		
	});
	
	$(".cancel, #coverLeft, #coverRight").click(function () {
		placeNewMeetingAt = null;
		$(".coverElement, #selectUser, .cal-book").fadeOut(50);
		$("#book button").show();
	});
	
	/*
		Vid klick på bekräftaknapp (mötet skapas i kalendern)
	*/


	$("#confirm").click(function () {
		
		if($(this).hasClass("disabled")) {
			alert("Vald tid är upptagen");
			return false;
		}
		
		$("#book button").show();
		
		var start = $(".cal-book .start").text();
		var end = $(".cal-book .end").text();
		var name = $('input:radio[name=user]:checked').siblings("label").text();
		var mail = $('input:radio[name=user]:checked').attr("value");

		postToOffice365(start, end, name, mail);
				
		$(".coverElement, #selectUser, .cal-book").fadeOut(50);
		
		
		
	});	
	
	$('body').on("click", ".regret button", function () {
		
		var eventId = $(this).closest(".cal-booked").attr("eventId");
		
		$(this).closest(".cal-booked").fadeOut(200);
		deleteFromOffice365(eventId);
	});
	
	$(".cal-booked").each(function(){
		resizeAndPosBlock($(this));
		applyTimeToBlock($(this));
	});
		
	$(".cal-book").draggable({
		axis: 'y',
		containment: 'parent',
		grid: [0, minuteSteps],
		drag: function( event, ui ) {
			applyTimeToBlock($(this));
			positionInstructions();
			checkIfFree();
		},
		stop: function( event, ui ) {
			checkIfFree();
		}		
	}).resizable({
		minWidth: '100%',
		maxWidth: '100%',
		minHeight: minHeightBooking,
		grid: [0, minuteSteps],
		containment: 'parent',
		resize: function(event, ui){
		 	$(this).attr("start", $(this).offset().top);
			$(this).attr("end", $(this).offset().top + $(this).height());
			positionInstructions();
			applyTimeToBlock($(this));
			checkIfFree('resize');
		},
		stop: function( event, ui ) {
			checkIfFree('resize');
			applyTimeToBlock($(this));
		},
		handles: {
			's': '.handle'
		}
	});
	
	posYByTime($(".cal-book"));
	
});

$(window).resize(function(){
	positionElements();
	resizeClock();
});

$(window).load(function(){
	
	var i=0;
	
	$(".cal-booked").each(function() {
		
		if ($(this).offset().top < distToFirst) {
			distToFirst = $(this).offset().top;
		}
		
		/*
			Spara ner data i avståndsarray
			distArray[i][0] ger avstånd från div nr i upp till föregående div
		*/
		if ( $( this ).is( ":first-child" ) ) {
			
			/*
				Första mötet	
			*/
			
			distArray[i][0] = $(this).offset().top;	// Avstånd från div till div ovanför
			distArray[i][1] = $(this).height();		// Höjd på div
			distArray[i][2] = $(this).offset().top;	// Avstånd från div till topp
			firstFree = distArray[i][2];
			
		} else if ( $( this ).is( ":last-child" ) ) {
		
			/*
				Sista mötet
			*/
			
			distArray[i][0] = $(this).offset().top - distArray[i-1][1] - distArray[i-1][2]; // Avstånd från div till div ovanför
			distArray[i][1] = $(this).height(); 											// Höjd på div
			distArray[i][2] = $(this).offset().top;											// Avstånd från div till topp
			lastFree = $("#cal-day").height() - $(this).offset().top - $(this).height();
			
		} else {
		
			/*
				Övriga möten
			*/
		
			distArray[i][0] = $(this).offset().top - distArray[i-1][1] - distArray[i-1][2]; // Avstånd från div upp till föregående
			distArray[i][1] = $(this).height(); // Höjd på div
			distArray[i][2] = $(this).offset().top;	// Avstånd från div till topp
			
		}
		
		i++;
		
	});
	
	positionElements();
	updateStatus();
	stretchOverlay();
	
});


