import { MGxN3Bx } from "../Init";
import { HotKeys } from "./Hotkeys";
import { Settings } from "./Settings";
import { Sliders } from "./Sliders";
import { Theming } from "./Theming";

export class Options {

	public readonly hotkeys: HotKeys;
	public readonly settings: Settings;
	public readonly theming: Theming;
	public readonly sliders: Sliders;
	public readonly mgxn3bx: MGxN3Bx;

	public constructor(mgxn3bx: MGxN3Bx) {
		this.mgxn3bx  = mgxn3bx;
		this.hotkeys = new HotKeys(this.mgxn3bx);
		this.settings = new Settings(this.mgxn3bx);
		this.sliders = new Sliders(this);
		this.theming = new Theming(this);

		this.theming.init();
		this.settings.init();
		this.sliders.init();
	}

}
