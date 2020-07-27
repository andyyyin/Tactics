const {ccclass, property} = cc._decorator;

@ccclass
export default class HomeManager extends cc.Component {

	@property(cc.Prefab)
	TilePrefab = null

	TiledMap
	tileSize
	mapSize

	layerFloor
	layerBarrier

	iTileList = []

	onLoad() {
		this.TiledMap = this.node.parent.getComponent(cc.TiledMap)
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
		for (let y = 0; y < this.mapSize.width; y++) {
			for (let x = 0; x < this.mapSize.height; x++) {
				let iTile = cc.instantiate(this.TilePrefab)
				this.node.addChild(iTile)
				iTile.width = this.tileSize.width
				iTile.height = this.tileSize.height
				iTile.anchorX = this.node.anchorX
				iTile.anchorY = this.node.anchorY
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
			let prevArray = moveRange[moveRange.length - 1]
			let currentArray = []
			prevArray.map(pi => {
				this.aroundList(pi).map(ai => {
					if (this.isBlocked(ai)) return
					if (prevArray.includes(ai)) return
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
