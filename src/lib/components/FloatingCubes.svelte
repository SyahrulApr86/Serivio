<script lang="ts">
	const cubes = [
		{ size: 68, half: 34, color: '#f75cc3', x: -72, y: 18, spinDur: 12, floatDur: 5.5, delay: 0 },
		{ size: 50, half: 25, color: '#2969ff', x: 56,  y: 52, spinDur: 9,  floatDur: 4.2, delay: -2.1 },
		{ size: 38, half: 19, color: '#f0c832', x: -14, y: 88, spinDur: 14, floatDur: 6.8, delay: -4.3 }
	];

	// face bg colors: front, back, left, right, top, bottom
	function faces(hex: string) {
		return [
			hex + 'cc', // front
			hex + '55', // back (hidden usually)
			hex + '88', // left
			hex + 'aa', // right
			hex + 'ee', // top — lightest
			hex + '44'  // bottom
		];
	}
</script>

<div class="cubes-stage" aria-hidden="true">
	{#each cubes as c, i}
		<div
			class="cube"
			style="
				width:{c.size}px;height:{c.size}px;
				left:calc(50% + {c.x}px);top:{c.y}px;
				animation:
					float-spin-{i} {c.spinDur}s linear {c.delay}s infinite,
					bob {c.floatDur}s ease-in-out {c.delay}s infinite
			"
		>
			{#each [ ['front',  `translateZ(${c.half}px)`],
			         ['back',   `rotateY(180deg) translateZ(${c.half}px)`],
			         ['left',   `rotateY(-90deg) translateZ(${c.half}px)`],
			         ['right',  `rotateY(90deg)  translateZ(${c.half}px)`],
			         ['top',    `rotateX(90deg)  translateZ(${c.half}px)`],
			         ['bottom', `rotateX(-90deg) translateZ(${c.half}px)`] ] as [name, tf], j}
				<div class="face" style="background:{faces(c.color)[j]};transform:{tf}"></div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.cubes-stage {
		position: relative;
		height: 200px;
		perspective: 900px;
		perspective-origin: 50% 40%;
	}

	.cube {
		position: absolute;
		transform-style: preserve-3d;
	}

	.face {
		position: absolute;
		inset: 0;
		border-radius: 7px;
		border: 1px solid rgba(255, 255, 255, 0.28);
	}

	/* per-cube spin keyframes so each spins independently */
	@keyframes float-spin-0 {
		from { transform: rotateX(22deg) rotateY(0deg);   }
		to   { transform: rotateX(22deg) rotateY(360deg); }
	}
	@keyframes float-spin-1 {
		from { transform: rotateX(18deg) rotateY(0deg);   }
		to   { transform: rotateX(18deg) rotateY(-360deg); }
	}
	@keyframes float-spin-2 {
		from { transform: rotateX(28deg) rotateY(0deg);   }
		to   { transform: rotateX(28deg) rotateY(360deg); }
	}

	@keyframes bob {
		0%, 100% { translate: 0 0px;   }
		50%       { translate: 0 -18px; }
	}
</style>
