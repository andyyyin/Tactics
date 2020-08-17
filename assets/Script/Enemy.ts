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
		this.StateMark.active = true
		this.StateMark.color = this.Battle.State.StateColorFocus

		let moveRange = this.Map.handleMoveRange(this.iPos, this.move, UNIT_SIDE.ENEMY)
		let attackRange

		/* todo 下面处理待优化 */
		let controller = this.getAttackController(0)
		if (controller.RangeFun === 0) {
			let [min, max] = controller.rangeParams
			min = min || 1
			max = max || min
			if (min > max) {
				[min, max] = [max, min]
			}
			attackRange = this.Map.handleAIAttackOptions([min, max], moveRange, this.getOpponents())
		}
		/* end */

		if (attackRange && attackRange.length) {
			// 找最近的
			let [target, pos, distance] = attackRange[0]

			this.Map.showFocusIndicator(moveRange)
			await wait(500)

			let route = this.Map.showRoute(pos, moveRange)
			await wait(500)

			await this.moveTo(route)
			this.Map.hideIndicator()
			this.Map.showCoverIndicator([target.iPos])
			await wait(500)

			this.iPos = pos
			this.updatePosition()
			this.Map.hideIndicator()

			await this.attackStart(target.node.getPosition(), target)
		}
		this.node.zIndex = 1
		this.StateMark.active = false
	}

	getOpponents () {
		return this.Battle.players
	}

}
