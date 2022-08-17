import { EventEmitter } from "events";

export class Socket extends EventEmitter {

	public static rotateKey(key: number) {
		key = Math.imul(key, 1540483477) | 0;
		key = (Math.imul(key >>> 24 ^ key, 1540483477) | 0) ^ 114296087;
		return (Math.imul(key >>> 13 ^ key, 1540483477) | 0) >>> 15 ^ (Math.imul(key >>> 13 ^ key, 1540483477) | 0);
	}

	public static xorMessageBytes(message: DataView, key: number) {
		for (let i = 0; i < message.byteLength; i++) {
			message.setUint8(i, message.getUint8(i) ^ key >>> i % 4 * 8 & 255);
		}

		return message;
	}

	public webSocket: WebSocket;
	public url: string;
	public encryptionKey: number;
	public decryptionKey: number;
	public clientVersionInt: number;
	private pingLoop: NodeJS.Timeout;

	public constructor(clientVersionInt: number) {
		super();

		this.clientVersionInt = clientVersionInt;
		this.webSocket = null;
		this.url = null;
	}

	public get serverToken(): string {
		if (this.isActive) {
			return this.url.match(/live-arena-([\w\d]+)\.agar\.io:\d+/)[1];
		} else {
			return "";
		}
	}

	public send(buffer: ArrayBuffer): void {
		if (this.isActive) {
			if (this.encryptionKey) {
				let view = new DataView(buffer);
				view = Socket.xorMessageBytes(view, this.encryptionKey);
				buffer = view.buffer;
				this.encryptionKey = Socket.rotateKey(this.encryptionKey);
			}
			this.webSocket.send(buffer);
		}
	}

	public connect(url: string): Promise<void> {
		return new Promise((resolve: () => void, reject: (err: string) => void) => {
			this.webSocket = new WebSocket(this.url = url);
			this.webSocket.binaryType = "arraybuffer";
			
			// Made Changes here
			this.webSocket.addEventListener("open", () => {
				const gamemode = $("#gamemode").val();
				if (gamemode === ":private") {
					const ping = new Uint8Array([254]);
					clearInterval(this.pingLoop);
					this.pingLoop = setInterval(() => this.send(ping), 500);
				}
				resolve();
			});
			//
			//this.webSocket.addEventListener("open", resolve);
			this.webSocket.addEventListener("message", (event: MessageEvent) => this.onMessage(event.data));
			this.webSocket.addEventListener("close", () => {
				this.emit("close");
				this.disconnect();
				// Made changes here
				const gamemode = $("#gamemode").val();
				if (gamemode === ":party") {
					clearInterval(this.pingLoop);
				}
			//
			});
			this.webSocket.addEventListener("error", () => {
				reject(`Failed to connect to ${this.url}`);

				this.webSocket = null;
				this.url = null;
			});
		});
	}

	public onMessage(buffer: ArrayBuffer): void {
		let view = new DataView(buffer);
		if (this.decryptionKey) {
			view = Socket.xorMessageBytes(view, this.decryptionKey ^ this.clientVersionInt);
		}
		this.emit("message", view.buffer);

	}

	public disconnect(): void {
		if (this.isActive) {
			this.webSocket.close();
		}

		this.webSocket = null;
		this.url = null;
	}

	public get isActive(): boolean {
		return this.webSocket !== null && this.webSocket.readyState === WebSocket.OPEN;
	}

}
