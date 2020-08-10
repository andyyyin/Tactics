import AnimSuper from "./AnimSuper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimDefault extends AnimSuper {

	getRange () {
		return super.getRange([1, 1])
	}

}
