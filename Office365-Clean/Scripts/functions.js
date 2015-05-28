/*
	TODO
		• När en bokning ångras, måste den även tas bort från timeArray
		• Om klockan är efter sista mötet blir det "ledigt FALSE minuter till"
*/



/*
	Funktion för att kontrollera om boknings-rutan 
	befinner sig på en ledig plats i kalendern
*/
checkIfFree = function(type) {
	
	enableBookingAbility();
	
	$(".cal-booked").each(function(){			
		if( overlaps( $(".cal-book"), $(this) )){
			disableBookingAbility();
		}
	});

}

/*
	Funktion för att omöjliggöra bokning
*/
disableBookingAbility = function(){
	$(".cal-book, button#confirm").addClass("disabled");
	$(".busyTime").show();
	$(".cal-book .bookedTime").hide();
}

/*
	Funktion för att möjliggöra bokning
*/
enableBookingAbility = function(){
	$(".cal-book, button#confirm").removeClass("disabled");
	$(".busyTime").hide();
	$(".cal-book .bookedTime").show();
}


/*
	Funktion som kontrollerar om en div överlappar en annan div någonting
*/
var overlaps = (function () {
    
    function getPositions( elem ) {
        var pos, width, height;
        pos = $( elem ).position();
        width = $( elem ).width();
        height = $( elem ).height();
        return [ [ pos.left, pos.left + width ], [ pos.top, pos.top + height ] ];
    }

    function comparePositions( p1, p2 ) {
        var r1, r2;
        r1 = p1[0] < p2[0] ? p1 : p2;
        r2 = p1[0] < p2[0] ? p2 : p1;
        return r1[1] > r2[0] || r1[0] === r2[0];
    }

    return function ( a, b ) {
        var pos1 = getPositions( a ),
            pos2 = getPositions( b );
        return comparePositions( pos1[0], pos2[0] ) && comparePositions( pos1[1], pos2[1] );
    };
    
})();

/*
	Funktion för att kontrollera om en div täcker en annan div till 100%
*/
function overlapsCompletely(div1, div2) {
	
	if( div1.position().top < div2.position().top ) {
		tempDiv = div1;
		div1 = div2;
		div2 = tempDiv;
	}
	
	if ( (div2.position().top < div1.position().top) && ((div2.position().top + div2.height()) > (div1.position().top + div1.height()) ) ) {
		return true;
	}
	
	return false;
	
}

resizeAndPosBlock = function(block) {
	block.css({
		height: timeToMinutes(block.attr("end"))-timeToMinutes(block.attr("start"))+'px',
		top: timeToMinutes(block.attr("start"))-dayStartsAt+'px'
	});
}

applyTimeToBlock = function(block) {

	var hoursStart = Math.floor(( (7*60) + parseInt(block.position().top )) / 60);
	var minutesStart = ((7*60) + parseInt(block.position().top)) % 60;
	
	var hoursEnd = Math.floor( ( (7*60) + parseInt((block.position().top+block.height()))) / 60);          
	var minutesEnd = ((7*60) + parseInt((block.position().top+block.height()))) % 60;
	
	block.find(".start").text(
		("0" + hoursStart).slice(-2) + ":" + ("0" + minutesStart).slice(-2)
	);
	block.find(".end").text(
		("0" + hoursEnd).slice(-2) + ":" + ("0" + minutesEnd).slice(-2)
	);
	
	/*
		Beräkna och skriv ut längden på önskad tid att boka
	*/
	
	if(block.is(".cal-book")) {
		
		/*
			Använder 1 jan 1337, spelar ingen roll då det 
			bara är tiden som beräknas.
		*/
		
		var start = new Date(1337, 0, 1, hoursStart, minutesStart);
		var end = new Date(1337, 0, 1, hoursEnd, minutesEnd);
		
		var bookingLengthMs = end - start;
		var bookingLengthMin = bookingLengthMs / (1000*60);
		
		var hoursLength = Math.floor(( parseInt( bookingLengthMin )) / 60);
		var minutesLength = ( parseInt( bookingLengthMin )) % 60;
		
		if(hoursLength>0){
			$(".bookedLength .hours").text(hoursLength + " h ");
		} else {
			$(".bookedLength .hours").text("");
		}
		
		if(minutesLength>0){
			$(".bookedLength .minutes").text(minutesLength + " min");
		} else {
			$(".bookedLength .minutes").text("");
		}
		
	}
}

function timeToMinutes(str) {
    var p = str.split(':'),
        s = 0, m = 1;
    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }
    return s;
}

function stretchOverlay() {
	var d = new Date();
	var hours = d.getHours();
	var minutes = d.getMinutes();
	$("#overlay").css({
		height: timeToMinutes(hours+':'+minutes)-dayStartsAt+'px'
	});
	
	$(".timeMarker").each(function(){
		if( overlaps($(this), $("#overlay")) ) {
			$(this).css("color", "rgba(0,0,0,.3)");
		}
	});
	
	$(".cal-booked").each(function(){
		if( overlapsCompletely($(this), $("#overlay")) ) {
			//$(this).css("opacity", ".4");
		}
	});
	
}

function posYByTime(b) {
	
	var d = new Date();
	var hours = d.getHours();
	var minutes = d.getMinutes();
	var firstHour = parseInt($("ul#background li:first-child .hours").text());
	var lastHour = parseInt($("ul#background li:last-child .hours").text());
	minutes = minuteSteps * Math.round(minutes/minuteSteps); // Avrunda till närmsta minuteSteps
	var currentTimeOffset = 0;
	
	/*
		Om klockan är utanför tiderna som kalendern visas
		så döljs pilen som visar aktuell tid
	*/
	if ( b.is($("#currentTimeMarker")) ) {
		
		currentTimeOffset = ($("#currentTimeMarker").height()-1)/2;
		
		if ( hours < firstHour || hours > lastHour ) {
			b.hide();
		}
		
	} 
	
	/*
		Positionera bokningsfält i höjd med aktuell tid,
		om klockan är inom kalenderns tider. Annars placera
		vid toppen.
	*/
	
	if ( hours < firstHour || hours > lastHour ) {	
		b.css({
			top:timeToMinutes(firstHour+':00')-dayStartsAt+'px'
		});
	} else {
		b.css({
			top:timeToMinutes(hours+':'+minutes)-dayStartsAt-currentTimeOffset+'px'
		});
	}

}

/*
	Flytta instruktionsrutan i höjd med bokningsrutan
*/

function positionInstructions() {
	
	var bookYTop = $(".cal-book").offset().top;
	var bookYCenter = $(".cal-book").offset().top + $(".cal-book").outerHeight() * .5;
	var bookYHeight = $(".cal-book").outerHeight();
	
	var dragYCenter = $("#dragInstructions").offset().top + $("#dragInstructions").outerHeight() * .5;
	var dragYBottom = $("#dragInstructions").offset().top + $("#dragInstructions").outerHeight();
	var dragYHeight = $("#dragInstructions").outerHeight();

	var dragTop;
	
	if ( bookYCenter <= dragYHeight/2 ) {
		dragTop = 0;
	} else if (!((bookYTop+(bookYHeight/2)) > dragYCenter && dragYBottom >= $(window).height())) {
		dragTop = $(".cal-book").offset().top - ( ($("#dragInstructions").outerHeight() - $(".cal-book").outerHeight() )/2);
	}
	
	$("#dragInstructions").css({
		top: dragTop
	});
}

/*
	Kontrollera om det är ledigt eller upptaget just nu
*/

function isItFreeRightNow() {
	
	var d = new Date();
	var weekDay, month, minutes, hours, timeNow;
	
	if(d.getHours() < 10) {
		hours = "0"+d.getHours();
	} else {
		hours = d.getHours()
	}
	
	
	if(d.getMinutes() < 10) {
		minutes = "0"+d.getMinutes();
	} else {
		minutes = d.getMinutes()
	}
	
	/*
		Skapa sträng med tiden just nu
	*/
	timeNow = hours+":"+minutes;

	for(i=0; i<timeArray.length; i++) {
		for (j=timeArray[i][0]; j<=timeArray[i][1]; j++ ){
			if( (timeToMinutes(timeNow) - dayStartsAt) == j) {
				return false;
			}
		}
	}
	
	return true;
}


/*
	Kontrollera hur länge det är kvar av aktuell status
*/

function howMuchTimeIsLeft() {
	
	var d = new Date();
	var weekDay, month, minutes, hours, minutesLeft;
	
	if(d.getHours() < 10) {
		hours = "0"+d.getHours();
	} else {
		hours = d.getHours()
	}
	
	if(d.getMinutes() < 10) {
		minutes = "0"+d.getMinutes();
	} else {
		minutes = d.getMinutes()
	}
	
	/*
		Skapa sträng med tiden just nu att jämföra med
	*/
	timeNow = hours+":"+minutes;
	
	/*
		Om det är upptaget nu, hur länge till?
	*/
	var timeNowInMinutes = timeToMinutes(timeNow) - dayStartsAt;
	for (var i = 0; i < timeArray.length; i++) {
		if (timeNowInMinutes >= timeArray[i][0] && timeNowInMinutes <= timeArray[i][1]) {
			// While current event ends when next event starts check wheter next events ends when the event after that starts and so on
			
			// Current event ends when next event starts
			var edgeToEdge = true;
			var counter = 0;
			var indexEnd = timeArray[i + counter][1];
			while (edgeToEdge) {
				var nextIndex = i + counter + 1;
				
				if (nextIndex < timeArray.length && indexEnd >= timeArray[nextIndex][0]) {
					counter++;
					indexEnd = timeArray[i + counter][1];
				} else {
					edgeToEdge = false;
				}
			}
			minutesLeft = timeArray[i + counter][1] - timeNowInMinutes;

			/*if (timeArray[i][1] == timeArray[i + 1][0]) {
				//
			}*/

			// If next event starts when event index=i ends then
				// then check if event index=i+1 ends when index=i starts and so on until 
			//else
				// 

			
			return minutesLeft;
		}
	}
	
	/*
		Hit kommer vi bara om ingen tid matchades
		i loopen ovanför, dvs om det just nu är ledigt.
		Kontrollera då hur länge det är kvar till nästa möte.
	*/
	for(i=0; i<timeArray.length; i++) {
		if( (timeToMinutes(timeNow) - dayStartsAt) <= timeArray[i][0]) {		
			minutesLeft = timeArray[i][0] - (timeToMinutes(timeNow) - dayStartsAt);
			return minutesLeft;
		}
	}
	
	/*
		Returnera false om det inte är fler möten idag från nuvarande tid
	*/
	return false;
}


function updateStatus() {

	var timeLeft = howMuchTimeIsLeft();
	var timeText;
	
	if ( timeLeft > 9000 ) {
		timeText = "";
	} else if (!timeLeft) {
		timeText = "resten av dagen";
	} else {
		timeText = timeLeft + " min till";
	}
	
	if(isItFreeRightNow()){
		
		document.documentElement.className = "free";
		
		$("#left #clock-container h1").text("Ledigt");		
		$("#left #clock-container h2").text(timeText);
		
		pie(howMuchTimeIsLeft(), true);
		
		positionElements();
		
	} else {
		
		document.documentElement.className = "busy";
		
		$("#left #clock-container h1").text("Upptaget");
		$("#left #clock-container h2").text(timeText);
		
		pie(howMuchTimeIsLeft(), false);
		
		positionElements();
		
	}
}

/*
	Positionera elementen i vänstra delen av sidan
*/
function positionElements() {

	var centeredOffsetTopClock = parseInt(($("#left").height() - $("#clock-container").height())/2);
	var centeredOffsetLeftClock = parseInt(($("#left").width() - $("#clock-container").width())/2);
	var heightClock = parseInt($("#left").height() * .9);

	var centeredOffsetTopSelectUser = parseInt(($(window).height() - $("#selectUser").height())/2);
	var centeredOffsetLeftSelectUser = parseInt(($(window).width() - $("#selectUser").width())/2.2);
	
	
	$("#clock-container").css({
		"top" : centeredOffsetTopClock,
		"left" : centeredOffsetLeftClock,
		"width": heightClock
	});
	
	$("#selectUser").css({
		"top" : centeredOffsetTopSelectUser,
		"left" : centeredOffsetLeftSelectUser
	});

	var h1Top = parseInt($("#clock-container").height() * .5 - $("#clock-container h1").height() * 1.3);
	var h2Top = parseInt(h1Top + $("#clock-container h1").height() * 1.45);
	var dateTop = parseInt(h1Top+$("#date").height());

	$("#clock-container h1").css({
		top: h1Top
	});
	
	$("#clock-container h2").css({
		top: h2Top
	});
	
	$("#date").css({
		top: dateTop
	});
	
	$("#book").css({
		bottom: "10px",
		right: ($("#right").width()-$("#book").width())*.5,
		zIndex: 5
	});
	
}

/*
	Rita upp klockan med HTML5 Canvas 
	enligt inparametrar:
		• minutesLeft (int), hur många minuter klockan ska täcka
		• free (bool), om den ska vara röd eller grön
*/
function pie(minutesLeft, free) {
					
	var canvas = document.getElementById("clock"); 
	var ctx = canvas.getContext('2d');
	var w = canvas.width;
	var h = canvas.height;
	var a = 6 * minutesLeft;
	var b = 360 - a;
	var datalist = new Array(b, a);
	var color;
	
	if (free) {
	    color = 'rgb(65,175,75)';
	} else {
		color = 'red';
	}
	
	var colist = new Array('white', color);
	var lineWidth = 30;
	var radius = h / 2 - lineWidth;
	var centerx = w / 2;
	var centery = h / 2;
	var total = 0;
	for(x=0; x < datalist.length; x++) {
		total += datalist[x];
	}
	
	var lastend=0;
	var offset = Math.PI / 2;
	
	for(x=0; x < datalist.length; x++){
		var thispart = datalist[x]; 
		ctx.beginPath();
		ctx.fillStyle = colist[x];
		ctx.moveTo(centerx,centery);
		var arcsector = Math.PI * (2 * thispart / total);
		ctx.arc(centerx, centery, radius, lastend - offset, lastend + arcsector - offset, false);
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = "#fff";
		ctx.lineJoin = "round";
		ctx.stroke();
		ctx.lineTo(centerx, centery);
		ctx.fill();
		ctx.closePath();		
		lastend += arcsector;	
	}
}

/*
	Förändra storleken på klockan beroende på webbläsarens storlek
*/
function resizeClock() {
	
	var size;
	
	if ( $("#left").css("width") > $("#left").css("height") ) {
		size = parseInt(parseInt($("#left").css("height")) * .9);
	} else {
		size = parseInt(parseInt($("#left").css("width")) * .9);
	}
	
	$("#clock").attr({
		width: size,
		height: size
	});
	
	// Rita upp klockan igen
	updateStatus();
	
}


function updateTime() {
	var d = new Date();
	var weekDay, month, minutes, hours;
	
	if(d.getHours() < 10) {
		hours = "0"+d.getHours();
	} else {
		hours = d.getHours()
	}
	
	
	if(d.getMinutes() < 10) {
		minutes = "0"+d.getMinutes();
	} else {
		minutes = d.getMinutes()
	}
	
	switch (d.getDay()) {
		case 0 :
			weekDay = "sön";
			break;
		case 1 :
			weekDay = "mån";
			break;
		case 2 :
			weekDay = "tis";
			break;
		case 3 :
			weekDay = "ons";
			break;
		case 4 :
			weekDay = "tor";
			break;
		case 5 :
			weekDay = "fre";
			break;
		case 6 :
			weekDay = "lör";
			break;
	}
	switch (d.getUTCMonth()) {
		case 0 :
			month = "jan";
			break;
		case 1 :
			month = "feb";
			break;
		case 2 :
			month = "mar";
			break;
		case 3 :
			month = "apr";
			break;
		case 4 :
			month = "maj";
			break;
		case 5 :
			month = "jun";
			break;
		case 6 :
			month = "jul";
			break;
		case 7 :
			month = "aug";
			break;
		case 8 :
			month = "sep";
			break;
		case 9 :
			month = "okt";
			break;
		case 10 :
			month = "nov";
			break;
		case 11 :
			month = "dec";
			break;
	}

	$("#left .weekDay").text(weekDay);
	$("#left .monthDay").text(d.getDate());
	$("#left .month").text(month);
	$("#left .hours").text(hours);
	$("#left .minutes").text(minutes);
	
}

/*
	Kod som ska köras i intervall
*/
function intervalFunctions() {
	// Uppdaterar användare
	//getUsers();

	// Uppdatera texten med tid
	updateTime();

	// Uppdatera klockan och rubriker
	updateStatus();
	
	// Rita om klockan
	resizeClock();
	
	// Uppdatera overlay
	stretchOverlay();

	// Hämta möten
	getMeetings();
}

/*
	Funktion för att hämta möten från Office 365
*/
function getMeetings(completeFunc) {
	if (completeFunc == null) completeFunc = function () { };
	
	if (!IsAuthenticated) return false;

	
	$("#booked-items li").addClass("meetingsToRemove");

	$.ajax({
		url: razorUrlGetEvents,
		type: 'POST',
		contentType: 'application/json; charset=utf-8',
		dataType: "json",
		success: function (jsonEvent) {
			timeArray = [];
			var event = JSON.parse(jsonEvent);
			//console.log("GetEvents: Success");
			for (i = 0; i < event.length; i++) {
				renderEvent(event[i].eventId, event[i].start, event[i].end, event[i].name);
			}
			updateStatus();
			$("#booked-items li.meetingsToRemove:not(.regretable)").remove();
		},
		error: function (jqXHR, textStatus, errorThrown) {
			//console.log("GetEvents: " + errorThrown);
			//console.log(jqXHR);
		},
		complete: completeFunc
	});
}

/*
	Funktion för att lägga in ett möte i kalendern
*/

function renderEvent(eventId, start, end, name, regretable) {
	
    var regretClass = "";

    if (regretable) {
        regretClass = "regretable";
    } else {
        regretable = false;
    }

    if (eventId == null) eventId = "";
	
	/*
		Skapa innehållet i bokningen baserat på inparametrar
	*/
	var row1 =	'<li class="cal-booked newBooking '+regretClass+'" start="'+start+'" end="'+end+'" eventId="'+eventId+'">';
	var row2 =		'<div class="bookedTime"><span class="start"></span> – <span class="end"></span></div>';
	var row3 = 		'<div class="bookedBy">';
	var row4 = 			'<span class="name">'+name+'</span>';
	var row5 = 		'</div>';
	var row6 = 		'<div class="regret"><button>Ångra bokning (<span>5</span>)</button></div>';
	var row7 = 	'</li>';
	
	if(!regretable) row6 = '';
	
	var newBooking = row1 + row2 + row3 + row4 + row5 + row6 + row7;
	
	/*
		Lägg in bokningen grafiskt i kalendern
	*/
	$("#booked-items").prepend(newBooking);
	resizeAndPosBlock($(".newBooking"));
	applyTimeToBlock($(".newBooking"));
	
	/*
		Lägg in bokningen i arrayen som innehåller tider
	*/
	timeArray.push([ timeToMinutes(start) - dayStartsAt, timeToMinutes(end) - dayStartsAt ]);
	
	/*
		Avmarkera bokningen som "newBooking" (användes för att nå den ovanför)
	*/
	var booking = $(".newBooking");
	$(".newBooking").removeClass("newBooking");

	return booking;
}

/*
		Posta med AJAX till Office 365
*/

function postToOffice365(start, end, name, mail) {
	if (!IsAuthenticated) return false;

	$(".spinner-wrapper").fadeIn(200);

	var obj = renderEvent("", start, end, name, true); /* HÄR */

	var startHours = start.substring(0, 2);
	var startMinutes = start.substring(3, 5);
	var endHours = end.substring(0, 2);
	var endMinutes = end.substring(3, 5);
	// "{ year: 2015, month: 5, day: 12, hour: 15, minute: 0, second: 0 }";
	var d = new Date();
	var starttime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), startHours, startMinutes, 0, 0);
	var endtime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), endHours, endMinutes, 0, 0);
	var parameters = { start: starttime.toUTCString(), end: endtime.toUTCString(), attendeeName: name, attendeeMail: mail}
	$.ajax({
		url: razorUrlCreateMeetings,
		type: 'POST',
		data: JSON.stringify(parameters),
		contentType: 'application/json; charset=utf-8',
		dataType: "json",
		success: function (eventId) {
			obj.attr("eventId", eventId);
		    getMeetings(function () {
		        $(".spinner-wrapper").fadeOut(200);
		        

		        /*
			        Visa ångra-knapp i fem sekunder
		        */
		        $(".regret").show();
		        var countDown = 4;

		        var intervalId = setInterval(function () {
		            $(".regret button span").text(countDown);
		            countDown--;
		            if (countDown == 0) {
		                window.clearInterval(intervalId);
		                $(".regret").fadeOut(50, function () {
		                    $(".regretable").remove();
		                    $(".newBooking").removeClass("newBooking");
		                    updateStatus();
		                });
		            }
		        }, 1000);


		    });

		    

			updateStatus();
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
		}
	});

}

$(function () {
	$(document).on("click", ".cal-booked", function () {
		deleteFromOffice365($(this).attr("eventId"));
	});
});

function deleteFromOffice365(eventId) {
	if (!IsAuthenticated) return false;
	$(".spinner-wrapper").fadeIn(200);
	
	var parameters = { eventId: eventId }
	$.ajax({
		url: razorUrlDeleteMeeting,
		type: 'POST',
		data: JSON.stringify(parameters),
		contentType: 'application/json; charset=utf-8',
		dataType: "json",
		success: function () {
			
			getMeetings(function () {
				$(".spinner-wrapper").fadeOut(200);
				updateStatus();
			});
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log("deleteFromOffice365: " + errorThrown);
			console.log(jqXHR);
		},
		complete: function () {
			
			getMeetings(function () {
				$(".spinner-wrapper").fadeOut(200);
				updateStatus();
			});
		}
	});
}


function getUsers() {
	//console.log("is auth in getUsers: " + IsAuthenticated);

	if (!IsAuthenticated) return false;
	var anv;
	$.ajax({
		url: razorUrlGetUsers,
		type: 'POST',
		contentType: 'application/json; charset=utf-8',
		dataType: "json",
		success: function (users) {
			var usersObject = JSON.parse(users);
			addUsers(usersObject);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
		}

		
	});
	

}

/*
	Funktion för att lägga till deltagare att välja mellan
*/

function addUsers(users) {

	$("form.users").empty();
	for (i=0; i<users.length; i++){
		var user = '<div><input class="userListItem" type="radio" name="user" value="'+users[i].mail+'" id="r'+i+'"><label for="r'+i+'">'+users[i].name+'</label></div>';
		$("form.users").append(user);
	}
}

/*
	Funktion för att runda x till närmsta y
*/

function roundXToNearestY(x, y) {
	var x_rounded = y * Math.round(x / y);
	return x_rounded;
}

function filterByInitials() {
    $("form.users div").show();

    var filter = $(".filter input").val().toUpperCase();
    filter = filter.replace(".", "").replace(",", "");

    if (filter == "") {
        return;
    }
    else if (filter.length == 1) {
        $("form.users div").each(function () {
            var name = $(this).children("input").val().split(" ");
            var initials = "";
            for (i = 0; i < name.length - 1; i++) initials += name[i].substr(0, 1);
            if (filter != initials) $(this).hide();
        });
    }
    else {
        $("form.users div").each(function () {
            var name = $(this).children("input").val().split(" ");
            var initials = "";
            for (i = 0; i < name.length; i++) initials += name[i].substr(0, 1);
            if (filter != initials) $(this).hide();
        });
    }
}
