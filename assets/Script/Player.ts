const {ccclass, property} = cc._decorator;

enum ACTION_STATE {
	NONE,
	MOVE,
	OPTION
}

@ccclass
export default class Player extends cc.Component {

	Battle;
	Map;

	tilePos
	tempPos

	move = 5
	moveRange = []

	actionState = ACTION_STATE.NONE

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

	get isMoving () { return this.actionState === ACTION_STATE.MOVE }

	actionStart () {
		this.actionState = ACTION_STATE.MOVE
		this.Map.showIndicator(this.moveRange)
	}

	moveAction (pos) {
		this.tempPos = pos
		this.updatePosition()
		this.actionState = ACTION_STATE.OPTION
		this.Battle.Control.showActionPanel()
	}

	revertAction () {
		if (this.actionState === ACTION_STATE.OPTION) {
			this.Battle.Control.hidePanel()
			this.tempPos = null
			this.updatePosition()
			this.actionState = ACTION_STATE.MOVE
			return
		}
		if (this.actionState === ACTION_STATE.MOVE) {
			this.Battle.unFocus()
		}
	}

	actionComplete () {
		this.tilePos = this.tempPos
	}

	updateMoveRange () {
		this.moveRange = this.Map.handleMoveRange(this.tilePos, this.move)
	}

	updatePosition () {
		let {layerFloor, tileSize} = this.Map
		let pos = this.tempPos || this.tilePos
		let {x, y} = layerFloor.getPositionAt(pos);
		let fixX = tileSize.width / 2
		let fixY = tileSize.height / 2
		this.node.setPosition(x + fixX, y + fixY);
	}

}
