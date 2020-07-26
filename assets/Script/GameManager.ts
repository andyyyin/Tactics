const {ccclass, property} = cc._decorator;

@ccclass
export default class HomeManager extends cc.Component {

	onLoad() {
	}

	start() {
		cc.game.addPersistRootNode(this.node);
	}

	// update (dt) {}

	startGame() {
		cc.director.loadScene("BattleFieldTest");
	}

}
