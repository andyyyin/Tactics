import find = cc.find;

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
		this.Animation.on('finished', () => this.node.active = false)
	}

	playAnim (name?) {
		this.node.active = true
		return new Promise(resolve => {
			this.node.once('hit', resolve)
			this.Animation.once('finished', resolve)
			this.Animation.play(name)
		})
	}

	onHit () {
		this.node.emit('hit')
	}

}
