import {UNIT_SIDE} from "../Global/Enums";
import {isNum, wait} from "../Global/Func";
import Enemy from "../Unit/Enemy";

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
		this.Unit = this.getComponent(Enemy)
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

		// todo 待加入 技能选择逻辑
		let controller = this.Unit.getAttackController()

		let attackChoice

		let attackOptions = []
		const opponents = this.Unit.getOpponents()
		moveRange.flat().map(mp => {
			if (mp !== this.Unit.iPos && this.Battle.getUnitAt(mp)) return
			this.Unit.tempPos = mp
			let range = controller.getRange().flat()
			range.map(ap => {
				let {cover, animPos} = controller.getCover(ap)
				let targets = opponents.filter(t => cover.flat().includes(t.iPos))
				if (targets && targets.length) {
					attackOptions.push([mp, ap, cover, animPos, targets])
				}
			})
		})
		this.Unit.tempPos = undefined
		if (attackOptions.length) {
			// todo 待添加 高级选择逻辑
			attackChoice = attackOptions[0]
		}

		if (attackChoice) {
			// 找最近的
			let [mp, ap, cover, animPos, targets] = attackChoice
			// todo 此处逻辑待完善
			this.targetPos = targets[0].iPos
			await this.Unit.actMoveTo(mp)
			this.Map.showCoverIndicator(cover)
			let position = this.Unit.Map.indexToItemPixelPos(isNum(animPos) ? animPos : ap)
			await wait(500)
			await this.Unit.attackStart(position, targets)
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