const {ccclass, property} = cc._decorator;

@ccclass
export default class LabelDisplayContent extends cc.Component {

	@property(cc.Node)
	targetNode = null

	@property(cc.String)
	componentName = ''

	@property(cc.String)
	attrName = ''

	label

	protected onLoad() {
		this.label = this.getComponent(cc.Label)
	}

	protected update(dt: number) {
		if (!this.targetNode) return
		if (!this.componentName) return
		if (!this.attrName) return
		if (!this.label) return
		this.label.string = this.targetNode.getComponent(this.componentName)[this.attrName]
	}

}
