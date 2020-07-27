const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {

	@property(cc.Prefab)
	playerPrefab = null

	@property(cc.Node)
	MapNode = null;

	@property(cc.Component)
	MapIndicator = null

	TiledMap;
	layerFloor;
	layerBarrier;

	startTile;
	tileSize;

	players = []

	protected onLoad() {
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

		this.startTile = this.getTilePos(startPos);
	}

	protected start() {
		let testPlayer = this.MapNode.getChildByName('TestPlayer').getComponent('Player')
		this.players.push(testPlayer)
	}


	getTilePos (posInPixel) {
		let mapSize = this.MapNode.getContentSize();
		let tileSize = this.tileSize
		let x = Math.floor(posInPixel.x / tileSize.width);
		let y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
		return cc.v2(x, y);
	}

	focus (player) {
		this.players.map(p => p.focus = p === player)
	}

}
