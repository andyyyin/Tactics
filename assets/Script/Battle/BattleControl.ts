const {ccclass, property} = cc._decorator;
import {DIRECTION} from "../Global/Enums";

@ccclass
export default class BattleControl extends cc.Component {

	@property(cc.Node)
	CameraNode = null;

	@property(cc.Node)
	ActionPanel = null

	cameraMovingX = 0
	cameraMovingY = 0

	protected onLoad(): void {
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
	}

	protected onDestroy(): void {
		cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
		cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
	}

	protected update (dt): void {
		this.updateCamera(dt)
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

	updateCamera (dt) {
		let speed = 500 // todo 在什么地方提供配置接口
		// todo 相机移动添加边缘限制
		if (this.cameraMovingX) {
			this.CameraNode.x += (this.cameraMovingX * speed * dt)
		}
		if (this.cameraMovingY) {
			this.CameraNode.y += (this.cameraMovingY * speed * dt)
		}
	}

	showActionPanel () {
		this.ActionPanel.active = true
	}

	hidePanel () {
		this.ActionPanel.active = false
	}

}
