import AnimSuper from "./AnimSuper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimPoint extends AnimSuper {

	protected onLoad() {
		super.onLoad()
	}

	async playAttackTo (target) {
		let relativePos = target.node.getPosition().subtract(this.Unit.node.getPosition())
		this.node.setPosition(relativePos)
		await this.playAnim()
	}

}
