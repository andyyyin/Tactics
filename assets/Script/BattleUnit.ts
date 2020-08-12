const {ccclass, property} = cc._decorator;
import {calcHitChance} from "./Global/Calc";

@ccclass
export default class BattleUnit extends cc.Component {

	@property(cc.Integer)
	move = 5
	moveRange = []

	Battle
	Map

	tilePos
	tempPos

	@property(cc.Integer)
	mhp = 100
	hp

	@property(cc.Integer)
	damage = 15

	@property(cc.Integer)
	attackMax = 1

	@property(cc.Integer)
	attackMin = 1

	@property(cc.Integer)
	accuracy = 100

	@property(cc.Integer)
	dodge = 100

	@property(cc.Integer)
	critical = 10

	// @property(cc.Integer)
	// accuracy = 100

	AttackController;

	HpProgress

	protected onLoad() {
		this.Battle = cc.find('BattleManager').getComponent('BattleManager')
		this.Map = this.Battle.Map

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
		this.AttackController = controller
	}

	public getPosByTile (tilePos) {
		let {layerFloor, tileSize} = this.Map
		let {x, y} = layerFloor.getPositionAt(tilePos);
		let fixX = tileSize.width / 2
		let fixY = tileSize.height / 2
		return new cc.Vec3(x + fixX, y + fixY)
	}

	public moveTo (route) {
		return new Promise(resolve => {
			if (!route || !route.length) {
				resolve()
				return
			}
			let tween = cc.tween(this.node)
			for (let i = 1; i < route.length; i++) {
				let pos = this.getPosByTile(route[i])
				tween = i === route.length - 1 ?
					tween.to(0.06, {position: pos}, {easing: 'quadOut'}) :
					tween.to(0.03, {position: pos})
			}

			tween.call(resolve).start()
		})
	}

	updatePosition () {
		let pos = this.tempPos || this.tilePos
		this.node.setPosition(this.getPosByTile(pos));
	}

	async attackStart (target) {
		let controller = this.AttackController
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
