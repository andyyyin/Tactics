const {ccclass, property} = cc._decorator;
import {UNIT_SIDE} from "./Global/Enums";
import {wait} from "./Global/Func";
import BattleUnit from "./BattleUnit";

@ccclass
export default class Enemy extends BattleUnit {

	get isPlayer () { return false }

	protected onLoad() {
		super.onLoad()
		this.Battle.registerEnemy(this)
		this.iPos = this.Map.pixelPosToIndex(this.node)
	}

	protected start() {
		super.start()
	}

	public async startAI () {
		this.node.zIndex = 2

		let moveRange = this.Map.handleMoveRange(this.iPos, this.move, UNIT_SIDE.ENEMY)
		let min = this.attackMin
		let max = this.attackMax
		let attackRange = this.Map.handleAIAttackOptions([min, max], moveRange, this.getOpponents())
		if (attackRange.length) {
			// 找最近的
			let [target, pos, distance] = attackRange[0]

			this.Map.showFocusIndicator(moveRange)
			await wait(500)

			let route = this.Map.showRoute(pos, moveRange)
			await wait(500)

			await this.moveTo(route)
			this.Map.hideIndicator()
			this.Map.showAreaIndicator(target.iPos)
			await wait(500)

			this.iPos = pos
			this.updatePosition()
			this.Map.hideIndicator()

			await this.attackStart(target)
		}
		this.node.zIndex = 1
	}

	getOpponents () {
		return this.Battle.players
	}

}
