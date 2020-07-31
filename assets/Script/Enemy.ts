const {ccclass, property} = cc._decorator;
import BattleUnit from "./BattleUnit";

@ccclass
export default class Enemy extends BattleUnit {

	protected onLoad() {
		super.onLoad()
		this.Battle.registerEnemy(this)
		this.tilePos = {x: 2, y: 21}
	}

	protected start() {
		this.updatePosition()
	}

}
