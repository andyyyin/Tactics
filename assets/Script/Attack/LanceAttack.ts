import AttackSuper from "./AttackSuper";
import {getTwoPointAngle} from "../Global/Math";
import {rotationToAngle} from "../Global/Node";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LanceAttack extends AttackSuper {

	@property(cc.Node)
	Lance = null

	@property(cc.Node)
	Effect = null

	async onReady () {
		this.Animation.pause()
		let relativePos = this.target.node.getPosition().subtract(this.Unit.node.getPosition())
		let distance = relativePos.mag()
		let effectPos = new cc.Vec3(0, distance)

		await new Promise(resolve => {
			let time = distance / 5000
			cc.tween(this.Lance)
				.to(time, {position: effectPos})
				.call(resolve).start()
		})
		this.Effect.active = true
		this.onHit()
		await new Promise(resolve => setTimeout(resolve, 700))
		this.Effect.active = false
		this.Animation.resume()
	}

	getRange () {
		return super.getRange([2, 2])
	}

}
