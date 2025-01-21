function numberify(y, x, xOy, plus = 0){
	if(xOy !== undefined){
		if(xOy === 0) x = x + plus;
		else if(xOy === 1) y = y + plus;
	};

	return +`${y}${x}`;
};

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
	
	const shipList = {
		4: 0,
		3: 0,
		2: 0,
		1: 0,
	};

	function hitMark(idx){
		 board[idx] = true;
	};

	function missMark(idx){
		board[idx] = false;
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
		for(let cell of board){
			if(typeof cell === 'object'){
				return false
			}
		}
		return true
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
	if(id === 0) type = 'real';
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

	function cleanBoards(...boards){
		for(let board of boards){
			const target = document.querySelectorAll(board + ' div');
			for(let cell of target){
				cell.textContent = '';
				if(cell.classList.contains('hit')){
					cell.classList.remove('hit');
				};
				if(cell.classList.contains('friendly-ship')){
					cell.classList.remove('friendly-ship');
				};
			};
		};
	};

	function resetPlayers(){
		const newPlayer = Player(0, 8),
					newCpu = Player(1, 8);
		players[0] = newPlayer;
		players[1] = newCpu;
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
		const matrix = Math.floor(Math.sqrt(players[focus].gameboard.board.length));
		const row = Math.floor(idx / matrix);
		const column = Math.floor(idx % matrix);
		// Orientation - 0 = horizontal, 1 = vertical
		// Check whether final index excedes board perimeter
		if(orientation === 0 && idx+(length-1) >= (matrix**2)) return false
		else if(orientation === 1 && idx+((length-1) * matrix) >= (matrix**2)) return false;
		//checking if theres not a ship in position already
		if(orientation === 0){
			for(let j = idx; j < idx+length; j++){
				if(typeof players[focus].gameboard.board[j] === 'object'){
					return false;
				}
			}
		} else if(orientation === 1){
			for(let j = idx; j < idx+matrix * length; j+=matrix){
				if(typeof players[focus].gameboard.board[j] === 'object'){
					return false
				}
			}
		};

		//Check whether the adjacent indexes have ships
		//horizontal check
		if(typeof players[focus].gameboard.board[idx-1] === 'object'
		|| typeof )

		if(orientation === 0 && column+(length-1) < matrix){
			players[focus].gameboard.placeShip(length, orientation, idx)
			for(let i = 0; i < length; i++){
				playerBoard[idx+i].textContent = length;
				if(focus === 0) {
					playerBoard[idx+i].classList.add('friendly-ship');// should move to focus check once testing cpu placeShips ends
				}
			}
			return true;
		}
		else if(orientation === 1 && row+(length-1) < matrix){
			players[focus].gameboard.placeShip(length, orientation, idx)
			for(let i = 0; i < matrix*length; i+=matrix){
				playerBoard[idx+i].textContent = length; // should move to focus check once testing cpu placeShips ends
				if(focus === 0){
					playerBoard[idx+i].classList.add('friendly-ship');
				}
			}
			return true;
		}
		else return false // booleans are for CPU placeShip randomized place where WHILE(placeShip(randomArgs) === false {placeShip(randomArgs)})
	};

	function cpuPlaceShip(){
		// randomized ship placement
		const internal = players[1].gameboard.board;
		// focus and length are fixed, randomize orientation and idx
		let shipLength = 1;
		let shipLimit = 4;
		let softLimit = shipLimit;
		const attempt = () => {
			const rngIdx = Math.floor(Math.random() * (internal.length));
			const rngOrientation = Math.round(Math.random());
			return placeShip(1, shipLength, rngOrientation, rngIdx);
		};
		let count = 1;
		while(shipLength <= 4){
			debugger; 
			untilTrue: while(!attempt()){
				count++;
				console.log(`count: ${count}`);
				continue untilTrue;
			};

			softLimit--;
			if(softLimit < 1){
				shipLength++;
				shipLimit--;
				softLimit = shipLimit;
			}
		};
	};

	function attack(who,idx){
		let board;
		if(who === 0) board = document.querySelectorAll('.p1-board .board-cell');
		else if (who === 1) board = document.querySelectorAll('.cpu-board .board-cell');
		const target = who[idx];
		if(target.textContent === 'S'){
			target.textContent = 'X';
			target.classList.add('hit');
		}
	};

	function orderShip(targetEl){
		const modal = document.querySelector('.order-window');
		const rect = targetEl.getBoundingClientRect();
		const stylesheet = document.styleSheets[0].cssRules;
		const matrix = Math.sqrt(players[0].gameboard.board.length);
		const confirmBtn = document.querySelector('.order-confirm');
		const cancelBtn = document.querySelector('.order-cancel');
		const idxFinder = Array.prototype.indexOf.call(document.querySelectorAll('.p1-board .board-cell'), targetEl);

		for(let rule of stylesheet){
			if(rule.selectorText === '.order-window'){
				rule.style.left = `${rect.x + (rect.width*1)}px`;
				rule.style.top = `${rect.y + (rect.height *0.2)}px`;
				break;
			}
		}

		confirmBtn.addEventListener('click', ()=> {
		const lengthValue = document.querySelector('.length-btn').value;
		const orientationValue = document.querySelector('.orientation-btn').value;
			console.log(+lengthValue, +orientationValue, idxFinder);
			//debugger;
			placeShip(0,+lengthValue,+orientationValue, idxFinder);
			modal.close();
		});

		cancelBtn.addEventListener('click', ()=> modal.close());

		modal.showModal();
	};

	function listen(){
		const platform = document.querySelector('.order-window');
		const refBoard = document.querySelector('.p1-board');
		let rule;
		for(let stylesheet of document.styleSheets[0].cssRules){
			if(stylesheet.selectorText === '.order-window'){
				rule = stylesheet;
			};
		};
		rule.style.top = `${refBoard.getBoundingClientRect().y - refBoard.parentElement.getBoundingClientRect().y}px`;
		rule.style.display = 'flex';
	}

	return {
		cleanBoards, 
		resetPlayers,
		renderBoards,
		orderShip,	
		placeShip,	
		cpuPlaceShip,
		attack,
		players,
		listen,
	}
};

export {Ship, Gameboard, Player, UiManager, numberify};
