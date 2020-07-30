const {ccclass, property} = cc._decorator;

enum ACTION_STATE {
	NONE,
	MOVE,
	OPTION,
	DONE
}

@ccclass
export default class Player extends cc.Component {

	@property(cc.Integer)
	move = 5

	Battle;
	Map;

	tilePos
	tempPos

	moveRange = []

	actionState

	protected onLoad() {
		this.Battle = cc.find('BattleManager').getComponent('BattleManager')
		this.Map = this.Battle.Map
		this.setState(ACTION_STATE.NONE)
	}

	protected start() {
		this.Battle.registry(this)
		this.tilePos = this.Map.getPlayerStartPos()
		this.updatePosition()
		this.updateMoveRange()
	}

	protected update(dt: number) {
	}

	protected onDestroy() {
	}

	get isMoving () { return this.actionState === ACTION_STATE.MOVE }

	get isDone () { return this.actionState === ACTION_STATE.DONE }

	setState (state) {
		this.actionState = state
		this.node.opacity = state === ACTION_STATE.DONE ? 150 : 255
	}

	actionStart () {
		this.setState(ACTION_STATE.MOVE)
		this.Map.showIndicator(this.moveRange)
	}

	moveAction (pos) {
		this.tempPos = pos
		this.updatePosition()
		this.setState(ACTION_STATE.OPTION)
		this.Battle.Control.showActionPanel()
	}

	revertAction () {
		if (this.actionState === ACTION_STATE.OPTION) {
			this.Battle.Control.hidePanel()
			this.tempPos = null
			this.updatePosition()
			this.setState(ACTION_STATE.MOVE)
			return
		}
		if (this.actionState === ACTION_STATE.MOVE) {
			this.Battle.unFocus()
		}
	}

	actionComplete () {
		this.tilePos = this.tempPos
		this.setState(ACTION_STATE.DONE)
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
