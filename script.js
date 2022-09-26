const mazeRooms = document.getElementsByClassName('mazeRoom');
const finishScreen = document.querySelector('.finishScreen')
const threatScreen = document.querySelector('.threatScreen')
const wealthCounter = document.querySelector('.totalTreasure')
const threatCounter = document.querySelector('.threatsCounter')

let eventActive = false;
let threatsFound = 0;

// Function to get a random number
const generateRandomNumber = (min, max) => {
    let num = Math.floor(Math.random() * (max - min + 1)) + min;
    return (num === 4) ? generateRandomNumber(min, max) : num;
};

// Function to shuffle array of indexes to allow rooms information to be set
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

// Function to restart game when button is pressed
function restartGame() {
    location.reload()
}

const game = (() => {

    const tryValidation = async () => {

        try {

            const fetchData = await fetch('./configurationData.json');
            const data = await fetchData.json();

            const player = {
                currentLocation: null,
                treasureTotal: 0,
                threatsCleared: 0
            };    
            
            const rooms = []

            for (let i = 0; i < 9; i++) {
                const room = {
                    spawnRoom: false,
                    hasThreat: false,
                    hasCoin: false,
                    hasExit: false,
                    roomVisited: false,
                }
                rooms.push(room)
            }         
            
            const assignRoomExit = () => {
                if (rooms.some(room => room.hasExit === true)) {
                    return
                }
                else {
                    
                    const selectedRoom = data.mazeRooms[generateRandomNumber(0, 8)]
    
                    for (let i = 0; i < selectedRoom.length; i++) {
                        let foundPassage = false;
                        for (let o = 0; o < selectedRoom[i].length; o++) {
                            if (selectedRoom[i][o] === 5) {
                                selectedRoom[i][o] = 4;
                                foundPassage = true;
                            }
                        }
    
                        if (foundPassage) break;
                    };
                }
            }

            const findSpawnLocation = () => {
                rooms.forEach((room, i) => {
                    room.spawnRoom ? room.roomVisited = true : null
                    room.spawnRoom ? player.currentLocation = i : null
                })
            }

            const configureRooms = () => {
                const shuffledRoomIndexs = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8])

                rooms[shuffledRoomIndexs[0]].spawnRoom = true
                rooms[shuffledRoomIndexs[1]].hasCoin = true
                rooms[shuffledRoomIndexs[2]].hasCoin = true
                rooms[shuffledRoomIndexs[3]].hasCoin = true
                rooms[shuffledRoomIndexs[7]].hasCoin = true
                rooms[shuffledRoomIndexs[4]].hasThreat = true
                rooms[shuffledRoomIndexs[5]].hasThreat = true
                rooms[shuffledRoomIndexs[6]].hasThreat = true                
                rooms[shuffledRoomIndexs[7]].hasExit = true
            }
            const configureMaze = () => {

                rooms.forEach((room, i) => {           
                    if (!mazeRooms[i].classList.contains("visited") && room.roomVisited === true) {
                        mazeRooms[i].classList.add("roomVisited")
                    }                    
                })
                data.mazeRooms[player.currentLocation][1][1] = 3
                
                const mazeRoomsFromConfig = data.mazeRooms;
                const sprites = data.sprites;

                for (let i = 0; i < mazeRoomsFromConfig.length; i++) {

                    for (let o = 0; o < mazeRoomsFromConfig[i].length; o++) {

                        for (let p = 0; p < mazeRoomsFromConfig[i][o].length; p++) {                            
                            let sprite = mazeRoomsFromConfig[i][o][p];

                            switch (sprite) {

                                case 0:
                                    mazeRooms[i].innerHTML += sprites.wall;
                                break;

                                case 1:
                                    mazeRooms[i].innerHTML += sprites.passage;
                                break;

                                case 3:
                                    mazeRooms[i].innerHTML += sprites.player;
                                break;

                                case 4:
                                    mazeRooms[i].innerHTML += sprites.exit;
                                break;

                                case 5:
                                    mazeRooms[i].innerHTML += sprites.door;
                                break;
                            };
                        };
                    };
                };                
            };
            
            assignRoomExit()
            configureRooms()
            findSpawnLocation()
            configureMaze()

            const traverseMaze = keyDirection => {

                data.mazeRooms[player.currentLocation][1][1] = 1;
                switch (keyDirection) {

                    case 'up': 
                        player.currentLocation = player.currentLocation - 3;
                        rooms[player.currentLocation].roomVisited = true;
                    break;

                    case 'down': 
                        player.currentLocation = player.currentLocation + 3;
                        rooms[player.currentLocation].roomVisited = true;
                    break;

                    case 'left': 
                        player.currentLocation = player.currentLocation - 1;
                        rooms[player.currentLocation].roomVisited = true;
                    break;

                    case 'right': 
                        player.currentLocation = player.currentLocation + 1;
                        rooms[player.currentLocation].roomVisited = true;
                    break;
                }
                data.mazeRooms[player.currentLocation][1][1] = 3;
                for (let i = 0; i < mazeRooms.length; i++) {
                    mazeRooms[i].innerHTML = '';
                };
            }
            document.addEventListener('keydown', e => {
                const keyPressed = e.key

                switch (keyPressed) {

                    case 'ArrowUp':
                        if (data.mazeRooms[player.currentLocation][0][1] === 1 && eventActive === false) {                      
                            traverseMaze('up')
                            configureMaze()
                            checkRoomForTreasureAndThreat()
                        } else if (data.mazeRooms[player.currentLocation][0][1] === 4 && eventActive === false) {
                            finishGame()
                        }else if (data.mazeRooms[player.currentLocation][0][1] === 5 && eventActive === false) {
                            eventActive = true
                            threatScreen.innerHTML += `
                                <h3>You cannot go this way, the door is locked, try a different direction</h3>
                                <p>Press space to continue.</p>
                            `

                            document.addEventListener('keyup', e => {
            
                                if (e.code === "Space") {
                                    threatScreen.innerHTML = ''
                                    eventActive = false;
                                };
                            });
                        }
                    break;

                    case 'ArrowDown':
                        if (data.mazeRooms[player.currentLocation][2][1] === 1 && eventActive === false) {                      
                            traverseMaze('down')
                            configureMaze()
                            checkRoomForTreasureAndThreat()
                        }else if (data.mazeRooms[player.currentLocation][2][1] === 4 && eventActive === false) {
                            finishGame()
                        }else if (data.mazeRooms[player.currentLocation][2][1] === 5 && eventActive === false) {
                            eventActive = true
                            threatScreen.innerHTML += `
                                <h3>You cannot go this way, the door is locked, try a different direction</h3>
                                <p>Press space to continue.</p>
                            `

                            document.addEventListener('keyup', e => {
            
                                if (e.code === "Space") {
                                    threatScreen.innerHTML = ''
                                    eventActive = false;
                                };
                            });
                        }
                    break;

                    case 'ArrowLeft':
                        if (data.mazeRooms[player.currentLocation][1][0] === 1 && eventActive === false) {                      
                            traverseMaze('left')
                            configureMaze()
                            checkRoomForTreasureAndThreat()
                        }else if (data.mazeRooms[player.currentLocation][1][0] === 4 && eventActive === false) {
                            finishGame()
                        } else if (data.mazeRooms[player.currentLocation][1][0] === 5 && eventActive === false) {
                            eventActive = true
                            threatScreen.innerHTML += `
                                <h3>You cannot go this way, the door is locked, try a different direction</h3>
                                <p>Press space to continue.</p>
                            `

                            document.addEventListener('keyup', e => {
            
                                if (e.code === "Space") {
                                    threatScreen.innerHTML = ''
                                    eventActive = false;
                                };
                            });
                        }
                    break;

                    case 'ArrowRight':
                        if (data.mazeRooms[player.currentLocation][1][2] === 1 && eventActive === false) {                      
                            traverseMaze('right')
                            configureMaze()
                            checkRoomForTreasureAndThreat()
                        }else if (data.mazeRooms[player.currentLocation][1][2] === 4 && eventActive === false) {
                            finishGame()
                        }else if (data.mazeRooms[player.currentLocation][1][2] === 5 && eventActive === false) {
                            eventActive = true
                            threatScreen.innerHTML += `
                                <h3>You cannot go this way, the door is locked, try a different direction</h3>
                                <p>Press space to continue.</p>
                            `

                            document.addEventListener('keyup', e => {
            
                                if (e.code === "Space") {
                                    threatScreen.innerHTML = ''
                                    eventActive = false;
                                };
                            });
                        }
                    break;
                }
            })

            const checkRoomForTreasureAndThreat = () => {
                
                if (rooms[player.currentLocation].hasCoin) {

                    const randomCoin = Math.floor(Math.random() * data.coins.length)

                    if (randomCoin === 0 && rooms[player.currentLocation].hasCoin) {
                        player.treasureTotal = player.treasureTotal + data.coins[0].bronzeCoin
                        rooms[player.currentLocation].hasCoin = false
                    } 
                    else if (randomCoin === 1 && rooms[player.currentLocation].hasCoin) {
                        player.treasureTotal = player.treasureTotal + data.coins[1].silverCoin
                        rooms[player.currentLocation].hasCoin = false
                    }
                    else if (randomCoin === 2 && rooms[player.currentLocation].hasCoin) {
                        player.treasureTotal = player.treasureTotal + data.coins[2].goldCoin
                        rooms[player.currentLocation].hasCoin = false
                    }
                    
                    wealthCounter.textContent = `Current Wealth: ${player.treasureTotal}`;
                }
                else if (rooms[player.currentLocation].hasThreat) {
                    rooms[player.currentLocation].hasThreat = false
                    eventActive = true;
                    threatsFound++;
                    player.threatsCleared++;
                    
                    if (threatsFound === 1) {
                        const randomNumber = generateRandomNumber(0,1); 
                        
                        if (randomNumber === 1) {
                            threatScreen.innerHTML += `
                                <h3>Oh no, you have encountered a Goblin!</h3>
                                <h5>You swing your club and hit the Goblin!</h5>
                                <h5>The Goblin collapses and you are free to move on again</h5>
                                <p>Press space to continue.</p>
                            `

                            document.addEventListener('keyup', e => {
            
                                if (e.code === "Space") {
                                    threatScreen.innerHTML = ''
                                    eventActive = false;
                                };
                            });
                        }
                        else if (randomNumber === 0) {
                            threatScreen.innerHTML += `
                                <h3>Oh no, you have encountered a Goblin!</h3>
                                <h5>You swing your club to hit the Goblin but you miss!</h5>
                                <h5>The Goblin attacks you and manages to get </br> some treasure from you!</h5>
                                <h5>It then drops you and walks off with it's treasure.</h5>
                                <p>Press space to continue.</p>
                            `

                            player.treasureTotal = player.treasureTotal - 20;

                            if (player.treasureTotal < 0) player.treasureTotal = 0

                            wealthCounter.textContent = `Current Wealth: ${player.treasureTotal}`;

                            document.addEventListener('keyup', e => {
            
                                if (e.code === "Space") {
                                    threatScreen.innerHTML = ''
                                    eventActive = false;
                                };
                            });
                        }
                    } 
                    else if (threatsFound === 2) {
                        const randomNumber = generateRandomNumber(0,1); 
                        
                        if (randomNumber === 1) {
                            threatScreen.innerHTML += `
                                <h3>Oh no, you have spotted a sleeping Troll!</h3>
                                <h5>You try to sneak up and take it out silently...</h5>
                                <h5>You are successful! The Troll has been subdued</br> and you are safe to move on!</h5>
                                <p>Press space to continue.</p>
                            `

                            document.addEventListener('keyup', e => {
            
                                if (e.code === "Space") {
                                    threatScreen.innerHTML = ''
                                    eventActive = false;
                                };
                            });
                        }
                        else if (randomNumber === 0) {
                            threatScreen.innerHTML += `
                                <h3>Oh no, you have spotted a sleeping Troll!</h3>
                                <h5>You try to sneak up and take it out silently...</h5>
                                <h5>You are unsuccessful! The Troll hears you coming and</br> wakes up! It grabs you and some of your </br> treasure falls, you swing your club and </br> luckily manage to hit the troll, eliminating it but you </br> have lost some more treasure.</h5>
                                <p>Press space to continue.</p>
                            `

                            player.treasureTotal = player.treasureTotal - 20;

                            if (player.treasureTotal < 0) player.treasureTotal = 0

                            wealthCounter.textContent = `Current Wealth: ${player.treasureTotal}`;

                            document.addEventListener('keyup', e => {
            
                                if (e.code === "Space") {
                                    threatScreen.innerHTML = ''
                                    eventActive = false;
                                };
                            });
                        }
                    }
                    else if (threatsFound === 3) {
                        const randomNumber = generateRandomNumber(0,1); 
                        
                        if (randomNumber === 1) {
                            threatScreen.innerHTML += `
                                <h3>Oh no, you have encountered a Python!</h3>
                                <h5>You swing your club and hit the Python!</h5>
                                <h5>The Python stops dead in its tracks and you are free to move on again</h5>
                                <p>Press space to continue.</p>
                            `

                            document.addEventListener('keyup', e => {
            
                                if (e.code === "Space") {
                                    threatScreen.innerHTML = ''
                                    eventActive = false;
                                };
                            });
                        }
                        else if (randomNumber === 0) {
                            threatScreen.innerHTML += `
                                <h3>Oh no, you have encountered a Python!</h3>
                                <h5>You swing your club to hit the Python but you miss!</h5>
                                <h5>The Python attacks you and knocks your club away! </br> Desperatley you throw treasure at it and the Python </br> swallows it, looking confused the Python slithers away...</h5>
                                <p>Press space to continue.</p>
                            `

                            player.treasureTotal = player.treasureTotal - 20;

                            if (player.treasureTotal < 0) player.treasureTotal = 0

                            wealthCounter.textContent = `Current Wealth: ${player.treasureTotal}`;

                            document.addEventListener('keyup', e => {
            
                                if (e.code === "Space") {
                                    threatScreen.innerHTML = ''
                                    eventActive = false;
                                };
                            });
                        }
                    } 
                    threatCounter.textContent = `Threats found: ${player.threatsCleared}/3`;
                }
                else {
                    return
                }
            }

            const finishGame = () => {
                eventActive = true;
                finishScreen.innerHTML += `
                <h3><span class="survive">Congratulations you escaped the maze!</span></h3>
                <p>Player Stats:</p>
                <ul>
                    <li>Wealth: <span>${player.treasureTotal}</span></li>
                    <li>Threats survived: <span>${player.threatsCleared}/3</span></li>
                </ul>
                <button onclick="restartGame()" class="restartMaze">Restart</button>
            `;
            }
        }


        // If an error occurs, inform user in console
        catch (error) {
            console.warn(error);
        };
    };
    tryValidation();
})();
