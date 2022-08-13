import { Client } from "../Client";
import { Chat } from "../Menu/Chat";
import { PacketEncoder } from "../Network/PacketEncoder";
import { Cell } from "../World/Cell/Cell";
import { World } from "../World/World";
import { Game } from "./Game";
export class FullMap {

	public inPosition: boolean;

	private game: Game;
	private locations: Map<Client.Type, World.Vector>;
	private inLocation: number = 0;

	public constructor(game: Game) {
		this.game = game;
		this.inPosition = false;
		this.locations = new Map();
		this.setLocations();
	}

	public reset() {
		this.inPosition = false;
		this.inLocation = 0;
	}

	public sendToLocation(client: Client) {
		const location = this.locations.get(client.type);
		const x = location.x + client.world.offset.x;
		const y = location.y + client.world.offset.y;
		PacketEncoder.sendMouseMove(client, x, y);
		const interval = setInterval(() => {
			const xInLocation = this.isClose(x, client.world.spectatePos.x);
			const yInLocation = this.isClose(y, client.world.spectatePos.y);
			if (xInLocation && yInLocation) {
				this.inLocation++;
				if (this.inLocation === 15) {
					this.inPosition = true;
					Chat.addChatMessage("", "Full map view ready!", 1);
				}
				clearInterval(interval);
			}
		}, 1000);
	}
	private setLocations() {
		const width = 5071;
		const height = 3038;
		let i = 1;
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 0, y: 0,
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 0, y: 7071 - (height / 2),
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 0, y: -7071 + (height / 2),
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 0 + width, y: 0,
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 0 - (width), y: 0,
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: -7071 + (width / 2), y: -7071 + (height / 2),
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: -7071 + (width / 2), y: 7071 - (height / 2),
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 7071 - (width / 2), y: 7071 - (height / 2),
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 7071 - (width / 2), y: -7071 + (height / 2),
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 0, y: 0 + (height),
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 0, y: 0 - (height),
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 0 + width, y: 0 + (height),
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 0 - width, y: 0 - (height),
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 0 - width, y: 0 + (height),
		});
		this.locations.set((Client as any).Type["FULLMAP_" + i++], {
			x: 0 + width, y: 0 - (height),
		});
	}

	private isClose(n: number, n2: number): boolean {
		const i = n - n2;
		if (-2 <= i && i <= 2) {
			return true;
		} else {
			return false;
		}
	}

}
