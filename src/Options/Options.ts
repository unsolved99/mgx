import { application } from "../Init";
import { HotKeys } from "./Hotkeys";
import { Settings } from "./Settings";
import { Sliders } from "./Sliders";
import { Theming } from "./Theming";

export class Options {

	public readonly hotkeys: HotKeys;
	public readonly settings: Settings;
	public readonly theming: Theming;
	public readonly sliders: Sliders;
	public readonly app: application;

	public constructor(app: application) {
		this.app  = app;
		this.hotkeys = new HotKeys(this.app);
		this.settings = new Settings(this.app);
		this.sliders = new Sliders(this);
		this.theming = new Theming(this);

		this.theming.init();
		this.settings.init();
		this.sliders.init();
	}

}
