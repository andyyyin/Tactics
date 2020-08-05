import AnimSuper from "./AnimSuper";

const {ccclass, property} = cc._decorator;

import {rotationToAngle} from "../Global/Node";
import {getTwoPointAngle} from "../Global/Math";

@ccclass
export default class AnimPoint extends AnimSuper {

	protected onLoad() {
		super.onLoad()
	}

	async playAttackTo (target) {
		let relativePos = target.node.getPosition().subtract(this.Unit.node.getPosition())
		this.node.setPosition(relativePos)
		this.node.active = true
		await new Promise(resolve => {
			this.Animation.once('finished', resolve)
			this.Animation.play()
		})
		this.node.active = false
	}

}
