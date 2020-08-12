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
	Display

	players = []
	enemies = []

	focusPlayer;

	protected onLoad() {
		this.Map = this.BattleMap
		this.Anim = this.BattleAnim
		this.Control = this.getComponent('BattleControl')
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
		let _length = array.length
		array.splice(array.findIndex(u => u === unit), 1)
		if (array.length < _length) {
			console.log('单位已退场')
		} else {
			console.log('退场异常')
		}
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
		if (await this.focusPlayer.attackTo(target)) {
			this.actionDone()
		}
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
