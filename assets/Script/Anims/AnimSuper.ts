const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimDefault extends cc.Component {

	Animation
	Unit

	protected onLoad() {
		this.Animation = this.getComponent(cc.Animation)
		this.Unit = this.node.parent.getComponent('BattleUnit')
		this.Unit.addAttackAnim(this, this.node.name)

		this.Animation.on('finished', () => {
			if (this.onFinish) this.onFinish()
		})
	}

	playAnim (name?) {
		this.node.active = true
		return new Promise(resolve => {
			this.node.once('hit', resolve)
			this.Animation.once('finished', resolve)
			this.Animation.play(name)
		})
	}

	onHit () {
		this.node.emit('hit')
	}

	onFinish () {}

}
