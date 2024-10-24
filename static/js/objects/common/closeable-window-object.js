import { BasePressableGameObject } from "../base/base-pressable-game-object.js";
import { BackdropObject } from "./backdrop-object.js";
export class CloseableWindowObject extends BasePressableGameObject {
    canvas;
    TITLE_BAR_HEIGHT = 40;
    TEXT_LINE_HEIGHT = 20;
    backdropObject;
    windowX = 0;
    windowY = 0;
    windowWidth = 0;
    windowHeight = 0;
    titleBarText = "SERVER MESSAGE";
    titleBarTextX = 0;
    titleBarTextY = 0;
    titleTextX = 0;
    titleTextY = 0;
    contentTextX = 0;
    contentTextY = 0;
    contentTextMaxWidth = 0;
    title = "Title";
    content = "Content goes here";
    opened = false;
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.backdropObject = new BackdropObject(this.canvas);
        this.setInitialState();
    }
    load() {
        this.backdropObject.load();
        super.load();
    }
    isOpened() {
        return this.opened;
    }
    isClosed() {
        return this.opened === false;
    }
    open(titleBarText, title, content) {
        if (this.opened === false) {
            this.fadeIn(0.2);
        }
        this.opened = true;
        this.titleBarText = titleBarText;
        this.title = title;
        this.content = content;
        this.active = true;
    }
    close() {
        if (this.opened === false) {
            return console.warn("CloseableWindowObject is already closed");
        }
        this.fadeOut(0.2);
        this.opened = false;
        this.active = false;
    }
    update(deltaTimeStamp) {
        if (this.pressed) {
            this.close();
        }
        this.backdropObject.update(deltaTimeStamp);
        super.update(deltaTimeStamp);
    }
    render(context) {
        context.globalAlpha = this.opacity;
        this.backdropObject.render(context);
        // Background
        context.fillStyle = "rgb(0, 0, 0, 1)";
        context.fillRect(this.windowX, this.windowY, this.windowWidth, this.windowHeight);
        // Title Bar
        context.fillStyle = "#333333"; // Title bar background color
        context.fillRect(this.windowX, this.windowY, this.windowWidth, this.TITLE_BAR_HEIGHT);
        // Window Title
        context.fillStyle = "#FFFFFF";
        context.font = "20px system-ui";
        context.textAlign = "left";
        context.fillText(this.titleBarText, this.titleBarTextX, this.titleBarTextY);
        // Title
        context.fillStyle = "#FFFFFF";
        context.font = "20px system-ui";
        context.textAlign = "left";
        context.fillText(this.title, this.titleTextX, this.titleTextY);
        // Content
        context.fillStyle = "#FFFFFF";
        context.font = "16px system-ui";
        context.textAlign = "left";
        // Text wrapping
        const lines = this.wrapText(context, this.content, this.contentTextMaxWidth);
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], this.contentTextX, this.contentTextY + (i * this.TEXT_LINE_HEIGHT));
        }
        context.globalAlpha = 1; // Reset global alpha
        super.render(context);
    }
    setInitialState() {
        this.opacity = 0;
        this.active = false;
        this.setSize();
        this.setCenterPosition();
        this.calculatePositions();
    }
    setSize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.windowWidth = this.canvas.width * 0.9;
        this.windowHeight = 300;
    }
    setCenterPosition() {
        this.windowX = (this.canvas.width - this.windowWidth) / 2;
        this.windowY = (this.canvas.height - this.windowHeight) / 2;
    }
    calculatePositions() {
        this.titleBarTextX = this.windowX + 15;
        this.titleBarTextY = this.windowY + 28;
        this.titleTextX = this.windowX + 14;
        this.titleTextY = this.windowY + 68;
        this.contentTextX = this.windowX + 14;
        this.contentTextY = this.windowY + this.TITLE_BAR_HEIGHT + 62;
        this.contentTextMaxWidth = this.windowWidth - 20;
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
