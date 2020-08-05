import AnimSuper from "./AnimSuper";

const {ccclass, property} = cc._decorator;

import {rotationToAngle} from "../Global/Node";
import {getTwoPointAngle} from "../Global/Math";

@ccclass
export default class AnimDefault extends AnimSuper {

	protected onLoad() {
		super.onLoad()
	}

	async playAttackTo (target) {

		let rotation = getTwoPointAngle(this.Unit.node, target.node)
		this.node.angle = rotationToAngle(rotation)
		this.node.active = true
		await new Promise(resolve => {
			this.Animation.once('finished', resolve)
			this.Animation.play()
		})
		this.node.active = false
	}

}
