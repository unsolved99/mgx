import { MGxN3Bx } from "../Init";
import { Request } from "../Master/Request";
import { Events } from "./Events";
import { Profiles } from "./Profiles";
import { Stats } from "./Stats";
import { TopTeam } from "./TopTeam";

export class Menu {

	public static hidden: boolean;

	public static hideMenu(): void {
		$(".menu").fadeOut(450);
		this.hidden = true;
	}
	public static showMenu(): void {
		$(".menu").fadeIn(450);
		this.hidden = false;
	}
	public static openSettingsMenu(): void {
		$("#main-panel").fadeOut(450);
		$("#hotkeys-menu").fadeOut(450);
		$("#theme-menu").fadeOut(450);
		$("#settings-menu").fadeIn(450);
	}
	public static openHotkeysMenu(): void {
		$("#main-panel").fadeOut(450);
		$("#hotkeys-menu").fadeIn(450);
		$("#theme-menu").fadeOut(450);
		$("#settings-menu").fadeOut(450);
	}
	public static openThemeMenu(): void {
		$("#main-panel").fadeOut(450);
		$("#hotkeys-menu").fadeOut(450);
		$("#theme-menu").fadeIn(450);
		$("#settings-menu").fadeOut(450);
	}
	public static closeOptionsMenu(): void {
		$("#main-panel").fadeIn(450);
		$("#settings-menu").fadeOut(450);
		$("#hotkeys-menu").fadeOut(450);
		$("#theme-menu").fadeOut(450);
	}
	public static statichideChatter(): void {
		$("#chat").fadeOut(450);
	}
	public static showChatter(): void {
		$("#chat").fadeIn(450);
		$("#chat-input").focus();
	}
	public static showChatRoom(): void {
		$("#chat-room").fadeIn(450);
	}
	public static hideChatRoom(): void {
		$("#chat-room").fadeOut(450);
	}

	public mgxn3bx: MGxN3Bx;
	public updateInterval: NodeJS.Timeout;
	public topTeam: TopTeam;
	public profiles: Profiles;
	private stats: Stats;
	private events: Events;

	public constructor(mgxn3bx: MGxN3Bx) {
		this.mgxn3bx = mgxn3bx;
		this.events = new Events(this);
		this.stats = new Stats(this);
		this.topTeam = new TopTeam(this);
		this.profiles = new Profiles(this);
		this.init();
		$(".shop-overlay").hide();
	}

	private init() {
		this.events.init();
		this.regions();
		this.startInterval();
	}

	private startInterval() {
		this.updateInterval = setInterval(() => {
			this.updateFPS();
			this.updatePlayer();
			this.topTeam.update();
			this.stats.updateStats();
			this.topTeam.reset();
		}, 1000);
	}

	private async regions(): Promise<void> {
		const serverInfo = await Request.getRegionsInfo(this.mgxn3bx.info);
		const regions = serverInfo.regions;
		let options = "";
		const newNames: any = { "EU-London": "Europe", "US-Atlanta": "North America", "BR-Brazil": "South America", "RU-Russia": "Russia", "TK-Turkey": "Turkey", "JP-Tokyo": "East Asia", "CN-China": "China", "SG-Singapore": "Oceania" };
		// tslint:disable-next-line: forin
		for (const i in newNames) { options += `<option id="${i}" value="${i}">${newNames[i]} (${regions[i].numPlayers})</option>`; }
		const select = document.getElementById("region");
		select.innerHTML = options;
	}

	private updateFPS() {
		const barWidth = 100 / this.mgxn3bx.loop.maxFps * this.mgxn3bx.renderer.loop.fps;
		const barWidthFixed = Math.min(100, Math.max(0, barWidth));
		$("#fps").text(this.mgxn3bx.renderer.loop.fps);
		$("#fps-bar-content").css("width", barWidthFixed + "%");
	}

	private updatePlayer() {
		const audio = this.mgxn3bx.renderer.spectrum.audio;
		const barWidth = 100 / audio.duration * audio.currentTime;
		const barWidthFixed = Math.min(100, Math.max(0, barWidth));
		$(".track").css("width", barWidthFixed + "%");
		$("#audio-count").text(this.secondsToMMSS(audio.currentTime));
	}

	private secondsToMMSS(seconds: number) {
		const minutes = Math.floor(seconds / 60);
		const newSeconds = Math.floor(seconds % 60);
		const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;
		const secondsString = newSeconds < 10 ? `0${newSeconds}` : `${newSeconds}`;
		return `${minutesString}:${secondsString}`;
	}

}
