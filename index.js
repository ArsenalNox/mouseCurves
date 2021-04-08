/** (>.>) */
var skipAmount = 2;
var skipInteval = 2;
var canvases = []; //Массив с канвасами
var maxPoints = 50; //Максимальное количество точек эффекта
var debug = true
var timeOutTimer //Таймер, ограничивающий создание новых точек
var newPointAdditionAllowed = true;
var offsetLines = 25 //Кол-во линий в <>
var offValueMax = 30; //Максимальное значение сдвига
var smoothOffValue = 0.5; //Сдвиг для 
var smoothLines = 5; //Кол-во линий 




//Blob 11
var blob_offsetLines = 300;
var blob_offValueMax = 30;
var blob_maxPoints = 1;
var blob_sections = 4; //Number of sections inside blob point

//Blob tree 12
var blob_tree_offsetLines = 100;
var blob_tree_offValueMax = 10;
var blob_tree_maxPoints = 1;
var blob_tree_sections = 10; //Number of sections inside blob point


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
	for (let i = 0; i < canvases.length; i++) {
		if (canvases[i].isMouseInside) {
			let canvas = document.getElementById(canvases[i].id);

			let rect = canvas.getBoundingClientRect();
			let mousePos = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top
			};

            if(canvases[i].type == 'c-smooth-lines-multiple'){
                if(canvases[i].points.length > 5){
                    let lineLen = Math.sqrt(
                        Math.pow(canvases[i].points[canvases[i].points.length-1].x - canvases[i].points[canvases[i].points.length-2].x, 2)
                        +
                        Math.pow(canvases[i].points[canvases[i].points.length-1].y - canvases[i].points[canvases[i].points.length-2].y, 2)
                    )
                    console.log(lineLen)
                    if(lineLen < 50 ){
                        canvases[i].points[canvases[i].points.length-1] = mousePos
                        continue
                    }   
                }
            }

            if(canvases[i].type == 'c-blob'){
                if(canvases[i].points.length > blob_maxPoints){
    				canvases[i].points.shift()
                }
            }
 
            if(canvases[i].type == 'c-blob-tree'){
                if(!(canvases[i].points[0]?.x && canvases[i].points[0]?.y)){
    				canvases[i].points.push(mousePos)
                } else { 
                    canvases[i].points[0].x = mousePos.x;
                    canvases[i].points[0].y = mousePos.y;
                }

                continue;
            }
               
			canvases[i].points.push(mousePos)
			if (canvases[i].points.length > maxPoints) {
				canvases[i].points.shift()
			}
        }
	}
}

/** Отрисовывает все эффекты*/
function draw()
{
for (let i = 0; i < canvases.length; i++) {

    let lastPoint = 0 //Последняя точка
    let canvas = canvases[i] //Текущий канвас
    let ctx = canvases[i].context;
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    switch (canvas.type) { //Выбор соответсвующей анимации
        case 'c-lines-slightly-curved': // c_1

        /** Отрисовывает кубическую кривую с одной контрольной точкой */
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

        case 'c-beizer-curve': //c_2
        /** Две контрольные точки */
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
                    }); 
                } 
            } 

            for (let j = 0; j < point.ofl.length; j++) {
                
                if(point.ofl[j].x < 1 && point.ofl[j].y < 1) continue;

                ctx.beginPath();
                ctx.moveTo(lastPoint.x + point.ofl[j].x, lastPoint.y + point.ofl[j].y);
                ctx.lineTo(point.x + point.ofl[j].x, point.y + point.ofl[j].y);
                ctx.stroke();

                point.ofl[j].x = point.ofl[j].x * 0.96;
                point.ofl[j].y = point.ofl[j].y * 0.96;
            }
            lastPoint = point;
        }
        break;
        
        case 'c-smooth-lines-multiple': //c_8
        for (let j = 0; j < canvas.points.length; j++) {

            //Assigning last point 
            let point = canvas.points[j];
            if (lastPoint === 0) {
                lastPoint = point;
                continue;
            }

            //Initialising array of control points for line 
            //Check if line lenght is insufficent 
            if(Math.sqrt( Math.pow(point.x - lastPoint.x,2) + Math.pow(point.y - lastPoint.y, 2)) < 20){
                if(!(point?.cpl)){ //Create point.cpl if there is none (common control points)
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
            }else{ //If lenght is OK
                if (!(point?.cpl)) {
                    point.cpl = [];
                    let commonCp = { //Create normal control poins
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
            
            for (let j = 0; j < point.cpl.length; j++) { //Drawing the line 
                ctx.beginPath();
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.quadraticCurveTo(lastPoint.x + point.cpl[j].x, lastPoint.y + point.cpl[j].y, point.x, point.y)
                ctx.stroke();

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
                        x: randomNumber(-offValueMax, offValueMax) * randomNumber(1.1, 1.7),
                        y: randomNumber(-offValueMax, offValueMax) * randomNumber(1.1, 1.7)
                    });
                }
            }

            for (let j = 0; j < point.ofl.length; j++) {
                
                let len = Math.sqrt( Math.pow(point.ofl[j].x,2) + Math.pow(point.ofl[j].y,2) )

                if(!point?.color){
                    point.color = {
                        maxValue: len,
                        currentValue:  len
                    }
                    
                }else{
                    point.color.currentValue = len;
                }

                ctx.beginPath();
                colorValue = Math.round(point.color.currentValue/point.color.maxValue*256)
                ctx.fillStyle='rgba('+colorValue+',0,'+colorValue+', 0.09)'
                if(Math.abs(point.ofl[j].x) < 3 || Math.abs(point.ofl[j].y) < 3){
                    continue;
                }
                
                ctx.fillRect(point.x + point.ofl[j].x*1.3, point.y + point.ofl[j].y*1.3, 1*len, 1*len);
                ctx.stroke();
                
                point.ofl[j].x = point.ofl[j].x * 0.97;
                point.ofl[j].y = point.ofl[j].y * 0.97;

            }
            lastPoint = point;
        }
        break;

        case 'c-squares-moving': //c_10
        for (let j = 0; j < canvas.points.length; j++) {
            
            let point = canvas.points[j];
            if (lastPoint === 0) {
                lastPoint = point + point * (randomNumber(0.9, 1.1));
                continue;
            }
            
            if (!(point?.ofl)) { 
                point.ofl = [];
                for (let j = 0; j < offsetLines; j++) {
                    let randomPoint = randomPoinInCircle(offValueMax);
                    point.ofl.push({
                        x: randomPoint.x * randomNumber(0.4, 2.7),
                        y: randomPoint.y * randomNumber(0.4, 2.7)
                    });
                }
            }

            for (let j = 0; j < point.ofl.length; j++) {
                
                let len = Math.sqrt( Math.pow(point.ofl[j].x,2) + Math.pow(point.ofl[j].y,2) )

                if(!point?.color){
                    point.color = {
                        maxValue: len,
                        currentValue:  len
                    }
                    
                }else{
                    point.color.currentValue = len;
                }

                ctx.beginPath();
                colorValue = Math.round(point.color.currentValue/point.color.maxValue*256)
                ctx.fillStyle='rgba('+Math.round(colorValue/2)+',0,'+colorValue+', 0.09)'
                if(Math.abs(point.ofl[j].x) < 3 || Math.abs(point.ofl[j].y) < 3){
                    continue;
                }
                
                ctx.fillRect(point.x + point.ofl[j].x*1.3, point.y + point.ofl[j].y*1.3, 1*len/2, 1*len/2);
                ctx.stroke();
                
                point.ofl[j].x = point.ofl[j].x * 0.98;
                point.ofl[j].y = point.ofl[j].y * 0.98;

            }
            lastPoint = point;
        }
        break;

        case 'c-blob': //c_11
        for (let j = 0; j < canvas.points.length; j++) {
            
            let point = canvas.points[j];
            if (lastPoint === 0) {
                lastPoint = point + point * (randomNumber(0.9, 1.1));
                continue;
            }
            
            if (!(point?.ofli)) { 
                
                point.ofli = [];
                point.oflo = [];

                for (let j = 0; j < blob_offsetLines; j++) {
                    let randomPoint = randomPoinInCircle(offValueMax, 20);
                    point.ofli.push({
                        x: randomPoint.x,
                        y: randomPoint.y
                    });
                }

                for (let j = 0; j < blob_offsetLines; j++) {
                    point.oflo.push({
                        x: point.ofli[j].x*2 + randomNumber(-5, 5),
                        y: point.ofli[j].y*2 + randomNumber(-5, 5)
                    });
                }
            }

            for (let j = 0; j < point.ofli.length; j++) {
                
                ctx.beginPath();
                
                //ctx.fillRect(point.x + point.ofli[j].x, point.y + point.ofli[j].y, 2, 2);
                //ctx.fillRect(point.x + point.oflo[j].x, point.y + point.oflo[j].y, 2, 2);
                ctx.moveTo(point.x + point.ofli[j].x, point.y + point.ofli[j].y);
                ctx.lineTo(point.x + point.oflo[j].x, point.y + point.oflo[j].y)
                ctx.stroke();
                
                offsetX = randomNumber(-0.1, 0.1);
                offsetY = randomNumber(-0.1, 0.1);

                point.ofli[j].x = point.ofli[j].x + offsetX; 
                point.ofli[j].y = point.ofli[j].y + offsetY;

                point.oflo[j].x = point.oflo[j].x + offsetX;
                point.oflo[j].y = point.oflo[j].y + offsetY;
            }
            lastPoint = point;
        }
        break;

        case 'c-blob-tree': //c_12
        for (let j = 0; j < canvas.points.length; j++) {

            var point = canvas.points[j];
            if (!(point?.ofl)) {  //Генерация точек
                point.ofl = [];
                for(let sc = 0; sc < blob_tree_sections; sc++){ //Populating points in section

                    //Section consists of outer and inner arrays of points 
                    //Generating inner points 
                    let innerPoints = [];
                    for(let oflp = 0; oflp < blob_tree_offsetLines; oflp++){ 
                        let rcoordinates = randomPointAtCircle(
                            blob_tree_offValueMax*sc+blob_tree_offValueMax
                        );

                        innerPoints.push({
                            x: rcoordinates.x,
                            y: rcoordinates.y,
                            angle: rcoordinates.angle,
                            rad: rcoordinates.rad
                        });
                    }
                    
                    //Generating outer points 
                    let outerPoints = [];
                    for(let oflp = 0; oflp < blob_tree_offsetLines; oflp++){
                        outerPoints.push({
                            x: 0,
                            y: 0,
                            angle: innerPoints[oflp].angle,
                            rad: innerPoints[oflp].rad+blob_tree_offValueMax-2
                        });
                    }
                    
                    let section = {
                        'innerPoints': innerPoints,
                        'outerPoints': outerPoints
                    };

                    //Appending section to ofl  
                    point.ofl.push(section);
                }
            }

            for (let j = 0; j < point.ofl.length; j++) {

                if(!point.ofl[j]?.value){
                    point.ofl[j].value = (Math.round(randomNumber(-1, 1)) > 0) ? -1 * randomNumber(.0001, .002): 1 * randomNumber(.0001, .002);
                }

                for(let sc = 0; sc < point.ofl[j].innerPoints.length; sc++){    
                    
                    point.ofl[j].innerPoints[sc].angle= point.ofl[j].innerPoints[sc].angle + point.ofl[j].value
                    point.ofl[j].outerPoints[sc].angle= point.ofl[j].innerPoints[sc].angle + point.ofl[j].value
                    
                    point.ofl[j].innerPoints[sc].x = point.ofl[j].innerPoints[sc].rad * Math.cos(point.ofl[j].innerPoints[sc].angle);
                    point.ofl[j].innerPoints[sc].y = point.ofl[j].innerPoints[sc].rad * Math.sin(point.ofl[j].innerPoints[sc].angle);
 
                    point.ofl[j].outerPoints[sc].x = point.ofl[j].outerPoints[sc].rad * Math.cos(point.ofl[j].outerPoints[sc].angle);
                    point.ofl[j].outerPoints[sc].y = point.ofl[j].outerPoints[sc].rad * Math.sin(point.ofl[j].outerPoints[sc].angle);


                    ctx.beginPath()
                    ctx.moveTo(
                        point.x + point.ofl[j].innerPoints[sc].x, 
                        point.y + point.ofl[j].innerPoints[sc].y
                    )
                    ctx.lineTo(
                        point.x + point.ofl[j].outerPoints[sc].x, 
                        point.y + point.ofl[j].outerPoints[sc].y
                    )

                    ctx.stroke()
                }
            }
        }
        break;
            
    }
}
window.requestAnimationFrame(draw)
}

/** 
 *  Returns random x, y inside a circle with radius r
 * */
function randomPoinInCircle(R, MIN=0){
    let a = Math.random() * 2 * Math.PI;
    let r = ( R * Math.sqrt(Math.random()) ) + MIN;
    return {
        x: r*Math.cos(a),
        y: r*Math.sin(a)
    }
}

function randomPointAtCircle(R){
    let a = Math.random() * 2 * Math.PI;
    return {
        x: R*Math.cos(a),
        y: R*Math.sin(a),
        angle: a,
        rad: R
    }
}

// Конец определения функций

//Выбор всех подходящих канвасов
var canvasClassSelector = document.getElementsByClassName('c-canvas');
for (let i = 0; i < canvasClassSelector.length; i++) {
	createNewCanvas(canvasClassSelector[i].id, canvasClassSelector[i].id)
}

document.addEventListener('mousemove', calculateMousePosition);
document.addEventListener('touchmove', (e)=>{
    console.log(e.pageX);
})

window.requestAnimationFrame(draw);
