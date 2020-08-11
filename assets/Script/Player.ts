import {UNIT_SIDE} from "./Global/Enums";

const {ccclass, property} = cc._decorator;
import BattleUnit from "./BattleUnit";

enum ACTION_STATE {
	READY,
	MOVE,
	OPTION,
	ATTACK,
	DONE
}

let _actionLock = false

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
		this.tilePos = this.Map.getTilePos(this.node)
	}

	protected start() {
		super.start()
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
		this.attackRange = this.AttackController.getRange()
		this.setState(ACTION_STATE.ATTACK)

	}

	public actionStart () {
		this.setState(ACTION_STATE.MOVE)
	}

	async moveTo (route) {
		_actionLock = true
		await super.moveTo(route)
		_actionLock = false
		if (route && route.length) {
			this.tempPos = route[route.length - 1]
			this.updatePosition()
		}
		this.setState(ACTION_STATE.OPTION)
	}

	public async attackTo (target) {
		// let target = this.getOpponents().find(e => cc.Vec2.strictEquals(e.tilePos, pos))
		// if (!target) return
		if (_actionLock) return false
		_actionLock = true
		await this.attackStart(target)
		_actionLock = false
		return true
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
	}

	public actionComplete () {
		this.tilePos = this.tempPos || this.tilePos
		this.setState(ACTION_STATE.DONE)
	}

	public resetState () {
		this.setState(ACTION_STATE.READY)
		this.updateMoveRange()
	}

	/* ------------ private ------------ */

	private updateMoveRange () {
		this.moveRange = this.Map.handleMoveRange(this.tilePos, this.move, UNIT_SIDE.PLAYER)
	}

	private setState (state) {
		if (_actionLock) return
		this.StateMark.active = state !== ACTION_STATE.DONE
		this.StateMark.color = state === ACTION_STATE.READY ?
			this.StateColorReady : this.StateColorFocus

		if (state === ACTION_STATE.READY) {
			this.Battle.unFocus()
		}

		if (state === ACTION_STATE.MOVE) {
			this.tempPos = null
			this.updatePosition()
			this.Map.showFocusIndicator(this.moveRange)
		} else if (this.actionState === ACTION_STATE.MOVE) {
			this.Map.hideIndicator()
		}

		if (state === ACTION_STATE.ATTACK) {
			this.Map.showAttackIndicator(this.attackRange)
		} else if (this.actionState === ACTION_STATE.ATTACK) {
			this.Map.hideIndicator()
		}

		this.Battle.Control.toggleActionPanel(state === ACTION_STATE.OPTION)

		this.actionState = state
	}

}
