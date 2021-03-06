import BattleDisplayInfo from "./BattleDisplayInfo";

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

	focusPlayer

	protected onLoad() {
		this.Map = this.BattleMap
		this.Anim = this.BattleAnim
		this.State = this.BattleState
		this.Control = this.BattleControl
		this.Display = this.getComponent(BattleDisplayInfo)
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

	public async attackTo (position, cover) {
		let targets = []
		// 保证处理顺序与cover列表顺序相同
		cover.map(ci => {
			let enemy = this.getEnemyAt(ci)
			if (enemy) targets.push(enemy)
		})
		await this.focusPlayer.attackTo(position, targets)
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
		this.Display.updateInfo()
		this.focusPlayer.actionStart()
	}

	public unFocus () {
		this.focusPlayer = null
		this.Display.updateInfo()
	}

	public onPlayerActionDone () {
		this.unFocus()
		this.updateUnits()
	}

	/* ------------ private ------------ */

	private updateUnits () {
		this.players.map(p => p.updateSituation())
	}

	private playerTurnStart () {
		this.Map.enableControl()
		console.log('player turn start')
		this.players.map(p => p.onTurnStart())
		this.Map.updateIndicator(true)
	}

	private playerTurnEnd () {
		this.players.map(u => u.State.passTurn())
		this.enemyTurnStart().then()
	}

	private async enemyTurnStart () {
		this.Map.stopControl()
		console.log('enemy start act')
		this.enemies.map(e => e.onTurnStart())
		let hasNewSituation = true
		while (hasNewSituation) {
			hasNewSituation = false
			for (let i = 0; i < this.enemies.length; i++) {
				if (this.enemies[i].isDone) continue
				await	this.enemies[i].startAI()
				if (this.enemies[i].isDone) hasNewSituation = true
			}
		}
		console.log('enemy all done')
		this.enemyTurnEnd()
	}

	private enemyTurnEnd () {
		this.enemies.map(u => u.State.passTurn())
		this.playerTurnStart()
	}

}
