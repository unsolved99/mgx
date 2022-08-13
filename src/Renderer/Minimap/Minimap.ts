import { Client } from "../../Client";
import { Player } from "../../World/Player";
import { Renderer } from "../Renderer";

export class Minimap {

	public renderer: Renderer;

	public canvas: HTMLCanvasElement = document.createElement("canvas");
	public ctx: CanvasRenderingContext2D = this.canvas.getContext("2d");

	public constructor(renderer: Renderer) {
		this.renderer = renderer;
		this.canvas.id = "minimap-nodes";
		document.getElementById("minimap").append(this.canvas);
	}

	public run() {
		let width = window.getComputedStyle(document.getElementById("minimap-nodes"), null).getPropertyValue("width");
		let height = window.getComputedStyle(document.getElementById("minimap-nodes"), null).getPropertyValue("height");
		width = width.substr(0, width.indexOf("p"));
		height = height.substr(0, height.indexOf("p"));
		this.canvas.width = Number(width);
		this.canvas.height = Number(height);
		const ctx = this.ctx;
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawView();
		this.drawGhostCells();
		this.drawTeamPlayers();
		this.drawPlayer();
	}

	private drawTeamPlayers() {
		const color = this.renderer.mgxn3bx.options.theming.obj.minimapTeammateColor;
		const ctx = this.ctx;
		const ogario = this.renderer.mgxn3bx.game.ogario;
		ogario.mainSocket.teamPlayers.forEach((player) => {
			if (player.alive) {
				player.update();
				ctx.beginPath();
				ctx.fillStyle = color;
				const x = (7071 + player.animatedPos.x) / 14142 * this.canvas.width;
				const y = (7071 + player.animatedPos.y) / 14142 * this.canvas.height;
				ctx.arc(x, y, 5.5, 0, Math.TAU);
				ctx.fill();
				ctx.stroke();
				ctx.fillStyle = "#fff";
				ctx.textAlign = "center";
				ctx.textBaseline = "bottom";
				ctx.font = ".75vw Product Sans";
				ctx.fillText(player.nick, x, y - 6);
				ctx.stroke();
				ctx.closePath();
			}
		});
	}

	private drawGhostCells() {
		const color = this.renderer.mgxn3bx.options.theming.obj.minimapGhostCellsColor;
		const ctx = this.ctx;
		const client = this.renderer.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		if (this.renderer.mgxn3bx.options.settings.obj.minimapGhostCells) {
		if (client && client.world.ghostCells.size > 0) {
			client.world.ghostCells.forEach((ghostCell) => {
				ctx.beginPath();
				ctx.fillStyle = color;
				const x = (7071 + (ghostCell.position.x - client.world.offset.x)) / 14142 * this.canvas.width;
				const y = (7071 + (ghostCell.position.y - client.world.offset.y)) / 14142 * this.canvas.height;
				const size = ~~(ghostCell.size * (this.canvas.width) / 14e3);
				ctx.arc(x, y, size, 0, Math.TAU);
				ctx.fill();
				ctx.stroke();
				ctx.closePath();
			});
		}
	}
	}

	private drawPlayer() {
		const color = this.renderer.mgxn3bx.options.theming.obj.minimapSelfColor;
		const ctx = this.ctx;
		const client = this.renderer.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		const camera = this.renderer.mgxn3bx.game.camera;
		if (client) {
			const player = client.world.player;
			const offsetX = client.world.offset ? client.world.offset.x : 0;
			const offsetY = client.world.offset ? client.world.offset.y : 0;
			let x = player.state === Player.State.ALIVE ? player.position.x : camera.x;
			let y = player.state === Player.State.ALIVE ? player.position.y : camera.y;
			x = (7071 + (x - offsetX)) / 14142 * this.canvas.width;
			y = (7071 + (y - offsetY)) / 14142 * this.canvas.height;
			ctx.beginPath();
			ctx.fillStyle = color;
			ctx.arc(x, y, 5.5, 0, Math.TAU);
			ctx.fill();
			ctx.closePath();

		}
	}

	private drawView() {

		const client = this.renderer.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		const viewBounds = this.renderer.mgxn3bx.game.camera.viewBounds;
		const offsetX = client && client.world.offset ? client.world.offset.x : 0;
		const offsetY = client && client.world.offset ? client.world.offset.y : 0;

		this.drawRect(
			(7071 + (viewBounds.left - offsetX)) / 14142 * this.canvas.width,
			(7071 + (viewBounds.top - offsetY)) / 14142 * this.canvas.height,
			(7071 + (viewBounds.right - offsetX)) / 14142 * this.canvas.width,
			(7071 + (viewBounds.bottom - offsetY)) / 14142 * this.canvas.height,
		);

	}

	private drawRect(left: number, top: number, right: number, bottom: number) {
		const color = this.renderer.mgxn3bx.options.theming.obj.minimapViewportColor;
		const width = (right - left) | 0;
		const height = (bottom - top) | 0;
		const ctx = this.ctx;
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.4;
		ctx.fillRect(
			left,
			top,
			width,
			height,
		);
		ctx.closePath();
		ctx.restore();
	}

}
