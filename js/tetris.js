(function () {
	var board = [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	];
	var fieldWidth = 10;
	var fieldHeight = 22;
	var xoff = 8;
	var yoff = 8;
	var xsize = 15;
	var ysize = 15;
	var gapsize = 2;
	var bordersize = 2;
	// white, red, green, blue, purple, yellow, orange, cyan
	// None,  Z,   S,     J,    T,      O,      L,      I
	var colors = ["#AAA", "#F00", "#0F0", "#22F", "#F0F", "#FF0", "#F70", "#0EE"];
	var paused = false;
	// coordinate systems follow convention starting at top-left.
	// order is that of clockwise rotation.
	// row-major layout.
	// currently using SRS rotation; I am not satisfied with
	// the S, Z, I having 4 states when they only need two,
	// but I would need to have them rotate on an axis that changes
	// location depending on orientation and cw vs ccw rotation.
	// all possible cases
	var tetromino_Z = [[[1,1],[0,1,1]],[[0,0,1],[0,1,1],[0,1]],[[],[1,1],[0,1,1]],[[0,1],[1,1],[1]]];
	var tetromino_S = [[[0,2,2],[2,2]],[[0,2],[0,2,2],[0,0,2]],[[],[0,2,2],[2,2]],[[2],[2,2],[0,2]]];
	var tetromino_J = [[[3],[3,3,3]],[[0,3,3],[0,3],[0,3]],[[],[3,3,3],[0,0,3]],[[0,3],[0,3],[3,3]]];
	var tetromino_T = [[[0,4],[4,4,4]],[[0,4],[0,4,4],[0,4]],[[],[4,4,4],[0,4]],[[0,4],[4,4],[0,4]]];
	var tetromino_O = [[[5,5],[5,5]]];
	var tetromino_L = [[[0,0,6],[6,6,6]],[[0,6],[0,6],[0,6,6]],[[],[6,6,6],[6]],[[6,6],[0,6],[0,6]]];
	var tetromino_I = [[[],[7,7,7,7]],[[0,0,7],[0,0,7],[0,0,7],[0,0,7]],[[],[],[7,7,7,7]],[[0,7],[0,7],[0,7],[0,7]]];
	var tetrominos = [tetromino_Z,tetromino_S,tetromino_J,tetromino_T,tetromino_O,tetromino_L,tetromino_I];
	// this is for the rotation animation -- must know where in local
	// grid did the piece rotate around
	// each coordinate is a triple, the first two are x,y, and
	// the last is to indicate whether the point is in the center
	// of the block or in the corner to the bottom right between
	// blocks. These are the points which may be rotated around
	// to retain block alignment, if that makes any sense.
	var tet_center_rot = [[1,1,true],[1,1,true],[1,1,true],[1,1,true],[0,0,false],[1,1,true],[1,1,false]];
	var pieceX=3;
	var pieceY=0;
	var curPiece=0;
	var curRotation=0;
	var generator = random_perm_single();
	var freezeInteraction = false;
	// left, right
	var shiftorders = [
		[0,0], // initial
		[-1,0],[-1,1],[-1,-1],[0,-1], // col 1 block left; directly above
		[-1,2],[-1,-2], // col 1 block left, two away vertically
		[-2,0],[-2,1],[-2,-1],[-2,2],[-2,-2], // col 2 blocks left
		[0,-2], // directly above, two spaces

	//	[0,2], // directly below, two spaces (can cause tunnelling perhaps? one space below certainly is not needed)
	//	[-3,0],[-3,1],[-3,-1],[-3,2],[-3,-2], // col 3 blocks left -- this may be getting cheap
		[1,0],[1,1],[1,-1],[2,0],[2,1],[2,-1],[1,2],[1,-2] // move left for wall kicking
	];
	var shiftright = 0; // 0 = left, 1 = right
	var pausedBecauseLostFocus = false;
	var score = 0;
	var shadowY = 0;
	var animPositionX=3;
	var animPositionY=0;
	var animRotation=0;
	var buttonList = [[37],[39],[40],[38],[80],[32, 13],[27,8]];
	var autoMoveDownInterval;
	var animationUpdateInterval;
	var hardDropTimeout;
	var gameOvered = false;

	var moves = [
		// left
		function () {
			if (freezeInteraction || paused)
				return;
			pieceX -= 1;
			if (isPieceInside())
				pieceX += 1;
			shiftright = 0;
			updateShadow();
		},
		// right
		function () {
			if (freezeInteraction || paused)
				return; pieceX += 1;
			if (isPieceInside())
				pieceX -= 1;
			shiftright = 1;
			updateShadow();
		},
		// down key calls this -- moves stuff down, if at bottom, locks it
		function () {
			if (freezeInteraction || paused)
				return;
			pieceY += 1;
			if (isPieceInside()) {
				pieceY -= 1;
				fixPiece();
			}
		},
		// rotate clockwise
		function () {
			if (freezeInteraction || paused)
				return;
			var oldrot = curRotation;
			curRotation = (curRotation+1)%(tetrominos[curPiece].length);
			if (kick())
				curRotation = oldrot;
			else
				animRotation = -Math.PI/2.0;
			updateShadow();
		},
		// pause
		function () {
			if (paused)
				unPause();
			else
				setPause(false);
		},
		// hard drop
		function () {
			if (gameOvered) {
				gameOvered = false;

				fixPiece();

				score = 0;
				board = [];

				for (var i = 0; i < fieldWidth * fieldHeight; ++i)
					board[i] = 0;

				applyScore(score);
				next();
				unPause();
				drawBoard(board,document.getElementById('board_canvas').getContext('2d'));
			}
			else if (!freezeInteraction && !paused) {
				var curY;
				var traversed = 0;
				while(!isPieceInside()) {
					curY = pieceY;
					pieceY++;
					traversed++;
				}
				pieceY = curY;
				dropPiece();
				applyScore(traversed);
			}
		},
		// exit
		function () {
			history.back();
		},
		// timer based down
		function () {
			if (freezeInteraction || paused)
				return;
			pieceY += 1;
			if (isPieceInside()) {
				pieceY -= 1;
				setTimeout(fixPiece, 10);
			}
		}
	];

	function random_perm_7() {
		var arr = [0,1,2,3,4,5,6];
		return function () {
			var i;
			for(i=6;i>0;i--) {
				var j = ~~(Math.random() * 99999) % (i + 1);
				var tmp = arr[j];
				arr[j] = arr[i];
				arr[i] = tmp;
			}
			return arr;
		};
	}
	function random_perm_single() {
		var gen = random_perm_7();
		var curPerm = gen(); // i dont like this unnecessary duplicating of state
		var which = -1;
		return function () {
			which += 1;
		if (which >= 7) { curPerm = gen(); which = 0;}
		return curPerm[which];
		};
	}
	function drawBox(position, value, context) {
		var i = position % fieldWidth;
		var j = (position-i) / fieldWidth;
		drawBox2(i,j,value,context);
	}
	function drawBox2(posX,posY,value,context) {
		context.fillStyle = colors[value];
		context.fillRect(xoff + posX*(xsize+gapsize), yoff+posY*(ysize+gapsize),xsize,ysize);
	}
	function drawBoard(boardArr, context) {
		var i;
		context.fillStyle = "#000";
		context.fillRect(0,0,xoff*2 + xsize*fieldWidth + gapsize*(fieldWidth - 1),yoff*2+ysize*fieldHeight+gapsize*(fieldHeight - 1));
		context.clearRect(xoff-bordersize,yoff-bordersize,(xsize+gapsize)*fieldWidth-gapsize+bordersize*2,(ysize+gapsize)*fieldHeight-gapsize+bordersize*2);
		context.strokeRect(xoff-0.5,yoff-0.5,(xsize+gapsize)*fieldWidth-gapsize+1,(ysize+gapsize)*fieldHeight-gapsize+1);
		context.fillStyle = "#888";
		context.fillRect(xoff,yoff,(xsize+gapsize)*fieldWidth-gapsize,(ysize+gapsize)*fieldHeight-gapsize);
		for(i=0;i<fieldHeight * fieldWidth;i++){
			drawBox(i,boardArr[i],context);
		}
	}
	function updateSizing() {
		xsize = ysize = Math.floor((window.innerHeight - yoff*2 - fieldHeight*gapsize) / fieldHeight);

		var bc = document.getElementById('board_canvas');
		var ac = document.getElementById('animated_canvas');
		var sc = document.getElementById('shadow_canvas');
		var score_el = document.getElementById('scoreHolder');

		bc.width = ac.width = sc.width = (xoff*2 + xsize*fieldWidth + gapsize*(fieldWidth - 1));
		bc.height = ac.height = sc.height = (yoff*2 + ysize*fieldHeight + gapsize*(fieldHeight - 1));
		var positionFromLeft = Math.floor((window.innerWidth - (20 + xsize + gapsize) * fieldWidth) / 2);
		bc.style.left = ac.style.left = sc.style.left = positionFromLeft + "px";

		score_el.style.left = positionFromLeft + bc.width + 20 + "px";

		var ctx1 = document.getElementById('board_canvas').getContext('2d');
		drawBoard(board,ctx1);
		updatePiece();
		updateShadow();
		if (paused)
			drawMessage('PAUSED');
	}
	function clearRowCheck(startrow, numrowsdown) {
		var numRowsCleared = 0;
		for (var i=0; i<numrowsdown; i++) {
			var full = true;
			for (var j=0; j<fieldWidth; j++)
				if (!board[(startrow+i)*fieldWidth+j]) {
					full = false;
					break;
				}

			if (full) {
				numRowsCleared++;
				shiftDown(startrow+i);
				var ctx1 = document.getElementById('board_canvas').getContext('2d');
				drawBoard(board,ctx1);
			}
		}
		if (numRowsCleared == 1) {applyScore(100);}
		else if (numRowsCleared == 2) {applyScore(200);}
		else if (numRowsCleared == 3) {applyScore(400);}
		else if (numRowsCleared == 4) {applyScore(1000);}
	}
	function shiftDown(row) {
		for(var i=row*fieldWidth-1;i>=0;i--) {
			board[i+fieldWidth] = board[i];
		}
		for(i=0;i<fieldWidth;i++) {
			board[i]=0;
		}
	}
	function moveDownIntervalFunc () {
		moves[7]();
		updatePiece();
	}
	function animationUpdateIntervalFunc() {
			// move animPositions closer to their targets (piece positions)
			animPositionX += (pieceX - animPositionX)*0.3;
			animPositionY += (pieceY - animPositionY)*0.3;
		// move animRotation closer to zero
		animRotation -= animRotation * 0.3;
			updatePiece();
	}
	function setPause(isendgame) {
		if (paused) return;
		clearInterval(autoMoveDownInterval);
		clearInterval(animationUpdateInterval);
		if (!isendgame)
			drawMessage('PAUSED');

		paused = true;
		pausedBecauseLostFocus = false; // default this to false
	}
	function unPause() {
		if (!paused) return;

		autoMoveDownInterval = setInterval(moveDownIntervalFunc,300);
		animationUpdateInterval = setInterval(animationUpdateIntervalFunc,16);

		paused = false;
		pausedBecauseLostFocus = false; // default this to false
		document.title = "Tetris!";
	}
	function drawMessage(messageString) {
		var canvas = document.getElementById("animated_canvas");
		var ctx = canvas.getContext('2d');

		ctx.fillStyle = "#101010";
		ctx.font = ~~(xsize * 1.8) + "px OpenSans-Semibold";
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(messageString, canvas.width / 2, canvas.height / 2);
	}
	function gameOver() {
		drawMessage("Game Over");
		setPause(true);
		gameOvered = true;
	}
	function next() {
		pieceX = 3;
		pieceY = 0;
		animPositionX = pieceX;
		animPositionY = pieceY;
		curRotation = 0;
		curPiece = generator();
		if (kick()) {
			gameOver();
		}
		updateShadow();
	}
	function fixPiece() {
		var tetk = tetrominos[curPiece][curRotation];
		for (var j=0;j<tetk.length;j++) {
			var tetkj = tetk[j];
			for (var i=0;i<tetkj.length;i++) {
				var tetkji = tetkj[i];
				var pxi = pieceX+i;
				var pyj = pieceY+j;
				if (tetkji) {
					board[pyj*fieldWidth+pxi] = tetkji;
				}
			}
		}
		drawBoard(board,document.getElementById('board_canvas').getContext('2d'));
		// will hardcode this behavior for now
		clearRowCheck(pieceY, tetrominos[curPiece][curRotation].length);
		next();
	}
	function isPieceInside() {
		var i,j;
		var tetk = tetrominos[curPiece][curRotation];
		for (j=0;j<tetk.length;j++) {
		var tetkj = tetk[j];
		for (i=0;i<tetkj.length;i++) {
			var tetkji = tetkj[i];
			var pxi = pieceX+i;
			var pyj = pieceY+j;
			if (tetkji && (pxi < 0 || pyj < 0 || pxi > (fieldWidth - 1) || pyj > (fieldHeight - 1))) {
				return 1;
			}
			if (tetkji && board[pyj*fieldWidth+pxi]) {
				return 2;
			}
		}
		}
		return 0;
	}
	function dropPiece () {
		clearTimeout(hardDropTimeout);
		freezeInteraction = true;
		hardDropTimeout = setTimeout(function () {freezeInteraction = false; fixPiece();},100);
	}
	// rotation nudge. Attempts to shift piece into a space that fits nearby, if necessary.
	// if such a position is found, it will be moved there.
	function kick() {
		var i;
		// modify this array to change the order in which shifts are tested. To favor burying pieces into gaps below,
		// place negative y offset entries closer to the front.

		var oldpos = [pieceX,pieceY]; // for simplicity I reuse methods that actually modify piece position.
		for (i=0;i<shiftorders.length;i++) {
			pieceX = oldpos[0]; pieceY = oldpos[1]; // restore position
		if (shiftright) pieceX -= shiftorders[i][0];
		else pieceX += shiftorders[i][0];
		pieceY += shiftorders[i][1];
		if (!isPieceInside())
			return 0;
		}
		pieceX = oldpos[0]; pieceY = oldpos[1]; // restore position
		return 1; // return failure
	}
	function updatePiece() {
		var ctx = document.getElementById('animated_canvas').getContext('2d');
		drawPiece(ctx);
	}
	// Does not need to be called every frame like updatePiece is.
	// will be called from left and right moves, also
	function updateShadow() {
		var ctx = document.getElementById('shadow_canvas').getContext('2d');
		drawShadow(ctx);
	}
	function keydownfunc(e) {
		var keynum;
		if (!(e.which)) keynum = e.keyCode;
		else if (e.which) keynum = e.which;
		else return;

		for (var i=0; i<buttonList.length; i++) {
			for (var j=0; j<buttonList[i].length; j++) {
				if (keynum == buttonList[i][j])
					moves[i]();
			}
		}
	}
	function drawPiece(context) {
		var i,j;
		// drawing using geometry of current rotation
		var tetk = tetrominos[curPiece][curRotation];
		// translating (canvas origin) to the center,
		// rotating there, then drawing the boxes
		context.clearRect(0,0,xoff*2 + xsize*fieldWidth + gapsize*(fieldWidth - 1),yoff*2+ysize*fieldHeight+gapsize*(fieldHeight - 1));

		context.save();
		context.fillStyle = colors[curPiece+1];
		var centerX = tet_center_rot[curPiece][0]*(xsize+gapsize)+xsize/2+(!tet_center_rot[curPiece][2])*(xsize/2+gapsize);
		var centerY = tet_center_rot[curPiece][1]*(ysize+gapsize)+ysize/2+(!tet_center_rot[curPiece][2])*(ysize/2+gapsize);

		context.translate(xoff + animPositionX*(xsize+gapsize) + centerX,yoff + animPositionY*(ysize+gapsize) + centerY);
		context.rotate(animRotation);
		context.translate(-centerX,-centerY);

		// now in rotated coordinates, zeroed at piece origin
		for (j=0;j<tetk.length;j++) {
		var tetkj = tetk[j];
		for (i=0;i<tetkj.length;i++) {
			var tetkji = tetkj[i];
			if (tetkji) {
			context.fillRect(i*(xsize+gapsize),j*(ysize+gapsize),xsize,ysize);
			}
		}
		}
		context.restore();
	}
	function drawShadow(context) {
		var curY;
		var count = 0;
		var origY = pieceY;
		while(!isPieceInside()) {
			curY = pieceY;
			pieceY++;
		count++;
		} // This is a little bad --
		// I am modifying critical program state
		// when it is not necessary.
		// This is done to increase code reuse
		pieceY = origY;
		shadowY = curY;
		if (!count) return;
		drawShadowPieceAt(context,pieceX,curY);
	}
	function drawShadowPieceAt(context, gridX, gridY) {
		var tetk = tetrominos[curPiece][curRotation];
		context.clearRect(0,0,xoff*2 + xsize*fieldWidth + gapsize*(fieldWidth - 1),yoff*2+ysize*fieldHeight+gapsize*(fieldHeight - 1));
		context.save();
		context.fillStyle = "#999";
		context.translate(xoff+gridX*(xsize+gapsize),yoff+gridY*(ysize+gapsize));
		for (var j=0;j<tetk.length;j++) {
			var tetkj = tetk[j];
			for (var i=0;i<tetkj.length;i++) {
				var tetkji = tetkj[i];
				if (tetkji) {
					context.fillRect(i*(xsize+gapsize),j*(ysize+gapsize),xsize,ysize);
				}
			}
		}
		context.restore();
	}
	function applyScore(amount) {
		var maxScore = localStorage.getItem('tetris:maxScore');
		score += amount;
		if (score > maxScore) {
			localStorage.setItem('tetris:maxScore', score);
			maxScore = score;
		}
		document.getElementById('maxScore').innerHTML = '' + maxScore;
		document.getElementById('score').innerHTML = '' + score;
	}
	function flatten(obj, levels) {
	if (levels === 0) return '';
	var empty = true;
	var str, i;
	if (obj instanceof Array) {
		str = '[';
		empty = true;
		for (i=0;i<obj.length;i++) {
			empty = false;
			str += flatten(obj[i],levels-1)+', ';
		}
		return (empty?str:str.slice(0,-2))+']';
	} else if (obj instanceof Object) {
		str = '{';
		for (i in obj) {
			empty = false;
			str += i+'->'+flatten(obj[i],levels-1)+', ';
		}
		return (empty?str:str.slice(0,-2))+'}';
	} else {
		return obj; // not an obj, don't stringify me
	}
}

	document.onkeydown = keydownfunc;
	window.onload = function() {
		next();
		applyScore(0); // to init
		setPause(false);
		unPause();

		updateSizing();
	};
})();