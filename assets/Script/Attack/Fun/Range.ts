
const r: any = {}

r.default = (unit, [min, max]) => {
	min = min || 1
	max = max || min
	if (min > max) {
		[min, max] = [max, min]
	}
	let Map = unit.Map
	let start = Map.iToP(unit.curPos)
	let result = []
	for (let step = min; step <= max; step++) {
		for (let y = step; y >= -step; y--) {
			let x = step - Math.abs(y)
			let ip1 = Map.pToI(start.x + x, start.y + y)
			if (ip1 && !Map.isOutOfMap(ip1) && !Map.isBlocked(ip1)) result.push(ip1)
			if (x > 0) {
				let ip2 = Map.pToI(start.x - x, start.y + y)
				if (ip2 && !Map.isOutOfMap(ip2) && !Map.isBlocked(ip2)) result.push(ip2)
			}
		}
	}
	return result
}

r['长枪'] = (unit) => {
	let Map = unit.Map
	let Battle = unit.Battle
	let result = r.default(unit, [2, 2])
	result = result.filter(ip => {
		if (Map.isBlocked(ip)) return false
		if (Map.isSameCol(unit.curPos, ip) || Map.isSameRow(unit.curPos, ip)) {
			let between = Map.getPosBetween(unit.curPos, ip)
			if (between && (Map.isBlocked(between[0]) || Battle.getUnitAt(between[0]))) {
				return false
			}
		}
		return true
	})
	return result
}

r['斜角'] = (unit) => {
	let Map = unit.Map
	let {x, y} = Map.iToP(unit.curPos)
	return [
		Map.pToI(x + 1, y + 1),
		Map.pToI(x + 1, y - 1),
		Map.pToI(x - 1, y - 1),
		Map.pToI(x - 1, y + 1),
	].filter(ip => !Map.isBlocked(ip))
}

r['弓方向'] = (unit) => {
	let Battle = unit.Battle
	let result = r.default(unit, [1])
	return result.filter(rp => !Battle.getUnitAt(rp))
}

/* ---------------------- end ----------------------*/

// let rKeys = Object.keys(r)
// let rEnum: any = {}
// rKeys.map((k, i) => {
// 	rEnum[k] = i
// })
//
// export const getRangeFun = (n) => {
// 	return r[rKeys[n]]
// }
//
// export const RangeFun = cc.Enum(rEnum)

export default r