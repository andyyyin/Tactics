import {UNIT_SIDE} from "../Global/Enums";
import {wait} from "../Global/Func";
import BattleUnit from "./BattleUnit";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Enemy extends BattleUnit {

	aiComponent

	isDone = false

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

	public onTurnPrepare () {
		this.isDone = false
		this.aiComponent.onTurnPrepare()
	}

	public async startAI () {
		this.node.zIndex = 3
		this.StateMark.active = true
		this.StateMark.color = this.Battle.State.StateColorFocus

		this.isDone = await this.aiComponent.startAction()

		this.node.zIndex = 1
		this.StateMark.active = false
	}

	public async actMoveTo (pos) {
		this.Map.showFocusIndicator(this.moveRange)
		await wait(500)

		let route = this.Map.showRoute(pos, this.moveRange)
		await wait(500)

		await this.moveTo(route)

		this.iPos = pos
		this.updatePosition()
		this.Map.hideIndicator()
	}

	getOpponents () {
		return this.Battle.players
	}

}
