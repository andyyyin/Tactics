import {UNIT_SIDE} from "../Global/Enums";
import {calcHitChance} from "../Global/Calc";
import {isNum} from "../Global/Func";
import {State} from "../Battle/BattleState";
import BattleUnit from "./BattleUnit";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UnitState extends cc.Component {

	Unit

	StateRow

	map = {}

	move
	incapacitated

	protected onLoad() {
		this.Unit = this.getComponent(BattleUnit)
		this.StateRow = this.node.getChildByName('stateRow')
	}

	updateAttr () {
		this.move = undefined
		let stop = this.map[State.止足]
		if (stop && stop.expire > 0) {
			this.move = 0
		}
		let dizz = this.map[State.眩晕]
		this.incapacitated = !!dizz
	}

	pushState (state: State) {
		let prefab = this.Unit.Battle.State.getPrefab(state)
		let node = prefab && cc.instantiate(prefab)
		if (node) {
			this.StateRow.addChild(node)
		}
		this.map[state] = {expire: 1, node}
		this.updateAttr()
	}

	remove (state: State) {
		if (!this.map[state]) return
		let {node} = this.map[state]
		if (node) {
			node.destroy()
		}
		this.map[state] = undefined
		this.updateAttr()
	}

	passTurn () {
		Object.keys(this.map).map((state) => {
			let obj = this.map[state]
			if (!obj) return
			obj.expire -= 1
			if (obj.expire <= 0) {
				// @ts-ignore
				this.remove(state)
			}
		})

	}

}
