const {ccclass, property} = cc._decorator;

import {calcHitChance} from "../Global/Calc";

@ccclass
export default class BattleDisplayInfo extends cc.Component {

	@property(cc.Node)
	UnitInfoPanel = null

	unitHpValue = ''

	unitHpProgress = 0

	unitDamage = ''

	unitAcc = ''

	unitDodge = ''

	attackInfo = ''

	isEnemy = false
	isPlayer = false

	protected onLoad() {
		this.UnitInfoPanel.active = false
	}

	showInfo (unit, attacker?) {
		this.unitHpValue = `${unit.hp}/${unit.mhp}`
		this.unitHpProgress = Number(unit.hp) / Number(unit.mhp)
		this.unitAcc = unit.accuracy
		this.unitDamage = unit.damage
		this.unitDodge = unit.dodge
		this.isEnemy = !(this.isPlayer = unit.isPlayer)
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
