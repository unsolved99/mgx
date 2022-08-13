import { AutoUpdate } from "./AutoUpdate";

export class Request {

	public static async getRegionsInfo(info: AutoUpdate.Info) {
		return this.sendRequest(`${info.EnvConfig.master_url}/info`, null, info);
	}

	public static async joinParty(region: string, token: string, info: AutoUpdate.Info, callback: (res: any) => void) {
		const res = await this.getTokenIp(region, token, info);
		callback(res);
	}

	public static async getServer(region: string, mode: string, info: AutoUpdate.Info, callback: (res: any) => void) {
		const realm = region + mode;
		if (":party" === mode) { return this.getPartyServer(region, mode, info, callback); }
		const arr = new Array(10, 4 + realm.length, 10, realm.length);

		arr[4 + realm.length] = 18;
		arr[5 + realm.length] = 0;
		for (let i = 0; i < realm.length; i++) { arr[4 + i] = realm.charCodeAt(i); }

		return this.sendRequest("findServer", new Uint8Array(arr), info);
	}

	public static async createToken(region: string, mode: string, info: AutoUpdate.Info) {
		const realm = region + mode;
		const arr = new Array(10, realm.length + 4, 10, realm.length);

		arr[4 + realm.length] = 18;
		arr[5 + realm.length] = 0;
		for (let i = 0; i < realm.length; i++) { arr[4 + i] = realm.charCodeAt(i); }

		const res = await this.sendRequest("createToken", new Uint8Array(arr), info);
		return res.token;

	}

	public static async getPartyServer(region: string, mode: string, info: AutoUpdate.Info, callback: (res: any) => void) {
		const token = await this.createToken(region, mode, info);
		const res = await this.getTokenIp(region, token, info);
		res.token = token;
		callback(res);
	}

	private static async getTokenIp(region: string, token: string, info: AutoUpdate.Info) {
		const arr = new Array(10, 4 + region.length, 10, region.length);

		arr[4 + region.length] = 18;
		arr[5 + region.length] = 0;
		arr[6 + region.length] = 26;
		arr[7 + region.length] = 8;
		arr[8 + region.length] = 10;
		arr[9 + region.length] = token.length;
		for (let i = 0; i < region.length; i++) { arr[4 + i] = region.charCodeAt(i); }
		for (let i = 0; i < token.length; i++) { arr[10 + region.length + i] = token.charCodeAt(i); }

		return this.sendRequest("getToken", new Uint8Array(arr), info);
	}

	private static async sendRequest(action: string, payload: Uint8Array, info: AutoUpdate.Info) {
		const url = !action.includes("agario") ? "".concat(info.EnvConfig.master_url, "/v4/").concat(action) : action;
		return await fetch(url, {
			method: "POST",
			headers: {
				"Accept": "text/plain, */*, q=0.01",
				"Content-Type": `application/octet-stream`,
				"x-support-proto-version": info.protoVersion,
				"x-client-version": `${info.clientVersionInt}`,
			},
			body: payload,
		}).then((res: any) => {
			return res.json();
		}).then((res: any) => {
			return res;
		});
	}

	private static setHeaders(xhr: XMLHttpRequest, info: AutoUpdate.Info) {
		xhr.setRequestHeader("Accept", "text/plain");
		xhr.setRequestHeader("Accept", "*/*");
		xhr.setRequestHeader("Accept", "q=0.01");
		xhr.setRequestHeader("Content-Type", `application/octet-stream`);
		xhr.setRequestHeader("x-support-proto-version", info.protoVersion);
		xhr.setRequestHeader("x-client-version", `${info.clientVersionInt}`);
	}

}
