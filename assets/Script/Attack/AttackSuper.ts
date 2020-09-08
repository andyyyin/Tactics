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
	Anim = ''
	animArray = []

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
	RotateContainer

	targetPosition

	protected onLoad() {
		this.Animation = this.getComponent(cc.Animation)
		this.Unit = this.node.parent.getComponent(BattleUnit)
		this.Unit.addAttackController(this, this.Name || this.node.name)
		this.RotateContainer = this.node.getChildByName('rotate_container')
		this.animArray = this.Anim.split('-').filter(a => a).map(a => a.trim())
		if (!this.animArray.length) this.animArray.push('')

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

	get defaultAnim () {
		return this.animArray[0]
	}

	async playAnim () {
		for (let anim of this.animArray) {
			await new Promise(resolve => {
				this.Animation.play(anim || undefined)
				this.Animation.once('finished', resolve)
			})
		}
	}

	async playAttackTo (position) {
		this.targetPosition = position
		// this.rotateToTarget(position)

		await new Promise(resolve => {
			this.playAnim().then(() => {
				this.onFinish()
				resolve()
			})
			this.node.once('hit', resolve)
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

	/* 动画特殊事件方法 */

	rotateToTarget () {
		if (!this.targetPosition) return
		let rotation = getTwoPointAngle(this.Unit.node, this.targetPosition)
		let node = this.RotateContainer || this.node
		node.angle = rotationToAngle(rotation)
	}

}
