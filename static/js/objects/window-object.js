import { BaseGameObject } from "./base/base-game-object.js";
export class WindowObject extends BaseGameObject {
    canvas;
    TITLE_BAR_HEIGHT = 40;
    TEXT_LINE_HEIGHT = 20;
    x = 0;
    y = 0;
    width = 600;
    height = 350;
    globalAlpha = 0;
    titleBarTextX = 0;
    titleBarTextY = 0;
    newsTitleTextX = 0;
    newsTitleTextY = 0;
    contentTextX = 0;
    contentTextY = 0;
    contentTextMaxWidth = 0;
    index = 0;
    title = "Title";
    content = "Content goes here";
    hidden = false;
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.width = this.canvas.width * 0.9;
        this.setCenterPosition();
        this.calculatePositions();
    }
    setCenterPosition() {
        this.x = (this.canvas.width - this.width) / 2;
        this.y = (this.canvas.height - this.height) / 2;
    }
    show(index, title, content) {
        this.index = index;
        this.title = title;
        this.content = content;
        this.globalAlpha = 1;
        this.hidden = false;
        this.addEventListeners();
    }
    getIndex() {
        return this.index;
    }
    hide() {
        this.globalAlpha = 0;
        this.hidden = true;
        this.removeEventListeners();
    }
    isHidden() {
        return this.hidden;
    }
    update(deltaTimeStamp) { }
    render(context) {
        context.globalAlpha = this.globalAlpha;
        // Background
        context.fillStyle = "rgba(0, 0, 0, 1)";
        context.fillRect(this.x, this.y, this.width, this.height);
        // Title Bar
        context.fillStyle = "#333333"; // Title bar background color
        context.fillRect(this.x, this.y, this.width, this.TITLE_BAR_HEIGHT);
        // Window Title
        context.fillStyle = "#FFFFFF";
        context.font = "20px system-ui";
        context.textAlign = "left";
        context.fillText("NEWS", this.titleBarTextX, this.titleBarTextY);
        // News Title
        context.fillStyle = "#FFFFFF";
        context.font = "20px system-ui";
        context.textAlign = "left";
        context.fillText(this.title, this.newsTitleTextX, this.newsTitleTextY);
        // News Content
        context.fillStyle = "#FFFFFF";
        context.font = "16px system-ui";
        context.textAlign = "left";
        // Text wrapping
        const lines = this.wrapText(context, this.content, this.contentTextMaxWidth);
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], this.contentTextX, this.contentTextY + (i * this.TEXT_LINE_HEIGHT));
        }
        context.globalAlpha = 1; // Reset global alpha
    }
    calculatePositions() {
        this.titleBarTextX = this.x + 15;
        this.titleBarTextY = this.y + 28;
        this.newsTitleTextX = this.x + 14;
        this.newsTitleTextY = this.y + 68;
        this.contentTextX = this.x + 14;
        this.contentTextY = this.y + this.TITLE_BAR_HEIGHT + 62;
        this.contentTextMaxWidth = this.width - 20;
    }
    addEventListeners() {
        this.canvas.addEventListener("click", this.handleClick.bind(this));
    }
    removeEventListeners() {
        this.canvas.removeEventListener("click", this.handleClick.bind(this));
    }
    handleClick(event) {
        if (this.hidden) {
            return;
        }
        this.hide();
    }
    wrapText(context, text, maxWidth) {
        const words = text.split(" ");
        const lines = [];
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = context.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            }
            else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
}
