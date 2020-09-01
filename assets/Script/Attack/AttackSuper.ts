const {ccclass, property} = cc._decorator;
import {getTwoPointAngle} from "../Global/Math";
import {rotationToAngle} from "../Global/Node";
import {RangeFun, getRangeFun} from "./Fun/Range";
import {CoverFun, getCoverFun} from "./Fun/Cover";

@ccclass
export default class AnimDefault extends cc.Component {

	@property(cc.String)
	Name = ''
	@property(cc.String)
	AnimName = ''
	@property({type: RangeFun})
	RangeFun = 0
	@property(cc.String)
	RangeParam = ''
	@property({type: CoverFun})
	CoverFun = 0
	@property(cc.String)
	CoverParam = ''

	@property(cc.Integer)
	damageFix = 0
	@property(cc.Integer)
	accuracyFix = 0
	@property(cc.Integer)
	criticalFix = 0

	rangeFun
	rangeParams

	coverFun
	coverParams

	Animation
	Unit

	targetPosition

	protected onLoad() {
		this.Animation = this.getComponent(cc.Animation)
		this.Unit = this.node.parent.getComponent('BattleUnit')
		this.Unit.addAttackController(this, this.Name || this.node.name)

		this.Animation.on('finished', () => {
			if (this.onFinish) this.onFinish()
		})
		this.rangeParams = this.RangeParam.split(',').filter(p => p).map(p => Number(p.trim()))
		this.rangeFun = getRangeFun(this.RangeFun)
		this.coverParams = this.CoverParam.split(',').filter(p => p).map(p => Number(p.trim()))
		this.coverFun = getCoverFun(this.CoverFun)
	}

	async playAttackTo (position) {
		this.targetPosition = position

		let rotation = getTwoPointAngle(this.Unit.node, position)
		this.node.angle = rotationToAngle(rotation)

		await this.playAnim()
	}

	playAnim () {
		return new Promise(resolve => {
			this.Animation.play(this.AnimName || undefined)
			this.node.once('hit', resolve)
			this.Animation.once('finished', resolve)
		})
	}

	onHit () {
		this.node.emit('hit')
	}

	onFinish () {
		this.node.angle = 0
		this.targetPosition = undefined
	}

	getRange () {
		return this.rangeFun(this.Unit, this.rangeParams)
	}

	getCover (point) {
		return this.coverFun(this.Unit, point, this.coverParams)
	}

}
