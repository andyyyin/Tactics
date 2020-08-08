import AnimSuper from "./AnimSuper";
import {getTwoPointAngle} from "../Global/Math";
import {rotationToAngle} from "../Global/Node";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimPoint extends AnimSuper {


	@property(cc.Node)
	Arrow = null

	target

	protected onLoad() {
		super.onLoad()
	}

	async playAttackTo (target) {
		this.target = target

		let rotation = getTwoPointAngle(this.Unit.node, target.node)
		this.node.angle = rotationToAngle(rotation)

		this.Animation.play()
		await new Promise(resolve => {
			this.node.once('hit', resolve)
		})
	}

	async onShoot () {
		this.Animation.pause()
		let relativePos = this.target.node.getPosition().subtract(this.Unit.node.getPosition())

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

	onFinish () {
		this.node.angle = 0
	}

}
