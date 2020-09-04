import {UNIT_SIDE} from "../Global/Enums";
import {calcHitChance} from "../Global/Calc";
import {isNum} from "../Global/Func";
import {State} from "../Global/State";
import BattleUnit from "./BattleUnit";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UnitState extends cc.Component {

	Unit

	map = {}

	protected onLoad() {
		this.Unit = this.getComponent(BattleUnit)
	}

	pushState (state: State) {
		this.map[state] = {expire: 1}
	}

	remove (state: State) {
		if (!this.map[state]) return
		this.map[state] = undefined
	}

	passAll () {
		Object.keys(this.map).map((state) => {
			let obj = this.map[state]
			obj.expire -= 1
			if (obj.expire <= 0) {
				// @ts-ignore
				this.remove(state)
			}
		})

	}

}
