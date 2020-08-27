import {UNIT_SIDE} from "./Global/Enums";

const {ccclass, property} = cc._decorator;
import BattleUnit from "./BattleUnit";

enum ACTION_STATE {
	READY,
	MOVE,
	OPTION,
	ATTACK_OPTION,
	ATTACK,
	DONE
}

let _actionLock = false

@ccclass
export default class Player extends BattleUnit {

	actionState

	attackRange;

	protected onLoad() {
		super.onLoad()
		this.setState(ACTION_STATE.READY)
		this.unitSide = UNIT_SIDE.PLAYER
		this.Battle.registerPlayer(this)
		this.iPos = this.Map.pixelPosToIndex(this.node)
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

	public attackOption () {
		this.setState(ACTION_STATE.ATTACK_OPTION)
	}

	public attackPrepare (name) {
		this.attackChosen = name
		let controller = this.getAttackController()
		this.attackRange = controller.getRange()
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

	public async attackTo (position, targets) {
		if (_actionLock) return false
		_actionLock = true
		await this.attackStart(position, targets)
		_actionLock = false
		this.actionComplete()
	}

	public getOpponents () {
		return this.Battle.enemies
	}

	public revertAction () {
		let stateSequence = [
			ACTION_STATE.READY,
			ACTION_STATE.MOVE,
			ACTION_STATE.OPTION,
			ACTION_STATE.ATTACK_OPTION,
			ACTION_STATE.ATTACK,
		]
		let index = stateSequence.findIndex(s => this.actionState === s)
		if (index === 0) return
		let newState = stateSequence[index - 1]
		this.setState(newState)
	}

	public actionComplete () {
		this.iPos = this.tempPos || this.iPos
		this.setState(ACTION_STATE.DONE)
	}

	public resetState () {
		this.setState(ACTION_STATE.READY)
		this.updateMoveRange()
	}

	/* ------------ private ------------ */

	private showOptionNearby (options) {
		let camera = this.Battle.Control.CameraNode
		// todo
		let position = this.node.getPosition().add(new cc.Vec2(-390, -320)).subtract(camera)
		this.Battle.Control.showOptions(options, position)
	}

	private setState (state) {
		if (_actionLock) return
		if (this.actionState === state) return
		let {StateColorReady, StateColorFocus} = this.Battle.State
		this.StateMark.active = state !== ACTION_STATE.DONE
		this.StateMark.color = state === ACTION_STATE.READY ?
			StateColorReady : StateColorFocus

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

		if (state === ACTION_STATE.OPTION) {
			this.showOptionNearby([
				['ATTACK', () => this.attackOption()],
				['WAIT', () => this.actionComplete()]
			])
		} else if (state === ACTION_STATE.ATTACK_OPTION) {
			this.attackChosen = null
			let options = this.attackList.map((name) => {
				return [name, () => this.attackPrepare(name)]
			})
			this.showOptionNearby(options)
		} else {
			this.Battle.Control.hidePanel()
		}


		if (state === ACTION_STATE.ATTACK) {
			this.Map.showAttackIndicator(this.attackRange)
		} else if (this.actionState === ACTION_STATE.ATTACK) {
			this.Map.hideIndicator()
		}

		if (state === ACTION_STATE.DONE) {
			this.Battle.onPlayerActionDone()
		}

		this.actionState = state
		/* 状态已更新 */

		if (state === ACTION_STATE.MOVE) {
			this.Map.updateIndicator(true)
		}
	}

}
