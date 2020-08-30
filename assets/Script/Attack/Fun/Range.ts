
const r: any = {}

r.default = (unit, [min, max]) => {
	min = min || 1
	max = max || min
	if (min > max) {
		[min, max] = [max, min]
	}
	let Map = unit.Map
	let start = Map.iToP(unit.tempPos || unit.iPos)
	let result = []
	for (let step = min; step <= max; step++) {
		for (let y = step; y >= -step; y--) {
			let x = step - Math.abs(y)
			let ip1 = Map.pToI(start.x + x, start.y + y)
			if (ip1 && Map.iTileList[ip1]) result.push(ip1)
			if (x > 0) {
				let ip2 = Map.pToI(start.x - x, start.y + y)
				if (ip2 && Map.iTileList[ip2]) result.push(ip2)
			}
		}
	}
	return result
}

r['斜角'] = (unit) => {
	let Map = unit.Map
	let {x, y} = Map.iToP(unit.tempPos || unit.iPos)
	return [
		Map.pToI(x + 1, y + 1),
		Map.pToI(x + 1, y - 1),
		Map.pToI(x - 1, y - 1),
		Map.pToI(x - 1, y + 1),
	].filter(ip => !Map.isBlocked(ip))
}

/* ---------------------- end ----------------------*/

let rKeys = Object.keys(r)
let rEnum: any = {}
rKeys.map((k, i) => {
	rEnum[k] = i
})

export const getRangeFun = (n) => {
	return r[rKeys[n]]
}

export const RangeFun = cc.Enum(rEnum)