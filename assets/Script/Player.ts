const {ccclass, property} = cc._decorator;
import BattleUnit from "./BattleUnit";

enum ACTION_STATE {
	NONE,
	MOVE,
	OPTION,
	DONE
}

@ccclass
export default class Player extends BattleUnit {

	@property(cc.Integer)
	move = 5
	moveRange = []

	actionState

	protected onLoad() {
		super.onLoad()
		this.setState(ACTION_STATE.NONE)
		this.Battle.registerPlayer(this)
		this.tilePos = this.Map.getPlayerStartPos()
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
	public get isDone () { return this.actionState === ACTION_STATE.DONE }

	public updateSituation () {
		this.updateMoveRange()
	}

	public actionStart () {
		this.setState(ACTION_STATE.MOVE)
		this.Map.showIndicator(this.moveRange)
	}

	public tempMove (pos) {
		this.tempPos = pos
		this.updatePosition()
		this.setState(ACTION_STATE.OPTION)
		this.Battle.Control.showActionPanel()
	}

	public revertAction () {
		if (this.actionState === ACTION_STATE.OPTION) {
			this.Battle.Control.hidePanel()
			this.tempPos = null
			this.updatePosition()
			this.setState(ACTION_STATE.MOVE)
			return
		}
		if (this.actionState === ACTION_STATE.MOVE) {
			this.Battle.unFocus()
		}
	}

	public actionComplete () {
		this.tilePos = this.tempPos
		this.setState(ACTION_STATE.DONE)
	}

	/* ------------ private ------------ */

	private updateMoveRange () {
		this.moveRange = this.Map.handleMoveRange(this.tilePos, this.move)
	}

	private setState (state) {
		this.actionState = state
		this.node.opacity = state === ACTION_STATE.DONE ? 150 : 255
	}

}
