import {Ship, Gameboard, Player, UiManager} from './main.js';

function main(){
	const ui = UiManager();
	const newGameBtn = document.querySelector('.new-game');
	
	newGameBtn.addEventListener('click', e => {
		ui.resetPlayers();
		ui.renderBoards('.p1-board','.cpu-board');
		ui.listen();
		e.target.addEventListener('click', ()=>location.reload());
		e.target.textContent = 'reload';
	}, {once: true});

	document.addEventListener('DOMContentLoaded', ()=> {
		console.log('loaded!');
	});

};

main();
