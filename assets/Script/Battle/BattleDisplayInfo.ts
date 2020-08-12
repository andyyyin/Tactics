const {ccclass, property} = cc._decorator;

import {calcHitChance} from "../Global/Calc";

@ccclass
export default class BattleDisplayInfo extends cc.Component {

	@property(cc.Node)
	UnitInfoPanel = null

	unitHp = ''

	unitDamage = ''

	unitAcc = ''

	unitDodge = ''

	attackInfo = ''

	protected onLoad() {
		this.UnitInfoPanel.active = false
	}

	showInfo (unit, attacker?) {
		this.unitHp = `${unit.hp}/${unit.mhp}`
		this.unitAcc = unit.accuracy
		this.unitDamage = unit.damage
		this.unitDodge = unit.dodge
		this.UnitInfoPanel.active = true
		if (attacker) {
			let chance = calcHitChance(attacker, unit)
			let percent = Math.floor(chance * 100)
			let damage = attacker.damage
			this.attackInfo = `-${damage} (${percent}%)`
		} else {
			this.attackInfo = ''
		}
	}

	hideInfo () {
		this.UnitInfoPanel.active = false
	}

}
