import { Client } from "../Client";
import { PacketEncoder } from "../Network/PacketEncoder";
import { Player } from "../World/Player";
import { Game } from "./Game";
export class Mouse {

	public x: number;
	public y: number;

	public canvasX: number;
	public canvasY: number;

	public game: Game;

	public constructor(game: Game) {
		this.game = game;
		this.addEvents();
	}

	public addEvents() {
		const canvas = this.game.mgxn3bx.renderer.app.view;
		// this.addEventsElement(canvas);
		this.addEventsElement(document.getElementsByClassName("hud")[0]);
	}

	public addEventsElement(element: Element) {
		element.addEventListener("mousemove", (ue: any) => {
			this.x = ue.clientX, this.y = ue.clientY;
		}), element.addEventListener("mousedown", (ue: any) => {
			this.onMouseClick(ue);
		}), element.addEventListener("mouseup", (ue: any) => {
			this.onMouseRelease(ue);
		}), element.addEventListener("wheel", (ue: any) => {
			this.onMouseWheel(ue);
		}), element.addEventListener("contextmenu", (ue: any) => {
			ue.preventDefault();
		});
	}

	public onMouseClick(ue: any): any {
		ue.preventDefault();
		let fe: any = !1;
		switch (ue.which) {
			case 1:
				fe = "leftClick";
				break;
			case 2:
				fe = "middleClick";
				break;
			case 3:
				fe = "rightClick";
		}
	}

	public onMouseRelease(ue: any): any {

	}

	public onMouseWheel(ue: any) {
		const zoomSpeed = this.game.mgxn3bx.options.sliders.obj.zoomSpeed;
		let fe = this.game.camera.targetViewport;
		0 > ue.wheelDelta ? fe *= zoomSpeed / 100 : fe /= zoomSpeed / 100, fe = 2 < fe ? 2 : 0.02 > fe ? 0.02 : fe;
		this.game.camera.targetViewport = fe;
	}

	public send() {
		const canvas = this.game.mgxn3bx.renderer.app.view;
		this.canvasX = (this.x - canvas.width / 2) / this.game.camera.viewport + this.game.camera.x;
		this.canvasY = (this.y - canvas.height / 2) / this.game.camera.viewport + this.game.camera.y;
		const cli = this.game.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		const cli2 = this.game.mgxn3bx.clients.get(Client.Type.PLAYER_2);
		if (cli && cli.world.player.state !== Player.State.DEAD || cli2 && cli2.world.player.state !== Player.State.DEAD) {
			this.game.multibox.mouseMove(this.canvasX, this.canvasY);
		}
	}

}
