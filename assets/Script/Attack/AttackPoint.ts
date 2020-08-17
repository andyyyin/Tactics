import AttackSuper from "./AttackSuper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimPoint extends AttackSuper {

	protected onLoad() {
		super.onLoad()
	}

	async playAttackTo (position) {
		let relativePos = position.subtract(this.Unit.node.getPosition())
		this.node.setPosition(relativePos)
		await this.playAnim()
	}

	onFinish() {
		this.node.setPosition(0, 0)
	}

}
