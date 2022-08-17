import { Cell } from "../../World/Cell/Cell";
import { Renderer } from "../Renderer";
import { Border } from "./Border";
import { Eject } from "./Eject";
import { Food } from "./Food";
import { Player } from "./Player";
import { Ring } from "./Ring";
import { Sectors } from "./Sectors";
import { Skin } from "./Skin";
import { Virus } from "./Virus";

export class Sprites {

	public renderer: Renderer;
	public eject: Eject;
	public food: Food;
	public player: Player;
	public skin: Skin;
	public virus: Virus;
	public sectors: Sectors;
	public border: Border;
	public ring: Ring;

	public constructor(renderer: Renderer) {
		this.renderer = renderer;
		this.eject = new Eject();
		this.food = new Food();
		this.player = new Player();
		this.skin = new Skin();
		this.sectors = new Sectors();
		this.virus = new Virus(this.renderer.app);
		this.border = new Border();
		this.ring = new Ring();
		this.init();
	}
	public init() {
		this.eject.init();
		this.food.init(this.renderer.App);
		this.player.init();
		this.sectors.init(this.renderer.App);
		this.virus.init(this.renderer.App);
		this.border.init(this.renderer.App);
		this.ring.init(this.renderer.App);
	}
	public getSkin(url: string): any {
		return this.skin.get(url);
	}
	public getTexture(cell: Cell): PIXI.Texture {
		if (cell.type === Cell.Type.EJECTED) {
			return this.eject.texture;
		} else if (cell.type === Cell.Type.FOOD) {
			return this.food.texture;
		} else if (cell.type === Cell.Type.PLAYER) {
			return this.player.texture;
		} else if (cell.type === Cell.Type.VIRUS) {
			return this.virus.texture;
		}
		return null;
	}

}
