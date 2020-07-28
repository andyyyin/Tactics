const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {

	@property(cc.Prefab)
	playerPrefab = null

	@property(cc.Component)
	BattleMap = null
	Map

	players = []

	focusPlayer;

	protected onLoad() {
		this.Map = this.BattleMap
	}

	protected start() {
		let testPlayer = this.Map.TiledMap.node.getChildByName('TestPlayer').getComponent('Player')
		this.players.push(testPlayer)
	}



	focus (player) {
		// this.players.map(p => p.focus = p === player)
		this.focusPlayer = player
	}

}
