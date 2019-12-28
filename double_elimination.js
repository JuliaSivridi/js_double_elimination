var players = []; var matches = []; var results = [];
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

function setMatchGrid(matchIndex, gridMatch) {
	if (matches[matchIndex].gridMatch == undefined) {
		matches[matchIndex].gridMatch = gridMatch;
		var ltr = gridMatch ? 'w' : 'l';
		$("#match_" + matchIndex).append(ltr +'&nbsp;');
	}
}

function makeBtn(name, matchIndex, playerIndex) {
	var btn = $('<button/>', {
		text: '[ ' + name + ' ]',
		id: 'btn_' + matchIndex + '_' + playerIndex,
		click: playMatch.bind(this, matchIndex, playerIndex)
	}); $("#match_" + matchIndex).append(btn);	   
}

function initTour() {
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
				matches[m].players[playerIndex] = players[p];
				players[p].inMatch = true;
				makeBtn(players[p].name, m, playerIndex);
			}
		}
	}
}

function howManyAlive() {
	counter = 0;
	for (p = 0; p < players.length; p++) {
		if (players[p].losses < 2) counter++;
	} return counter;
}

function movePlayer(gridMatch, player) {
	for (var m = 0; m < matches.length; m++) {
		setMatchGrid(m, gridMatch);
		if ((matches[m].gridMatch === gridMatch) && (!matches[m].players[0] || !matches[m].players[1])) {
			var playerIndex = matches[m].players[0] == undefined ? 0 : 1;
			matches[m].players[playerIndex] = player;
			makeBtn(player.name, m, playerIndex);
			break;
		}
	}
}

function playMatch(matchIndex, winnerIndex) {
	$("#match_" + matchIndex).removeClass("notPlayed");
	$("#match_" + matchIndex).addClass("wasPlayed");
	var winner = matches[matchIndex].players[winnerIndex];
	var loserIndex = winnerIndex == 0 ? 1 : 0;
	var loser = matches[matchIndex].players[loserIndex];
	winner.played++; loser.played++; loser.losses++;
	$("#btn_" + matchIndex + '_' + loserIndex).addClass("loser");
	$("#btn_" + matchIndex + '_' + winnerIndex).unbind('click');
	$("#btn_" + matchIndex + '_' + loserIndex).unbind('click');
	if (howManyAlive() < 2) {
		$("#btn_" + matchIndex + '_' + winnerIndex).addClass("totalwinner");
		$("#match_" + (matches.length-1)).addClass("wasPlayed");
		$("#adding").remove();
		var place = 1;
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
		}
	} else {
		$("#btn_" + matchIndex + '_' + winnerIndex).addClass("winner");
		var gridMatch = howManyAlive() < 3;
		if (loser.losses < 2)
			movePlayer(gridMatch, loser); // move loser to (true) winners in superfinal or to (false) losers
		if (winner.losses > 0) {
			movePlayer(gridMatch, winner); // move winner of losers to (true) winners or to (false) losers
		} else {
			movePlayer(true, winner); // move winner to winners
		}
	}
}