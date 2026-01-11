# The Chicago Loop

This game is about marrying the concept of strange loops and abstraction. Self referential items that take on a life of their own, explicitly borrowing the cocept GEB, and the Chicago loop -- a downtown metropolitan area that has multimodal transportation involving boats, trains, automobiles, busses, and airplanes.

The game is meant to borrow from Conway's game of life. That is to say that the player sets up a shape and clicks go, the goal is to be able to move the player from the bottom left to the top right of the screen. If they are able to successfully set the initial conditions (and rules!) of the game correctly, the player is moved over time and reaches the top right raising up the next level. Note  Conway's game relies both on "the rule" that is to say things like "any live cell with <2 live neighbors dies".


How to play:

- The player sets up a grid of 4x4 cells in which they can select whether a cell is "on" or alive. or "off" and dead. The material in the cell varies in each level.
- The player sets the conditions under which death, reproduction, and "lives on" to the next generation. These rules should define all situations of a cell from 0-8 neighbors. The way a player can specify it is through the numbers 0-8. For example death:1,5,7 means that death occurs when there are exactly 1 or 5 or 7 neighboring cells.
- IMPORTANT: Birth and Survive rules cannot share the same numbers - each number can only be assigned to one rule type.
- Conway cells (rats, fish, bricks) cannot occupy wall spaces - they can only exist in passable areas of the board.
- The game is lost if no motion occurs and all the cells die out. The player can "reset" the game if they get caught in a loop with a simple menu like "stop" "reset" and "main menu"


# Main Screen

The main screen is a pixelated art using 8bit color art that show the Chicago downtoan with clear identifiable buildings like the Sears Tower and the Bean. The player is represented as a Chicago hot dog whose back is to the screen looking up at the city. a button says begin


## Level 1: The tunnels
This level is the simplest level and is a tunnel using the old mail tunnels, sewage tunnels. The player is trying to get from the bottom right to top left. It is the Chicago Flood in 1992 and all the basements are flooded. The player is trying to get through the hole in the top left. The item that the player uses for conways game is a rat.

## Level 2: the river
Here the player is in the river and is trying to get to the dock. The river is shaped like the confluence Y in Chicago and the player is trying to get to the east dock next to the locks. The item the player is using is a dead fish.

## Level 3: the streets
Here the player is in the top right and is trying to get to the bottom left. They have to navigate a gridded structure. The buildings are in between the grid and some are recognizable like the wrigley building and the thomspon center. The item the player is using is a brick. If the player wins here they win the game.


Notes for implementation:
- Make each game level "simulatable" without playing it in the browser with command line javascript- Ensure there is a solution for each level and output it in a file it should consist both of the rules and initial setup of the game. 
