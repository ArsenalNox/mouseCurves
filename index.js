/** (>.>) */
var skipAmount = 2;
var skipInteval = 2;
var canvases = []; //Массив с канвасами
var maxPoints = 50; //Максимальное количество точек эффекта
var debug = true
var timeOutTimer //Таймер, ограничивающий создание новых точек
var newPointAdditionAllowed = true;
var offsetLines = 20; //Кол-во линий в <>
var offValueMax = 30; //Максимальное значение сдвига
var smoothOffValue = 0.5; //Сдвиг для 
var smoothLines = 5; //Кол-во линий 


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
	});
	document.getElementById(canvas).addEventListener('mouseout', () => {
		newCanvas.isMouseInside = false;
	})

	canvases.push(newCanvas)
}

/** Расчитывает позицию мыши внутри данного канваса */
function calculateMousePosition(e) {
	//Определяем, внутри какого канваса находимся
    let skipAmount = 2;
    let skipInteval = 2;
	for (let i = 0; i < canvases.length; i++) {
		if (canvases[i].isMouseInside) {
            
            if(canvas[i].type == 'c-smooth-lines-multiple'){
                
            }
			let canvas = document.getElementById(canvases[i].id);
			let rect = canvas.getBoundingClientRect();
			let mousePos = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top
			};
			canvases[i].points.push(mousePos)
			if (canvases[i].points.length > maxPoints) {
				canvases[i].points.shift()
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
			case 'c-lines-slightly-curved': // c_1
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
			case 'c-beizer-curve': //c_2
                for (let j = 0; j < canvas.points.length; j++) {
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

			case 'c-straight-lines-multiple': //c_3
                for (let j = 0; j < canvas.points.length; j++) {
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

			case 'c-straight-lines-multiple-shift-x': //c_4
                for (let j = 0; j < canvas.points.length; j++) {
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

			case 'c-straight-lines-multiple-shift-y': //c_5
                for (let j = 0; j < canvas.points.length; j++) {
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

			case 'c-straight-lines-multiple-shift-x-y': //c_6
                for (let j = 0; j < canvas.points.length; j++) {
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
                        ctx.fillRect(point.x + point.ofl[j].x, point.y + point.ofl[j].y, 1 ,1)
						ctx.stroke();
						point.ofl[j].x = point.ofl[j].x * 1.05;
						point.ofl[j].y = point.ofl[j].y * 1.05;
					}
					lastPoint = point;
				}
				break;
				
				case 'c-straight-lines-inverse-snake': //c_7
                for (let j = 0; j < canvas.points.length; j++) {
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
							}); } } for (let j = 0; j < point.ofl.length; j++) {
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
                
                case 'c-smooth-lines-multiple': //c_8
                for (let j = 0; j < canvas.points.length; j++) {
                    let point = canvas.points[j];
					if (lastPoint === 0) {
						lastPoint = point;
						continue;
					}

                    if(Math.sqrt( Math.pow(point.x - lastPoint.x,2) + Math.pow(point.y - lastPoint.y, 2)) < 20){
                        if(!(point?.cpl)){
                            point.cpl = [];
                            let commonCp = {
							    	x: randomNumber(-1, 1),
							    	y: randomNumber(-1, 1)
							    }
                            for (let j = 0; j < smoothLines; j++) {  
                                point.cpl.push({ 
                                    x: commonCp.x,
                                    y: commonCp.y
                                });
						    }
                        }
                    }else{
                        if (!(point?.cpl)) {
						    point.cpl = [];
                            let commonCp = {
							    	x: randomNumber(-smoothOffValue, smoothOffValue),
							    	y: randomNumber(-smoothOffValue, smoothOffValue)
							    }
                            for (let j = -1; j < smoothLines; j++) {  
                                point.cpl.push({ 
                                    x: commonCp.x+(Math.sign(commonCp.x)*j*9),
                                    y: commonCp.y+(Math.sign(commonCp.y)*j*9)
                                });
						    }
					    }
                    }
					
					for (let j = 0; j < point.cpl.length; j++) {
						ctx.beginPath();
						ctx.moveTo(lastPoint.x, lastPoint.y);
                        ctx.quadraticCurveTo(lastPoint.x + point.cpl[j].x, lastPoint.y + point.cpl[j].y, point.x, point.y)
						ctx.stroke();

						point.cpl[j].x = point.cpl[j].x * 0.99;
						point.cpl[j].y = point.cpl[j].y * 0.99;
					}
					lastPoint = point;
				}
                break;

                case 'c-squares': //c_9
                for (let j = 0; j < canvas.points.length; j++) {
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
                        ctx.fillStyle='rgba(200,0,0, 0.2)'
                        if(Math.abs(point.ofl[j].x) < 3 || Math.abs(point.ofl[j].y) < 3){
                            continue;
                        }
                        let len = Math.sqrt( Math.pow(point.ofl[j].x,2) + Math.pow(point.ofl[j].y,2) )
						ctx.fillRect(point.x + point.ofl[j].x, point.y + point.ofl[j].y, 1*len, 1*len);
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
	createNewCanvas(canvasClassSelector[i].id, canvasClassSelector[i].id)
}

//Таймаут после каждого движения мышкой для определения след. точки

document.addEventListener('mousemove', calculateMousePosition);
window.requestAnimationFrame(draw);
