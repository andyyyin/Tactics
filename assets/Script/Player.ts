const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {

	mouseHolding = false

	BattleManager;

	protected onLoad() {
		this.BattleManager = cc.find('BattleManager').getComponent('BattleManager')
	}

	protected start() {
		this.node.on(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this)
		this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this)
		this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)
	}

	protected onDestroy() {
		this.node.off(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		this.node.off(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)
	}

	onMouseEnter () {
		this.BattleManager.showXXX()
	}

	onMouseLeave () {
		this.BattleManager.hideXXX()
	}

	onMouseDown () {
		this.mouseHolding = true
	}

	onMouseUp () {
		if (!this.mouseHolding) return

	}

}
