
//some global variables
var display = new ROT.Display({width:32, height:32, fontSize:15, fg:"purple", bg:"darkseagreen", forceSquareRatio:true});
var container = display.getContainer();
var gameDiv = document.body.querySelector("#game");
var invDiv = document.body.querySelector("#inv")
gameDiv.appendChild(container);
var gift;
var giftName;



//map creation
function createMap(width, height) {
    var map = {
        width, height,
        tiles: new Map(),
        key(x, y) { return `${x},${y}`; },
        get(x, y) { return this.tiles.get(this.key(x, y)); },
        set(x, y, value) { this.tiles.set(this.key(x, y), value); },
    }

    const arena = new ROT.Map.Arena(width, height);
    arena.create((x, y, contents) => map.set(x, y, contents));
    return map;
}


var map = createMap(32, 32)


//world object for some global actions like draw
var world = {
    draw: function() {
        display.clear()
        for (let y = 0; y <= map.height; y++) {
            for (let x = 0; x <= map.width; x++) {
                if ((map.get(x, y)===1)) {
                    display.draw(x, y, '#');
                } else if (map.get(x, y) === 0) {
                    display.draw(x, y, '·');
                }
            }}
            for (i = 0; i < entities.length; i++) {
                display.draw(entities[i].x, entities[i].y, entities[i].char)
            }
            for (i = 0; i < items.length; i++) {
                display.draw(items[i].x, items[i].y, items[i].char)
            }
    },

    isPassable: function (x, y) {
        if (map.get(x, y) === 1) {
            print("Ouch, that's a wall.")
            return false;
        } else if (map.get(x, y) === 2) {
            print ("Someone is in the way.")
            return false;
        } else if (map.get(x, y) === 3) {
            print ("Something is in the way.")
            return false;
        } else {
          return true;
        }
      }
};

//print messages
function print(message) {
    const MAX_LINES = 5;
    let messages = document.querySelector("#messages");
    let lines = messages.textContent.split(" \n ");
    lines.push(message);
    while (lines.length > MAX_LINES) { lines.shift(); }
    messages.textContent = lines.join(" \n ");
}

//colors for characters, TODO: actually implement these
const colors = {
    ".": "lightpurple",
    "W":  "hotpink"
}

//create entities (player, NPCs) and items
function createEntity(type, x, y, char, want, action) {
    map.set(x, y, 2);
    return {type, x, y, char, want, action};
}
 pickUp = function(item, x, y) {
    var index = items.indexOf(item)
    items.splice(index, 1);
     map.set(x, y, 0);
     display.draw(x, y, ".")
     world.draw();
     inventory.push(item);
     invDiv.innerHTML = "";
     for (i = 0; i < inventory.length; i++) {
        invDiv.textContent += "[" + i + "]" + inventory[i].name + " - "
    }
 };

 createItem = function(name, x, y, char, pickup) {
     map.set(x, y, 3);
    return {name, x, y, char, pickup}
 }

let player = createEntity("player", 5, 4, "@", "");
let wizard = createEntity ("wizard", 9, 9, "W", "mushroom", "''Ahoy, I'm a wizard. I'm going to help build a temple here.''");
let apothecary = createEntity("apothecary", 13, 13, "A", "flower", "''Hey, I am an apothecary. I'm hoping to grow herbs in the garden that will be here.''");

let flower = createItem("flower", Math.floor((Math.random()*30)+1), Math.floor((Math.random()*30)+1), "🌼", "You pick the flower.")
let mushroom = createItem("mushroom", Math.floor((Math.random()*30)+1), Math.floor((Math.random()*30)+1), "🍄", "You pick the mushroom.")

let entities = [player, wizard, apothecary];
let items = [flower, mushroom];
let inventory = [];

//display the world
world.draw();

//is the player about to interact with something? is indicated by this var
var interact = false;
var giving = false;

 checkEntity = function(x, y) {
     for (i = 0; i < entities.length; i++) {
        if (entities[i].x === x && entities[i].y === y) {
            return entities[i];
        }
     }
 }
checkGift = function(gift, entity) {
    giftName = gift.name
    console.log(("attempting to give away " + giftName))
    if (giftName === entity.want) {
        return true;
    } else {
        return false;
    }
}

//move/interact function
var move = function(entity, dX, dY) {
    var newX = entity.x + dX;
    var newY = entity.y + dY;
    if (!interact && !giving) {
        if (world.isPassable(newX, newY)) {
            map.set(entity.x, entity.y, 0)
            entity.x = newX;
            entity.y = newY;
        } else {
            return;
    }} else if (interact && map.get(newX, newY) === 2) {
        for (i=0; i < entities.length; i++) {
            if (entities[i].x === newX && entities[i].y === newY) {
                print(entities[i].action);
                console.log("Spoke to " + entities[i].type);
            }}
            interact = false;
            return;
    } else if (interact && map.get(newX, newY) === 3) {
        for (i=0; i < items.length; i++) {
            if (items[i].x === newX && items[i].y === newY) {
                print(items[i].pickup);
                console.log("picked up " + items[i].name);
                pickUp(items[i], newX, newY);
            }}
            interact = false;
            world.draw();
            return;
    } else if (giving && map.get(newX, newY) === 2) {
        console.log("attempting to give gift")
        if (checkGift(gift, checkEntity(newX, newY))) {
            print("Oh, thank you! That's perfect.")
            //increment SQL value for entity & remove item from inventory
        } else {
            print("I don't want that, but thanks.")
        }
    } else {
        giving = false;
        interact = false;
        return;
    }
        
    }


document.addEventListener("keydown", function(event) {
    if (event.code === "ArrowUp") {
        move(player, 0, -1);
    } else if (event.code === "ArrowDown") {
        move(player, 0, 1);
    } else if (event.code === "ArrowRight") {
        move (player, 1, 0);
    } else if (event.code === "ArrowLeft") {
        move(player, -1, 0);
    } else if (event.code === "Space") {
        giving = false;
        interact = true;
    } else if (event.code === "KeyX") {
        console.log("attempting to choose gift");
        gift = window.prompt("Please select an item to give by entering a number, then press OK, then press a direction to give it.");
        gift = inventory[gift]
        interact = false;
        giving = true;
    
        return;
    }
    else {
        return;
    }
    world.draw();
});