import AnimSuper from "./AnimSuper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BowShoot extends AnimSuper {

	@property(cc.Node)
	Arrow = null

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

	getRange () {
		return super.getRange([4, 7])
	}

}
