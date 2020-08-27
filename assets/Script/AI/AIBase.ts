import {UNIT_SIDE} from "../Global/Enums";
import {wait} from "../Global/Func";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AIBase extends cc.Component {

	/* 地图距离范围，在发现范围内的友军移动时自动跟随移动 */
	@property(cc.Integer)
	FollowRange = 0

	Unit
	Battle
	Map

	protected onLoad() {
		this.Unit = this.getComponent('Enemy')
		this.Battle = this.Unit.Battle
		this.Map = this.Unit.Map
		this.Unit.setAIComponent(this)
	}

	public async startAction () {
		let moveRange = this.Unit.updateMoveRange()
		let attackRange

		/* todo 下面处理待优化 */
		let controller = this.Unit.getAttackController()
		if (controller.RangeFun === 0) {
			let [min, max] = controller.rangeParams
			min = min || 1
			max = max || min
			if (min > max) {
				[min, max] = [max, min]
			}
			attackRange = this.Unit.Map.handleAIAttackOptions([min, max], moveRange, this.Unit.getOpponents())
		}
		/* end */

		if (attackRange && attackRange.length) {
			// 找最近的
			let [target, pos, distance] = attackRange[0]

			this.Map.showFocusIndicator(moveRange)
			await wait(500)

			let route = this.Map.showRoute(pos, moveRange)
			await wait(500)

			await this.Unit.moveTo(route)
			this.Map.hideIndicator()
			this.Map.showCoverIndicator([target.iPos])
			await wait(500)

			this.Unit.iPos = pos
			this.Unit.updatePosition()
			this.Map.hideIndicator()

			await this.Unit.attackStart(target.node.getPosition(), [target])
		}
	}

}