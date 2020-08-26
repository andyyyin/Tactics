const {ccclass, property} = cc._decorator;
import {DIRECTION} from "../Global/Enums";

const getNodeAround = (node) => {
	return {
		left: (node.x + (0 - node.anchorX) * node.width),
		right: (node.x + (1 - node.anchorX) * node.width),
		centerX: (node.x + (0.5 - node.anchorX) * node.width),
		top: (node.y + (1 - node.anchorY) * node.height),
		bottom: (node.y + (0 - node.anchorY) * node.height),
		centerY: (node.y + (0.5 - node.anchorY) * node.height),
	}
}

const setNodeAround = (node, p) => {
	let {left, right, top, bottom, centerX, centerY} = p
	if (left) { node.x = left - (0 - node.anchorX) * node.width }
	else if (right) { node.x = right - (1 - node.anchorX) * node.width }
	if (top) { node.y = top - (1 - node.anchorY) * node.height }
	else if (bottom) { node.y = bottom - (0 - node.anchorY) * node.height }
	if (centerX) node.x = centerX - (0.5 - node.anchorX) * node.width
	if (centerY) node.y = centerY - (0.5 - node.anchorY) * node.width
}

let _cameraAround
let _mapAround

@ccclass
export default class BattleControl extends cc.Component {

	@property(cc.Node)
	CameraNode = null;

	@property(cc.Node)
	MapNode = null

	@property(cc.Node)
	ActionPanel = null

	@property(cc.Prefab)
	ButtonPrefab = null

	@property(cc.Integer)
	cameraSpeed = 600

	cameraMovingX = 0
	cameraMovingY = 0

	Battle

	holding

	protected onLoad(): void {
		this.Battle = cc.find('BattleManager').getComponent('BattleManager')
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
		this.MapNode.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		this.MapNode.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)
		_mapAround = getNodeAround(this.MapNode)
		console.log('map', _mapAround)
		_cameraAround = getNodeAround(this.CameraNode)
		if (this.MapNode.width < this.CameraNode.width) {
			let {centerX} = getNodeAround(this.MapNode)
			setNodeAround(this.CameraNode, {centerX})
		}
	}


	protected onDestroy(): void {
		cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
		cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
		this.MapNode.off(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		this.MapNode.off(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)
	}

	protected start() {
	}

	protected update (dt): void {
		this.updateCamera(dt)
	}

	get isShowingPanel () {
		return this.ActionPanel.active
	}

	onKeyDown (event) {
		switch(event.keyCode) {
			case cc.macro.KEY.a:
				this.cameraMovingX = -1; break;
			case cc.macro.KEY.d:
				this.cameraMovingX = 1; break;
			case cc.macro.KEY.w:
				this.cameraMovingY = 1; break;
			case cc.macro.KEY.s:
				this.cameraMovingY = -1; break;
		}
	}
	onKeyUp (event) {
		switch(event.keyCode) {
			case cc.macro.KEY.a:
			case cc.macro.KEY.d:
				this.cameraMovingX = 0; break
			case cc.macro.KEY.w:
			case cc.macro.KEY.s:
				this.cameraMovingY = 0; break
		}
	}

	onMouseDown (event) {
		console.log('mouse down')
		this.holding = true
	}

	onMouseUp (event) {
		if (!this.holding) return
		switch (event.getButton()) {
			case 2:
				this.onRightClick()
		}
	}

	onRightClick () {
		if (this.Battle.focusPlayer) {
			this.Battle.focusPlayer.revertAction()
			return
		}
		if (this.isShowingPanel) {
			this.hidePanel()
		} else {
			this.showOptions([
				['END TURN', () => {
					this.hidePanel()
					this.Battle.onClickTurnEnd()
				}]
			])
		}
	}

	updateCamera (dt) {
		if (this.isShowingPanel) return
		let speed = this.cameraSpeed
		// todo 相机移动添加边缘限制



		if (this.cameraMovingX) {
			if (this.cameraMovingX < 0 && _cameraAround.left > _mapAround.left) {
				this.CameraNode.x += (this.cameraMovingX * speed * dt)
				let {left} = getNodeAround(this.CameraNode)
				if (left < _mapAround.left) {
					setNodeAround(this.CameraNode, {left: _mapAround.left})
				}
			}
			if (this.cameraMovingX > 0 && _cameraAround.right < _mapAround.right) {
				this.CameraNode.x += (this.cameraMovingX * speed * dt)
				let {right} = getNodeAround(this.CameraNode)
				if (right > _mapAround.right) {
					setNodeAround(this.CameraNode, {right: _mapAround.right})
				}
			}
			_cameraAround = getNodeAround(this.CameraNode)
		}
		if (this.cameraMovingY) {
			if (this.cameraMovingY > 0 && _cameraAround.top < _mapAround.top) {
				this.CameraNode.y += (this.cameraMovingY * speed * dt)
				let {top} = getNodeAround(this.CameraNode)
				if (top > _mapAround.top) {
					setNodeAround(this.CameraNode, {top: _mapAround.top})
				}
			}
			if (this.cameraMovingY < 0 && _cameraAround.bottom > _mapAround.bottom) {
				this.CameraNode.y += (this.cameraMovingY * speed * dt)
				let {bottom} = getNodeAround(this.CameraNode)
				if (bottom < _mapAround.bottom) {
					setNodeAround(this.CameraNode, {bottom: _mapAround.bottom})
				}
			}
			_cameraAround = getNodeAround(this.CameraNode)
			// console.log({top, bottom})
		}
	}

	showOptions (options, position?) {
		position = position || {x: 0, y: 0}

		let buttonPool = this.ActionPanel.children
		buttonPool.map(button => button.active = false)

		options.map(([text, fun], index) => {
			let button
			if (buttonPool[index]) {
				button = buttonPool[index]
				button.active = true
			} else {
				button = cc.instantiate(this.ButtonPrefab)
				this.ActionPanel.addChild(button)
			}
			button.getChildByName('label').getComponent(cc.Label).string = text
			button.getComponent('CustomButton').onClick = fun
		})
		this.ActionPanel.setPosition(position)
		this.ActionPanel.active = true
		this.Battle.Map.stopControl()
	}

	hidePanel () {
		this.ActionPanel.active = false
		this.Battle.Map.enableControl()
	}

}
