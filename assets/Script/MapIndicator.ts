const {ccclass, property} = cc._decorator;

@ccclass
export default class HomeManager extends cc.Component {

	@property(cc.Prefab)
	TilePrefab = null

	TiledMap
	tileSize
	mapSize

	layerFloor

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
	}

	start() {
		for (let x = 0; x < this.mapSize.width; x++) {
			for (let y = 0; y < this.mapSize.height; y++) {
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

	showIndicator (x, y) {
		let {height} = this.mapSize
		let iTile = this.iTileList[x * height + y]
		if (!iTile) return
		iTile.active = true
	}

	hideAll () {
		this.iTileList.map(iTile => iTile.active = false)
	}

}
