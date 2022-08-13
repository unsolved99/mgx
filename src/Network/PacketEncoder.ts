import { Client } from "../Client";
import { AutoUpdate } from "../Master/AutoUpdate";
import { Writer } from "./Writer";

export class PacketEncoder {

	public static sendSpawn(client: Client, nick: string, token?: string) {
		const ue = unescape(encodeURIComponent(nick));
		const fe = ue.length;
		let size = 2 + fe;
		if (token) {
			size += 10 + token.length;
		}
		const he = new DataView(new ArrayBuffer(size));
		let offset = 0;
		he.setUint8(offset++, 0);

		for (let ke = 0; ke < fe; ke++) { he.setUint8(offset++, ue.charCodeAt(ke)); }
		he.setUint8(offset++, 0);

		if (token) {
			for (let ke = 0; ke < token.length; ke++) { he.setUint8(offset++, token.charCodeAt(ke)); }
			he.setUint8(offset++, 0);
		}
		client.socket.send(he.buffer);
	}

	public static sendSplit(client: Client) {
		client.socket.send(this.actionPacket(17));
	}

	public static sendFeed(client: Client) {
		client.socket.send(this.actionPacket(21));
	}

	public static sendSpectate(client: Client) {
		client.socket.send(this.actionPacket(1));
	}

	public static sendFreeSpectate(client: Client) {
		client.socket.send(this.actionPacket(18));
	}

	public static sendHandshake(client: Client, info: AutoUpdate.Info) {
		let buf = new Writer(5);
		buf.writeUInt8(254);
		buf.writeUInt32(22/*info.protocol*/);
		client.socket.send(buf.dataView.buffer);
		buf = new Writer(5);
		buf.writeUInt8(255);
		buf.writeUInt32(info.clientVersionInt);
		client.socket.send(buf.dataView.buffer);
	}

	public static sendMouseMove(client: Client, x: number, y: number) {
		const buf: Writer = new Writer(13);
		buf.writeUInt8(16);
		buf.writeInt32(x);
		buf.writeInt32(y);
		buf.writeUInt32(client.socket.decryptionKey);
		client.socket.send(buf.buffer);
	}

	public static freeCoins(client: Client): void {
		const coinString = "hourlyBonus";
		const { ACTIVATE_TIMED_EVENT_REQUEST } = client.world.account.messageType.values;
		const bytes = [102, 8, 1, 18, 18, 8, ACTIVATE_TIMED_EVENT_REQUEST, 242, 6, 13, 10, 11];
		for (let i = 0; i < coinString.length; i++) {
			bytes.push(coinString.charCodeAt(i));
		}
		client.socket.send(new Uint8Array(bytes).buffer);
	}

	public static login(client: Client, token: string, info: AutoUpdate.Info, type: 2 | 4 = 2) {
		const clientVersionString = info.clientVersionString;
		const writer = new MessageWriter();
		writer.writeBytes([102, 8, 1, 18]);
		writer.writeUint32InLEB128(token.length + clientVersionString.length + 23);
		writer.writeBytes([8, 10, 82]);
		writer.writeUint32InLEB128(token.length + clientVersionString.length + 18);
		writer.writeBytes([8, type, 18, clientVersionString.length + 8, 8, 5, 18,
			clientVersionString.length, ...Buffer.from(clientVersionString), 24, 0, 32, 0, 26]);
		writer.writeUint32InLEB128(token.length + 3);
		writer.writeBytes([10]);
		writer.writeUint32InLEB128(token.length);
		writer.writeBytes(Buffer.from(token));
		client.socket.send(new Uint8Array(Buffer.from(writer.message)).buffer);
	}

	private static actionPacket(opCode: number): ArrayBuffer {
		return new Uint8Array([opCode]).buffer;
	}

}

class MessageWriter {
	public offset: number = 0;
	public message: any = 0;
	constructor(size?: number) {
		this.message = size ? Buffer.alloc(size) : [];
	}
	public writeUint8(value: number) {
		this.message.writeUInt8(value, this.offset++);
	}
	public writeInt32(value: number) {
		this.message.writeInt32LE(value, this.offset);
		this.offset += 4;
	}
	public writeUint32(value: number) {
		this.message.writeUInt32LE(value, this.offset);
		this.offset += 4;
	}
	public writeString(str: string) {
		for (let i = 0; i < str.length; i++) { this.writeUint8(str.charCodeAt(i)); }
		this.writeUint8(0);
	}
	public writeBytes(bytes: any) {
		this.message.push(...bytes);
	}
	public writeUint32InLEB128(value: number) { // https://en.wikipedia.org/wiki/LEB128#Unsigned_LEB128
		while (true) {
			if ((value & 128) === 0) {
				this.message.push(value);
				break;
			} else {
				this.message.push(value & 127 | 128);
				value >>>= 7;
			}
		}
	}
}
