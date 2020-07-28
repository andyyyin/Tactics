import find = cc.find;

const {ccclass, property} = cc._decorator;

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

	startTile;
	tileSize;
	mapSize

	layerFloor
	layerBarrier

	iTileList = []

	cursorNode;
	mouseHolding

	showing

	onLoad() {
		// let posArr = [cc.v2(-249, 96), cc.v2(-150, 76), cc.v2(-60, 54), cc.v2(-248, -144), cc.v2(-89, -34)];
		// for (let i = 0; i < posArr.length; i++) {
		// 	let shieldNode = cc.instantiate(this.player);
		// 	// 可任意设置节点位置，这里仅作为示范
		// 	shieldNode.x = posArr[i].x;
		// 	shieldNode.y = posArr[i].y;
		// 	// 调用 TiledLayer 组件的 addUserNode 方法，可将节点添加到对应的地图层中，并与地图层产生相互遮挡关系。
		// 	this.playerLayer.addUserNode(shieldNode);
		// }
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

		let objectGroup = this.TiledMap.getObjectGroup('points');
		if (!objectGroup) return;

		let startObj = objectGroup.getObject('SpawnPoint');
		let endObj = objectGroup.getObject('SuccessPoint');
		if (!startObj || !endObj) return;
		let startPos = cc.v2(startObj.x, startObj.y);
		let endPos = cc.v2(endObj.x, endObj.y);

		this.startTile = this.getTilePos(startPos);
	}

	start() {
		for (let y = 0; y < this.mapSize.width; y++) {
			for (let x = 0; x < this.mapSize.height; x++) {
				let iTile = cc.instantiate(this.IndicatorTile)
				this.IndicatorNode.addChild(iTile)
				iTile.width = this.tileSize.width
				iTile.height = this.tileSize.height
				iTile.anchorX = this.IndicatorNode.anchorX
				iTile.anchorY = this.IndicatorNode.anchorY
				iTile.setPosition(this.layerFloor.getPositionAt(x, y))
				this.iTileList.push(iTile)
				iTile.active = false
			}
		}
		let cursorNode = cc.instantiate(this.CursorPrefab)
		cursorNode.scaleX = this.tileSize.width / cursorNode.width * 1.2
		cursorNode.scaleY = this.tileSize.height / cursorNode.height * 1.2
		cursorNode.setPosition(this.tileSize.width/2, this.tileSize.height/2)
		this.TiledMap.node.addChild(cursorNode, 100, 'Cursor')
		this.cursorNode = cursorNode
	}

	onMouseMove (event) {
		if (!this.cursorNode) return
		let {x, y} = event.getLocation()
		let {width, height} = this.tileSize
		this.cursorNode.x = Math.floor(x - (x % width)) + width / 2
		this.cursorNode.y = Math.floor(y - (y % height)) + height / 2

		this.onHover(this.getTilePos(event.getLocation()))
	}

	onMouseDown (event) {
		this.mouseHolding = this.getTilePos(event.getLocation())
	}
	onMouseUp (event) {
		if (!this.mouseHolding) return
		let holding = this.mouseHolding
		this.mouseHolding = false
		let tilePos =  this.getTilePos(event.getLocation())
		if (!cc.Vec2.strictEquals(tilePos, holding)) return
		this.onClick(tilePos)
	}

	onHover (tilePos) {
		if (this.Battle.focusPlayer) {
			let player = this.Battle.focusPlayer
			let range = player.moveRange
			if (range && range.flat().includes(this.pToI(tilePos))) {
				this.showRoute(tilePos, range)
			}
			return
		}
		let target = this.Battle.players.find(p => cc.Vec2.strictEquals(tilePos, p.tilePos))
		if (target) {
			this.showIndicator(target.moveRange)
		} else if (this.showing) {
			this.hideIndicator()
		}
	}

	onClick (tilePos) {
		let target = this.Battle.players.find(p => cc.Vec2.strictEquals(tilePos, p.tilePos))
		if (target) {
			this.Battle.focus(target)
			this.showIndicator(target.moveRange)
			return
		}

		if (this.Battle.focusPlayer) {
			let player = this.Battle.focusPlayer
			let range = player.moveRange
			if (range && range.flat().includes(this.pToI(tilePos))) {
				player.moveTo(tilePos)
			}

			this.Battle.focus(null)
			this.hideIndicator()
		}
	}



	showIndicator (param) {
		if (Array.isArray(param)) {
			param.forEach(p => this.showIndicator(p))
		} else {
			let index = typeof param === 'object' ? this.pToI(param) : param
			let iTile = this.iTileList[index]
			if (!iTile) return
			iTile.active = true
			this.showing = true
		}
	}

	hideIndicator () {
		this.iTileList.map(iTile => iTile.active = false)
		this.showing = false
	}

	showRoute (pos, range) {
		let preIndex;
		let endIndex = this.pToI(pos)
		let tiles = this.iTileList
		for (let i = range.length - 1; i > 0; i--) {
			if (preIndex === undefined) {
				range[i].map(pi => {
					if (pi === endIndex) {
						tiles[pi].opacity = 255
						preIndex = pi
					} else {
						tiles[pi].opacity = 100
					}
				})
			} else {
				let findFlag = false
				range[i].map(pi => {
					if (!findFlag && this.isClose(pi, preIndex)) {
						tiles[pi].opacity = 255
						preIndex = pi
						findFlag = true
					} else {
						tiles[pi].opacity = 100
					}
				})
			}

		}
	}

	handleMoveRange (start, move) {
		let startIndex = this.pToI(start)
		let step = 1
		let moveRange = [[startIndex]]
		while (step <= move) {
			let prevArray = moveRange[step - 1]
			let currentArray = []
			prevArray.map(pi => {
				let around = this.aroundList(pi)
				around.map(ai => {
					if (this.isBlocked(ai)) return
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

	isBlocked (index) {
		let {x, y} = this.iToP(index)
		if (this.layerBarrier.getTileGIDAt(x, y)) return true
		// todo 其他物体检测
		return false
	}


	getTilePos (posInPixel) {
		let mapNodeSize = this.TiledMap.node.getContentSize();
		let tileSize = this.tileSize
		let x = Math.floor(posInPixel.x / tileSize.width);
		let y = Math.floor((mapNodeSize.height - posInPixel.y) / tileSize.height);
		return cc.v2(x, y);
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
		let {width} = this.mapSize
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
