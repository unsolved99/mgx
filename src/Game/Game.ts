import { MGxN3Bx } from "../Init";
import { Camera } from "./Camera";
import { Controller } from "./Controller";
import { FullMap } from "./FullMap";
import { HotKeys } from "./HotKeys";
import { Mouse } from "./Mouse";
import { Multibox } from "./Multibox";
import { Ogario } from "./Ogario/Ogario";

export class Game {

	public mgxn3bx: MGxN3Bx;
	public camera: Camera;
	public mouse: Mouse;
	public controller: Controller;
	public hotKeys: HotKeys;
	public ogario: Ogario;
	public multibox: Multibox;
	public fullMap: FullMap;

	public constructor(mgxn3bx: MGxN3Bx) {
		this.mgxn3bx = mgxn3bx;
		this.hotKeys = new HotKeys(this);
		this.camera = new Camera(this);
		this.mouse = new Mouse(this);
		this.ogario = new Ogario(this);
		this.controller = new Controller(this);
		this.multibox = new Multibox(this);
		this.fullMap = new FullMap(this);
	}

}
