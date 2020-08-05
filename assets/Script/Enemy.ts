const {ccclass, property} = cc._decorator;
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

		let moveRange = this.Map.handleMoveRange(this.tilePos, this.move)
		let attackRange = this.Map.handleAIAttackOptions(2, moveRange, this.getOpponents())
		// 找最近的
		let [target, pos, distance] = attackRange[0]

		this.tilePos = this.Map.iToP(pos)
		this.updatePosition()

		await this.attackStart(target)

		this.node.zIndex = 0
	}

	getOpponents () {
		return this.Battle.players
	}

}
