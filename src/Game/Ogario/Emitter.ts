import { Reader } from "../../Network/Reader";
import { Writer } from "../../Network/Writer";
import { Ogario } from "./Ogario";
import { Socket } from "./Socket";

export class Emitter {

	public socket: Socket;

	public constructor(socket: Socket) {
		this.socket = socket;
	}

	public sendChatMessage(str: string, type: number) {
		const buf = new Writer(12 + str.length * 2);
		buf.writeUInt8(100);
		buf.writeUInt8(type);
		buf.writeUInt32(this.socket.player.id);
		buf.writeUInt32(0);
		buf.writeString16(str);
		this.socket.send(buf.buffer);
	}

	public sendHandShake(): void {
		const buf = new Writer(3);
		buf.writeUInt8(0);
		buf.writeUInt16(this.socket.handShakeKey);
		this.socket.send(buf.buffer);
	}

	public sendPlayerSpawn() {
		this.socket.player.alive = true;
		this.sendPlayerState(1);
	}

	public sendPlayerDeath() {
		this.socket.player.alive = false;
		this.sendPlayerState(2);
	}

	public sendPlayerJoin() {
		this.socket.player.alive = false;
		this.sendPlayerState(3);
	}

	public sendPlayerNick() {
		if (this.socket.lastNick !== this.socket.player.nick) {
			this.socket.lastNick = this.socket.player.nick;
			this.sendString(10, this.socket.player.nick);
		}
	}

	public sendPlayerTag() {
		if (this.socket.lastTag !== this.socket.tag) {
			this.socket.lastTag = this.socket.tag;
			this.sendString(11, this.socket.tag);
			this.socket.teamPlayers.clear();
		}
	}

	public sendPartyToken(token: string) {
		if (this.socket.lastPartyToken !== token) {
			this.socket.lastPartyToken = token;
			this.sendString(15, token);
		}
	}

	public sendServerToken(token: string) {
		if (this.socket.lastServerToken !== token) {
			this.socket.lastServerToken = token;
			this.sendString(16, token);
			this.socket.teamPlayers.clear();
		}
	}

	public sendServerRegion(region: string) {
		this.sendString(17, region);
	}

	public sendServerGamemode(gamemode: string) {
		this.sendString(18, gamemode);
	}

	public sendPlayerUpdate() {
		const player = this.socket.player;
		let size = 13; // Opcode + ID + Null terminators
		size += player.nick.length * 2 + player.skin.length * 2 + player.skin.length * 2 + player.color.cell.length * 2 + player.color.custom.length * 2;

		const buf = new Writer(size);
		buf.writeUInt8(20);
		buf.writeUInt32(player.id);
		buf.writeString16(player.nick);
		buf.writeString16(player.skin);
		buf.writeString16(player.color.custom);
		buf.writeString16(player.color.cell);
		this.socket.send(buf.buffer);
	}

	public sendPlayerPositionUpdate() {
		const player = this.socket.player;

		const buf = new Writer(17);
		buf.writeUInt8(30);
		buf.writeUInt32(player.id);
		buf.writeInt32(player.position.x);
		buf.writeInt32(player.position.y);
		buf.writeUInt32(player.mass);
		this.socket.send(buf.buffer);
	}

	private sendPlayerState(state: 1 | 2 | 3) {
		const buf = new Writer(1);
		buf.writeUInt8(state);
		this.socket.send(buf.dataView.buffer);
	}

	private sendString(opCode: number, str: string) {
		const view = new DataView(new ArrayBuffer(1 + 2 * str.length));
		view.setUint8(0, opCode);
		for (let i = 0; i < str.length; i++) {
			view.setUint16(1 + 2 * i, str.charCodeAt(i), true);
		}
		this.socket.send(view.buffer);
	}

}
