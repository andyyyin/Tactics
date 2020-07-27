const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleMap extends cc.Component {

	@property(cc.Prefab)
	IndicatorTile = null

	@property(cc.Node)
	IndicatorNode = null

	@property(cc.Component)
	TiledMap = null

	startTile;
	tileSize;
	mapSize

	layerFloor
	layerBarrier

	iTileList = []

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


	}

	showIndicator (param) {
		if (Array.isArray(param)) {
			param.forEach(p => this.showIndicator(p))
		} else {
			let index = typeof param === 'object' ? this.pToI(param) : param
			let iTile = this.iTileList[index]
			if (!iTile) return
			iTile.active = true
		}
	}

	hideIndicator () {
		this.iTileList.map(iTile => iTile.active = false)
	}

	handleMoveRange (start, move, show) {
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
		if (show) {
			this.showIndicator(moveRange)
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

}
