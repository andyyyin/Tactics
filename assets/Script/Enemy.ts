const {ccclass, property} = cc._decorator;
import {UNIT_SIDE} from "./Global/Enums";
import {wait} from "./Global/Func";
import BattleUnit from "./BattleUnit";

@ccclass
export default class Enemy extends BattleUnit {

	protected onLoad() {
		super.onLoad()
		this.Battle.registerEnemy(this)
		this.tilePos = this.Map.getTilePos(this.node)
	}

	protected start() {
		this.updatePosition()
	}

	public async startAI () {
		this.node.zIndex = 1

		let moveRange = this.Map.handleMoveRange(this.tilePos, this.move, UNIT_SIDE.ENEMY)
		let min = this.attackMin
		let max = this.attackMax
		let attackRange = this.Map.handleAIAttackOptions([min, max], moveRange, this.getOpponents())
		if (attackRange.length) {
			// 找最近的
			let [target, pos, distance] = attackRange[0]

			this.Map.showIndicator(moveRange, true)
			await wait(500)

			let route = this.Map.showRoute(pos, moveRange)
			await wait(500)

			await this.moveTo(route)

			this.tilePos = this.Map.iToP(pos)
			this.updatePosition()
			this.Map.hideIndicator()

			await this.attackStart(target)
		}
		this.node.zIndex = 0
	}

	getOpponents () {
		return this.Battle.players
	}

}
