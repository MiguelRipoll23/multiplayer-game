export class Target {
    canvas;
    radius;
    xPos;
    yPos;
    scale;
    opacity;
    fadeInDuration;
    constructor(canvas) {
        this.canvas = canvas;
        this.radius = 10; // Radius of the circle
        this.scale = 0; // Initial scale
        this.opacity = 0; // Initial opacity
        this.fadeInDuration = 1000; // Fade in duration in milliseconds
        // Set random position for the circle
        this.xPos = Math.random() * (this.canvas.width - this.radius * 2) +
            this.radius;
        this.yPos = Math.random() * (this.canvas.height - this.radius * 2) +
            this.radius;
    }
    update(deltaTimeStamp) {
        // Implement scaling animation
        if (this.scale < 1) {
            // Ease-in scaling
            this.scale += deltaTimeStamp / this.fadeInDuration;
            this.scale = Math.min(this.scale, 1);
        }
        // Implement fade-in animation
        if (this.opacity < 1) {
            // Ease-in opacity
            this.opacity += deltaTimeStamp / this.fadeInDuration;
            this.opacity = Math.min(this.opacity, 1);
        }
    }
    render(context) {
        // Save the context state
        context.save();
        // Set the circle color to yellow with the specified opacity
        context.fillStyle = `rgba(255, 165, 0, ${this.opacity})`;
        // Scale and draw the circle
        context.beginPath();
        context.arc(this.xPos, this.yPos, Math.abs(this.radius) * this.scale, 0, Math.PI * 2);
        context.fill();
        context.closePath();
        // Restore the context state
        context.restore();
    }
}
