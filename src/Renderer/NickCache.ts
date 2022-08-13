import { NickText } from "./Sprites/NickText";

export class NickCache {

	public static cache: Map<string, NickText> = new Map();

	public static get(nick: string, app: PIXI.Application): NickText {
		if (this.cache.has(nick)) {
			return this.cache.get(nick);
		} else {
			const nickText = new NickText(nick, app);
			this.cache.set(nick, nickText);
			return this.cache.get(nick);
		}
	}

}
