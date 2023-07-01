<script lang="ts">
	const tokens = ['g', '1', '(', ')'];
	const len = 20;

	function randomCode() {
		let r = '';
		for (let i = 0; i < len / 2; i++) {
			r += tokens[Math.floor(Math.random() * tokens.length)];
		}
		return r;
	}

	class Cell {
		e: number; // energy
		c: string; // code

		constructor(parent: Cell | undefined = undefined) {
			if (parent) {
				this.e = 100;
				this.c = parent.c;
			} else {
				this.e = 100;
				this.c = randomCode();
			}
		}
	}

	function g(direction: number) {
		console.log('g is called with ' + direction);
	}

	var world: Cell[][] = [];
	for (let i = 0; i < 4; i++) {
		let temp = [];

		for (let j = 0; j < 4; j++) {
			temp.push(new Cell());
		}
		world.push(temp);
	}

	function generate() {
		for (let loop = 0; loop < 10; loop++) {
			for (let i = 0; i < world.length; i++) {
				for (let j = 0; j < world[0].length; j++) {
					const cell = world[i][j];
					try {
						eval(cell.c);
					} catch (e) {
						world[i][j] = new Cell();
					}
				}
			}
		}
	}
</script>

<div>
	{#each world as row}
		<div>
			{#each row as cell}
				<div class="inline-block m-5 bg-slate-300 rounded-md h-40 w-40">
					<p>{cell.e}</p>
					<p>
						{cell.c}
					</p>
				</div>
			{/each}
		</div>
	{/each}
</div>

<button
	on:click={() => {
		generate();
	}}>Regenerate</button
>

<style>
	p {
		font-family: 'Jetbrains Mono';
	}
</style>
