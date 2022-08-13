import { Client } from "../Client";
import { Cells } from "./Cells";
import { Renderer } from "./Renderer";

export class Loop {

	public lastFrameTime: number;
	public lastFPSRequest: number;
	public renderedFrames: number;
	public fps: number;

	public constructor(public renderer: Renderer) {
		this.lastFPSRequest = 0;
		this.lastFrameTime = 0;
		this.renderedFrames = 0;
		this.fps = 0;
	}

	public run(): void {
		this.calcFrame();
		this.setViewport();
		this.renderer.spectrum.clear();
		if (this.renderer.mgxn3bx.options.settings.obj.audioVisualiser === true) {
			this.renderer.spectrum.render();
		}
		Cells.draw(this.renderer);
		this.renderer.cells.sortChildren();
		if (this.renderer.rainbowContainer) {
			this.renderer.hueCounter += this.renderer.mgxn3bx.options.sliders.obj.rainbowBorderSpeed;
			this.renderer.hueCounter >= 360 ? this.renderer.hueCounter = 0 : void (0);

			this.renderer.colorMatrix.hue(this.renderer.hueCounter, false);
		}
		this.renderer.app.renderer.render(this.renderer.world);
	}

	private setViewport() {
		this.renderer.world.position.set(this.renderer.engine.width / 2, this.renderer.engine.height / 2);
		const client = this.renderer.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		if (client && client.world.center) {
			this.renderer.spectrum.x = client.world.center.x;
			this.renderer.spectrum.y = client.world.center.y;
		}
		this.renderer.world.pivot.set(this.renderer.mgxn3bx.game.camera.x, this.renderer.mgxn3bx.game.camera.y);
		this.renderer.world.scale.set(this.renderer.mgxn3bx.game.camera.viewport);

	}

	private calcFrame() {
		this.lastFrameTime = performance.now();
		if (!this.lastFPSRequest) { this.lastFPSRequest = this.lastFrameTime; }

		if (this.lastFrameTime - this.lastFPSRequest >= 1000) {
			this.fps = this.renderedFrames;
			this.lastFPSRequest = this.lastFrameTime;
			this.renderedFrames = 0;
		}

		this.renderedFrames++;
	}

}
