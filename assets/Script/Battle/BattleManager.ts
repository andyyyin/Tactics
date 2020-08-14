const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {

	@property(cc.Prefab)
	playerPrefab = null

	@property(cc.Component)
	BattleMap = null
	Map

	@property(cc.Component)
	BattleAnim = null
	Anim

	@property(cc.Component)
	BattleState = null
	State

	@property(cc.Component)
	BattleControl = null
	Control

	Display

	players = []
	enemies = []

	focusPlayer;

	protected onLoad() {
		this.Map = this.BattleMap
		this.Anim = this.BattleAnim
		this.State = this.BattleState
		this.Control = this.BattleControl
		this.Display = this.getComponent('BattleDisplayInfo')
	}

	protected start() {
		this.playerTurnStart()
	}

	/* ------------ public ------------ */

	public registerPlayer (player) {
		this.players.push(player)
	}

	public registerEnemy (enemy) {
		this.enemies.push(enemy)
	}

	public unitExit (unit) {
		let array = unit.isPlayer ? this.players : this.enemies
		array.splice(array.findIndex(u => u === unit), 1)
	}

	public onClickTurnEnd () {
		this.playerTurnEnd()
	}

	public async attackTo (target) {
		await this.focusPlayer.attackTo(target)
	}

	public getPlayerAt (ip) {
		return this.players.find(p => p.iPos === ip)
	}

	public getEnemyAt (ip) {
		return this.enemies.find(e => e.iPos === ip)
	}

	public getUnitAt (ip) {
		return this.getPlayerAt(ip) || this.getEnemyAt(ip)
	}

	public focus (player) {
		// this.players.map(p => p.focus = p === player)
		this.focusPlayer = player
		this.focusPlayer.actionStart()
	}

	public unFocus () {
		this.focusPlayer = null
		this.Map.updateIndicator(true)
	}

	public onPlayerActionDone () {
		this.unFocus()
		this.updateUnits()
		this.Map.updateIndicator(true)
	}

	/* ------------ private ------------ */

	private updateUnits () {
		this.players.map(p => p.updateSituation())
	}

	private playerTurnStart () {
		this.Map.enableControl()
		console.log('player turn start')
		this.players.map(p => p.resetState())
	}

	private playerTurnEnd () {
		this.enemyTurnStart().then()
	}

	private async enemyTurnStart () {
		this.Map.stopControl()
		console.log('enemy act')
		for (let i = 0; i < this.enemies.length; i++) {
			await	this.enemies[i].startAI()
		}
		console.log('enemy done')
		this.enemyTurnEnd()
	}

	private enemyTurnEnd () {
		this.playerTurnStart()
	}

}
