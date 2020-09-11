import AttackSuper from "./AttackSuper";
import {getTwoPointAngle} from "../Global/Math";
import {rotationToAngle} from "../Global/Node";
import Vec3 = cc.Vec3;

const {ccclass, property} = cc._decorator;

@ccclass
export default class MeteorAttack extends AttackSuper {

	@property(cc.Node)
	Effect = null

	effectGroup

	protected onLoad() {
		super.onLoad()
		this.effectGroup = [this.Effect]
		for (let i = 0; i < 6; i++) {
			let effect = cc.instantiate(this.Effect)
			this.Effect.parent.addChild(effect)
			this.effectGroup.push(effect)
		}
	}

	async playAttackTo(position): Promise<void> {
		this.targetPosition = position
		this.rotateToTarget()

		await this.playAnim()

		let lastOffset
		for (let i = 0; i < 15; i++) {
			let effect = this.effectGroup.shift()

			if (!effect) {
				throw new Error('不够用')
			}

			let offset = lastOffset ?
				(lastOffset > 0 ? lastOffset - 24 : lastOffset + 24) :
				Math.floor(-24 + Math.random() * 49)
			effect.setPosition(offset, 0)

			lastOffset = lastOffset ? undefined : offset

			let halfLen = effect.height * effect.scaleY / 2

			let destination = new cc.Vec3(offset * 3, Math.floor(44 + Math.random() * 20 - Math.abs(offset / 3)))
			let rotation = getTwoPointAngle(effect, destination)
			effect.angle = rotationToAngle(rotation)
			let vecOffset = new Vec3(halfLen * Math.sin(rotation), halfLen * Math.cos(rotation))

			let tarPos = destination.sub(vecOffset)

			let time = tarPos.sub(effect).mag() / 1000

			effect.active = true

			new Promise(resolve => {
				cc.tween(effect)
					.to(time, {position: tarPos})
					.call(resolve).start()
			}).then(() => new Promise(resolve => {
				let Animation = effect.getComponent(cc.Animation)
				Animation.play()
				Animation.once('finished', resolve)
			})).then(() => {
				effect.active = false
				this.effectGroup.push(effect)
			})

			await new Promise(resolve => setTimeout(resolve, 50))
		}

		this.onFinish()

	}
}
