declare var $: any;

import { Client } from "../Client";
import { Cell } from "./Cell/Cell";
import { World } from "./World";
export class Player {

	public state: Player.State;
	public nick: string;
	public skin: string;
	public position: World.Vector;
	public topMass: number;
	public mass: number;
	public myCellIDS: Set<number>;
	public myCells: Map<number, Cell>;
	private world: World;

	public constructor(world: World) {
		this.world = world;
		this.state = Player.State.DEAD;
		this.position = { x: 0, y: 0 };
		this.mass = 0;
		this.topMass = 0;
		this.myCellIDS = new Set();
		this.myCells = new Map();
		this.setValues();
	}

	public update(client: Client) {
		this.averageVector(client);
	}

	private averageVector(client: Client) {
		let x = 0;
		let y = 0;
		let mass = 0;
		for (const cell of this.myCells.values()) {
			cell.animate();
			x += cell.animX / this.myCells.size;
			y += cell.animY / this.myCells.size;
			mass += cell.mass;
			client.app.game.ogario.mainSocket.player.alive = true;
		}
		this.position = { x, y };
		this.mass = mass;
		if (this.mass > this.topMass) { this.topMass = this.mass; }
		client.app.game.ogario.updatePosition(this.world.type, x - this.world.offset.x, y - this.world.offset.y, this.mass);
	}

	private setValues() {
		if (this.world.type === Client.Type.PLAYER_1) {
			this.nick = $("#user-name-1").val();
			this.skin = $("#user-skin-1").val();
		} else if (this.world.type === Client.Type.PLAYER_2) {
			this.nick = $("#user-name-2").val();
			this.skin = $("#user-skin-2").val();
		}
	}
}

export namespace Player {

	export enum State {
		ALIVE,
		DEAD,
		SPECTATING,
	}

}
