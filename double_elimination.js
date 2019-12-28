var players = [];
class Player {
  constructor(name, losses) {
    this.name = name;
	this.losses = losses;
  }
}
function addPlayer() {
	var playerName = document.getElementById("playerName").value;
	if (!playerName) return;
	document.getElementById("playerName").value = "";
	players.push(new Player(playerName, 0));
	$("#playerList").append(playerName + ', ');
}

var matches = [];
class Match {
  constructor() {
	this.players = [];
	this.isPlayed = false;
  }
}

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

function setMatchType(matchIndex, matchType) {
	if (matches[matchIndex].isWinMatch == undefined) {
		matches[matchIndex].isWinMatch = matchType;
		var ltr = matchType === true ? 'w' : 'l';
		$("#match_" + matchIndex).append(ltr + '&nbsp;');
	}
}

function makeBtn(name, matchIndex, playerIndex) {
	var btn = $('<button/>', {
		text: '[ ' + name + ' ]',
		id: 'btn_' + matchIndex + '_' + playerIndex,
		click: playMatch.bind(this, matchIndex, playerIndex)
	});
	$("#match_" + matchIndex).append(btn);		
}

function initTour() {
	shuffle(players);
	var playerCount = players.length;
	var matchCount = 2 * playerCount - 1;
	for (var m = 0; m < matchCount; m++) {
		matches[m] = new Match();
		$("#matches").append('<div id="match_' + m + '" class="notPlayed">#' + m + '&nbsp;</div>');
	}
	m = 0; var playerIndex = 0;
	for (var p = 0; p < playerCount; p++) {
		if (playerIndex == 0) setMatchType(m, true);
		matches[m].players[playerIndex] = players[p];
		makeBtn(players[p].name, m, playerIndex);
		playerIndex++; if (playerIndex == 2) {playerIndex = 0; m++;}
	}
}

function isFreePlace(matchIndex){
	var isFree = !matches[matchIndex].players[0] || !matches[matchIndex].players[1];
	return isFree;
}

function howManyAlive() {
	counter = 0;
	for (i = 0; i < players.length; i++) {
		if (players[i].losses < 2) counter++;
	}
	return counter;
}

function playMatch(matchIndex, winnerIndex) {
	matches[matchIndex].isPlayed = true;
	$("#match_" + matchIndex).removeClass("notPlayed");
	$("#match_" + matchIndex).addClass("wasPlayed");

	var winner = matches[matchIndex].players[winnerIndex];
	var loserIndex = winnerIndex == 0 ? 1 : 0;
	var loser = matches[matchIndex].players[loserIndex];
	loser.losses++;
	$("#btn_" + matchIndex + '_' + loserIndex).addClass("loser");

	if (howManyAlive() < 2) {
		$("#btn_" + matchIndex + '_' + winnerIndex).addClass("totalwinner");
		$("#btn_" + matchIndex + '_' + winnerIndex).unbind('click');
		$("#btn_" + matchIndex + '_' + loserIndex).unbind('click');
		$("#match_" + (matches.length-1)).addClass("wasPlayed");
	} else {
		$("#btn_" + matchIndex + '_' + winnerIndex).addClass("winner");

		if (loser.losses < 2) {
			if (howManyAlive() < 3) {
				// move loser to winners in superfinal
				for (var m = 0; m < matches.length; m++) {
					setMatchType(m, true);
					if (matches[m].isWinMatch === true) {
						if (isFreePlace(m)) {
							var playerIndex = matches[m].players[0] == undefined ? 0 : 1;
							matches[m].players[playerIndex] = loser;
							makeBtn(loser.name, m, playerIndex);
							break;
						}
					}
				}
			} else {
				// move loser to losers
				for (var m = 0; m < matches.length; m++) {
					setMatchType(m, false);
					if (matches[m].isWinMatch === false) {
						if (isFreePlace(m)) {
							var playerIndex = matches[m].players[0] == undefined ? 0 : 1;
							matches[m].players[playerIndex] = loser;
							makeBtn(loser.name, m, playerIndex);
							break;
						}
					}
				}
			}
		}
		if (winner.losses > 0) {
			if (howManyAlive() < 3) {
				// move winner of losers to winners
				for (var m = 0; m < matches.length; m++) {
					if (matches[m].isWinMatch === true) {
						if (isFreePlace(m)) {
							var playerIndex = matches[m].players[0] == undefined ? 0 : 1;
							matches[m].players[playerIndex] = winner;
							makeBtn(winner.name, m, playerIndex);	
							break;
						}
					}
				}
			} else {
				// move earlier loser to losers
				for (var m = 0; m < matches.length; m++) {
					setMatchType(m, false);
					if (matches[m].isWinMatch === false) {
						if (isFreePlace(m)) {
							var playerIndex = matches[m].players[0] == undefined ? 0 : 1;
							matches[m].players[playerIndex] = winner;
							makeBtn(winner.name, m, playerIndex);
							break;
						}
					}
				}
			}
		} else {
			// move winner to winners
			for (var m = 0; m < matches.length; m++) {
				setMatchType(m, true);
				if (matches[m].isWinMatch === true) {
					if (isFreePlace(m)) {
						var playerIndex = matches[m].players[0] == undefined ? 0 : 1;
						matches[m].players[playerIndex] = winner;
						makeBtn(winner.name, m, playerIndex);	
						break;
					}
				}
			}
		}
	}
}
