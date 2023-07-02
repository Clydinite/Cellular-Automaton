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
	const gridSize = 5
	var activated = false
	var intervalID: number

	// type NestedArray = (string | number | NestedArray)[]

	function transpile(x: number, y: number, program: any): string {

		if (!Array.isArray(program)) {
 
			if (program == 'random') {
				return `Math.floor(Math.random() * 100)`
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

			else if (/and|or|xor/.test(program[p].toString())) {
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

			else {
				r += program[p]
				p += 1
			}
		}

		return r
	}

	// console.log(transpile(program))

	class Cell {
		x: number
		y: number
		energy: number
		code: any[]
		transpiled: string
		color: string
		buffered: boolean

		constructor(x: number, y: number, code: any[]) {
			this.x = x
			this.y = y
			this.energy = 100
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

		randomCode() {
			
			const arg0 = ['0', '1', '2', '3', '25', '50', '75', '100', 'random', 'empty', 'a', 'b', 'c', 'd', 'energy', 'color']
			const arg1 = ['transfer', 'attack', 'move', 'grow']
			const arg2 = ['var', 'set', 'if', 'loop', 'lookup', '>', '>=', '==', '<=', '<', '!=', 'and', 'or', 'xor', '+', '-', '*', '/', '%']

			function buildExpression(arity: number): string{
				if (arity == 0) {
					return arg0[Math.floor(Math.random() * arg0.length)]
				} else if (arity == 1) {
					return '[' + arg1[Math.floor(Math.random() * arg1.length)] + buildExpression(Math.floor(Math.random() * 3)) + ']'
				} else {
					return '[' + arg2[Math.floor(Math.random() * arg2.length)] + buildExpression(Math.floor(Math.random() * 3)) + ']'
				}
			}
			
			return buildExpression(2)
		}

		update() {
			
			if (this.energy <= 0) {
				this.code = []
				this.transpiled = ''
				this.color = this.stringToColor('')
			} else if (this.transpiled == '') {}
			
			else {
				this.energy -= 1
				eval(this.transpiled)
				if (this.buffered == true) {
					this.buffered = false
				}
			}
			
		}

		grow(direction: number) {
			const d = directions[direction]

			if (this.x + d[0] >= 0 && this.x + d[0] < gridSize && this.y + d[1] >= 0 && this.y + d[1] < gridSize && this.buffered == false) {
				if (world[this.x + d[0]][this.y + d[1]].transpiled == '') {
					world[this.x + d[0]][this.y + d[1]].code = this.code
					world[this.x + d[0]][this.y + d[1]].color = this.color
					world[this.x + d[0]][this.y + d[1]].buffered = true
					world[this.x + d[0]][this.y + d[1]].transpiled = transpile(this.x + d[0], this.y + d[1], this.code)
				
					this.energy -= 10
				}	
			}

		}

		move(direction: number) {
			const d = directions[direction]

			if (this.x + d[0] >= 0 && this.x + d[0] < gridSize && this.y + d[1] >= 0 && this.y + d[1] < gridSize && this.buffered == false && direction != 4) {
				if (world[this.x + d[0]][this.y + d[1]].transpiled == '') {
					world[this.x + d[0]][this.y + d[1]].code = this.code
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

			if (this.x + d[0] >= 0 && this.x + d[0] < gridSize && this.y + d[1] >= 0 && this.y + d[1] < gridSize && this.buffered == false) {
				return world[this.x + d[0]][this.y + d[1]][attribute]
			}
			
		}

		transfer(direction: number) {
			const d = directions[direction]

			if (this.x + d[0] >= 0 && this.x + d[0] < gridSize && this.y + d[1] >= 0 && this.y + d[1] < gridSize && this.buffered == false) {
				const amount = Math.floor(this.energy * 0.1)
				this.energy -= amount
				world[this.x + d[0]][this.y + d[1]].energy += amount
			}
			
		}

		attack(direction: number) {
			const d = directions[direction]

			if (this.x + d[0] >= 0 && this.x + d[0] < gridSize && this.y + d[1] >= 0 && this.y + d[1] < gridSize && this.buffered == false) {
				const amount = Math.floor(this.energy * 0.1)
				this.energy -= 10
				world[this.x + d[0]][this.y + d[1]].energy -= amount
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


	const a = new Cell(0, 0, [
		'var', 'a', ['%', 'random', 4],
		'if', ['>', ['lookup', 4, 'energy'], 50], [
			'grow', 'a',
		],
		'var', 'b', ['%', 'random', 4],
		'if', ['and', ['>', ['lookup', 4, 'energy'], 50], ['==', ['lookup', 4, 'color'], ['lookup', 'b', 'color']]] , [
			'transfer', 'b'
		]
	])

	world[0][0] = a

	const b = new Cell(4, 4, [
		'if', ['>', ['lookup', 4, 'energy'], 50], [
			'if', ['>', ['lookup', 4, 'energy'], 75], [
				'var', 'a', 0,
				'var', 'b', 0,
				'var', 'c', 100,
				'loop', 4, [
					'if', ['and', ['!=', ['lookup', 4, 'color'], ['lookup', 'a', 'color']], ['<', ['lookup', 'a', 'energy'], 'c']], [
						'set', 'b', 'a',
						'set', 'c', ['lookup', 'a', 'energy'],
					],
					'set', 'a', ['+', 'a', '1']
				],
				'out', ['lookup', 4, 'color'],
				'out', ['lookup', 'b', 'color'],
				'if', ['and', ['!=', ['lookup', 4, 'color'], ['lookup', 'b', 'color']], ['!=', ['lookup', 'b', 'color'], 'empty']], [
					'out', 'b',
					'attack', 'b'
				]
			],
			'var', 'a', ['%', 'random', 4],
			'transfer', 'a',
			'grow', 'a'
		]
	])

	world[4][4] = b

	const c = new Cell(0, 4, [
		'var', 'a', ['%', 'random', 4],
		'if', ['and', ['==', ['lookup', 'a', 'color'], 'empty'], ['>', ['lookup', 4, 'energy'], 50]], [
			'grow', 'a',
			'transfer', 'a'
		],
		'var', 'a', 0,
		'var', 'b', 0,
		'var', 'c', 0,
		'loop', 4, [
			'if', ['>', ['lookup', 'a', 'energy'], 'c'], [
				'set', 'b', 'a',
				'set', 'c', ['lookup', 'a', 'energy']
			],
			'set', 'a', ['+', 'a', '1']
		],
		'if', ['>', 'c', ['lookup', 4, 'energy']], [
			'move', 'b'
		],
	])

	world[0][4] = c

	const d = new Cell(4, 0, [
		'if', ['>', ['lookup', 4, 'energy'], 50], [
			'grow', ['%', 'random', 4],
		],
		'var', 'a', 0,
		'var', 'b', 0,
		'var', 'c', 0,
		'loop', 4, [
			'if', ['>', ['lookup', 'a', 'energy'], 'c'], [
				'set', 'b', 'a',
				'set', 'c', ['lookup', 'a', 'energy']
			],
			'set', 'a', ['+', 'a', '1']
		],
		'if', ['>', 'c', ['lookup', 4, 'energy']], [
			'move', 'b'
		],
	])

	world[4][0] = d


	const t = new Cell(2, 2, [
		'gain', 'gain', 'gain',
		'transfer', ['%', 'random', 4]
	])

	world[2][2] = t



	function updateWorld() {
		
		for (let x = 0; x < gridSize; x++) {
			for (let y = 0; y < gridSize; y++) {
				world[x][y].update()
			}
		}
		world = world // trigger the update
		console.log(world)
	
	}


</script>

<div>
	{#each world as row}
		<div class='flex'>
			{#each row as cell}
				<div class="inline-block m-5 bg-slate-300 rounded-md h-32 w-32 overflow-y-auto scrollbar-hide" style="background-color:{cell.color}">
					<p class='bg-white/10'>({cell.x}, {cell.y}) {cell.energy}</p>
					<p class='bg-white/10 text-xs'>
						{cell.transpiled}
					</p>
				</div>
			{/each}
		</div>
	{/each}
</div>

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


