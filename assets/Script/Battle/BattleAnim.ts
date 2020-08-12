const {ccclass, property} = cc._decorator;

enum EffectType {
	NONE,
	MISS,
	DAMAGE,
	CRI_DAMAGE,
	HEAL,
}

@ccclass
export default class BattleAnim extends cc.Component {

	@property(cc.Animation)
	MapAnim = null
	@property(cc.Animation)
	ScreenAnim = null

	@property(cc.Node)
	MissNode = null
	@property(cc.Node)
	DamageNode = null

	onLoad() {
		this.MapAnim.node.active = false
		// this.ScreenAnim.node.active = false

	}

	public playMiss (position) {
		return this.playEffect(position, EffectType.MISS)
	}

	public playDamage (position, damage) {
		return this.playEffect(position, EffectType.DAMAGE, damage)
	}

	public playCriDamage (position, damage) {
		return this.playEffect(position, EffectType.CRI_DAMAGE, damage)
	}

	private async playEffect (position, type, value?) {
		// console.log(position);
		this.MapAnim.node.setPosition(position)
		this.MapAnim.node.zIndex = 10

		switch (type) {
			case EffectType.MISS:
				this.showMiss()
				break
			case EffectType.DAMAGE:
				this.showDamage(value)
				break
			case EffectType.CRI_DAMAGE:
				this.showDamage(value, true)
				break
			default:
		}


		this.MapAnim.node.active = true
		await new Promise(resolve => {
			this.MapAnim.once('finished', resolve)
			this.MapAnim.play('Emerge')
		})
		this.MapAnim.node.active = false
	}

	private showMiss () {
		this.hideAllMapItems()
		this.MissNode.active = true
	}

	private showDamage (value, isCritical?) {
		this.hideAllMapItems()
		this.DamageNode.active = true
		let Label = this.DamageNode.getComponent(cc.Label)
		Label.fontSize = isCritical ? 60 : 40
		Label.string = `-${value}${isCritical ? '!' : ''}`
	}

	private hideAllMapItems () {
		this.MissNode.active = false
		this.DamageNode.active = false
	}

}
