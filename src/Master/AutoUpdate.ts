import { Chat } from "../Menu/Chat";
import { Notifications } from "../Utils/Notifications";

export class AutoUpdate {

	public static cacheKey: string = "MGxN3Bx-cache";

	public static async checkCache() {
		const oneHour = 60 * 60 * 1000;
		let storage: any = localStorage.getItem(this.cacheKey);
		try {
			storage = JSON.parse(storage);
			if ((Date.now() - storage.time) > oneHour) {
				localStorage.removeItem(this.cacheKey);
				return this.fetch();
			} else {
				console.log("[MGxN3Bx] Loaded from cache:", storage.info);
				Chat.addChatMessage("", Notifications.LOADED_INFO, 1);
				const cfg = { latestID: storage.info.latestID, url: storage.info.EnvConfig.config_url };
				storage.info.skins = this.parseSkins(await this.fetchSkins(cfg), cfg);
				return storage.info;
			}
		} catch (e) {
			return this.fetch();
		}
	}

	public static async fetch(): Promise<AutoUpdate.Info> {
		/* tslint:disable */
		let EnvConfig: AutoUpdate.EnvConfig;
		/* tslint:enable */
		const protocol = Number(await this.fetchProtocol());
		const mc = await this.fetchMC();
		(eval as any)(await this.fetchEnvConfig());
		const latestID = Number(await this.fetchLatestID(EnvConfig.master_url));
		const cfg = { latestID, url: EnvConfig.config_url };
		const skins = this.parseSkins(await this.fetchSkins(cfg), cfg);
		const clientVersionString = mc.match(/(?<=versionString=")[^"]+/)[0];
		const clientVersionInt = 10000 *
			parseInt(clientVersionString.split(".")[0]) + 100 *
			parseInt(clientVersionString.split(".")[1]) + parseInt(clientVersionString.split(".")[2]);
		const protoVersion = /proto-version.+?"(?<protoVersion>\d+.+?)"/gm.exec(mc)[1];
		const info = {
			protocol,
			clientVersionString,
			clientVersionInt,
			protoVersion,
			latestID,
			EnvConfig,
		};
		
		localStorage.setItem(this.cacheKey, JSON.stringify({
			time: Date.now(),
			info,
		}));
		console.log("[MGxN3Bx] Cached:", info);
		Chat.addChatMessage("", Notifications.CACHED_INFO, 1);
		return {
			protocol,
			clientVersionString,
			clientVersionInt,
			protoVersion,
			latestID,
			EnvConfig,
			skins,
		};
	}

	public static async fetchProtocol(): Promise<string> {
		return fetch("https://agar.io/agario.core.js").then((response) => response.text())
			.then((text) => text.match(/d;..\(.,(\d+)\);/)[1]);
	}

	public static async fetchMC(): Promise<string> {
		return fetch("https://agar.io/mc/agario.js").then((response) => response.text());
	}

	public static async fetchEnvConfig(): Promise<string> {
		return fetch("https://agar.io/").then((response) => response.text())
			.then((text) => text.match(new RegExp(/EnvConfig\s+=\s+{([\s\S]+?)}/g))[0]);
	}

	public static async fetchLatestID(masterUrl: string): Promise<string> {
		return fetch(`${masterUrl}/getLatestID`).then((response) => response.text());
	}
	public static async fetchSkins(cfg: { latestID: number; url: string }) {
		return fetch(`${cfg.url}/${cfg.latestID}/GameConfiguration.json`).then((response) => response.text());
	}
	public static parseSkins(obj: any, cfg: { latestID: number; url: string }) {
		const gameConfig = JSON.parse(obj).gameConfig;
		const skins: AutoUpdate.Skin[] = gameConfig["Gameplay - Equippable Skins"];
		const skinMap = new Map();
		for (const skin of skins) {
			skin.url = `${cfg.url}/${cfg.latestID}/${skin.image}`;
			skinMap.set(skin.productId, skin);
		}
		return skinMap;
	}
}

export namespace AutoUpdate {

	export interface Info {
		protocol: number;
		clientVersionString: string;
		clientVersionInt: number;
		protoVersion: string;
		latestID: number;
		skins: Map<string, AutoUpdate.Skin>;
		EnvConfig: AutoUpdate.EnvConfig;
	}
	export interface EnvConfig {
		env_local: string;
		env_production: string;
		fb_app_id: string;
		ga_trackingId: string;
		google_client_id: string;
		gift_object_id: string;
		master_url: string;
		socketEndpoint: string;
		xsolla_endpoint: string;
		fb_endpoint: string;
		game_url: string;
		supersonic_app_key: string;
		tap_research_api_key: string;
		interstitial_url: string;
		config_url: string;
		custom_skins_url: string;
		load_local_configuration: string;
		configID: string;
		configVersion: string;
		bacon_url: string;
		goliathUrl: string;
		apiKey: string;
		checksumKey: string;
		analyticsEnv: string;
		NR_licenseKey: string;
		NR_applicationID: string;
		datadog_appid: string;
		datadog_env: string;
		currentEnv: string;
	}

	export interface Skin {
		cellColor: string;
		gameplayId: 899;
		image: string;
		productId: string;
		skinType: string;
		url: string;
	}

}
