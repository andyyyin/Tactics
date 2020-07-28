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
		// this.node.on(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this)
		// this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this)
		// this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		// this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)

		this.tilePos = this.Map.startTile
		this.updatePosition()
		this.updateMoveRange()
	}

	protected onDestroy() {
		// this.node.off(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		// this.node.off(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)
	}

	// onMouseEnter () {
	// 	if (this.Battle.focusPlayer) return
	// 	this.Map.showIndicator(this.moveRange)
	// }
	//
	// onMouseLeave () {
	// 	if (this.Battle.focusPlayer) return
	// 	this.Map.hideIndicator()
	// }
	//
	// onMouseDown () {
	// 	this.mouseHolding = true
	// }
	//
	// onMouseUp () {
	// 	if (!this.mouseHolding) return
	// 	this.Battle.focus(this)
	// 	this.Map.showIndicator(this.moveRange)
	// }

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
