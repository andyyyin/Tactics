const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleState extends cc.Component {

	@property(cc.Color)
	StateColorReady = null

	@property(cc.Color)
	StateColorFocus = null

}
