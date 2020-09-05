import BattleUnit from "../Unit/BattleUnit";

const {ccclass, property} = cc._decorator;
import {getTwoPointAngle} from "../Global/Math";
import {rotationToAngle} from "../Global/Node";
import RangeFunMap from "./Fun/Range";
import CoverFunMap from "./Fun/Cover";
import {State} from "../Battle/BattleState";

@ccclass
export default class AnimDefault extends cc.Component {

	@property(cc.String)
	Name = ''
	@property(cc.String)
	AnimName = ''

	@property(cc.String)
	Range = ''
	rangeFun
	rangeParams

	@property(cc.String)
	Cover = ''
	coverFun
	coverParams

	@property(cc.Integer)
	damageFix = 0
	@property(cc.Integer)
	accuracyFix = 0
	@property(cc.Integer)
	criticalFix = 0

	@property([cc.String])
	State = []
	stateParams

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

		this.stateParams = this.State.map(str => {
			let [n, p] = str.split('-')
			let state = State[n.trim()]
			let params = p.split(',').filter(p => p).map(p => Number(p.trim()))
			return [state, params]
		})
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
