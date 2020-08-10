import {getTwoPointAngle} from "../Global/Math";
import {rotationToAngle} from "../Global/Node";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimDefault extends cc.Component {

	Animation
	Unit

	target

	protected onLoad() {
		this.Animation = this.getComponent(cc.Animation)
		this.Unit = this.node.parent.getComponent('BattleUnit')
		this.Unit.addAttackController(this, this.node.name)

		this.Animation.on('finished', () => {
			if (this.onFinish) this.onFinish()
		})
	}

	async playAttackTo (target) {
		this.target = target

		let rotation = getTwoPointAngle(this.Unit.node, target.node)
		this.node.angle = rotationToAngle(rotation)

		await this.playAnim()
	}

	playAnim () {
		return new Promise(resolve => {
			this.Animation.play()
			this.node.once('hit', resolve)
			this.Animation.once('finished', resolve)
		})
	}

	onHit () {
		this.node.emit('hit')
	}

	onFinish () {
		this.node.angle = 0
	}

	getRange (scopeRange) {
		let unit = this.Unit
		let map = this.Unit.Map
		let [min, max] = scopeRange
		let pos = unit.tempPos || unit.tilePos
		return map.handleRange(pos, [min, max])
	}

}
