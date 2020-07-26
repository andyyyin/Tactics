const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {

	@property(cc.Prefab)
	playerPrefab = null

	@property(cc.Node)
	playerTestNode = null

	@property(cc.Node)
	MapNode = null;

	@property(cc.Component)
	mapIndicator = null

	TiledMap;
	layerFloor;
	layerBarrier;

	curTile;
	startTile;
	tileSize;

	onLoad() {
	}

	start() {
		// let posArr = [cc.v2(-249, 96), cc.v2(-150, 76), cc.v2(-60, 54), cc.v2(-248, -144), cc.v2(-89, -34)];
		// for (let i = 0; i < posArr.length; i++) {
		// 	let shieldNode = cc.instantiate(this.player);
		// 	// 可任意设置节点位置，这里仅作为示范
		// 	shieldNode.x = posArr[i].x;
		// 	shieldNode.y = posArr[i].y;
		// 	// 调用 TiledLayer 组件的 addUserNode 方法，可将节点添加到对应的地图层中，并与地图层产生相互遮挡关系。
		// 	this.playerLayer.addUserNode(shieldNode);
		// }
		this.TiledMap = this.MapNode.getComponent(cc.TiledMap)
		this.tileSize = this.TiledMap.getTileSize();

		let objectGroup = this.TiledMap.getObjectGroup('points');
		// SpawnPoint SuccessPoint
		if (!objectGroup) return;


		let startObj = objectGroup.getObject('SpawnPoint');
		let endObj = objectGroup.getObject('SuccessPoint');
		if (!startObj || !endObj) return;

		let startPos = cc.v2(startObj.x, startObj.y);
		let endPos = cc.v2(endObj.x, endObj.y);

		this.layerFloor = this.TiledMap.getLayer('floor');
		this.layerBarrier = this.TiledMap.getLayer('barrier');


		this.curTile = this.startTile = this.getTilePos(startPos);
		this.updatePlayerPos();
	}


	getTilePos (posInPixel) {
		let mapSize = this.MapNode.getContentSize();
		let tileSize = this.tileSize
		let x = Math.floor(posInPixel.x / tileSize.width);
		let y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
		return cc.v2(x, y);
	}

	updatePlayerPos () {
		let {x, y} = this.layerFloor.getPositionAt(this.curTile);
		let fixX = this.tileSize.width / 2
		let fixY = this.tileSize.height / 2
		this.playerTestNode.setPosition(x + fixX, y + fixY);
	}

	showXXX () {
		this.mapIndicator.showIndicator(this.curTile.x + 1, this.curTile.y)
		this.mapIndicator.showIndicator(this.curTile.x - 1, this.curTile.y)
		this.mapIndicator.showIndicator(this.curTile.x, this.curTile.y + 1)
		this.mapIndicator.showIndicator(this.curTile.x, this.curTile.y - 1)
		this.mapIndicator.showIndicator(this.curTile.x + 2, this.curTile.y)
		this.mapIndicator.showIndicator(this.curTile.x - 2, this.curTile.y)

		// let tile = this.layerFloor.getTiledTileAt(5, 5, true)
	}

	hideXXX () {
		this.mapIndicator.hideAll()
	}

}
