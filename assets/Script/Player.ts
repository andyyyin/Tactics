const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {

	Battle;
	Map;

	mouseHolding = false
	tilePos

	move = 5
	moveRange = []

	focus = false

	protected onLoad() {
		this.Battle = cc.find('BattleManager').getComponent('BattleManager')
		this.Map = this.Battle.Map
	}

	protected start() {
		this.tilePos = this.Map.startTile
		this.updatePosition()
		this.updateMoveRange()
	}

	protected onDestroy() {
	}

	moveTo (pos) {
		this.tilePos = pos
		this.updatePosition()
		this.updateMoveRange()
	}

	updateMoveRange () {
		this.moveRange = this.Map.handleMoveRange(this.tilePos, this.move)
	}

	updatePosition () {
		let {layerFloor, tileSize} = this.Map
		let {x, y} = layerFloor.getPositionAt(this.tilePos);
		let fixX = tileSize.width / 2
		let fixY = tileSize.height / 2
		this.node.setPosition(x + fixX, y + fixY);
	}

}
