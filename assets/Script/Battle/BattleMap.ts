import {UNIT_SIDE} from "../Global/Enums";

const {ccclass, property} = cc._decorator;

let _playerPosCache
let _hoverCache
let _hoverTarget

let _moveIndicatorColor
let _attackIndicatorColor

let _route

@ccclass
export default class BattleMap extends cc.Component {

	@property(cc.Prefab)
	IndicatorTile = null

	@property(cc.Prefab)
	CursorPrefab = null

	@property(cc.Node)
	IndicatorNode = null

	@property(cc.Component)
	TiledMap = null

	Battle

	startPos;
	tileSize;
	mapSize

	layerFloor
	layerBarrier

	iTileList = []

	mouseLoc;
	cursorNode;
	mouseHolding

	showing

	stopControlFlag = false

	onLoad() {
		this.Battle = cc.find('BattleManager').getComponent('BattleManager')

		this.TiledMap.node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this)
		this.TiledMap.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this)
		this.TiledMap.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this)

		this.mapSize = this.TiledMap.getMapSize()

		this.tileSize = this.TiledMap.getTileSize();
		this.node.x = this.node.y = 0
		this.node.anchorX = this.node.parent.anchorX
		this.node.anchorY = this.node.parent.anchorY
		this.node.width = this.node.parent.width
		this.node.height = this.node.parent.height

		this.layerFloor = this.TiledMap.getLayer('floor');
		this.layerBarrier = this.TiledMap.getLayer('barrier');
	}

	start() {
		_moveIndicatorColor = this.IndicatorTile.data.color
		_attackIndicatorColor = new cc.Color(196, 15, 15)
		// _attackIndicatorColor = new cc.Color()
		for (let y = 0; y < this.mapSize.width; y++) {
			for (let x = 0; x < this.mapSize.height; x++) {
				let iTile = cc.instantiate(this.IndicatorTile)
				this.IndicatorNode.addChild(iTile)
				// iTile.width = this.tileSize.width
				// iTile.height = this.tileSize.height
				iTile.scaleX = this.tileSize.width / iTile.width
				iTile.scaleY = this.tileSize.height / iTile.height
				iTile.anchorX = this.IndicatorNode.anchorX
				iTile.anchorY = this.IndicatorNode.anchorY
				iTile.setPosition(this.layerFloor.getPositionAt(x, y))
				this.iTileList.push(iTile)
				iTile.active = false
			}
		}
		let cursorNode = cc.instantiate(this.CursorPrefab)
		cursorNode.scaleX = this.tileSize.width / cursorNode.width * 1.1
		cursorNode.scaleY = this.tileSize.height / cursorNode.height * 1.1
		cursorNode.setPosition(this.tileSize.width/2, this.tileSize.height/2)
		this.TiledMap.node.addChild(cursorNode, 100, 'Cursor')
		this.cursorNode = cursorNode
	}

	onMouseMove (event) {
		if (!this.cursorNode) return
		if (this.stopControlFlag) return
		let {x, y} = this.mouseLoc = this.getMouseLocation(event)
		let {width, height} = this.tileSize
		this.cursorNode.x = Math.floor(x - (x % width)) + width / 2
		this.cursorNode.y = Math.floor(y - (y % height)) + height / 2
		let newPos = this.pixelPosToIndex({x, y})
		if (_hoverCache === undefined || _hoverCache !== newPos) {
			_hoverCache = newPos
			this.onHover(newPos)
		}
	}

	onMouseDown (event) {
		if (this.stopControlFlag) return
		// 如果显示面板同时地图响应鼠标，那么点击按钮后面板关闭，地图会在所有按钮逻辑走完后在相应鼠标抬起的事件
		// 完美的相当于点完按钮再点地图（点两次，而实际只点一次），造成bug
		if (this.Battle.Control.isShowingPanel && event.getButton() === 0) return
		this.mouseHolding = this.pixelPosToIndex(this.getMouseLocation(event))
	}
	onMouseUp (event) {
		if (this.stopControlFlag) return
		if (this.mouseHolding === undefined) return
		let holding = this.mouseHolding
		this.mouseHolding = undefined
		let iPos =  this.pixelPosToIndex(this.getMouseLocation(event))
		if (iPos !== holding) return
		switch (event.getButton()) {
			case 0:
				this.onClick(iPos)
				break
			case 2:
				this.onRightClick(iPos)
		}
	}

	getPlayerStartPos () {
		if (!_playerPosCache) {
			// @ts-ignore
			_playerPosCache = this.handleMoveRange(this.startPos, 2).flat()
			_playerPosCache.shift()
			return this.startPos
		}
		return this.iToP(_playerPosCache.shift())
	}

	updateIndicator (iPos?) {
		this.onHover(iPos || this.pixelPosToIndex(this.mouseLoc))
	}

	getTargetOfAttack (iPos) {
		let player = this.Battle.focusPlayer
		let range = player.attackRange
		if (!range || !range.flat().includes(iPos)) return
		return player.getOpponents().find(e => e.iPos === iPos)
	}

	onHover (iPos) {
		if (this.Battle.Control.isShowingPanel) return
		if (this.Battle.focusPlayer) {
			if (this.Battle.focusPlayer.isMoving) {
				let player = this.Battle.focusPlayer
				let range = player.moveRange
				_route = this.showRoute(iPos, range)
			}
			if (this.Battle.focusPlayer.isAttacking) {
				let target = this.getTargetOfAttack(iPos)
				if (target) {
					this.Battle.Display.showInfo(target, this.Battle.focusPlayer)
				} else {
					this.Battle.Display.hideInfo()
				}
			}
			return
		}
		// 看是否指向玩家
		let target = this.Battle.getUnitAt(iPos)
		if (_hoverTarget && _hoverTarget.node) _hoverTarget.node.zIndex = 1
		_hoverTarget = target
		if (_hoverTarget && _hoverTarget.node) _hoverTarget.node.zIndex = 2

		if (target) {
			this.Battle.Display.showInfo(target)
			if (target.isPlayer && !target.isDone) {
				this.hideIndicator()
				this.showIndicator(target.moveRange)
			} else if (this.showing) {
				this.hideIndicator()
			}
		} else {
			this.Battle.Display.hideInfo()
		}

	}

	onClick (iPos) {
		if (this.Battle.Control.isShowingPanel) return
		if (this.Battle.focusPlayer) {
			if (this.Battle.focusPlayer.isMoving) {
				let player = this.Battle.focusPlayer
				let range = player.moveRange
				let inRange = range && range.flat().includes(iPos)
				let occupied = this.Battle.getUnitAt(iPos)
				if (inRange && (!occupied || occupied === player)) {
					player.moveTo(_route).then()
				} else {
					// 点空了，什么也不做，如需要回退可调用revertAction
				}
			} else if (this.Battle.focusPlayer.isAttacking) {
				let target = this.getTargetOfAttack(iPos)
				if (target) {
					this.Battle.attackTo(target)
				} else {
					// 点空了，什么也不做，如需要回退可调用revertAction
				}
			}
			return
		}

		let target = this.Battle.players.find(p => iPos === p.iPos)
		if (target && !target.isDone) {
			this.Battle.focus(target)
			_route = null
		}
	}

	onRightClick (iPos) {
		if (this.Battle.focusPlayer) {
			this.Battle.focusPlayer.revertAction()
			// 点击瞬间更新指示状态
			this.updateIndicator(iPos)
			return
		}
		this.Battle.Control.toggleOptionPanel()
	}

	showFocusIndicator (param) { this.showIndicator(param, 1) }
	showAttackIndicator (param) { this.showIndicator(param, 2) }
	showAreaIndicator (param) { this.showIndicator(param, 3) }

	showIndicator (param, type?) {
		let isFocus = type === 1
		let isAttack = type === 2
		let isEffectArea = type === 3
		this.IndicatorNode.zIndex = (isAttack || isEffectArea) ? 5 : 0
		if (Array.isArray(param)) {
			param.forEach(p => this.showIndicator(p, type))
		} else {
			let index = typeof param === 'object' ? this.pToI(param) : param
			let iTile = this.iTileList[index]
			if (!iTile) return
			iTile.opacity = (isFocus || isEffectArea) ? 150 : 70
			iTile.color = (isAttack || isEffectArea) ? _attackIndicatorColor : _moveIndicatorColor
			iTile.active = true
			this.showing = true
		}
	}

	hideIndicator () {
		this.iTileList.map(iTile => {
			iTile.active = false
			iTile.getChildByName('Route').active = false
		})
		this.showing = false
	}

	showRoute (pos, range) {
		let preIndex;
		let endIndex = typeof pos === 'number' ? pos : this.pToI(pos)
		let tiles = this.iTileList
		let route = []
		for (let i = range.length - 1; i >= 0; i--) {
			if (preIndex === undefined) {
				range[i].map(ip => {
					if (ip === endIndex) {
						tiles[ip].getChildByName('Route').active = true
						preIndex = ip
						route.push(ip)
					} else {
						tiles[ip].getChildByName('Route').active = false
					}
				})
			} else {
				let findFlag = false
				range[i].map(ip => {
					if (!findFlag && this.isClose(ip, preIndex)) {
						tiles[ip].getChildByName('Route').active = true
						preIndex = ip
						route.unshift(ip)
						findFlag = true
					} else {
						tiles[ip].getChildByName('Route').active = false
					}
				})
			}
		}
		return route
	}

	handleRange (start, range) {
		start = typeof start === 'number' ? this.iToP(start) : start
		if (typeof range === 'number') range = [1, range]
		let [min, max] = range
		let result = []
		for (let step = min; step <= max; step++) {
			for (let y = step; y >= -step; y--) {
				let x = step - Math.abs(y)
				let ip1 = this.pToI(start.x + x, start.y + y)
				if (ip1) result.push(ip1)
				if (x > 0) {
					let ip2 = this.pToI(start.x - x, start.y + y)
					if (ip2) result.push(ip2)
				}
			}
		}
		return result
	}

	handleMoveRange (start, move, unitSide?) {
		let startIndex = typeof start === 'number' ? start : this.pToI(start)
		let step = 1
		let moveRange = [[startIndex]]
		while (step <= move) {
			let prevArray = moveRange[step - 1]
			let currentArray = []
			prevArray.map(ip => {
				let around = this.aroundList(ip)
				around.map(ai => {
					if (this.isBlocked(ai, unitSide)) return
					if (currentArray.includes(ai)) return
					if (prevArray.includes(ai)) return
					if (moveRange[step - 2] && moveRange[step - 2].includes(ai)) return
					currentArray.push(ai)
				})
			})
			step++
			moveRange.push(currentArray)
		}
		return moveRange
	}

	handleAIAttackOptions (shotRange, moveRange, opponents) {
		if (typeof shotRange === 'number') shotRange = [1, shotRange]
		let [min, max] = shotRange
		let move = moveRange.length - 1
		let startPos = moveRange[0][0]
		// 先过滤掉太远不可能碰到的
		opponents = opponents.filter(p => this.getDistance(p.iPos, startPos) <= (move + max))
		let results = []
		moveRange.flat().map(ip => {
			opponents.map(op => {
				let distance = this.getDistance(ip, op.iPos)
				if (distance >= min && distance <= max) {
					results.push([op, ip, distance])
				}
			})
		})
		return results
	}

	getMouseLocation (event) {
		let camera = this.Battle.Control.CameraNode
		return event.getLocation().add(camera)
	}

	isBlocked (ip, unitSide?) {
		if (!this.iTileList[ip]) return
		let {x, y} = this.iToP(ip)
		if (this.layerBarrier.getTileGIDAt(x, y)) return true
		if (unitSide === undefined && this.Battle.getUnitAt(ip)) return true
		if (unitSide === UNIT_SIDE.ENEMY && this.Battle.getPlayerAt(ip)) return true
		if (unitSide === UNIT_SIDE.PLAYER && this.Battle.getEnemyAt(ip)) return true
		// todo 其他物体检测
		return false
	}


	public pixelPosToIndex (posInPixel) {
		let mapNodeSize = this.TiledMap.node.getContentSize();
		let tileSize = this.tileSize
		let x = Math.floor(posInPixel.x / tileSize.width);
		let y = Math.floor((mapNodeSize.height - posInPixel.y) / tileSize.height);
		return this.pToI(x, y);
	}

	public indexToItemPixelPos (iPos) {
		let {layerFloor, tileSize} = this
		let position = this.iToP(iPos)
		let {x, y} = layerFloor.getPositionAt(position);
		let fixX = tileSize.width / 2
		let fixY = tileSize.height / 2
		return new cc.Vec3(x + fixX, y + fixY)
	}

	getDistance (p1, p2) {
		if (typeof p1 === 'number') p1 = this.iToP(p1)
		if (typeof p2 === 'number') p2 = this.iToP(p2)
		return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y)
	}

	stopControl () {
		this.stopControlFlag = true
		this.cursorNode.active = false
	}

	enableControl () {
		this.stopControlFlag = false
		this.cursorNode.active = true
	}

	pToI (p1, p2?) {
		let x, y
		if (typeof p1 === 'object') {
			if (p1[0] !== undefined) {
				x = p1[0]; y = p1[1]
			} else {
				x = p1.x; y = p1.y
			}
		} else {
			x = p1; y = p2
		}
		if (!Number.isInteger(x) || !Number.isInteger(y)) return null
		let {width, height} = this.mapSize
		if (x < 0 || x > width || y < 0 || y > height) return null
		return y * width + x
	}

	iToP (index: number) {
		if (!Number.isInteger(index)) return null
		let {width} = this.mapSize
		let y = Math.floor(index / width)
		let x = Math.floor(index % width)
		return {x, y}
	}

	toUp (index) { return index - this.mapSize.width }
	toLeft (index) { return index - 1 }
	toRight (index) { return index + 1 }
	toDown (index) { return index + this.mapSize.width }

	aroundList (index) {
		return [this.toUp(index), this.toRight(index), this.toLeft(index), this.toDown(index)]
	}

	isClose (i1, i2) {
		return this.aroundList(i1).includes(i2)
	}

}
