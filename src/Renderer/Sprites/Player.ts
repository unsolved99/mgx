import * as PIXI from "pixi.js";
import { Cell } from "../../World/Cell/Cell";

export class Player {
	public texture: PIXI.Texture;
	public container: PIXI.ParticleContainer;
	constructor() {
		this.texture = PIXI.Texture.WHITE;
		this.container = new PIXI.ParticleContainer();
	}
	public init() {
		this.createtexture();
	}
	public createtexture() {
		// create texture
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		canvas.width = 1024;
		canvas.height = 1024;
		ctx.save();
		ctx.beginPath();
		ctx.arc(512, 512, 512, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fillStyle = `#fff`;
		ctx.fill();
		ctx.restore();

		this.texture = PIXI.Texture.from(canvas);
	}
}
