const {ccclass, property} = cc._decorator;

@ccclass
export default class CustomButton extends cc.Component {

	background

	holding

	protected onLoad() {
		this.background = this.node.getChildByName('back')
		this.background.active = false
		this.node.on(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this)
		this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this)
		this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)
	}

	protected onDestroy() {
		this.node.off(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this)
		this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this)
		this.node.off(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		this.node.off(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)
	}

	onMouseEnter () {
		this.background.active = true
	}

	onMouseLeave () {
		this.background.active = false
	}

	onMouseDown (event) {
		if (event.getButton() !== 0) return
		this.holding = true
	}

	onMouseUp () {
		if (!this.holding) return
		this.onClick && this.onClick()
	}

	onClick () {
		console.log('empty on click')
	}

}
