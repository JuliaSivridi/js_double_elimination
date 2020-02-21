$(function (){
	$('body').append('<div id="adding">[<input id="playerName" type="text" value="" placeholder="new player..." />]'
	+'<button onclick="initTour()">[ add ]</button></div>'
	+'<div id="matches"></div>'
	+'<div id="summary"></div>');
});

var players = []; var matches = [];
class Player {
	constructor(name) {
		this.name = name;
		this.losses = 0;
		this.played = 0;
		this.inMatch = false;
	}
}

class Match {
	constructor() {
		this.players = [];
		this.gridMatch = undefined;
	}
}

var setMatchGrid = function(matchIndex, gridMatch) {
	if (matches[matchIndex].gridMatch == undefined) {
		matches[matchIndex].gridMatch = gridMatch;
		var ltr = gridMatch ? 'w' : 'l';
		$("#match_" + matchIndex).append(ltr +'&nbsp;');
	}
}

var movePlayer = function(newPlace, player) {
	var matchIndex = newPlace[0];
	var playerIndex = newPlace[1];
	matches[matchIndex].players[playerIndex] = player;
	var btn = $('<button/>', {
		text: '[ ' + player.name + ' ]',
		id: 'btn_' + matchIndex + '_' + playerIndex
	}).on('click', function () { playMatch(matchIndex, playerIndex) });
	$("#match_" + matchIndex).append(btn);	   
}

var initTour = function() {
	var playerName = document.getElementById("playerName").value;
	if (!playerName) return;
	document.getElementById("playerName").value = "";
	var p = players.push(new Player(playerName)) - 1;
	for (var m = 0; m < (2 * players.length - 1); m++) {
		if (matches[m] == undefined) {
			matches[m] = new Match();
			$("#matches").append('<div id="match_'+ m +'" class="notPlayed">#'+ m +'&nbsp;</div>');
		}
		if ((matches[m].gridMatch == undefined || matches[m].gridMatch == true)
			&& (!matches[m].players[0] || !matches[m].players[1])) {
			var playerIndex = matches[m].players[0] == undefined ? 0 : 1;
			if (players[p].inMatch === false) {
				if (playerIndex == 0) setMatchGrid(m, true);
				players[p].inMatch = true;
				var newPlace = [m, playerIndex];
				movePlayer(newPlace, players[p]);
			}
		}
	}
}

var howManyAlive = function() {
	counter = 0;
	for (p = 0; p < players.length; p++) {
		if (players[p].losses < 2) counter++;
	} return counter;
}

var findPlace = function(gridMatch) {
	var newPlace = [];
	for (var m = 0; m < matches.length; m++) {
		setMatchGrid(m, gridMatch);
		if ((matches[m].gridMatch === gridMatch) && (!matches[m].players[0] || !matches[m].players[1])) {
			var playerIndex = matches[m].players[0] == undefined ? 0 : 1;
			newPlace.push(m, playerIndex);
			break;
		}
	} return newPlace;
}

var viewResults = function(winner, loser) {
	$("#adding").hide();
	var place = 1; var results = [];
	$("#summary").addClass("summary").append('#'+ (place++) +' <b>'+ winner.name +'</b>');
	$("#summary").addClass("summary").append('<br/>#'+ (place++) +' <b>'+ loser.name +'</b>');
	for (p = 0; p < players.length; p++) {
		if (results[players[p].played] == undefined) results[players[p].played] = [];
		results[players[p].played].push(players[p].name);
	}
	for (r = results.length-1; r > 2; r--) {
		if (results[r] == undefined) continue;
		for (rp = 0; rp < results[r].length; rp++) {
			if (results[r][rp] == winner.name || results[r][rp] == loser.name) continue;
			if (rp == 0) $("#summary").append('<br/>#'+ (place++) +'&nbsp;');
			$("#summary").append(results[r][rp] +'&nbsp;');
		}
	} $("#summary").show();
}

var playMatch = function(matchIndex, winnerIndex) {
	$("#match_" + matchIndex).removeClass("notPlayed").addClass("wasPlayed");
	var winner = matches[matchIndex].players[winnerIndex];
	var loserIndex = winnerIndex == 0 ? 1 : 0;
	var loser = matches[matchIndex].players[loserIndex];
	winner.played++; loser.played++; loser.losses++;
	$("#btn_" + matchIndex + '_' + loserIndex).addClass((loser.losses < 2) ? "loser" : "dropout");
	$(".wasPlayed > button").off('click');
	var newLoserPlace; var newWinnerPlace;
	if (howManyAlive() < 2) { // viewResults
		$("#btn_" + matchIndex + '_' + winnerIndex).addClass("totalwinner");
		$("#match_" + (matches.length-1)).addClass("wasPlayed");
		viewResults(winner, loser);
	} else {
		$("#btn_" + matchIndex + '_' + winnerIndex).addClass("winner");
		var gridMatch = howManyAlive() < 3;
		if (loser.losses < 2) {
			newLoserPlace = findPlace(gridMatch); // move loser to (true) winners in superfinal or to (false) losers
			movePlayer(newLoserPlace, loser);
		}
		if (winner.losses > 0) {
			newWinnerPlace = findPlace(gridMatch); // move winner of losers to (true) winners or to (false) losers
			movePlayer(newWinnerPlace, winner);
		} else {
			newWinnerPlace = findPlace(true); // move winner to winners
			movePlayer(newWinnerPlace, winner);
		}
	} // let the loser win if mistake
	$("#btn_" + matchIndex + '_' + loserIndex).on('click', function () {rePlay(matchIndex, winnerIndex, winner, newWinnerPlace, loserIndex, loser, newLoserPlace) });
}

var rePlay = function(matchIndex, winnerIndex, winner, newWinnerPlace, loserIndex, loser, newLoserPlace) {
	$("#btn_" + matchIndex + '_' + loserIndex).off('click');
	$("#summary").html("").hide();
	loser.losses--; winner.losses++;
	if (howManyAlive() < 2) { // viewResults
		$("#btn_" + matchIndex + '_' + winnerIndex).removeClass("totalwinner").removeClass("winner").addClass((winner.losses < 2) ? "loser" : "dropout");
		$("#btn_" + matchIndex + '_' + loserIndex).removeClass("dropout").removeClass("loser").addClass("totalwinner");
		if (newLoserPlace != undefined) {
			$("#btn_" + newLoserPlace[0] + '_' + newLoserPlace[1]).remove();
			$("#btn_" + newWinnerPlace[0] + '_' + newWinnerPlace[1]).remove();
			$("#match_" + (matches.length-1)).addClass("wasPlayed");
		} viewResults(loser, winner);
	} else {
		$("#adding").show();
		$("#btn_" + matchIndex + '_' + winnerIndex).removeClass("totalwinner").removeClass("winner").addClass((winner.losses < 2) ? "loser" : "dropout");
		$("#btn_" + matchIndex + '_' + loserIndex).removeClass("dropout").removeClass("loser").addClass("winner");
		if (howManyAlive() < 3) $("#match_" + (matches.length-1)).removeClass("wasPlayed");
		if (newWinnerPlace == undefined) {
			if (newLoserPlace == undefined) {
				newLoserPlace = findPlace(true);
				movePlayer(newLoserPlace, winner);
				newWinnerPlace = findPlace(true);
				movePlayer(newWinnerPlace, loser);
			} else {
				$("#btn_" + newLoserPlace[0] + '_' + newLoserPlace[1]).remove();
				movePlayer(newLoserPlace, winner);
			}
		} else {
			if (newLoserPlace != undefined) {
				$("#btn_" + newLoserPlace[0] + '_' + newLoserPlace[1]).remove();
				movePlayer(newLoserPlace, winner);
			}
			$("#btn_" + newWinnerPlace[0] + '_' + newWinnerPlace[1]).remove();
			movePlayer(newWinnerPlace, loser);
		}
	} // let the winner lose again if mistake
	$("#btn_" + matchIndex + '_' + winnerIndex).on('click', function () {rePlay(matchIndex, loserIndex, loser, newWinnerPlace, winnerIndex, winner, newLoserPlace) });
}