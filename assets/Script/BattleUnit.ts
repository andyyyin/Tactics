const {ccclass, property} = cc._decorator;

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

	protected onLoad() {
		this.Battle = cc.find('BattleManager').getComponent('BattleManager')
		this.Map = this.Battle.Map
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

	async attackStart () {
		let Animation = this.getComponent(cc.Animation)
		if (Animation) {
			await new Promise(resolve => {
				Animation.once('finished', () => {
					resolve()
				})
				Animation.play()
			})
		}
		console.log('attack finish')
	}

}
