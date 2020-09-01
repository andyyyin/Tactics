
/**
 * Math计算角度转换乘node angle属性值
 * */
export const rotationToAngle = (rotation) => {
	return -180 * rotation / Math.PI
};

/**
*
* */
export const getNodeAround = (node, p?) => {
	let position = p || node.getPosition()
	return {
		left: (position.x + (0 - node.anchorX) * node.width),
		right: (position.x + (1 - node.anchorX) * node.width),
		centerX: (position.x + (0.5 - node.anchorX) * node.width),
		top: (position.y + (1 - node.anchorY) * node.height),
		bottom: (position.y + (0 - node.anchorY) * node.height),
		centerY: (position.y + (0.5 - node.anchorY) * node.height),
	}
}

export const setNodeAround = (node, p) => {
	let {left, right, top, bottom, centerX, centerY} = p
	if (left) { node.x = left - (0 - node.anchorX) * node.width }
	else if (right) { node.x = right - (1 - node.anchorX) * node.width }
	if (top) { node.y = top - (1 - node.anchorY) * node.height }
	else if (bottom) { node.y = bottom - (0 - node.anchorY) * node.height }
	if (centerX) node.x = centerX - (0.5 - node.anchorX) * node.width
	if (centerY) node.y = centerY - (0.5 - node.anchorY) * node.width
}