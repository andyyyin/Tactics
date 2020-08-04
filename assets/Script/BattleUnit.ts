const {ccclass, property} = cc._decorator;
import {getTwoPointAngle} from "./Global/Math";
import {rotationToAngle} from "./Global/Node";

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

	attackAnimation;

	HpProgress

	protected onLoad() {
		this.Battle = cc.find('BattleManager').getComponent('BattleManager')
		this.Map = this.Battle.Map

		let hpNode = this.node.getChildByName('hp')
		this.HpProgress = hpNode && hpNode.getComponent(cc.ProgressBar)

		let attackNode = this.node.getChildByName('attack')
		if (attackNode) {
			this.attackAnimation = attackNode.getComponent(cc.Animation)
			attackNode.active = false
		}
	}

	protected start() {
		this.Battle.registerEnemy(this)
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
		let animation = this.attackAnimation
		if (animation) {

			let rotation = getTwoPointAngle(this.node, target.node)
			animation.node.angle = rotationToAngle(rotation)

			animation.node.active = true
			await new Promise(resolve => {
				animation.once('finished', resolve)
				animation.play()
			})
			animation.node.active = false
		}
		target.changeHp(-this.damage)
		console.log('attack finish')
	}

	changeHp (value) {
		this.hp += value
		this.HpProgress.progress = this.hp / this.mhp
	}


}
