const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {

	@property(cc.Prefab)
	playerPrefab = null

	@property(cc.Component)
	BattleMap = null
	Map

	Control

	players = []

	focusPlayer;
	actionState;

	protected onLoad() {
		this.Map = this.BattleMap
		this.Control = this.getComponent('BattleControl')
	}

	protected start() {
		let testPlayer = this.Map.TiledMap.node.getChildByName('TestPlayer').getComponent('Player')
		this.players.push(testPlayer)
	}

	focus (player) {
		// this.players.map(p => p.focus = p === player)
		this.focusPlayer = player
		this.focusPlayer.actionStart()
	}

	unFocus () {
		this.focusPlayer = null
	}

	actionDone () {
		this.focusPlayer.actionComplete()
		this.focusPlayer = null;
		this.Control.hidePanel()
		this.Map.updateIndicator()
	}

}
