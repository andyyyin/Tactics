import BattleManager from "./BattleManager";
import {DIRECTION} from "../Global/Enums";
import {getNodeAround, setNodeAround} from "../Global/Node";
import CustomButton from "../CustomButton";

const {ccclass, property} = cc._decorator;

let _cameraAround
let _cameraLimit

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
		this.Battle = cc.find('BattleManager').getComponent(BattleManager)
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
		this.MapNode.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		this.MapNode.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)
		_cameraLimit = getNodeAround(this.MapNode)
		_cameraLimit.left = _cameraLimit.left - 200
		_cameraLimit.right = _cameraLimit.right + 200
		console.log('camera limit', _cameraLimit)
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
		if (this.ActionPanel.height > 20) {
			let {top, bottom} = getNodeAround(this.ActionPanel)
			if (bottom < -310) {
				setNodeAround(this.ActionPanel, {bottom: -310})
			} else if (top > 310) {
				setNodeAround(this.ActionPanel, {top: 310})
			}
		}
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

		if (this.cameraMovingX) {
			if (this.cameraMovingX < 0 && _cameraAround.left > _cameraLimit.left) {
				this.CameraNode.x += (this.cameraMovingX * speed * dt)
				let {left} = getNodeAround(this.CameraNode)
				if (left < _cameraLimit.left) {
					setNodeAround(this.CameraNode, {left: _cameraLimit.left})
				}
			}
			if (this.cameraMovingX > 0 && _cameraAround.right < _cameraLimit.right) {
				this.CameraNode.x += (this.cameraMovingX * speed * dt)
				let {right} = getNodeAround(this.CameraNode)
				if (right > _cameraLimit.right) {
					setNodeAround(this.CameraNode, {right: _cameraLimit.right})
				}
			}
			_cameraAround = getNodeAround(this.CameraNode)
		}
		if (this.cameraMovingY) {
			if (this.cameraMovingY > 0 && _cameraAround.top < _cameraLimit.top) {
				this.CameraNode.y += (this.cameraMovingY * speed * dt)
				let {top} = getNodeAround(this.CameraNode)
				if (top > _cameraLimit.top) {
					setNodeAround(this.CameraNode, {top: _cameraLimit.top})
				}
			}
			if (this.cameraMovingY < 0 && _cameraAround.bottom > _cameraLimit.bottom) {
				this.CameraNode.y += (this.cameraMovingY * speed * dt)
				let {bottom} = getNodeAround(this.CameraNode)
				if (bottom < _cameraLimit.bottom) {
					setNodeAround(this.CameraNode, {bottom: _cameraLimit.bottom})
				}
			}
			_cameraAround = getNodeAround(this.CameraNode)
			// console.log({top, bottom})
		}
	}

	showOptionsNearBy (options, targetNode) {
		// let position = targetNode.getPosition().add(new cc.Vec2(-480, -320)).subtract(this.CameraNode)
		let wp = targetNode.parent.convertToWorldSpaceAR(targetNode.getPosition())
		let position = this.CameraNode.convertToNodeSpaceAR(wp)
		position.x = position.x + 90
		if (getNodeAround(this.ActionPanel, position).right > getNodeAround(this.CameraNode).right) {
			position.x = position.x - 180
		}
		this.showOptions(options, position)
	}

	showOptions (options, position?) {
		position = position || {x: 0, y: 0}

		let buttonPool = this.ActionPanel.children
		buttonPool.map(button => button.active = false)

		options.map(([text, onClick, onHover], index) => {
			let button
			if (buttonPool[index]) {
				button = buttonPool[index]
				button.active = true
			} else {
				button = cc.instantiate(this.ButtonPrefab)
				this.ActionPanel.addChild(button)
			}
			button.getComponent(CustomButton).setButton([text, onClick, onHover])
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
