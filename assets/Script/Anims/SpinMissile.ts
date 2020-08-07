import AnimSuper from "./AnimSuper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimPoint extends AnimSuper {

	protected onLoad() {
		super.onLoad()
	}

	async playAttackTo (target) {

		let relativePos = target.node.getPosition().subtract(this.Unit.node.getPosition())
		this.node.setPosition(0, 0)
		this.node.active = true

		this.Animation.play()
		await new Promise(resolve => {
			let time = relativePos.mag() / 500
			cc.tween(this.node)
				.to(time, {position: relativePos})
				.call(resolve).start()
		})
		this.Animation.stop()

		this.node.active = false
	}

}
