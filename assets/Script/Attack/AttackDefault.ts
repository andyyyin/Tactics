import AttackSuper from "./AttackSuper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AttackDefault extends AttackSuper {

	getRange () {
		return super.getRange([1, 1])
	}

}
