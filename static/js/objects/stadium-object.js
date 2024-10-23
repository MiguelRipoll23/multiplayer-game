import { BaseGameObject } from "./base/base-game-object.js";
export class StadiumObject extends BaseGameObject {
    canvas;
    lightColors = [
        "#FF00FF",
        "#00FFFF",
        "#FFFF00",
        "#FF0000",
        "#00FF00",
    ]; // Neon colors
    currentColorIndex = 0;
    stadiumHeight = 200; // Height of the stadium
    lightUpdateInterval = 100; // Time (in ms) to update light colors
    lastLightUpdate = 0; // Last timestamp when the light color was updated
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    update(deltaTimeStamp) {
        // Update neon light colors over time
        if (deltaTimeStamp - this.lastLightUpdate > this.lightUpdateInterval) {
            this.currentColorIndex = (this.currentColorIndex + 1) %
                this.lightColors.length;
            this.lastLightUpdate = deltaTimeStamp;
        }
    }
    render(context) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        // Clear the canvas
        context.clearRect(0, 0, width, height);
        // Draw the stadium base
        context.fillStyle = "#222"; // Dark background for the stadium
        context.fillRect(0, height - this.stadiumHeight, width, this.stadiumHeight);
        // Draw neon lights (for example, on the stadium outline)
        context.strokeStyle = this.lightColors[this.currentColorIndex];
        context.lineWidth = 10;
        context.strokeRect(0, height - this.stadiumHeight, width, this.stadiumHeight);
        // Draw some futuristic elements
        context.fillStyle = "#888"; // Lighter color for details
        context.fillRect(50, height - this.stadiumHeight + 20, 100, 20); // Example details on the stadium
        context.fillRect(200, height - this.stadiumHeight + 50, 150, 30); // More details
        // Add more features as needed...
    }
}
