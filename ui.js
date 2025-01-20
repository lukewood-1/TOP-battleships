import {Ship, Gameboard, Player, UiManager, numberify} from './main.js';

function main(){
	const ui = UiManager();
	const newGameBtn = document.querySelector('.new-game');
	
	newGameBtn.addEventListener('click', ()=> {
		ui.resetPlayers();
		ui.renderBoards('.p1-board','.cpu-board');
		ui.cleanBoards('.p1-board', '.cpu-board');
		ui.listen();
		ui.cpuPlaceShip();
	});

	document.addEventListener('DOMContentLoaded', ()=> {
		console.log('page loaded!');
	});

};

main();
