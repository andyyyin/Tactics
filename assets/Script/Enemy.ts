const {ccclass, property} = cc._decorator;
import {UNIT_SIDE} from "./Global/Enums";
import {wait} from "./Global/Func";
import BattleUnit from "./BattleUnit";

@ccclass
export default class Enemy extends BattleUnit {

	aiComponent

	protected onLoad() {
		super.onLoad()
		this.unitSide = UNIT_SIDE.ENEMY
		this.Battle.registerEnemy(this)
		this.iPos = this.Map.pixelPosToIndex(this.node)
	}

	protected start() {
		super.start()
	}

	public setAIComponent (component) {
		this.aiComponent = component
	}

	public async startAI () {
		this.node.zIndex = 2
		this.StateMark.active = true
		this.StateMark.color = this.Battle.State.StateColorFocus

		await this.aiComponent.startAction()

		this.node.zIndex = 1
		this.StateMark.active = false
	}

	getOpponents () {
		return this.Battle.players
	}

}
