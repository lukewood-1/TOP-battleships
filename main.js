function Ship(shipLength){
	let length = shipLength;
	let hitCount = 0;
	let wasSunk = false;

	function hit(){
		hitCount++;
		if(isSunk()){
			sink();
		}
	}

	function sink(){
		return wasSunk = true;
	}

	function isSunk(){
		return hitCount === length ? true : false
	}

	return {
		length,
		hitCount,
		wasSunk,
		hit,
		isSunk,
	}
};


function Gameboard(matrix){
	const board = new Array(matrix*matrix);
	const attackedCells = [];
	
	const shipList = {
		4: 0,
		3: 0,
		2: 0,
		1: 0,
	};

	function hitMark(idx){
		board[idx] = true;
		attackedCells.push(idx);
	};

	function missMark(idx){
		board[idx] = false;
		attackedCells.push(idx);
	};

	function placeShip(shipLength, orientation, idx){
		if(shipLength < 1 || shipLength > 4) return false;

		const newShip = Ship(shipLength);
		const matrix = Math.floor(Math.sqrt(board.length));
		const row = Math.floor(idx / matrix);
		const column = Math.floor(idx % matrix);

		if(idx > (matrix**2)) return false;

		// Insert ships into internal board
		if(orientation === 1){ // 1 == vertical, 0 == horizontal
			if(row + newShip.length > matrix) return false;

			for(let i = 0; i < (matrix * newShip.length); i+= matrix)
				board[idx+i] = newShip;
			}
		else if(orientation === 0){
			if(column + newShip.length > matrix) return false;

			for(let i = 0; i < newShip.length; i++){
				board[idx+i] = newShip;
			}
		};
		//Increase ship count on counter object
		shipList[shipLength]++;
	};

	function receiveAttack(idx){
		if(typeof board[idx] === 'object') {
			board[idx].hit();
			if(board[idx].isSunk()){
				shipList[board[idx].length]--;
			};
			hitMark(idx);
			return true
		}
		if(typeof board[idx] === 'undefined') {
			missMark(idx);
			return false
		}
	};

	function wereShipsDestroyed(){
		for(let ship in shipList){
			if(shipList[ship] > 0) return false
		}
		return true;
	};

	function resetBoard(){
		for(let i = 0; i < board.length; i++){
			board[i] = undefined;
		};
		for(let i = 1; i <= 4; i++){
			shipList[i] = 0;
		};
	};

	return {
		board,
		attackedCells,
		placeShip,
		receiveAttack,
		wereShipsDestroyed,
		resetBoard,
		hitMark,
		missMark,
		shipList,
	}
};

function Player(id,matrix){
	let type;
	if(id === 0) type = 'human';
	else type = 'computer';
	const gameboard = Gameboard(matrix);

	return {
		type,
		gameboard,
	}
};

function UiManager(){
	const players = [];

	function renderBoards(...targets){
		if(document.querySelector(targets[0]).children.length !== 0) return;
		for(let target of targets){
			target = document.querySelector(`body ${target}`);

			for(let i = 0; i < players[0].gameboard.board.length; i++){
				const parentCell = document.createElement('div');
					parentCell.className = 'board-cell';
				target.append(parentCell);
			};
		};
		const stylesheet = document.styleSheets[0].cssRules;
		const matrix = Math.sqrt(players[0].gameboard.board.length);
		const divTarget = document.querySelector(targets[0]);
		for(let rule of stylesheet){
			if(rule.selectorText === '[class*="-board"]'){
				rule.style.grid = `repeat(${matrix}, 1fr) / repeat(${matrix}, 1fr)`;
				break;
			}
		};
		for(let rule of stylesheet){
			if(rule.selectorText === '.board-cell'){
				rule.style.width = `${divTarget.getBoundingClientRect().width / matrix}px`;
				rule.style.height = `${divTarget.getBoundingClientRect().height / matrix}px`;
				break;
			};
		};
	};

	function resetPlayers(){
		//reset internal board
		const newPlayer = Player(0, 8),
					newCpu = Player(1, 8);
		players[0] = newPlayer;
		players[1] = newCpu;

		//reset ui board
		const target = document.querySelectorAll('.board-cell');
		for(let cell of target){
			cell.textContent = '';
			cell.className = 'board-cell';
		};

		const boards = document.querySelectorAll('.p1-board, .cpu-board');
		for(let board of boards){
			if(board.classList.contains('inactive-player')){
				board.classList.remove('inactive-player');
			}
		}
	};

	function placeShip(focus,length,orientation,idx){ 
		let playerBoard;
		if(focus === 0) {
			playerBoard = document.querySelectorAll('.p1-board .board-cell');
		}
		else if(focus === 1) {
			playerBoard = document.querySelectorAll('.cpu-board .board-cell');
		}

		const internalBoard = players[focus].gameboard.board;
		const matrix = Math.floor(Math.sqrt(internalBoard.length));
		const row = Math.floor(idx / matrix);
		const column = Math.floor(idx % matrix);
		// Orientation - 0 = horizontal, 1 = vertical
		// Check whether final index excedes board perimeter
		if(orientation === 0 && idx+(length-1) >= (matrix**2)) return false
		else if(orientation === 1 && idx+((length-1) * matrix) >= (matrix**2)) return false;
		//checking if theres not a ship in position already
		if(orientation === 0){
			for(let j = idx; j < idx+length; j++){
				if(typeof internalBoard[j] === 'object'){
					return false;
				}
			}
		} else if(orientation === 1){
			for(let j = idx; j < idx+matrix * length; j+=matrix){
				if(typeof internalBoard[j] === 'object'){
					return false
				}
			}
		};

		if(orientation === 0 && column+(length-1) < matrix){
			players[focus].gameboard.placeShip(length, orientation, idx)
			for(let i = 0; i < length; i++){
				playerBoard[idx+i].textContent = length;
			}
			return true;
		}
		else if(orientation === 1 && row+(length-1) < matrix){
			players[focus].gameboard.placeShip(length, orientation, idx)
			for(let i = 0; i < matrix*length; i+=matrix){
				playerBoard[idx+i].textContent = length; // should move to focus check once testing cpu placeShips ends
			}
			return true;
		}
		else return false // booleans are for CPU placeShip randomized place where WHILE(placeShip(randomArgs) === false {placeShip(randomArgs)})
	};

	let shipLength; // used in manualPlaceShip
	let targetOrientation = 0; // used in manualPlaceShip
	function manualPlaceShip(){
		//Hide title and buttons
		const randomBtn = document.querySelector('.random-ship-placement-btn');
		const manualBtn = document.querySelector('.manual-ship-placement-btn');
		const title = document.querySelector('.order-window > h3:nth-child(1)');
		randomBtn.style.display = 'none';
		manualBtn.style.display = 'none';
		title.style.display = 'none';

		//reveal manual place window
		let manualWindow;
		for(let stylesheet of document.styleSheets[0].cssRules){
			if(stylesheet.selectorText === '.manual-place-window'){
				manualWindow = stylesheet;
				break;
			}
		}
		manualWindow.style.display = 'grid';

		// Attach mousemove event for feedback messages
		const feedbackDiv = document.querySelector('.cursor-feedback');
		let cursor;
		const stylesheet = document.styleSheets[0].cssRules;
		for(let i of stylesheet){
			if(i.selectorText === '.cursor-feedback'){
				cursor = i;
				break;
			}
		}

		const move = e => {
			e.preventDefault();
			let top = e.y + 20;
			let left = e.x + 20;
			cursor.style.top = `${top}px`;
			cursor.style.left = `${left}px`;
		};

		document.querySelector('.p1-board').addEventListener('dragover', move);

		const showCursorMsg = msg => {
			feedbackDiv.textContent = msg;
			if(feedbackDiv.classList.contains('slow-fade')){
				feedbackDiv.classList.remove('slow-fade');
			};
		};

		const hideCursorMsg = () => {
			feedbackDiv.textContent = '';
			if(!feedbackDiv.classList.contains('slow-fade')){
				feedbackDiv.classList.add('slow-fade');
			};
		}

		// Address all containers at once, then specify bt index
		const containers = document.querySelectorAll('.ship-section');

			//change orientation btn
			const orientationBtn = document.querySelector('.orientation');
				orientationBtn.addEventListener('click', e => {
					if(e.target.getAttribute('data-direction') == 0){
						e.target.setAttribute('data-direction', '1');
						e.target.textContent = '↓';
						targetOrientation = 1;
					} 
					else if(e.target.getAttribute('data-direction') == 1){
						e.target.setAttribute('data-direction', '0');
						e.target.textContent = '→';
						targetOrientation = 0;
					}
				});

		containers.forEach( (box, idx) => {

			//add DnD events to ships and board cells
			const ships = box.querySelector('.ship');

			ships.addEventListener('dragstart', e => {
				const count = +box.querySelector('.ship-number').textContent;
				const limit = +box.querySelector('.ship-limit').textContent;
				const index = idx;
				shipLength = e.target.children.length;
				e.dataTransfer.setData('count', count);
				e.dataTransfer.setData('limit', limit);
				e.dataTransfer.setData('source', `.${e.target.className}`);
				e.dataTransfer.setData('index', idx);
			});
			ships.addEventListener('dragend', e => shipLength = undefined);
		})

		function preview(e){
			const cells = document.querySelectorAll('.p1-board .board-cell');
			if(e.target.matches('.board-cell')){
				const idx = Array.prototype.indexOf.call(cells, e.target);
				const matrix = 8;
				const row = Math.floor(idx / matrix);
				const column = Math.floor(idx % matrix);
				const player = players[0].gameboard.board;
				if(targetOrientation === 0){
					for(let i = 0; i < shipLength && (column+i) < matrix; i++){
						if(typeof player[idx+i] === 'object'){
							for(let i = 0; i < shipLength && (column+i) < matrix; i++){
								cells[idx+i].classList.add('miss-mark');
							}
							showCursorMsg('Position not allowed');
							return;
						}
					}
					if(column + (shipLength-1) < matrix){
						for(let i = 0; i < shipLength; i++){
							if(cells[idx+i].classList.contains('miss-mark')){
								cells[idx+i].classList.remove('miss-mark');
							}
							cells[idx+i].classList.add('friendly-ship');
						}
						hideCursorMsg();
					}
					else {
						for(let i = 0; column+i < matrix; i++){
							cells[idx+i].classList.add('miss-mark')
						}
						showCursorMsg('Position not allowed');
					}
				}
				else if(targetOrientation === 1){
					if(row + (shipLength-1) < matrix){
						for(let i = 0; i < (matrix*shipLength); i+= matrix){
							if(typeof player[idx+i] === 'object'){
								for(let i = 0; i < shipLength*matrix; i+=matrix){
									cells[idx+i].classList.add('miss-mark');
								}
								showCursorMsg('Position not allowed');
								return;
							}
						}
						for(let i = 0; i < (shipLength*matrix); i+=matrix){
							if(cells[idx+i].classList.contains('miss-mark')){
								cells[idx+i].classList.remove('miss-mark');
							}
							cells[idx+i].classList.add('friendly-ship');
						}
						hideCursorMsg();
					} else {
						for(let i = 0, count = 0; (row+count) < matrix; i+=matrix, count++){
							cells[idx+i].classList.add('miss-mark');
						}
						showCursorMsg('Position not allowed');
					}
				}
			}
		};

		function clearPreview(e){
			const cells = document.querySelectorAll('.p1-board .board-cell');
			if(e.target.matches('.board-cell')){
				const idx = Array.prototype.indexOf.call(cells, e.target);
				const matrix = 8;
				const row = Math.floor(idx / matrix);
				const column = Math.floor(idx % matrix);
				const player = players[0].gameboard.board;
				if(targetOrientation === 0){
					for(let i = 0; i < shipLength && (column+i) < matrix; i++){
						if(typeof player[idx+i] === 'object'){
							for(let i = 0; i < shipLength && (column+i) < matrix; i++){
								cells[idx+i].classList.remove('miss-mark');
							}
							return;
						}
					}
					if(column + (shipLength-1) < matrix){
						for(let i = 0; i < shipLength; i++){
							cells[idx+i].classList.remove('friendly-ship');
						}
					}
					else {
						for(let i = 0; column+i < matrix; i++){
							cells[idx+i].classList.remove('miss-mark');
						}
					}
				}
				else if(targetOrientation === 1){
					if(row + (shipLength-1) < matrix){
						for(let i = 0; i < matrix*shipLength; i+= matrix){
							if(typeof player[idx+i] === 'object'){
								for(let i = 0; i < shipLength*matrix; i+=matrix){
									cells[idx+i].classList.remove('miss-mark');
								}
								return;
							}
						}
						for(let i = 0, count = 0; count < shipLength; i+=matrix, count++){
							cells[idx+i].classList.remove('friendly-ship');
						}
					}
					else {
						for(let i = 0, count = 0; row+count < matrix; i+=matrix, count++){
							cells[idx+i].classList.remove('miss-mark');
						}
					}
				}
			}
		};

		const placeShipWithVerification = e => {
			const count = document.querySelectorAll('.ship-number')[shipLength-1];
			const limit = document.querySelectorAll('.ship-limit')[shipLength-1];
			const internalShipCount = players[0].gameboard.shipList[shipLength];

			const cells = document.querySelectorAll('.p1-board .board-cell');
			const idx = Array.prototype.indexOf.call(cells, e.target);

			if(internalShipCount < limit.textContent){
				if(placeShip(0, shipLength, targetOrientation, idx)){
					count.textContent = internalShipCount+1;
				}
			}
		};

		// Check whether all ships have been placed (so the start button can be enabled)
		const canGameStart = ()=> {
			const internalList = players[0].gameboard.shipList;
			const limit = Object.keys(internalList);
			const startBtn = document.querySelector('.game-start');
			for(let i in internalList){
				const count = internalList[1];
				if(count < +limit[i-1]){
					startBtn.disabled = true;
					return false;
				}
			};

			startBtn.disabled = false;
			return true
		};

		// check if all ships from a type have been deployed to disable previews through turning draggable off on ship
		const disableIfDeployed = e => {
			const ships = document.querySelectorAll('.ship');
			const counts = document.querySelectorAll('.ship-number');
			const limits = document.querySelectorAll('.ship-limit');
			const idx = e.dataTransfer.getData('index');
			
			if(counts[idx].textContent == limits[idx].textContent){
				ships[idx].draggable = false;
			}
		};
		

		// place drag and drop event listeners
		const boardCells = document.querySelectorAll('.p1-board .board-cell');
		let target;
		const dragLeave = e => {
			e.preventDefault();
			e.stopPropagation();
			clearPreview(e);
			if(![...boardCells].includes(e.relatedTarget)){
				hideCursorMsg();
			}
		};
		const dragEnter = e => {
			e.preventDefault();
			e.stopPropagation();
			preview(e);
		};
		const dragOver = e => {
			e.preventDefault();
			e.stopPropagation();
		};
		const dragDrop = e => {
			e.preventDefault();
			e.stopPropagation();
			clearPreview(e);
			hideCursorMsg();
			placeShipWithVerification(e);
			disableIfDeployed(e);
			canGameStart();
		};
		const p1Board = document.querySelector('.p1-board');
			p1Board.addEventListener('drop', dragDrop);
			p1Board.addEventListener('dragleave',dragLeave);
			p1Board.addEventListener('dragenter', dragEnter);
			p1Board.addEventListener('dragover', dragOver);

		//reset shipplacement when resetGame is clicked
		const resetBtn = document.querySelector('.reset-game');
		resetBtn.addEventListener('click', e => {
			resetPlayers();
			const shipNumbers = document.querySelectorAll('.ship-number');
			shipNumbers.forEach( number => number.textContent = '0');
			const ships = document.querySelectorAll('.ship');
			ships.forEach( ship => ship.draggable = true );
			const startBtn = document.querySelector('.game-start');
			startBtn.disabled = true;
		})

		//remove DnD events from board cells upon gameStart
		const startBtn = document.querySelector('.game-start');
		startBtn.disabled = true;
		startBtn.addEventListener('click' , ()=> {
			boardCells.forEach(	cell => {
				cell.removeEventListener('dragleave', dragLeave);
				cell.removeEventListener('dragEnter', dragEnter);
				cell.removeEventListener('dragover', dragOver);
				cell.removeEventListener('drop', dragDrop);
				let invisibleWall;
				for(let stylesheet of document.styleSheets[0].cssRules){
					if(stylesheet.selectorText === '.invisible-wall'){
						invisibleWall = stylesheet;
						break;
					}
				}
				invisibleWall.style.display = 'none';
			});
			manualWindow.style.display = 'none';
			randomizedPlaceShip(1);
		});
	};

	function randomizedPlaceShip(who){
		// randomized ship placement
		const internal = players[who].gameboard.board;
		// focus and length are fixed, randomize orientation and idx
		let shipLength = 1;
		let shipLimit = 4;
		let softLimit = shipLimit;
		const attempt = () => {
			const rngIdx = Math.floor(Math.random() * (internal.length));
			const rngOrientation = Math.round(Math.random());
			if(who === 1){
				const internalBoard = players[who].gameboard.board;
				const matrix = 8;
				const row = Math.floor(rngIdx / matrix);
				const column = Math.floor(rngIdx % matrix);

				//Check whether the adjacent indexes have ships
				if(shipLength < 4){
					if(rngOrientation === 0){
						if(typeof internalBoard[rngIdx-1] === 'object'
						|| typeof internalBoard[rngIdx+shipLength] === 'object') return false;

						for(let i = 0; i < shipLength; i++){
							if(typeof internalBoard[(rngIdx+matrix)+i] === 'object'
							|| typeof internalBoard[(rngIdx-matrix)+i] === 'object'
							) return false;
						}
					} else if (rngOrientation === 1){
						if(typeof internalBoard[rngIdx-matrix] === 'object'
						|| typeof internalBoard[rngIdx+(matrix*shipLength)] === 'object') return false;

						for(let i = 0; i < (matrix*shipLength); i+=matrix){
							if(typeof internalBoard[(rngIdx+i)+1] === 'object'
							|| typeof internalBoard[(rngIdx-i)-1] === 'object'
							) return false;
						}
					}
				}
			}

			return placeShip(who, shipLength, rngOrientation, rngIdx);
		};
		while(shipLength <= 4){
			untilTrue: while(!attempt()){
				continue untilTrue;
			};

			softLimit--;
			if(softLimit < 1){
				shipLength++;
				shipLimit--;
				softLimit = shipLimit;
			}
		};

		if(who === 1){
			const cpuCells = document.querySelectorAll('.cpu-board .board-cell');
			cpuCells.forEach( cell=> {cell.textContent = ''});
		}
	};

	function cpuAttack(){ //Attack players board using rng
		//debugger;
		const uiBoard = document.querySelectorAll('.p1-board .board-cell');
		const internalBoard = players[0].gameboard;
		let rng = Math.floor(Math.random() * internalBoard.board.length);
		while(internalBoard.attackedCells.includes(rng)){
			rng = Math.floor(Math.random() * internalBoard.board.length);
		};

		setTimeout( () => {
			if(internalBoard.receiveAttack(rng)){
				uiBoard[rng].textContent = 'o';
				uiBoard[rng].classList.add('hit-mark');
				titleMsg(1, 'hit');
				aboveBoardMsg(1, 'hit');
				aboveBoardMsg(0, 'getHit');
				if(internalBoard.wereShipsDestroyed()){
					gameOver(1);
				} else {
					cpuAttack();
				}
			} else {
				uiBoard[rng].textContent = 'x';
				uiBoard[rng].classList.add('miss-mark');
				titleMsg(1, 'miss');
				aboveBoardMsg(1, 'miss');
				aboveBoardMsg(0, 'evadeHit');
				switchTurns(0);
			}
		}, 3000);
	};

	function humanAttack(idx){ // Attack cpu board using cell index
		const internalBoard = players[1].gameboard;
		const uiBoard = document.querySelectorAll('.cpu-board .board-cell');
		if(!internalBoard.attackedCells.includes(idx)){
			if(internalBoard.receiveAttack(idx)){
				titleMsg(0, 'hit');
				aboveBoardMsg(0, 'hit');
				aboveBoardMsg(1, 'getHit');
				uiBoard[idx].textContent = 'o';
				uiBoard[idx].classList.add('hit-mark');
				if(internalBoard.wereShipsDestroyed()){
					gameOver(0);
				}
			} else {
				uiBoard[idx].textContent = 'x';
				uiBoard[idx].classList.add('miss-mark');
				titleMsg(0, 'miss');
				aboveBoardMsg(0, 'miss');
				aboveBoardMsg(1, 'evadeHit');
				switchTurns(1);
			}
		};

	};


	function listen(){
		//reveal middleWindow
		const platform = document.querySelector('.order-window');
		const p1Board = document.querySelector('.p1-board');
		let middleWindow;
		for(let stylesheet of document.styleSheets[0].cssRules){
			if(stylesheet.selectorText === '.order-window'){
				middleWindow = stylesheet;
			};
		};
		//middleWindow.style.top = `${p1Board.getBoundingClientRect().y - p1Board.parentElement.getBoundingClientRect().y}px`;
		middleWindow.style.display = 'flex';

		//put invisible Wall in the cpu Board before game start
		const invisibleWall = document.querySelector('.invisible-wall');
		const cpuBoard = document.querySelector('.cpu-board');
		const userSheet = document.styleSheets[0];
		let invisibleWallRule;
		for(let stylesheet of userSheet.cssRules){
			if(stylesheet.selectorText === '.invisible-wall'){
				invisibleWallRule = stylesheet;
				break;
			}
		};
		invisibleWallRule.style.width = `${cpuBoard.getBoundingClientRect().width}px`;
		invisibleWallRule.style.height = `${cpuBoard.getBoundingClientRect().height}px`;
		invisibleWallRule.style.left = `${cpuBoard.getBoundingClientRect().x}px`;
		invisibleWallRule.style.top = `${cpuBoard.getBoundingClientRect().y}px`;
		invisibleWallRule.style.display = 'block';

		// listen for placeShip choices in the orderWindow - manual or random
		const manualBtn = document.querySelector('.manual-ship-placement-btn');
		const randomBtn = document.querySelector('.random-ship-placement-btn');
		
		randomBtn.addEventListener('click', ()=> {
			randomizedPlaceShip(0);
			invisibleWallRule.style.display = 'none';
			randomizedPlaceShip(1);
			manualBtn.classList.add('hidden');
			randomBtn.classList.add('hidden');
		});

		manualBtn.addEventListener('click', manualPlaceShip)
		
		//listen for attacks
		const attackLoop = e => {
			const cells = document.querySelectorAll('.cpu-board .board-cell');
			const idx = Array.prototype.indexOf.call(cells, e.target);
			if(e.target.matches('.board-cell')){
				humanAttack(idx);
			};
		};
		cpuBoard.addEventListener('click', attackLoop);
	};

	function switchTurns(toWhom){
		const p1Board = document.querySelector('.p1-board');
		const cpuBoard = document.querySelector('.cpu-board');
		const invisibleWall = document.querySelector('.invisible-wall');
		const userSheet = document.styleSheets[0];
		let invisibleWallRule;
		for(let stylesheet of userSheet.cssRules){
			if(stylesheet.selectorText === '.invisible-wall'){
				invisibleWallRule = stylesheet;
				break;
			}
		};

		if(toWhom === 0){	
			p1Board.classList.add('inactive-player');
			cpuBoard.classList.remove('inactive-player');
			invisibleWallRule.style.display = 'none';
		} else if(toWhom === 1) {
			cpuBoard.classList.add('inactive-player');
			p1Board.classList.remove('inactive-player');
			invisibleWallRule.style.display = 'block';
			cpuAttack();
		}
	};

	function gameOver(winner){
		const endScreen = document.createElement('dialog');
		endScreen.className = 'game-over-screen';
		const wrapper = document.createElement('div');
		const endTitle = document.createElement('h2');
		const endSubtitle = document.createElement('h3');
		const newGameBtn = document.createElement('button');
		const winQuoteTitles = [
			"You won!",
			"Nice battle!",
			"Victory!",
			"They lost!",
		];
		const winQuoteSubtitles = [
			"They ate dust, even though they were in water!",
			"You got it! They're done!",
			"I saw their captain swimming back to their shores... It's over.",
			"Yeah! YEAH! You won!",
			"Those guys won't try this again!"
		];
		const loseQuoteTitles = [
			"Defeat!",
			"You lost!",
			"Try again?",
		];
		const loseQuoteSubtitles = [
			"Maybe they saw our plans... did they have a spy on us?!",
			"We're not done yet... Go get the spare ships, let's get back on them!",
			"This ain't over! Time for revenge?",
			"Now they're done it! We need to answer this!",
			"C'mon, we almost had them! Let's go again!"
		];
		const btnQuotes = [
			"retry",
			"restart",
			"regroup and attack again",
			"try again",
			"war cry and go again"
		];
		const rngQuotes = (el, arr) => {
			const rng = Math.floor(Math.random() * arr.length);
			el.textContent = arr[rng];
		};
		if(winner === 0){
			rngQuotes(endTitle, winQuoteTitles);
			rngQuotes(endSubtitle, winQuoteSubtitles);
		} else if(winner === 1){
			rngQuotes(endTitle, loseQuoteTitles);
			rngQuotes(endSubtitle, loseQuoteSubtitles);
		};
			rngQuotes(newGameBtn, btnQuotes);

		const restoreButtons = () => {
			const manualChoiceBtns = document.querySelectorAll('[class*=ship-placement-btn]');
			manualChoiceBtns.forEach( btn => btn.classList.remove('hidden') );
		};

		newGameBtn.addEventListener('click', () => {
			location.reload();
		});
		wrapper.append(endTitle, endSubtitle, newGameBtn);
		endScreen.append(wrapper);
		document.body.append(endScreen);
		endScreen.showModal();
		endScreen.classList.remove('game-over-screen');
	};

	function titleMsg(who, msg){
		const msgBoard = document.querySelector('.order-window > h3');

		let player;
		if(who === 0) player = 'Player '
		else if(who === 1) player = 'CPU ';
		else return msgBoard.textContent = msg;

		let msgArr;
		const rng = () => Math.floor(Math.random() * msgArr.length);
		if(msg === 'hit'){
			msgArr = [
				"hit the target!",
				"scored a direct hit!",
				"landed a solid shot!",
				"blew the target!",
				"hit that one home!",
				"reported a confirmed hit!",
				"is one shot closer!",
				"connceted on the target!"
			];
		}
		else if (msg === 'miss'){
			msgArr = [
				"missed the target!",
				"shot that one too wide!",
				"was off the mark!",
				"whiffed that one!",
				"didn't make contact!",
				"almost hit it, but didn't!",
				"shot a lot of... water.",
				"wasn't accurate this time!"
			];
		};

		return msgBoard.textContent = player + msgArr[rng()];
	};

	function aboveBoardMsg(focus, msg){
		//Btanch into either player or cpu board
		let msgBoard;
		if(focus === 0){
			msgBoard = document.querySelector('.player1-side h3');
		} else if (focus === 1){
			msgBoard = document.querySelector('.cpu-side h3');
		}

		// Branch into either hit, missHit, getHit or evadeHit
		let msgArr;
		const rng = () => Math.floor(Math.random() * msgArr.length);
		if(msg === 'hit' || msg === 'miss' || msg === 'getHit' || msg === 'evadeHit'){
			if(msg === 'hit'){
				msgArr = [
					`"We got em!"`,
					`"On the mark!"`,
					`"YES!"`,
					`"Put another one!"`,
					`"Almost missed!"`,
					`"Crushed them!"`,
					`"Them floaters are gone!"`,
					`"Pulverized them, hahaha"`,
					`"More! Do it again!"`,
					`"Hahahahaha"`
				];
			} else if(msg === 'miss'){
				msgArr = [
					`"Damn it, missed again!"`,
					`"Too wide, ****"`,
					`"Off target!"`,
					`"Shot went to hell!"`,
					`"Did it ricochet?"`,
					`"Where's our damn aim?!"`,
					`"Damn it!"`,
					`"Are we even trying?"`,
					`"What the...?!"`,
					`"How did we miss?!"`
				];
			} else if(msg === 'getHit'){
				msgArr = [
					`"Oof, they got us!"`,
					`"***! Brace up!"`,
					`"Close that damn hole!"`,
					`"We're not sinking yet!"`,
					`"Damn! Get back at them!"`,
					`"Get them! GET THEEEM!"`,
					`"You're gonna pay!"`,
					`"Make them pay for this!"`,
					`"Your time will come..."`,
					`"Son of a wench!"`,
					`"Patch that! Fix it NOW!"`,
					`"Repairers ready!"`,
					`"I'm gonna get ya, you blob!"`
				];
			} else if(msg === 'evadeHit'){
				msgArr = [
					`"Too slow, awipe!"`,
					`"You shoot like my grandma!"`,
					`"Missed me, dirtbag!"`,
					`"Swing and a miss, donkey!"`,
					`"Nice try, dimwit!"`,
					`"You aiming or dreaming?"`,
					`"Where were you looking at?"`,
					`"Hahahahahahahaha"`,
					`"You call that a shot?"`,
					`"Waste of ammo, amateur!"`,
					`"Let me show how it's done!"`,
					`"Try again, chump!"`,
					`"Shoot straighter, you dog!"`,
					`"Pathetic! You blind?"`
				];
			}
			return msgBoard.textContent = msgArr[rng()];
		} else {
			return msgBoard.textContent = msg;
		}
	};

	return {
		resetPlayers, 
		renderBoards,
		placeShip,	
		manualPlaceShip,
		randomizedPlaceShip,
		humanAttack,
		players,
		listen,
		switchTurns,
		gameOver,
		titleMsg,
		aboveBoardMsg,
	}
};

export {Ship, Gameboard, Player, UiManager};
