
/**
 * Math计算角度转换乘node angle属性值
 * */
export const rotationToAngle = (rotation) => {
	return -180 * rotation / Math.PI
};