
var uuidv4 = require("uuid/v4");
var shapeCoordinates = {
    0: [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 1 }], [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }]
    ],
    1: [
        [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: -1 }]
    ],
    2: [
        [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }], [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }], [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 1 }]
    ],
    3: [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }], [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: -2 }, { x: 0, y: 1 }]
    ],
    4: [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }], [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }], [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }, { x: -1, y: -1 }]
    ],
    5: [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 1 }], [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: -1 }],
        [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: -1, y: -1 }], [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }, { x: -1, y: 1 }]
    ],
    6: [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
    ],
    7: [
        [{ x: 0, y: 0 }]
    ],
    8: [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }], [{ x: 0, y: 0 }, { x: 0, y: 1 }]
    ],
    9: [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 0 }], [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }]
    ],
};
var colors = {
    0: 'rgb(241,21,9)', 
    1: 'rgb(71,125,245)',
    2: 'rgb(255,251,11)',
    3: 'rgb(245,155,24)',
    4: 'rgb(139,243,79)',
    5: 'rgb(11,241,241)',
    6: 'rgb(233,25,227)',
    7: 'rgb(119,15,187)',
    8: 'rgb(197,85,9)',
    9: 'rgb(197,203,9)'

}
const createUser = ({name = "", socketID = null, inGame = false, isReady = false, score = 0, gameMode = 0, gameName = '', showAnimation = true} = {})=>(
	{
		id:uuidv4(),
		name,
		socketID,
		inGame,
        isReady, 
        score, 
        gameMode,
        gameName,
        showAnimation
	}
)

const createGameData = ({matrix = []} = {})=>(
	{
		matrix	
	}
)
function generateShapes (max, difficulty) { 
	let index = Math.floor(Math.random() * Math.floor(difficulty));
	let array = [];
	for(var i = 0 ;i<max;i++){
		index = Math.floor(Math.random() * Math.floor(difficulty));
		array.push({coords: shapeCoordinates[index], color: colors[index]});
		
	}
	return array;
}

module.exports = {
	createUser,
	createGameData,
	generateShapes
}

