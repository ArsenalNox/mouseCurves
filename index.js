/** (>.>) */

var canvases = []; //Массив с канвасами
var maxPoints = 50; //Максимальное количество точек эффекта
var debug = true
var timeOutTimer //Таймер, ограничивающий создание новых точек
var newPointAdditionAllowed = true;
var offsetLines = 20; //Кол-во линий в <>
var offValueMax = 30; //Максимальное значение сдвига

/** Класс содержателя информации под канвас */
class cdata {
	constructor(id, curveType) {
		this.id = id;
		this.context = document.getElementById(id).getContext('2d');
		this.width = document.getElementById(id).width;
		this.height = document.getElementById(id).height;

		this.type = curveType;
		this.isMouseInside = false;

		this.points = [];
		this.maxPoints = maxPoints;

		this.lines = [];
	}
}

// Секция функций

function randomNumber(a, b) {
	return (Math.random() * (b - a) + a)
}

/**
 * Инициализирует новый канвас и записывает его в newCanvas
 * @param (curveType) string Тип эффекта
 * @param (canvas) strign Id канваса
 * */
function createNewCanvas(curveType, canvas) {
	var newCanvas = new cdata(canvas, curveType);
	document.getElementById(canvas).addEventListener('mouseenter', () => {
		newCanvas.isMouseInside = true;
		if (debug) {
			console.log('Entered canvas ' + canvas);
		}
	});
	document.getElementById(canvas).addEventListener('mouseout', () => {
		newCanvas.isMouseInside = false;
		if (debug) {
			console.log('Exited canvas ' + canvas);
		}
	})

	canvases.push(newCanvas)
}

/** Расчитывает позицию мыши внутри данного канваса */
function calculateMousePosition(e) {
	//Определяем, внутри какого канваса находимся
	for (let i = 0; i < canvases.length; i++) {
		if (canvases[i].isMouseInside) {
			let canvas = document.getElementById(canvases[i].id);
			let rect = canvas.getBoundingClientRect();
			let mousePos = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top
			};
			canvases[i].points.push(mousePos)
			if (canvases[i].points.length > maxPoints) {
				canvases[i].points.shift()
			} else {
				if (debug) {
					console.log(canvases[i].points.length)
				}
			}
		}
	}
}

/** Отрисовывает все эффекты*/
function draw() {
	for (let i = 0; i < canvases.length; i++) {

		let lastPoint = 0 //Последняя точка
		let canvas = canvases[i] //Текущий канвас
		let ctx = canvases[i].context;
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		switch (canvas.type) { //Выбор соответсвующей анимации

				/** Отрисовывает кубическую кривую с одной контрольной точкой */
			case 'c-lines-slightly-curved':
				for (let j = 0; j < canvas.points.length; j++) {
					let point = canvas.points[j]
					if (lastPoint === 0) {
						lastPoint = point + point * (randomNumber(0.9, 1.1));
						continue;
					}
					ctx.beginPath();
					ctx.moveTo(lastPoint.x, lastPoint.y);
					if (point?.cpx && point?.cpy) {
						ctx.quadraticCurveTo(lastPoint.x + point.cpx, lastPoint.y + point.cpy, point.x, point.y);
					} else {
						point.cpx = randomNumber(-20, 20);
						point.cpy = randomNumber(-20, 20);
						ctx.quadraticCurveTo(lastPoint.x + point.cpx, lastPoint.y + point.cpy, point.x, point.y);
					}
					ctx.stroke();
					lastPoint = point;
				}
				break;

				/** Две контрольные точки */
			case 'c-beizer-curve': for (let j = 0; j < canvas.points.length; j++) {
					let point = canvas.points[j]
					if (lastPoint === 0) {
						lastPoint = point + point * (randomNumber(0.9, 1.1));
						continue;
					}
					ctx.beginPath();
					ctx.moveTo(lastPoint.x, lastPoint.y);
					if (point?.cp1x && point?.cp1y && point?.cp2x && point?.cp2y) {
						ctx.bezierCurveTo(lastPoint.x + point.cp1x, lastPoint.y + point.cp1y, point.x + point.cp2x, point.y + point.cp2y, point.x, point.y);
					} else {
						point.cp1x = randomNumber(-20, 20);
						point.cp1y = randomNumber(-20, 20);
						point.cp2x = randomNumber(-20, 20);
						point.cp2y = randomNumber(-20, 20);
						ctx.quadraticCurveTo(lastPoint.x + point.cp1x, lastPoint.y + point.cp1y, point.x + point.cp2x, point.y + point.cp2y, point.x, point.y);
					}
					ctx.stroke();
					lastPoint = point;
				}
				break;

			case 'c-straight-lines-multiple': for (let j = 0; j < canvas.points.length; j++) {
					let point = canvas.points[j];
					if (lastPoint === 0) {
						lastPoint = point + point * (randomNumber(0.9, 1.1));
						continue;
					}
					if (!(point?.ofl)) { //Если отсутсвует свойство
						point.ofl = [];
						for (let j = 0; j < offsetLines; j++) {
							point.ofl.push({
								x: randomNumber(-offValueMax, offValueMax) * randomNumber(0.3, 1.7),
								y: randomNumber(-offValueMax, offValueMax) * randomNumber(0.3, 1.7)
							});
						}
					}
					for (let j = 0; j < point.ofl.length; j++) {
						ctx.beginPath();
						ctx.moveTo(lastPoint.x + point.ofl[j].x, lastPoint.y + point.ofl[j].y);
						ctx.lineTo(point.x + point.ofl[j].x, point.y + point.ofl[j].y);
						ctx.stroke();
					}

					lastPoint = point;
				}
				break;

			case 'c-straight-lines-multiple-shift-x': for (let j = 0; j < canvas.points.length; j++) {
					let point = canvas.points[j];
					if (lastPoint === 0) {
						lastPoint = point + point * (randomNumber(0.9, 1.1));
						continue;
					}
					if (!(point?.ofl)) {
						point.ofl = [];
						for (let j = 0; j < offsetLines; j++) {
							point.ofl.push({
								x: randomNumber(-offValueMax, offValueMax) * randomNumber(0.3, 1.7),
								y: randomNumber(-offValueMax, offValueMax) * randomNumber(0.3, 1.7)
							});
						}
					}
					for (let j = 0; j < point.ofl.length; j++) {
						ctx.beginPath();
						ctx.moveTo(lastPoint.x + point.ofl[j].x, lastPoint.y + point.ofl[j].y);
						ctx.lineTo(point.x + point.ofl[j].x, point.y + point.ofl[j].y);
						ctx.stroke();
						point.ofl[j].x = point.ofl[j].x * 1.05;
					}

					lastPoint = point;
				}
				break;

			case 'c-straight-lines-multiple-shift-y': for (let j = 0; j < canvas.points.length; j++) {
					let point = canvas.points[j];
					if (lastPoint === 0) {
						lastPoint = point + point * (randomNumber(0.9, 1.1));
						continue;
					}
					if (!(point?.ofl)) {
						point.ofl = [];
						for (let j = 0; j < offsetLines; j++) {
							point.ofl.push({
								x: randomNumber(-offValueMax, offValueMax) * randomNumber(0.3, 1.7),
								y: randomNumber(-offValueMax, offValueMax) * randomNumber(0.3, 1.7)
							});
						}
					}
					for (let j = 0; j < point.ofl.length; j++) {
						ctx.beginPath();
						ctx.moveTo(lastPoint.x + point.ofl[j].x, lastPoint.y + point.ofl[j].y);
						ctx.lineTo(point.x + point.ofl[j].x, point.y + point.ofl[j].y);
						ctx.stroke();
						point.ofl[j].y = point.ofl[j].y * 1.1;
					}

					lastPoint = point;
				}
				break;

			case 'c-straight-lines-multiple-shift-x-y': for (let j = 0; j < canvas.points.length; j++) {
					let point = canvas.points[j];
					if (lastPoint === 0) {
						lastPoint = point + point * (randomNumber(0.9, 1.1));
						continue;
					}
					if (!(point?.ofl)) {
						point.ofl = [];
						for (let j = 0; j < offsetLines; j++) {
							point.ofl.push({
								x: randomNumber(-offValueMax, offValueMax) * randomNumber(0.3, 1.7),
								y: randomNumber(-offValueMax, offValueMax) * randomNumber(0.3, 1.7)
							});
						}
					}
					for (let j = 0; j < point.ofl.length; j++) {
						ctx.beginPath();
						ctx.moveTo(lastPoint.x + point.ofl[j].x, lastPoint.y + point.ofl[j].y);
						ctx.lineTo(point.x + point.ofl[j].x, point.y + point.ofl[j].y);
						ctx.stroke();
						point.ofl[j].x = point.ofl[j].x * 1.05;
						point.ofl[j].y = point.ofl[j].y * 1.05;
					}

					lastPoint = point;
				}
				break;
				
				case 'c-straight-lines-inverse-snake': for (let j = 0; j < canvas.points.length; j++) {
					let point = canvas.points[j];
					if (lastPoint === 0) {
						lastPoint = point + point * (randomNumber(0.9, 1.1));
						continue;
					}
					if (!(point?.ofl)) {
						point.ofl = [];
						for (let j = 0; j < offsetLines; j++) {
							point.ofl.push({
								x: randomNumber(-offValueMax, offValueMax) * randomNumber(0.3, 1.7),
								y: randomNumber(-offValueMax, offValueMax) * randomNumber(0.3, 1.7)
							});
						}
					}
					for (let j = 0; j < point.ofl.length; j++) {
						ctx.beginPath();
						ctx.moveTo(lastPoint.x + point.ofl[j].x, lastPoint.y + point.ofl[j].y);
						ctx.lineTo(point.x + point.ofl[j].x, point.y + point.ofl[j].y);
						ctx.stroke();
						point.ofl[j].x = point.ofl[j].x * 0.95;
						point.ofl[j].y = point.ofl[j].y * 0.95;
					}
					lastPoint = point;
				}
				break;
		}
	}
	window.requestAnimationFrame(draw)
}

// Конец определения функций

//Выбор всех подходящих канвасов
var canvasClassSelector = document.getElementsByClassName('c-canvas');
for (let i = 0; i < canvasClassSelector.length; i++) {
	console.log(canvasClassSelector[i])
	createNewCanvas(canvasClassSelector[i].id, canvasClassSelector[i].id)
}

//Таймаут после каждого движения мышкой для определения след. точки

document.addEventListener('mousemove', calculateMousePosition);
window.requestAnimationFrame(draw);
