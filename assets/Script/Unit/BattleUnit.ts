import {UNIT_SIDE} from "../Global/Enums";
import {calcHitChance} from "../Global/Calc";
import {isNum} from "../Global/Func";
import BattleManager from "../Battle/BattleManager";
import UnitState from "./UnitState";
import {State} from "../Global/State";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleUnit extends cc.Component {

	@property(cc.Integer)
	move = 5
	moveRange = []

	@property(cc.Integer)
	mhp = 100
	hp

	@property(cc.Integer)
	damage = 15

	@property(cc.Integer)
	accuracy = 100

	@property(cc.Integer)
	dodge = 100

	@property(cc.Integer)
	critical = 10

	State

	Battle
	Map

	iPos
	tempPos

	unitSide

	StateMark

	attackMap = {}
	attackList = []

	HpProgress

	attackChosen

	protected onLoad() {
		this.State = this.getComponent(UnitState)
		this.Battle = cc.find('BattleManager').getComponent(BattleManager)
		this.Map = this.Battle.Map
		this.StateMark = this.node.getChildByName('state_mark')
		this.StateMark.active = false
		let hpNode = this.node.getChildByName('hp')
		this.hp = this.mhp
		this.HpProgress = hpNode && hpNode.getComponent(cc.ProgressBar)
		// let attackNode = this.node.getChildByName('attack')
		// if (attackNode) {
		// 	this.attackAnimation = attackNode.getComponent(cc.Animation)
		// 	attackNode.active = false
		// }
	}

	protected start() {
		this.updatePosition()
		this.node.zIndex = 1
	}

	get isPlayer () { return this.unitSide === UNIT_SIDE.PLAYER }

	get curPos () { return isNum(this.tempPos) ? this.tempPos : this.iPos}

	public addAttackController (controller, name) {
		this.attackMap[name] = controller
		this.attackList.push(name)
	}

	public moveTo (route) {
		return new Promise(resolve => {
			if (!route || !route.length) {
				resolve()
				return
			}
			let tween = cc.tween(this.node)
			for (let i = 1; i < route.length; i++) {
				let pos = this.Map.indexToItemPixelPos(route[i])
				tween = i === route.length - 1 ?
					tween.to(0.06, {position: pos}, {easing: 'quadOut'}) :
					tween.to(0.03, {position: pos})
			}

			tween.call(resolve).start()
		})
	}

	updateMoveRange () {
		return (this.moveRange = this.Map.handleMoveRange(this.iPos, this.move, this.unitSide))
	}

	updatePosition () {
		let pos = this.curPos
		this.node.setPosition(this.Map.indexToItemPixelPos(pos));
	}

	getAttackController (name?) {
		name = name || this.attackChosen || this.attackList[0]
		return this.attackMap[name]
	}

	getAttackCover (point) {
		let controller = this.getAttackController()
		return controller.getCover(point)
	}

	async attackStart (position, targets) {
		this.Map.IndicatorNode.zIndex = 0

		let controller = this.getAttackController()

		if (controller) {
			await controller.playAttackTo(position)
		}

		for (let i = 0; i < targets.length; i++) {
			let target = targets[i]
			let tPosition = target.node.getPosition()

			let {criticalFix, accuracyFix, damageFix, stateParams} = controller

			let accuracy = this.accuracy + (accuracyFix || 0)
			let hitChance = calcHitChance(accuracy, target.dodge)
			let isHit = Math.random() < hitChance

			if (isHit) {
				/* 命中 */
				let damage = this.damage + (damageFix || 0)

				let critical = this.critical + (criticalFix || 0)
				let isCritical = isHit && Math.random() < (critical / 100)
				if (isCritical) {
					/* 暴击 */
					damage = Math.floor(damage * (2 + Math.random()))
					await this.Battle.Anim.playCriDamage(tPosition, damage)
				} else {
					await this.Battle.Anim.playDamage(tPosition, damage)
				}
				target.changeHp(-damage)
				
				/* 附加状态 */
				for (let i = 0; i < stateParams.length; i++) {
					let [state, params] = stateParams[i]
					let [stateChance] = params || []
					if (!stateChance || Math.random() < stateChance / 100) {
						let name = State[state]
						await this.Battle.Anim.playPushState(tPosition, name)
						target.State.pushState(state)
					}
				}

			} else {
				await this.Battle.Anim.playMiss(tPosition)
			}

		}
		console.log('attack finish')
	}

	changeHp (value) {
		this.hp += value
		if (this.hp > this.mhp) this.hp = this.mhp
		if (this.hp <= 0) {
			this.hp = 0
			this.defeat()
		}
		this.HpProgress.progress = this.hp / this.mhp
		console.log(`${this.hp}/${this.mhp} - ${this.HpProgress.progress}`)
	}

	defeat () {
		// todo
		console.log(this.node.name, '已战败')
		this.Battle.unitExit(this)
		this.node.destroy()
	}


}
