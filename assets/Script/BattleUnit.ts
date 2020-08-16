const {ccclass, property} = cc._decorator;
import {calcHitChance} from "./Global/Calc";

@ccclass
export default class BattleUnit extends cc.Component {

	@property(cc.Integer)
	move = 5
	moveRange = []

	Battle
	Map

	iPos
	tempPos

	StateMark

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

	// @property(cc.Integer)
	// accuracy = 100

	attackMap = {}

	HpProgress

	protected onLoad() {
		this.Battle = cc.find('BattleManager').getComponent('BattleManager')
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

	public addAttackController (controller, name) {
		this.attackMap[name] = controller
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

	updatePosition () {
		let pos = this.tempPos || this.iPos
		this.node.setPosition(this.Map.indexToItemPixelPos(pos));
	}

	getAttackController (index) {
		let attacks = Object.keys(this.attackMap)
		return this.attackMap[attacks[index]]
	}

	getAttackCover (point) {
		let controller = this.getAttackController(0)
		return controller.getCover(point)
	}

	async attackStart (target) {
		let controller = this.getAttackController(0)

		if (controller) {
			await controller.playAttackTo(target)
		}
		let hitChance = calcHitChance(this, target)
		let position = target.node.getPosition()

		let criChance = this.critical / 100
		let isHit = Math.random() < hitChance
		let isCritical = isHit && Math.random() < criChance


		if (isCritical) {
			let damage = Math.floor(this.damage * (2 + Math.random()))
			await this.Battle.Anim.playCriDamage(position, damage)
			target.changeHp(-damage)
		} else if (isHit) {
			let damage = this.damage
			await this.Battle.Anim.playDamage(position, damage)
			target.changeHp(-damage)
		} else {
			await this.Battle.Anim.playMiss(position)
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
