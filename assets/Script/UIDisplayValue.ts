import {isNum} from "./Global/Func";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIDisplayValue extends cc.Component {

	@property(cc.Node)
	targetNode = null

	@property(cc.String)
	componentName = ''

	@property(cc.String)
	attrName = ''

	@property(cc.Boolean)
	toggleShow = false

	opacityCache

	label
	progress

	protected onLoad() {
		this.label = this.getComponent(cc.Label)
		this.progress = this.getComponent(cc.ProgressBar)
		this.opacityCache = this.node.opacity
	}

	get value () {
		return this.targetNode.getComponent(this.componentName)[this.attrName]
	}

	protected update(dt: number) {
		if (!this.targetNode) return
		if (!this.componentName) return
		if (!this.attrName) return
		if (this.label) {
			this.label.string = this.value
		}
		if (this.progress && isNum(this.value)) {
			this.progress.progress = this.value
		}
		if (this.toggleShow) {
			this.node.opacity = this.value ? this.opacityCache : 0
		}
	}

}
