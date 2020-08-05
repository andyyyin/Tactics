
const {ccclass, property} = cc._decorator;

import {rotationToAngle} from "../Global/Node";
import {getTwoPointAngle} from "../Global/Math";

@ccclass
export default class AnimDefault extends cc.Component {

	Animation
	Unit

	protected onLoad() {
		this.Animation = this.getComponent(cc.Animation)
		this.Unit = this.node.parent.getComponent('BattleUnit')
		this.Unit.addAttackAnim(this, this.node.name)
		this.node.active = false
	}

}
