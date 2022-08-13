import { Client } from "../Client";
import { MGxN3Bx } from "../Init";
import { Cell } from "../World/Cell/Cell";

export class Viewport {

	public static isInRectangle(cell: Cell, viewBounds: {
		left: number;
		top: number;
		right: number;
		bottom: number;
	}): boolean {
		if (!viewBounds) {
			return false;
		}
		const left = viewBounds.left;
		const top = viewBounds.top;
		const right = viewBounds.right;
		const bottom = viewBounds.bottom;
		const x = cell.animX;
		const y = cell.animY;
		if (x >= left && x <= right && y >= top && y <= bottom) {
			return true;
		} else {
			return false;
		}

	}

	public static checkViewport(cell: Cell, mgxn3bx: MGxN3Bx): boolean {
		const cli = mgxn3bx.clients.get(Client.Type.PLAYER_1);
		const cli2 = mgxn3bx.clients.get(Client.Type.PLAYER_2);
		const spectate = mgxn3bx.clients.get(Client.Type.SPECTATE);
		let visible = true;
		if (cell.client.type !== Client.Type.PLAYER_1 && cell.client.type !== Client.Type.PLAYER_2 && cell.client.type !== Client.Type.SPECTATE) {
			if (this.isInRectangle(cell, cli.world.viewBounds)) { visible = false; }
			if (cli2 && this.isInRectangle(cell, cli2.world.viewBounds)) { visible = false; }
			if (spectate && this.isInRectangle(cell, spectate.world.viewBounds)) { visible = false; }
		}
		if (cell.client.type === Client.Type.PLAYER_1 && cli2) {
			cli2.world.player.myCells.forEach((playerCell: Cell) => {
				visible = !(cell.isMeOtherTab(playerCell));
			});
		}
		if (cell.client.type === Client.Type.PLAYER_2 && this.isInRectangle(cell, cli.world.viewBounds) && !cell.isMe) { visible = false; }
		if (cell.client.type === Client.Type.SPECTATE && cli2 && this.isInRectangle(cell, cli2.world.viewBounds)) { visible = false; }
		if (cell.client.type === Client.Type.SPECTATE && this.isInRectangle(cell, cli.world.viewBounds)) { visible = false; }

		return visible;
	}

}
