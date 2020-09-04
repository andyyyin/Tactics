const {ccclass, property} = cc._decorator;

enum EffectType {
	NONE,
	MISS,
	DAMAGE,
	CRI_DAMAGE,
	HEAL,
	STATE,
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
	LabelNode = null

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

	public playPushState (position, name) {
		return this.playEffect(position, EffectType.STATE, name)
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
				this.showLabel(`-${value}`, 40, '#FF0000')
				break
			case EffectType.CRI_DAMAGE:
				this.showLabel(`-${value}!`, 60, '#FF0000')
				break
			case EffectType.STATE:
				this.showLabel(value, 40, '#2719FF')
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
		this.showRelNode(this.MissNode)
	}

	private showLabel (str, font, color) {
		this.showRelNode(this.LabelNode)
		let Label = this.LabelNode.getComponent(cc.Label)
		Label.fontSize = font
		Label.string = str
		Label.node.color = new cc.Color().fromHEX(color)
	}

	private showRelNode (tarNode) {
		[this.MissNode, this.LabelNode]
			.map(node => node.active = node === tarNode)
	}

}
