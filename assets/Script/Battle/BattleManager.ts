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
	enemies = []

	focusPlayer;

	protected onLoad() {
		this.Map = this.BattleMap
		this.Control = this.getComponent('BattleControl')
	}

	protected start() {
		this.playerTurnStart()
	}

	registerPlayer (player) {
		this.players.push(player)
	}

	registerEnemy (enemy) {
		this.enemies.push(enemy)
	}

	getUnitAt (pos) {
		let unit = this.players.find(p => cc.Vec2.strictEquals(p.tilePos, pos))
		if (unit) return unit
		unit = this.enemies.find(e => cc.Vec2.strictEquals(e.tilePos, pos))
		return unit
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
		this.updateUnits()
		this.Control.hidePanel()
		this.Map.updateIndicator()
	}

	updateUnits () {
		this.players.map(p => p.updateSituation())
	}

	onClickTurnEnd () {
		this.Control.hidePanel()
		this.playerTurnEnd()
	}

	playerTurnStart () {
		this.players.map(p => p.resetState())
	}

	playerTurnEnd () {
		this.enemyTurnStart()
	}

	enemyTurnStart () {
		console.log('enemy act')
		this.enemies.map(e => {
			e.startAI()
		})
		console.log('enemy done')
		this.enemyTurnEnd()
	}

	enemyTurnEnd () {
		this.playerTurnStart()
	}

}
