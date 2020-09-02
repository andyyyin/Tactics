const {ccclass, property} = cc._decorator;

@ccclass
export default class CustomButton extends cc.Component {

	background

	holding

	Label

	isHover

	protected onLoad() {
		this.background = this.node.getChildByName('back')
		this.background.active = false
		this.setLabel()
		this.node.on(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this)
		this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this)
		this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this)
		this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)
	}

	protected onDestroy() {
		this.node.off(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this)
		this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this)
		this.node.off(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this)
		this.node.off(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		this.node.off(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)
	}

	setLabel () {
		this.Label = this.node.getChildByName('label').getComponent(cc.Label)
	}

	onMouseEnter () {
		this.background.active = true
		if (this.onHover) {
			// @ts-ignore
			this.onHoverEnd = this.onHover()
			this.isHover = true
		}
	}

	onMouseLeave () {
		this.background.active = false
		this.isHover = false
		this.onHoverEnd && this.onHoverEnd()
	}

	onMouseMove () {
		if (!this.isHover && this.onHover) {
			this.onMouseEnter()
		}
	}

	onMouseDown (event) {
		if (event.getButton() !== 0) return
		this.holding = true
	}

	onMouseUp () {
		if (!this.holding) return
		this.holding = false
		this.onClick && this.onClick()
	}

	setButton ([text, onClick, onHover]) {
		if (!this.Label) this.setLabel()
		this.Label.string = text
		this.onClick = onClick
		this.onHover = onHover
	}

	onClick () {
		console.log('empty on click')
	}

	onHover () {}
	onHoverEnd () {}

}
