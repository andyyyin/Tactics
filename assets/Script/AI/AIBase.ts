import {UNIT_SIDE} from "../Global/Enums";
import {wait} from "../Global/Func";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AIBase extends cc.Component {

	/* 地图距离范围，在发现范围内的友军移动时自动跟随移动 */
	@property(cc.Integer)
	FollowRange = 0

	followGroup

	Unit
	Battle
	Map

	targetPos

	protected onLoad() {
		this.Unit = this.getComponent('Enemy')
		this.Battle = this.Unit.Battle
		this.Map = this.Unit.Map
		this.Unit.setAIComponent(this)
	}

	protected start() {
		if (this.FollowRange) {
			this.followGroup = this.Battle.enemies.filter(e => {
				return e !== this.Unit && this.Map.getDistance(this.Unit.iPos, e.iPos) <= this.FollowRange
			})
		}
	}

	public onTurnPrepare () {
		this.targetPos = undefined
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
			attackRange = this.Map.handleAIAttackOptions([min, max], moveRange, this.Unit.getOpponents())
		}
		/* end */

		if (attackRange && attackRange.length) {
			// 找最近的
			let [target, pos, distance] = attackRange[0]
			this.targetPos = target.iPos
			await this.Unit.actMoveTo(pos)
			this.Map.showCoverIndicator([target.iPos])
			await wait(500)
			await this.Unit.attackStart(target.node.getPosition(), [target])
			return true
		} else if (this.followGroup && this.followGroup.length) {
			let targetPos
			this.followGroup.map(e => {
				let thisTp = e.aiComponent.targetPos
				if (!thisTp) return
				if (!targetPos) {
					targetPos = thisTp
					return
				}
				let getDistance = (p1, p2) => this.Map.getDistance(p1, p2)
				if (getDistance(thisTp, this.Unit.iPos) < getDistance(thisTp, this.Unit.iPos)) {
					targetPos = thisTp
				}
			})
			if (targetPos !== undefined) {
				let pos = this.Map.getPosTowards(moveRange, targetPos)
				if (pos !== undefined) {
					await this.Unit.actMoveTo(pos)
					return true
				}
			}
		}

		return false
	}



}