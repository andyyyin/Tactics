const {ccclass, property} = cc._decorator;
import {DIRECTION} from "../Global/Enums";

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
		let speed = 600 // todo 在什么地方提供配置接口
		// todo 相机移动添加边缘限制
		if (this.cameraMovingX) {
			this.CameraNode.x += (this.cameraMovingX * speed * dt)
		}
		if (this.cameraMovingY) {
			this.CameraNode.y += (this.cameraMovingY * speed * dt)
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
