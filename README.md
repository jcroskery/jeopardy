# Jeopardy-js
### Overview
What is Jeopardy-js? Simply put, it's a Jeopardy-style web game using Joycon Controllers.  

Jeopardy-js is a JavaScript implementation of the most famous quiz game of all time. The game uses a Nintendo Switch Pro Controller plus three regular JoyCons. The controllers are paired by Bluetooth to the hosting computer. The game incorporates a double-score round, Daily Doubles, and Final Jeopardy. 

<img width="960" alt="image" src="https://user-images.githubusercontent.com/37885174/176900927-494a440b-579e-4bf1-acdf-b63282e3dead.png">

### Instructions
Using Bluetooth, pair the required controllers to the device accessing the website. After pairing the controllers, the controller indicators on the bottom of the screen will change color. The game will begin once all controllers are paired. The host can use the Nintendo Switch Pro controller to select a question. Then, the teams will have a chance to buzz in by pressing any button on their JoyCon controller. The game will proceed until all rounds have been played; then, the game will show the final scores and announce the winner.

### Technical Details
The game uses a simple HTML frontend. The HTML5 Gamepad API is accessed by the `navigator.getGamepads()` function in JavaScript. This API handles inputs to the game. The game logic is also coded in JavaScript, using a custom-built state machine to handle the different phases of the game.
