const {ccclass, property} = cc._decorator;
import {getTwoPointAngle} from "../Global/Math";
import {rotationToAngle} from "../Global/Node";
import {RangeFun, getRangeFun} from "./Fun/Range";
import {CoverFun, getCoverFun} from "./Fun/Cover";

@ccclass
export default class AnimDefault extends cc.Component {

	@property({type: RangeFun})
	RangeFun = 0
	@property(cc.String)
	RangeParam = ''
	@property({type: CoverFun})
	CoverFun = 0
	@property(cc.String)
	CoverParam = ''

	rangeFun
	rangeParams

	coverFun
	coverParams

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
		this.rangeParams = this.RangeParam.split(',').filter(p => p).map(p => Number(p.trim()))
		this.rangeFun = getRangeFun(this.RangeFun)
		this.coverParams = this.CoverParam.split(',').filter(p => p).map(p => Number(p.trim()))
		this.coverFun = getCoverFun(this.CoverFun)
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

	getRange () {
		return this.rangeFun(this.Unit, this.rangeParams)
	}

	getCover (point) {
		return this.coverFun(this.Unit, point, this.coverParams)
	}

}
