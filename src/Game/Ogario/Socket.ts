import { Reader } from "../../Network/Reader";
import { Emitter } from "./Emitter";
import { Ogario } from "./Ogario";
import { Receiver } from "./Receiver";

export class Socket {

	public readonly type: Socket.Type;

	public ogario: Ogario;
	public webSocket: WebSocket;
	public handShakeKey: number = 401;
	public teamPlayers: Map<number, Ogario.TeamPlayer>;

	public player: Ogario.TeamPlayer;
	public tag: string;

	public lastTag: string;
	public lastNick: string;
	public lastPartyToken: string;
	public lastServerToken: string;

	private emitter: Emitter;
	private receiver: Receiver;
	private ip: string = "wss://snez.dev:8080/ws?030";

	public constructor(ogario: Ogario, type: Socket.Type) {
		this.ogario = ogario;
		this.type = type;
		this.teamPlayers = new Map();
		this.emitter = new Emitter(this);
		this.receiver = new Receiver(this);

		this.player = new Ogario.TeamPlayer(0);
		this.tag = "";

		this.connect();
	}

	public sendChat(message: string, type: number = 101) {
		const str = `${this.player.nick}: ${message}`;
		this.emitter.sendChatMessage(str, type);
	}

	public updateInterval() {
		this.teamPlayers.forEach((teamPlayer: Ogario.TeamPlayer) => {
			if (teamPlayer.alive && Date.now() - teamPlayer.updateTime >= 2000 || teamPlayer.mass === 0) {
				teamPlayer.alive = false;
			}
		});
		this.player.alive ? this.emitter.sendPlayerPositionUpdate() : void (0);
	}

	public spawn() {
		if (this.player.color.cell === "#000") {
			setTimeout(() => {
				this.spawn();
			}, 100);
			return;
		} else {
			this.emitter.sendPlayerSpawn();
		}
	}

	public death() {
		this.player.color.cell = "#000";
		this.emitter.sendPlayerDeath();
	}

	public updatePosition(x: number, y: number, mass: number) {
		this.player.position.x = x;
		this.player.position.y = y;
		this.player.mass = mass;
	}

	public join(serverToken: string, partyToken: string) {
		this.sendPartyData(serverToken, partyToken);
		this.emitter.sendPlayerDeath();
		this.emitter.sendPlayerJoin();
	}

	public sendPartyData(serverToken: string, partyToken: string) {
		this.emitter.sendPlayerTag();
		this.emitter.sendPartyToken(partyToken);
		this.emitter.sendServerToken(serverToken);
		this.emitter.sendPlayerNick();
	}

	public getOrCreate(id: number): Ogario.TeamPlayer {
		if (!this.teamPlayers.has(id)) {
			const player = new Ogario.TeamPlayer(id);
			this.teamPlayers.set(id, player);
		}
		return this.teamPlayers.get(id);

	}

	public connect() {
		this.webSocket = new WebSocket(this.ip);
		this.webSocket.binaryType = "arraybuffer";
		this.webSocket.onopen = () => this.emitter.sendHandShake();
		this.webSocket.onmessage = (packet: MessageEvent) => this.onMessage(packet.data);
	}

	public onMessage(ab: ArrayBuffer) {
		const buf = new Reader(ab);
		const opCode = buf.readUInt8();

		switch (opCode) {
			case 0:
				this.player.id = buf.readUInt32();
				break;
			case 1:
				this.emitter.sendPlayerUpdate();
				break;
			case 20:
				this.receiver.updateTeamPlayer(buf);
				break;
			case 30:
				this.receiver.updateTeamPlayerPosition(buf);
				break;
			case 100:
				this.receiver.getChatMessage(buf);
				break;
		}

	}

	public send(buf: ArrayBuffer | Buffer): void {
		if (this.isActive) { this.webSocket.send(buf); }
	}

	public get isActive(): boolean {
		if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
			return true;
		} else {
			return false;
		}

	}
}

export namespace Socket {

	export enum Type {
		MAIN,
		SEC,
	}

}
