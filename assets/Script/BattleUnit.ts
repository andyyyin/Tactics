const {ccclass, property} = cc._decorator;
import {calcHitChance} from "./Global/Func";

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
	hp = this.mhp

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

	// @property(cc.Integer)
	// accuracy = 100

	attackAnimController;

	HpProgress

	protected onLoad() {
		this.Battle = cc.find('BattleManager').getComponent('BattleManager')
		this.Map = this.Battle.Map

		let hpNode = this.node.getChildByName('hp')
		this.HpProgress = hpNode && hpNode.getComponent(cc.ProgressBar)
		// let attackNode = this.node.getChildByName('attack')
		// if (attackNode) {
		// 	this.attackAnimation = attackNode.getComponent(cc.Animation)
		// 	attackNode.active = false
		// }
	}

	protected start() {
		this.Battle.registerEnemy(this)
	}

	public addAttackAnim (controller, name) {
		this.attackAnimController = controller
	}

	updatePosition () {
		let {layerFloor, tileSize} = this.Map
		let pos = this.tempPos || this.tilePos
		let {x, y} = layerFloor.getPositionAt(pos);
		let fixX = tileSize.width / 2
		let fixY = tileSize.height / 2
		this.node.setPosition(x + fixX, y + fixY);
	}

	async attackStart (target) {
		let animController = this.attackAnimController
		if (animController) {
			await animController.playAttackTo(target)
		}
		let hitChance = calcHitChance(this, target)
		let position = target.node.getPosition()
		if (Math.random() < hitChance) {
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
		if (this.hp < 0) {
			this.hp = 0
			this.defeat()
		}
		this.HpProgress.progress = this.hp / this.mhp
		console.log(`${this.hp}/${this.mhp} - ${this.HpProgress.progress}`)
	}

	defeat () {
		// todo
		console.log(this.node.name, '已战败')
		this.node.destroy()
	}


}
