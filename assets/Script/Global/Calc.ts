
export const calcHitChance = (unit, target) => {
	let {accuracy} = unit
	let {dodge} = target
	return (accuracy - dodge + 50) / 100
}