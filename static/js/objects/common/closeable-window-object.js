import { RED_TEAM_COLOR } from "../../constants/colors-constants.js";
import { BasePressableGameObject } from "../base/base-pressable-game-object.js";
import { BackdropObject } from "./backdrop-object.js";
export class CloseableWindowObject extends BasePressableGameObject {
    canvas;
    TITLE_BAR_HEIGHT = 40;
    TEXT_LINE_HEIGHT = 20;
    backdropObject;
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
        super(true);
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
        this.renderWindow(context);
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
        this.width = this.canvas.width * 0.9;
        this.height = 300;
    }
    setCenterPosition() {
        this.x = (this.canvas.width - this.width) / 2;
        this.y = (this.canvas.height - this.height) / 2;
    }
    calculatePositions() {
        this.titleBarTextX = this.x + 15;
        this.titleBarTextY = this.y + 28;
        this.titleTextX = this.x + 14;
        this.titleTextY = this.y + 68;
        this.contentTextX = this.x + 14;
        this.contentTextY = this.y + this.TITLE_BAR_HEIGHT + 62;
        this.contentTextMaxWidth = this.width - 25;
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
    renderWindow(context) {
        this.renderBackground(context);
        this.renderTitleBar(context);
        this.renderWindowTitle(context);
        this.renderContent(context);
    }
    renderBackground(context) {
        context.fillStyle = "rgb(255, 255, 255, 0.8)";
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    renderTitleBar(context) {
        context.fillStyle = RED_TEAM_COLOR;
        context.fillRect(this.x, this.y, this.width, this.TITLE_BAR_HEIGHT);
    }
    renderWindowTitle(context) {
        // Render the title bar text
        context.fillStyle = "#FFFFFF";
        context.font = "20px system-ui";
        context.textAlign = "left";
        context.fillText(this.titleBarText, this.titleBarTextX, this.titleBarTextY);
        // Render the main window title
        context.fillStyle = "#000000";
        context.font = "20px system-ui";
        context.fillText(this.title, this.titleTextX, this.titleTextY);
    }
    renderContent(context) {
        context.fillStyle = "#000000";
        context.font = "16px system-ui";
        context.textAlign = "left";
        const lines = this.wrapText(context, this.content, this.contentTextMaxWidth);
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], this.contentTextX, this.contentTextY + i * this.TEXT_LINE_HEIGHT);
        }
    }
}
