import { application } from "../Init";
import { Camera } from "./Camera";
import { Controller } from "./Controller";
import { FullMap } from "./FullMap";
import { HotKeys } from "./HotKeys";
import { Mouse } from "./Mouse";
import { Multibox } from "./Multibox";
import { Ogario } from "./Ogario/Ogario";

export class Game {

	public app: application;
	public camera: Camera;
	public mouse: Mouse;
	public controller: Controller;
	public hotKeys: HotKeys;
	public ogario: Ogario;
	public multibox: Multibox;
	public fullMap: FullMap;

	public constructor(app: application) {
		this.app = app;
		this.hotKeys = new HotKeys(this);
		this.camera = new Camera(this);
		this.mouse = new Mouse(this);
		this.ogario = new Ogario(this);
		this.controller = new Controller(this);
		this.multibox = new Multibox(this);
		this.fullMap = new FullMap(this);
	}

}
