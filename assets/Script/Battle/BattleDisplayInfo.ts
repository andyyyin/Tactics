const {ccclass, property} = cc._decorator;

import {calcHitChance} from "../Global/Calc";

let _target
let _$target

const coloredText = (str, color) => `<color=${color}>${str}</c>`
const getFixText = (text) => {
	if (!text || Number(text) === 0) return undefined
	let symbol = Number(text) < 0 ? '' : '+'
	let color = Number(text) < 0 ? '#E30000' : '#00ff00'
	text = symbol + text
	return coloredText(text, color)
}

@ccclass
export default class BattleDisplayInfo extends cc.Component {

	@property(cc.Node)
	UnitInfoPanel = null
	@property(cc.Node)
	UnitInfoPanel2 = null
	@property(cc.Node)
	AttackInfo = null

	Battle

	unitHpValue = ''
	unitHpProgress = 0

	unitDamage = ''
	unitAcc = ''
	unitDodge = ''
	unitCritical = ''

	damageFix = ''
	accuracyFix = ''
	criticalFix = ''

	isEnemy = false
	isPlayer = false

	$unitHpValue = ''
	$unitHpProgress = 0

	$unitDamage = ''
	$unitAcc = ''
	$unitDodge = ''
	$unitCritical = ''

	$isEnemy = false
	$isPlayer = false

	attackInfo = ''

	protected onLoad() {
		this.Battle = this.getComponent('BattleManager')
		this.UnitInfoPanel.active = false
		this.UnitInfoPanel2.active = false
		this.AttackInfo.active = false
	}

	public updateInfo() {
		let target = this.Battle.focusPlayer || this.Battle.Map.hoverTarget
		let $target = this.Battle.focusPlayer && this.Battle.Map.hoverTarget
		if (target && _target !== target) {
			this.unitHpValue = `${target.hp}/${target.mhp}`
			this.unitHpProgress = Number(target.hp) / Number(target.mhp)
			this.unitAcc = target.accuracy
			this.unitDamage = target.damage
			this.unitDodge = target.dodge
			this.unitCritical = target.critical
			this.isEnemy = !(this.isPlayer = target.isPlayer)
			_target = target
		}

		if (target) {
			let attack = target.attackChosen || target.attackHover
			let {criticalFix, accuracyFix, damageFix} = (attack && target.getAttackController(attack)) || {}
			this.damageFix = getFixText(damageFix)
			this.accuracyFix = getFixText(accuracyFix)
			this.criticalFix = getFixText(criticalFix)
			if ($target && _$target !== $target) {
				this.$unitHpValue = `${$target.hp}/${$target.mhp}`
				this.$unitHpProgress = Number($target.hp) / Number($target.mhp)
				this.$unitAcc = $target.accuracy
				this.$unitDamage = $target.damage
				this.$unitDodge = $target.dodge
				this.$unitCritical = $target.critical
				this.$isEnemy = !(this.$isPlayer = $target.isPlayer)
				this.UnitInfoPanel2.active = true


				let chance = calcHitChance(target.accuracy + accuracyFix, $target.dodge)
				let percent = Math.floor(chance * 100)
				let damage = target.damage + damageFix
				this.attackInfo = `-${damage} ${percent}%`
				_$target = $target
			}
		}


		this.UnitInfoPanel.active = !!target
		this.UnitInfoPanel2.active = this.AttackInfo.active = !!$target
	}

}
