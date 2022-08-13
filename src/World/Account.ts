import * as protobuf from "protobufjs";
import { Chat } from "../Menu/Chat";
import { Reader } from "../Network/Reader";
import { Notifications } from "../Utils/Notifications";

export class Account {

	public messageType: protobuf.Enum;

	public constructor() {
		protobuf.load("assets/protobuf/index.proto", (err: any, root: any) => {
			if (err) {
				console.log(err);
				return;
			}
			this.messageType = root.lookupEnum("MessageType");
		});
	}

	public readMobileData(view: DataView) {
		const { LOGIN_RESPONSE, DISCONNECT, ACTIVATE_TIMED_EVENT_RESPONSE } = this.messageType.values;

		const node = new Account.Reader(view, 1);
		let flags = node.readFlag();
		if (flags === 1) {
			node.setContentType();
		}
		flags = node.readFlag();
		if (flags === 2) {
			node.setUncompressedSize();
		}
		flags = node.readFlag();
		if (flags === 1) {
			const option = node.readUInt32();
			switch (option) {
				case LOGIN_RESPONSE:
					break;
				case DISCONNECT:
					console.log("You have been logged in elsewhere!");
					break;
				case ACTIVATE_TIMED_EVENT_RESPONSE:
					const messageString = Array.from(new Uint8Array(view.buffer)).map((a) => {
						return String.fromCharCode(a);
					}).join("");
					if (messageString.includes("hourlyBonus")) {
						if (messageString.includes("coin")) {
							Chat.addChatMessage("", Notifications.FREE_COINS_SUCCESS, 1);
						} else {
							Chat.addChatMessage("", Notifications.FREE_COINS_ERROR, 1);
						}
					}
					break;
				default:
					console.log(this.getOptionName(option));
					break;
			}
		}
	}

	private getOptionName(option: number) {
		return this.messageType.valuesById[option];
	}

}

export namespace Account {

	// tslint:disable-next-line: no-shadowed-variable
	export class Reader {

		public view: DataView;
		public offset: number;
		public contentType: number;
		public uncompressedSize: number;

		public constructor(view: DataView, offset: number) {
			this.view = view;
			this.offset = offset;
			this.contentType = 1;
			this.uncompressedSize = 0;
		}

		public readFlag() {
			return this.readUInt32() >>> 3;
		}

		public readByte() {
			return this.view.getUint8(this.offset++);
		}

		public skipByte() {
			const read = this.readByte();
			if (read < 128) {
				return;
			}
			this.skipByte();
		}

		public setContentType() {
			this.contentType = this.readUInt32();
		}

		public setUncompressedSize() {
			this.uncompressedSize = this.readUInt32();
		}

		public compareBytesGt(bytes1: number, bytes2: number) {
			const byte1 = bytes1 < 0;
			const byte2 = bytes2 < 0;
			if (byte1 !== byte2) {
				return byte1;
			}
			return bytes1 > bytes2;
		}
		public readUInt32() {
			let number = 0;
			let mayor = 0;
			while (true) {
				const read = this.readByte();
				if (this.compareBytesGt(32, mayor)) {
					if (read >= 128) {
						number |= (read & 127) << mayor;
					} else {
						number |= read << mayor;
						break;
					}
				} else {
					this.skipByte();
					break;
				}
				mayor += 7;
			}
			return number;
		}

	}

}
