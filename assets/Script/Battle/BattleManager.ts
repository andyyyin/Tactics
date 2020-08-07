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

	Control

	players = []
	enemies = []

	focusPlayer;

	protected onLoad() {
		this.Map = this.BattleMap
		this.Anim = this.BattleAnim
		this.Control = this.getComponent('BattleControl')
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

	public onClickTurnEnd () {
		this.Control.hidePanel()
		this.playerTurnEnd()
	}

	public onClickAttack () {
		this.focusPlayer.attackPrepare()
		// this.focusPlayer.attackStart().then()
	}

	public onClickWait () {
		this.actionDone()
	}

	public async attackTo (target) {
		await this.focusPlayer.attackTo(target)
		this.actionDone()
	}

	public getPlayerAt (pos) {
		return this.players.find(p => cc.Vec2.strictEquals(p.tilePos, pos))
	}

	public getEnemyAt (pos) {
		return this.enemies.find(e => cc.Vec2.strictEquals(e.tilePos, pos))
	}

	public getUnitAt (pos) {
		return this.getPlayerAt(pos) || this.getEnemyAt(pos)
	}

	public focus (player) {
		// this.players.map(p => p.focus = p === player)
		this.focusPlayer = player
		this.focusPlayer.actionStart()
	}

	public unFocus () {
		this.focusPlayer = null
	}
	/* ------------ private ------------ */


	private actionDone () {
		this.focusPlayer.actionComplete()
		this.unFocus()
		this.updateUnits()
		this.Map.updateIndicator()
	}

	private updateUnits () {
		this.players.map(p => p.updateSituation())
	}

	private playerTurnStart () {
		console.log('player turn start')
		this.players.map(p => p.resetState())
	}

	private playerTurnEnd () {
		this.enemyTurnStart()
	}

	private enemyTurnStart () {
		console.log('enemy act')

		Promise.all(this.enemies.map(e => e.startAI())).then(() => {
			console.log('enemy done')
			this.enemyTurnEnd()
		})

	}

	private enemyTurnEnd () {
		this.playerTurnStart()
	}

}
