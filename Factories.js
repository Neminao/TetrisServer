
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
    0: 'OrangeRed', 
    1: 'blue',
    2: 'yellow',
    3: 'orange',
    4: 'GreenYellow',
    5: 'Aqua',
    6: 'DeepPink',
    7: 'dodgerblue',
    8: 'red',
    9: 'green'

}
const createUser = ({name = "", socketID = null, inGame = false, isReady = false, score = 0, gameMode = 0, gameName = ''} = {})=>(
	{
		id:uuidv4(),
		name,
		socketID,
		inGame,
        isReady, 
        score, 
        gameMode,
        gameName
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

