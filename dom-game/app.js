/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls two dice as many times as he whishes. Each result gets added to his ROUND score
- BUT, if the player rolls a 1 in any dice, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GLBAL score. After that, it's the next player's turn
- The first player to reach max score points on GLOBAL score wins the game

*/

var scores, roundScore, activePlayer,gamePlaying, input_value;

function diceDisplay() {
    document.querySelector('.dice').style.display = 'none';
    document.querySelector('.dice2').style.display = 'none';
}

function init() {
    scores = [0,0];
    activePlayer = 0;
    roundScore = 0;
    
    diceDisplay();

    document.getElementById('score-0').textContent = '0';
    document.getElementById('score-1').textContent = '0';
    document.getElementById('current-0').textContent = '0';
    document.getElementById('current-1').textContent = '0';

    document.getElementById('name-0').textContent = "Player 1";
    document.getElementById('name-1').textContent = "Player 2";

    document.querySelector('.player-0-panel').classList.remove('winner');
    document.querySelector('.player-1-panel').classList.remove('winner');
    document.querySelector('.player-0-panel').classList.remove('active');
    document.querySelector('.player-1-panel').classList.remove('active');
    document.querySelector('.player-0-panel').classList.add('active');
    
    let id = document.getElementById('user_input');

    document.querySelector('.btn-input').textContent = "MAX SCORE INPUT";

    id.classList.remove('visible');
    id.value = "";
    gamePlaying = false;
    id.addEventListener('keypress', function(e) {
        if(e.key === 'Enter') {
            input_value = id.value;
            id.classList.add('visible');
            document.querySelector('.btn-input').textContent = `Max Score = ${input_value}`;
            gamePlaying = true;
        }
    })
    
}

init();

function toggleThePlayer () {
    activePlayer = (activePlayer === 0) ? 1 : 0;
        roundScore = 0;

        document.getElementById('current-0').textContent = '0';
        document.getElementById('current-1').textContent = '0';

        // document.querySelector('.player-0-panel').classList.remove('active');
        document.querySelector('.player-0-panel').classList.toggle('active');
        document.querySelector('.player-1-panel').classList.toggle('active');

        diceDisplay();
}

document.querySelector('.btn-roll').addEventListener('click', function() {
    if(gamePlaying) {
        //1) Random Number
        var dice = Math.floor(Math.random() * 6) + 1;
        var dice2 = Math.floor(Math.random() * 6) + 1;

        //2) Display the result: 
        var diceDOM = document.querySelector('.dice')
        diceDOM.style.display = 'block';
        diceDOM.src = 'dice-' + dice + '.png';

        var diceDOM2 = document.querySelector('.dice2')
        diceDOM2.style.display = 'block';
        diceDOM2.src = 'dice-' + dice2 + '.png'

        //3) Update the round score if dice value is not 1.

        if(dice !== 1 && dice2 !==1) {
            roundScore += (dice + dice2);
            document.querySelector('#current-' + activePlayer).textContent = roundScore;
        } else {
            //Next Player
            toggleThePlayer();
        }
    }

}); 

document.querySelector('.btn-hold').addEventListener('click', function () {
    if(gamePlaying) {
        //1) add current score to player global score.
        scores[activePlayer] += roundScore;

        //2) Update the UI.
        document.querySelector('#score-' + activePlayer).textContent = scores[activePlayer];
        
        
        //3) Check If player won the game.
        if (scores[activePlayer] >=parseInt(input_value) ) {
            document.querySelector('#name-' + activePlayer).textContent = "Winner !!";
            diceDisplay();
            document.querySelector('.player-' + activePlayer + '-panel').classList.add('winner');
            document.querySelector('.player-' + activePlayer + '-panel').classList.remove('active');
            gamePlaying = false;

        } else {
            //next Player
            toggleThePlayer();
        }
    }
});

document.querySelector('.btn-new').addEventListener('click', init);