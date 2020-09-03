import BattleUnit from "../Unit/BattleUnit";

const {ccclass, property} = cc._decorator;
import {getTwoPointAngle} from "../Global/Math";
import {rotationToAngle} from "../Global/Node";
import RangeFunMap from "./Fun/Range";
import CoverFunMap from "./Fun/Cover";

@ccclass
export default class AnimDefault extends cc.Component {

	@property(cc.String)
	Name = ''
	@property(cc.String)
	AnimName = ''

	// @property({type: RangeFun})
	// RangeFun = 0
	// @property(cc.String)
	// RangeParam = ''
	// @property({type: CoverFun})
	// CoverFun = 0
	// @property(cc.String)
	// CoverParam = ''

	@property(cc.String)
	Range = ''
	@property(cc.String)
	Cover = ''

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
		this.Unit = this.node.parent.getComponent(BattleUnit)
		this.Unit.addAttackController(this, this.Name || this.node.name)

		this.Animation.on('finished', () => {
			if (this.onFinish) this.onFinish()
		})

		let [rangeFun, rangeParam] = this.Range.split('-')
		let [coverFun, coverParam] = this.Cover.split('-')

		this.rangeFun = RangeFunMap[rangeFun.trim()]
		this.rangeParams = rangeParam && rangeParam.split(',').filter(p => p).map(p => Number(p.trim()))
		this.coverFun = CoverFunMap[coverFun.trim()]
		this.coverParams = coverParam && coverParam.split(',').filter(p => p).map(p => Number(p.trim()))
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
		return this.rangeFun(this.Unit, this.rangeParams || [])
	}

	getCover (point) {
		return this.coverFun(this.Unit, point, this.coverParams || [])
	}

}
