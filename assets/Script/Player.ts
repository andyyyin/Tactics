const {ccclass, property} = cc._decorator;
import BattleUnit from "./BattleUnit";

enum ACTION_STATE {
	READY,
	MOVE,
	OPTION,
	ATTACK,
	DONE
}

@ccclass
export default class Player extends BattleUnit {

	@property(cc.Color)
	StateColorReady = null

	@property(cc.Color)
	StateColorFocus = null

	actionState

	StateMark;

	attackRange;

	protected onLoad() {
		super.onLoad()
		this.StateMark = this.node.getChildByName('state_mark')
		this.setState(ACTION_STATE.READY)
		this.Battle.registerPlayer(this)
		// this.tilePos = this.Map.getPlayerStartPos()
		this.tilePos = this.Map.getTilePos(this.node)
	}

	protected start() {
		this.updatePosition()
		this.updateMoveRange()
	}

	protected update(dt: number) {
	}

	protected onDestroy() {
	}

	/* ------------ public ------------ */

	public get isMoving () { return this.actionState === ACTION_STATE.MOVE }
	public get isAttacking () { return this.actionState === ACTION_STATE.ATTACK }
	public get isDone () { return this.actionState === ACTION_STATE.DONE }

	public updateSituation () {
		this.updateMoveRange()
	}

	public attackPrepare () {
		let pos = this.tempPos || this.tilePos
		this.attackRange = this.Map.handleRange(pos, 2) // todo
		this.setState(ACTION_STATE.ATTACK)
		this.Map.showIndicator(this.attackRange, true, true)
	}

	public actionStart () {
		this.setState(ACTION_STATE.MOVE)
	}

	public moveTo (pos) {
		this.tempPos = pos
		this.updatePosition()
		this.setState(ACTION_STATE.OPTION)
	}

	public attackTo (pos) {
		let target = this.getOpponents().find(e => cc.Vec2.strictEquals(e.tilePos, pos))
		if (!target) return
		this.attackStart().then()
	}

	public getOpponents () {
		return this.Battle.enemies
	}

	public revertAction () {
		let stateSequence = [
			ACTION_STATE.READY,
			ACTION_STATE.MOVE,
			ACTION_STATE.OPTION,
			ACTION_STATE.ATTACK,
		]
		let index = stateSequence.findIndex(s => this.actionState === s)
		if (index === 0) return
		let newState = stateSequence[index - 1]
		this.setState(newState)
		if (newState === ACTION_STATE.READY) {
			this.Battle.unFocus()
		}
	}

	public actionComplete () {
		this.tilePos = this.tempPos
		this.setState(ACTION_STATE.DONE)
	}

	public resetState () {
		this.setState(ACTION_STATE.READY)
		this.updateMoveRange()
	}

	/* ------------ private ------------ */

	private updateMoveRange () {
		this.moveRange = this.Map.handleMoveRange(this.tilePos, this.move)
	}

	private setState (state) {
		this.actionState = state
		this.StateMark.active = state !== ACTION_STATE.DONE
		this.StateMark.color = state === ACTION_STATE.READY ?
			this.StateColorReady : this.StateColorFocus

		if (state === ACTION_STATE.MOVE) {
			this.tempPos = null
			this.updatePosition()
			this.Map.showIndicator(this.moveRange, true)
		} else {
			this.Map.hideIndicator()
		}

		this.Battle.Control.toggleActionPanel(state === ACTION_STATE.OPTION)

	}

}
