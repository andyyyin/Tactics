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

	public startAI () {
		let moveRange = this.Map.handleMoveRange(this.tilePos, this.move)
		let attackRange = this.Map.handleAIAttackOptions(2, moveRange, this.getOpponents())
	}

	getOpponents () {
		return this.Battle.players
	}

}
