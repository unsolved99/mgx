import { Client } from "../Client";
import { Player } from "../World/Player";
import { Game } from "./Game";
export class Camera {

	public viewBounds: {
		left: number;
		top: number;
		right: number;
		bottom: number;
	};
	public x: number;
	public y: number;
	public viewport: number;
	public targetViewport: number;
	public autoZoomViewport: number;
	public spectatePoint: {
		x: number;
		y: number;
	};
	public autoZoom: boolean;

	public constructor(public game: Game) {
		this.x = 0, this.y = 0,
		this.targetViewport = 0.055,
		this.autoZoomViewport = 0.055,
		this.viewport = 1, 
		
		this.viewBounds = {
			left: -960,
			right: 960,
			top: -540,
			bottom: 540,
		},
		this.spectatePoint = {
			x: 0,
			y: 0,
		};
		this.autoZoom = false;
	}

	public reset() {
		this.x = 0, this.y = 0, this.spectatePoint = {
			x: 0,
			y: 0,
		};
	}

	public update() {
		this.move();
		this.updateView();
	}
	public move() {
		const cli = this.game.app.clients.get(Client.Type.PLAYER_1);
		const cli2 = this.game.app.clients.get(Client.Type.PLAYER_2);
		if (cli || cli2) {
			const player = cli ? cli.world.player : null;
			const player2 = cli2 ? cli2.world.player : null;
			if (cli && player.state === Player.State.ALIVE || cli2 && player2.state === Player.State.ALIVE) {
				const speed = this.game.app.options.sliders.obj.cameraSpeed;
				let x;
				let y;
				x = this.game.multibox.x;
				y = this.game.multibox.y;

				// const mu = this.game.multibox;
				(this.x += (x - this.x) / speed, this.y += (y - this.y) / speed);
				this.spectatePoint = { x, y };

			} else if (true) {
				true && (this.x = (29 * this.x + this.spectatePoint.x) / 30, this.y = (29 * this.y + this.spectatePoint.y) / 30);
			}
		}
	}
	public updateView() {
		const ue = this.targetViewport;
		// this.game.hslo.menu.options.autoZoom === "on" && (ue *= this.autoZoomViewport);
		this.viewport += (ue - this.viewport) / 8;
		// this.viewport += (this.targetViewport - this.viewport) / 20;
		const fe = this.game.app.renderer.engine.width / 2 / this.viewport;
		const he = this.game.app.renderer.engine.height / 2 / this.viewport;
		let border = {
			left: -7071,
			top: -7071,
			right: 7071,
			bottom: 7071,
		};

		const cli = this.game.app.clients.get(Client.Type.PLAYER_1);
		if (cli && cli.world.border) {
			border = cli.world.border;
		}
		this.viewBounds.left = Math.max(-fe + this.x, border.left);
		this.viewBounds.right = Math.min(fe + this.x, border.right);
		this.viewBounds.top = Math.max(-he + this.y, border.top);
		this.viewBounds.bottom = Math.min(he + this.y, border.bottom);

	}

}
