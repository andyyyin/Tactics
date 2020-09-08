const {ccclass, property} = cc._decorator;

export enum State {
	NONE,
	止足,
	眩晕,
}

@ccclass
export default class BattleState extends cc.Component {

	@property(cc.Color)
	StateColorReady = null

	@property(cc.Color)
	StateColorFocus = null

	@property(cc.Prefab)
	StopPrefab = null
	@property(cc.Prefab)
	DizzPrefab = null

	getPrefab (state: State) {
		switch (state) {
			case State.止足: return this.StopPrefab
			case State.眩晕: return this.DizzPrefab
			default: return null
		}
	}

}
