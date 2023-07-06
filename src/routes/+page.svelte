<script lang=ts>
	var program = [
		'var', 'a', 2,
		'if', ['<=', 'a', 3], [
			'out', 'a'
		],
		'if', ['>', 'random', 30], [
			'if', ['>', 'energy', 50], [
				'grow', 2
			]
		],
		'set', 'a', 10,
		'loop', 3, [
			'loop', 10, [
				'set', 'a', ['+', 'a', 1],
			],
			'out', 'a'
		],
		'out', 'a',
		'if', ['xor', ['>', 'a', 3], ['<', 'random', 90]], [
			'out', 'a'
		]
	]

	var loopIndex = 0
	const directions = [[0, -1], [-1, 0], [0, 1], [1, 0], [0, 0]]

	function sample (list: any[]) {
		return list[Math.floor((Math.random() * list.length))];
	}

	function getRandomNumber(min: number, max: number) {
  		return Math.floor(Math.random() * (max - min + 1)) + min;
	}


	const gridSize = 6
	var activated = false
	var intervalID: number
	var inspect: string[] = []

	// type NestedArray = (string | number | NestedArray)[]

	function transpile(x: number, y: number, program: any): string {

		if (!Array.isArray(program)) {
 
			if (program == 'random') {
				return `getRandomNumber(0, 4)`
			}

			else if (program == 'empty') {
				return `'rgb(0, 0, 0)'`
			}

			else {
				return program
			}

		}

		var p = 0
		var r = ''

		while (p < program.length) {

			// var a 10
			if (program[p] == 'var') {
				p += 1 // consume var
				const identifier = transpile(x, y, program[p])
				p += 1
				const value = transpile(x, y, program[p])
				p += 1
				r += `var ${identifier} = ${value}; `
			}

			else if (program[p] == 'set') {
				p += 1
				const identifier = transpile(x, y, program[p])
				p += 1
				const value = transpile(x, y, program[p])
				p += 1
				r += `${identifier} = ${value}; `
			}

			else if (program[p] == 'if') {
				p += 1
				const condition = transpile(x, y, program[p])
				p += 1
				const consequent = transpile(x, y, program[p])
				p += 1
				r += `if (${condition}) {${consequent}}; `
			}

			else if (program[p] == 'loop') {
				p += 1
				const times = transpile(x, y, program[p])
				p += 1
				const code = transpile(x, y, program[p])
				p += 1
				r += `for (let i_${loopIndex} = 0; i_${loopIndex} < ${times}; i_${loopIndex}++) {${code}}; `
				loopIndex++
			}

			else if (/[><=]=?/.test(program[p].toString())) {
				const operator = transpile(x, y, program[p])
				p += 1
				const left = transpile(x, y, program[p])
				p += 1
				const right = transpile(x, y, program[p])
				p += 1
				r += `${left} ${operator} ${right}`
			}

			else if (/[+\-*/%]/.test(program[p].toString())) {
				const operator = transpile(x, y, program[p])
				p += 1
				const left = transpile(x, y, program[p])
				p += 1
				const right = transpile(x, y, program[p])
				p += 1
				r += `${left} ${operator} ${right}`
			}

			else if (['and', 'or', 'xor'].includes(program[p])) {
				const operator = transpile(x, y, program[p])
				p += 1
				const left = transpile(x, y, program[p])
				p += 1
				const right = transpile(x, y, program[p])
				p += 1

				if (operator == 'and') {
					r += `${left} && ${right}`
				} else if (operator == 'or') {
					r += `${left} || ${right}`
				} else {
					r += `!(${left}) ^ !(${right})`
				}
			}

			// lookup 3 e
			else if (program[p] == 'lookup') {
				p += 1
				const direction = transpile(x, y, program[p])
				p += 1
				const attribute = transpile(x, y, program[p])
				p += 1

				if (attribute == 'energy') {
					r += `world[${x}][${y}].lookup(${direction}, 'energy')`
				} else if (attribute == 'color') {
					r += `world[${x}][${y}].lookup(${direction}, 'color')`
				}
			}

			// transfer 2
			else if (program[p] == 'transfer') {
				p += 1
				const direction = transpile(x, y, program[p])
				p += 1
				r += `world[${x}][${y}].transfer(${direction}); `
			}
			
			// attack 1
			else if (program[p] == 'attack') {
				p += 1
				const direction = transpile(x, y, program[p])
				p += 1
				r += `world[${x}][${y}].attack(${direction}); `
			}

			// move 0
			else if (program[p] == 'move') {
				p += 1
				const direction = transpile(x, y, program[p])
				p += 1
				r += `world[${x}][${y}].move(${direction}); `
			}

			else if (program[p] == 'grow') {
				p += 1
				const direction = transpile(x, y, program[p])
				p += 1
				r += `world[${x}][${y}].grow(${direction}); `
			}

			else if (program[p] == 'gain') {
				p += 1
				r += `world[${x}][${y}].gain(); `
			}

			else if (program[p] == 'out') {
				p += 1
				const value = transpile(x, y, program[p])
				p += 1
				r += `console.log(${value}); `
			}

			else if (program[p] == 'random') {
				p += 1
				r += `getRandomNumber(0, 4)`
			}

			else if (program[p] == 'empty') {
				p += 1
				r += `'rgb(0, 0, 0)'`
			}

			else {
				r += program[p]
				p += 1
			}
		}

		// console.log('transpiled')
		// console.log(r)
		return r
	}

	function randomCode(): string[] {

		const arg0 = ['0', '1', '2', '3', '25', '50', '75', '100', 'random', 'empty', 'a', 'b', 'c', 'energy', 'color']
		const arg1 = ['transfer', 'attack', 'move', 'grow']
		const arg2 = ['var', 'set', 'if', 'loop', 'lookup', '>', '>=', '==', '<=', '<', '!=', 'and', 'or', 'xor', '+', '-', '*', '/', '%']

		const comparisons = ['>', '>=', '==', '<=', '<', '!=']
		const operators = ['+', '-', '*', '/', '%']
		const action2 = ['var', 'set', 'if', 'loop', 'lookup']

		const maxDepth = 3
		let maxArity = 2

		function buildExpression(depth: number, arity: number, multiple: boolean = false): string {
			const r = []
			do {
				if (depth >= maxDepth) {
					maxArity = 1
				}

				if (arity == 0) {

					r.push(buildNumber())

				} else if (arity == 1) {

					r.push(`'${sample(arg1)}', ${sample([0, 1, 2, 3, 4, "'random'"])}`)

				} else {

					const operator = sample(action2)

					if (operator == 'if') {
						r.push("'if', [" + buildCondition() + "], [" + buildExpression(depth + 1, getRandomNumber(1, maxArity), true) + "]")
					} else if (operator == 'loop') {
						r.push("'loop', ['" + sample(arg0) + "'], [" + buildExpression(depth + 1, getRandomNumber(1, maxArity), true) + "]")
					} else if (operator == 'lookup') {
						r.push("'lookup', [" + sample([0, 1, 2, 3, 4, "'random'"]) + "], [" + buildExpression(depth + 1, getRandomNumber(1, maxArity), true) + "]")
					} else if (operator == 'var' || operator == 'set') {
						r.push(`'${operator}', '${sample(['a', 'b', 'c'])}', [${buildNumber()}]`)
					}
					
					else {
						r.push(`'${operator}', [${buildExpression(depth + 1, getRandomNumber(1, maxArity))}], [${buildExpression(depth + 1, getRandomNumber(1, maxArity))}]`)
					}

				}

			} while (multiple && (Math.random() * 100) > 75 && depth < maxDepth) 

			return r.join(', ')
		}

		function buildNumber(): string {

			const numbers = ['0', '1', '2', '3', '25', '50', '75', '100', 'random']

			if (Math.random() > 0.6) {
				const value = ['energy']
				return `'lookup', ${sample([0, 1, 2, 3, "'random'"])}, '${sample(value)}'`
			} else {

				if (Math.random() > 0.75) {
					return `'${sample(operators)}', ['${sample(numbers)}'], ['${sample(numbers)}']`
				}
				return `'${sample(numbers)}'`
			}

		}

		function buildCondition(): string {

			const operator = sample(comparisons)
			const left = buildNumber()
			const right = buildNumber()

			return `'${operator}', [${left}], [${right}]`
		}

		const code = `[${buildExpression(0, 2, true)}]`
		// console.log('code')
		// console.log(c)
		// console.log('evaluated')
		// console.log(eval(c))
		return eval(code)
	}

	class Cell {
		x: number
		y: number
		energy: number
		hitpoint: number
		code: any[]
		transpiled: string
		color: string
		buffered: boolean
		

		constructor(x: number, y: number, code: any[]) {
			this.x = x
			this.y = y
			this.energy = 100
			this.hitpoint = 50
			this.code = code
			this.transpiled = transpile(x, y, code)
			this.color = this.stringToColor(this.transpiled)
			this.buffered = false
		}

		stringToColor(str: string) {
			// Compute the hash code of the string
			var hash = 0;
			for (var i = 0; i < str.length; i++) {
				hash = str.charCodeAt(i) + ((hash << 5) - hash);
			}

			// Generate RGB values based on the hash code
			var r = (hash & 0xFF0000) >> 16;
			var g = (hash & 0x00FF00) >> 8;
			var b = hash & 0x0000FF;

			// Return the RGB color value
			return 'rgb(' + r + ', ' + g + ', ' + b + ')';
		}

		update() {
			if (this.transpiled == '' && Math.random() < (1 - 0.9999 ** this.energy)) {
				this.code = randomCode()
				this.transpiled = transpile(this.x, this.y, this.code)
				this.color = this.stringToColor(this.transpiled)
				this.buffered = false
				this.hitpoint = 25
			}
			
			if ((this.energy <= 0 || this.hitpoint <= 0) && this.transpiled != '') {
				this.hitpoint = 0
				this.code = []
				this.transpiled = ''
				this.color = this.stringToColor('')
			} 

			if (this.transpiled == '') {
				this.energy += 1
			}
			
			else {
				this.energy -= 1
				if (this.hitpoint < 50) {
					this.hitpoint += 1
				}
				
				try {
					eval(this.transpiled)
				} catch(e) {
					console.error(e)
					this.code = randomCode()
					this.transpiled = transpile(this.x, this.y, this.code)
					this.color = this.stringToColor(this.transpiled)
					this.buffered = false
				}
				if (this.buffered == true) {
					this.buffered = false
				}
			}
		}

		inside(direction: number) {
			const d = directions[direction]
			return this.x + d[0] >= 0 && this.x + d[0] < gridSize && this.y + d[1] >= 0 && this.y + d[1] < gridSize
		}	

		alive() {
			if (this.energy > 0 && this.hitpoint > 0) {
				return true
			} else {
				this.update()
			}
		}

		grow(direction: number) {
			const d = directions[direction]

			if (this.inside(direction) && this.buffered == false && this.alive()) {
				if (world[this.x + d[0]][this.y + d[1]].transpiled == '') {
					world[this.x + d[0]][this.y + d[1]].code = this.code
					world[this.x + d[0]][this.y + d[1]].color = this.color
					world[this.x + d[0]][this.y + d[1]].hitpoint = 50
					world[this.x + d[0]][this.y + d[1]].buffered = true
					world[this.x + d[0]][this.y + d[1]].transpiled = transpile(this.x + d[0], this.y + d[1], this.code)
				
					this.energy -= 10
				}	
			}

		}

		move(direction: number) {
			const d = directions[direction]

			// can't move to the original cell
			if (this.inside(direction) && this.buffered == false && direction != 4 && this.alive()) {
				if (world[this.x + d[0]][this.y + d[1]].transpiled == '') {
					world[this.x + d[0]][this.y + d[1]].code = this.code
					world[this.x + d[0]][this.y + d[1]].hitpoint = this.hitpoint
					world[this.x + d[0]][this.y + d[1]].color = this.color
					world[this.x + d[0]][this.y + d[1]].buffered = true
					world[this.x + d[0]][this.y + d[1]].transpiled = transpile(this.x + d[0], this.y + d[1], this.code)
					this.code = []
					this.transpiled = ''
					this.color = this.stringToColor('')
					
					this.energy -= 5
				}	
			}
		}

		lookup(direction: number, attribute: 'energy' | 'color') {
			const d = directions[direction]

			if (this.inside(direction) && this.buffered == false && this.alive()) {
				return world[this.x + d[0]][this.y + d[1]][attribute]
			}
		}

		transfer(direction: number) {
			const d = directions[direction]

			if (this.inside(direction) && this.buffered == false && direction != 4 && this.alive()) {
				const amount = Math.floor(this.energy * 0.1)
				this.energy -= amount
				world[this.x + d[0]][this.y + d[1]].energy += amount
			}
		}

		attack(direction: number) {
			const d = directions[direction]

			if (this.inside(direction) && this.buffered == false && this.alive() && world[this.x + d[0]][this.y + d[1]].alive()) {
				this.energy -= 5
				world[this.x + d[0]][this.y + d[1]].hitpoint -= 10
			}
		}

		gain() {
			this.energy += 10
		}

	}

	
	var world: Cell[][] = []

	for (let x = 0; x < gridSize; x++) {
		let temp = []
		for (let y = 0; y < gridSize; y++) {
			temp.push(new Cell(x, y, []))
		}
		world.push(temp)
	}

	// const a = new Cell(0, 0, [
	// 	'var', 'a', ['%', 'random', 4],
	// 	'if', ['>', ['lookup', 4, 'energy'], 50], [
	// 		'grow', 'a',
	// 	],
	// 	'var', 'b', ['%', 'random', 4],
	// 	'if', ['and', ['>', ['lookup', 4, 'energy'], 50], ['==', ['lookup', 4, 'color'], ['lookup', 'b', 'color']]] , [
	// 		'transfer', 'b'
	// 	]
	// ])
	// world[0][0] = a

	// const b = new Cell(5, 5, [
	// 	'if', ['>', ['lookup', 4, 'energy'], 50], [
	// 		'if', ['>', ['lookup', 4, 'energy'], 75], [
	// 			'var', 'a', 0,
	// 			'var', 'b', 0,
	// 			'var', 'c', 100,
	// 			'loop', 4, [
	// 				'if', ['and', ['!=', ['lookup', 4, 'color'], ['lookup', 'a', 'color']], ['<', ['lookup', 'a', 'energy'], 'c']], [
	// 					'set', 'b', 'a',
	// 					'set', 'c', ['lookup', 'a', 'energy'],
	// 				],
	// 				'set', 'a', ['+', 'a', '1']
	// 			],
	// 			'if', ['and', ['!=', ['lookup', 4, 'color'], ['lookup', 'b', 'color']], ['!=', ['lookup', 'b', 'color'], 'empty']], [
	// 				'attack', 'b'
	// 			],
	// 		],
	// 		'var', 'a', ['%', 'random', 4],
	// 		'if', ['==', ['lookup', 'a', 'color'], 'empty'], [
	// 			'transfer', 'a',
	// 			'grow', 'a'
	// 		],
	// 	]
	// ])

	// world[5][5] = b

	// const c = new Cell(0, 4, [
	// 	'var', 'a', ['%', 'random', 4],
	// 	'if', ['and', ['==', ['lookup', 'a', 'color'], 'empty'], ['>', ['lookup', 4, 'energy'], 50]], [
	// 		'grow', 'a',
	// 		'transfer', 'a'
	// 	],
	// 	'var', 'a', 0,
	// 	'var', 'b', 0,
	// 	'var', 'c', 0,
	// 	'loop', 4, [
	// 		'if', ['>', ['lookup', 'a', 'energy'], 'c'], [
	// 			'set', 'b', 'a',
	// 			'set', 'c', ['lookup', 'a', 'energy']
	// 		],
	// 		'set', 'a', ['+', 'a', '1']
	// 	],
	// 	'if', ['>', 'c', ['lookup', 4, 'energy']], [
	// 		'move', 'b'
	// 	],
	// ])

	// world[0][4] = c

	// const d = new Cell(0, 0, [
	// 	'if', ['>', ['lookup', 4, 'energy'], 50], [
	// 		'grow', ['%', 'random', 4],
	// 	],
	// 	'var', 'a', 0,
	// 	'var', 'b', 0,
	// 	'var', 'c', 0,
	// 	'loop', 4, [
	// 		'if', ['>', ['lookup', 'a', 'energy'], 'c'], [
	// 			'set', 'b', 'a',
	// 			'set', 'c', ['lookup', 'a', 'energy']
	// 		],
	// 		'set', 'a', ['+', 'a', '1']
	// 	],
	// 	'if', ['>', 'c', ['lookup', 4, 'energy']], [
	// 		'move', 'b'
	// 	],
	// ])

	// world[0][0] = d


	// const t = new Cell(2, 2, [
	// 	'gain', 'gain', 'gain',
	// 	'transfer', ['%', 'random', 4]
	// ])

	// world[2][2] = t

	var iteration = 0
	function updateWorld() {
		
		for (let x = 0; x < gridSize; x++) {
			for (let y = 0; y < gridSize; y++) {
				world[x][y].update()
			}
		}
		world = world // trigger the update
		iteration++
	}


</script>

<div class='w-full mx-auto p-10'>
	{#each world as row}
		<div class='flex justify-center'>
			{#each row as cell}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="inline-block m-0 h-32 w-32 overflow-y-auto scrollbar-hide" style="background-color:{cell.color}" 
					on:click={() => {
						inspect = cell.code
						console.log(cell.code, cell.transpiled)
					}}
				>
					<div class='bg-white/75 text-center'>
						<p>E {cell.energy} H {cell.hitpoint}</p>
					</div>
					<p class='bg-white/10 text-xs'>
						{cell.transpiled}
					</p>
				</div>
			{/each}
		</div>
	{/each}

	<div class='flex justify-center'>
		<button class='m-10 bg-blue-600 rounded-lg h-10 w-20'
			on:click={() => updateWorld()}><p>Update</p></button
		>
	
		<button class='m-10 bg-blue-600 rounded-lg h-10 w-20'
			on:click={() => {
				
				if (!activated) {
					intervalID = setInterval(() => {
						updateWorld()
					}, 100)
				} else {
					clearInterval(intervalID)
				}
				
				activated = !activated
	
		}}><p>{activated ? 'Stop' : 'Auto'}</p></button
		>	
	</div>
	<p>{iteration}</p>
	<p>{inspect}</p>
</div>


<style>
	p {
		font-family: 'Jetbrains Mono';
	}

	/* For Webkit-based browsers (Chrome, Safari and Opera) */
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}

	/* For IE, Edge and Firefox */
	.scrollbar-hide {
		-ms-overflow-style: none;  /* IE and Edge */
		scrollbar-width: none;  /* Firefox */
	}

</style>


