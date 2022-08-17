import { application } from "./Init";
import { Socket } from "./Network/Socket";
import { World } from "./World/World";

export class Client {

	public readonly type: Client.Type;
	public readonly socket: Socket;
	public readonly world: World;

	public constructor(type: Client.Type, socket: Socket, public app: application) {
		this.type = type;
		this.socket = socket;
		this.world = new World(type);
	}
}

export namespace Client {

	export enum Type {
		PLAYER_1,
		PLAYER_2,
		SPECTATE,
		FULLMAP_1,
		FULLMAP_2,
		FULLMAP_3,
		FULLMAP_4,
		FULLMAP_5,
		FULLMAP_6,
		FULLMAP_7,
		FULLMAP_8,
		FULLMAP_9,
		FULLMAP_10,
		FULLMAP_11,
		FULLMAP_12,
		FULLMAP_13,
		FULLMAP_14,
		FULLMAP_15,
	}

}
