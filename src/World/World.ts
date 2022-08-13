import { Client } from "../Client";
import { MGxN3Bx } from "../Init";
import { Menu } from "../Menu/Menu";
import { Account } from "./Account";
import { Cell } from "./Cell/Cell";
import { Leaderboard } from "./Leaderboard";
import { Player } from "./Player";

export class World {

	public type: Client.Type;
	public cells: Map<number | string, Cell>;
	public ghostCells: Map<number | string, World.GhostCell>;
	public sortedCells: Cell[];
	public center: World.Vector;
	public offset: World.Vector;
	public cellOffset: World.Vector;
	public border: World.Border;
	public focusedAtCenter: boolean;
	public spectatePos: World.Vector;
	public viewBounds: {
		left: number;
		top: number;
		right: number;
		bottom: number;
	};
	public leaderBoard: Leaderboard;
	public player: Player;
	public account: Account;

	public constructor(type: Client.Type) {
		this.cells = new Map();
		this.ghostCells = new Map();
		this.type = type;
		this.account = new Account();
		this.center = { x: 0, y: 0 };
		this.offset = { x: 0, y: 0 };
		this.cellOffset = { x: 0, y: 0 };
		this.spectatePos = { x: 0, y: 0 };
		this.focusedAtCenter = false;
		this.sortedCells = [];
		this.player = new Player(this);
		this.leaderBoard = new Leaderboard();
	}

	public getOrCreate(id: number, client: Client): Cell {
		if (this.cells.has(id)) {
			return this.cells.get(id);
		} else {
			return new Cell(id, client);
		}
	}

	public eatCell(victim: Cell, killer: Cell, client: Client) {
		if (killer && victim) {
			victim.x = killer.x;
			victim.y = killer.y;
			victim.radius = victim.animRadius;
			const time = client.mgxn3bx.time;
			victim.lastUpdateTime = time;
			victim.fadeStartTime = time;
			victim.cellRender.destroy();
			this.cells.delete(victim.id);
			// this.cells.set(`${victim.id}:removed`, victim);
			this.playerDeath(victim.id, client);
		}
	}

	public removeCell(cell: Cell, client: Client) {
		if (cell) {
			cell.cellRender.destroy();
			this.cells.delete(cell.id);
			cell.animate();
			const time = client.mgxn3bx.time;
			cell.fadeStartTime = time;
			cell.lastUpdateTime = time;
			// this.cells.set(cell.id + ":removed", cell);
			this.playerDeath(cell.id, client);
		}
	}

	public sort(client: Client) {
		this.player.update(client);
		this.sortedCells = [];
		const cli = client.mgxn3bx.clients.get(Client.Type.PLAYER_1);
		this.cells.forEach((cell, ke) => {
			let render = true;
			if (client.type !== Client.Type.PLAYER_1 && client.type !== Client.Type.PLAYER_2 && client.type !== Client.Type.SPECTATE) {
				if (cell.type === Cell.Type.FOOD) {
					render = false;
				}
				if (client.mgxn3bx.game.fullMap.inPosition === false) {
					render = false;
				}
			}
			if (render) {
				this.sortedCells.push(cell);
			}
		});
	}

	public isInView(cell: Cell, viewBounds: { left: number; top: number; right: number; bottom: number; }) {
		return !(cell.animX + cell.animRadius < viewBounds.left) &&
			!(cell.animX - cell.animRadius > viewBounds.right) && !(cell.animY + cell.animRadius < viewBounds.top)
			&& !(cell.animY - cell.animRadius > viewBounds.bottom);
	}
	public isInRectangle(cell: Cell, viewBounds: { left: number; top: number; right: number; bottom: number; }) {
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

	public getLocation(x: number, y: number): string {
		const border = this.border || { left: -7071, top: -7071, right: 7071, bottom: 7071 };
		let he = 0 | (x - border.left) / 2828;
		let ke = 0 | (y - border.top) / 2828;
		return he = 0 > he ? 0 : 4 < he ? 4 : he, ke = 0 > ke ? 0 : 4 < ke ? 4 : ke, String.fromCharCode(65 + ke) + (he + 1);
	}

	private playerDeath(id: number, client: Client) {
		if (this.isMe(id)) {
			this.player.myCellIDS.delete(id);
			this.player.myCells.has(id) ? this.player.myCells.delete(id) : void (0);
			if (this.player.myCellIDS.size === 0) {
				this.player.state = Player.State.DEAD;
				client.mgxn3bx.game.ogario.playerDeath(client.type);
				client.mgxn3bx.game.multibox.death(this.type);
			}
		}
	}

	private isMe(id: number): boolean {
		if (this.player.myCellIDS.has(id)) {
			return true;
		} else {
			return false;
		}
	}

}

export namespace World {

	export interface Border {
		left: number;
		top: number;
		right: number;
		bottom: number;
		width: number;
		height: number;
	}
	export interface Vector {
		x: number;
		y: number;
	}
	export class GhostCell {

		public id: number;
		public position: World.Vector;
		public size: number;
		public mass: number;

		public constructor(id: number) {
			this.id = id;
		}

	}

}
