export class Storage {

	public static prefix: string = "MGxN3Bx-";

	public static set(key: string, value: string | object, group: Storage.Group) {
		let groupObj = JSON.parse(localStorage.getItem(this.prefix + group));
		return null === groupObj && (groupObj = {}), groupObj[key] = value, localStorage.setItem(this.prefix + group, JSON.stringify(groupObj));
	}

	public static get(key: string, group: Storage.Group) {
		const groupObj = JSON.parse(localStorage.getItem(this.prefix + group));
		return groupObj === null ? groupObj : groupObj[key];
	}

}

export namespace Storage {
	export type Group =
		"settings" |
		"theming" |
		"hotkeys" |
		"profiles" |
		"extras";
}
