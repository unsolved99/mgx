import * as PIXI from "pixi.js";
import { Renderer } from "./Renderer";

class AudioReader {
	public audio: HTMLAudioElement = new Audio();
	protected frequencyBuffer: Uint8Array = new Uint8Array();
	protected signalSize: number = 32;
	protected analyser: AnalyserNode = null;
	protected renderer: Renderer;

	protected constructor(renderer: Renderer) {
		this.renderer = renderer;
		this.audio.volume = (this.renderer.mgxn3bx.options.sliders.obj.audioVolume / 100);
	}

	public loadSong(src: string) {
		this.clearAudio();
		this.frequencyBuffer = new Uint8Array();
		this.signalSize = 32;
		this.analyser = null;
		this.audio = new Audio();
		this.audio.crossOrigin = "anonymous";
		this.audio.src = src;
		this.audio.controls = true;
		this.audio.loop = true;
		this.audio.volume = (this.renderer.mgxn3bx.options.sliders.obj.audioVolume / 100);
		this.read();
		$("#play-pause-button").html(`<i class="material-icons">play_arrow</i>`);
	}

	protected action(type: string) {
		switch (type) {
			case "play":
				this.audio.play();
				break;
			case "stop":
				this.audio.pause();
				break;
		}
	}

	protected read() {
		const context = new AudioContext();
		this.analyser = context.createAnalyser();
		const source = context.createMediaElementSource(this.audio);
		source.connect(this.analyser);
		this.analyser.connect(context.destination);
		this.analyser.fftSize = this.signalSize;
		this.frequencyBuffer = new Uint8Array(this.analyser.frequencyBinCount);
	}

	protected readFrequency() {
		if (this.analyser) {
			this.analyser.getByteFrequencyData(this.frequencyBuffer);
		}
	}

	protected getFrequency() {
		let frequency = 0;
		// tslint:disable-next-line: prefer-for-of
		for (let offset = 0; offset < this.frequencyBuffer.length; offset++) { frequency += this.frequencyBuffer[offset] * 100 / 256; }
		return frequency;
	}

	private clearAudio() {
		if (this.audio instanceof Audio) {
			this.audio.src = "";
			this.audio.pause();
			this.audio.remove();
		}
	}

}

export class Spectrum extends AudioReader {

	public graphics: PIXI.Graphics;
	public lastUpdate: number;
	public x: number = 0;
	public y: number = 0;

	private circleStrokes: {
		first: number;
		second: number;
		third: number;
	} = {
			first: 8,
			second: 40,
			third: 5,
		};

	private newRadius1: number = 100;
	private newRadius2: number = 360;
	private newRadius3: number = 400;
	private lastRadius1: number = 0;
	private lastRadius2: number = 0;
	private lastRadius3: number = 0;
	private radius: {
		first: number;
		second: number;
		third: number;
	} = {
			first: 100,
			second: 360,
			third: 400,
		};

	private rotationIncrement: number = 0.05;
	private speed: number = 0;
	private innerCircleRadius: number = this.radius.third;
	private outerCircleRadius: number = this.radius.third + 150;

	private newInnerCircleRadius: number = this.innerCircleRadius;
	private newOuterCircleRadius: number = this.outerCircleRadius;

	private cycle: number = 0;
	private randomsOld: number[] = [];
	private randomsNow: number[] = [];

	private colors: string[] = ["#B5D8ED", "#00A2FF"];
	private lineWidth: number = 6;

	public constructor(renderer: Renderer, graphics: PIXI.Graphics) {
		super(renderer);
		this.graphics = graphics;
		this.lastUpdate = 0;
		this.read();
	}

	public getColor(index: number): number {
		this.colors[0] = this.renderer.mgxn3bx.options.theming.obj.visualiserColor1;
		this.colors[1] = this.renderer.mgxn3bx.options.theming.obj.visualiserColor2;
		return PIXI.utils.string2hex(this.colors[index]);
	}

	public get scale() {
		return this.renderer.mgxn3bx.options.sliders.obj.audioVisualiserSize;
	}

	public clear() {
		this.graphics.clear();
	}

	public render() {
		this.readFrequency();
		this.bounce(this.getFrequency() / 5);
		this.radius.first = this.lerp(this.radius.first, this.newRadius1, 0.2);
		this.radius.second = this.lerp(this.radius.second, this.newRadius2, 0.2);
		this.radius.third = this.lerp(this.radius.third, this.newRadius3, 0.2);
		this.innerCircleRadius = this.lerp(this.innerCircleRadius, this.newInnerCircleRadius, 0.2);
		this.outerCircleRadius = this.lerp(this.outerCircleRadius, this.newOuterCircleRadius, 0.2);

		this.speed += this.rotationIncrement ? this.rotationIncrement : 0.05;
		if (this.cycle === 0) {
			const randoms = [];
			for (let i = 0; i < 40; i++) {
				const rand = (Math.random() * 0.2) + this.getFrequency() / 10000;
				randoms.push(rand);
			}
			this.randomsOld = this.randomsNow;
			this.randomsNow = randoms;
		}

		for (let i = 0; i < 180; i++) {
			const x = this.x;
			const y = this.y;
			const lerped = this.lerp(this.outerCircleRadius - this.innerCircleRadius, this.outerCircleRadius, this.lerp(
				this.lerp(this.randomsOld[~~(i / 10)], this.randomsNow[~~(i / 10)], this.cycle / 20),
				this.lerp(this.randomsOld[~~(i / 10) + 1], this.randomsNow[~~(i / 10) + 1], this.cycle / 20),
				(i % 10) / 10));
			this.lineAtAngle(x, y, this.speed + i * 2, this.innerCircleRadius, lerped);
		}
		this.graphics.beginFill(0x000, 0)
			.lineStyle(this.circleStrokes.first * this.scale || 8 * this.scale, this.getColor(0))
			.drawCircle(this.x, this.y, this.radius.first * this.scale)
			.endFill();
		this.graphics.beginFill(0x000, 0)
			.lineStyle(this.circleStrokes.second * this.scale || 40 * this.scale, this.getColor(1))
			.drawCircle(this.x, this.y, this.radius.second * this.scale)
			.endFill();
		this.graphics.beginFill(0x000, 0)
			.lineStyle(this.circleStrokes.third * this.scale || 5 * this.scale, this.getColor(0))
			.drawCircle(this.x, this.y, this.radius.third * this.scale)
			.endFill();

		this.cycle++;
		this.cycle %= 20;
	}

	private lineAtAngle(startX: number, startY: number, angleDeg: number, offset: number, length: number) {
		offset = offset * this.scale;
		length = length * this.scale;
		const angle = angleDeg * (Math.PI / 180);
		const startXPos = Math.cos(angle) * offset + startX;
		const startYPos = Math.sin(angle) * offset + startY;

		const endXPos = Math.cos(angle) * length + startXPos;
		const endYPos = Math.sin(angle) * length + startYPos;

		const color = this.getColor(1);
		this.graphics.beginFill(0, 0)
			.lineStyle(this.lineWidth * this.scale, color)
			.moveTo(startXPos, startYPos)
			.lineTo(endXPos, endYPos)
			.endFill();
	}

	private bounce(step: number) {
		this.newRadius1 = step;
		this.newRadius2 = step + 260;
		this.newRadius3 = step + 300;
		this.newInnerCircleRadius = this.newRadius3;
		this.newOuterCircleRadius = this.newRadius3 + 50;

	}

	private reset() {
		this.lastRadius1 = 0;
		this.lastRadius2 = 0;
		this.lastRadius3 = 0;
	}

	private random(min: number, max: number) {
		return Math.random() * (max - min + 1) + min >> 0;
	}

	private lerp(a: number, b: number, n: number) {
		return (1 - n) * a + n * b;
	}

}
