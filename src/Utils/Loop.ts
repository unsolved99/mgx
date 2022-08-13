export class Loop {

	public maxFps: number;
	public lastFrameTime: number;
	public event: () => void;

	constructor(ue: () => void) {
		this.event = ue, this.maxFps = 30, this.lastFrameTime = 0, window.requestAnimationFrame((fe) => {
			this.run(fe);
		});
	}

	public run(ue: number) {
		window.requestAnimationFrame((fe) => {
			this.run(fe);
		}), this.updateRafTime(ue), this.event();
	}

	public updateRafTime(ue: number) {
		const fe = ue - this.lastFrameTime;
		this.lastFrameTime = ue, 0.05 > Math.abs(1e3 / 30 - fe)
			? this.maxFps = 30 : 0.05 > Math.abs(1e3 / 60 - fe) ? this.maxFps = 60 :
				0.05 > Math.abs(1e3 / 75 - fe)
					? this.maxFps = 75 : 0.05 > Math.abs(10 - fe) ? this.maxFps = 100 : 0.05 > Math.abs(1e3 / 120 - fe)
						? this.maxFps = 120 : 0.05 > Math.abs(1e3 / 144 - fe) && (this.maxFps = 144);
	}

	get rafLoopTime() {
		return 1e3 / this.maxFps;
	}

}
