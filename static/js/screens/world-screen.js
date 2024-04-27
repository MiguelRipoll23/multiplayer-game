import { LocalCarObject } from "../objects/local-car-object.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { PlayerObject } from "../objects/player-object.js";
import { WorldBackgroundObject } from "../objects/world-background-object.js";
import { GoalObject } from "../objects/goal-object.js";
import { BallObject } from "../objects/ball-object.js";
import { ScoreboardObject } from "../objects/scoreboard-object.js";
import { StatusObject } from "../objects/status-object.js";
import { BaseCollidableGameObject } from "../objects/base/base-collidable-game-object.js";
export class WorldScreen extends BaseGameScreen {
    canvas;
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    loadObjects() {
        this.loadBackgroundObject();
        this.loadCountdownObject();
        this.loadBallObject();
        this.loadPlayerAndLocalCarObjects();
        this.loadGoalObjects();
        this.loadStatusObject();
        super.loadObjects();
    }
    loadBackgroundObject() {
        const backgroundObject = new WorldBackgroundObject(this.canvas);
        this.sceneObjects.push(backgroundObject);
    }
    loadCountdownObject() {
        const countdownObject = new ScoreboardObject(this.canvas);
        countdownObject.startCountdown(60 * 5);
        this.sceneObjects.push(countdownObject);
    }
    loadBallObject() {
        const ballObject = new BallObject(0, 0, 90, this.canvas);
        ballObject.setCenterPosition();
        this.sceneObjects.push(ballObject);
    }
    loadGoalObjects() {
        const orangeGoalObject = new GoalObject(true, this.canvas);
        const blueGoalObject = new GoalObject(false, this.canvas);
        this.sceneObjects.push(orangeGoalObject);
        this.sceneObjects.push(blueGoalObject);
    }
    loadPlayerAndLocalCarObjects() {
        const playerObject = this.loadAndGetPlayerObject();
        const localCarObject = new LocalCarObject(0, 0, 90, this.canvas);
        localCarObject.setCenterPosition();
        localCarObject.setPlayerObject(playerObject);
        // Scene
        this.sceneObjects.push(localCarObject);
        // UI
        this.uiObjects.push(localCarObject.getGearStickObject());
        this.uiObjects.push(localCarObject.getJoystickObject());
    }
    loadAndGetPlayerObject() {
        const playerObject = new PlayerObject("player1");
        this.sceneObjects.push(playerObject);
        return playerObject;
    }
    loadStatusObject() {
        const statusObject = new StatusObject(this.canvas);
        statusObject.setText("Waiting for players");
        statusObject.setActive(true);
        this.uiObjects.push(statusObject);
    }
    detectCollisions() {
        const collidableGameObjects = this.sceneObjects
            .filter((sceneObject) => sceneObject instanceof BaseCollidableGameObject);
        collidableGameObjects.forEach((collidableGameObject) => {
            collidableGameObject.setColliding(false);
            collidableGameObjects.forEach((otherCollidableGameObject) => {
                if (collidableGameObject === otherCollidableGameObject) {
                    return;
                }
                this.detectCollision(collidableGameObject, otherCollidableGameObject);
            });
        });
    }
    detectCollision(sceneObject, otherSceneObject) {
        const hitbox = sceneObject.getHitbox();
        const otherHitbox = otherSceneObject.getHitbox();
        if (!hitbox || !otherHitbox) {
            return;
        }
        if (this.hitboxesIntersect(hitbox, otherHitbox)) {
            sceneObject.setColliding(true);
            sceneObject.setCollidedObject(otherSceneObject);
        }
    }
    hitboxesIntersect(hitbox, otherHitbox) {
        return (hitbox.getX() < otherHitbox.getX() + otherHitbox.getWidth() &&
            hitbox.getX() + hitbox.getWidth() > otherHitbox.getX() &&
            hitbox.getY() < otherHitbox.getY() + otherHitbox.getHeight() &&
            hitbox.getY() + hitbox.getHeight() > otherHitbox.getY());
    }
}
