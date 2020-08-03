/**
 * 计算两个角度值之间的夹角绝对值
 * */
export const computeAngleOff = (angle1, angle2) => {
	let a = Math.abs(angle1 - angle2);
	if (a < Math.PI) return a;
	return 2 * Math.PI - a;
};

/**
 * 根据距离（参数d）和方向（参数r）计算目标位置的相对坐标
 * */
export const getRelativePositionByDistance = (d, r) => {
	let targetX, targetY;
	targetX = d * Math.sin(r);
	targetY = d * Math.cos(r);
	return {targetX, targetY}
};

/**
 * 计算两点之间由start指向end的角度值（两个参数需要带有x,y属性）
 * */
export const getTwoPointAngle = (start, end) => {
	let directionX = end.x - start.x;
	let directionY = end.y - start.y;
	return Math.atan2(directionX, directionY)
};

/**
 * 角度计算结果处理，将结果封装到正PI到负PI的区间内
 * */
export const angleResult = (result) => {
	let {PI} = Math;
	if (result > PI) return ((PI + result) % (2*PI)) - PI;
	if (result < -PI) return ((result - PI) % (2*PI)) + PI;
	return result
};

/**
 * 由 start 角度 顺时针旋转到 end 角度，需转动的最小角度
 * */
export const angleLength = ({start, end}) => {
	if (isNaN(start) || isNaN(end)) return;
	if (end > start) return end - start;
	return (Math.PI - start) + (end + Math.PI)
};

/**
 * 根据给定的角度区间（集合）获得一个随机角度值（区间规定是由 start 到 end 的顺时针区间）
 * */
export const getRandomFromSections = (sections) => {
	let total = sections.reduce((total, {start, end}) => {
		return total + angleLength({start, end})
	}, 0);
	let random = Math.random() * total;
	let result;
	sections.forEach(({start, end}) => {
		if (!isNaN(result)) return;
		let length = angleLength({start, end});
		if (length > random) {
			result = angleResult(start + random);
		} else {
			random -= length;
		}
	});
	return result;
};
