import AttackSuper from "./AttackSuper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BowShoot extends AttackSuper {

	@property(cc.Node)
	Arrow = null

	async onShoot () {
		if (!this.targetPosition) return
		if (!this.Animation.getAnimationState(this.AnimName).isPlaying) return
		this.Animation.pause()
		let relativePos = this.targetPosition.subtract(this.Unit.node.getPosition())

		await new Promise(resolve => {
			let distance = relativePos.mag()
			let time = distance / 5000
			cc.tween(this.Arrow)
				.to(time, {position: new cc.Vec2(0, distance)})
				.call(resolve).start()
		})
		this.onHit()
		this.Animation.resume()
	}

}
